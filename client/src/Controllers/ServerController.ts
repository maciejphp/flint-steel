/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { io, Socket } from "socket.io-client";
import { Settings } from "../Modules/Settings";
import { Vector3 } from "three";
import { getChunkBlockPosition, getChunkPosition, handleResponse, positionToId } from "../Modules/Functions";
import api from "../Modules/axiosConfig";
import { RunService } from "./RunService";

const blockUpdateDelay = 500; // 500ms
let lastBlockUpdate = 0;

class Class {
	private static instance: Class;
	Socket: Socket;
	Connected = false;
	BlockUpdateQueue = new Map<Vector3, number>();

	constructor() {
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
				console.log(blockUpdateData);
				this.BlockUpdateQueue.clear();
			}
		});
	}

	async UpdateBlock(blockPosition: Vector3, blockId: number) {
		this.BlockUpdateQueue.set(blockPosition, blockId);
		// const chunkPosition = getChunkPosition(blockPosition.clone());

		// this.Socket.emit("updateBlock", {
		// 	ChunkPosition: { x: chunkPosition.x, z: chunkPosition.z },
		// 	PositionId: positionToId(getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone())),
		// 	BlockId: blockId,
		// });
	}

	async GetChunkData(chunkPositions: Vector3[]): Promise<[Record<string, number[]>, boolean]> {
		document.getElementById("loading-screen-message")!.innerHTML += "<p>Loading chunks...</p>";
		const response = await api.post("/world/getChunks", {
			ChunkPositions: chunkPositions.map((chunk) => {
				return {
					x: chunk.x,
					z: chunk.z,
				};
			}),
		});
		const success = handleResponse(response);
		response.data.ChunkData as number[][];
		document.getElementById("loading-screen")!.style.display = "none";
		return [response.data.ChunkData, success];
	}

	async UploadBlock(data: string, name: string): Promise<[string, boolean]> {
		if (name === "") return ["Name is empty", false];

		document.getElementById("loading-screen-message")!.innerHTML += "<p>Loading chunks...</p>";
		const response = await api.post("/uploadBlock", { Image: data, Name: name });
		const success = handleResponse(response);
		response.data.Error as number[][];
		return [response.data.Error, success];
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const ServerController = Class.get();
