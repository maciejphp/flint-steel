import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import { Workspace } from "../Controllers/Workspace";
import { RunService } from "../Controllers/RunService";

export default (): void => {
  const controls = new FirstPersonControls(
    Workspace.Camera,
    Workspace.Renderer.domElement
  );

  controls.movementSpeed = 100;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;

  const blocker = document.getElementById("blocker") as HTMLDivElement;
  const instructions = document.getElementById(
    "instructions"
  ) as HTMLDivElement;
  instructions.style.display = "none";
  blocker.style.display = "none";

  RunService.RenderStepped.Connect((delta) => {
    controls.update(delta);
  });
};
