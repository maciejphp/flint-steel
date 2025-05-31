import { getChunkId, idToPosition } from "../Functions";
import { Chunk } from "./Chunk";
import { Vector3 } from "three";
import { Settings } from "../Settings";
import { ControllerService } from "../ControllerService";

const { ChunkBlockWidth } = Settings;

export class World {
	LoadedChunks = new Map<string, Chunk>();
	ChunkFetchQueue: Chunk[] = [];
	ChunkGenerateQueue: Chunk[] = [];
	ChunksThatAreGettingFetched = new Set<Chunk>();
	TextureSettings: TextureSettings;

	constructor(textureSettings: TextureSettings) {
		const ServerController = ControllerService.Get("ServerController");
		const RunService = ControllerService.Get("RunService");
		this.TextureSettings = textureSettings;

		// Render 1 chunk at a time
		RunService.Heartbeat.Connect(async () => {
			this.ChunkGenerateQueue.shift()?.Generate();
		});

		// Fetch chunks every second
		setInterval(async () => {
			// Fetch chunks
			if (this.ChunkFetchQueue.length === 0) return;

			this.ChunkFetchQueue.forEach((chunk) => this.ChunksThatAreGettingFetched.add(chunk));
			const chunkPositions = this.ChunkFetchQueue.map((chunk) => chunk.chunkPosition);
			this.ChunkFetchQueue = [];

			const [chunkData, success] = await ServerController.GetChunkData(chunkPositions);
			if (!success) {
				console.warn("Failed to fetch chunk data");
				return;
			}

			Object.entries(chunkData).forEach(([key, value]) => {
				const chunk = this.LoadedChunks.get(key);
				if (!chunk) return;
				chunk.blocks = value;
				chunk.fetched = true;
			});
		}, 1000);

		// Handle block breaking & breaking
		ServerController.Socket.on(
			"updateBlock",
			(data: { ChunkPosition: { x: number; z: number }; PositionId: number; BlockId: number }[]) => {
				this.UpdateBlocks(
					data.map((blockData) => {
						const { ChunkPosition, PositionId, BlockId } = blockData;
						return {
							ChunkPosition: new Vector3(ChunkPosition.x, 0, ChunkPosition.z),
							PositionId,
							BlockId,
						};
					}),
				);
			},
		);
	}

	UpdateBlocks(blocks: { ChunkPosition: Vector3; PositionId: number; BlockId: number }[]): void {
		const updatedChunks = new Map<Chunk, Vector3>();

		blocks.forEach((blockData) => {
			const { ChunkPosition, PositionId, BlockId } = blockData;
			const chunk = this.LoadedChunks.get(getChunkId(ChunkPosition.x, ChunkPosition.z));
			if (chunk) {
				chunk.blocks[PositionId] = BlockId;
				updatedChunks.set(chunk, idToPosition(PositionId));
			}
		});

		console.log("chunks:", updatedChunks.size, "blocks:", blocks.length);

		updatedChunks.forEach((ChunkBlockPosition, Chunk) => {
			if (!Chunk.mesh) return;
			Chunk.Generate();

			if (ChunkBlockPosition.x === 0 && Chunk.chunkLeft?.generated) Chunk.chunkLeft.Generate();
			else if (ChunkBlockPosition.x === ChunkBlockWidth - 1 && Chunk.chunkRight?.generated)
				Chunk.chunkRight.Generate();
			if (ChunkBlockPosition.z === 0 && Chunk.chunkBack?.generated) Chunk.chunkBack.Generate();
			else if (ChunkBlockPosition.z === ChunkBlockWidth - 1 && Chunk.chunkFront?.generated)
				Chunk.chunkFront.Generate();
		});
	}

	LoadChunk(position: Vector3): Chunk {
		// Create new "ghost" chunks
		// if (this.ChunkFetchQueue.length > Settings.MaxChunksInFetchQueue)
		const chunk = new Chunk(position, this);
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
			!chunk.insideGenerateQueue &&
			chunk.chunkRight.fetched &&
			chunk.chunkLeft.fetched &&
			chunk.chunkFront.fetched &&
			chunk.chunkBack.fetched
		) {
			this.ChunkGenerateQueue.push(chunk);
			chunk.insideGenerateQueue = true;
		}
	}

	DestroyChunk(chunk: Chunk): void {
		this.LoadedChunks.delete(getChunkId(chunk.chunkPosition.x, chunk.chunkPosition.z));
		chunk.Destroy();
	}
}

declare global {
	type World = InstanceType<typeof World>;
}
