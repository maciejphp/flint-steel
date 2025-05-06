import express from "express";
import { WorldService } from "./Services/WorldService.js";
import { getChunkId } from "./Functions.js";

const router = express.Router();

router.post("/getChunks", async (req, res) => {
	const ChunkPositions = req.body.ChunkPositions as Vector2[];
	const ChunkData: Record<string, number[]> = {};

	await Promise.all(
		ChunkPositions.map(async (chunkPosition) => {
			ChunkData[getChunkId(chunkPosition.x, chunkPosition.z)] = await WorldService.GetChunk(chunkPosition);
		}),
	);

	res.send({ ChunkData });
});

export default router;
