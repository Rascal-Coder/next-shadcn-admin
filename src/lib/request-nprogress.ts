import NProgress from 'nprogress';

let active = 0;

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export function startRequestLoading(): void {
  if (typeof window === 'undefined') return;
  active += 1;
  if (active === 1) NProgress.start();
}

export function finishRequestLoading(): void {
  if (typeof window === 'undefined') return;
  active = Math.max(0, active - 1);
  if (active === 0) NProgress.done();
}
