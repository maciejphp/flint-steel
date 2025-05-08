import { Workspace } from "../Controllers/Workspace";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { RunService } from "../Controllers/RunService";
import { Euler, Quaternion, Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export default (): PointerLockControls => {
	const controls = new PointerLockControls(Workspace.Camera, document.body);
	let moveForward = false;
	let moveBackward = false;
	let moveLeft = false;
	let moveRight = false;
	let moveUp = false;
	let moveDown = false;

	const blocker = document.getElementById("blocker") as HTMLDivElement;
	const instructions = document.getElementById("instructions") as HTMLDivElement;

	instructions.addEventListener("click", function () {
		controls.lock();
	});

	controls.addEventListener("lock", function () {
		instructions.style.display = "none";
		blocker.style.display = "none";
	});

	controls.addEventListener("unlock", function () {
		blocker.style.display = "block";
		instructions.style.display = "";
	});

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
	const direction = new Vector3();

	const Settings = {
		speed: 500,
		friction: 8,
	};

	const gui = new GUI();
	gui.add(Settings, "speed", 1, 2000, 1);

	RunService.RenderStepped.Connect((delta) => {
		if (controls.isLocked === true) {
			velocity.multiplyScalar(1 - Settings.friction * delta); // friction value

			// Step 1: Create direction vector (horizontal only — Y will be added separately if needed)
			direction
				.set(Number(moveRight) - Number(moveLeft), 0, Number(moveBackward) - Number(moveForward))
				.normalize();

			// Step 2: Get the camera's yaw (horizontal rotation only)
			const euler = new Euler(0, 0, 0, "YXZ");
			euler.setFromQuaternion(controls.object.quaternion);
			const yaw = new Quaternion().setFromEuler(new Euler(0, euler.y, 0));

			// Step 3: Apply yaw-only rotation to direction
			const movement = direction.applyQuaternion(yaw);

			// Step 4: Add Y movement separately
			if (moveUp) direction.y += 1;
			if (moveDown) direction.y -= 1;

			velocity.add(movement.multiplyScalar(Settings.speed * delta));
			controls.object.position.add(velocity.clone().multiplyScalar(delta));
		}
	});

	return controls;
};
