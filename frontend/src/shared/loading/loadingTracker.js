// Counts in-flight requests that change data so a global loader can show.
let pending = 0;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(pending));

export const startLoading = () => {
  pending += 1;
  notify();
};

export const stopLoading = () => {
  pending = Math.max(0, pending - 1);
  notify();
};

export const subscribeLoading = (listener) => {
  listeners.add(listener);
  listener(pending);
  return () => listeners.delete(listener);
};
