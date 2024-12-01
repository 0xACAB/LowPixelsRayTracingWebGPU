export default class Pixelating {
	constructor(
		canvas,
		shader,
		resolutions,
		defaultResolution = 0,
	) {
		this.canvas = canvas;
		this.shader = shader;
		this.resolutions = resolutions;
		this.currentResolution = defaultResolution;

	}

	async initialize() {
		return new Promise(async (resolve, reject) => {
			const adapter = await navigator.gpu?.requestAdapter();
			const device = await adapter?.requestDevice();

			if (!device) {
				reject('need a browser that supports WebGPU');
			}
			const context = this.context = this.canvas.getContext('webgpu');
			const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
			context.configure({
				device,
				format: presentationFormat,
			});

			const module = device.createShaderModule({
				label: 'our hardcoded red triangle shaders',
				code: this.shader.code,
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
			const uniformBufferSize = 4;
			const uniformBuffer = device.createBuffer({
				size: uniformBufferSize,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
			const bindGroup = device.createBindGroup({
				label: 'triangle bind group',
				layout: pipeline.getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: { buffer: uniformBuffer } },
				],
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
			const uniformData = new Float32Array([0]);

			function render(time) {
				// Get the current texture from the canvas context and
				// set it as the texture to render to.
				renderPassDescriptor.colorAttachments[0].view =
					context.getCurrentTexture().createView();
				// copy the values from JavaScript to the GPU
				uniformData[0] = time;
				device.queue.writeBuffer(
					uniformBuffer,
					0,
					uniformData.buffer,
					uniformData.byteOffset,
					uniformData.byteLength,
				);

				const encoder = device.createCommandEncoder({ label: 'our encoder' });
				const pass = encoder.beginRenderPass(renderPassDescriptor);
				pass.setPipeline(pipeline);
				pass.setBindGroup(0, bindGroup);
				pass.draw(6);  // call our vertex shader 3 times
				pass.end();

				const commandBuffer = encoder.finish();
				device.queue.submit([commandBuffer]);
			}

			Object.assign(this.canvas, this.resolutions[this.currentResolution]);
			resolve(render);
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
		const program = this.program;
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
		}
	}

	onChange(event) {
		const program = this.program;
		if (program) {
			const canvas = this.canvas;
			const context = this.context;
			const valueAsNumber = event.target.valueAsNumber;
			const resolution = this.resolutions[valueAsNumber];
			canvas.width = resolution.width;
			canvas.height = resolution.height;

			context.viewport(0, 0, canvas.width, canvas.height);
			const iScaleWidth = context.getUniformLocation(program, 'iScaleWidth');
			const iScaleHeight = context.getUniformLocation(program, 'iScaleHeight');
			context.uniform1f(iScaleWidth, resolution.width);
			context.uniform1f(iScaleHeight, resolution.height);
			context.drawArrays(context.TRIANGLES, 0, 6);
		} else {
			//TODO
			const valueAsNumber = event.target.valueAsNumber;
			Object.assign(this.canvas, this.resolutions[valueAsNumber]);

		}
	}

	unmount() {
		this.context.unconfigure();
	}
}