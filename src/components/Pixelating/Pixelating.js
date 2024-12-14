export default class Pixelating {
	initialize(canvas, resolution, shader) {
		return new Promise(async (resolve, reject) => {
			const adapter = await navigator.gpu?.requestAdapter();
			const device = this.device = await adapter?.requestDevice();

			if (!device) {
				reject('need a browser that supports WebGPU');
			}

			const context = this.context = canvas.getContext('webgpu');

			const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
			context.configure({
				device: device,
				format: presentationFormat,
			});

			const module = device.createShaderModule({
				label: 'our hardcoded red triangle shaders',
				code: shader.code,
			});

			const pipeline = device.createRenderPipeline({
				label: 'our hardcoded pipeline',
				layout: 'auto',
				vertex: {
					module,
				},
				fragment: {
					module,
					targets: [{ format: presentationFormat }],
				},
			});
			const recursiveGetUniformBufferSize = (subUniforms) => {
				return Object.keys(subUniforms).reduce((prevSize, uniformName) => {
					const uniform = subUniforms[uniformName];
					if (uniform.type !== 'struct') {
						return prevSize + uniform.bufferSize;
					} else {
						return prevSize + recursiveGetUniformBufferSize(subUniforms[uniformName].data);
					}
				}, 0);
			};

			const recursiveGetUniformValues = (subUniforms) => {
				return Object.keys(subUniforms).reduce((prevValues, uniformName) => {
					const uniform = subUniforms[uniformName];
					if (uniform.type !== 'struct') {
						prevValues.push(...uniform.data);
						return prevValues;
					} else {
						return recursiveGetUniformValues(subUniforms[uniformName].data);
					}
				}, []);
			};

			const setUniforms = (subUniforms) => {
				const objectInfos = Object.keys(subUniforms).map((uniformName) => {
					const uniform = subUniforms[uniformName];
					const uniformBufferSize = recursiveGetUniformBufferSize([uniform]);
					const uniformBuffer = device.createBuffer({
						size: uniformBufferSize,
						usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
					});
					const uniformValues = new Float32Array(uniformBufferSize / 4);
					uniformValues.set(recursiveGetUniformValues([uniform]), 0);
					return {
						uniformBuffer,
						uniformValues,
					};
				});

				const bindGroup = device.createBindGroup({
					label: `bind group for obj: ${'all'}`,
					layout: pipeline.getBindGroupLayout(0),
					entries: objectInfos.map(({ uniformBuffer }, index) => {
						return { binding: index, resource: { buffer: uniformBuffer } };
					}),
				});

				return { objectInfos, bindGroup };
			};
			this.uniforms = {
				...shader.uniforms,
				iScaleWidth: {
					bufferSize: 4,
					data: [resolution.width],
				},
				iScaleHeight: {
					bufferSize: 4,
					data: [resolution.height],
				},
			};
			const { objectInfos, bindGroup } = setUniforms(this.uniforms);
			this.objectInfos = objectInfos;

			const renderPassDescriptor = {
				label: 'our basic canvas renderPass',
				colorAttachments: [
					{
						// view: <- to be filled out when we render
						clearValue: [0.3, 0.3, 0.3, 1],
						loadOp: 'clear',
						storeOp: 'store',
					},
				],
			};

			const render = function(time, callback) {
				renderPassDescriptor.colorAttachments[0].view =
					context.getCurrentTexture().createView();
				const encoder = device.createCommandEncoder({ label: 'our encoder' });
				const pass = encoder.beginRenderPass(renderPassDescriptor);
				pass.setPipeline(pipeline);
				objectInfos
					.forEach(
						({ uniformBuffer, uniformValues }, index) => {
							device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
							callback(device, { uniformBuffer, uniformValues }, index);
							pass.setBindGroup(0, bindGroup);
							pass.draw(6);  // call our vertex shader 3 times
						},
					);
				pass.end();
				const commandBuffer = encoder.finish();
				device.queue.submit([commandBuffer]);
			};

			this.changeResolution(resolution);
			resolve(render);
		});
	}

	changeResolution(resolution) {
		const { context, device, objectInfos } = this;
		if (context && device && objectInfos) {
			this.resolution = resolution;
			[objectInfos[4], objectInfos[5]].forEach(({ uniformBuffer, uniformValues }, index) => {
				uniformValues.set([(index === 0) ? resolution.width : resolution.height], 0);
				device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
			});
			Object.assign(this.context.canvas, resolution);
		}
	}
}