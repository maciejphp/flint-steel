import { Workspace } from "../Controllers/Workspace";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { RunService } from "../Controllers/RunService";
import { Vector3, Raycaster } from "three";

export default (): void => {
	const controls = new PointerLockControls(Workspace.Camera, document.body);
	let moveForward = false;
	let moveBackward = false;
	let moveLeft = false;
	let moveRight = false;
	let canJump = false;

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
				if (canJump === true) velocity.y += 350;
				canJump = false;
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
		}
	};

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);
	const velocity = new Vector3();
	const direction = new Vector3();

	RunService.RenderStepped.Connect((delta) => {
		if (controls.isLocked === true) {
			raycaster.ray.origin.copy(controls.object.position);
			raycaster.ray.origin.y -= 10;

			const intersections = raycaster.intersectObjects(Workspace.Scene.children, false);

			const onObject = intersections.length > 0;

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			direction.z = Number(moveForward) - Number(moveBackward);
			direction.x = Number(moveRight) - Number(moveLeft);
			direction.normalize(); // this ensures consistent movements in all directions

			if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
			if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

			if (onObject === true) {
				velocity.y = Math.max(0, velocity.y);
				canJump = true;
			}

			controls.moveRight(-velocity.x * delta);
			controls.moveForward(-velocity.z * delta);

			controls.object.position.y += velocity.y * delta; // new behavior

			if (controls.object.position.y < 10) {
				velocity.y = 0;
				controls.object.position.y = 10;

				canJump = true;
			}
		}
	});
};
