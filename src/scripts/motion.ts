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

type PermissionAwareMotionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const root = document.documentElement;
const plane = document.querySelector<HTMLElement>('[data-profile-plane]');
const consent = document.querySelector<HTMLButtonElement>('[data-motion-consent]');
const status = document.querySelector<HTMLElement>('[data-motion-status]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const orientationEvent =
  typeof DeviceOrientationEvent === 'undefined'
    ? undefined
    : (DeviceOrientationEvent as PermissionAwareOrientationEvent);
const motionEvent =
  typeof DeviceMotionEvent === 'undefined'
    ? undefined
    : (DeviceMotionEvent as PermissionAwareMotionEvent);

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
} else if (orientationEvent.requestPermission || motionEvent?.requestPermission) {
  if (!consent) {
    root.dataset.motion = 'static';
  } else {
    root.dataset.motion = 'permission-required';
    consent.hidden = false;

    const settlePermission = (message: string, shouldRestoreFocus: boolean) => {
      consent.hidden = true;
      if (status) status.textContent = message;

      if (shouldRestoreFocus) {
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('[data-link-id="whatsapp"]')?.focus();
        });
      }
    };

    consent.addEventListener(
      'click',
      () => {
        const shouldRestoreFocus = document.activeElement === consent;
        consent.disabled = true;
        const permissionRequests: Promise<'granted' | 'denied'>[] = [];

        try {
          const request = orientationEvent.requestPermission?.();
          if (request) permissionRequests.push(request);
        } catch {
          permissionRequests.push(Promise.resolve('denied'));
        }

        try {
          const request = motionEvent?.requestPermission?.();
          if (request) permissionRequests.push(request);
        } catch {
          permissionRequests.push(Promise.resolve('denied'));
        }

        void Promise.all(permissionRequests)
          .then((permissions) => {
            if (permissions.every((permission) => permission === 'granted')) {
              startMotion();
              settlePermission('Movimento ativado.', shouldRestoreFocus);
            } else {
              root.dataset.motion = 'denied';
              settlePermission('Movimento não ativado.', shouldRestoreFocus);
            }
          })
          .catch(() => {
            root.dataset.motion = 'denied';
            settlePermission('Movimento não ativado.', shouldRestoreFocus);
          });
      },
      { once: true },
    );
  }
} else {
  startMotion();
}
