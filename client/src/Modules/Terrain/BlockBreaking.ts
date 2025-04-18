import { Raycaster, Vector2, Vector3 } from "three";
import { Workspace } from "../../Controllers/Workspace";
import { settings } from "../Settings";
import { WorldController } from "../../Controllers/WorldController";

const { blockSize } = settings;

const raycaster = new Raycaster();

window.addEventListener("mousedown", (e) => {
	switch (e.button) {
		case 0: // Left button clicked.
			{
				raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
				const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

				if (ray && ray.distance < 200) {
					if (!ray.normal) return;
					let blockPosition = ray.point
						.add(ray.normal.multiply(new Vector3(-1, -1, -1)))
						.divideScalar(blockSize);

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					).multiplyScalar(blockSize);

					WorldController.World.DestroyBlock(blockPosition);
				}
			}
			break;
		case 2: // Right button clicked
			{
				raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
				const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

				if (ray && ray.distance < 200) {
					if (!ray.normal) return;
					let blockPosition = ray.point.add(ray.normal).divideScalar(blockSize);

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					).multiplyScalar(blockSize);

					WorldController.World.PlaceBlock(blockPosition);
				}
			}
			break;
	}
});
