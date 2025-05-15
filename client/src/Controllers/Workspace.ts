import { PerspectiveCamera, WebGLRenderer, Fog, Scene } from "three";
import { Value } from "../Utils/Value";
import { Settings } from "../Modules/Settings";

class Class {
	private static instance: Class;
	private BlockFlipbookTexture = new Value<HTMLImageElement | undefined>();
	BlockCount = 0;
	Camera: PerspectiveCamera;
	Scene: Scene;
	Renderer: WebGLRenderer;

	private constructor() {
		const image = new Image();
		image.src = `${Settings.server}/flipbook`;
		// image.src = "https://cdn.glitch.global/2ba9cbe6-f362-4b66-a674-7d191aacabb6/flipbook.png?v=1747216470021";

		image.onload = () => {
			this.BlockFlipbookTexture.Set(image);
		};

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

	async getBlockFlipbookTexture() {
		return (
			Workspace.BlockFlipbookTexture.Value ??
			(await new Promise<HTMLImageElement>((resolve) => {
				Workspace.BlockFlipbookTexture.Changed((image) => {
					if (image) resolve(image);
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
