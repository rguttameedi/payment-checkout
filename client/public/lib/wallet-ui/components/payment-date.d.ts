import type { Components, JSX } from "../types/components";

interface PaymentDate extends Components.PaymentDate, HTMLElement {}
export const PaymentDate: {
    prototype: PaymentDate;
    new (): PaymentDate;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
