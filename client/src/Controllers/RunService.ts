import { ControllerService } from "../Modules/ControllerService";
import { Signal } from "../Utils/Signal";
import { Workspace } from "./Workspace";

class RunService {
	private PrevTime = Date.now();
	// Time = 0;

	Heartbeat = new Signal<number>();

	async Init() {
		Workspace.Renderer.setAnimationLoop(() => {
			const time = Date.now();
			const delta = (time - this.PrevTime) / 1000;
			// this.Time += delta;
			this.Heartbeat.Fire(delta);
			this.PrevTime = time;

			Workspace.Renderer.render(Workspace.Scene, Workspace.Camera);
		});
	}
}

ControllerService.Register("RunService", RunService);

declare global {
	interface ControllerConstructors {
		RunService: typeof RunService;
	}
}
