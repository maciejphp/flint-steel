import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Euler, Quaternion, Raycaster, Vector3 } from "three";
import { ControllerService } from "./ControllerService";
import { Workspace } from "../Controllers/Workspace";

export default class {
	Controls: PointerLockControls;
	MoveForward = false;
	MoveBackward = false;
	MoveLeft = false;
	MoveRight = false;
	MoveUp = false;
	MoveDown = false;
	Velocity = new Vector3();

	Settings = {
		speed: 60,
		friction: 9,
	};

	constructor() {
		this.Controls = new PointerLockControls(Workspace.Camera, document.body);
		this.Init();
	}

	async Init(): Promise<void> {
		Workspace.Scene.add(this.Controls.object);

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			switch (event.code) {
				case "ArrowUp":
				case "KeyW":
					this.MoveForward = true;
					break;

				case "ArrowLeft":
				case "KeyA":
					this.MoveLeft = true;
					break;

				case "ArrowDown":
				case "KeyS":
					this.MoveBackward = true;
					break;

				case "ArrowRight":
				case "KeyD":
					this.MoveRight = true;
					break;

				case "Space":
					this.MoveUp = true;
					break;

				case "ShiftLeft":
					this.MoveDown = true;
					break;
			}
		});
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			switch (event.code) {
				case "ArrowUp":
				case "KeyW":
					this.MoveForward = false;
					break;

				case "ArrowLeft":
				case "KeyA":
					this.MoveLeft = false;
					break;

				case "ArrowDown":
				case "KeyS":
					this.MoveBackward = false;
					break;

				case "ArrowRight":
				case "KeyD":
					this.MoveRight = false;
					break;

				case "Space":
					this.MoveUp = false;
					break;

				case "ShiftLeft":
					this.MoveDown = false;
					break;
			}
		});
	}

	Step(delta: number): void {
		delta = Math.min(delta, 0.5);
		const LocalPlayerController = ControllerService.Get("LocalPlayerController");

		const halfPlayerWidth = LocalPlayerController.PlayerWidth * 0.5;
		const halfPlayerHeight = LocalPlayerController.PlayerHeight * 0.5;
		const playerPosition = LocalPlayerController.PlayerPosition;

		this.Velocity.multiplyScalar(1 - this.Settings.friction * delta); // friction value

		// Step 1: Create direction vector (horizontal only — Y will be added separately if needed)
		const direction = this.Controls.isLocked
			? new Vector3(
					Number(this.MoveRight) - Number(this.MoveLeft),
					0,
					Number(this.MoveBackward) - Number(this.MoveForward),
			  ).normalize()
			: new Vector3(0, 0, 0);

		// Step 2: Get the camera's yaw (horizontal rotation only)
		const euler = new Euler(0, 0, 0, "YXZ");
		euler.setFromQuaternion(this.Controls.object.quaternion);
		const yaw = new Quaternion().setFromEuler(new Euler(0, euler.y, 0));
		const movement = direction.applyQuaternion(yaw);

		if (this.Controls.isLocked) {
			if (this.MoveUp) direction.y += 1;
			if (this.MoveDown) direction.y -= 1;
		}

		this.Velocity.add(movement.multiplyScalar(this.Settings.speed * delta));

		const newPosition = playerPosition.clone().add(this.Velocity.clone().multiplyScalar(delta));

		// Handle collision
		const distanceTraveled = new Vector3().subVectors(newPosition, playerPosition);

		// Shoot a raycast in each direction and only allows movement if it doesnt hit anything
		// Clone current position
		const tempPosition = playerPosition.clone();
		const willCollide = (origin: Vector3, direction: Vector3, distance: number, offset: number): boolean => {
			const raycaster = new Raycaster(origin, direction.clone().normalize(), 0, distance + offset);
			const intersects = raycaster.intersectObjects(Workspace.Scene.children, true);
			return intersects.length > 0;
		};

		// Move X
		const nextX = tempPosition.clone().add(new Vector3(distanceTraveled.x, 0, 0));
		if (
			!willCollide(
				tempPosition,
				new Vector3(Math.sign(distanceTraveled.x), 0, 0),
				Math.abs(distanceTraveled.x),
				halfPlayerWidth,
			)
		) {
			tempPosition.x = nextX.x;
		} else {
			this.Velocity.x = 0;
		}

		// Move Z
		const nextZ = tempPosition.clone().add(new Vector3(0, 0, distanceTraveled.z));
		if (
			!willCollide(
				tempPosition,
				new Vector3(0, 0, Math.sign(distanceTraveled.z)),
				Math.abs(distanceTraveled.z),
				halfPlayerWidth,
			)
		) {
			tempPosition.z = nextZ.z;
		} else {
			this.Velocity.z = 0;
		}

		const nextY = tempPosition.clone().add(new Vector3(0, distanceTraveled.y, 0));
		if (
			!willCollide(
				tempPosition,
				new Vector3(0, Math.sign(distanceTraveled.y), 0),
				Math.abs(distanceTraveled.y),
				halfPlayerHeight,
			)
		) {
			tempPosition.y = nextY.y;
		} else {
			this.Velocity.y = 0;
		}

		newPosition.copy(tempPosition);

		playerPosition.copy(newPosition);
		this.Controls.object.position.copy(playerPosition.clone().add(LocalPlayerController.CameraOffset));
	}
}
