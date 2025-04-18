type Listener<T = void> = (data: T) => void;

export class Signal<T = void> {
	private listeners: Listener<T>[] = [];

	Connect(callback: Listener<T>) {
		this.listeners.push(callback);
		return () => this.Disconnect(callback);
	}

	Disconnect(callback: Listener<T>) {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	Fire(data: T) {
		this.listeners.forEach((listener) => listener(data));
	}
}
