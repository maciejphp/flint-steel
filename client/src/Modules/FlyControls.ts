import { Workspace } from "../Controllers/Workspace";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { RunService } from "../Controllers/RunService";
import { Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export default (): void => {
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

	const onKeyDown = function (event: KeyboardEvent) {
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
	};

	const onKeyUp = function (event: KeyboardEvent) {
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
	};

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	const velocity = new Vector3();
	const direction = new Vector3();
	const movement = new Vector3();

	const settings = {
		speed: 1500,
	};

	const gui = new GUI();
	gui.add(settings, "speed", 10, 4000, 1);

	RunService.RenderStepped.Connect((delta) => {
		if (controls.isLocked === true) {
			velocity.multiplyScalar(1 - 10 * delta); // friction value

			direction
				.set(
					Number(moveRight) - Number(moveLeft),
					Number(moveUp) - Number(moveDown),
					Number(moveBackward) - Number(moveForward),
				)
				.normalize();

			movement.copy(direction).applyQuaternion(controls.object.quaternion);
			velocity.add(movement.multiplyScalar(settings.speed * delta));
			controls.object.position.add(velocity.clone().multiplyScalar(delta));
		}
	});
};
