import React from 'react';
import { resolution } from '@/components/interfaces';

export default class Pixelating {
	canvas: HTMLCanvasElement;
	private readonly context: WebGL2RenderingContext;
	private readonly shaders: { vert: string; frag: string; uniforms: any };
	private readonly program: WebGLProgram | null | undefined;
	private readonly resolutions: Array<resolution>;

	constructor(
		canvas: HTMLCanvasElement,
		shaders: { vert: string, frag: string, uniforms: any },
		resolutions: Array<resolution>,
		defaultResolution = 0,
	) {
		this.canvas = canvas;
		this.shaders = shaders;
		this.resolutions = resolutions;
		const context = this.context = canvas.getContext('webgl2')!;

		const fragmentShader = this.getShader(context.FRAGMENT_SHADER, shaders.frag);
		const vertexShader = this.getShader(context.VERTEX_SHADER, shaders.vert);
		const program = this.program = context.createProgram();
		if (program && vertexShader && fragmentShader) {
			context.attachShader(program, vertexShader);
			context.attachShader(program, fragmentShader);
			context.linkProgram(program);

			if (!context.getProgramParameter(program, context.LINK_STATUS)) {
				context.deleteProgram(program);
				console.log('ERROR linking program!', context.getProgramInfoLog(program));
				throw 'Не удалось установить шейдеры';
			} else {
				Object.assign(canvas, resolutions[defaultResolution]);
				context.viewport(0, 0, canvas.width, canvas.height);

				const positionBuffer = context.createBuffer();
				context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
				context.bufferData(
					context.ARRAY_BUFFER,
					new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
					context.STATIC_DRAW,
				);

				// provide texture coordinates for the rectangle.
				const texcoordBuffer = context.createBuffer();
				context.bindBuffer(context.ARRAY_BUFFER, texcoordBuffer);
				// Set Texcoords.
				context.bufferData(
					context.ARRAY_BUFFER,
					new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
					context.STATIC_DRAW,
				);

				//attributes
				const positionLocation = context.getAttribLocation(program, 'a_position');
				const texcoordLocation = context.getAttribLocation(program, 'a_texcoord');

				// Tell it to use our program (pair of shaders)
				context.useProgram(program);
				context.enableVertexAttribArray(positionLocation);
				context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
				context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);

				context.enableVertexAttribArray(texcoordLocation);
				context.bindBuffer(context.ARRAY_BUFFER, texcoordBuffer);
				context.vertexAttribPointer(texcoordLocation, 2, context.FLOAT, false, 0, 0);

				// Create a texture to render to
				const targetTexture = context.createTexture();
				context.bindTexture(context.TEXTURE_2D, targetTexture);

				// Create and bind the framebuffer
				context.bindFramebuffer(context.FRAMEBUFFER, context.createFramebuffer());
				context.framebufferTexture2D(
					context.FRAMEBUFFER,
					context.COLOR_ATTACHMENT0,
					context.TEXTURE_2D,
					targetTexture,
					0,
				);

				// render to the canvas
				context.bindFramebuffer(context.FRAMEBUFFER, null);

				//uniforms
				this.recursiveSetUniforms(
					undefined,
					{
						...shaders.uniforms,
						iScaleWidth: { type: 'uniform1f', data: resolutions[defaultResolution].width },
						iScaleHeight: { type: 'uniform1f', data: resolutions[defaultResolution].height },
					});
			}
		}
	}

	private getShader(type: GLenum, shaderCode: string) {
		const context = this.context;
		const shader = context.createShader(type);
		if (shader) {
			context.shaderSource(shader, shaderCode);
			context.compileShader(shader);
			if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
				console.log('Ошибка компиляции шейдера: ' + context.getShaderInfoLog(shader));
				context.deleteShader(shader);
				return null;
			}
			return shader;
		} else {
			return null;
		}
	};

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
		}
	}

	unmount() {
		this.context.getExtension('WEBGL_lose_context')?.loseContext();
	}
}