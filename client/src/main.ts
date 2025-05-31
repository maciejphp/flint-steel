import Stats from "three/addons/libs/stats.module.js";
import load3dNoise from "./Worlds/3dNoise";
import { ControllerService } from "./Modules/ControllerService";

// Auto-import all controllers during build
const modules = import.meta.glob("/src/Controllers/*.ts", { eager: true });

// Import all Ui scripts
import.meta.glob("/src/Ui/*.ts", { eager: true });

// Wait for all files to register
Promise.all(Object.values(modules)).then(async () => {
	// After all controllers are registered, call Init on each
	for (const name of ControllerService.GetControllerNames()) {
		const controller = ControllerService.Get(name);

		// Only call Init if it exists
		if (typeof controller.Init === "function") {
			await controller.Init();
		}
	}

	const RunService = ControllerService.Get("RunService");

	const stats = new Stats();

	const container = document.getElementById("app") as HTMLDivElement;
	container.appendChild(stats.dom);

	RunService.Heartbeat.Connect(() => {
		stats.update();
	});

	load3dNoise();
});

// start 287
