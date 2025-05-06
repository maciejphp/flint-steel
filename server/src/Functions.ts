import db from "./db.js";
import { Response } from "express";
import { Settings } from "./Settings.js";

const { ChunkBlockWidth, ChunkBlockHeight, BlockSize } = Settings;

export function getByteSize(obj: unknown): number {
	const str = JSON.stringify(obj);
	return new TextEncoder().encode(str).length;
}

export async function query<t>(
	query: string,
	values: (number | string)[],
	res?: Response,
): Promise<[[[t | undefined]] | undefined, boolean]> {
	try {
		return [await (db.query(query, values) as unknown as [[t]]), true];
	} catch (err) {
		const error = err as { sql: string; sqlMessage: string };
		console.log(error.sql, error.sqlMessage);
		if (res !== undefined) res.json({ error: `database error` });
		return [undefined, false];
	}
}

export function xyzToId(x: number, y: number, z: number): number {
	return x * ChunkBlockHeight * ChunkBlockWidth + y * ChunkBlockWidth + z;
}

export function getWorldBlockPosition(blockPosition: Vector3, chunkPosition: Vector2): Vector3 {
	const chunkWorldPosition = {
		x: chunkPosition.x * ChunkBlockWidth * BlockSize,
		z: chunkPosition.z * ChunkBlockWidth * BlockSize,
	};

	const localBlockPosition = {
		x: blockPosition.x * BlockSize,
		y: blockPosition.y * BlockSize,
		z: blockPosition.z * BlockSize,
	};
	return {
		x: chunkWorldPosition.x + localBlockPosition.x,
		y: blockPosition.y * BlockSize,
		z: chunkWorldPosition.z + localBlockPosition.z,
	};
}
export const getChunkId = (x: number, z: number): string => `${x},${z}`;
