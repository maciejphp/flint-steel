import * as THREE from "three";
import { Workspace } from "../Controllers/Workspace";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export default (): void => {
  const { Scene } = Workspace;
  const ChunkWidth = 16;
  const ChunkHeight = 16;
  const BlockSize = 15;
  const realChunkWidth = ChunkWidth * BlockSize;

  const perlin = new ImprovedNoise();

  const ambientLight = new THREE.AmbientLight(0xeeeeee, 3);
  Scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 12);
  directionalLight.position.set(1, 0.5, 0.5).normalize();
  Scene.add(directionalLight);

  class Chunk {
    Position: THREE.Vector3;
    GeneratedData = false;
    BlockData: boolean[] = [];
    // ChunkModel = Make("Model", {});

    constructor(chunkPosition: THREE.Vector3) {
      this.Position = chunkPosition;

      for (
        let x = chunkPosition.x;
        x < chunkPosition.x + ChunkWidth * BlockSize;
        x += BlockSize
      ) {
        for (
          let z = chunkPosition.z;
          z < chunkPosition.z + ChunkWidth * BlockSize;
          z += BlockSize
        ) {
          let noise = 0;

          // a bit of elecation
          noise += perlin.noise(x / 400, z / 400, 10) * 50;

          // randomness
          noise += perlin.noise(x / 50, z / 50, 10) * 10;

          const geometry = new THREE.BoxGeometry();
          geometry.scale(BlockSize, 50, BlockSize);
          const cube = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({ color: 0xff6347 })
          );
          cube.position.set(x, Math.round(noise / BlockSize) * BlockSize, z);
          Scene.add(cube);
        }
      }

      this.GeneratedData = true;
    }

    // Destroy() {}
  }

  const worldSize = 5;
  for (let x = 0; x < worldSize; x++) {
    for (let z = 0; z < worldSize; z++) {
      //   new Chunk(new Vector3(x, 0, z).mul(realChunkWidth));
      new Chunk(new THREE.Vector3(x, 0, z).multiplyScalar(realChunkWidth));
      //   task.wait();
    }
  }
};
