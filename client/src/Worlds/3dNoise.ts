import { CubeTextureLoader, DirectionalLight } from "three";
import { Workspace } from "../Controllers/Workspace";
import { ControllerService } from "../Modules/ControllerService";

export default (): void => {
	const WorldController = ControllerService.GetController("WorldController");

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
