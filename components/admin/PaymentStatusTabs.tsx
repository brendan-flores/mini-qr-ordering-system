"use client";

import { PAYMENT_TAB_TONES } from "./adminStatusStyles";
import { FilterTabs } from "./FilterTabs";

export type PaymentTab =
  | "Pending"
  | "Paid"
  | "Completed"
  | "Cancelled";

type TabConfig = {
  id: PaymentTab;
  label: string;
  count: number;
};

export function PaymentStatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabConfig[];
  active: PaymentTab;
  onChange(tab: PaymentTab): void;
}) {
  return (
    <FilterTabs
      tabs={tabs}
      active={active}
      onChange={onChange}
      ariaLabel="Filter orders by payment status"
      variant="payment"
      getTone={(id) => PAYMENT_TAB_TONES[id]}
      gridClassName="grid-cols-2 sm:grid-cols-4"
    />
  );
}
