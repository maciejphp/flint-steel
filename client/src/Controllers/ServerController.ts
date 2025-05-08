/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { io, Socket } from "socket.io-client";
import { Settings } from "../Modules/Settings";
import { Vector3 } from "three";
import { handleResponse } from "../Modules/Functions";
import api from "../Modules/axiosConfig";

class Class {
	private static instance: Class;
	Socket: Socket;
	Connected = false;

	constructor() {
		this.Socket = io(Settings.server, {
			withCredentials: true,
		});

		this.Socket.on("connect", () => {
			console.log("Connected to server");
			this.Connected = true;
			document.getElementById("loading-screen-message")!.innerHTML += "<p>Connected to Server</p>";
		});
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

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const ServerController = Class.get();
