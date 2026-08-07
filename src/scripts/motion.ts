import {
  calibrate,
  smoothTilt,
  targetTilt,
  type MotionSample,
  type Tilt,
} from '../lib/motion';

type PermissionAwareOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const root = document.documentElement;
const plane = document.querySelector<HTMLElement>('[data-profile-plane]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const orientationEvent =
  typeof DeviceOrientationEvent === 'undefined'
    ? undefined
    : (DeviceOrientationEvent as PermissionAwareOrientationEvent);
const requiresPermission = Boolean(orientationEvent?.requestPermission);

if (!plane || reducedMotion || !orientationEvent || requiresPermission) {
  root.dataset.motion = reducedMotion ? 'reduced' : 'static';
} else {
  let baseline: MotionSample | null = null;
  let current: Tilt = { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 };
  let frame = 0;

  const render = () => {
    frame = 0;
    plane.style.setProperty('--tilt-x', `${current.rotateX}deg`);
    plane.style.setProperty('--tilt-y', `${current.rotateY}deg`);
    plane.style.setProperty('--shift-x', `${current.translateX}px`);
    plane.style.setProperty('--shift-y', `${current.translateY}px`);
  };

  window.addEventListener(
    'deviceorientation',
    (event) => {
      if (document.hidden || event.beta === null || event.gamma === null) return;

      const sample = { beta: event.beta, gamma: event.gamma };
      baseline ??= calibrate(sample);
      if (!baseline) return;

      current = smoothTilt(current, targetTilt(sample, baseline));
      if (!frame) frame = window.requestAnimationFrame(render);
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  });

  root.dataset.motion = 'active';
}
