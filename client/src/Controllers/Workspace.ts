import { Color, PerspectiveCamera, WebGLRenderer, Fog, Scene } from "three";
import { Value } from "../Utils/Value";

class Class {
	private static instance: Class;
	BlockFlipbookTexture = new Value<HTMLImageElement | undefined>();
	Camera: PerspectiveCamera;
	Scene: Scene;
	Renderer: WebGLRenderer;

	private constructor() {
		const image = new Image();
		// image.src = "../../public/texture.png";
		image.src = "https://raw.githubusercontent.com/maciejphp/flint-steel/refs/heads/main/client/public/texture.png";

		image.onload = () => {
			this.BlockFlipbookTexture.Set(image);
		};

		this.Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
		this.Camera.position.y = 10;

		this.Scene = new Scene();
		this.Scene.background = new Color(0xbfd1e5);
		this.Scene.fog = new Fog(0xbfd1e5, 300, 2000); // 0xffffff for that og minecraft fog

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

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const Workspace = Class.get();
