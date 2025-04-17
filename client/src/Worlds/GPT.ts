import * as THREE from "three";
import { Workspace } from "../Controllers/Workspace";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export default (): void => {
  const matrix = new THREE.Matrix4();
  const scene = Workspace.Scene;

  const blockSize = 20;
  const haldBlockSize = blockSize * 0.5;

  const worldWidth = 128;
  const worldDepth = 128;
  const worldHalfWidth = worldWidth / 2;
  const worldHalfDepth = worldDepth / 2;
  const data = generateHeight(worldWidth, worldDepth);

  const geometries = [];
  const blocks: THREE.Mesh[] = []; // Houd een lijst bij van alle blokken

  const pxGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pxGeometry.rotateY(Math.PI / 2);
  pxGeometry.translate(haldBlockSize, 0, 0);
  setPlaneUv(pxGeometry, 1);

  const nxGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  nxGeometry.rotateY(-Math.PI / 2);
  nxGeometry.translate(-haldBlockSize, 0, 0);
  setPlaneUv(nxGeometry, 1);

  const pyGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pyGeometry.rotateX(-Math.PI / 2);
  pyGeometry.translate(0, haldBlockSize, 0);
  setPlaneUv(pyGeometry, 0);

  const pzGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pzGeometry.translate(0, 0, haldBlockSize);
  setPlaneUv(pzGeometry, 2);

  const nzGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  nzGeometry.rotateY(Math.PI);
  nzGeometry.translate(0, 0, -haldBlockSize);
  setPlaneUv(nzGeometry, 2);

  for (let z = 0; z < worldDepth; z++) {
    for (let x = 0; x < worldWidth; x++) {
      const h = getY(x, z);

      matrix.makeTranslation(
        x * blockSize - worldHalfWidth * blockSize,
        h * blockSize,
        z * blockSize - worldHalfDepth * blockSize
      );

      const px = getY(x + 1, z);
      const nx = getY(x - 1, z);
      const pz = getY(x, z + 1);
      const nz = getY(x, z - 1);

      const blockGeometry = BufferGeometryUtils.mergeGeometries(
        [
          pyGeometry.clone(),
          ...(px !== h && px !== h + 1 ? [pxGeometry.clone()] : []),
          ...(nx !== h && nx !== h + 1 ? [nxGeometry.clone()] : []),
          ...(pz !== h && pz !== h + 1 ? [pzGeometry.clone()] : []),
          ...(nz !== h && nz !== h + 1 ? [nzGeometry.clone()] : []),
        ],
        true
      ).applyMatrix4(matrix);

      const block = new THREE.Mesh(
        blockGeometry,
        new THREE.MeshBasicMaterial({ color: 0xff6347 })
      );
      scene.add(block);
      blocks.push(block); // Voeg het blok toe aan de lijst
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("mousedown", (event) => {
    // Bereken de muispositie in genormaliseerde apparaatcoördinaten (-1 tot +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, Workspace.Camera);

    // Controleer op intersecties met de blokken
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
      const intersectedBlock = intersects[0].object as THREE.Mesh;
      scene.remove(intersectedBlock); // Verwijder het blok uit de scene
      blocks.splice(blocks.indexOf(intersectedBlock), 1); // Verwijder het blok uit de lijst
    }
  });

  function generateHeight(width: number, height: number) {
    const data = [],
      perlin = new ImprovedNoise(),
      size = width * height,
      z = Math.random() * 100;

    let quality = 2;

    for (let j = 0; j < 4; j++) {
      if (j === 0) for (let i = 0; i < size; i++) data[i] = 0;

      for (let i = 0; i < size; i++) {
        const x = i % width,
          y = (i / width) | 0;
        data[i] += perlin.noise(x / quality, y / quality, z) * quality;
      }

      quality *= 4;
    }

    return data;
  }

  function getY(x: number, z: number) {
    return (data[x + z * worldWidth] * 0.15) | 0;
  }

  function setPlaneUv(
    plane: THREE.PlaneGeometry,
    textureIndex: number,
    totalTextures = 3
  ) {
    const textureRatio = 1 / totalTextures;
    const start = textureRatio * textureIndex;
    const end = start + textureRatio;

    const uv = new Float32Array([
      start,
      1, // bottom-left
      end,
      1, // bottom-right
      start,
      0, // top-right
      end,
      0, // top-left
    ]);

    plane.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  }
};
