import { Canvas, createCanvas, loadImage } from "canvas";
import express from "express";
import sharp from "sharp";
import { query } from "../Functions.js";

const imageSize = 64;

class Class {
	private static instance: Class;
	CanvasLoaded = false;
	Canvas!: Canvas;
	Ctx!: CanvasRenderingContext2D;

	constructor() {
		this.Init();
	}

	async Init() {
		const [result, success] = await query<{ Id: number; Name: string; Data: Buffer; Uses: number }>(
			`SELECT * FROM blocks;`,
			[],
		);
		if (!success || !result) {
			console.error("Failed to load blocks from database", result);
			return;
		}

		const blocks = result[0];

		this.Canvas = createCanvas(blocks.length * imageSize, imageSize);
		// this.Canvas = createCanvas(imageSize, imageSize);
		// console.log("Total images in atlasTexture:", this.Canvas.width / imageSize);
		console.log("Total images in atlasTexture:", blocks.length);

		this.Ctx = this.Canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

		// fill canvas with texture atlas
		blocks.forEach(async (block, index) => {
			const newImage = (await loadImage(block.Data)) as unknown as HTMLImageElement;
			this.Ctx.drawImage(newImage, imageSize * index, 0, imageSize, imageSize);
		});

		this.CanvasLoaded = true;
	}

	CreateBuffer(data: string) {
		const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
		return Buffer.from(base64Data, "base64");
	}

	async UploadTexture(req: express.Request, res: express.Response, Id?: number) {
		try {
			const buffer = this.CreateBuffer(req.body.Image);
			const newImage = (await loadImage(buffer)) as unknown as HTMLImageElement;

			// Expand canvas if not overwriting an existing image
			if (!Id) {
				const imageData = this.Ctx.getImageData(0, 0, this.Canvas.width, this.Canvas.height);
				this.Canvas.width += imageSize;
				this.Ctx = this.Canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
				this.Ctx.putImageData(imageData, 0, 0);
			}

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

			const imagePixelOffset = Id ? (Id - 1) * imageSize : this.Canvas.width - imageSize;
			this.Ctx.drawImage(newImage, imagePixelOffset, 0, imageSize, imageSize);

			// fs.writeFileSync("atlasTexture.png", this.Canvas.toBuffer("image/png"));

			const [, success] = Id
				? await query(`UPDATE blocks SET Data = ? WHERE Id = ?;`, [buffer as unknown as string, Id])
				: await query(`INSERT INTO blocks (Name, Data) VALUES (?, ?);`, [req.body.Name, buffer]);

			if (success) {
				res.json({ message: "Image uploaded successfully" });
			} else {
				res.json({ error: "Failed to save image to database" });
			}
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Invalid image" });
		}
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const TextureAtlasService = Class.get();
