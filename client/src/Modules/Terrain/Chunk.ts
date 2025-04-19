import { getChunkBlockPosition, getWorldBlockPosition, positionToId, setPlaneUv, xyzToId } from "../Functions";
import { settings } from "../Settings";
import {
	Vector3,
	TextureLoader,
	SRGBColorSpace,
	NearestFilter,
	Mesh,
	MeshBasicMaterial,
	Matrix4,
	PlaneGeometry,
	BufferGeometry,
	MeshPhongMaterial,
	Vector4,
	Plane,
} from "three";
import { generateBlock } from "./WorldGeneration";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Workspace } from "../../Controllers/Workspace";
import { ShadowMesh } from "three/examples/jsm/Addons.js";

const { chunkBlockWidth, chunkBlockHeight, blockSize } = settings;
const halfBlockSize = blockSize / 2;
const halfPi = Math.PI / 2;

const planePrehabs = {
	px: new PlaneGeometry(blockSize, blockSize).rotateY(halfPi).translate(halfBlockSize, 0, 0),

	nx: new PlaneGeometry(blockSize, blockSize).rotateY(-halfPi).translate(-halfBlockSize, 0, 0),

	py: new PlaneGeometry(blockSize, blockSize).rotateX(-halfPi).translate(0, halfBlockSize, 0),

	ny: new PlaneGeometry(blockSize, blockSize).rotateX(halfPi).translate(0, -halfBlockSize, 0),

	pz: new PlaneGeometry(blockSize, blockSize).translate(0, 0, halfBlockSize),

	nz: new PlaneGeometry(blockSize, blockSize).rotateY(Math.PI).translate(0, 0, -halfBlockSize),
};

export class Chunk {
	chunkPosition: Vector3;
	blocks: number[] = [];
	chunkFront?: Chunk;
	chunkBack?: Chunk;
	chunkRight?: Chunk;
	chunkLeft?: Chunk;
	generated = false;
	loadedIn = false;
	mesh?: Mesh;

	constructor(chunkPosition: Vector3) {
		this.chunkPosition = chunkPosition;

		//Create new "Ghost" blocks
		for (let x = 0; x < chunkBlockWidth; x++) {
			for (let y = 0; y < chunkBlockHeight; y++) {
				for (let z = 0; z < chunkBlockWidth; z++) {
					const chunkBlockPosition = new Vector3(x, y, z);
					const worldBlockPosition = getWorldBlockPosition(chunkBlockPosition.clone(), chunkPosition.clone());
					this.blocks.push(generateBlock(worldBlockPosition));
				}
			}
		}
		this.loadedIn = true;
	}

	//

	DestroyBlock(blockPosition: Vector3): void {
		if (!this.mesh) return;

		const chunkBlockPosition = getChunkBlockPosition(blockPosition.clone(), this.chunkPosition.clone());
		this.blocks[positionToId(chunkBlockPosition)] = 0;

		this.Generate();

		if (chunkBlockPosition.x === 0 && this.chunkLeft?.generated) this.chunkLeft.Generate();
		else if (chunkBlockPosition.x === chunkBlockWidth - 1 && this.chunkRight?.generated) this.chunkRight.Generate();
		if (chunkBlockPosition.z === 0 && this.chunkBack?.generated) this.chunkBack.Generate();
		else if (chunkBlockPosition.z === chunkBlockWidth - 1 && this.chunkFront?.generated) this.chunkFront.Generate();

		// Update chunk

		// const box = new Mesh(
		//   new BoxGeometry(),
		//   new MeshBasicMaterial({ color: "red" })
		// );
		// box.position.set(blockPosition.x, blockPosition.y, blockPosition.z);
		// Workspace.Scene.add(box);
	}

	//
	PlaceBlock(blockPosition: Vector3): void {
		if (!this.generated) return;

		const chunkBlockPosition = getChunkBlockPosition(blockPosition.clone(), this.chunkPosition.clone());

		if (chunkBlockPosition.y < 0 || chunkBlockPosition.y >= chunkBlockHeight) return;

		this.blocks[xyzToId(chunkBlockPosition.x, chunkBlockPosition.y, chunkBlockPosition.z)] = 3;

		this.Generate();
	}

	//

	private GenerateGeometry(): BufferGeometry | undefined {
		const geometries: PlaneGeometry[] = [];

		//Do a check to see if the block visible. Don't render otherwise
		for (let x = 0; x < chunkBlockWidth; x++) {
			//   if (x % 2 === 0 && x !== chunkBlockWidth) task.wait();
			for (let y = 0; y < chunkBlockHeight; y++) {
				for (let z = 0; z < chunkBlockWidth; z++) {
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
						(x + 1 === chunkBlockWidth
							? this.chunkRight?.blocks[xyzToId(0, y, z)]
							: this.blocks[xyzToId(x + 1, y, z)]) === 0
					)
						blockFaces.push(planePrehabs.px.clone().applyMatrix4(matrix));

					// Check block left
					if (
						(x === 0
							? this.chunkLeft?.blocks[xyzToId(chunkBlockWidth - 1, y, z)]
							: this.blocks[xyzToId(x - 1, y, z)]) === 0
					)
						blockFaces.push(planePrehabs.nx.clone().applyMatrix4(matrix));

					// Check block front
					if (
						(z + 1 === chunkBlockWidth
							? this.chunkFront?.blocks[xyzToId(x, y, 0)]
							: this.blocks[xyzToId(x, y, z + 1)]) === 0
					)
						blockFaces.push(planePrehabs.pz.clone().applyMatrix4(matrix));

					// Check block back
					if (
						(z === 0
							? this.chunkBack?.blocks[xyzToId(x, y, chunkBlockWidth - 1)]
							: this.blocks[xyzToId(x, y, z - 1)]) === 0
					)
						blockFaces.push(planePrehabs.nz.clone().applyMatrix4(matrix));

					// Check block up
					if (y === chunkBlockHeight - 1 || this.blocks[xyzToId(x, y + 1, z)] === 0)
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

						setPlaneUv(plane, blockId);
						geometries.push(plane);
					});
				}
			}
		}

		if (!geometries[0]) return;

		// console.log(`${geometries.length} blocks`);
		const geometry = mergeGeometries(geometries, true);
		geometry.computeBoundingSphere();
		return geometry;
	}

	//

	Generate(): void {
		if (!this.mesh) {
			const texture = new TextureLoader().load("../../public/texture.png");
			texture.colorSpace = SRGBColorSpace;
			texture.magFilter = NearestFilter;
			this.mesh = new Mesh(this.GenerateGeometry(), new MeshPhongMaterial({ map: texture }));
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
		this.loadedIn = false;
	}
}

declare global {
	type ChunkType = InstanceType<typeof Chunk>;
}
