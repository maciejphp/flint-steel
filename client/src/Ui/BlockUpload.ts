import { ServerController } from "../Controllers/ServerController";
import { ControllerService } from "../Modules/ControllerService";

const UiController = ControllerService.GetController("UiController");

UiController.ToggleBlockUpload.Connect((open) => {
	const blockMenu = document.getElementById("block-upload") as HTMLDivElement;

	if (open) {
		// Open the block menu
		UiController.ShowInstructions = false;
		blockMenu.style.display = "block";
	} else {
		// Close the block menu
		UiController.ShowInstructions = true;
		blockMenu.style.display = "none";
	}
});

const nameInput = document.getElementById("block-upload-name-input") as HTMLInputElement;
const imageInput = document.getElementById("block-upload-upload") as HTMLInputElement;
const uploadButton = document.getElementById("block-upload-button") as HTMLImageElement;
const canvas = document.getElementById("block-upload-canvas") as HTMLCanvasElement;
console.log(canvas);
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get canvas context");

const imageSize = 64;

let imageData: string | undefined = undefined;

const clearImage = () => {
	imageInput.value = "";
	imageData = undefined;
	ctx.clearRect(0, 0, imageSize, imageSize);
};

const renderImage = (image: File) => {
	const reader = new FileReader();

	reader.onload = (event) => {
		const img = new Image();
		if (typeof event.target?.result === "string") img.src = event.target.result;
		img.onload = () => {
			ctx.imageSmoothingEnabled = false;
			// Clear the canvas
			ctx.clearRect(0, 0, imageSize, imageSize);
			ctx.drawImage(img, 0, 0, imageSize, imageSize);

			// Remove transparent pixels
			const imagePixelData = ctx.getImageData(0, 0, imageSize, imageSize);
			const data = imagePixelData.data;
			for (let i = 0; i < data.length; i += 4) {
				const alpha = data[i + 3];
				if (alpha < 255) {
					data[i] = 255; // R
					data[i + 1] = 255; // G
					data[i + 2] = 255; // B
					data[i + 3] = 255; // A
				}
			}

			// Put modified data back
			ctx.putImageData(imagePixelData, 0, 0);
			imageData = canvas.toDataURL("image/png");
		};
	};

	reader.readAsDataURL(image);
};

imageInput.addEventListener("change", function (e) {
	const target = e.target as HTMLInputElement;
	if (!target.files) return;
	const file = target.files[0];
	if (!file) return;
	renderImage(file);
});

if (imageInput.files) {
	const file = imageInput.files[0];
	if (file) {
		renderImage(file);
	}
}

uploadButton.addEventListener("click", () => {
	if (!imageData) return;

	console.log(imageInput.files);

	ServerController.UploadBlock(imageData, nameInput.value).then(([error, succes]) => {
		console.log("Upload result:", error, succes);
	});
	nameInput.value = "";
	clearImage();
});

const dropzone = document.getElementById("block-upload-dropzone") as HTMLDivElement;

dropzone.addEventListener("dragover", (event: DragEvent) => {
	console.log("dragOverHandler");
	event.preventDefault();
	const target = event?.currentTarget as HTMLDivElement;
	if (!target) return;
	target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
});

dropzone.addEventListener("drop", (event: DragEvent) => {
	console.log("dropping");
	event.preventDefault();

	const dataTransfer = event.dataTransfer;
	if (!dataTransfer) return;

	const target = event?.currentTarget as HTMLDivElement;
	if (!target) return;

	clearImage();

	target.style.backgroundColor = "transparent";
	const file = dataTransfer.files[0];
	if (file && file.type.startsWith("image/")) {
		imageInput.files = event.dataTransfer.files;
		console.log("Dropped file:", imageInput.files);
		renderImage(file);
	}
	console.log("Dropped file:", file);
});

dropzone.addEventListener("click", () => {
	imageInput.click();
});
