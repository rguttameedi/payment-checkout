// Event types for wallet UI components
export var WalletEventType;
(function (WalletEventType) {
    // API Events
    WalletEventType["API_CALL_SUCCESS"] = "wallet:api:success";
    WalletEventType["API_CALL_ERROR"] = "wallet:api:error";
    // Payment Method Events
    WalletEventType["PAYMENT_METHOD_SELECTED"] = "wallet:payment:selected";
    WalletEventType["PAYMENT_METHOD_CHANGED"] = "wallet:payment:changed";
    // Add Payment Method Events
    WalletEventType["ADD_PAYMENT_STARTED"] = "wallet:add-payment:started";
    WalletEventType["ADD_PAYMENT_SUCCESS"] = "wallet:add-payment:success";
    WalletEventType["ADD_PAYMENT_CANCELLED"] = "wallet:add-payment:cancelled";
    WalletEventType["ADD_PAYMENT_ERROR"] = "wallet:add-payment:error";
    // Add Bank Account Events
    WalletEventType["ADD_BANK_STARTED"] = "wallet:add-bank:started";
    WalletEventType["ADD_BANK_SUCCESS"] = "wallet:add-bank:success";
    WalletEventType["ADD_BANK_CANCELLED"] = "wallet:add-bank:cancelled";
    WalletEventType["ADD_BANK_ERROR"] = "wallet:add-bank:error";
    // Form Events
    WalletEventType["FORM_VALIDATION_ERROR"] = "wallet:form:validation-error";
    WalletEventType["FORM_FIELD_CHANGED"] = "wallet:form:field-changed";
    // UI Events
    WalletEventType["DROPDOWN_OPENED"] = "wallet:ui:dropdown-opened";
    WalletEventType["DROPDOWN_CLOSED"] = "wallet:ui:dropdown-closed";
    WalletEventType["COMPONENT_LOADED"] = "wallet:ui:component-loaded";
})(WalletEventType || (WalletEventType = {}));
//# sourceMappingURL=eventTypes.js.map
