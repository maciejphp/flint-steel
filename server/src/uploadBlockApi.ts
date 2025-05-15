import express from "express";
import { TextureAtlasService } from "./Services/TextureAtlasService.js";
import { query } from "./Functions.js";

const router = express.Router();

router.post("/getBlocks", async (req, res) => {
	const [result, success] = await query<{ Id: number; Name: string; Uses: number }>(
		`SELECT Id, Name, Uses FROM blocks;`,
		[],
		res,
	);
	if (success && result) {
		res.json(result[0]);
	}
});

router.post("/uploadBlock", async (req, res) => {
	TextureAtlasService.UploadTexture(req, res);
});

export default router;
