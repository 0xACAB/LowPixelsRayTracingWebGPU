export default class Pixelating {
	async initialize(context, resolution, shader) {
		return await new Promise(async (resolve, reject) => {
			const adapter = await navigator.gpu?.requestAdapter();
			this.device = await adapter?.requestDevice();

			if (!this.device) {
				reject('need a browser that supports WebGPU');
			}
			const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
			context.configure({
				device:this.device,
				format: presentationFormat,
			});

			const module = this.device.createShaderModule({
				label: 'our hardcoded red triangle shaders',
				code: shader.code,
			});

			this.pipeline = this.device.createRenderPipeline({
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
			const uniformBufferSize = 4;
			this.uniformBuffer = this.device.createBuffer({
				size: uniformBufferSize,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
			this.bindGroup = this.device.createBindGroup({
				label: 'triangle bind group',
				layout: this.pipeline.getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: { buffer: this.uniformBuffer } },
				],
			});
			this.renderPassDescriptor = {
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
			this.uniformData = new Float32Array([0]);

			this.context = context;
			this.changeResolution(resolution);
			resolve();
		});
	}

	recursiveSetUniforms = (prefix, subUniforms) => {
		const program = this.program;
		if (program) {
			const context = this.context;
			Object.keys(subUniforms).forEach((uniformName) => {
				const uniform = subUniforms[uniformName];
				if (uniform.type !== 'struct') {
					const uniform = subUniforms[uniformName];
					const uniformLocation =
						context.getUniformLocation(program, prefix ? prefix + uniformName : uniformName);
					const setUniformFunction = context[uniform.type].bind(context);
					setUniformFunction(uniformLocation, uniform.data);
				} else {

					const newPrefix = prefix ? prefix + uniformName + '.' : uniformName + '.';
					this.recursiveSetUniforms(newPrefix, subUniforms[uniformName].data);
				}
			});
		}
	};

	render(time, callback) {
		// Get the current texture from the canvas context and
		// set it as the texture to render to.
		this.renderPassDescriptor.colorAttachments[0].view =
			this.context.getCurrentTexture().createView();
		// copy the values from JavaScript to the GPU
		this.uniformData[0] = time;
		this.device.queue.writeBuffer(
			this.uniformBuffer,
			0,
			this.uniformData.buffer,
			this.uniformData.byteOffset,
			this.uniformData.byteLength,
		);

		const encoder = this.device.createCommandEncoder({ label: 'our encoder' });
		const pass = encoder.beginRenderPass(this.renderPassDescriptor);
		pass.setPipeline(this.pipeline);
		pass.setBindGroup(0, this.bindGroup);
		pass.draw(6);  // call our vertex shader 3 times
		pass.end();
		const commandBuffer = encoder.finish();
		this.device.queue.submit([commandBuffer]);
		/*const program = this.program;
		if (program) {
			const context = this.context;
			const uniforms = this.shaders.uniforms;
			context.drawArrays(context.TRIANGLES, 0, 6);
			const iTimeLocation = context.getUniformLocation(program, 'iTime');
			context.uniform1f(iTimeLocation, time);
			if (uniforms.iMouse) {
				const iMouse = context.getUniformLocation(program, 'iMouse');
				context.uniform2fv(iMouse, uniforms.iMouse.data);
			}
			if (callback) {
				callback(context, program);
			}
		}*/
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

	unmount() {
		if (this.context) {
			this.context.unconfigure();
		}
	}
}