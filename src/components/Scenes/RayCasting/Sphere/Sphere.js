'use client';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import shaderCode from './shaders/shader.wgsl';
import uniforms from './uniforms';

import Pixelating from '@/components/Pixelating/Pixelating';
import Slider from '@/components/Pixelating/Slider';
import { useTwoCanvases } from '@/hooks/useTwoCanvases';

export default function Sphere() {
	const statsRef = useRef(null);

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
	const [materialState, setMaterialState] = useState(null);
	const [pixelatingState, setPixelatingState] = useState(null);
	const canvassesRefs = useTwoCanvases(
		([canvas, pixelatingCanvas, pixelatingContext]) => {
			//Create Stats for fps info
			const stats = new Stats();
			if (statsRef.current) {
				statsRef.current.appendChild(stats.dom);
			}

			const geometry = new THREE.PlaneGeometry(2.0, 2.0);
			const material = new THREE.MeshBasicMaterial();
			material.map = new THREE.CanvasTexture(pixelatingCanvas);
			material.map.magFilter = THREE.NearestFilter;
			material.map.flipY = false;
			material.map.premultiplyAlpha = false;
			material.side = THREE.DoubleSide;
			material.transparent = true;
			material.opacity = 1;

			const plane = new THREE.Mesh(geometry, material);

			const sphereGeometry = new THREE.SphereGeometry(uniforms.sphere.data.radius.data, 32, 32);
			const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
			const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
			const spherePosition = uniforms.sphere.data.position.data;
			sphere.position.set(spherePosition[0], spherePosition[1], spherePosition[2]);

			const lineMaterial2 = new THREE.LineBasicMaterial({ color: 0x00FF00 });
			const lineGeometry2 = new THREE.BufferGeometry();
			const line2 = new THREE.Line(lineGeometry2, lineMaterial2);
			const pointsL2 = [
				new THREE.Vector3(0, 0, 1),
			];

			const light = new THREE.DirectionalLight(0xffffff, 3);
			const lightPosition = uniforms.lightSphere.data.position.data;
			light.position.set(lightPosition[0], lightPosition[1], lightPosition[2]);

			const width = canvas.width;
			const height = canvas.height;

			const camera
				= new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);
			camera.position.z = 2.0;

			//aspect ratio should be 1:1 now
			const cameraPerspective
				= new THREE.PerspectiveCamera(90, width / height, 1, 1000);
			const helper = new THREE.CameraHelper(cameraPerspective);

			const group = new THREE.Group();
			group.add(plane);
			group.add(sphere);
			group.add(line2);
			group.add(light);

			const scene = new THREE.Scene();
			scene.add(group);

			scene.add(helper);

			const pointer = new THREE.Vector2(-999, -999);
			const rayCaster = new THREE.Raycaster();

			const pointerDown = (event) => {
				// calculate pointer position in normalized device coordinates
				// (-1 to +1) for both components
				const rect = canvas.getBoundingClientRect();
				pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
				pointer.y = -((event.clientY - rect.top) / height) * 2 + 1;
				rayCaster.setFromCamera(pointer, camera);
				// calculate objects intersecting the picking ray
				const intersects = rayCaster.intersectObjects([plane], false);
				const uv = intersects[0]?.uv;
				if (uv) {
					const { width, height } = resolutions[currentResolutionIndex];
					uniforms.iMouse.data = [
						Math.floor((uv.x - 0.5) * width),
						Math.floor((uv.y - 0.5) * height),
					];

					const xFloored = Math.floor((uv.x - 0.5) * width) / width;
					const yFloored = Math.floor((uv.y - 0.5) * height) / height;
					const xHalfPixel = 1 / width * 0.5;
					const yHalfPixel = 1 / height * 0.5;

					pointsL2[1] = new THREE.Vector3(
						3 * (xFloored + xHalfPixel) * plane.geometry.parameters.width,
						3 * (yFloored + yHalfPixel) * plane.geometry.parameters.height,
						-2,
					);
					lineGeometry2.setFromPoints(pointsL2);
				}

			};
			canvas.addEventListener('pointerdown', pointerDown);


			const renderer = new THREE.WebGLRenderer({canvas});
			renderer.setSize(width, height);

			//Create controller for plane CanvasTexture
			const pixelating = new Pixelating(
				{ code: shaderCode, uniforms },
				resolutions,
				currentResolutionIndex,
			);

			const pixelatingRenderPromise = pixelating.initialize(pixelatingContext);
			pixelatingRenderPromise.then(
				(render) => {
					setMaterialState(material);
					setPixelatingState(pixelating);
					//group.rotation.y = Math.PI / 4;
					const animate = (time) => {
						//convert to seconds
						time *= 0.001;
						group.rotation.y -= 0.005;

						cameraPerspective.position.x = -Math.cos(group.rotation.y + Math.PI / 2);
						cameraPerspective.position.z = Math.sin(group.rotation.y + Math.PI / 2);
						cameraPerspective.lookAt(plane.position);
						cameraPerspective.updateProjectionMatrix();
						if (material.map) {
							material.map.needsUpdate = true;
							render(time);
							pixelating.render(time, (context, program) => {

								const spherePosition = uniforms.sphere.data.position.data;
								spherePosition[0] = Math.cos(time);
								spherePosition[1] = -Math.sin(time);
								sphere.position.setX(spherePosition[0]);
								sphere.position.setY(spherePosition[1]);
								//const spherePositionUniformLocation =
								//context.getUniformLocation(program, 'sphere.position');
								//context.uniform3fv(spherePositionUniformLocation, uniforms.sphere.data.position.data);

								const lightPosition = uniforms.lightSphere.data.position.data;
								lightPosition[0] = 2.0 * Math.cos(time);
								lightPosition[1] = 2.0 * Math.sin(time);
								light.position.setX(lightPosition[0]);
								light.position.setY(lightPosition[1]);
								//const lightSpherePositionUniformLocation =
								//context.getUniformLocation(program, 'lightSphere.position');
								//context.uniform3fv(lightSpherePositionUniformLocation, uniforms.lightSphere.data.position.data);
							});
						}
						renderer.render(scene, camera);
						stats.update();

					};

					renderer.setAnimationLoop(animate);
				},
				(error) => {
					throw error;
				},
			);

			// Cleanup function to dispose of WebGL resources
			return () => {
				pixelating.unmount();
				renderer.setAnimationLoop(null);
			};
		});

	const onChange = (event) => {
		if (pixelatingState && materialState.map) {
			currentResolutionIndex = event.target.valueAsNumber;
			uniforms.iMouse.data = [-999, -999];
			materialState.map.dispose();
			pixelatingState.onChange(event);
		}
	};
	return (
		<>
			<div ref={statsRef}></div>
			<canvas id="canvas" className='pixelated' width={512} height={512} ref={canvassesRefs[0]}></canvas>
			<canvas id="canvas" className='hidden' ref={canvassesRefs[1]}></canvas>
			<Slider onChange={onChange} resolutions={resolutions} defaultResolution={currentResolutionIndex} />
		</>
	);
}