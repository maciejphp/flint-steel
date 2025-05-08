import { Workspace } from "./Workspace";
import { Signal } from "../Utils/Signal";

class Class {
	private static instance: Class;
	private PrevTime = Date.now();

	RenderStepped = new Signal<number>();

	private constructor() {
		Workspace.Renderer.setAnimationLoop(() => {
			const time = Date.now();
			this.RenderStepped.Fire((time - this.PrevTime) / 1000);
			this.PrevTime = time;

			Workspace.Renderer.render(Workspace.Scene, Workspace.Camera);
		});
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const RunService = Class.get();
