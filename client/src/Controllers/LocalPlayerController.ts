import { PointerLockControls } from "three/examples/jsm/Addons.js";
import GravityMode from "../Modules/FirstPersonControls";
import FlyMode from "../Modules/FlyControls";

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
		this.Controls.object.position.y = 300;
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const LocalPlayerController = Class.get();
