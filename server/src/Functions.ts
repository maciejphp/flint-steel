import db from "./db.js";
import { Response } from "express";
import { Settings } from "./Settings.js";

const { ChunkBlockWidth, ChunkBlockHeight } = Settings;

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
		x: chunkPosition.x * ChunkBlockWidth,
		z: chunkPosition.z * ChunkBlockWidth,
	};

	const localBlockPosition = {
		x: blockPosition.x,
		y: blockPosition.y,
		z: blockPosition.z,
	};
	return {
		x: chunkWorldPosition.x + localBlockPosition.x,
		y: blockPosition.y,
		z: chunkWorldPosition.z + localBlockPosition.z,
	};
}
export const getChunkId = (x: number, z: number): string => `${x},${z}`;

export const ChunkIdToPosition = (chunkId: string): Vector2 => {
	const [x, z] = chunkId.split(",").map(Number);
	return { x, z };
};

export const logDebugTime = (message?: string): void => {
	const now = new Date();

	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Europe/Berlin",
		minute: "2-digit",
		second: "2-digit",
		hour: "2-digit",
		hour12: false,
	};

	const formatter = new Intl.DateTimeFormat("en-GB", options);
	const parts = formatter.formatToParts(now);

	// Extract parts
	const minute = parts.find((p) => p.type === "minute")?.value || "00";
	const second = parts.find((p) => p.type === "second")?.value || "00";
	const millisecond = String(now.getMilliseconds()).padStart(3, "0");

	// Final formatted string
	const formatted = `${message ?? ""} ${minute}:${second}:${millisecond}`;
	console.log(formatted);
};
