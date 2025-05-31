import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIO } from "socket.io";

class Class {
	private static instance: Class;
	App: express.Express;
	Io: SocketIO;

	constructor() {
		const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://flint-steel.vercel.app"];

		this.App = express();
		const port = 3000;
		const server = http.createServer(this.App);
		this.Io = new SocketIO(server, {
			cors: {
				origin: function (origin, callback) {
					// Allow requests with no origin (like curl or mobile apps)
					if (!origin || allowedOrigins.includes(origin)) {
						callback(null, true);
					} else {
						callback(new Error(`CORS not allowed origin: ${origin}`));
					}
				},
				credentials: true,
			},
		});

		this.App.use(
			cors({
				origin: function (origin, callback) {
					// Allow requests with no origin (like curl or mobile apps)
					if (!origin || allowedOrigins.includes(origin)) {
						callback(null, true);
					} else {
						callback(new Error(`CORS not allowed origin: ${origin}`));
					}
				},
				credentials: true,
			}),
		);

		// Ensure the server listens on the correct port
		server.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});
	}

	public static get(): Class {
		if (!Class.instance) {
			Class.instance = new Class();
		}
		return Class.instance;
	}
}

export const ServerService = Class.get();
