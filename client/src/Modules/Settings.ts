export const Settings = {
	ChunkBlockWidth: 16,
	ChunkBlockHeight: 64,
	// MaxChunksInFetchQueue: 5,

	renderDistance: 6,
	chunkUnloadDistance: 15,

	server: process.env.NODE_ENV === "production" ? "https://flint-and-steel.glitch.me" : "http://localhost:3000",
};

declare global {
	interface Block {
		Id: number;
		Name: string;
		Uses: number;
	}
}
