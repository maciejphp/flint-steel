import { PerspectiveCamera, WebGLRenderer, Fog, Scene, Texture } from "three";
import { Value } from "../Utils/Value";

class Class {
	private static instance: Class;
	GameLoaded = new Value(false);
	Camera: PerspectiveCamera;
	Scene: Scene;
	Renderer: WebGLRenderer;
	Blocks!: Block[];
	AtlasTexture!: HTMLImageElement;
	Texture!: Texture;

	private constructor() {
		this.Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
		this.Camera.position.y = 10;

		this.Scene = new Scene();
		// this.Scene.background = new Color(0xbfd1e5);
		this.Scene.fog = new Fog(0x6a94bc, 50, 300); // 0xffffff for that og minecraft fog

		this.Renderer = new WebGLRenderer({ antialias: true });
		this.Renderer.setPixelRatio(window.devicePixelRatio);
		this.Renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.Renderer.domElement);

		window.addEventListener("resize", () => {
			this.Camera.aspect = window.innerWidth / window.innerHeight;
			this.Camera.updateProjectionMatrix();

			this.Renderer.setSize(window.innerWidth, window.innerHeight);
		});
	}

	CheckIfGameLoaded() {
		if (this.AtlasTexture && this.Blocks && this.Texture) {
			this.GameLoaded.Set(true);
		}
	}

	async WaitForGameLoaded() {
		return (
			Workspace.GameLoaded.Value ||
			(await new Promise((resolve) => {
				Workspace.GameLoaded.Changed((value) => {
					if (value) {
						resolve(true);
					}
				});
			}))
		);
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const Workspace = Class.get();
