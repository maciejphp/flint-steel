import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Euler, Quaternion, Raycaster, Vector3 } from "three";
import { ControllerService } from "./ControllerService";
import { Workspace } from "../Controllers/Workspace";

export default (): PointerLockControls => {
	const LocalPlayerController = ControllerService.Get("LocalPlayerController");
	const RunService = ControllerService.Get("RunService");

	const controls = new PointerLockControls(Workspace.Camera, document.body);
	let moveForward = false;
	let moveBackward = false;
	let moveLeft = false;
	let moveRight = false;
	let moveUp = false;
	let moveDown = false;

	Workspace.Scene.add(controls.object);

	document.addEventListener("keydown", (event: KeyboardEvent) => {
		switch (event.code) {
			case "ArrowUp":
			case "KeyW":
				moveForward = true;
				break;

			case "ArrowLeft":
			case "KeyA":
				moveLeft = true;
				break;

			case "ArrowDown":
			case "KeyS":
				moveBackward = true;
				break;

			case "ArrowRight":
			case "KeyD":
				moveRight = true;
				break;

			case "Space":
				moveUp = true;
				break;

			case "ShiftLeft":
				moveDown = true;
				break;
		}
	});
	document.addEventListener("keyup", (event: KeyboardEvent) => {
		switch (event.code) {
			case "ArrowUp":
			case "KeyW":
				moveForward = false;
				break;

			case "ArrowLeft":
			case "KeyA":
				moveLeft = false;
				break;

			case "ArrowDown":
			case "KeyS":
				moveBackward = false;
				break;

			case "ArrowRight":
			case "KeyD":
				moveRight = false;
				break;

			case "Space":
				moveUp = false;
				break;

			case "ShiftLeft":
				moveDown = false;
				break;
		}
	});

	const velocity = new Vector3();

	const Settings = {
		speed: 60,
		friction: 9,
	};

	LocalPlayerController.Gui.add(Settings, "speed", 1, 240, 1);

	let previousPosition: Vector3;
	const halfPlayerWidth = LocalPlayerController.PlayerWidth * 0.5;
	const halfPlayerHeight = LocalPlayerController.PlayerHeight * 0.5;
	const playerPosition = LocalPlayerController.PlayerPosition;

	RunService.Heartbeat.Connect((delta) => {
		delta = Math.min(delta, 0.5);
		velocity.multiplyScalar(1 - Settings.friction * delta); // friction value

		// Step 1: Create direction vector (horizontal only — Y will be added separately if needed)
		const direction = controls.isLocked
			? new Vector3(
					Number(moveRight) - Number(moveLeft),
					0,
					Number(moveBackward) - Number(moveForward),
			  ).normalize()
			: new Vector3(0, 0, 0);

		// Step 2: Get the camera's yaw (horizontal rotation only)
		const euler = new Euler(0, 0, 0, "YXZ");
		euler.setFromQuaternion(controls.object.quaternion);
		const yaw = new Quaternion().setFromEuler(new Euler(0, euler.y, 0));
		const movement = direction.applyQuaternion(yaw);

		if (controls.isLocked) {
			if (moveUp) direction.y += 1;
			if (moveDown) direction.y -= 1;
		}

		velocity.add(movement.multiplyScalar(Settings.speed * delta));

		const newPosition = playerPosition.clone().add(velocity.clone().multiplyScalar(delta));

		// Handle collision
		if (previousPosition) {
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
				velocity.x = 0;
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
				velocity.z = 0;
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
				velocity.y = 0;
			}

			newPosition.copy(tempPosition);
		}

		playerPosition.copy(newPosition);
		controls.object.position.copy(playerPosition.clone().add(LocalPlayerController.CameraOffset));

		previousPosition = newPosition;
	});

	return controls;
};
