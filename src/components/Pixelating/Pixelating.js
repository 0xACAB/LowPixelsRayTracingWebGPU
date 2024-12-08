export default class Pixelating {
	async initialize(canvas, resolution, shader) {
		return await new Promise(async (resolve, reject) => {
			const adapter = await navigator.gpu?.requestAdapter();
			const device = await adapter?.requestDevice();

			if (!device) {
				reject('need a browser that supports WebGPU');
			}
			const context = this.context = canvas.getContext('webgpu');
			this.changeResolution(resolution);

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
				label: 'our hardcoded red triangle pipeline',
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
			const { objectInfos, bindGroup } = setUniforms(shader.uniforms);
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

			const render = (time, callback) => {
				renderPassDescriptor.colorAttachments[0].view =
					context.getCurrentTexture().createView();
				const encoder = device.createCommandEncoder({ label: 'our encoder' });
				const pass = encoder.beginRenderPass(renderPassDescriptor);
				pass.setPipeline(pipeline);
				objectInfos
					.forEach(
						({ uniformBuffer, uniformValues }, index) => {
							if (index === 0) {
								uniformValues.set([time], 0);
								// copy the values from JavaScript to the GPU
								device.queue.writeBuffer(uniformBuffer, 0, uniformValues.buffer,
									uniformValues.byteOffset,
									uniformValues.byteLength);
							} else {
								device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
							}

							callback(device, { uniformBuffer, uniformValues }, index);
							pass.setBindGroup(0, bindGroup);
							pass.draw(6);  // call our vertex shader 3 times
						});
				pass.end();
				const commandBuffer = encoder.finish();
				device.queue.submit([commandBuffer]);
			};

			resolve(render);
		});
	}

	changeResolution(resolution) {
		if (this.context) {
			//TODO
			/*context.viewport(0, 0, canvas.width, canvas.height);
			const iScaleWidth = context.getUniformLocation(program, 'iScaleWidth');
			const iScaleHeight = context.getUniformLocation(program, 'iScaleHeight');
			context.uniform1f(iScaleWidth, resolution.width);
			context.uniform1f(iScaleHeight, resolution.height);
			context.drawArrays(context.TRIANGLES, 0, 6);*/
			Object.assign(this.context.canvas, resolution);
		}
	}

}