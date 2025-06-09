import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIO, Socket } from "socket.io";

declare global {
	interface Player {
		Id: string;
		Name: string;
		Position: Vector3;
		Rotation: Vector3;
		Socket: Socket;
	}
}

class Class {
	private static instance: Class;
	App: express.Express;
	Io: SocketIO;
	Players = new Map<string, Player>();
	PlayersToUpdatePosition = new Set<Player>();

	constructor() {
		const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://flint-steel.vercel.app"];

		this.App = express();
		const port = 3000;
		const server = http.createServer(this.App);
		this.Io = new SocketIO(server, {
			cors: {
				origin: function (origin, callback) {
					// Allow requests with no origin (like curl or mobile apps)
					if (!origin || allowedOrigins.includes(origin)) {
						callback(null, true);
					} else {
						callback(new Error(`CORS not allowed origin: ${origin}`));
					}
				},
				credentials: true,
			},
		});

		this.App.use(
			cors({
				origin: function (origin, callback) {
					// Allow requests with no origin (like curl or mobile apps)
					if (!origin || allowedOrigins.includes(origin)) {
						callback(null, true);
					} else {
						callback(new Error(`CORS not allowed origin: ${origin}`));
					}
				},
				credentials: true,
			}),
		);

		// Ensure the server listens on the correct port
		server.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});

		// Update player positions to all clients
		setInterval(() => {
			// console.log("Updated player positions:", this.PlayersToUpdatePosition);
			const data = Array.from(this.PlayersToUpdatePosition).map((player) => ({
				Id: player.Id,
				Position: player.Position,
				Rotation: player.Rotation,
			}));
			if (data.length === 0) return;
			this.Io.emit("updatePlayerPositions", data);
			this.PlayersToUpdatePosition.clear();
		}, 100);
	}

	AddPlayer(socket: Socket): Player {
		const player: Player = {
			Id: socket.id,
			Name: `Player-${Math.floor(Math.random() * 1000)}`,
			Position: { x: 0, y: 0, z: 0 },
			Rotation: { x: 0, y: 0, z: 0 },
			Socket: socket,
		};

		// Listen for player position updates
		socket.on("playerPositionToServer", (data: { Position: Vector3; Rotation: Vector3 }) => {
			try {
				const player = this.Players.get(socket.id);
				if (player) {
					// copy position values directly
					player.Position.x = data.Position.x;
					player.Position.y = data.Position.y;
					player.Position.z = data.Position.z;
					// copy rotation values directly
					player.Rotation.x = data.Rotation.x;
					player.Rotation.y = data.Rotation.y;
					player.Rotation.z = data.Rotation.z;

					this.PlayersToUpdatePosition.add(player);
				}
			} catch (error) {
				console.error("Error updating player position:", error);
			}
		});

		this.Players.set(socket.id, player);

		// send online players to the new player
		const onlinePlayers = Array.from(this.Players.values()).map((p) => ({
			Id: p.Id,
			Name: p.Name,
			Position: p.Position,
			Rotation: p.Rotation,
		}));
		socket.emit("onlinePlayers", onlinePlayers);

		this.Io.emit("newPlayer", {
			Id: player.Id,
			Name: player.Name,
			Position: player.Position,
			Rotation: player.Rotation,
		});
		return player;
	}

	RemovePlayer(socket: Socket): void {
		this.Players.delete(socket.id);
		this.PlayersToUpdatePosition.forEach((player) => {
			if (player.Id === socket.id) {
				this.PlayersToUpdatePosition.delete(player);
			}
		});

		this.Io.emit("removePlayer", socket.id);
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const ServerService = Class.get();
