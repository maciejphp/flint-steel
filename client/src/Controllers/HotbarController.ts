import { ControllerService } from "../Modules/ControllerService";
import { CreateBlockDisplay } from "../Modules/CreateBlockDisplay";
import { Workspace } from "./Workspace";

const defaultHotbar = [0, 1, 2, 3, 4];

class HotbarController {
	private Created = false;
	Slots: { Div: HTMLDivElement; Block: Block }[] = [];
	SelectedSlotId = 0;
	SelectedBlock!: Block;

	Update() {
		if (!this.Created) this.SetupHotbar();

		this.Slots.forEach((slot, index) => {
			slot.Div.innerHTML = "";

			if (index === this.SelectedSlotId) {
				slot.Div.style.outline = "4px solid rgb(211, 211, 211)";
			} else {
				slot.Div.style.outline = "#1a1a1a 1px solid";
			}
			slot.Div.textContent = `${slot.Block.Name}`;

			slot.Div.style.backgroundImage = `url(${CreateBlockDisplay(slot.Block)})`;
		});

		this.SelectedBlock = this.Slots[this.SelectedSlotId].Block;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async Init() {}

	SetupHotbar() {
		this.Created = true;
		const LocalPlayerController = ControllerService.Get("LocalPlayerController");
		const UiController = ControllerService.Get("UiController");
		const hotbar = document.getElementById("hotbar") as HTMLDivElement;

		// Create hotbar ui
		defaultHotbar.forEach((blockId) => {
			const slot = document.createElement("div");
			slot.textContent = `blockId: ${blockId}`;

			const blockObject = Workspace.Blocks[blockId];

			slot.onclick = () => {
				this.SelectedBlock = blockObject;
				this.Update();
			};

			this.Slots.push({ Div: slot, Block: blockObject });
			hotbar.appendChild(slot);
		});

		// Create blockmenu button
		const blockMenuButton = document.createElement("div");
		blockMenuButton.innerHTML = `Block Menu<br>(e)`;

		blockMenuButton.onclick = () => {
			LocalPlayerController.Controls.lock();
		};

		hotbar.appendChild(blockMenuButton);

		this.Update();

		document.addEventListener("keydown", (event) => {
			const target = event.target as HTMLElement;
			const isTypingInInput =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				(target as HTMLElement).isContentEditable;

			if (isTypingInInput) return;

			const key = parseInt(event.key, 10);
			if (!isNaN(key) && key > 0 && key <= defaultHotbar.length) {
				this.SelectedSlotId = key - 1;
				this.Update();
			}

			if (event.key === "e" || event.key === "E") {
				if (LocalPlayerController.Controls.isLocked) {
					UiController.ToggleBlockMenu.Fire(true);
					UiController.Unlock();
				} else {
					UiController.ToggleBlockMenu.Fire(false);
					UiController.ToggleBlockUpload.Fire(false);
					UiController.Lock();
				}
			}
		});
	}
}

ControllerService.Register("HotbarController", HotbarController);
declare global {
	interface ControllerConstructors {
		HotbarController: typeof HotbarController;
	}
}
