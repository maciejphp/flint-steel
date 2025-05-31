import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = ServerService.App;
const io = ServerService.Io;

app.set("trust proxy", 1);
app.use(express.json());

import { WorldService } from "./Services/WorldService.js";
import { getChunkId, query } from "./Functions.js";
import worldApi from "./worldApi.js";
app.use("/world", worldApi);

import uploadBlockApi from "./uploadBlockApi.js";
app.use("/", uploadBlockApi);

import getatlasTextureApi from "./getatlasTextureApi.js";
app.use("/", getatlasTextureApi);

import adminApi from "./adminApi.js";
import { ServerService } from "./Services/ServerService.js";
app.use("/admin", adminApi);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/backup", async (req, res) => {
	const [result] = await query("SELECT * FROM blocks; SELECT * FROM chunks;", []);
	res.json(result);
});

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });

io.on("connection", (socket) => {
	socket.on("updateBlock", async (data: { ChunkPosition: Vector2; PositionId: number; BlockId: number }[]) => {
		console.log("updateBlock", data.length);
		data.forEach(async (blockData, index) => {
			const { ChunkPosition, PositionId, BlockId } = blockData;
			const chunk = await WorldService.GetChunk(ChunkPosition);
			console.log(PositionId, index);

			if (chunk && chunk[PositionId] !== undefined) {
				const chunkId = getChunkId(ChunkPosition.x, ChunkPosition.z);

				// Store the uses of the block in the database
				if (chunk[PositionId] === 0) {
					// placing a block
					WorldService.BlockUses[BlockId] = (WorldService.BlockUses[BlockId] || 0) + 1;
				} else {
					// removing a block
					const brokenBlockId = chunk[PositionId];
					if (brokenBlockId > 2) {
						// Only remove the block if it's not air or a natural block
						WorldService.BlockUses[chunk[PositionId]] -= 1;
					}
				}

				chunk[PositionId] = BlockId;
				WorldService.LoadedChunks[chunkId] = chunk;
				WorldService.ModifiedChunks[chunkId] = chunk;
			} else {
				console.warn("Invalid chunk or position:", ChunkPosition, PositionId);
			}
		});
		io.emit("updateBlock", data);
	});

	console.log("a user connected");
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});
