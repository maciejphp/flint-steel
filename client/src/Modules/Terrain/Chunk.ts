import {
  getWorldBlockPosition,
  positionToId,
  setBoxUv,
  setPlaneUv,
  xyzToId,
} from "../Functions";
import { settings } from "../Settings";
import {
  Vector3,
  BoxGeometry,
  TextureLoader,
  SRGBColorSpace,
  NearestFilter,
  Mesh,
  MeshBasicMaterial,
  Matrix4,
  PlaneGeometry,
} from "three";
import { generateBlock } from "./WorldGeneration";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { Workspace } from "../../Controllers/Workspace";

const { chunkBlockWidth, chunkBlockHeight, blockSize } = settings;
const halfBlockSize = blockSize / 2;
const halfPi = Math.PI / 2;

const planePrehabs = {
  px: new PlaneGeometry(blockSize, blockSize)
    .rotateY(halfPi)
    .translate(halfBlockSize, 0, 0),

  nx: new PlaneGeometry(blockSize, blockSize)
    .rotateY(-halfPi)
    .translate(-halfBlockSize, 0, 0),

  py: new PlaneGeometry(blockSize, blockSize)
    .rotateX(-halfPi)
    .translate(0, halfBlockSize, 0),

  ny: new PlaneGeometry(blockSize, blockSize)
    .rotateX(halfPi)
    .translate(0, -halfBlockSize, 0),

  pz: new PlaneGeometry(blockSize, blockSize).translate(0, 0, halfBlockSize),

  nz: new PlaneGeometry(blockSize, blockSize)
    .rotateY(Math.PI)
    .translate(0, 0, -halfBlockSize),
};

export class Chunk {
  chunkPosition: Vector3;
  blocks: number[] = [];
  chunkFront?: Chunk;
  chunkBack?: Chunk;
  chunkRight?: Chunk;
  chunkLeft?: Chunk;
  //   blockFolder: Folder;
  generated = false;
  loadedIn = false;

  constructor(chunkPosition: Vector3) {
    this.chunkPosition = chunkPosition;
    // this.blockFolder = Make("Folder", { Name: "Chunk" });
    // let chunkData = BlockService.GetChunkData(chunkPosition);
    // chunkData = chunkData?.sort();

    // let blocksBroken = 0;
    // let nextBlock = chunkData ? chunkData[blocksBroken] : undefined;

    //Create new "Ghost" blocks
    for (let x = 0; x < chunkBlockWidth; x++) {
      for (let y = 0; y < chunkBlockHeight; y++) {
        for (let z = 0; z < chunkBlockWidth; z++) {
          const chunkBlockPosition = new Vector3(x, y, z);
          const worldBlockPosition = getWorldBlockPosition(
            chunkBlockPosition.clone(),
            chunkPosition.clone()
          );
          //   const blockId = positionToId(chunkBlockPosition);

          // If block broken make it air else generate
          //   if (chunkData && nextBlock === blockId) {
          //     blocksBroken++;
          //     nextBlock = chunkData[blocksBroken];
          //     this.blocks.push(new Air(worldBlockPosition));
          //   } else {
          //     const block = generateBlock(worldBlockPosition);
          //     block.blockFolder = this.blockFolder;

          //     this.blocks.push(block);
          //   }
          this.blocks.push(generateBlock(worldBlockPosition));
        }
      }
    }
    this.loadedIn = true;
  }

  //   destroyBlock(blockPosition: Vector3) {
  //     const chunkBlockPosition = getChunkBlockPosition(
  //       blockPosition,
  //       this.chunkPosition
  //     );
  //     const air = this.blocks[positionToId(chunkBlockPosition)];
  //     const block = getBlock(air);
  //     if (!block || block.blockSettings.unbreakable) return;

  //     // Fire server
  //     BlockService.BreakBlock.Fire(blockPosition);
  //     block.destroy();

