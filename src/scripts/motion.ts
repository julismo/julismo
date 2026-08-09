import {
  calibrate,
  motionSampleFromAccelerationIncludingGravity,
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

const restorePrimaryActionFocus = () => {
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('[data-link-id="whatsapp"]')?.focus();
  });
};

const startMotion = (onFirstSample: () => void) => {
  if (!plane || (!orientationEvent && !motionEvent)) return () => {};

  let baseline: MotionSample | null = null;
  let current: Tilt = { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 };
  let frame = 0;
  let source: 'orientation' | 'acceleration' | null = null;
  let receivedSample = false;
  let stopped = false;

  const render = () => {
    frame = 0;
    plane.style.setProperty('--tilt-x', `${current.rotateX}deg`);
    plane.style.setProperty('--tilt-y', `${current.rotateY}deg`);
    plane.style.setProperty('--shift-x', `${current.translateX}px`);
    plane.style.setProperty('--shift-y', `${current.translateY}px`);
  };

  const consumeSample = (sample: MotionSample, nextSource: 'orientation' | 'acceleration') => {
    if (stopped || document.hidden || (source && source !== nextSource)) return;

    source ??= nextSource;
    baseline ??= calibrate(sample);
    if (!baseline) return;

    current = smoothTilt(current, targetTilt(sample, baseline));
    if (!frame) frame = window.requestAnimationFrame(render);

    if (!receivedSample) {
      receivedSample = true;
      onFirstSample();
    }
  };

  if (orientationEvent) {
    window.addEventListener(
      'deviceorientation',
      (event) => {
        if (event.beta === null || event.gamma === null) return;
        consumeSample({ beta: event.beta, gamma: event.gamma }, 'orientation');
      },
      { passive: true },
    );
  }

  if (motionEvent) {
    window.addEventListener(
      'devicemotion',
      (event) => {
        const sample = motionSampleFromAccelerationIncludingGravity(event.accelerationIncludingGravity);
        if (sample) consumeSample(sample, 'acceleration');
      },
      { passive: true },
    );
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  });

  return () => {
    stopped = true;
    if (frame) window.cancelAnimationFrame(frame);
  };
};

const activateMotion = (shouldRestoreFocus = false, waitForSafariSample = false) => {
  root.dataset.motion = 'waiting';
  if (status) status.textContent = 'A preparar movimento.';

  if (waitForSafariSample && consent) {
    consent.textContent = 'Mova o telemóvel…';
  }

  let stopMotion = () => {};
  const firstSampleTimeout = waitForSafariSample
    ? window.setTimeout(() => {
        if (root.dataset.motion !== 'waiting') return;

        stopMotion();
        root.dataset.motion = 'unavailable';
        if (consent) {
          consent.hidden = false;
          consent.disabled = true;
          consent.textContent = 'Movimento indisponível';
        }
        if (status) {
          status.textContent = 'Não foi possível detetar movimento. Abra esta página diretamente no Safari e experimente novamente.';
        }
        if (shouldRestoreFocus) restorePrimaryActionFocus();
      }, 2_000)
    : undefined;

  stopMotion = startMotion(() => {
    if (firstSampleTimeout !== undefined) window.clearTimeout(firstSampleTimeout);
    root.dataset.motion = 'active';
    if (consent) consent.hidden = true;
    if (status) status.textContent = 'Movimento ativado.';
    if (shouldRestoreFocus) restorePrimaryActionFocus();
  });
};

if (!plane || (!orientationEvent && !motionEvent)) {
  root.dataset.motion = 'static';
} else if (reducedMotion) {
  root.dataset.motion = 'reduced';
} else if (orientationEvent?.requestPermission || motionEvent?.requestPermission) {
  if (!consent) {
    root.dataset.motion = 'static';
  } else {
    root.dataset.motion = 'permission-required';
    consent.hidden = false;

    const settleDeniedPermission = (shouldRestoreFocus: boolean) => {
      consent.hidden = true;
      if (status) status.textContent = 'Movimento não ativado.';

      if (shouldRestoreFocus) {
        restorePrimaryActionFocus();
      }
    };

    consent.addEventListener(
      'click',
      () => {
        const shouldRestoreFocus = document.activeElement === consent;
        consent.disabled = true;
        const permissionRequests: Promise<'granted' | 'denied'>[] = [];

        try {
          const request = orientationEvent?.requestPermission?.();
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
              activateMotion(shouldRestoreFocus, true);
            } else {
              root.dataset.motion = 'denied';
              settleDeniedPermission(shouldRestoreFocus);
            }
          })
          .catch(() => {
            root.dataset.motion = 'denied';
            settleDeniedPermission(shouldRestoreFocus);
          });
      },
      { once: true },
    );
  }
} else {
  activateMotion();
}
