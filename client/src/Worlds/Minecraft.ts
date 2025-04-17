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

  const pxGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pxGeometry.attributes.uv.array[1] = 0.5;
  pxGeometry.attributes.uv.array[3] = 0.5;
  pxGeometry.rotateY(Math.PI / 2);
  pxGeometry.translate(haldBlockSize, 0, 0);

  const nxGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  nxGeometry.attributes.uv.array[1] = 0.5;
  nxGeometry.attributes.uv.array[3] = 0.5;
  nxGeometry.rotateY(-Math.PI / 2);
  nxGeometry.translate(-haldBlockSize, 0, 0);

  const pyGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pyGeometry.attributes.uv.array[5] = 0.5;
  pyGeometry.attributes.uv.array[7] = 0.5;
  pyGeometry.rotateX(-Math.PI / 2);
  pyGeometry.translate(0, haldBlockSize, 0);

  const pzGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  pzGeometry.attributes.uv.array[1] = 0.5;
  pzGeometry.attributes.uv.array[3] = 0.5;
  pzGeometry.translate(0, 0, haldBlockSize);

  const nzGeometry = new THREE.PlaneGeometry(blockSize, blockSize);
  nzGeometry.attributes.uv.array[1] = 0.5;
  nzGeometry.attributes.uv.array[3] = 0.5;
  nzGeometry.rotateY(Math.PI);
  nzGeometry.translate(0, 0, -haldBlockSize);

  //

  const geometries = [];

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

      geometries.push(pyGeometry.clone().applyMatrix4(matrix));

      if ((px !== h && px !== h + 1) || x === 0) {
        geometries.push(pxGeometry.clone().applyMatrix4(matrix));
      }

      if ((nx !== h && nx !== h + 1) || x === worldWidth - 1) {
        geometries.push(nxGeometry.clone().applyMatrix4(matrix));
      }

      if ((pz !== h && pz !== h + 1) || z === worldDepth - 1) {
        geometries.push(pzGeometry.clone().applyMatrix4(matrix));
      }

      if ((nz !== h && nz !== h + 1) || z === 0) {
        geometries.push(nzGeometry.clone().applyMatrix4(matrix));
      }
    }
  }

  // geometries.forEach((geometry) => {
  //   const mesh = new THREE.Mesh(
  //     geometry,
  //     // new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide })
  //     new THREE.MeshStandardMaterial({ color: 0xff6347 })
  //   );
  //   scene.add(mesh);
  // });
  const geometry = BufferGeometryUtils.mergeGeometries(geometries);
  geometry.computeBoundingSphere();

  //   const texture = new THREE.TextureLoader().load(
  //     "textures/minecraft/atlas.png"
  //   );
  //   texture.colorSpace = THREE.SRGBColorSpace;
  //   texture.magFilter = THREE.NearestFilter;

  const mesh = new THREE.Mesh(
    geometry,
    // new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide })
    new THREE.MeshStandardMaterial({ color: 0xff6347 })
  );

  scene.add(mesh);

  const ambientLight = new THREE.AmbientLight(0xeeeeee, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 12);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);

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
};
