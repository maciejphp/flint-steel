import { getChunkId } from "../Functions";
import { Chunk } from "./Chunk";
import { Vector3 } from "three";
import "./BlockBreaking";
import { settings } from "../Settings";

const { blockSize, chunkBlockWidth } = settings;

export class World {
	loadedChunks = new Map<string, Chunk>();

	LoadChunk(position: Vector3): Chunk {
		// Create new "ghost" chunks
		const chunk = new Chunk(position);
		this.loadedChunks.set(getChunkId(position.x, position.z), chunk);
		// this.loadedChunks[positionToId(position)] = chunk;
		return chunk;
	}

	GenerateChunk(position: Vector3): void {
		// Generate with blocks
		const { x, z } = position;

		const getChunk = (x: number, z: number) => this.loadedChunks.get(getChunkId(x, z));

		const chunk = getChunk(x, z) || this.LoadChunk(position.clone());

		chunk.chunkRight = getChunk(x + 1, z) || this.LoadChunk(position.clone().setX(x + 1));
		chunk.chunkLeft = getChunk(x - 1, z) || this.LoadChunk(position.clone().setX(x - 1));

		chunk.chunkFront = getChunk(x, z + 1) || this.LoadChunk(position.clone().setZ(z + 1));
		chunk.chunkBack = getChunk(x, z - 1) || this.LoadChunk(position.clone().setZ(z - 1));

		chunk.Generate();
	}

	//   unloadChunk(chunkPosition: Vector3) {
	//     const unloadedChunk =
	//       this.loadedChunks[xyzToId(chunkPosition.X, 0, chunkPosition.Z)];

	//     unloadedChunk.unloadBlocks();
	//     unloadedChunk.blockFolder.Destroy();
	//     unloadedChunk.blocks = [];

	//     // Delete chunk to allow garbage collection
	//     this.loadedChunks.forEach((chunk) => {
	//         chunk.chunkRight = undefined;
	//         chunk.chunkLeft = undefined;
	//         chunk.chunkFront = undefined;
	//         chunk.chunkBack = undefined;
	//       }
	//     });

	//     delete this.loadedChunks[positionToId(chunkPosition)];
	//     collectgarbage("count");
	//   }
	DestroyChunk(chunk: Chunk): void {
		this.loadedChunks.delete(getChunkId(chunk.chunkPosition.x, chunk.chunkPosition.z));
		chunk.Destroy();
	}

	DestroyBlock(blockPosition: Vector3): void {
		let chunkPosition = blockPosition.clone().divideScalar(chunkBlockWidth * blockSize);
		chunkPosition = new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));

		const chunk = this.loadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
		chunk?.DestroyBlock(blockPosition);
	}

	PlaceBlock(blockPosition: Vector3): void {
		let chunkPosition = blockPosition.clone().divideScalar(chunkBlockWidth * blockSize);
		chunkPosition = new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));

		// const chunk = this.loadedChunks[positionToId(chunkPosition)];
		const chunk = this.loadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
		chunk?.PlaceBlock(blockPosition);
	}
}
