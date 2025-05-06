import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIO } from "socket.io";

const allowedOrigins = ["https://m.machat.workers.dev", "http://localhost:5173", "http://localhost:5174"];

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

import worldApi from "./worldApi.js";
import { WorldService } from "./Services/WorldService.js";
import { getChunkId } from "./Functions.js";
app.use("/world", worldApi);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });

io.on("connection", (socket) => {
	socket.on("updateBlock", async (data: { ChunkPosition: Vector2; PositionId: number; BlockId: number }) => {
		const { ChunkPosition, PositionId, BlockId } = data;
		const chunk = await WorldService.GetChunk(ChunkPosition);
		if (chunk && chunk[PositionId] !== undefined) {
			const chunkId = getChunkId(ChunkPosition.x, ChunkPosition.z);
			chunk[data.PositionId] = BlockId;
			WorldService.ModifiedChunks[chunkId] = chunk;
			io.emit("updateBlock", { ChunkId: chunkId, PositionId, BlockId });
		}
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
