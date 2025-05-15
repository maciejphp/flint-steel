import { Workspace } from "../Controllers/Workspace";
import { ControllerService } from "../Modules/ControllerService";

const UiController = ControllerService.GetController("UiController");
const HotbarController = ControllerService.GetController("HotbarController");

// Wait for the flipbook texture to be loaded
Workspace.getBlockFlipbookTexture().then(() => {
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

	const blockMenu = document.getElementById("block-menu") as HTMLDivElement;

	for (let index = 1; index <= Workspace.BlockCount; index++) {
		const div = document.createElement("div");
		div.textContent = `(${index}) Block`;

		div.onclick = () => {
			console.log(`Clicked on block ${index}`);
			HotbarController.Slots[HotbarController.SelectedSlotId].Block.Id = index;
			HotbarController.Update();
		};

		blockMenu.appendChild(div);
	}
});
