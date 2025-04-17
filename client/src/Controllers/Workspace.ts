import * as THREE from "three";

class Class {
  private static instance: Class;

  Camera: THREE.PerspectiveCamera;
  Scene: THREE.Scene;
  Renderer: THREE.WebGLRenderer;

  private constructor() {
    console.log("Initializing Workspace...");

    this.Camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.Camera.position.y = 10;

    this.Scene = new THREE.Scene();
    this.Scene.background = new THREE.Color(0xbfd1e5);
    this.Scene.fog = new THREE.Fog(0xffffff, 0, 2000);

    this.Renderer = new THREE.WebGLRenderer({ antialias: true });
    this.Renderer.setPixelRatio(window.devicePixelRatio);
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.Renderer.domElement);

    window.addEventListener("resize", () => {
      this.Camera.aspect = window.innerWidth / window.innerHeight;
      this.Camera.updateProjectionMatrix();

      this.Renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public static get(): Class {
    if (!Class.instance) {
      Class.instance = new Class();
    }
    return Class.instance;
  }
}

export const Workspace = Class.get();
