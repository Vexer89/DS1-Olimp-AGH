import { FlyControls } from "./flyControls.js";
import { applyPose, poseFromViewMatrix } from "./viewpoint.js";
import {
  START_POSE,
  FLY_SETTINGS,
  ORBIT_NAV_TYPE,
  FLY_NAV_TYPE,
} from "./config.js";

export const MODES = {
  ORBIT: "orbit",
  FLY: "fly",
};

export class NavigationController {
  constructor({ scene, camera, navInfo }) {
    this.scene = scene;
    this.camera = camera;
    this.navInfo = navInfo;

    this.mode = MODES.ORBIT;
    this.listeners = [];

    this.fly = new FlyControls(scene, camera, FLY_SETTINGS);
    this.fly.onLockChange = () => this.notify();
  }

  onChange(listener) {
    this.listeners.push(listener);
    listener(this.getStatus());
  }

  getStatus() {
    return {
      mode: this.mode,
      locked: this.mode === MODES.FLY && this.fly.isLocked(),
    };
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  toggle() {
    this.setMode(this.mode === MODES.ORBIT ? MODES.FLY : MODES.ORBIT);
  }

  setMode(mode) {
    if (mode === this.mode) return;

    if (mode === MODES.FLY) {
      // Lot startuje z miejsca, w którym kamera jest teraz
      const pose = this.readCurrentPose();
      this.navInfo.setAttribute("type", FLY_NAV_TYPE);
      this.fly.enable(pose);
    } else {
      this.fly.disable();
      this.navInfo.setAttribute("type", ORBIT_NAV_TYPE);
    }

    this.mode = mode;
    this.notify();
  }

  reset() {
    if (this.mode === MODES.FLY) {
      this.fly.setPose(START_POSE);
    } else {
      applyPose(this.camera, START_POSE);
    }
  }

  readCurrentPose() {
    const runtime = this.scene.runtime;

    if (!runtime) {
      return { ...START_POSE };
    }

    return poseFromViewMatrix(runtime.viewMatrix());
  }
}
