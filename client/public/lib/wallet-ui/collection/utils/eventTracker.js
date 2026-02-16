import { WalletEventType } from "./eventTypes";
import { Environment } from "../config";
// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
/**
 * Central event tracking utility for wallet UI components
 * Emits CustomEvents that parent applications can listen to
 */
export class WalletEventTracker {
    static instance;
    componentName = '';
    environment = 'production';
    sessionId = '';
    constructor() {
        this.sessionId = this.generateSessionId();
    }
    static getInstance() {
        if (!WalletEventTracker.instance) {
            WalletEventTracker.instance = new WalletEventTracker();
        }
        return WalletEventTracker.instance;
    }
    /**
     * Initialize the tracker with component context
     */
    init(componentName, environment = 'production') {
        this.componentName = componentName;
        this.environment = environment;
    }
    /**
     * Track an event with standardized data structure
     */
    track(eventType, eventData = {}) {
        const standardizedData = {
            timestamp: new Date().toISOString(),
            component: this.componentName,
            environment: this.environment,
            sessionId: this.sessionId,
            ...eventData
        };
        // Emit CustomEvent for parent application
        this.emitCustomEvent(eventType, standardizedData);
        // Optional: Console log for development
        devLog(this.environment, `[WalletEvent] ${eventType}:`, standardizedData);
    }
    /**
     * Emit CustomEvent that bubbles up to parent application
     */
    emitCustomEvent(eventType, data) {
        const customEvent = new CustomEvent(eventType, {
            detail: data,
            bubbles: true,
            composed: true // Allows event to cross shadow DOM boundaries
        });
        // Dispatch on document to ensure parent app can catch it
        document.dispatchEvent(customEvent);
    }
    /**
     * Generate a unique session ID for tracking user sessions
     */
    generateSessionId() {
        return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Convenience methods for common events
     */
    trackApiCall(endpoint, method, success, duration, statusCode, error) {
        this.track(success ? WalletEventType.API_CALL_SUCCESS : WalletEventType.API_CALL_ERROR, {
            endpoint,
            method,
            duration,
            statusCode,
            error
        });
    }
    trackPaymentMethodSelected(paymentMethodId, paymentMethodType, paymentMethodText) {
        this.track(WalletEventType.PAYMENT_METHOD_SELECTED, {
            paymentMethodId,
            paymentMethodType,
            paymentMethodText
        });
    }
    trackFormEvent(eventType, formType, additionalData = {}) {
        this.track(eventType, {
            formType,
            ...additionalData
        });
    }
    trackUIEvent(eventType, action, elementId, elementType) {
        this.track(eventType, {
            action,
            elementId,
            elementType
        });
    }
}
// Export singleton instance for easy use
export const eventTracker = WalletEventTracker.getInstance();
//# sourceMappingURL=eventTracker.js.map
