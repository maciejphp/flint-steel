import { DirectionalLight } from "three";
import { Workspace } from "../Controllers/Workspace";
import { WorldController } from "../Controllers/WorldController";

export default (): void => {
	const scene = Workspace.Scene;

	WorldController.Start();

	const dirLight = new DirectionalLight(0xffffff, 1.5);
	dirLight.position.set(-5, -2, -4);
	scene.add(dirLight);

	const fillLight = new DirectionalLight(0xffffff, 2);
	fillLight.position.set(2, 4, 3);
	scene.add(fillLight);

	// const gui = new GUI();
	// gui.addColor(dirLight, "color");
	// gui.add(dirLight.position, "x", -10, 10).name("DirLight X");
	// gui.add(dirLight.position, "y", -10, 10).name("DirLight Y");
	// gui.add(dirLight.position, "z", -10, 10).name("DirLight Z");
	// gui.add(dirLight, "intensity");

	// gui.addColor(fillLight, "color");
	// gui.add(fillLight.position, "x", -10, 10).name("DirLight X");
	// gui.add(fillLight.position, "y", -10, 10).name("DirLight Y");
	// gui.add(fillLight.position, "z", -10, 10).name("DirLight Z");
	// gui.add(fillLight, "intensity");
};
