'use client';
import React, { useEffect, useRef } from 'react';
import Pixelating from '@/components/Pixelating/Pixelating';
import vert from '@/components/Scenes/RayCasting/Test/shaders/vert.glsl';
import frag from '@/components/Scenes/RayCasting/Test/shaders/frag.glsl';
import uniforms from '@/components/Scenes/RayCasting/Test/uniforms';
import Link from 'next/link';
import Slider from '@/components/Pixelating/Slider';

function DesktopPage() {
	const pixelatingCanvasRef = useRef<HTMLCanvasElement>(null);

	const resolutions = [
		{ width: 8, height: 8 },
		{ width: 16, height: 16 },
		{ width: 32, height: 32 },
		{ width: 64, height: 64 },
		{ width: 128, height: 128 },
		{ width: 256, height: 256 },
		{ width: 512, height: 512 },
	];
	let currentResolutionIndex = 1;

	let pixelating: Pixelating;
	useEffect(() => {
		if (pixelatingCanvasRef.current) {
			//Create controller for plane CanvasTexture
			pixelating = new Pixelating(
				pixelatingCanvasRef.current,
				{ vert, frag, uniforms },
				resolutions,
				currentResolutionIndex,
			);

			const pointerDown = (event: MouseEvent) => {
				console.log(event.offsetX, event.offsetY);
			};
			pixelatingCanvasRef.current.addEventListener('pointerdown', pointerDown);

			let animationId: number;
			const render = (time: number) => {
				// convert to seconds
				time *= 0.001;
				if (pixelating) {
					pixelating.render(time);
					animationId = requestAnimationFrame(render);
				}
			};
			render(0);
			return () => {
				if (pixelating) {
					pixelating.unmount();
				}
				if (animationId) {
					cancelAnimationFrame(animationId);
				}
			};
		}
	});
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (pixelating) {
			pixelating.onChange(event);
		}
	};
	return (
		<div className={`bg-background grid gap-y-0 overflow-hidden`}>
			<div className={`flex items-center flex-col`}>
				<Link href="/">Назад к меню</Link>
			</div>
			<div className={`relative bg-background flex items-center flex-col`}>
				<div className="max-w-7xl mx-auto">
					<main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-16 lg:px-8 xl:mt-16">
						<div className="sm:text-left lg:text-left">
							<div className={`flex items-center flex-col`}>
								<canvas id="canvas"
								        className={`w-512 h-512 pixelated`}
								        width={512}
								        height={512}
								        ref={pixelatingCanvasRef}
								></canvas>
								<Slider onChange={onChange}
								        resolutions={resolutions}
								        defaultResolution={currentResolutionIndex}
								/>
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default DesktopPage;
