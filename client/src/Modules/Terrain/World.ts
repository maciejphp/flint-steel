import { getChunkId } from "../Functions";
import { Chunk } from "./Chunk";
import { Vector3 } from "three";
import "./BlockBreaking";
import { RunService } from "../../Controllers/RunService";
import { ServerController } from "../../Controllers/ServerController";

export class World {
	LoadedChunks = new Map<string, Chunk>();
	ChunkFetchQueue: Chunk[] = [];
	ChunkGenerateQueue: Chunk[] = [];
	ChunksThatAreGettingFetched = new Set<Chunk>();

	constructor() {
		// Fetch chunks
		RunService.Heartbeat.Connect(async () => {
			// Render 1 chunk at a time
			this.ChunkGenerateQueue.shift()?.Generate();

			// Fetch chunks
			if (this.ChunkFetchQueue.length === 0) return;

			this.ChunkFetchQueue.forEach((chunk) => this.ChunksThatAreGettingFetched.add(chunk));
			const chunkPositions = this.ChunkFetchQueue.map((chunk) => chunk.chunkPosition);
			this.ChunkFetchQueue = [];

			const fetchTime = Date.now();
			const [chunkData, success] = await ServerController.GetChunkData(chunkPositions);
			if (!success) {
				console.warn("Failed to fetch chunk data");
				return;
			}
			console.log(`Chunk fetch time: ${Date.now() - fetchTime}`);

			Object.entries(chunkData).forEach(([key, value]) => {
				const chunk = this.LoadedChunks.get(key);
				if (!chunk) return;
				chunk.blocks = value;
				chunk.fetched = true;
			});
		});

		// Handle block breaking & breaaking
		ServerController.Socket.on("updateBlock", (data) => {
			this.LoadedChunks.get(data.ChunkId)?.UpdateBlockFromPositionId(data.PositionId, data.BlockId);
		});
	}

	LoadChunk(position: Vector3): Chunk {
		// Create new "ghost" chunks
		const chunk = new Chunk(position);
		this.LoadedChunks.set(getChunkId(position.x, position.z), chunk);
		this.ChunkFetchQueue.push(chunk);
		chunk.insideFetchQueue = true;
		return chunk;
	}

	GenerateChunk(position: Vector3): void {
		// Generate with blocks
		const { x, z } = position;

		const getChunk = (x: number, z: number) => this.LoadedChunks.get(getChunkId(x, z));
		const ensureChunk = (x: number, z: number) => getChunk(x, z) ?? this.LoadChunk(new Vector3(x, 0, z));

		const chunk = getChunk(x, z) || this.LoadChunk(position.clone());

		// console.log("Generating chunk", position);

		chunk.chunkRight = ensureChunk(x + 1, z);
		chunk.chunkLeft = ensureChunk(x - 1, z);
		chunk.chunkFront = ensureChunk(x, z + 1);
		chunk.chunkBack = ensureChunk(x, z - 1);

		if (
			chunk.chunkRight.fetched &&
			chunk.chunkLeft.fetched &&
			chunk.chunkFront.fetched &&
			chunk.chunkBack.fetched
		) {
			this.ChunkGenerateQueue.push(chunk);
			chunk.generated = true;
		}
	}

	DestroyChunk(chunk: Chunk): void {
		this.LoadedChunks.delete(getChunkId(chunk.chunkPosition.x, chunk.chunkPosition.z));
		chunk.Destroy();
	}
}
