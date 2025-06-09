import FlyMode from "../Modules/FlyControls";
import { Euler, Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ControllerService } from "../Modules/ControllerService";

class LocalPlayerController {
	Gui = new GUI({ title: "Settings" });
	Movement!: FlyMode;
	Controls!: FlyMode["Controls"];

	PlayerHeight = 0.99;
	PlayerWidth = 0.5;

	PlayerPosition = new Vector3();
	CameraOffset = new Vector3(0, 0.3, 0);
	PlayerId?: string;

	async Init() {
		this.Movement = new FlyMode();
		this.Controls = this.Movement.Controls;
		const RunService = ControllerService.Get("RunService");
		const ServerController = ControllerService.Get("ServerController");

		//save player position
		const savePlayerPosition = () => {
			localStorage.setItem(
				"playerFrame",
				JSON.stringify({
					Position: this.PlayerPosition,
					Rotation: {
						x: this.Controls.object.rotation.x,
						y: this.Controls.object.rotation.y,
						z: this.Controls.object.rotation.z,
					},
				}),
			);
		};
		window.addEventListener("unload", savePlayerPosition);
		setInterval(savePlayerPosition, 5000);

		const savedPosition = localStorage.getItem("playerFrame");
		if (savedPosition) {
			const data = JSON.parse(savedPosition);
			this.PlayerPosition.copy(data.Position);
			if (data.Rotation) {
				this.Controls.object.rotation.set(data.Rotation.x, data.Rotation.y, data.Rotation.z);
			}
		}

		// Display coordinates
		const obj = {
			position: "",
			"Teleport to Spawn": () => {
				this.PlayerPosition.set(0, 40, 0);
			},
		};

		this.Controls.object.rotation;

		const positionGui = this.Gui.add(obj, "position").disable();

		RunService.Heartbeat.Connect((delta) => {
			this.Movement.Step(delta);

			// Update coordinates display every frame
			const { x, y, z } = this.Controls.object.position;
			obj.position = `x${Math.round(x)} y${Math.round(y)} z${Math.round(z)}`;
			positionGui.updateDisplay();
		});

		// Send player position and rotation to the server
		const lastPosition = new Vector3();
		const lastRotation = new Vector3();

		const roundVector = (vector: Vector3 | Euler) => {
			return new Vector3(
				Math.round(vector.x * 1000) / 1000,
				Math.round(vector.y * 1000) / 1000,
				Math.round(vector.z * 1000) / 1000,
			);
		};
		setInterval(() => {
			if (
				!lastPosition.equals(roundVector(this.PlayerPosition)) ||
				!lastRotation.equals(roundVector(this.Controls.object.rotation))
			) {
				// Send updated position and rotation to the server
				ServerController.Socket.emit("playerPositionToServer", {
					Position: {
						x: this.Controls.object.position.x,
						y: this.Controls.object.position.y,
						z: this.Controls.object.position.z,
					},
					Rotation: {
						x: this.Controls.object.rotation.x,
						y: this.Controls.object.rotation.y,
						z: this.Controls.object.rotation.z,
					},
				});

				lastPosition.copy(roundVector(this.PlayerPosition));
				lastRotation.copy(roundVector(this.Controls.object.rotation));
			}
		}, 100);

		this.Gui.add(this.Movement.Settings, "speed", 1, 240, 1).name("Speed");
		this.Gui.add(obj, "Teleport to Spawn");
	}
}

ControllerService.Register("LocalPlayerController", LocalPlayerController);

declare global {
	interface ControllerConstructors {
		LocalPlayerController: typeof LocalPlayerController;
	}
}
