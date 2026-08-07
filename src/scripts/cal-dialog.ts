const CAL_LINK = 'julismo-costa-3nxpms/30min';
const dialog = document.querySelector<HTMLDialogElement>('#cal-dialog');
const triggers = document.querySelectorAll<HTMLAnchorElement>('[data-cal-trigger]');
const closeButton = document.querySelector<HTMLButtonElement>('[data-cal-close]');
const embedContainer = document.querySelector<HTMLElement>('#cal-embed-container');
const calendarStatus = document.querySelector<HTMLElement>('[data-cal-status]');

let previousOverflow = '';
let activeTrigger: HTMLAnchorElement | null = null;
let calPromise: Promise<void> | null = null;
let hasMounted = false;

const ensureCal = (): Promise<void> => {
  if (!dialog || !embedContainer || hasMounted) return calPromise ?? Promise.resolve();

  calPromise ??= import('@calcom/embed-snippet')
    .then(({ default: EmbedSnippet }) => {
      const Cal = EmbedSnippet();
      const isMobile = window.matchMedia('(max-width: 480px)').matches;

      Cal('init', { origin: 'https://cal.com' });
      Cal('inline', {
        calLink: CAL_LINK,
        elementOrSelector: '#cal-embed-container',
        config: { layout: isMobile ? 'column_view' : 'month_view', theme: 'dark' },
      });

      hasMounted = true;
      calendarStatus?.setAttribute('hidden', '');
    })
    .catch(() => {
      calendarStatus?.removeAttribute('hidden');
      if (calendarStatus) {
        calendarStatus.textContent = 'Não foi possível carregar o calendário. Pode abrir o agendamento numa nova página.';
      }
      calPromise = null;
    });

  return calPromise;
};

if (dialog && triggers.length > 0 && closeButton && embedContainer) {
  for (const trigger of triggers) {
    trigger.addEventListener('pointerenter', () => void ensureCal(), { passive: true });
    trigger.addEventListener('focus', () => void ensureCal());
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      activeTrigger = trigger;
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      void ensureCal();
    });
  }

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('cancel', () => {
    // Native dialog behaviour closes the modal after Escape.
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    activeTrigger?.focus();
    activeTrigger = null;
  });

  document.documentElement.dataset.calDialog = 'ready';
}
