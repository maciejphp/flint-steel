import { Raycaster, Vector2, Vector3 } from "three";
import { Workspace } from "../../Controllers/Workspace";
import { ServerController } from "../../Controllers/ServerController";
import { getChunkBlockPosition, getChunkId, getChunkPosition, positionToId } from "../Functions";
import { ControllerService } from "../ControllerService";
import { RunService } from "../../Controllers/RunService";

export default (): void => {
	const LocalPlayerController = ControllerService.GetController("LocalPlayerController");
	const WorldController = ControllerService.GetController("WorldController");

	const raycaster = new Raycaster();

	function breakBlock() {
		raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
		const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

		if (ray && ray.distance < 8) {
			if (!ray.normal) return;
			let blockPosition = ray.point.add(ray.normal.multiply(new Vector3(-0.5, -0.5, -0.5)));

			blockPosition = new Vector3(
				Math.round(blockPosition.x),
				Math.round(blockPosition.y),
				Math.round(blockPosition.z),
			);
			const chunkPosition = getChunkPosition(blockPosition.clone());
			const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
			if (chunk) {
				WorldController.World.UpdateBlocks([
					{
						ChunkPosition: chunkPosition,
						PositionId: positionToId(getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone())),
						BlockId: 0,
					},
				]);

				ServerController.UpdateBlock(blockPosition, 0);
			}
		}
	}

	function placeBlock() {
		raycaster.setFromCamera(new Vector2(0, 0), Workspace.Camera);
		const ray = raycaster.intersectObjects(Workspace.Scene.children)[0];

		if (ray && ray.distance < 8) {
			if (!ray.normal) return;
			let blockPosition = ray.point.add(ray.normal.multiplyScalar(0.5));
			const block = LocalPlayerController.SelectedBlock;

			blockPosition = new Vector3(
				Math.round(blockPosition.x),
				Math.round(blockPosition.y),
				Math.round(blockPosition.z),
			);

			const chunkPosition = getChunkPosition(blockPosition.clone());
			const chunk = WorldController.World.LoadedChunks.get(getChunkId(chunkPosition.x, chunkPosition.z));
			if (chunk) {
				WorldController.World.UpdateBlocks([
					{
						ChunkPosition: chunkPosition,
						PositionId: positionToId(getChunkBlockPosition(blockPosition.clone(), chunkPosition.clone())),
						BlockId: block.Id,
					},
				]);

				ServerController.UpdateBlock(blockPosition, block.Id);
			}
		}
	}

	const blockUpdateDelay = 100;
	let lastBlockUpdate = 0;

	let leftButtonDown = false;
	let rightButtonDown = false;

	RunService.Heartbeat.Connect(() => {
		if (!LocalPlayerController.Controls.isLocked) return;

		if (leftButtonDown && Date.now() - lastBlockUpdate > blockUpdateDelay) {
			lastBlockUpdate = Date.now();
			breakBlock();
		}

		if (rightButtonDown && Date.now() - lastBlockUpdate > blockUpdateDelay) {
			lastBlockUpdate = Date.now();
			placeBlock();
		}
	});

	window.addEventListener("mousedown", (e) => {
		if (!LocalPlayerController.Controls.isLocked) return;

		switch (e.button) {
			case 0: // Left button clicked.
				leftButtonDown = true;
				breakBlock();
				break;
			case 2: // Right button clicked
				rightButtonDown = true;
				placeBlock();
				break;
		}
	});

	window.addEventListener("mouseup", (e) => {
		if (!LocalPlayerController.Controls.isLocked) return;

		switch (e.button) {
			case 0: // Left button released.
				leftButtonDown = false;
				break;
			case 2: // Right button released.
				rightButtonDown = false;
				break;
		}
	});
};
