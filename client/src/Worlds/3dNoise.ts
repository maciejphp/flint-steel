import { CubeTextureLoader, DirectionalLight } from "three";
import { ControllerService } from "../Modules/ControllerService";
import { Workspace } from "../Controllers/Workspace";

export default (): void => {
	const WorldController = ControllerService.Get("WorldController");

	const scene = Workspace.Scene;
	WorldController.Start();

	const dirLight = new DirectionalLight(0xffffff, 1.5);
	dirLight.position.set(-5, -2, -4);
	scene.add(dirLight);

	const fillLight = new DirectionalLight(0xffffff, 2);
	fillLight.position.set(2, 4, 3);
	scene.add(fillLight);

	const loader = new CubeTextureLoader();
	loader.setPath("../../skybox/");

	const textureCube = loader.load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

	scene.background = textureCube;
};
