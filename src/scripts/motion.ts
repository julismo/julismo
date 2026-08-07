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
const consent = document.querySelector<HTMLButtonElement>('[data-motion-consent]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const orientationEvent =
  typeof DeviceOrientationEvent === 'undefined'
    ? undefined
    : (DeviceOrientationEvent as PermissionAwareOrientationEvent);

const startMotion = () => {
  if (!plane || !orientationEvent) return;

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
};

if (!plane || !orientationEvent) {
  root.dataset.motion = 'static';
} else if (reducedMotion) {
  root.dataset.motion = 'reduced';
} else if (orientationEvent.requestPermission) {
  if (!consent) {
    root.dataset.motion = 'static';
  } else {
    root.dataset.motion = 'permission-required';
    consent.hidden = false;

    consent.addEventListener(
      'click',
      () => {
        consent.disabled = true;
        let permissionRequest: Promise<'granted' | 'denied'>;

        try {
          permissionRequest = orientationEvent.requestPermission!();
        } catch {
          consent.hidden = true;
          root.dataset.motion = 'denied';
          return;
        }

        void permissionRequest
          .then((permission) => {
            consent.hidden = true;
            if (permission === 'granted') {
              startMotion();
            } else {
              root.dataset.motion = 'denied';
            }
          })
          .catch(() => {
            consent.hidden = true;
            root.dataset.motion = 'denied';
          });
      },
      { once: true },
    );
  }
} else {
  startMotion();
}
