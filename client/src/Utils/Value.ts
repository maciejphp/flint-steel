type Listener<T = void> = (data: T) => void;

export class Value<T = void> {
	private listeners: Listener<T>[] = [];
	Value: T;

	constructor(value?: T) {
		this.Value = (value ?? undefined) as T;
	}

	Changed(callback: Listener<T>): () => void {
		this.listeners.push(callback);
		return () => this.Disconnect(callback);
	}

	Set(newValue: T): void {
		this.Value = newValue;
		this.Fire();
	}

	Disconnect(callback: Listener<T>): void {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	private Fire() {
		this.listeners.forEach((listener) => listener(this.Value));
	}
}
