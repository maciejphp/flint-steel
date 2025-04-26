import express from "express";
import { Settings } from "./Settings.js";
import { createNoise3D } from "simplex-noise";

const router = express.Router();
const { chunkBlockHeight, chunkBlockWidth, blockSize } = Settings;
const noise = createNoise3D();

type Vector3 = { x: number; y: number; z: number };
type Vector2 = { x: number; z: number };

function getWorldBlockPosition(blockPosition: Vector3, chunkPosition: Vector2): Vector3 {
	const chunkWorldPosition = {
		x: chunkPosition.x * chunkBlockWidth * blockSize,
		z: chunkPosition.z * chunkBlockWidth * blockSize,
	};

	const localBlockPosition = {
		x: blockPosition.x * blockSize,
		y: blockPosition.y * blockSize,
		z: blockPosition.z * blockSize,
	};
	return {
		x: chunkWorldPosition.x + localBlockPosition.x,
		y: blockPosition.y * blockSize,
		z: chunkWorldPosition.z + localBlockPosition.z,
	};
}
export const getChunkId = (x: number, z: number): string => `${x},${z}`;

router.post("/getChunks", (req, res) => {
	const ChunkPositions = req.body.ChunkPositions as Vector2[];
	const ChunkData: Record<string, number[]> = {};

	ChunkPositions.forEach((chunkPosition) => {
		const blocks: number[] = [];
		for (let x = 0; x < chunkBlockWidth; x++) {
			for (let y = 0; y < chunkBlockHeight; y++) {
				for (let z = 0; z < chunkBlockWidth; z++) {
					const chunkBlockPosition = { x, y, z };
					const worldBlockPosition = getWorldBlockPosition(chunkBlockPosition, chunkPosition);
					blocks.push(generateBlock(worldBlockPosition));
				}
			}
		}
		// ChunkData.push(blocks);
		ChunkData[getChunkId(chunkPosition.x, chunkPosition.z)] = blocks;
	});

	res.send({ ChunkData });
});

function generateBlock(position: Vector3): number {
	const { x, y, z } = position;

	const scale = 400;
	let noiseValue = noise(x / scale, y / scale, z / scale);

	noiseValue -= y / chunkBlockHeight / 10;
	noiseValue += chunkBlockHeight / y;

	if (noiseValue > 0.05) {
		return Math.round(Math.random() * 2 + 1);
	} else {
		return 0;
	}
}

export default router;
