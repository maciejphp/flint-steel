import { ControllerService } from "../Modules/ControllerService";

const defaultHotbar = [1, 2, 3];

class HotbarController {
	Slots: { Div: HTMLDivElement; Block: Block }[] = [];
	SelectedSlotId = 0;

	Update() {
		const LocalPlayerController = ControllerService.GetController("LocalPlayerController");

		this.Slots.forEach((slot, index) => {
			if (index === this.SelectedSlotId) {
				slot.Div.style.backgroundColor = "blue";
			} else {
				slot.Div.style.backgroundColor = "red";
			}
			slot.Div.textContent = `blockId: ${slot.Block.Id}`;
		});

		console.log("Selected block", this.Slots);
		LocalPlayerController.SelectedBlock = this.Slots[this.SelectedSlotId].Block;
	}

	Init() {
		const LocalPlayerController = ControllerService.GetController("LocalPlayerController");
		const UiController = ControllerService.GetController("UiController");
		const inventory = document.getElementById("Inventory") as HTMLDivElement;

		// Create inventory ui
		defaultHotbar.forEach((blockId) => {
			const slot = document.createElement("div");
			slot.textContent = `blockId: ${blockId}`;

			const blockObject = { Id: blockId };

			slot.onclick = () => {
				LocalPlayerController.SelectedBlock = blockObject;
				this.Update();
			};

			this.Slots.push({ Div: slot, Block: blockObject });
			inventory.appendChild(slot);
		});

		// Create blockmenu button
		const blockMenuButton = document.createElement("div");
		blockMenuButton.textContent = `(e) Block Menu`;

		blockMenuButton.onclick = () => {
			LocalPlayerController.Controls.lock();
		};

		inventory.appendChild(blockMenuButton);

		this.Update();

		document.addEventListener("keydown", (event) => {
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
