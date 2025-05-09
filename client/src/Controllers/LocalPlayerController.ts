import { PointerLockControls } from "three/examples/jsm/Addons.js";
import GravityMode from "../Modules/FirstPersonControls";
import FlyMode from "../Modules/FlyControls";
import { Matrix4 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ControllerService } from "../Modules/ControllerService";
import { RunService } from "./RunService";

console.log("locaplcontroller");

class LocalPlayerController {
	Controls!: PointerLockControls;
	Gui = new GUI();

	Fly = true;

	async Init() {
		if (this.Fly) {
			this.Controls = FlyMode();
		} else {
			this.Controls = GravityMode();
		}

		//save player position
		const savePlayerPosition = () => {
			localStorage.setItem("playerMatrix", JSON.stringify(this.Controls.object.matrix));
		};
		window.addEventListener("unload", savePlayerPosition);
		setInterval(savePlayerPosition, 5000);

		const savedPosition = localStorage.getItem("playerMatrix");
		if (savedPosition) {
			this.Controls.object.applyMatrix4(JSON.parse(savedPosition) as Matrix4);
		} else {
			this.Controls.object.position.y = 300;
		}

		// Display coordinates
		const coordinates = {
			position: "",
		};

		const positionGui = this.Gui.add(coordinates, "position").disable();

		RunService.Heartbeat.Connect(() => {
			const { x, y, z } = this.Controls.object.position;
			coordinates.position = `x${Math.round(x)} y${Math.round(y)} z${Math.round(z)}`;
			positionGui.updateDisplay();
		});
	}
}

ControllerService.Register("LocalPlayerController", LocalPlayerController);

declare global {
	interface ControllerConstructors {
		LocalPlayerController: typeof LocalPlayerController;
	}
}
