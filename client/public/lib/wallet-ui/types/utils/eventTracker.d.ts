import { WalletEventType, WalletEventData } from './eventTypes';
/**
 * Central event tracking utility for wallet UI components
 * Emits CustomEvents that parent applications can listen to
 */
export declare class WalletEventTracker {
    private static instance;
    private componentName;
    private environment;
    private sessionId;
    private constructor();
    static getInstance(): WalletEventTracker;
    /**
     * Initialize the tracker with component context
     */
    init(componentName: string, environment?: string): void;
    /**
     * Track an event with standardized data structure
     */
    track(eventType: WalletEventType, eventData?: Partial<WalletEventData>): void;
    /**
     * Emit CustomEvent that bubbles up to parent application
     */
    private emitCustomEvent;
    /**
     * Generate a unique session ID for tracking user sessions
     */
    private generateSessionId;
    /**
     * Convenience methods for common events
     */
    trackApiCall(endpoint: string, method: string, success: boolean, duration?: number, statusCode?: number, error?: string): void;
    trackPaymentMethodSelected(paymentMethodId: string, paymentMethodType: string, paymentMethodText: string): void;
    trackFormEvent(eventType: WalletEventType, formType: 'payment' | 'bank', additionalData?: any): void;
    trackUIEvent(eventType: WalletEventType, action: string, elementId?: string, elementType?: string): void;
}
export declare const eventTracker: WalletEventTracker;
