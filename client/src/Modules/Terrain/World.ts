import { positionToId, xyzToId } from "../Functions";
import { Chunk } from "./Chunk";
import { Vector3 } from "three";

export class World {
  loadedChunks: Chunk[] = [];

  loadChunk(position: Vector3): Chunk {
    // Create new "ghost" chunks
    const chunk = new Chunk(position);
    this.loadedChunks[positionToId(position)] = chunk;
    return chunk;
  }

  generateChunk(position: Vector3): void {
    // Generate with blocks
    const { x, z } = position;

    const chunk =
      this.loadedChunks[xyzToId(x, 0, z)] || this.loadChunk(position.clone());

    chunk.chunkRight =
      this.loadedChunks[xyzToId(x + 1, 0, z)] ||
      this.loadChunk(position.clone().setX(x + 1));
    chunk.chunkLeft =
      this.loadedChunks[xyzToId(x - 1, 0, z)] ||
      this.loadChunk(position.clone().setX(x - 1));

    chunk.chunkFront =
      this.loadedChunks[xyzToId(x, 0, z + 1)] ||
      this.loadChunk(position.clone().setZ(z + 1));

    chunk.chunkBack =
      this.loadedChunks[xyzToId(x, 0, z - 1)] ||
      this.loadChunk(position.clone().setZ(z - 1));

    chunk.generateBlocks();
  }

  //   unloadChunk(chunkPosition: Vector3) {
  //     const unloadedChunk =
  //       this.loadedChunks[xyzToId(chunkPosition.X, 0, chunkPosition.Z)];

  //     unloadedChunk.unloadBlocks();
  //     unloadedChunk.blockFolder.Destroy();
  //     unloadedChunk.blocks = [];

  //     // Delete chunk to allow garbage collection
  //     this.loadedChunks.forEach((chunk) => {
  //       if (chunk.chunkRight === unloadedChunk) {
  //         chunk.chunkRight = undefined;
  //       } else if (chunk.chunkLeft === unloadedChunk) {
  //         chunk.chunkLeft = undefined;
  //       } else if (chunk.chunkFront === unloadedChunk) {
  //         chunk.chunkFront = undefined;
  //       } else if (chunk.chunkBack === unloadedChunk) {
  //         chunk.chunkBack = undefined;
  //       }
  //     });

  //     delete this.loadedChunks[positionToId(chunkPosition)];
  //     collectgarbage("count");
  //   }

  //   destroyBlock(blockPosition: Vector3) {
  //     let chunkPosition = blockPosition.div(
  //       settings.chunkBlockWidth * settings.blockSize
  //     );
  //     chunkPosition = new Vector3(
  //       math.floor(chunkPosition.X),
  //       0,
  //       math.floor(chunkPosition.Z)
  //     );

  //     //Check if chunk is loaded
  //     const chunk = this.loadedChunks[positionToId(chunkPosition)];
  //     if (chunk) {
  //       chunk.destroyBlock(blockPosition);
  //     }
  //   }
}
