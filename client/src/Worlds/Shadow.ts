import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Workspace } from "../Controllers/Workspace";
import { WorldController } from "../Controllers/WorldController";

// import { WorldController } from "./src/Controllers/WorldController";

export default (): void => {
	// WorldController.Start();

	// === Setup Renderer ===
	const renderer = Workspace.Renderer;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild(renderer.domElement);

	// === Setup Scene & Camera ===
	const scene = Workspace.Scene;
	scene.background = new THREE.Color(0xaaaaaa);

	// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	// camera.position.set(10, 10, 10);
	// camera.lookAt(0, 0, 0);

	// === Add Light with Shadows ===
	const light = new THREE.DirectionalLight(0xffffff, 2);
	light.position.set(10, 20, 10);
	light.castShadow = true;

	// Shadow Settings (bigger area = more coverage)
	light.shadow.mapSize.set(10240, 10240);
	light.shadow.camera.left = -2000;
	light.shadow.camera.right = 2000;
	light.shadow.camera.top = 2000;
	light.shadow.camera.bottom = -2000;
	// light.shadow.camera.near = 1;
	// light.shadow.camera.far = 50;

	scene.add(light);

	// Optional: helper to visualize shadow camera
	// scene.add(new THREE.CameraHelper(light.shadow.camera));

	// === Add Plane to Receive Shadows ===
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(500, 500),
		new THREE.MeshStandardMaterial({ color: 0x777777 }),
	);
	plane.rotation.x = -Math.PI / 2;
	plane.receiveShadow = true;
	plane.castShadow = true;
	// plane.position.y = 100;
	scene.add(plane);

	// === Add Cube to Cast Shadow ===
	const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
	cube.position.set(0, 1, 0);
	cube.castShadow = true;
	cube.receiveShadow = true;
	cube.receiveShadow = false;
	scene.add(cube);

	// === Animate / Render Loop ===
	function animate() {
		requestAnimationFrame(animate);
		cube.rotation.y += 0.01;
		renderer.render(scene, Workspace.Camera);
	}

	// new OrbitControls(camera, renderer.domElement);

	// {
	// 	const blockSize = 20;
	// 	const halfBlockSize = 10;
	// 	const halfPi = Math.PI / 2;
	// 	const planePrehabs = [
	// 		new THREE.PlaneGeometry(blockSize, blockSize).rotateY(halfPi).translate(halfBlockSize, 0, 0),

	// 		new THREE.PlaneGeometry(blockSize, blockSize).rotateY(-halfPi).translate(-halfBlockSize, 0, 0),

	// 		new THREE.PlaneGeometry(blockSize, blockSize).rotateX(-halfPi).translate(0, halfBlockSize, 0),

	// 		new THREE.PlaneGeometry(blockSize, blockSize).rotateX(halfPi).translate(0, -halfBlockSize, 0),

	// 		new THREE.PlaneGeometry(blockSize, blockSize).translate(0, 0, halfBlockSize),

	// 		new THREE.PlaneGeometry(blockSize, blockSize).rotateY(Math.PI).translate(0, 0, -halfBlockSize),
	// 	];

	// 	// const texture = new TextureLoader().load("../../public/texture.png");
	// 	// texture.colorSpace = SRGBColorSpace;
	// 	// texture.magFilter = NearestFilter;
	// 	const geometry = mergeGeometries(planePrehabs, true);
	// 	// geometry.computeBoundingSphere();
	// 	const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({}));
	// 	scene.add(mesh);
	// 	mesh.castShadow = true;
	// 	mesh.receiveShadow = true;
	// }

	const helper = new THREE.CameraHelper(light.shadow.camera);
	scene.add(helper);

	WorldController.Start();

	animate();
};
