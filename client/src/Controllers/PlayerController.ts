import { TeapotGeometry } from "three/examples/jsm/Addons.js";
import { ControllerService } from "../Modules/ControllerService";
import { Vector3, Mesh, MeshPhongMaterial, TextureLoader } from "three";
import { Workspace } from "./Workspace";

class PlayerController {
	Players = new Map<string, Player>();

	async Init() {
		const ServerController = ControllerService.Get("ServerController");

		ServerController.Socket.on("newPlayer", (player: Player) => {
			// Ignore own player (you)
			if (ServerController.Socket.id === player.Id) return;
			this.CreatePlayer(player);
		});

		ServerController.Socket.on("removePlayer", (playerId: string) => {
			this.RemovePlayer(playerId);
		});

		ServerController.Socket.on(
			"updatePlayerPositions",
			(players: { Id: string; Position: Vector3; Rotation: Vector3 }[]) => {
				// console.log("updatinf position");
				players.forEach(({ Id, Position, Rotation }) => {
					const player = this.Players.get(Id);
					if (player) {
						player.Position = Position;
						player.Rotation = Rotation;

						player.Model.position.copy(Position);
						player.Model.rotation.set(Rotation.x, Rotation.y, Rotation.z);
					}
				});
			},
		);

		ServerController.Socket.on("onlinePlayers", (players: Omit<Player, "Model">[]) => {
			players.forEach((player) => {
				// Ignore own player (you)
				if (ServerController.Socket.id === player.Id) return;
				this.CreatePlayer(player);
			});
		});
	}

	private async CreatePlayer(serverPlayer: Omit<Player, "Model">) {
		const createModel = async (): Promise<Mesh> => {
			// Wait for the model to be loaded
			return new Promise<Mesh>((resolve) => {
				const texture = new TextureLoader().load("../../parsa.png");
				const geometry = new TeapotGeometry();
				geometry.scale(0.01, 0.01, 0.01);
				geometry.rotateY(Math.PI / 2);
				const material = new MeshPhongMaterial({ map: texture });
				const mesh = new Mesh(geometry, material);
				resolve(mesh);
			});
		};

		const player: Player = Object.assign(
			{
				Model: await createModel(),
			},
			serverPlayer,
		);

		player.Model.position.copy(player.Position);
		player.Model.rotation.set(player.Rotation.x, player.Rotation.y, player.Rotation.z);
		Workspace.Scene.add(player.Model); // Add the model to the scene

		this.Players.set(player.Id, player);
	}

	private RemovePlayer(playerId: string) {
		const player = this.Players.get(playerId);
		if (player) {
			this.Players.delete(playerId);
			player.Model.removeFromParent(); // Remove the model from the scene
		}
	}
}

ControllerService.Register("PlayerController", PlayerController);

declare global {
	interface ControllerConstructors {
		PlayerController: typeof PlayerController;
	}

	interface Player {
		Id: string;
		Name: string;
		Position: Vector3;
		Rotation: Vector3;
		Model: Mesh;
	}
}
