export interface MotionSample {
  beta: number;
  gamma: number;
}

export interface AccelerationIncludingGravity {
  x: number | null;
  y: number | null;
  z: number | null;
}

export interface Tilt {
  rotateX: number;
  rotateY: number;
  translateX: number;
  translateY: number;
}

export const MOTION_LIMITS = {
  deadZone: 0.8,
  maxRotation: 1.5,
  maxTranslation: 3,
  smoothing: 0.12,
} as const;

const zeroTilt = (): Tilt => ({
  rotateX: 0,
  rotateY: 0,
  translateX: 0,
  translateY: 0,
});

const clamp = (value: number, limit: number): number => Math.max(-limit, Math.min(limit, value));

export function calibrate(sample: MotionSample): MotionSample | null {
  return Number.isFinite(sample.beta) && Number.isFinite(sample.gamma) ? sample : null;
}

export function motionSampleFromAccelerationIncludingGravity(
  acceleration: AccelerationIncludingGravity | null,
): MotionSample | null {
  if (!acceleration) return null;

  const { x, y, z } = acceleration;
  if (x === null || y === null || z === null || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null;
  }

  if (Math.hypot(x, y, z) < 0.001) return null;

  return {
    beta: (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI,
    gamma: (Math.atan2(-x, Math.hypot(y, z)) * 180) / Math.PI,
  };
}

export function targetTilt(sample: MotionSample, baseline: MotionSample): Tilt {
  const betaDelta = sample.beta - baseline.beta;
  const gammaDelta = sample.gamma - baseline.gamma;

  if (
    Math.abs(betaDelta) < MOTION_LIMITS.deadZone &&
    Math.abs(gammaDelta) < MOTION_LIMITS.deadZone
  ) {
    return zeroTilt();
  }

  const rotateX = clamp(-betaDelta / 18, MOTION_LIMITS.maxRotation);
  const rotateY = clamp(gammaDelta / 18, MOTION_LIMITS.maxRotation);

  return {
    rotateX,
    rotateY,
    translateX: clamp(rotateY * 2, MOTION_LIMITS.maxTranslation),
    translateY: clamp(-rotateX * 2, MOTION_LIMITS.maxTranslation),
  };
}

export function smoothTilt(current: Tilt, target: Tilt): Tilt {
  const blend = (from: number, to: number): number =>
    from + (to - from) * MOTION_LIMITS.smoothing;

  return {
    rotateX: blend(current.rotateX, target.rotateX),
    rotateY: blend(current.rotateY, target.rotateY),
    translateX: blend(current.translateX, target.translateX),
    translateY: blend(current.translateY, target.translateY),
  };
}
