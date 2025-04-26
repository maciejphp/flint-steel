import { Raycaster, Vector2, Vector3 } from "three";
import { Workspace } from "../../Controllers/Workspace";
import { Settings } from "../Settings";
import { WorldController } from "../../Controllers/WorldController";
import { ServerController } from "../../Controllers/ServerController";
import { getChunkBlockPosition, getChunkId, getChunkPosition } from "../Functions";

const { blockSize } = Settings;

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

					// WorldController.World.DestroyBlock(blockPosition);
					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						// chunk?.DestroyBlock(blockPosition);
						ServerController.Socket.emit("breakBlock", {
							ChunkId: getChunkId(chunkPosition.x, chunkPosition.z),
							BlockPosition: { x: blockPosition.x, y: blockPosition.y, z: blockPosition.z },
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
					let blockPosition = ray.point.add(ray.normal).divideScalar(blockSize);

					blockPosition = new Vector3(
						Math.round(blockPosition.x),
						Math.round(blockPosition.y),
						Math.round(blockPosition.z),
					).multiplyScalar(blockSize);

					const chunkPosition = getChunkPosition(blockPosition.clone());
					const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
					if (chunk) {
						console.log("Placing block", chunk.blocks);
						// WorldController.World.PlaceBlock(blockPosition);
						ServerController.Socket.emit("placeBlock", {
							ChunkId: getChunkId(chunkPosition.x, chunkPosition.z),
							BlockPosition: { x: blockPosition.x, y: blockPosition.y, z: blockPosition.z },
						});
					}
				}
			}
			break;
	}
});
