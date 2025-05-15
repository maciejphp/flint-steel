type ControllerNames = keyof ControllerConstructors;
type Controllers = {
	[K in keyof ControllerConstructors]: InstanceType<ControllerConstructors[K]>;
};

class ControllerService {
	static Controllers = new Map<ControllerNames, Controllers[ControllerNames]>();
	private static Constructor = new Map<ControllerNames, ControllerConstructors[ControllerNames]>();

	static Register<K extends ControllerNames>(name: K, constructor: ControllerConstructors[K]): void {
		if (this.Constructor.has(name)) {
			throw new Error(`Controller '${name}' is already registered.`);
		}
		this.Constructor.set(name, constructor);
	}

	static GetController<K extends ControllerNames>(name: K): Controllers[K] {
		if (!this.Controllers.has(name)) {
			const constructor = this.Constructor.get(name);
			if (!constructor) throw new Error(`Controller '${name}' is not registered.`);
			const instance = new constructor();
			this.Controllers.set(name, instance);
		}
		return this.Controllers.get(name) as Controllers[K];
	}

	static GetControllerNames(): ControllerNames[] {
		return Array.from(this.Constructor.keys());
	}
}

export { ControllerService };
