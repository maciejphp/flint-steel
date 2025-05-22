import express from "express";
import { TextureAtlasService } from "./Services/TextureAtlasService.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

router.post("/overwriteBlock", (req, res) => {
	const { BlockId, Password } = req.body;
	console.log(BlockId);
	if (!BlockId) {
		res.json({ error: "BlockId is required" });
		return;
	}
	if (Password !== process.env.ADMIN_PASSWORD) {
		res.status(403).json({ error: "Forbidden" });
		return;
	}

	TextureAtlasService.UploadTexture(req, res, Number(BlockId));
});

export default router;