  //     getNeightborBlocks(this, chunkBlockPosition).forEach((air) => {
  //       const block = getBlock(air);
  //       if (block && !block.generated) {
  //         // Dont generate the block is the chunk its at hasn't generated
  //         const chunkBlockPosition = getChunkBlockPosition(
  //           block.position,
  //           this.chunkPosition
  //         );
  //         if (
  //           (chunkBlockPosition.x > chunkBlockWidth &&
  //             !this.chunkRight?.generated) ||
  //           (chunkBlockPosition.x < 0 && !this.chunkLeft?.generated) ||
  //           (chunkBlockPosition.z > chunkBlockWidth &&
  //             !this.chunkFront?.generated) ||
  //           (chunkBlockPosition.z < 0 && !this.chunkBack?.generated)
  //         )
  //           return;

  //         block.generate();
  //       }
  //     });
  //   }

  generateBlocks(): void {
    // this.blockFolder.Parent = Workspace;

    const geometries: PlaneGeometry[] = [];

    //Do a check to see if the block visible. Don't render otherwise
    for (let x = 0; x < chunkBlockWidth; x++) {
      //   if (x % 2 === 0 && x !== chunkBlockWidth) task.wait();
      for (let y = 0; y < chunkBlockHeight; y++) {
        for (let z = 0; z < chunkBlockWidth; z++) {
          // const air = this.blocks[xyzToId(x, y, z)];

          //   console.log(this.blocks[xyzToId(x, y, z)]);
          if (this.blocks[xyzToId(x, y, z)] === 0) continue;

          const chunkBlockPosition = new Vector3(x, y, z);
          const worldBlockPosition = getWorldBlockPosition(
            chunkBlockPosition.clone(),
            this.chunkPosition.clone()
          );

          const matrix = new Matrix4();
          matrix.makeTranslation(
            worldBlockPosition.x,
            worldBlockPosition.y,
            worldBlockPosition.z
          );

          //   const cube = new BoxGeometry(blockSize, blockSize, blockSize);
          //   cube.applyMatrix4(matrix);
          //   setBoxUv(cube, 2);
          //   geometries.push(cube);

          //   Object.entries(planePrehabs).forEach(([, prefab]) => {
          //     const plane = prefab.clone().applyMatrix4(matrix);
          //     setPlaneUv(plane, 2);
          //     geometries.push(plane);
          //   });
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
          if (
            y === chunkBlockHeight - 1 ||
            this.blocks[xyzToId(x, y + 1, z)] === 0
          )
            blockFaces.push(planePrehabs.py.clone().applyMatrix4(matrix));

          // Check block down
          if (y === 0 || this.blocks[xyzToId(x, y - 1, z)] === 0)
            blockFaces.push(planePrehabs.ny.clone().applyMatrix4(matrix));

          blockFaces.forEach((plane) => {
            const textureId = Math.round(Math.random() * 2);
            // const textureId =
            //   (this.chunkPosition.x % 2 === 0 &&
            //     this.chunkPosition.z % 2 !== 0) ||
            //   (this.chunkPosition.x % 2 !== 0 && this.chunkPosition.z % 2 === 0)
            //     ? 1
            //     : 0;

            setPlaneUv(plane, textureId);
            geometries.push(plane);
          });
        }
      }
    }

    console.log(`${geometries.length} blocks`);
    const geometry = BufferGeometryUtils.mergeGeometries(geometries, true);
    geometry.computeBoundingSphere();

    const texture = new TextureLoader().load("../../public/texture.png");
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;
    const mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ map: texture })
      // new THREE.MeshStandardMaterial({ color: 0xff6347 })
    );
    Workspace.Scene.add(mesh);
    this.generated = true;
  }

  //   unloadBlocks() {
  //     this.blocks.forEach((air, index) => {
  //       if (index % 512 === 0 && index !== chunkBlockWidth) task.wait();
  //       const block = getBlock(air);
  //       if (block?.generated) {
  //         block.part?.Destroy();
  //         block.generated = false;
  //       }
  //     });
  //     this.generated = false;
  //   }
}

declare global {
  type ChunkType = InstanceType<typeof Chunk>;
}
