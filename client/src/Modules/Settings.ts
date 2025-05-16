export const Settings = {
	ChunkBlockWidth: 16,
	ChunkBlockHeight: 64,
	// MaxChunksInFetchQueue: 5,

	renderDistance: 6,
	chunkUnloadDistance: 20,

	// server: "http://localhost:3000",
	server: "https://flint-and-steel.glitch.me",
};

declare global {
	interface Block {
		Id: number;
		Name: string;
		Uses: number;
	}
}
