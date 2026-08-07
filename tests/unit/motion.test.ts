import { describe, expect, test } from 'vitest';
import { calibrate, MOTION_LIMITS, smoothTilt, targetTilt } from '../../src/lib/motion';

describe('motion limits', () => {
  test('calibrates the first finite orientation sample', () => {
    expect(calibrate({ beta: 8, gamma: -4 })).toEqual({ beta: 8, gamma: -4 });
  });

  test('ignores the dead zone and clamps extreme motion', () => {
    const baseline = { beta: 0, gamma: 0 };
    expect(targetTilt({ beta: 0.2, gamma: 0.2 }, baseline)).toEqual({
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateY: 0,
    });

    const tilt = targetTilt({ beta: 90, gamma: -90 }, baseline);
    expect(Math.abs(tilt.rotateX)).toBeLessThanOrEqual(MOTION_LIMITS.maxRotation);
    expect(Math.abs(tilt.rotateY)).toBeLessThanOrEqual(MOTION_LIMITS.maxRotation);
    expect(Math.abs(tilt.translateX)).toBeLessThanOrEqual(MOTION_LIMITS.maxTranslation);
    expect(Math.abs(tilt.translateY)).toBeLessThanOrEqual(MOTION_LIMITS.maxTranslation);
  });

  test('smooths toward a target instead of jumping to it', () => {
    const next = smoothTilt(
      { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 },
      { rotateX: 1, rotateY: -1, translateX: 3, translateY: -3 },
    );

    expect(next.rotateX).toBeGreaterThan(0);
    expect(next.rotateX).toBeLessThan(1);
    expect(next.translateX).toBeGreaterThan(0);
    expect(next.translateX).toBeLessThan(3);
  });
});
