import { ControllerService } from "../Modules/ControllerService";
import { Signal } from "../Utils/Signal";

const LocalPlayerController = ControllerService.GetController("LocalPlayerController");

class UiController {
	ToggleBlockUpload = new Signal<boolean>();
	ToggleBlockMenu = new Signal<boolean>();
	ShowInstructions = true;

	Lock = () => LocalPlayerController.Controls.lock();
	Unlock = () => LocalPlayerController.Controls.unlock();

	Init() {
		const blocker = document.getElementById("blocker") as HTMLDivElement;
		const instructions = document.getElementById("instructions") as HTMLDivElement;

		instructions.addEventListener("click", () => {
			LocalPlayerController.Controls.lock();
		});

		LocalPlayerController.Controls.addEventListener("lock", () => {
			blocker.style.display = "none";
			instructions.style.display = "none";
		});

		LocalPlayerController.Controls.addEventListener("unlock", () => {
			blocker.style.display = "block";
			if (this.ShowInstructions) instructions.style.display = "";
		});
	}
}

ControllerService.Register("UiController", UiController);

declare global {
	interface ControllerConstructors {
		UiController: typeof UiController;
	}
}
