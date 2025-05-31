import { PointerLockControls } from "three/examples/jsm/Addons.js";
import FlyMode from "../Modules/FlyControls";
import { Matrix4, Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ControllerService } from "../Modules/ControllerService";

class LocalPlayerController {
	Controls!: PointerLockControls;
	Gui = new GUI({ title: "Settings" });

	PlayerHeight = 0.99;
	PlayerWidth = 0.5;

	PlayerPosition = new Vector3();
	CameraOffset = new Vector3(0, 0.3, 0);

	async Init() {
		const RunService = ControllerService.Get("RunService");

		this.Controls = FlyMode();

		//save player position
		const savePlayerPosition = () => {
			localStorage.setItem("playerMatrix", JSON.stringify(this.Controls.object.matrix));
		};
		window.addEventListener("unload", savePlayerPosition);
		setInterval(savePlayerPosition, 5000);

		const savedPosition = localStorage.getItem("playerMatrix");
		if (savedPosition) {
			this.PlayerPosition.applyMatrix4(JSON.parse(savedPosition) as Matrix4);
		} else {
			this.PlayerPosition.y = 40;
		}

		this.Controls.object.position.copy(this.PlayerPosition.clone().add(this.CameraOffset));

		// Display coordinates
		const obj = {
			position: "",
			"Teleport to Spawn": () => {
				this.PlayerPosition.set(0, 40, 0);
			},
		};

		const positionGui = this.Gui.add(obj, "position").disable();

		RunService.Heartbeat.Connect(() => {
			const { x, y, z } = this.Controls.object.position;
			obj.position = `x${Math.round(x)} y${Math.round(y)} z${Math.round(z)}`;
			positionGui.updateDisplay();
		});

		this.Gui.add(obj, "Teleport to Spawn");
	}
}

ControllerService.Register("LocalPlayerController", LocalPlayerController);

declare global {
	interface ControllerConstructors {
		LocalPlayerController: typeof LocalPlayerController;
	}
}
