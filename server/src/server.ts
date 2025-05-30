import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIO } from "socket.io";

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://flint-steel.vercel.app"];

dotenv.config();
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new SocketIO(server, {
	cors: {
		origin: function (origin, callback) {
			// Allow requests with no origin (like curl or mobile apps)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error(`CORS not allowed origin: ${origin}`));
			}
		},
		credentials: true,
	},
});

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like curl or mobile apps)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error(`CORS not allowed origin: ${origin}`));
			}
		},
		credentials: true,
	}),
);

app.set("trust proxy", 1);
app.use(express.json());

import { WorldService } from "./Services/WorldService.js";
import { getChunkId, query } from "./Functions.js";
import worldApi from "./worldApi.js";
app.use("/world", worldApi);

import uploadBlockApi from "./uploadBlockApi.js";
app.use("/", uploadBlockApi);

import getFlipbookApi from "./getFlipbookApi.js";
app.use("/", getFlipbookApi);

import adminApi from "./adminApi.js";
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
						WorldService.BlockUses[chunk[PositionId]] = Math.max(
							(WorldService.BlockUses[chunk[PositionId]] || 0) - 1,
							0,
						);
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

// Ensure the server listens on the correct port
server.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
