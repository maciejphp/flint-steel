type Listener<T = void> = (data: T) => void;

export class Signal<T = void> {
	private listeners: Listener<T>[] = [];

	Connect(callback: Listener<T>): () => void {
		this.listeners.push(callback);
		return () => this.Disconnect(callback);
	}

	Disconnect(callback: Listener<T>): void {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	Fire(data: T): void {
		this.listeners.forEach((listener) => listener(data));
	}
}
