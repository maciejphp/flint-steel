class Class {
	private static instance: Class;
	SelectedBlock: Block;
	Blocks: Record<string, Block> = {
		Air: { Id: 0 },
		Grass: { Id: 1 },
		Dirt: { Id: 2 },
		Brick: { Id: 3 },
		Sus: { Id: 4 },
		Noah: { Id: 5 },
	};

	private slots: { Div: HTMLDivElement; Block: Block }[] = [];

	private constructor() {
		this.SelectedBlock = this.Blocks.Sus;
		const inventory = document.getElementById("Inventory") as HTMLDivElement;

		Object.entries(this.Blocks).forEach(([blockName, block]) => {
			if (block.Id === 0) return; // skip air

			const slot = document.createElement("div");
			slot.textContent = `${block.Id} ${blockName}`;

			slot.onclick = () => {
				this.SelectedBlock = block;
				this.UpdateSelectedSlot();
			};

			this.slots.push({ Div: slot, Block: block });
			inventory.appendChild(slot);
		});

		this.UpdateSelectedSlot();

		document.addEventListener("keydown", (event) => {
			const key = parseInt(event.key, 10);
			if (!isNaN(key)) {
				const block = Object.values(this.Blocks).find((b) => b.Id === key);
				if (block) {
					this.SelectedBlock = block;
					this.UpdateSelectedSlot();
				}
			}
		});
	}

	private UpdateSelectedSlot() {
		this.slots.forEach((slot) => {
			if (slot.Block.Id === this.SelectedBlock.Id) {
				slot.Div.style.backgroundColor = "blue";
			} else {
				slot.Div.style.backgroundColor = "red";
			}
		});
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const InventoryController = Class.get();

declare global {
	type Blocks = typeof InventoryController.Blocks;
	interface Block {
		Id: number;
	}
}
