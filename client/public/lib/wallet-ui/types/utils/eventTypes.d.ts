export declare enum WalletEventType {
    API_CALL_SUCCESS = "wallet:api:success",
    API_CALL_ERROR = "wallet:api:error",
    PAYMENT_METHOD_SELECTED = "wallet:payment:selected",
    PAYMENT_METHOD_CHANGED = "wallet:payment:changed",
    ADD_PAYMENT_STARTED = "wallet:add-payment:started",
    ADD_PAYMENT_SUCCESS = "wallet:add-payment:success",
    ADD_PAYMENT_CANCELLED = "wallet:add-payment:cancelled",
    ADD_PAYMENT_ERROR = "wallet:add-payment:error",
    ADD_BANK_STARTED = "wallet:add-bank:started",
    ADD_BANK_SUCCESS = "wallet:add-bank:success",
    ADD_BANK_CANCELLED = "wallet:add-bank:cancelled",
    ADD_BANK_ERROR = "wallet:add-bank:error",
    FORM_VALIDATION_ERROR = "wallet:form:validation-error",
    FORM_FIELD_CHANGED = "wallet:form:field-changed",
    DROPDOWN_OPENED = "wallet:ui:dropdown-opened",
    DROPDOWN_CLOSED = "wallet:ui:dropdown-closed",
    COMPONENT_LOADED = "wallet:ui:component-loaded"
}
export interface WalletEventData {
    timestamp: string;
    component: string;
    environment?: string;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
}
export interface ApiEventData extends WalletEventData {
    endpoint: string;
    method: string;
    duration?: number;
    statusCode?: number;
    error?: string;
}
export interface PaymentMethodEventData extends WalletEventData {
    paymentMethodId: string;
    paymentMethodType: string;
    paymentMethodText: string;
}
export interface FormEventData extends WalletEventData {
    formType: 'payment' | 'bank';
    fieldName?: string;
    fieldValue?: string;
    validationErrors?: string[];
}
export interface UIEventData extends WalletEventData {
    action: string;
    elementId?: string;
    elementType?: string;
}
