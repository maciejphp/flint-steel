import { Workspace } from "../../Controllers/Workspace";
import { getWorldBlockPosition, xyzToId } from "../Functions";
import { Settings } from "../Settings";
import { Vector3, Mesh, Matrix4, PlaneGeometry, BufferGeometry, BufferAttribute } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const { ChunkBlockWidth, ChunkBlockHeight } = Settings;
const halfPi = Math.PI / 2;

const planePrehabs = {
	px: new PlaneGeometry(1, 1).rotateY(halfPi).translate(0.5, 0, 0),

	nx: new PlaneGeometry(1, 1).rotateY(-halfPi).translate(-0.5, 0, 0),

	py: new PlaneGeometry(1, 1).rotateX(-halfPi).translate(0, 0.5, 0),

	ny: new PlaneGeometry(1, 1).rotateX(halfPi).translate(0, -0.5, 0),

	pz: new PlaneGeometry(1, 1).translate(0, 0, 0.5),

	nz: new PlaneGeometry(1, 1).rotateY(Math.PI).translate(0, 0, -0.5),
};

export class Chunk {
	chunkPosition: Vector3;
	blocks: number[] = [];
	chunkFront?: Chunk;
	chunkBack?: Chunk;
	chunkRight?: Chunk;
	chunkLeft?: Chunk;
	mesh?: Mesh;
	generated = false;
	fetched = false;
	insideFetchQueue = false;
	insideGenerateQueue = false;
	world: World;

	constructor(chunkPosition: Vector3, world: World) {
		this.chunkPosition = chunkPosition;
		this.world = world;
	}

	private GenerateGeometry(): BufferGeometry | undefined {
		const geometries: PlaneGeometry[] = [];

		//Do a check to see if the block visible. Don't render otherwise
		for (let x = 0; x < ChunkBlockWidth; x++) {
			//   if (x % 2 === 0 && x !== ChunkBlockWidth) task.wait();
			for (let y = 0; y < ChunkBlockHeight; y++) {
				for (let z = 0; z < ChunkBlockWidth; z++) {
					// const air = this.blocks[xyzToId(x, y, z)];

					//   console.log(this.blocks[xyzToId(x, y, z)]);
					const blockId = this.blocks[xyzToId(x, y, z)];
					if (blockId === 0) continue;

					const chunkBlockPosition = new Vector3(x, y, z);
					const worldBlockPosition = getWorldBlockPosition(
						chunkBlockPosition.clone(),
						this.chunkPosition.clone(),
					);

					const matrix = new Matrix4();
					matrix.makeTranslation(worldBlockPosition.x, worldBlockPosition.y, worldBlockPosition.z);

					const blockFaces: PlaneGeometry[] = [];

					// Check block right
					if (
						(x + 1 === ChunkBlockWidth
							? this.chunkRight?.blocks[xyzToId(0, y, z)]
							: this.blocks[xyzToId(x + 1, y, z)]) === 0
					)
						blockFaces.push(planePrehabs.px.clone().applyMatrix4(matrix));

					// Check block left
					if (
						(x === 0
							? this.chunkLeft?.blocks[xyzToId(ChunkBlockWidth - 1, y, z)]
							: this.blocks[xyzToId(x - 1, y, z)]) === 0
					)
						blockFaces.push(planePrehabs.nx.clone().applyMatrix4(matrix));

					// Check block front
					if (
						(z + 1 === ChunkBlockWidth
							? this.chunkFront?.blocks[xyzToId(x, y, 0)]
							: this.blocks[xyzToId(x, y, z + 1)]) === 0
					)
						blockFaces.push(planePrehabs.pz.clone().applyMatrix4(matrix));

					// Check block back
					if (
						(z === 0
							? this.chunkBack?.blocks[xyzToId(x, y, ChunkBlockWidth - 1)]
							: this.blocks[xyzToId(x, y, z - 1)]) === 0
					)
						blockFaces.push(planePrehabs.nz.clone().applyMatrix4(matrix));

					// Check block up
					if (y === ChunkBlockHeight - 1 || this.blocks[xyzToId(x, y + 1, z)] === 0)
						blockFaces.push(planePrehabs.py.clone().applyMatrix4(matrix));

					// Check block down
					if (y === 0 || this.blocks[xyzToId(x, y - 1, z)] === 0)
						blockFaces.push(planePrehabs.ny.clone().applyMatrix4(matrix));

					blockFaces.forEach((plane) => {
						// const textureId = Math.round(Math.random() * 2);
						// const textureId =
						//   (this.chunkPosition.x % 2 === 0 &&
						//     this.chunkPosition.z % 2 !== 0) ||
						//   (this.chunkPosition.x % 2 !== 0 && this.chunkPosition.z % 2 === 0)
						//     ? 1
						//     : 0;

						setPlaneUv(plane, blockId, this.world.TextureSettings.TextureRatio);
						geometries.push(plane);
					});
				}
			}
		}

		if (!geometries[0]) return;

		// console.log(`${geometries.length} blocks`);
		const geometry = mergeGeometries(geometries, true);
		// geometry.computeBoundingSphere();
		return geometry;
	}

	//

	Generate(): void {
		if (!this.fetched) {
			console.warn("Chunk not fetched yet");
			return;
		}

		if (!this.mesh) {
			this.mesh = new Mesh(this.GenerateGeometry(), this.world.TextureSettings.Material);
			Workspace.Scene.add(this.mesh);
		} else {
			const geometry = this.GenerateGeometry();
			if (!geometry) return;
			this.mesh.geometry = geometry;
		}
		this.generated = true;
	}

	Destroy(): void {
		if (this.mesh) {
			Workspace.Scene.remove(this.mesh);
			this.mesh.geometry.dispose();

			if (Array.isArray(this.mesh.material)) {
				this.mesh.material.forEach((m) => m.dispose());
			} else {
				this.mesh.material.dispose();
			}
		}

		this.mesh = undefined;
		this.blocks = [];
		if (this.chunkFront?.chunkBack) this.chunkFront.chunkBack = undefined;
		this.chunkFront = undefined;

		if (this.chunkBack?.chunkFront) this.chunkBack.chunkFront = undefined;
		this.chunkBack = undefined;

		if (this.chunkRight?.chunkLeft) this.chunkRight.chunkLeft = undefined;
		this.chunkRight = undefined;

		if (this.chunkLeft?.chunkRight) this.chunkLeft.chunkRight = undefined;
		this.chunkLeft = undefined;

		this.generated = false;
		this.fetched = false;
	}
}

declare global {
	type ChunkType = InstanceType<typeof Chunk>;
}

export function setPlaneUv(plane: PlaneGeometry, textureIndex: number, textureRatio: number): void {
	const start = textureRatio * (textureIndex - 1);
	const end = start + textureRatio;

	const uv = new Float32Array([start, 1, end, 1, start, 0, end, 0]);

	plane.setAttribute("uv", new BufferAttribute(uv, 2));
}
