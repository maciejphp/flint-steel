import { World } from "../Modules/Terrain/World";
import { Vector3 } from "three";
import { RunService } from "./RunService";
import { settings } from "../Modules/Settings";
import { getChunkId, getChunkPosition, positionToId } from "../Modules/Functions";
import { Workspace } from "./Workspace";

class Class {
	private static instance: Class;
	World: World;

	constructor() {
		this.World = new World();
	}

	Start() {
		// const worldSize = 6;
		// for (let x = 0; x < worldSize; x++) {
		//   for (let z = 0; z < worldSize; z++) {
		//     this.World.GenerateChunk(new Vector3(x, 0, z));
		//   }
		// }

		RunService.RenderStepped.Connect(() => {
			const playerChunkPosition = getChunkPosition(Workspace.Camera.position.clone());

			// Generate new chunk
			const chunkPosition = getNearestUnloadedChunkPosition(playerChunkPosition.clone());
			if (chunkPosition) this.World.GenerateChunk(chunkPosition);

			// Onload far away chunk
			this.World.loadedChunks.forEach((chunk) => {
				const distance = chunk.chunkPosition.clone().sub(playerChunkPosition).length();
				if (distance > settings.chunkUnloadDistance) {
					this.World.DestroyChunk(chunk);
				}
			});

			// console.log(`chunk count: ${this.World.loadedChunks.length}`);
		});
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

function getNearestUnloadedChunkPosition(position: Vector3): Vector3 | undefined {
	const origin = position.clone();
	const visited = new Set();

	const directions = [
		new Vector3(1, 0, 0), // right
		new Vector3(0, 0, -1), // down
		new Vector3(-1, 0, 0), // left
		new Vector3(0, 0, 1), // up
	];

	let step = 1;
	let dx = 0;
	let dz = 0;

	// Check center first
	// const centerId = positionToId(origin);
	if (!WorldController.World.loadedChunks.get(getChunkId(origin.x, origin.z))?.generated) {
		// console.log("retuning cenetr");
		// console.log(WorldController.World.loadedChunks.get(origin), origin, WorldController.World.loadedChunks);
		return origin;
	}

	for (let radius = 1; radius <= settings.renderDistance; radius++) {
		for (let dirIndex = 0; dirIndex < 4; dirIndex++) {
			const dir = directions[dirIndex];

			// Move `step` times in this direction
			for (let i = 0; i < step; i++) {
				dx += dir.x;
				dz += dir.z;

				const checkPos = origin.clone().add(new Vector3(dx, 0, dz));
				const id = positionToId(checkPos);

				if (visited.has(id)) continue;
				visited.add(id);

				if (!WorldController.World.loadedChunks.get(getChunkId(checkPos.x, checkPos.z))?.generated) {
					return checkPos;
				}
			}

			// Every two directions, increase the step count (spiral grows)
			if (dirIndex % 2 === 1) {
				step++;
			}
		}
	}

	return undefined; // Nothing found
}

export const WorldController = Class.get();
