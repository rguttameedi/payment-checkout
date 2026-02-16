/**
 * Simple helper functions for wallet event tracking
 * Provides easy-to-use methods for components with minimal code changes
 */
import { eventTracker } from "./eventTracker";
import { WalletEventType } from "./eventTypes";
import { getErrorCategory } from "./errorMessageTranslator";
/**
 * Initialize event tracking for a component
 */
export function initWalletEvents(componentName, environment = 'production') {
    eventTracker.init(componentName, environment);
    eventTracker.trackUIEvent(WalletEventType.COMPONENT_LOADED, 'component-initialized');
}
/**
 * Track API calls with automatic timing
 */
export async function trackApiCall(endpoint, method, apiCall) {
    const startTime = Date.now();
    try {
        const result = await apiCall();
        const duration = Date.now() - startTime;
        eventTracker.trackApiCall(endpoint, method, true, duration, 200);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        eventTracker.trackApiCall(endpoint, method, false, duration, 500, errorMessage);
        throw error;
    }
}
/**
 * Track payment method selection
 */
export function trackPaymentSelection(paymentMethodId, paymentMethodType, paymentMethodText) {
    eventTracker.trackPaymentMethodSelected(paymentMethodId, paymentMethodType, paymentMethodText);
}
/**
 * Track form lifecycle events
 */
export function trackAddPaymentStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_STARTED, 'payment');
}
export function trackAddPaymentSuccess(paymentMethodData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_SUCCESS, 'payment', paymentMethodData);
}
export function trackAddPaymentCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_CANCELLED, 'payment');
}
export function trackAddPaymentError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_ERROR, 'payment', {
        error,
        errorCategory
    });
}
export function trackAddBankStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_STARTED, 'bank');
}
export function trackAddBankSuccess(bankAccountData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_SUCCESS, 'bank', bankAccountData);
}
export function trackAddBankCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_CANCELLED, 'bank');
}
export function trackAddBankError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_ERROR, 'bank', {
        error,
        errorCategory
    });
}
/**
 * Track form validation errors
 */
export function trackValidationError(formType, errors) {
    eventTracker.trackFormEvent(WalletEventType.FORM_VALIDATION_ERROR, formType, { validationErrors: errors });
}
/**
 * Track UI interactions
 */
export function trackDropdownOpened() {
    eventTracker.trackUIEvent(WalletEventType.DROPDOWN_OPENED, 'dropdown-opened');
}
export function trackDropdownClosed() {
    eventTracker.trackUIEvent(WalletEventType.DROPDOWN_CLOSED, 'dropdown-closed');
}
//# sourceMappingURL=walletEvents.js.map
