export const MAX_PITCH = Math.PI / 2 - 0.01;

export function clampPitch(pitch) {
  return Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
}


export function toOrientation(yaw, pitch) {
  const cy = Math.cos(yaw / 2);
  const sy = Math.sin(yaw / 2);
  const cp = Math.cos(pitch / 2);
  const sp = Math.sin(pitch / 2);

  const qw = cy * cp;
  const qx = cy * sp;
  const qy = sy * cp;
  const qz = -sy * sp;

  const angle = 2 * Math.acos(Math.min(1, Math.max(-1, qw)));
  const s = Math.sqrt(1 - qw * qw);

  if (s < 1e-6) {
    return [0, 1, 0, 0];
  }

  return [qx / s, qy / s, qz / s, angle];
}

export function applyPose(camera, pose) {
  const [ax, ay, az, angle] = toOrientation(pose.yaw, pose.pitch);

  camera.setAttribute("position", `${pose.x} ${pose.y} ${pose.z}`);
  camera.setAttribute("orientation", `${ax} ${ay} ${az} ${angle}`);
}

export function poseFromViewMatrix(viewMatrix) {
  const m = viewMatrix.inverse();

  const fx = -m._02;
  const fy = -m._12;
  const fz = -m._22;

  return {
    x: m._03,
    y: m._13,
    z: m._23,
    yaw: Math.atan2(-fx, -fz),
    pitch: clampPitch(Math.asin(Math.max(-1, Math.min(1, fy)))),
  };
}
