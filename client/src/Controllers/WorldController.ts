import { World } from "../Modules/Terrain/World";
import { Vector3 } from "three";
import { RunService } from "./RunService";
import { Settings } from "../Modules/Settings";
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
		// 	for (let z = 0; z < worldSize; z++) {
		// 		this.World.GenerateChunk(new Vector3(x, 0, z));
		// 	}
		// }

		// Gather chunks to generate
		RunService.RenderStepped.Connect(() => {
			const playerChunkPosition = getChunkPosition(Workspace.Camera.position.clone());
			// Generate new chunk
			fetchNearestChunks(playerChunkPosition);

			// Onload far away chunk
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

function fetchNearestChunks(center: Vector3): void {
	const minX = center.x - Settings.renderDistance;
	const maxX = center.x + Settings.renderDistance;
	const minZ = center.z - Settings.renderDistance;
	const maxZ = center.z + Settings.renderDistance;

	for (let x = minX; x <= maxX; x += 1) {
		for (let z = minZ; z <= maxZ; z += 1) {
			const distance = Math.sqrt((center.x - x) ** 2 + (center.z - z) ** 2);
			if (distance > Settings.renderDistance) continue;

			// positions.push(new Vector3(x, center.y, z));
			const chunk = WorldController.World.LoadedChunks.get(getChunkId(x, z));
			// console.log("chunk", chunk);
			// if (chunk === undefined || (chunk.fetched && !chunk.generated)) return origin;

			if (chunk === undefined || (chunk.fetched && !chunk.generated)) {
				WorldController.World.GenerateChunk(new Vector3(x, 0, z));
			}
		}
	}

	// return positions;

	// const visited = new Set();

	// const directions = [
	// 	new Vector3(1, 0, 0), // right
	// 	new Vector3(0, 0, -1), // down
	// 	new Vector3(-1, 0, 0), // left
	// 	new Vector3(0, 0, 1), // up
	// ];

	// let step = 1;
	// let dx = 0;
	// let dz = 0;

	// // Check center first
	// // const centerId = positionToId(origin);
	// const chunk = WorldController.World.LoadedChunks.get(getChunkId(origin.x, origin.z));
	// // console.log("chunk", chunk);
	// if (chunk === undefined || (chunk.fetched && !chunk.generated)) return origin;

	// for (let Settings.renderDistance; = 1; Settings.renderDistance; <= Settings.renderDistance; Settings.renderDistance;++) {
	// 	for (let dirIndex = 0; dirIndex < 4; dirIndex++) {
	// 		const dir = directions[dirIndex];

	// 		// Move `step` times in this direction
	// 		for (let i = 0; i < step; i++) {
	// 			dx += dir.x;
	// 			dz += dir.z;

	// 			const checkPos = origin.clone().add(new Vector3(dx, 0, dz));
	// 			const id = positionToId(checkPos);

	// 			if (visited.has(id)) continue;
	// 			visited.add(id);

	// 			const chunk = WorldController.World.LoadedChunks.get(getChunkId(checkPos.x, checkPos.z));
	// 			if (chunk === undefined || (chunk.fetched && !chunk.generated)) return checkPos;
	// 		}

	// 		// Every two directions, increase the step count (spiral grows)
	// 		if (dirIndex % 2 === 1) {
	// 			step++;
	// 		}
	// 	}
	// }

	// return undefined; // Nothing found
}

export const WorldController = Class.get();
