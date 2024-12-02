'use client'; // Indicates that this component is client-side only

import * as THREE from 'three';
import { useTwoCanvases } from '@/hooks/useTwoCanvases';


export default function Playground() {
	const canvassesRefs = useTwoCanvases(
		([canvas1, context1, canvas2, context2]) => {
			const renderer = new THREE.WebGLRenderer({ canvas: canvas1 });

			// Basic Three.js scene setup
			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(90, 1 / 1, 1, 1000);


			// Set up the animation loop using setAnimationLoop
			renderer.setAnimationLoop(() => {
				renderer.render(scene, camera);
			});
			// Cleanup function to dispose of WebGL resources
			return () => {
				// Stop the animation loop
				renderer.setAnimationLoop(null);
			};
		});

	return <div>
		<canvas id="canvas1" className={`pixelated`} width={512} height={512} ref={canvassesRefs[0]}></canvas>
		<canvas id="canvas2" className={`hidden`} ref={canvassesRefs[1]}></canvas>
	</div>;
}