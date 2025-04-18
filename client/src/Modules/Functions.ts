import { Vector3, BoxGeometry, BufferAttribute, PlaneGeometry } from "three";
import { settings } from "./Settings";

const { chunkBlockHeight, chunkBlockWidth, blockSize } = settings;

export function xyzToId(x: number, y: number, z: number): number {
	return x * chunkBlockHeight * chunkBlockWidth + y * chunkBlockWidth + z;
}

export function positionToId(position: Vector3): number {
	return position.x * chunkBlockHeight * chunkBlockWidth + position.y * chunkBlockWidth + position.z;
}

export function getWorldBlockPosition(blockPosition: Vector3, chunkPosition: Vector3): Vector3 {
	const chunkWorldPosition = chunkPosition
		.multiply(new Vector3(chunkBlockWidth, chunkBlockHeight, chunkBlockWidth))
		.multiplyScalar(blockSize);
	const localBlockPosition = blockPosition.multiplyScalar(blockSize);
	return chunkWorldPosition.add(localBlockPosition);
}

export function getChunkBlockPosition(blockPosition: Vector3, chunkPosition: Vector3): Vector3 {
	return blockPosition.sub(chunkPosition.multiplyScalar(blockSize * chunkBlockWidth)).divideScalar(blockSize);
}

const totalTextures = 3;
const textureRatio = 1 / totalTextures;

export function setBoxUv(box: BoxGeometry, textureIndex: number): void {
	const start = textureRatio * textureIndex;
	const end = start + textureRatio;

	const faceUV = [start, 1, end, 1, start, 0, start, 0, end, 1, end, 0];

	// Repeat the same UVs for all 6 faces
	const uvs: number[] = [];
	for (let i = 0; i < 6; i++) {
		uvs.push(...faceUV);
	}

	// Set the UVs
	box.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
}

export function getChunkPosition(blockPosition: Vector3): Vector3 {
	const chunkPosition = blockPosition.divideScalar(chunkBlockWidth * blockSize);
	return new Vector3(Math.floor(chunkPosition.x), 0, Math.floor(chunkPosition.z));
}

export function setPlaneUv(plane: PlaneGeometry, textureIndex: number): void {
	const epsilon = 0.01;
	const start = textureRatio * (textureIndex - 1);
	const end = start + textureRatio;

	const uv = new Float32Array([
		start + epsilon,
		1 - epsilon,
		end - epsilon,
		1 - epsilon,
		start + epsilon,
		epsilon,
		end - epsilon,
		epsilon,
	]);

	plane.setAttribute("uv", new BufferAttribute(uv, 2));
}
