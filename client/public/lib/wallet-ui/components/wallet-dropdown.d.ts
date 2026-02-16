import type { Components, JSX } from "../types/components";

interface WalletDropdown extends Components.WalletDropdown, HTMLElement {}
export const WalletDropdown: {
    prototype: WalletDropdown;
    new (): WalletDropdown;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
