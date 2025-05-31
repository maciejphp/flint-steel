/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { io, Socket } from "socket.io-client";
import { Settings } from "../Modules/Settings";
import { Vector3 } from "three";
import { getChunkBlockPosition, getChunkPosition, positionToId, postRequest } from "../Modules/Functions";
import { ControllerService } from "../Modules/ControllerService";

const blockUpdateDelay = 500; // 500ms
let lastBlockUpdate = 0;

class ServerController {
	Socket!: Socket;
	Connected = false;
	BlockUpdateQueue = new Map<Vector3, number>();

	async Init() {
		const RunService = ControllerService.Get("RunService");

		this.Socket = io(Settings.server, {
			withCredentials: true,
		});

		this.Socket.on("connect", () => {
			console.log("Connected to socket server");
			this.Connected = true;
			document.getElementById("loading-screen-message")!.innerHTML += "<p>Connected to Server</p>";
		});

		RunService.Heartbeat.Connect(() => {
			// Save every 500ms
			if (Date.now() - lastBlockUpdate < blockUpdateDelay) return;

			lastBlockUpdate = Date.now();

			const blockUpdateData: { ChunkPosition: { x: number; z: number }; PositionId: number; BlockId: number }[] =
				[];
			for (const [position, id] of this.BlockUpdateQueue) {
				const chunkPosition = getChunkPosition(position.clone());
				blockUpdateData.push({
					ChunkPosition: { x: chunkPosition.x, z: chunkPosition.z },
					PositionId: positionToId(getChunkBlockPosition(position.clone(), chunkPosition.clone())),
					BlockId: id,
				});
			}

			if (blockUpdateData.length > 0) {
				this.Socket.emit("updateBlock", blockUpdateData);
				this.BlockUpdateQueue.clear();
			}
		});
	}

	UpdateBlock(blockPosition: Vector3, blockId: number) {
		this.BlockUpdateQueue.set(blockPosition, blockId);
	}

	async GetChunkData(chunkPositions: Vector3[]): Promise<[Record<string, number[]>, boolean]> {
		document.getElementById("loading-screen-message")!.innerHTML += "<p>Loading chunks...</p>";

		const chunkData = await postRequest<Record<string, number[]>, { ChunkPositions: { x: number; z: number }[] }>(
			"/world/getChunks",
			{
				ChunkPositions: chunkPositions.map((chunk) => {
					return {
						x: chunk.x,
						z: chunk.z,
					};
				}),
			},
		);

		document.getElementById("loading-screen")!.style.display = "none";
		return [chunkData, true];
	}

	async UploadBlock(data: string, name: string): Promise<[string, boolean]> {
		if (name === "") return ["Name is empty", false];

		document.getElementById("loading-screen-message")!.innerHTML += "<p>Loading chunks...</p>";

		return new Promise<[string, boolean]>((resolve) => {
			postRequest<number[][], { Image: string; Name: string }>("/uploadBlock", {
				Image: data,
				Name: name,
			})
				.then(() => {
					resolve(["", true]);
				})
				.catch((error) => {
					resolve([error, false]);
				});
		});
	}
}

ControllerService.Register("ServerController", ServerController);

declare global {
	interface ControllerConstructors {
		ServerController: typeof ServerController;
	}
}
