import { Vector3 } from "three";
import { Settings } from "./Settings";
import { AxiosResponse } from "axios";

const { ChunkBlockHeight, ChunkBlockWidth } = Settings;

export function xyzToId(x: number, y: number, z: number): number {
	return x * ChunkBlockHeight * ChunkBlockWidth + y * ChunkBlockWidth + z;
}

export function positionToId(position: Vector3): number {
	return xyzToId(position.x, position.y, position.z);
}

export function idToPosition(id: number): Vector3 {
	const Z = id % ChunkBlockWidth;
	const Y = Math.floor(id / ChunkBlockWidth) % ChunkBlockHeight;
	const X = Math.floor(id / (ChunkBlockWidth * ChunkBlockHeight));
	return new Vector3(X, Y, Z);
}

export function getWorldBlockPosition(blockPosition: Vector3, chunkPosition: Vector3): Vector3 {
	const chunkWorldPosition = chunkPosition.multiply(new Vector3(ChunkBlockWidth, ChunkBlockHeight, ChunkBlockWidth));
	return chunkWorldPosition.add(blockPosition);
}

export function getByteSize(obj: unknown): number {
	const str = JSON.stringify(obj);
	// UTF-8 encoding: 1 char = 1-4 bytes (depends on character)
	return new TextEncoder().encode(str).length;
}

export const getChunkId = (x: number, z: number): string => `${x},${z}`;

export function getChunkBlockPosition(blockPosition: Vector3, chunkPosition: Vector3): Vector3 {
	return blockPosition.sub(chunkPosition.multiplyScalar(ChunkBlockWidth));
}

// export function setBoxUv(box: BoxGeometry, textureIndex: number): void {
// 	const start = textureRatio * textureIndex;
// 	const end = start + textureRatio;

// 	const faceUV = [start, 1, end, 1, start, 0, start, 0, end, 1, end, 0];

// 	// Repeat the same UVs for all 6 faces
// 	const uvs: number[] = [];
// 	for (let i = 0; i < 6; i++) {
// 		uvs.push(...faceUV);
// 	}

// 	// Set the UVs
// 	box.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
// }

export function getChunkPosition(blockPosition: Vector3): Vector3 {
	const chunkPosition = blockPosition.divideScalar(ChunkBlockWidth);
	return new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));
}

export const handleResponse = (response: AxiosResponse): boolean => {
	const success = response.data.error === undefined;

	if (success) {
		if (response.data.message) alert(response.data.message);
	} else {
		console.warn(response.data.error);
	}

	return success;
};

declare global {
	// eslint-disable-next-line @typescript-eslint/ban-types
	type Simplify<T> = { [K in keyof T]: T[K] } & {};
}
