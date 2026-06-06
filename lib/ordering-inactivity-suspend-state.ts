let suspended = false;
const listeners = new Set<() => void>();

/** True while the guest has a checked-out order not yet marked Completed. */
export function isOrderingInactivitySuspended(): boolean {
  return suspended;
}

export function setOrderingInactivitySuspended(next: boolean): boolean {
  if (suspended === next) return false;
  suspended = next;
  listeners.forEach((listener) => listener());
  return true;
}

export function subscribeToOrderingInactivitySuspend(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
