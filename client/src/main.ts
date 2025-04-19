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
LocalPlayerController.Load();

// import loadFlyingBoxes from "./Worlds/FlyingBoxes";
// import loadValley from "./Worlds/Valley";
import load3dNoise from "./Worlds/3dNoise";
// import load3dNoise from "./Worlds/Shadow";

// import loadMinecraft from "./Worlds/Minecraft";

load3dNoise();
// loadValley()

//start 287
