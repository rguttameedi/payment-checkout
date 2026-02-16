import type { Components, JSX } from "../types/components";

interface AddBankAccount extends Components.AddBankAccount, HTMLElement {}
export const AddBankAccount: {
    prototype: AddBankAccount;
    new (): AddBankAccount;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
