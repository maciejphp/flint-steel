import * as THREE from "three";
import { Workspace } from "../Controllers/Workspace";
import { World } from "../Modules/Terrain/World";

export default (): void => {
  //   chunk.generateBlocks();
  const world = new World();
  const scene = Workspace.Scene;

  const worldSize = 6;
  for (let x = 0; x < worldSize; x++) {
    for (let z = 0; z < worldSize; z++) {
      world.generateChunk(new THREE.Vector3(x, 0, z));
    }
  }

  const ambientLight = new THREE.AmbientLight(0xeeeeee, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 12);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);
};
