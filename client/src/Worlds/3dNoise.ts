import { AmbientLight, DirectionalLight } from "three";
import { Workspace } from "../Controllers/Workspace";
import { WorldController } from "../Controllers/WorldController";

export default (): void => {
	const scene = Workspace.Scene;

	WorldController.Start();

	const ambientLight = new AmbientLight(0xeeeeee, 3);
	scene.add(ambientLight);

	const directionalLight = new DirectionalLight(0xffffff, 12);
	directionalLight.position.set(1, 1, 0.5).normalize();
	scene.add(directionalLight);
};
