import { PointerLockControls } from "three/examples/jsm/Addons.js";
import GravityMode from "../Modules/FirstPersonControls";
import FlyMode from "../Modules/FlyControls";
import { Matrix4 } from "three";

class Class {
	private static instance: Class;
	Controls: PointerLockControls;

	Fly = true;

	constructor() {
		if (this.Fly) {
			this.Controls = FlyMode();
		} else {
			this.Controls = GravityMode();
		}

		//save player position
		const savePlayerPosition = () => {
			localStorage.setItem("playerMatrix", JSON.stringify(this.Controls.object.matrix));
		};
		window.addEventListener("unload", savePlayerPosition);
		setInterval(savePlayerPosition, 5000);

		const savedPosition = localStorage.getItem("playerMatrix");
		if (savedPosition) {
			console.log(savedPosition);
			this.Controls.object.applyMatrix4(JSON.parse(savedPosition) as Matrix4);
		} else {
			this.Controls.object.position.y = 300;
		}
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const LocalPlayerController = Class.get();
