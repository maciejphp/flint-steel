import { DirectionalLight, Mesh, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { setPlaneUv } from "./Terrain/Chunk";
import { ControllerService } from "./ControllerService";

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(100, 100);

const scene = new Scene();
scene.background = null;
renderer.setClearColor(0x000000, 0);

const halfPi = Math.PI / 2;
const planePrehabs = {
	nx: new PlaneGeometry(1, 1).rotateY(-halfPi).translate(-0.5, 0, 0),
	py: new PlaneGeometry(1, 1).rotateX(-halfPi).translate(0, 0.5, 0),
	pz: new PlaneGeometry(1, 1).translate(0, 0, 0.5),
};

const fillLight = new DirectionalLight(0xffffff, 2);
fillLight.position.set(-0.3, 1, 1.3);
scene.add(fillLight);

const camera = new PerspectiveCamera(35, 1, 0.1, 100);

camera.position.set(0, 0, 4);

export const CreateBlockDisplay = (block: Block): string => {
	const WorldController = ControllerService.Get("WorldController");

	const geometries = [planePrehabs.nx.clone(), planePrehabs.py.clone(), planePrehabs.pz.clone()];
	geometries.forEach((geometry) => {
		setPlaneUv(geometry, block.Id, WorldController.TextureSettings.TextureRatio);
	});

	const geometry = mergeGeometries(geometries, false);

	const cube = new Mesh(geometry, WorldController.TextureSettings.Material);
	cube.rotation.y = Math.PI / 4;
	cube.rotation.x = Math.PI / 8;

	scene.add(cube);

	renderer.render(scene, camera);
	const imageUrl = renderer.domElement.toDataURL("image/png");

	scene.remove(cube);

	return imageUrl;
};
