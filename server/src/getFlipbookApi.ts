import express from "express";
import { TextureAtlasService } from "./Services/TextureAtlasService.js";

const router = express.Router();

router.get("/flipbook", (req, res) => {
	// Send as PNG buffer
	res.type("png");
	res.send(TextureAtlasService.Canvas.toBuffer("image/png"));
});

export default router;
