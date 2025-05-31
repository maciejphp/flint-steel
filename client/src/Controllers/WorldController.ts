import { World } from "../Modules/Terrain/World";
import {
	Vector3,
	ClampToEdgeWrapping,
	LinearMipMapLinearFilter,
	MeshPhongMaterial,
	NearestFilter,
	SRGBColorSpace,
	TextureLoader,
} from "three";
import { Settings } from "../Modules/Settings";
import { getChunkId, getChunkPosition, postRequest } from "../Modules/Functions";
import { ControllerService } from "../Modules/ControllerService";
import InitBlockBreaking from "../Modules/Terrain/BlockBreaking";
import { Workspace } from "./Workspace";
import { Signal } from "../Utils/Signal";

declare global {
	type TextureSettings = {
		Material: MeshPhongMaterial;
		TextureRatio: number;
	};
}

class WorldController {
	World!: World;
	TextureSettings: TextureSettings = {
		Material: new MeshPhongMaterial(),
		TextureRatio: 1,
	};

	UpdateBlockData = new Signal();

	LoadBlockData(): void {
		let stuffLoaded = 0;

		const checkIfLoaded = () => {
			stuffLoaded++;
			if (stuffLoaded > 1) {
				const newBlockAdded = Workspace.GameLoaded.Value;
				Workspace.GameLoaded.Set(true);

				const HotbarController = ControllerService.Get("HotbarController");

				// Update material and texture ratio when new blocks are added
				this.TextureSettings.Material.map = Workspace.Texture;
				this.TextureSettings.Material.needsUpdate = true;
				this.TextureSettings.TextureRatio = 1 / Workspace.Blocks.length;

				if (newBlockAdded) {
					HotbarController.Slots[HotbarController.SelectedSlotId].Block =
						Workspace.Blocks[Workspace.Blocks.length - 1];
				}
				HotbarController.Update();

				// Update all loaded chunks with the new material
				this.World.LoadedChunks.forEach((chunk) => {
					// if (chunk.mesh) {
					// chunk.mesh.material = this.TextureSettings.Material;
					// (chunk.mesh.material as MeshPhongMaterial).needsUpdate = true;
					// if (chunk.mesh.geometry) {
					// 	chunk.mesh.geometry.dispose();
					// }
					// chunk.mesh = undefined;
					// // chunk.Generate();
					// this.World.ChunkGenerateQueue.push(chunk);
					// }
					this.World.DestroyChunk(chunk);
				});

				console.log("WorldController: All block data loaded");
				this.UpdateBlockData.Fire();
			}
		};

		const loadImage = (retryCount = 0, maxRetries = 5): Promise<HTMLImageElement> => {
			const image = new Image();
			image.crossOrigin = "anonymous";
			return new Promise((resolve, reject) => {
				image.src = `${Settings.server}/atlasTexture`;

				image.onload = () => {
					resolve(image);
				};

				image.onerror = () => {
					console.warn(`Failed to load texture (attempt ${retryCount + 1}/${maxRetries})`);
					if (retryCount < maxRetries) {
						loadImage(retryCount + 1, maxRetries)
							.then(resolve)
							.catch(reject);
					} else {
						reject(new Error("Failed to load texture after max retries"));
					}
				};
			});
		};

		loadImage().then((image) => {
			Workspace.AtlasTexture = image;
			Workspace.Texture = new TextureLoader().load(`${Settings.server}/atlasTexture?t=${Date.now()}`, () => {
				Workspace.Texture.colorSpace = SRGBColorSpace;
				Workspace.Texture.minFilter = LinearMipMapLinearFilter;
				Workspace.Texture.magFilter = NearestFilter;
				Workspace.Texture.wrapS = ClampToEdgeWrapping;
				Workspace.Texture.wrapT = ClampToEdgeWrapping;
				checkIfLoaded();
			});
		});

		// Get blocks from server
		postRequest<Block[], undefined>("/getBlocks").then((response) => {
			Workspace.Blocks = response;
			// Workspace.Blocks.sort((a, b) => (a.Uses > b.Uses ? -1 : 1));
			checkIfLoaded();
		});
	}

	async Init() {
		console.log("creating world controller");
		this.World = new World(this.TextureSettings);
		InitBlockBreaking();

		this.LoadBlockData();

		// // Update material and texture ratio when new blocks are added
		// const HotbarController = ControllerService.Get("HotbarController");
		// const updateTextures = () => {
		// 	this.TextureSettings.Material.map = Workspace.Texture;
		// 	this.TextureSettings.Material.needsUpdate = true;
		// 	this.TextureSettings.TextureRatio = 1 / Workspace.Blocks.length;

		// 	HotbarController.Update();

		// 	// Update all loaded chunks with the new material
		// 	this.World.LoadedChunks.forEach((chunk) => {
		// 		if (chunk.mesh) {
		// 			chunk.mesh.material = this.TextureSettings.Material;
		// 			chunk.mesh.material.needsUpdate = true;
		// 		}
		// 	});
		// };
		// this.UpdateBlockData.Connect(updateTextures);

		// Handle new blocks getting added
		const ServerController = ControllerService.Get("ServerController");
		ServerController.Socket.on("newBlock", () => {
			setTimeout(() => {
				this.LoadBlockData();
			}, 500);
		});
	}

	private FetchNearestChunks(center: Vector3): void {
		const minX = center.x - Settings.renderDistance;
		const maxX = center.x + Settings.renderDistance;
		const minZ = center.z - Settings.renderDistance;
		const maxZ = center.z + Settings.renderDistance;

		for (let x = minX; x <= maxX; x += 1) {
			for (let z = minZ; z <= maxZ; z += 1) {
				const distance = Math.sqrt((center.x - x) ** 2 + (center.z - z) ** 2);
				if (distance > Settings.renderDistance) continue;

				const chunk = this.World.LoadedChunks.get(getChunkId(x, z));

				if (chunk === undefined || (chunk.fetched && !chunk.generated)) {
					this.World.GenerateChunk(new Vector3(x, 0, z));
				}
			}
		}
	}

	Start() {
		const RunService = ControllerService.Get("RunService");

		// Gather chunks to generate
		RunService.Heartbeat.Connect(() => {
			const playerChunkPosition = getChunkPosition(Workspace.Camera.position.clone());
			// Generate new chunk
			this.FetchNearestChunks(playerChunkPosition);

			// Unload far away chunk
			this.World.LoadedChunks.forEach((chunk) => {
				const distance = chunk.chunkPosition.clone().sub(playerChunkPosition).length();
				if (distance > Settings.chunkUnloadDistance) {
					this.World.DestroyChunk(chunk);
				}
			});
			// console.log(`chunk count: ${this.World.LoadedChunks.length}`);
		});
	}
}

ControllerService.Register("WorldController", WorldController);

declare global {
	interface ControllerConstructors {
		WorldController: typeof WorldController;
	}
}
