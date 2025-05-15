import { createCanvas, loadImage } from "canvas";
import express from "express";
import fs from "fs";
import sharp from "sharp";

const router = express.Router();
const imageSize = 64;

function createBuffer(data: string) {
	const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
	return Buffer.from(base64Data, "base64");
}

router.post("/uploadBlock", async (req, res) => {
	try {
		const buffer = createBuffer(req.body.Image);

		// Check file size (max: 20KB for example)
		if (buffer.length > 20 * 1024) {
			res.json({ error: "File too large" });
			return;
		}

		// Validate image dimensions
		{
			const metadata = await sharp(buffer).metadata();
			if (metadata.width !== imageSize || metadata.height !== imageSize) {
				res.json({ error: "Image must be exactly 64x64 pixels" });
				return;
			}
		}

		const flipbookImage = await loadImage("flipbook.png");
		const metadata = await sharp("flipbook.png").metadata();
		const flipbookWidth = metadata.width ?? 0;
		const flipbookHeight = metadata.height ?? 0;
		const newImage = await loadImage(buffer);

		console.log("Total images in flipbook:", flipbookWidth / imageSize);

		const canvas = createCanvas(flipbookImage.width + imageSize, imageSize);
		const ctx = canvas.getContext("2d");

		ctx.drawImage(flipbookImage, 0, 0, flipbookWidth, flipbookHeight);
		ctx.drawImage(newImage, flipbookWidth, 0, 64, 64);

		fs.writeFileSync("flipbook.png", canvas.toBuffer("image/png"));

		res.json({ message: "Image uploaded successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Invalid image" });
	}
});

export default router;
