import { createNoise3D } from "simplex-noise";
import { ChunkIdToPosition, getChunkId, getWorldBlockPosition, query } from "../Functions.js";
import { Settings } from "../Settings.js";
import Alea from "alea";

const { ChunkBlockWidth, ChunkBlockHeight } = Settings;

class Class {
	private static instance: Class;
	private noise = createNoise3D(Alea("seed"));

	LoadedChunks: Record<string, Chunk> = {};
	ModifiedChunks: Record<string, Chunk> = {};

	private isSaving = false;
	private saveQueue: Record<string, Chunk> = {};

	private constructor() {
		const saveWorld = async () => {
			if (this.isSaving || Object.keys(this.ModifiedChunks).length === 0) return;

			this.isSaving = true;
			this.saveQueue = { ...this.ModifiedChunks };
			this.ModifiedChunks = {};

			let insertQueries = "";
			Object.entries(this.saveQueue).forEach(([chunkId, chunk]) => {
				// Create a deep copy of the chunk data to prevent reference issues
				const chunkCopy = [...chunk];
				insertQueries += `
					INSERT INTO chunks (ChunkId, Data) VALUES ('${chunkId}','${JSON.stringify(chunkCopy)}')
					ON DUPLICATE KEY UPDATE Data = VALUES(Data);
				`;
			});

			try {
				await query(insertQueries, []);
				console.log("Saved chunks:", Object.keys(this.saveQueue).length);

				// Only unload chunks that aren't modified since we started saving
				Object.keys(this.saveQueue).forEach((chunkId) => {
					if (!this.ModifiedChunks[chunkId]) {
						delete this.LoadedChunks[chunkId];
					}
				});
			} catch (error) {
				// If save fails, add chunks back to ModifiedChunks
				this.ModifiedChunks = {
					...this.ModifiedChunks,
					...this.saveQueue,
				};
				console.error("Failed to save chunks:", error);
			}

			this.saveQueue = {};
			this.isSaving = false;
		};

		// Auto save more frequently to reduce data loss risk
		setInterval(() => {
			saveWorld();
		}, 60 * 1000);

		// process.on("SIGINT", saveWorld);
		// process.on("SIGTERM", saveWorld);
	}

	// --

	async GetChunks(chunkPositions: Vector2[]): Promise<Record<string, Chunk>> {
		const chunks: Record<string, Chunk> = {};
		let cachedChunks = 0;
		let databaseChunks = 0;
		let generateChunks = 0;

		const chunkIdsToRequest: string[] = [];

		// Get all fetched chunks
		chunkPositions.forEach((chunkPosition) => {
			const chunkId = getChunkId(chunkPosition.x, chunkPosition.z);

			const cachedChunk = this.LoadedChunks[chunkId];
			if (cachedChunk) {
				chunks[chunkId] = cachedChunk;
				cachedChunks++;
			} else {
				chunkIdsToRequest.push(chunkId);
			}
		});

		if (chunkIdsToRequest.length === 0) return chunks;

		// Get chunks from database
		const chunkIdList = chunkIdsToRequest.map((item) => `'${item}'`).join(", ");
		console.log("chunkPositions", chunkIdList);
		const [result, success] = await query<{ ChunkId: string; Data: string }>(
			`SELECT * FROM chunks WHERE ChunkId IN (${chunkIdList});`,
			[],
		);

		if (success && result) {
			const chunksData = result[0] as unknown as { ChunkId: string; Data: string }[];
			chunksData.forEach((chunk) => {
				if (chunk === undefined) return;

				const chunkData = JSON.parse(chunk.Data);
				this.LoadedChunks[chunk.ChunkId] = chunkData;
				chunks[chunk.ChunkId] = chunkData;
				databaseChunks++;

				chunkIdsToRequest.splice(chunkIdsToRequest.indexOf(chunk.ChunkId), 1);
			});
		}

		// Generate the remaining chunks
		chunkIdsToRequest.forEach((chunkId) => {
			chunks[chunkId] = this.generateChunk(chunkId);
			generateChunks++;
		});

		console.log({ cachedChunks, databaseChunks, generateChunks });

		return chunks;
	}

	// --

	async GetChunk(chunkPosition: Vector2): Promise<Chunk> {
		const chunkId = getChunkId(chunkPosition.x, chunkPosition.z);

		// Check if chunk is cached
		const cachedChunk = this.LoadedChunks[chunkId];
		if (cachedChunk) {
			return cachedChunk;
		}

		// Check if chunk is in the database
		const [result, success] = await query<{ ChunkId: string; Data: string }>(
			"SELECT * FROM chunks WHERE ChunkId = ?",
			[chunkId],
		);
		if (success && result) {
			const chunk = result[0][0];
			if (chunk) {
				const chunkData = JSON.parse(chunk.Data);
				this.LoadedChunks[chunkId] = chunkData;
				return chunkData;
			}
		}

		// Generate new chunk
		return this.generateChunk(chunkId);
	}

	private generateChunk(chunkId: string): Chunk {
		let newChunk: Chunk = [];
		const chunkPosition = ChunkIdToPosition(chunkId);

		// Generate block  or air
		for (let x = 0; x < ChunkBlockWidth; x++) {
			for (let y = 0; y < ChunkBlockHeight; y++) {
				for (let z = 0; z < ChunkBlockWidth; z++) {
					const chunkBlockPosition = { x, y, z };
					const worldBlockPosition = getWorldBlockPosition(chunkBlockPosition, chunkPosition);

					const generateBlock = (position: Vector3): number => {
						const { x, y, z } = position;

						const scale = 75;
						let noiseValue = this.noise(x / scale, (y * 2) / scale, z / scale);
						noiseValue += this.noise(x / 12.5, y / 12.5, z / 12.5) / 0.8;

						noiseValue -= (y * 8) / ChunkBlockHeight / 6;
						noiseValue += ChunkBlockHeight / (y * 8);

						if (noiseValue > 0.05) {
							return 1;
						} else {
							return 0;
						}
					};

					newChunk.push(generateBlock(worldBlockPosition));
				}
			}
		}

		// Generate grass on top
		newChunk = newChunk.map((blockId, index) => {
			if (blockId === 0) return blockId;

			const blockUp = newChunk[index + ChunkBlockWidth * Math.round(Math.random() * 2 + 1)];
			if (!blockUp || blockUp === 0) return 1;

			return 2;
		});

		this.LoadedChunks[chunkId] = newChunk;

		return newChunk;
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const WorldService = Class.get();

declare global {
	type Chunk = number[];
	type Vector2 = { x: number; z: number };
	type Vector3 = { x: number; y: number; z: number };
}
