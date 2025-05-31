import { ControllerService } from "../Modules/ControllerService";
import { Signal } from "../Utils/Signal";
import { Workspace } from "./Workspace";

class RunService {
	private PrevTime = Date.now();

	Heartbeat = new Signal<number>();

	async Init() {
		Workspace.Renderer.setAnimationLoop(() => {
			const time = Date.now();
			this.Heartbeat.Fire((time - this.PrevTime) / 1000);
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
