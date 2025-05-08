import { xyzToId } from "../Functions";
import { Settings } from "../Settings";
import { Vector3 } from "three";

const { ChunkBlockHeight, ChunkBlockWidth } = Settings;

export function getNeightborBlocks(chunk: ChunkType, chunkBlockPosition: Vector3): number[] {
	const blocks = chunk.blocks;
	const { x, y, z } = chunkBlockPosition;
	const neighborBlocks: number[] = [];

	const blockRight =
		x + 1 === ChunkBlockWidth ? chunk.chunkRight?.blocks[xyzToId(0, y, z)] : blocks[xyzToId(x + 1, y, z)];
	if (blockRight) neighborBlocks.push(blockRight);

	const blockLeft =
		x === 0 ? chunk.chunkLeft?.blocks[xyzToId(ChunkBlockWidth - 1, y, z)] : blocks[xyzToId(x - 1, y, z)];
	if (blockLeft) neighborBlocks.push(blockLeft);

	const blockFront =
		z + 1 === ChunkBlockWidth ? chunk.chunkFront?.blocks[xyzToId(x, y, z)] : blocks[xyzToId(x, y, z + 1)];
	if (blockFront) neighborBlocks.push(blockFront);

	const blockBack =
		z === 0 ? chunk.chunkBack?.blocks[xyzToId(x, y, ChunkBlockWidth - 1)] : blocks[xyzToId(x, y, z - 1)];
	if (blockBack) neighborBlocks.push(blockBack);

	if (y !== ChunkBlockHeight - 1) {
		neighborBlocks.push(blocks[xyzToId(x, y + 1, z)]);
	}
	if (y !== 0) {
		neighborBlocks.push(blocks[xyzToId(x, y - 1, z)]);
	}
	return neighborBlocks;
}
