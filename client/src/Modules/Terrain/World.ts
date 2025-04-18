import { positionToId, xyzToId } from "../Functions";
import { Chunk } from "./Chunk";
import { Vector3 } from "three";
import "./BlockBreaking";
import { settings } from "../Settings";

const { blockSize, chunkBlockWidth } = settings;

export class World {
	loadedChunks: Chunk[] = [];

	LoadChunk(position: Vector3): Chunk {
		// Create new "ghost" chunks
		const chunk = new Chunk(position);
		this.loadedChunks[positionToId(position)] = chunk;
		return chunk;
	}

	GenerateChunk(position: Vector3): void {
		// Generate with blocks
		const { x, z } = position;

		const chunk = this.loadedChunks[xyzToId(x, 0, z)] || this.LoadChunk(position.clone());

		chunk.chunkRight = this.loadedChunks[xyzToId(x + 1, 0, z)] || this.LoadChunk(position.clone().setX(x + 1));
		chunk.chunkLeft = this.loadedChunks[xyzToId(x - 1, 0, z)] || this.LoadChunk(position.clone().setX(x - 1));

		chunk.chunkFront = this.loadedChunks[xyzToId(x, 0, z + 1)] || this.LoadChunk(position.clone().setZ(z + 1));

		chunk.chunkBack = this.loadedChunks[xyzToId(x, 0, z - 1)] || this.LoadChunk(position.clone().setZ(z - 1));

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
		chunk.Destroy();
	}

	DestroyBlock(blockPosition: Vector3): void {
		let chunkPosition = blockPosition.clone().divideScalar(chunkBlockWidth * blockSize);
		chunkPosition = new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));

		const chunk = this.loadedChunks[positionToId(chunkPosition)];
		chunk?.DestroyBlock(blockPosition);
	}

	PlaceBlock(blockPosition: Vector3): void {
		let chunkPosition = blockPosition.clone().divideScalar(chunkBlockWidth * blockSize);
		chunkPosition = new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));

		const chunk = this.loadedChunks[positionToId(chunkPosition)];
		chunk?.PlaceBlock(blockPosition);
	}
}
