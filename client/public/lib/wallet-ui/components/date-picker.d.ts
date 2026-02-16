import type { Components, JSX } from "../types/components";

interface DatePicker extends Components.DatePicker, HTMLElement {}
export const DatePicker: {
    prototype: DatePicker;
    new (): DatePicker;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
