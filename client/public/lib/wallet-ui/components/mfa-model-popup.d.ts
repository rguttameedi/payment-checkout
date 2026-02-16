import type { Components, JSX } from "../types/components";

interface MfaModelPopup extends Components.MfaModelPopup, HTMLElement {}
export const MfaModelPopup: {
    prototype: MfaModelPopup;
    new (): MfaModelPopup;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
