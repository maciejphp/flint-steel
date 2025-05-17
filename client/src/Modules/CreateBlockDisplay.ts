import { Material, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { setPlaneUv } from "./Terrain/Chunk";
import { Workspace } from "../Controllers/Workspace";

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(100, 100);
// document.body.appendChild(renderer.domElement);

const scene = new Scene();
scene.background = null;
renderer.setClearColor(0x000000, 0);

const halfPi = Math.PI / 2;
const planePrehabs = {
	nx: new PlaneGeometry(1, 1).rotateY(-halfPi).translate(-0.5, 0, 0),
	py: new PlaneGeometry(1, 1).rotateX(-halfPi).translate(0, 0.5, 0),
	pz: new PlaneGeometry(1, 1).translate(0, 0, 0.5),
};

const camera = new PerspectiveCamera(35, 1, 0.1, 100);

camera.position.set(0, 0, 4);

let material: Material;
Workspace.WaitForGameLoaded().then(() => {
	material = new MeshBasicMaterial({ map: Workspace.Texture });
});

export const CreateBlockDisplay = (block: Block): string => {
	const geometries = [planePrehabs.nx.clone(), planePrehabs.py.clone(), planePrehabs.pz.clone()];
	geometries.forEach((geometry) => {
		setPlaneUv(geometry, block.Id);
	});

	const geometry = mergeGeometries(geometries, false);

	const cube = new Mesh(geometry, material);
	cube.rotation.y = Math.PI / 4;
	cube.rotation.x = Math.PI / 8;

	scene.add(cube);

	renderer.render(scene, camera);
	const imageUrl = renderer.domElement.toDataURL("image/png");

	scene.remove(cube);

	return imageUrl;
};
