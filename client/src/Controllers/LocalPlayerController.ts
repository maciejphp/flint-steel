import GravityMode from "../Modules/FirstPersonControls";
import FlyMode from "../Modules/FlyControls";

class Class {
  private static instance: Class;

  Fly = false;

  Load() {
    if (this.Fly) {
      FlyMode();
    } else {
      GravityMode();
    }
  }

  public static get(): Class {
    if (!Class.instance) {
      Class.instance = new Class();
    }
    return Class.instance;
  }
}

export const LocalPlayerController = Class.get();
