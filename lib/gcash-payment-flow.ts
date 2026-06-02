export type GcashOverlayPhase = "processing" | "success" | "error";

export type GcashOverlayState = {
  message: string;
  progress: number;
  phase: GcashOverlayPhase;
};

const STEPS = [
  { ms: 700, message: "Connecting to GCash…" },
  { ms: 900, message: "Waiting for app confirmation…" },
  { ms: 800, message: "Verifying your payment…" },
  { ms: 700, message: "Securing transaction…" },
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulates a real GCash payment delay with staged status messages. */
export async function runGcashPaymentFlow(
  onUpdate: (state: GcashOverlayState) => void,
  options: { failure?: boolean } = {}
): Promise<"success" | "failure"> {
  const total = STEPS.length;
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i]!;
    onUpdate({
      message: step.message,
      progress: Math.round(((i + 0.35) / total) * 100),
      phase: "processing",
    });
    await sleep(step.ms);
    onUpdate({
      message: step.message,
      progress: Math.round(((i + 1) / total) * 85),
      phase: "processing",
    });
  }

  if (options.failure) {
    onUpdate({
      message: "Payment declined",
      progress: 100,
      phase: "error",
    });
    await sleep(900);
    return "failure";
  }

  onUpdate({
    message: "Payment successful!",
    progress: 100,
    phase: "success",
  });
  await sleep(650);
  return "success";
}
