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
	const [resolutionIndex, setResolutionIndex] = useState(3);
	const [materialState, setMaterialState] = useState(null);
	const [pixelatingState, setPixelatingState] = useState(null);
	const canvassesRefs = useTwoCanvases(
		'mainCanvas',
		'pixelatingCanvas',
		([mainCanvas, pixelatingCanvas]) => {

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

			const { width, height } = mainCanvas;

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
				const rect = mainCanvas.getBoundingClientRect();
				pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
				pointer.y = -((event.clientY - rect.top) / height) * 2 + 1;
				rayCaster.setFromCamera(pointer, camera);
				// calculate objects intersecting the picking ray
				const intersects = rayCaster.intersectObjects([plane], false);
				const uv = intersects[0]?.uv;
				if (uv) {
					const { width, height } = resolutions[resolutionIndex];
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
			mainCanvas.addEventListener('pointerdown', pointerDown);

			const renderer = new THREE.WebGLRenderer({ canvas: mainCanvas });
			renderer.setSize(width, height);

			//Create controller for plane CanvasTexture
			let pixelating = new Pixelating();
			pixelating
				.initialize(
					pixelatingCanvas,
					resolutions[resolutionIndex],
					{ code: shaderCode, uniforms },
				)
				.then((render) => {
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
								render(time, (device, { uniformBuffer, uniformValues }, index) => {
									//for each uniform
									if (index === 2) {
										//sphere
										const spherePosition = uniforms.sphere.data.position.data;
										spherePosition[0] = Math.cos(time);
										spherePosition[1] = -Math.sin(time);
										sphere.position.setX(spherePosition[0]);
										sphere.position.setY(spherePosition[1]);

										uniformValues.set(
											[
												spherePosition[0],
												spherePosition[1],
												uniforms.sphere.data.position.data[2],
												uniforms.sphere.data.radius.data[0],
												uniforms.sphere.data.material.data.Kd.data[0],
												uniforms.sphere.data.material.data.Kd.data[1],
												uniforms.sphere.data.material.data.Kd.data[2],
												0,
												uniforms.sphere.data.material.data.Ke.data[0],
												uniforms.sphere.data.material.data.Ke.data[1],
												uniforms.sphere.data.material.data.Ke.data[2],
												0
											], 0);
										device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
									}
									if (index === 3) {
										//light sphere
										const lightPosition = uniforms.lightSphere.data.position.data;
										lightPosition[0] = 2.0 * Math.cos(time);
										lightPosition[1] = 2.0 * Math.sin(time);
										light.position.setX(lightPosition[0]);
										light.position.setY(lightPosition[1]);
										uniformValues.set(
											[
												lightPosition[0],
												lightPosition[1],
												uniforms.lightSphere.data.position.data[2],
												uniforms.lightSphere.data.radius.data[0],
												uniforms.lightSphere.data.material.data.Kd.data[0],
												uniforms.lightSphere.data.material.data.Kd.data[1],
												uniforms.lightSphere.data.material.data.Kd.data[2],
												0,
												uniforms.lightSphere.data.material.data.Ke.data[0],
												uniforms.lightSphere.data.material.data.Ke.data[1],
												uniforms.lightSphere.data.material.data.Ke.data[2],
												0

											], 0);
										device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
									}
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
			return () => {
				renderer.setAnimationLoop(null);
			};
		});

	const onChange = (event) => {
		if (pixelatingState && materialState.map) {
			materialState.map.dispose();

			const newResolutionIndex = event.target.valueAsNumber;
			setResolutionIndex(newResolutionIndex);
			pixelatingState.changeResolution(resolutions[newResolutionIndex]);

			uniforms.iMouse.data = [-999, -999];
		}
	};
	return (
		<>
			<div ref={statsRef}></div>
			<canvas id="canvas" className="pixelated" width={512} height={512} ref={canvassesRefs.mainCanvas}></canvas>
			<canvas id="canvas" className="hidden" ref={canvassesRefs.pixelatingCanvas}></canvas>
			<Slider onChange={onChange} resolutions={resolutions} resolutionIndex={resolutionIndex} />
		</>
	);
}