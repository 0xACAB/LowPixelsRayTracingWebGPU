export default class Pixelating {
	initialize(canvas, resolution, shader) {
		return new Promise(async (resolve, reject) => {
			const adapter = await navigator.gpu?.requestAdapter();
			const device = await adapter?.requestDevice();

			if (!device) {
				reject('need a browser that supports WebGPU');
			}

			const context = canvas.getContext('webgpu');

			const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
			context.configure({
				device: device,
				format: presentationFormat,
			});

			const module = device.createShaderModule({
				label: 'shaders',
				code: shader.code,
			});

			const pipeline = device.createRenderPipeline({
				label: 'pipeline',
				layout: 'auto',
				vertex: {
					module,
				},
				fragment: {
					module,
					targets: [{ format: presentationFormat }],
				},
			});
			const recursiveGetUniformBufferSize = (uniform) => {
				if (uniform.hasOwnProperty('bufferSize')) {
					return uniform.bufferSize;
				} else {
					return Object.keys(uniform).reduce((prevValues, subUniformName) => {
						return prevValues + recursiveGetUniformBufferSize(uniform[subUniformName]);
					}, 0);
				}
			};

			const recursiveGetUniformValues = (uniform) => {
				if (uniform.hasOwnProperty('bufferSize')) {
					return uniform.data;
				} else {
					return Object.keys(uniform).reduce((prevValues, subUniformName) => {
						prevValues.push(...recursiveGetUniformValues(uniform[subUniformName]));
						return prevValues;
					}, []);
				}
			};

			const setUniforms = (subUniforms) => {
				const objectInfos = Object.keys(subUniforms).map((uniformName) => {
					const uniform = subUniforms[uniformName];
					const uniformBufferSize = recursiveGetUniformBufferSize(uniform);
					const uniformBuffer = device.createBuffer({
						label: `${uniformName}`,
						size: uniformBufferSize,
						usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
					});
					const uniformValues = new Float32Array(uniformBufferSize / 4);
					uniformValues.set(recursiveGetUniformValues(uniform), 0);
					return {
						uniformBuffer,
						uniformValues,
					};
				});

				const bindGroup = device.createBindGroup({
					label: `bind group`,
					layout: pipeline.getBindGroupLayout(0),
					entries: objectInfos.map(({ uniformBuffer }, index) => {
						return { binding: index, resource: { buffer: uniformBuffer } };
					}),
				});

				return { objectInfos, bindGroup };
			};
			const { objectInfos, bindGroup } = setUniforms({
				...shader.uniforms,
				iScaleWidth: {
					bufferSize: 4,
					data: [resolution.width],
				},
				iScaleHeight: {
					bufferSize: 4,
					data: [resolution.height],
				},
			});

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

			const changeResolution = (resolution) => {
				[
					objectInfos[objectInfos.length - 2],
					objectInfos[objectInfos.length - 1],
				].forEach(({ uniformBuffer, uniformValues }, index) => {
					uniformValues.set([(index === 0) ? resolution.width : resolution.height], 0);
					device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
				});
				Object.assign(context.canvas, resolution);
				this.resolution = resolution;
			};
			changeResolution(resolution);

			resolve({
				render,
				changeResolution,
			});
		});
	}
}