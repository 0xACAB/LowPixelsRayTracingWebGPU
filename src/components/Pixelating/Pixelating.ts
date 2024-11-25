import React from 'react';
import { resolution } from '@/components/interfaces';

export default class Pixelating {
	canvas: HTMLCanvasElement;
	private context: any;
	private readonly shaders: { vert: string; frag: string; uniforms: any };
	private readonly program: WebGLProgram | null | undefined;
	private readonly resolutions: Array<resolution>;
	private currentResolution: number;

	constructor(
		canvas: HTMLCanvasElement,
		shaders: { vert: string, frag: string, uniforms: any },
		resolutions: Array<resolution>,
		defaultResolution = 0,
	) {
		this.canvas = canvas;
		this.shaders = shaders;
		this.resolutions = resolutions;
		this.currentResolution = defaultResolution;

	}

	async initialize() {
		const adapter = await navigator.gpu?.requestAdapter();
		const device = await adapter?.requestDevice();

		if (!device) {
			throw 'need a browser that supports WebGPU';
		}
		const context = this.context = this.canvas.getContext('webgpu')!;
		const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
		context.configure({
			device,
			format: presentationFormat,
		});

		const module = device.createShaderModule({
			label: 'our hardcoded red triangle shaders',
			code: `
				  @vertex fn vs(
				    @builtin(vertex_index) vertexIndex : u32
				  ) -> @builtin(position) vec4f {
				    let pos = array(
				      vec2f( 0.0,  0.5),  // top center
				      vec2f(-0.5, -0.5),  // bottom left
				      vec2f( 0.5, -0.5)   // bottom right
				    );
				
				    return vec4f(pos[vertexIndex], 0.0, 1.0);
				  }
				
				  @fragment fn fs() -> @location(0) vec4f {
				    return vec4f(1, 0, 0, 1);
				  }
				`,
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

		const renderPassDescriptor: any = {
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

		function render() {
			// Get the current texture from the canvas context and
			// set it as the texture to render to.
			renderPassDescriptor.colorAttachments[0].view =
				context.getCurrentTexture().createView();

			const encoder = device!.createCommandEncoder({ label: 'our encoder' });
			const pass = encoder.beginRenderPass(renderPassDescriptor);
			pass.setPipeline(pipeline);
			pass.draw(3);  // call our vertex shader 3 times
			pass.end();

			const commandBuffer = encoder.finish();
			device!.queue.submit([commandBuffer]);
		}

		Object.assign(this.canvas, this.resolutions[this.currentResolution]);
		return new Promise((resolve) => {
			return resolve(render);
		});
	}

	private recursiveSetUniforms = (prefix: string | undefined, subUniforms: any) => {
		const program = this.program;
		if (program) {
			const context = this.context;
			Object.keys(subUniforms).forEach((uniformName) => {
				const uniform = subUniforms[uniformName];
				if (uniform.type !== 'struct') {
					const uniform = subUniforms[uniformName];
					const uniformLocation =
						context.getUniformLocation(program, prefix ? prefix + uniformName : uniformName);
					const setUniformFunction =
						(context[uniform.type as keyof typeof context] as any).bind(context);
					setUniformFunction(uniformLocation, uniform.data);
				} else {

					const newPrefix = prefix ? prefix + uniformName + '.' : uniformName + '.';
					this.recursiveSetUniforms(newPrefix, subUniforms[uniformName].data);
				}
			});
		}
	};

	render(time: number, callback?: any) {
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

	onChange(event: React.ChangeEvent<HTMLInputElement>) {
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
		this.context.getExtension('WEBGL_lose_context')?.loseContext();
	}
}