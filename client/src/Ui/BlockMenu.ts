import { Workspace } from "../Controllers/Workspace";
import { ControllerService } from "../Modules/ControllerService";
import { CreateBlockDisplay } from "../Modules/CreateBlockDisplay";

const UiController = ControllerService.GetController("UiController");
const HotbarController = ControllerService.GetController("HotbarController");

// Wait for the flipbook texture to be loaded
Workspace.WaitForGameLoaded().then(() => {
	(document.getElementById("go-to-block-upload-button") as HTMLButtonElement).addEventListener("click", () => {
		UiController.ToggleBlockMenu.Fire(false);
		UiController.ToggleBlockUpload.Fire(true);
	});

	(document.getElementById("go-to-block-menu-button") as HTMLButtonElement).addEventListener("click", () => {
		UiController.ToggleBlockUpload.Fire(false);
		UiController.ToggleBlockMenu.Fire(true);
	});

	UiController.ToggleBlockMenu.Connect((openIt) => {
		const blockMenu = document.getElementById("block-menu") as HTMLDivElement;
		UiController.ShowInstructions = !openIt;
		blockMenu.style.display = openIt ? "block" : "none";
	});

	const blockMenuContainer = document.getElementById("block-menu-container") as HTMLDivElement;

	Workspace.Blocks.forEach((block) => {
		const div = document.createElement("div");
		div.textContent = `${block.Name}`;
		div.style.cursor = "pointer";
		div.className = "block-menu-block";

		div.onclick = () => {
			HotbarController.Slots[HotbarController.SelectedSlotId].Block = block;
			HotbarController.Update();
		};

		div.style.backgroundImage = `url(${CreateBlockDisplay(block)})`;

		blockMenuContainer.appendChild(div);
	});
});
