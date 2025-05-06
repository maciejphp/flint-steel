import { Raycaster, Vector2, Vector3 } from "three";
import { Workspace } from "../../Controllers/Workspace";
import { Settings } from "../Settings";
import { WorldController } from "../../Controllers/WorldController";
import { ServerController } from "../../Controllers/ServerController";
import { getChunkBlockPosition, getChunkId, getChunkPosition, positionToId } from "../Functions";

const { BlockSize } = Settings;

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
						.divideScalar(BlockSize);

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					).multiplyScalar(BlockSize);

					WorldController.World.DestroyBlock(blockPosition);
					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						// chunk?.DestroyBlock(blockPosition);
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

				if (ray && ray.distance < 200) {
					if (!ray.normal) return;
					let blockPosition = ray.point.add(ray.normal).divideScalar(BlockSize);

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					).multiplyScalar(BlockSize);

					WorldController.World.PlaceBlock(blockPosition);
					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						// chunk?.DestroyBlock(blockPosition);
						ServerController.Socket.emit("updateBlock", {
							ChunkPosition: { x: chunkPosition.x, z: chunkPosition.z },
							PositionId: positionToId(
								getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone()),
							),
							BlockId: 4,
						});

						console.log("place");
					}
				}
			}
			break;
	}
});
