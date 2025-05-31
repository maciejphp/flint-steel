import { Workspace } from "../Controllers/Workspace";
import { ControllerService } from "../Modules/ControllerService";
import { CreateBlockDisplay } from "../Modules/CreateBlockDisplay";

const UiController = ControllerService.Get("UiController");
const HotbarController = ControllerService.Get("HotbarController");
const WorldController = ControllerService.Get("WorldController");

// Wait for the atlasTexture texture to be loaded

// Workspace.WaitForGameLoaded().then(() => {
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

const refreshBlockMenu = () => {
	console.log("Refreshing block menu");
	blockMenuContainer.innerHTML = ""; // Clear previous content

	const deepcopyBlocks = [...Workspace.Blocks];
	deepcopyBlocks.sort((a, b) => (a.Uses > b.Uses ? -1 : 1));

	deepcopyBlocks.forEach((block) => {
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
};

WorldController.UpdateBlockData.Connect(refreshBlockMenu);
Workspace.WaitForGameLoaded().then(refreshBlockMenu);

// setInterval(() => {
// 	refreshBlockMenu();
// }, 1000);
