import express from "express";

const router = express.Router();

router.get("/flipbook", (req, res) => {
	res.sendFile("../flipbook.png", { root: "." });
});

export default router;
