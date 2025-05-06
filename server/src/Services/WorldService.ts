import { createNoise3D } from "simplex-noise";
import { getChunkId, getWorldBlockPosition, query } from "../Functions.js";
import { Settings } from "../Settings.js";
import Alea from "alea";

const { ChunkBlockWidth, ChunkBlockHeight } = Settings;

class Class {
	private static instance: Class;
	private noise = createNoise3D(Alea("seed"));

	LoadedChunks: Record<string, Chunk> = {};
	ModifiedChunks: Record<string, Chunk> = {};

	private constructor() {
		// Save every 5 seconds
		setInterval(async () => {
			let insertQueries = "";
			Object.entries(this.ModifiedChunks).forEach(([chunkId, chunk]) => {
				insertQueries += `INSERT INTO chunks (ChunkId, Data) VALUES ('${chunkId}','${JSON.stringify(chunk)}')
				ON DUPLICATE KEY UPDATE
				Data = VALUES(Data);`;
			});

			if (insertQueries === "") return;

			const [, success] = await query(insertQueries, []);
			console.log("Saved chunks", success);

			this.LoadedChunks = {};
			this.ModifiedChunks = {};
		}, 3000);
	}

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
				// console.log(chunk);
				const chunkData = JSON.parse(chunk.Data);
				this.LoadedChunks[chunkId] = chunkData;
				return chunkData;
			}
		}

		// Generate new chunk
		let newChunk: Chunk = [];

		// Generate block  or air
		for (let x = 0; x < ChunkBlockWidth; x++) {
			for (let y = 0; y < ChunkBlockHeight; y++) {
				for (let z = 0; z < ChunkBlockWidth; z++) {
					const chunkBlockPosition = { x, y, z };
					const worldBlockPosition = getWorldBlockPosition(chunkBlockPosition, chunkPosition);

					const generateBlock = (position: Vector3): number => {
						const { x, y, z } = position;

						const scale = 600;
						let noiseValue = this.noise(x / scale, (y * 2) / scale, z / scale);
						noiseValue += this.noise(x / 100, y / 100, z / 100) / 10;

						noiseValue -= y / ChunkBlockHeight / 6;
						noiseValue += ChunkBlockHeight / y;

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
