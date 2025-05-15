import express from "express";
import { WorldService } from "./Services/WorldService.js";

const router = express.Router();

router.post("/getChunks", async (req, res) => {
	try {
		const ChunkPositions = req.body.ChunkPositions as Vector2[];
		const fetchTime = Date.now();

		const chunkData = await WorldService.GetChunks(ChunkPositions);

		console.log(`Chunk fetch time: ${Date.now() - fetchTime}`);

		res.send({ ChunkData: chunkData });
	} catch (error) {
		console.error("Error in getChunks:", error);
		res.status(500).send("Internal Server Error");
		return;
	}
});

export default router;
