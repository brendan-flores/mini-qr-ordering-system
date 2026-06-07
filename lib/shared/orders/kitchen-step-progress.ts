import type { OrderStatus } from "@/types/order";
import {
  CUSTOMER_KITCHEN_STEPS,
  customerKitchenStepIndex,
} from "@/lib/shared/orders/customer-order-flow";

export type KitchenStepProgress = {
  /** Index of the step matching the order's current kitchen status (-1 if cancelled). */
  currentStepIndex: number;
  /** Steps at or below this index show as completed/checked (includes current status). */
  completedThroughIndex: number;
  /** Index of the next step in the flow (-1 when there is no next step). */
  activeStepIndex: number;
};

/** Completed = current step checked; active = next step only. */
export function getKitchenStepProgress(
  status: OrderStatus | undefined
): KitchenStepProgress {
  const current = customerKitchenStepIndex(status);
  if (current < 0) {
    return {
      currentStepIndex: -1,
      completedThroughIndex: -1,
      activeStepIndex: -1,
    };
  }
  const lastIndex = CUSTOMER_KITCHEN_STEPS.length - 1;
  return {
    currentStepIndex: current,
    completedThroughIndex: current,
    activeStepIndex: current >= lastIndex ? -1 : current + 1,
  };
}

export function kitchenStepState(
  stepIndex: number,
  progress: KitchenStepProgress
): "done" | "active" | "upcoming" {
  if (progress.currentStepIndex < 0) return "upcoming";
  if (stepIndex <= progress.completedThroughIndex) return "done";
  if (stepIndex === progress.activeStepIndex) return "active";
  return "upcoming";
}
