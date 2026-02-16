/**
 * Simple helper functions for wallet event tracking
 * Provides easy-to-use methods for components with minimal code changes
 */
/**
 * Initialize event tracking for a component
 */
export declare function initWalletEvents(componentName: string, environment?: string): void;
/**
 * Track API calls with automatic timing
 */
export declare function trackApiCall<T>(endpoint: string, method: string, apiCall: () => Promise<T>): Promise<T>;
/**
 * Track payment method selection
 */
export declare function trackPaymentSelection(paymentMethodId: string, paymentMethodType: string, paymentMethodText: string): void;
/**
 * Track form lifecycle events
 */
export declare function trackAddPaymentStarted(): void;
export declare function trackAddPaymentSuccess(paymentMethodData?: any): void;
export declare function trackAddPaymentCancelled(): void;
export declare function trackAddPaymentError(error: string): void;
export declare function trackAddBankStarted(): void;
export declare function trackAddBankSuccess(bankAccountData?: any): void;
export declare function trackAddBankCancelled(): void;
export declare function trackAddBankError(error: string): void;
/**
 * Track form validation errors
 */
export declare function trackValidationError(formType: 'payment' | 'bank', errors: string[]): void;
/**
 * Track UI interactions
 */
export declare function trackDropdownOpened(): void;
export declare function trackDropdownClosed(): void;
