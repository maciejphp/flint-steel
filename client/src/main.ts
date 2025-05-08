import Stats from "three/addons/libs/stats.module.js";
import { LocalPlayerController } from "./Controllers/LocalPlayerController";
import { RunService } from "./Controllers/RunService";

const stats = new Stats();

const container = document.getElementById("app") as HTMLDivElement;
container.appendChild(stats.dom);

RunService.RenderStepped.Connect(() => {
	stats.update();
});

LocalPlayerController.Fly = true;

import load3dNoise from "./Worlds/3dNoise";

load3dNoise();
// loadValley()

//start 287
