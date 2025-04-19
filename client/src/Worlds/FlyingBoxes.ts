import * as THREE from "three";
import { Workspace } from "../Controllers/Workspace";

export default (): void => {
	const scene = Workspace.Scene;

	const objects: THREE.Mesh[] = [];

	const vertex = new THREE.Vector3();
	const color = new THREE.Color();

	const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
	light.position.set(0.5, 1, 0.75);
	scene.add(light);

	// floor
	const floorGeometryIntexed = new THREE.PlaneGeometry(2000, 2000, 100, 100);
	floorGeometryIntexed.rotateX(-Math.PI / 2);

	// vertex displacement
	let position = floorGeometryIntexed.attributes.position;

	for (let i = 0, l = position.count; i < l; i++) {
		vertex.fromBufferAttribute(position, i);

		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;

		position.setXYZ(i, vertex.x, vertex.y, vertex.z);
	}

	const floorGeometry = floorGeometryIntexed.toNonIndexed(); // ensure each face has unique vertices

	position = floorGeometry.attributes.position;
	const colorsFloor = [];

	for (let i = 0, l = position.count; i < l; i++) {
		color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace);
		colorsFloor.push(color.r, color.g, color.b);
	}

	floorGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colorsFloor, 3));

	const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	scene.add(floor);

	// objects

	const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();

	position = boxGeometry.attributes.position;
	const colorsBox = [];

	for (let i = 0, l = position.count; i < l; i++) {
		color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace);
		colorsBox.push(color.r, color.g, color.b);
	}

	boxGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colorsBox, 3));

	for (let i = 0; i < 500; i++) {
		const boxMaterial = new THREE.MeshPhongMaterial({
			specular: 0xffffff,
			flatShading: true,
			vertexColors: true,
		});
		boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace);

		const box = new THREE.Mesh(boxGeometry, boxMaterial);
		box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
		box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
		box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

		scene.add(box);
		objects.push(box);
	}
};
