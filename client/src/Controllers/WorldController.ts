import { World } from "../Modules/Terrain/World";
import { Vector3 } from "three";
import { RunService } from "./RunService";
import { Settings } from "../Modules/Settings";
import { getChunkId, getChunkPosition } from "../Modules/Functions";
import { Workspace } from "./Workspace";

class Class {
	private static instance: Class;
	World: World;

	constructor() {
		this.World = new World();
	}

	Start() {
		// Gather chunks to generate
		RunService.Heartbeat.Connect(() => {
			const playerChunkPosition = getChunkPosition(Workspace.Camera.position.clone());
			// Generate new chunk
			fetchNearestChunks(playerChunkPosition);

			// Unload far away chunk
			this.World.LoadedChunks.forEach((chunk) => {
				const distance = chunk.chunkPosition.clone().sub(playerChunkPosition).length();
				if (distance > Settings.chunkUnloadDistance) {
					this.World.DestroyChunk(chunk);
				}
			});
			// console.log(`chunk count: ${this.World.LoadedChunks.length}`);
		});
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}
export const WorldController = Class.get();

function fetchNearestChunks(center: Vector3): void {
	const minX = center.x - Settings.renderDistance;
	const maxX = center.x + Settings.renderDistance;
	const minZ = center.z - Settings.renderDistance;
	const maxZ = center.z + Settings.renderDistance;

	for (let x = minX; x <= maxX; x += 1) {
		for (let z = minZ; z <= maxZ; z += 1) {
			const distance = Math.sqrt((center.x - x) ** 2 + (center.z - z) ** 2);
			if (distance > Settings.renderDistance) continue;

			const chunk = WorldController.World.LoadedChunks.get(getChunkId(x, z));

			if (chunk === undefined || (chunk.fetched && !chunk.generated)) {
				WorldController.World.GenerateChunk(new Vector3(x, 0, z));
			}
		}
	}
}
