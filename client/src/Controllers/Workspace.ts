import {
	PerspectiveCamera,
	WebGLRenderer,
	Fog,
	Scene,
	TextureLoader,
	SRGBColorSpace,
	NearestFilter,
	ClampToEdgeWrapping,
	LinearMipMapLinearFilter,
	Texture,
} from "three";
import { Value } from "../Utils/Value";
import { Settings } from "../Modules/Settings";
import api from "../Modules/axiosConfig";
import { handleResponse } from "../Modules/Functions";

class Class {
	private static instance: Class;
	private GameLoaded = new Value(false);
	Camera: PerspectiveCamera;
	Scene: Scene;
	Renderer: WebGLRenderer;
	Blocks!: Block[];
	AtlasTexture!: HTMLImageElement;
	Texture!: Texture;

	private constructor() {
		const image = new Image();
		image.src = `${Settings.server}/flipbook`;

		image.onload = () => {
			this.AtlasTexture = image;
			this.CheckIfGameLoaded();
		};

		new TextureLoader().load(image.src, (loadedTexture) => {
			const textureSettings: Partial<Texture> = {
				colorSpace: SRGBColorSpace,
				wrapS: ClampToEdgeWrapping,
				wrapT: ClampToEdgeWrapping,
				generateMipmaps: true,
				minFilter: LinearMipMapLinearFilter,
				magFilter: NearestFilter,
			};
			Object.assign(loadedTexture, textureSettings);

			this.Texture = loadedTexture;
			this.CheckIfGameLoaded();
		});

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

		// Get blocks from server
		api.post("/getBlocks").then((response) => {
			const success = handleResponse(response);
			if (!success) return;
			this.Blocks = response.data as Block[];
			this.Blocks.sort((a, b) => (a.Uses > b.Uses ? -1 : 1));
			this.CheckIfGameLoaded();
		});
	}

	private CheckIfGameLoaded() {
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
