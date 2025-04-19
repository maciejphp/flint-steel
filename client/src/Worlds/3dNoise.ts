import {
	AmbientLight,
	BasicShadowMap,
	BoxGeometry,
	CameraHelper,
	DirectionalLight,
	HemisphereLight,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PlaneGeometry,
} from "three";
import { Workspace } from "../Controllers/Workspace";
import { WorldController } from "../Controllers/WorldController";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { RunService } from "../Controllers/RunService";

export default (): void => {
	const scene = Workspace.Scene;

	WorldController.Start();

	const ambientLight = new AmbientLight(0xeeeeee, 1);
	scene.add(ambientLight);

	// const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
	// hemiLight.position.set(0, 20, 0);
	// scene.add(hemiLight);

	const dirLight = new DirectionalLight(0xffffff, 2);
	dirLight.position.set(-3, 10, -8);
	scene.add(dirLight);

	// const directionalLight = new DirectionalLight(0xffffff, 12);
	// directionalLight.position.set(1, 1, 0.5).normalize();
	// directionalLight.castShadow = true;
	// scene.add(directionalLight);
};
