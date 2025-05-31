import { Raycaster, Vector2, Vector3 } from "three";
import { getChunkBlockPosition, getChunkId, getChunkPosition, positionToId } from "../Functions";
import { ControllerService } from "../ControllerService";
import { Workspace } from "../../Controllers/Workspace";

export default (): void => {
	const ServerController = ControllerService.Get("ServerController");
	const HotbarController = ControllerService.Get("HotbarController");
	const WorldController = ControllerService.Get("WorldController");
	const LocalPlayerController = ControllerService.Get("LocalPlayerController");
	const RunService = ControllerService.Get("RunService");

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
			const block = HotbarController.SelectedBlock;

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

	const blockUpdateDelay = 150;
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
				breakBlock();
				lastBlockUpdate = Date.now();
				leftButtonDown = true;
				break;
			case 2: // Right button clicked
				placeBlock();
				lastBlockUpdate = Date.now();
				rightButtonDown = true;
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
