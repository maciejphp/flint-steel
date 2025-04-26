import { ImprovedNoise } from "three/examples/jsm/Addons.js";
import { xyzToId } from "../Functions";
import { Settings } from "../Settings";
import { Vector3 } from "three";

const { chunkBlockHeight, chunkBlockWidth } = Settings;

const perlin = new ImprovedNoise();

export function generateBlock(position: Vector3): number {
	const { x, y, z } = position;

	//   math.randomseed(positionToId(position));
	const scale = 400; //80
	let noiseValue = perlin.noise(x / scale, y / scale, z / scale);

	noiseValue -= y / Settings.chunkBlockHeight / 10;
	noiseValue += Settings.chunkBlockHeight / y;

	// console.log(x, y, z, noiseValue);

	// if (noiseValue > 0.05 || y === 0 || y === topBlock) {
	if (noiseValue > 0.05) {
		// math.randomseed(positionToId(position));

		// let block;

		// ores.forEach((ore) => {
		//   if (math.random() < ore.spawnChance) {
		//     block = new ore.class(position);
		//     return;
		//   }
		// });

		// return block || new blocks.Gradient(position);
		return Math.round(Math.random() * 2 + 1);
	} else {
		// return new Air(position);
		return 0;
	}
}

export function getNeightborBlocks(chunk: ChunkType, chunkBlockPosition: Vector3): number[] {
	const blocks = chunk.blocks;
	const { x, y, z } = chunkBlockPosition;
	const neighborBlocks: number[] = [];

	const blockRight =
		x + 1 === chunkBlockWidth ? chunk.chunkRight?.blocks[xyzToId(0, y, z)] : blocks[xyzToId(x + 1, y, z)];
	if (blockRight) neighborBlocks.push(blockRight);

	const blockLeft =
		x === 0 ? chunk.chunkLeft?.blocks[xyzToId(chunkBlockWidth - 1, y, z)] : blocks[xyzToId(x - 1, y, z)];
	if (blockLeft) neighborBlocks.push(blockLeft);

	const blockFront =
		z + 1 === chunkBlockWidth ? chunk.chunkFront?.blocks[xyzToId(x, y, z)] : blocks[xyzToId(x, y, z + 1)];
	if (blockFront) neighborBlocks.push(blockFront);

	const blockBack =
		z === 0 ? chunk.chunkBack?.blocks[xyzToId(x, y, chunkBlockWidth - 1)] : blocks[xyzToId(x, y, z - 1)];
	if (blockBack) neighborBlocks.push(blockBack);

	if (y !== chunkBlockHeight - 1) {
		neighborBlocks.push(blocks[xyzToId(x, y + 1, z)]);
	}
	if (y !== 0) {
		neighborBlocks.push(blocks[xyzToId(x, y - 1, z)]);
	}
	return neighborBlocks;
}
