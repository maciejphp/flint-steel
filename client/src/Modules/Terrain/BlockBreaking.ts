import { Raycaster, Vector2, Vector3 } from "three";
import { Workspace } from "../../Controllers/Workspace";
import { WorldController } from "../../Controllers/WorldController";
import { ServerController } from "../../Controllers/ServerController";
import { getChunkBlockPosition, getChunkId, getChunkPosition, positionToId } from "../Functions";
import { ControllerService } from "../ControllerService";

const LocalPlayerController = ControllerService.GetController("LocalPlayerController");

const raycaster = new Raycaster();

window.addEventListener("mousedown", (e) => {
	if (!LocalPlayerController.Controls.isLocked) return;

	switch (e.button) {
		case 0: // Left button clicked.
			{
				raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
				const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

				if (ray && ray.distance < 8) {
					if (!ray.normal) return;
					let blockPosition = ray.point.add(ray.normal.multiply(new Vector3(-0.5, -0.5, -0.5)));

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					);
					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						chunk.UpdateBlockFromPositionId(
							positionToId(getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone())),
							0,
						);

						ServerController.Socket.emit("updateBlock", {
							ChunkPosition: { x: chunkPosition.x, z: chunkPosition.z },
							PositionId: positionToId(
								getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone()),
							),
							BlockId: 0,
						});
					}
				}
			}
			break;
		case 2: // Right button clicked
			{
				raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
				const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

				if (ray && ray.distance < 8) {
					if (!ray.normal) return;
					let blockPosition = ray.point.add(ray.normal.multiplyScalar(0.5));
					const block = LocalPlayerController.SelectedBlock;

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					);

					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						chunk.UpdateBlockFromPositionId(
							positionToId(getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone())),
							block.Id,
						);

						ServerController.Socket.emit("updateBlock", {
							ChunkPosition: { x: chunkPosition.x, z: chunkPosition.z },
							PositionId: positionToId(
								getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone()),
							),
							BlockId: block.Id,
						});
					}
				}
			}
			break;
	}
});
