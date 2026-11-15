import { applyPose, clampPitch } from "./viewpoint.js";

const CONTROL_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyE",
]);

export class FlyControls {
  constructor(scene, camera, settings) {
    this.scene = scene;
    this.camera = camera;
    this.settings = settings;

    this.pose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
    this.pressed = new Set();
    this.enabled = false;
    this.frameId = null;
    this.lastTime = 0;

    this.onLockChange = () => {};

    this.tick = this.tick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleLockChange = this.handleLockChange.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  isLocked() {
    return document.pointerLockElement === this.scene;
  }

  enable(pose) {
    if (this.enabled) return;
    this.enabled = true;

    this.setPose(pose);

    this.scene.addEventListener("click", this.handleClick);
    document.addEventListener("pointerlockchange", this.handleLockChange);
    document.addEventListener("mousemove", this.handleMouseMove);

    window.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("keyup", this.handleKeyUp, true);
    window.addEventListener("keypress", this.handleKeyPress, true);

    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;

    this.scene.removeEventListener("click", this.handleClick);
    document.removeEventListener("pointerlockchange", this.handleLockChange);
    document.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("keyup", this.handleKeyUp, true);
    window.removeEventListener("keypress", this.handleKeyPress, true);

    cancelAnimationFrame(this.frameId);
    this.pressed.clear();

    if (this.isLocked()) {
      document.exitPointerLock();
    }
  }

  setPose(pose) {
    Object.assign(this.pose, pose);
    this.pose.pitch = clampPitch(this.pose.pitch);
    applyPose(this.camera, this.pose);
  }


  tick(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.isLocked() && this.pressed.size > 0) {
      this.move(dt);
    }

    this.frameId = requestAnimationFrame(this.tick);
  }

  move(dt) {
    const { moveSpeed, verticalSpeed, minHeight, sprintMultiplier } =
      this.settings;
    const boost = this.pressed.has("KeyE") ? sprintMultiplier : 1;

    let forward = 0;
    let strafe = 0;
    let vertical = 0;

    if (this.pressed.has("KeyW")) forward += 1;
    if (this.pressed.has("KeyS")) forward -= 1;
    if (this.pressed.has("KeyD")) strafe += 1;
    if (this.pressed.has("KeyA")) strafe -= 1;
    if (this.pressed.has("Space")) vertical += 1;
    if (this.pressed.has("ShiftLeft") || this.pressed.has("ShiftRight")) {
      vertical -= 1;
    }

    const length = Math.hypot(forward, strafe);
    if (length > 0) {
      forward /= length;
      strafe /= length;
    }

    const sinYaw = Math.sin(this.pose.yaw);
    const cosYaw = Math.cos(this.pose.yaw);

    this.pose.x +=
      (-sinYaw * forward + cosYaw * strafe) * moveSpeed * boost * dt;
    this.pose.z +=
      (-cosYaw * forward - sinYaw * strafe) * moveSpeed * boost * dt;
    this.pose.y = Math.max(
      minHeight,
      this.pose.y + vertical * verticalSpeed * boost * dt
    );

    applyPose(this.camera, this.pose);
  }


  handleClick() {
    if (!this.isLocked()) {
      this.scene.requestPointerLock();
    }
  }

  handleLockChange() {
    this.pressed.clear();
    this.onLockChange(this.isLocked());
  }

  handleMouseMove(e) {
    if (!this.isLocked()) return;

    this.pose.yaw -= e.movementX * this.settings.mouseSensitivity;
    this.pose.pitch = clampPitch(
      this.pose.pitch - e.movementY * this.settings.mouseSensitivity
    );

    applyPose(this.camera, this.pose);
  }

  ownsKeyboard(e) {
    return this.isLocked() || this.scene.contains(e.target);
  }

  handleKeyDown(e) {
    if (!this.ownsKeyboard(e)) return;

    if (this.isLocked() && CONTROL_KEYS.has(e.code)) {
      this.pressed.add(e.code);
      e.preventDefault();
    }

    e.stopPropagation();
  }

  handleKeyUp(e) {
    this.pressed.delete(e.code);

    if (!this.ownsKeyboard(e)) return;

    if (CONTROL_KEYS.has(e.code)) {
      e.preventDefault();
    }

    e.stopPropagation();
  }

  handleKeyPress(e) {
    if (this.ownsKeyboard(e)) {
      e.stopPropagation();
    }
  }
}
