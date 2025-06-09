import { Signal } from "../Utils/Signal";

type ControllerNames = keyof ControllerConstructors;
declare global {
	type Controllers = {
		[K in keyof ControllerConstructors]: InstanceType<ControllerConstructors[K]>;
	};
}

class ControllerService {
	static Controllers = new Map<ControllerNames, Controllers[ControllerNames]>();
	private static Constructor = new Map<ControllerNames, ControllerConstructors[ControllerNames]>();
	private static Registration = new Signal<ControllerNames>();

	static Register<K extends ControllerNames>(name: K, constructor: ControllerConstructors[K]): void {
		if (this.Constructor.has(name)) {
			throw new Error(`Controller '${name}' is already registered.`);
		}
		this.Constructor.set(name, constructor);
		this.Registration.Fire(name);
	}

	static Get<K extends ControllerNames>(name: K): Controllers[K] {
		if (!this.Controllers.has(name)) {
			const constructor = this.Constructor.get(name);
			if (!constructor) throw new Error(`Controller '${name}' is not registered.`);
			const instance = new constructor();
			this.Controllers.set(name, instance);
		}
		return this.Controllers.get(name) as Controllers[K];
	}

	static GetAsync<K extends ControllerNames>(name: K): Promise<Controllers[K]> {
		return new Promise((resolve) => {
			try {
				const controller = this.Get(name);
				if (controller) {
					resolve(controller);
					return;
				}
			} catch (error) {}

			const event = this.Registration.Connect((registeredName) => {
				console.log(`Controller '${registeredName}' registered.`, name);
				if (registeredName === name) {
					resolve(this.Get(name));
					this.Registration.Disconnect(event);
				}
			});
		});
	}

	static GetControllerNames(): ControllerNames[] {
		return Array.from(this.Constructor.keys());
	}
}

export { ControllerService };
