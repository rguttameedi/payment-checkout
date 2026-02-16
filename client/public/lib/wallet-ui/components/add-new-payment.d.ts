import type { Components, JSX } from "../types/components";

interface AddNewPayment extends Components.AddNewPayment, HTMLElement {}
export const AddNewPayment: {
    prototype: AddNewPayment;
    new (): AddNewPayment;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
