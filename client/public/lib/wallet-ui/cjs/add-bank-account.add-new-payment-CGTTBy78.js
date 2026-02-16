'use strict';

var index = require('./index-Bm9SO5Cr.js');
var common = require('./common-8ywj81H6.js');

class OscilarService {
    // Holds the single instance of the service
    static instance;
    // Configuration
    scriptId = 'oscilar-script';
    defaultTimeout = 5000; // 5 seconds
    // State
    scriptLoadPromise = null;
    scriptElement = null;
    debug = "production" !== 'production';
    scriptLoadRetryCount = 0;
    maxRetries = 1;
    constructor() { }
    // Ensures only one instance exists throughout the application
    static getInstance() {
        if (!OscilarService.instance) {
            OscilarService.instance = new OscilarService();
        }
        return OscilarService.instance;
    }
    /**
     * Loads the Oscilar script and returns a promise that resolves with the device IDs
     * @param environment The current environment (production, staging, localdevelopment)
     * @param timeoutMs Optional timeout in milliseconds (default: 5000)
     */
    validateOscilarUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Only allow Oscilar domains
            const allowedHosts = ['oscilar.com', 'zqp.oscilar.com', 'zqp-sand.oscilar.com'];
            const isAllowed = allowedHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
            if (!isAllowed) {
                this.log(`Invalid Oscilar URL host: ${parsedUrl.hostname}`, 'error');
                return false;
            }
            // Only allow HTTPS
            if (parsedUrl.protocol !== 'https:') {
                this.log(`Oscilar URL must use HTTPS, got: ${parsedUrl.protocol}`, 'error');
                return false;
            }
            return true;
        }
        catch (error) {
            this.log(`Invalid Oscilar URL format: ${url}`, 'error');
            return false;
        }
    }
    loadScript(environment, timeoutMs = this.defaultTimeout) {
        // Validate environment
        if (!Object.values(common.Environment).includes(environment)) {
            return Promise.reject(new Error(`Invalid environment: ${environment}`));
        }
        // Get the script URL and validate it
        const scriptUrl = this.getOscilarScriptUrl(environment);
        if (!this.validateOscilarUrl(scriptUrl)) {
            return Promise.reject(new Error(`Invalid Oscilar script URL: ${scriptUrl}. Only HTTPS connections to approved Oscilar domains are allowed.`));
        }
        // Return existing promise if script is already loading/loaded
        if (this.scriptLoadPromise !== null) {
            this.log('Using existing script load promise');
            return this.scriptLoadPromise;
        }
        this.scriptLoadPromise = new Promise((resolve, reject) => {
            // Early return if document is not available (SSR)
            if (typeof document === 'undefined') {
                reject(new Error('Document is not available'));
                return;
            }
            // Check if script is already loaded in the DOM
            if (document.getElementById(this.scriptId)) {
                this.handleExistingScript(resolve, reject);
                return;
            }
            // Create and configure script element
            this.scriptElement = document.createElement('script');
            this.scriptElement.id = this.scriptId;
            this.scriptElement.defer = true;
            this.scriptElement.type = 'text/javascript';
            this.scriptElement.src = scriptUrl;
            // Set up timeout for script loading
            const timeoutId = setTimeout(() => {
                reject(new Error('Oscilar script load timeout'));
            }, timeoutMs);
            // Handle script load success
            this.scriptElement.onload = async () => {
                this.scriptLoadRetryCount = 0;
                clearTimeout(timeoutId);
                try {
                    const oscilarIDs = await new Promise((res, rej) => this.initializeOscilar(res, rej));
                    // Call commit after we successfully get IDs
                    this.commit();
                    resolve(oscilarIDs);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    reject(new Error(`Failed to initialize Oscilar: ${errorMessage}`));
                }
            };
            // Handle script load error
            this.scriptElement.onerror = () => {
                clearTimeout(timeoutId);
                // Clean up the failed script
                if (this.scriptElement?.parentNode) {
                    this.scriptElement.parentNode.removeChild(this.scriptElement);
                }
                this.scriptElement = null;
                if (this.scriptLoadRetryCount < this.maxRetries) {
                    this.scriptLoadRetryCount++;
                    this.log('Retrying script load...');
                    setTimeout(() => {
                        this.scriptLoadPromise = null;
                        this.loadScript(environment)
                            .then(resolve)
                            .catch(reject);
                    }, 100);
                    return;
                }
                this.scriptLoadPromise = null;
                const errorMsg = 'Failed to load Oscilar script. verify that your Content Security Policy (CSP) allows loading scripts from oscilar.com';
                this.log(errorMsg, 'error');
                reject(new Error(errorMsg));
            };
            // Add script to document
            document.head.appendChild(this.scriptElement);
        });
        return this.scriptLoadPromise;
    }
    // Check for existing script
    handleExistingScript(resolve, reject) {
        this.log('Found existing Oscilar script, initializing...');
        const existingScript = document.getElementById(this.scriptId);
        if (existingScript && window['__ojsdk__']?.getIDs) {
            this.initializeOscilar(resolve, reject);
        }
        else {
            const errorMsg = 'Oscilar script element exists but SDK not initialized';
            this.log(errorMsg, 'error');
            reject(new Error(errorMsg));
        }
    }
    // Logs debug information in development mode
    log(message, level = 'log') {
        if (!this.debug)
            return;
        const timestamp = new Date().toISOString();
        const logMessage = `[OscilarService][${timestamp}] ${message}`;
        switch (level) {
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
                console.error(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
    // Initializes the Oscilar SDK
    initializeOscilar(resolve, reject) {
        this.log('Initializing Oscilar SDK...');
        try {
            const __ojsdk__ = window['__ojsdk__'] = window['__ojsdk__'] || {};
            // Check if Oscilar is already initialized with IDs
            if (__ojsdk__.transactionID && __ojsdk__.tabID) {
                const existingIds = {
                    transactionID: __ojsdk__.transactionID,
                    tabID: __ojsdk__.tabID
                };
                if (this.validateOscilarIDs(existingIds)) {
                    this.log('Using existing Oscilar IDs', 'log');
                    resolve(existingIds);
                    return;
                }
                else {
                    this.log('Found existing but invalid Oscilar IDs', 'warn');
                }
            }
            // If not already initialized, set up the callback
            __ojsdk__.getIDs = __ojsdk__.getIDs || [];
            const callback = (ojsIDs) => {
                if (this.validateOscilarIDs(ojsIDs)) {
                    // Resolve the promise with the IDs
                    resolve(ojsIDs);
                    // Callback for the current operation
                }
                else {
                    const errorMsg = 'Invalid Oscilar IDs received';
                    this.log(errorMsg, 'error');
                    reject(new Error(errorMsg));
                }
            };
            __ojsdk__.getIDs.push(callback);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorMsg = `Failed to initialize Oscilar: ${errorMessage}`;
            this.log(errorMsg, 'error');
            reject(new Error(errorMsg));
        }
    }
    // Validate that the received Oscilar IDs are in the correct format
    validateOscilarIDs(ids) {
        return !!(ids &&
            typeof ids === 'object' &&
            typeof ids.transactionID === 'string' &&
            typeof ids.tabID === 'string' &&
            ids.transactionID.length > 0 &&
            ids.tabID.length > 0);
    }
    // Get the Oscilar script URL for the given environment
    getOscilarScriptUrl(environment) {
        return common.getOscilarScriptUrl(environment);
    }
    /**
     * Commits data to Oscilar
     * @param userID - Optional user identifier
     * @param sessionID - Optional session identifier
     */
    commit(userID, sessionID) {
        try {
            // Type-safe window access with fallback
            const win = window;
            const oscilar = win.__ojsdk__ = win.__ojsdk__ || {};
            // Initialize commit array if it doesn't exist
            oscilar.commit = oscilar.commit || [];
            // Create the commit data object
            const commitData = {};
            // Only add properties if they are provided
            if (userID)
                commitData.userID = userID;
            if (sessionID)
                commitData.sessionID = sessionID;
            // Push the commit data
            oscilar.commit.push(commitData);
            this.log(`Data committed to Oscilar - ${Object.keys(commitData).length ? JSON.stringify(commitData) : 'empty object'}`);
        }
        catch (error) {
            this.log(`Error committing to Oscilar: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            // Fail silently in production
        }
    }
}
const oscilarService = OscilarService.getInstance();

// Event types for wallet UI components
var WalletEventType;
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

// Helper function to conditionally log only in development
const devLog$2 = (environment, message, ...args) => {
    if (environment === common.Environment.LOCALDEVELOPMENT || environment === common.Environment.STAGING) {
        console.log(message, ...args);
    }
};
/**
 * Central event tracking utility for wallet UI components
 * Emits CustomEvents that parent applications can listen to
 */
class WalletEventTracker {
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
        devLog$2(this.environment, `[WalletEvent] ${eventType}:`, standardizedData);
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
const eventTracker = WalletEventTracker.getInstance();

/**
 * Error Message Translator for Wallet UI Components
 * Converts technical API error messages to user-friendly ones
 */
// Error translation mappings
const ERROR_TRANSLATIONS = [
    // Duplicate payment method errors
    {
        pattern: /same payment instrument details already existed/i,
        userMessage: "This card is already saved to your account. Please use a different card or update your existing card details.",
        category: 'duplicate'
    },
    {
        pattern: /payment instrument.*already exists/i,
        userMessage: "This payment method is already saved to your account.",
        category: 'duplicate'
    },
    {
        pattern: /tokenization request was rejected.*same payment instrument details already existed/i,
        userMessage: "This card is already saved to your wallet. Please use a different card or update your existing card information.",
        category: 'duplicate'
    },
    {
        pattern: /tokenization request was rejected/i,
        userMessage: "We couldn't process this card. Please check your card details and try again, or use a different card.",
        category: 'validation'
    },
    // Card validation errors
    {
        pattern: /invalid card number/i,
        userMessage: "Please enter a valid card number.",
        category: 'validation'
    },
    {
        pattern: /card number.*invalid/i,
        userMessage: "The card number you entered is not valid. Please check and try again.",
        category: 'validation'
    },
    {
        pattern: /invalid expiration/i,
        userMessage: "Please enter a valid expiration date.",
        category: 'validation'
    },
    {
        pattern: /expired card/i,
        userMessage: "This card has expired. Please use a different card.",
        category: 'validation'
    },
    {
        pattern: /invalid cvv/i,
        userMessage: "Please enter a valid security code (CVV).",
        category: 'validation'
    },
    {
        pattern: /insufficient funds/i,
        userMessage: "This card has insufficient funds. Please use a different payment method.",
        category: 'validation'
    },
    {
        pattern: /card declined/i,
        userMessage: "Your card was declined. Please contact your bank or use a different card.",
        category: 'validation'
    },
    // Bank account validation errors
    {
        pattern: /invalid routing number/i,
        userMessage: "Please enter a valid routing number.",
        category: 'validation'
    },
    {
        pattern: /invalid account number/i,
        userMessage: "Please enter a valid account number.",
        category: 'validation'
    },
    {
        pattern: /bank account.*not found/i,
        userMessage: "We couldn't verify this bank account. Please check your details and try again.",
        category: 'validation'
    },
    // Security and authentication errors
    {
        pattern: /unauthorized/i,
        userMessage: "Your session has expired. Please refresh the page and try again.",
        category: 'security'
    },
    {
        pattern: /forbidden/i,
        userMessage: "You don't have permission to perform this action.",
        category: 'security'
    },
    {
        pattern: /authentication.*failed/i,
        userMessage: "Authentication failed. Please refresh the page and try again.",
        category: 'security'
    },
    // Network and server errors
    {
        pattern: /network.*error/i,
        userMessage: "Network connection error. Please check your internet connection and try again.",
        category: 'network'
    },
    {
        pattern: /server.*error/i,
        userMessage: "We're experiencing technical difficulties. Please try again in a few moments.",
        category: 'network'
    },
    {
        pattern: /timeout/i,
        userMessage: "The request timed out. Please try again.",
        category: 'network'
    },
    // Generic validation errors
    {
        pattern: /required.*missing/i,
        userMessage: "Please fill in all required fields.",
        category: 'validation'
    },
    {
        pattern: /invalid.*format/i,
        userMessage: "Please check the format of your information and try again.",
        category: 'validation'
    },
    {
        pattern: /validation.*failed/i,
        userMessage: "Please check your information and try again.",
        category: 'validation'
    }
];
/**
 * Translates a technical API error message to a user-friendly message
 * @param technicalMessage - The technical error message from the API
 * @returns User-friendly error message
 */
function translateErrorMessage(technicalMessage) {
    if (!technicalMessage || typeof technicalMessage !== 'string') {
        return "An unexpected error occurred. Please try again.";
    }
    // Find matching translation
    for (const translation of ERROR_TRANSLATIONS) {
        if (typeof translation.pattern === 'string') {
            if (technicalMessage.toLowerCase().includes(translation.pattern.toLowerCase())) {
                return translation.userMessage;
            }
        }
        else {
            // RegExp pattern
            if (translation.pattern.test(technicalMessage)) {
                return translation.userMessage;
            }
        }
    }
    // If no specific translation found, return a generic user-friendly message
    return "We encountered an issue processing your request. Please check your information and try again.";
}
/**
 * Gets the error category for analytics/logging purposes
 * @param technicalMessage - The technical error message
 * @returns Error category
 */
function getErrorCategory(technicalMessage) {
    if (!technicalMessage || typeof technicalMessage !== 'string') {
        return 'generic';
    }
    for (const translation of ERROR_TRANSLATIONS) {
        if (typeof translation.pattern === 'string') {
            if (technicalMessage.toLowerCase().includes(translation.pattern.toLowerCase())) {
                return translation.category;
            }
        }
        else {
            if (translation.pattern.test(technicalMessage)) {
                return translation.category;
            }
        }
    }
    return 'generic';
}
/**
 * Enhanced error translation with additional context
 * @param technicalMessage - The technical error message
 * @param context - Additional context (e.g., 'card', 'bank', 'general')
 * @returns Enhanced user-friendly error message
 */
function translateErrorWithContext(technicalMessage, context = 'general') {
    const userMessage = translateErrorMessage(technicalMessage);
    const category = getErrorCategory(technicalMessage);
    // Add context-specific enhancements
    let enhancedMessage = userMessage;
    if (context === 'card' && category === 'duplicate') {
        enhancedMessage = "This card is already saved to your wallet. You can update your existing card details or add a different card.";
    }
    else if (context === 'bank' && category === 'duplicate') {
        enhancedMessage = "This bank account is already saved to your wallet. You can update your existing account details or add a different account.";
    }
    return {
        userMessage: enhancedMessage,
        category,
        originalMessage: technicalMessage
    };
}

/**
 * Simple helper functions for wallet event tracking
 * Provides easy-to-use methods for components with minimal code changes
 */
/**
 * Initialize event tracking for a component
 */
function initWalletEvents(componentName, environment = 'production') {
    eventTracker.init(componentName, environment);
    eventTracker.trackUIEvent(WalletEventType.COMPONENT_LOADED, 'component-initialized');
}
/**
 * Track API calls with automatic timing
 */
async function trackApiCall(endpoint, method, apiCall) {
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
function trackPaymentSelection(paymentMethodId, paymentMethodType, paymentMethodText) {
    eventTracker.trackPaymentMethodSelected(paymentMethodId, paymentMethodType, paymentMethodText);
}
/**
 * Track form lifecycle events
 */
function trackAddPaymentStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_STARTED, 'payment');
}
function trackAddPaymentSuccess(paymentMethodData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_SUCCESS, 'payment', paymentMethodData);
}
function trackAddPaymentCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_CANCELLED, 'payment');
}
function trackAddPaymentError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_ERROR, 'payment', {
        error,
        errorCategory
    });
}
function trackAddBankStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_STARTED, 'bank');
}
function trackAddBankSuccess(bankAccountData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_SUCCESS, 'bank', bankAccountData);
}
function trackAddBankCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_CANCELLED, 'bank');
}
function trackAddBankError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_ERROR, 'bank', {
        error,
        errorCategory
    });
}
/**
 * Track form validation errors
 */
function trackValidationError(formType, errors) {
    eventTracker.trackFormEvent(WalletEventType.FORM_VALIDATION_ERROR, formType, { validationErrors: errors });
}

const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'DC', name: 'District of Columbia' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'GU', name: 'Guam' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'VI', name: 'Virgin Islands, U.S.' },
];
const CANADA_STATES = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
];
const STATES = (countryCode) => {
    switch (countryCode) {
        case 'CA':
            return CANADA_STATES;
        case 'US':
        default:
            return US_STATES;
    }
};
const COUNTRY = [
    { code: 'US', name: 'United States of America' },
    { code: 'AX', name: 'Aland Islands' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia (Plurinational State of)' },
    { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo (the Democratic Republic of the)' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CW', name: 'Curaçao' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FK', name: 'Falkland Islands [Malvinas]' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GR', name: 'Greece' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'VA', name: 'Holy See' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MK', name: 'Macedonia (the former Yugoslav Republic of)' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MD', name: 'Moldova (the Republic of)' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PS', name: 'Palestine, State of' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Réunion' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russian Federation' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BL', name: 'Saint Barthélemy' },
    { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'MF', name: 'Saint Martin (French part)' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SX', name: 'Sint Maarten (Dutch part)' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'KR', name: 'South Korea' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan (the)' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SZ', name: 'Swaziland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'TW', name: 'Taiwan (Province of China)' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania, United Republic of' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom of Great Britain and Northern Ireland' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VE', name: 'Venezuela (Bolivarian Republic of)' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VG', name: 'Virgin Islands (British)' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'EH', name: 'Western Sahara*' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
];
const CountryAndPhoneCodes = [
    {
        "Id": "US",
        "PhoneCode": "1 ",
        "States": null,
        "Name": "UNITED STATES",
        "Description": "UNITED STATES",
        "SortOrder": 0,
        "Active": true
    },
    {
        "Id": "AF",
        "PhoneCode": " 93",
        "States": null,
        "Name": "AFGHANISTAN",
        "Description": "AFGHANISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AX",
        "PhoneCode": "358 ",
        "States": null,
        "Name": "ALAND ISLANDS",
        "Description": "ALAND ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AL",
        "PhoneCode": "355 ",
        "States": null,
        "Name": "ALBANIA",
        "Description": "ALBANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DZ",
        "PhoneCode": "213 ",
        "States": null,
        "Name": "ALGERIA",
        "Description": "ALGERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AS",
        "PhoneCode": "1684 ",
        "States": null,
        "Name": "AMERICAN SAMOA",
        "Description": "AMERICAN SAMOA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AD",
        "PhoneCode": "376 ",
        "States": null,
        "Name": "ANDORRA",
        "Description": "ANDORRA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AO",
        "PhoneCode": "244 ",
        "States": null,
        "Name": "ANGOLA",
        "Description": "ANGOLA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AI",
        "PhoneCode": "1264 ",
        "States": null,
        "Name": "ANGUILLA",
        "Description": "ANGUILLA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AG",
        "PhoneCode": "1268 ",
        "States": null,
        "Name": "ANTIGUA AND BARBUDA",
        "Description": "ANTIGUA AND BARBUDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AR",
        "PhoneCode": "54 ",
        "States": null,
        "Name": "ARGENTINA",
        "Description": "ARGENTINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AM",
        "PhoneCode": "374 ",
        "States": null,
        "Name": "ARMENIA",
        "Description": "ARMENIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AW",
        "PhoneCode": " 297",
        "States": null,
        "Name": "ARUBA",
        "Description": "ARUBA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AU",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "AUSTRALIA",
        "Description": "AUSTRALIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AT",
        "PhoneCode": "43 ",
        "States": null,
        "Name": "AUSTRIA",
        "Description": "AUSTRIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AZ",
        "PhoneCode": " 994",
        "States": null,
        "Name": "AZERBAIJAN REPUBLIC",
        "Description": "AZERBAIJAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BS",
        "PhoneCode": " 1242",
        "States": null,
        "Name": "BAHAMAS",
        "Description": "BAHAMAS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BH",
        "PhoneCode": " 973",
        "States": null,
        "Name": "BAHRAIN",
        "Description": "BAHRAIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BD",
        "PhoneCode": " 880",
        "States": null,
        "Name": "BANGLADESH",
        "Description": "BANGLADESH",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BB",
        "PhoneCode": " 1246",
        "States": null,
        "Name": "BARBADOS",
        "Description": "BARBADOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BY",
        "PhoneCode": "375 ",
        "States": null,
        "Name": "BELARUS",
        "Description": "BELARUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BE",
        "PhoneCode": "32 ",
        "States": null,
        "Name": "BELGIUM",
        "Description": "BELGIUM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BZ",
        "PhoneCode": "501 ",
        "States": null,
        "Name": "BELIZE",
        "Description": "BELIZE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BJ",
        "PhoneCode": " 229",
        "States": null,
        "Name": "BENIN",
        "Description": "BENIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BM",
        "PhoneCode": "1441 ",
        "States": null,
        "Name": "BERMUDA",
        "Description": "BERMUDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BT",
        "PhoneCode": "975 ",
        "States": null,
        "Name": "BHUTAN",
        "Description": "BHUTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BO",
        "PhoneCode": "591 ",
        "States": null,
        "Name": "BOLIVIA",
        "Description": "BOLIVIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BQ",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "BONAIRE, SINT EUSTATIUS AND SABA",
        "Description": "BONAIRE, SINT EUSTATIUS AND SABA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BA",
        "PhoneCode": "387 ",
        "States": null,
        "Name": "BOSNIA AND HERZEGOVINA",
        "Description": "BOSNIA AND HERZEGOVINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BW",
        "PhoneCode": "267 ",
        "States": null,
        "Name": "BOTSWANA",
        "Description": "BOTSWANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BR",
        "PhoneCode": "55 ",
        "States": null,
        "Name": "BRAZIL",
        "Description": "BRAZIL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IO",
        "PhoneCode": "246 ",
        "States": null,
        "Name": "BRITISH INDIAN OCEAN TERRITORY",
        "Description": "BRITISH INDIAN OCEAN TERRITORY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BN",
        "PhoneCode": "673 ",
        "States": null,
        "Name": "BRUNEI DARUSSALAM",
        "Description": "BRUNEI DARUSSALAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BG",
        "PhoneCode": "359 ",
        "States": null,
        "Name": "BULGARIA",
        "Description": "BULGARIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BF",
        "PhoneCode": "226 ",
        "States": null,
        "Name": "BURKINA FASO",
        "Description": "BURKINA FASO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BI",
        "PhoneCode": "257 ",
        "States": null,
        "Name": "BURUNDI",
        "Description": "BURUNDI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KH",
        "PhoneCode": " 855",
        "States": null,
        "Name": "CAMBODIA",
        "Description": "CAMBODIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CM",
        "PhoneCode": " 237",
        "States": null,
        "Name": "CAMEROON",
        "Description": "CAMEROON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CA",
        "PhoneCode": " 1",
        "States": null,
        "Name": "CANADA",
        "Description": "CANADA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CV",
        "PhoneCode": " 238",
        "States": null,
        "Name": "CAPE VERDE",
        "Description": "CAPE VERDE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KY",
        "PhoneCode": "1345 ",
        "States": null,
        "Name": "CAYMAN ISLANDS",
        "Description": "CAYMAN ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CF",
        "PhoneCode": "236 ",
        "States": null,
        "Name": "CENTRAL AFRICAN REPUBLIC",
        "Description": "CENTRAL AFRICAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TD",
        "PhoneCode": "235 ",
        "States": null,
        "Name": "CHAD",
        "Description": "CHAD",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CL",
        "PhoneCode": "56 ",
        "States": null,
        "Name": "CHILE",
        "Description": "CHILE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CN",
        "PhoneCode": "86 ",
        "States": null,
        "Name": "CHINA",
        "Description": "CHINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CX",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "CHRISTMAS ISLAND",
        "Description": "CHRISTMAS ISLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CC",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "COCOS (KEELING) ISLANDS",
        "Description": "COCOS (KEELING) ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CO",
        "PhoneCode": " 57",
        "States": null,
        "Name": "COLOMBIA",
        "Description": "COLOMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KM",
        "PhoneCode": "269 ",
        "States": null,
        "Name": "COMOROS",
        "Description": "COMOROS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CG",
        "PhoneCode": "242 ",
        "States": null,
        "Name": "CONGO",
        "Description": "CONGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CD",
        "PhoneCode": " 243",
        "States": null,
        "Name": "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
        "Description": "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CK",
        "PhoneCode": "682 ",
        "States": null,
        "Name": "COOK ISLANDS",
        "Description": "COOK ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CR",
        "PhoneCode": "506 ",
        "States": null,
        "Name": "COSTA RICA",
        "Description": "COSTA RICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CI",
        "PhoneCode": "225 ",
        "States": null,
        "Name": "COTE D'IVOIRE",
        "Description": "COTE D'IVOIRE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HR",
        "PhoneCode": "385 ",
        "States": null,
        "Name": "CROATIA",
        "Description": "CROATIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CU",
        "PhoneCode": "53 ",
        "States": null,
        "Name": "CUBA",
        "Description": "CUBA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CUW",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "CURACAO",
        "Description": "CURACAO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CY",
        "PhoneCode": " 357",
        "States": null,
        "Name": "CYPRUS",
        "Description": "CYPRUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CZ",
        "PhoneCode": " 420",
        "States": null,
        "Name": "CZECH REPUBLIC",
        "Description": "CZECH REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DK",
        "PhoneCode": " 45",
        "States": null,
        "Name": "DENMARK",
        "Description": "DENMARK",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DJ",
        "PhoneCode": "253 ",
        "States": null,
        "Name": "DJIBOUTI",
        "Description": "DJIBOUTI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DM",
        "PhoneCode": " 1767",
        "States": null,
        "Name": "DOMINICA",
        "Description": "DOMINICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DO",
        "PhoneCode": "1809 ",
        "States": null,
        "Name": "DOMINICAN REPUBLIC",
        "Description": "DOMINICAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EC",
        "PhoneCode": "593 ",
        "States": null,
        "Name": "ECUADOR",
        "Description": "ECUADOR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EG",
        "PhoneCode": "20 ",
        "States": null,
        "Name": "EGYPT",
        "Description": "EGYPT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SV",
        "PhoneCode": "503 ",
        "States": null,
        "Name": "EL SALVADOR",
        "Description": "EL SALVADOR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GQ",
        "PhoneCode": "240 ",
        "States": null,
        "Name": "EQUATORIAL GUINEA",
        "Description": "EQUATORIAL GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ER",
        "PhoneCode": "291 ",
        "States": null,
        "Name": "ERITREA",
        "Description": "ERITREA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EE",
        "PhoneCode": "372 ",
        "States": null,
        "Name": "ESTONIA",
        "Description": "ESTONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ET",
        "PhoneCode": "251 ",
        "States": null,
        "Name": "ETHIOPIA",
        "Description": "ETHIOPIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FK",
        "PhoneCode": "500 ",
        "States": null,
        "Name": "FALKLAND ISLANDS",
        "Description": "FALKLAND ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FO",
        "PhoneCode": "298 ",
        "States": null,
        "Name": "FAROE ISLANDS",
        "Description": "FAROE ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FM",
        "PhoneCode": "691 ",
        "States": null,
        "Name": "FEDERATED STATES OF MICRONESIA",
        "Description": "FEDERATED STATES OF MICRONESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FJ",
        "PhoneCode": "679 ",
        "States": null,
        "Name": "FIJI",
        "Description": "FIJI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FI",
        "PhoneCode": "358 ",
        "States": null,
        "Name": "FINLAND",
        "Description": "FINLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FR",
        "PhoneCode": "33 ",
        "States": null,
        "Name": "FRANCE",
        "Description": "FRANCE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GF",
        "PhoneCode": "594 ",
        "States": null,
        "Name": "FRENCH GUIANA",
        "Description": "FRENCH GUIANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PF",
        "PhoneCode": " 689",
        "States": null,
        "Name": "FRENCH POLYNESIA",
        "Description": "FRENCH POLYNESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GA",
        "PhoneCode": "241 ",
        "States": null,
        "Name": "GABON REPUBLIC",
        "Description": "GABON REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GM",
        "PhoneCode": "220 ",
        "States": null,
        "Name": "GAMBIA",
        "Description": "GAMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GE",
        "PhoneCode": "995 ",
        "States": null,
        "Name": "GEORGIA",
        "Description": "GEORGIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DE",
        "PhoneCode": "995 ",
        "States": null,
        "Name": "GERMANY",
        "Description": "GERMANY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GH",
        "PhoneCode": " 233",
        "States": null,
        "Name": "GHANA",
        "Description": "GHANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GI",
        "PhoneCode": "350 ",
        "States": null,
        "Name": "GIBRALTAR",
        "Description": "GIBRALTAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GR",
        "PhoneCode": "30 ",
        "States": null,
        "Name": "GREECE",
        "Description": "GREECE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GL",
        "PhoneCode": "299 ",
        "States": null,
        "Name": "GREENLAND",
        "Description": "GREENLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GD",
        "PhoneCode": "1473 ",
        "States": null,
        "Name": "GRENADA",
        "Description": "GRENADA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GP",
        "PhoneCode": "590 ",
        "States": null,
        "Name": "GUADELOUPE",
        "Description": "GUADELOUPE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GU",
        "PhoneCode": "1671 ",
        "States": null,
        "Name": "GUAM",
        "Description": "GUAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GT",
        "PhoneCode": "502 ",
        "States": null,
        "Name": "GUATEMALA",
        "Description": "GUATEMALA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GG",
        "PhoneCode": "441481 ",
        "States": null,
        "Name": "GUERNSEY",
        "Description": "GUERNSEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GN",
        "PhoneCode": "224 ",
        "States": null,
        "Name": "GUINEA",
        "Description": "GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GW",
        "PhoneCode": "245 ",
        "States": null,
        "Name": "GUINEA-BISSAU",
        "Description": "GUINEA-BISSAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GY",
        "PhoneCode": "592 ",
        "States": null,
        "Name": "GUYANA",
        "Description": "GUYANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HT",
        "PhoneCode": "509 ",
        "States": null,
        "Name": "HAITI",
        "Description": "HAITI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VA",
        "PhoneCode": "379 ",
        "States": null,
        "Name": "HOLY SEE (VATICAN CITY STATE)",
        "Description": "HOLY SEE (VATICAN CITY STATE)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HN",
        "PhoneCode": " 504",
        "States": null,
        "Name": "HONDURAS",
        "Description": "HONDURAS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HK",
        "PhoneCode": "852 ",
        "States": null,
        "Name": "HONG KONG",
        "Description": "HONG KONG",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HU",
        "PhoneCode": " 36",
        "States": null,
        "Name": "HUNGARY",
        "Description": "HUNGARY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IS",
        "PhoneCode": "354 ",
        "States": null,
        "Name": "ICELAND",
        "Description": "ICELAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IN",
        "PhoneCode": " 91",
        "States": null,
        "Name": "INDIA",
        "Description": "INDIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ID",
        "PhoneCode": "62 ",
        "States": null,
        "Name": "INDONESIA",
        "Description": "INDONESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IR",
        "PhoneCode": "98 ",
        "States": null,
        "Name": "IRAN, ISLAMIC REPUBLIC OF",
        "Description": "IRAN, ISLAMIC REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IQ",
        "PhoneCode": "964 ",
        "States": null,
        "Name": "IRAQ",
        "Description": "IRAQ",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IE",
        "PhoneCode": " 353",
        "States": null,
        "Name": "IRELAND",
        "Description": "IRELAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IM",
        "PhoneCode": "44 ",
        "States": null,
        "Name": "ISLE OF MAN",
        "Description": "ISLE OF MAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IL",
        "PhoneCode": " 972",
        "States": null,
        "Name": "ISRAEL",
        "Description": "ISRAEL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IT",
        "PhoneCode": "39 ",
        "States": null,
        "Name": "ITALY",
        "Description": "ITALY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JM",
        "PhoneCode": "1876 ",
        "States": null,
        "Name": "JAMAICA",
        "Description": "JAMAICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JP",
        "PhoneCode": " 81",
        "States": null,
        "Name": "JAPAN",
        "Description": "JAPAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JE",
        "PhoneCode": "441534 ",
        "States": null,
        "Name": "JERSEY",
        "Description": "JERSEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JO",
        "PhoneCode": "962 ",
        "States": null,
        "Name": "JORDAN",
        "Description": "JORDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KZ",
        "PhoneCode": " 7",
        "States": null,
        "Name": "KAZAKHSTAN",
        "Description": "KAZAKHSTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KE",
        "PhoneCode": "254 ",
        "States": null,
        "Name": "KENYA",
        "Description": "KENYA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KI",
        "PhoneCode": "686 ",
        "States": null,
        "Name": "KIRIBATI",
        "Description": "KIRIBATI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KP",
        "PhoneCode": "850 ",
        "States": null,
        "Name": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
        "Description": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KR",
        "PhoneCode": "82 ",
        "States": null,
        "Name": "KOREA, REPUBLIC OF",
        "Description": "KOREA, REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KW",
        "PhoneCode": "965 ",
        "States": null,
        "Name": "KUWAIT",
        "Description": "KUWAIT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KG",
        "PhoneCode": "996 ",
        "States": null,
        "Name": "KYRGYZSTAN",
        "Description": "KYRGYZSTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LA",
        "PhoneCode": "856 ",
        "States": null,
        "Name": "LAOS",
        "Description": "LAOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LV",
        "PhoneCode": "371 ",
        "States": null,
        "Name": "LATVIA",
        "Description": "LATVIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LB",
        "PhoneCode": "961 ",
        "States": null,
        "Name": "LEBANON",
        "Description": "LEBANON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LS",
        "PhoneCode": "266 ",
        "States": null,
        "Name": "LESOTHO",
        "Description": "LESOTHO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LR",
        "PhoneCode": "231 ",
        "States": null,
        "Name": "LIBERIA",
        "Description": "LIBERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LY",
        "PhoneCode": " 218",
        "States": null,
        "Name": "LIBYAN ARAB JAMAHIRIYA",
        "Description": "LIBYAN ARAB JAMAHIRIYA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LI",
        "PhoneCode": "423 ",
        "States": null,
        "Name": "LIECHTENSTEIN",
        "Description": "LIECHTENSTEIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LT",
        "PhoneCode": "370 ",
        "States": null,
        "Name": "LITHUANIA",
        "Description": "LITHUANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LU",
        "PhoneCode": "352 ",
        "States": null,
        "Name": "LUXEMBOURG",
        "Description": "LUXEMBOURG",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MO",
        "PhoneCode": "853 ",
        "States": null,
        "Name": "MACAO",
        "Description": "MACAO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MK",
        "PhoneCode": "389 ",
        "States": null,
        "Name": "MACEDONIA",
        "Description": "MACEDONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MG",
        "PhoneCode": " 261",
        "States": null,
        "Name": "MADAGASCAR",
        "Description": "MADAGASCAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MW",
        "PhoneCode": "265 ",
        "States": null,
        "Name": "MALAWI",
        "Description": "MALAWI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MY",
        "PhoneCode": "60 ",
        "States": null,
        "Name": "MALAYSIA",
        "Description": "MALAYSIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MV",
        "PhoneCode": "960 ",
        "States": null,
        "Name": "MALDIVES",
        "Description": "MALDIVES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ML",
        "PhoneCode": "223 ",
        "States": null,
        "Name": "MALI",
        "Description": "MALI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MT",
        "PhoneCode": "356 ",
        "States": null,
        "Name": "MALTA",
        "Description": "MALTA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MH",
        "PhoneCode": "692 ",
        "States": null,
        "Name": "MARSHALL ISLANDS",
        "Description": "MARSHALL ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MQ",
        "PhoneCode": "596 ",
        "States": null,
        "Name": "MARTINIQUE",
        "Description": "MARTINIQUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MR",
        "PhoneCode": "222 ",
        "States": null,
        "Name": "MAURITANIA",
        "Description": "MAURITANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MU",
        "PhoneCode": "230 ",
        "States": null,
        "Name": "MAURITIUS",
        "Description": "MAURITIUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "YT",
        "PhoneCode": "269 ",
        "States": null,
        "Name": "MAYOTTE",
        "Description": "MAYOTTE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MX",
        "PhoneCode": "52 ",
        "States": null,
        "Name": "MEXICO",
        "Description": "MEXICO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FM",
        "PhoneCode": "691 ",
        "States": null,
        "Name": "MICRONESIA, FEDERATED STATES OF",
        "Description": "MICRONESIA, FEDERATED STATES OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MD",
        "PhoneCode": "373533 ",
        "States": null,
        "Name": "MOLDOVA",
        "Description": "MOLDOVA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MC",
        "PhoneCode": "377 ",
        "States": null,
        "Name": "MONACO",
        "Description": "MONACO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MN",
        "PhoneCode": "976 ",
        "States": null,
        "Name": "MONGOLIA",
        "Description": "MONGOLIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ME",
        "PhoneCode": "382 ",
        "States": null,
        "Name": "MONTENEGRO",
        "Description": "MONTENEGRO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MS",
        "PhoneCode": " 1664",
        "States": null,
        "Name": "MONTSERRAT",
        "Description": "MONTSERRAT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MA",
        "PhoneCode": " 212",
        "States": null,
        "Name": "MOROCCO",
        "Description": "MOROCCO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MZ",
        "PhoneCode": "258 ",
        "States": null,
        "Name": "MOZAMBIQUE",
        "Description": "MOZAMBIQUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MM",
        "PhoneCode": "95 ",
        "States": null,
        "Name": "MYANMAR",
        "Description": "MYANMAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NA",
        "PhoneCode": "264 ",
        "States": null,
        "Name": "NAMIBIA",
        "Description": "NAMIBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NR",
        "PhoneCode": "674 ",
        "States": null,
        "Name": "NAURU",
        "Description": "NAURU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NP",
        "PhoneCode": "977 ",
        "States": null,
        "Name": "NEPAL",
        "Description": "NEPAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NL",
        "PhoneCode": "31 ",
        "States": null,
        "Name": "NETHERLANDS",
        "Description": "NETHERLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AN",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "NETHERLANDS ANTILLES",
        "Description": "NETHERLANDS ANTILLES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NC",
        "PhoneCode": "687 ",
        "States": null,
        "Name": "NEW CALEDONIA",
        "Description": "NEW CALEDONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NZ",
        "PhoneCode": "64 ",
        "States": null,
        "Name": "NEW ZEALAND",
        "Description": "NEW ZEALAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NI",
        "PhoneCode": "505 ",
        "States": null,
        "Name": "NICARAGUA",
        "Description": "NICARAGUA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NE",
        "PhoneCode": " 227",
        "States": null,
        "Name": "NIGER",
        "Description": "NIGER",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NG",
        "PhoneCode": "234 ",
        "States": null,
        "Name": "NIGERIA",
        "Description": "NIGERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NU",
        "PhoneCode": "683 ",
        "States": null,
        "Name": "NIUE",
        "Description": "NIUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NF",
        "PhoneCode": "672 ",
        "States": null,
        "Name": "NORFOLK ISLAND",
        "Description": "NORFOLK ISLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MP",
        "PhoneCode": "1670 ",
        "States": null,
        "Name": "NORTHERN MARIANA ISLANDS",
        "Description": "NORTHERN MARIANA ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NO",
        "PhoneCode": "47 ",
        "States": null,
        "Name": "NORWAY",
        "Description": "NORWAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "OM",
        "PhoneCode": "968 ",
        "States": null,
        "Name": "OMAN",
        "Description": "OMAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PK",
        "PhoneCode": " 92",
        "States": null,
        "Name": "PAKISTAN",
        "Description": "PAKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PW",
        "PhoneCode": "680 ",
        "States": null,
        "Name": "PALAU",
        "Description": "PALAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PS",
        "PhoneCode": "970 ",
        "States": null,
        "Name": "PALESTINIAN TERRITORY, OCCUPIED",
        "Description": "PALESTINIAN TERRITORY, OCCUPIED",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PA",
        "PhoneCode": " 507",
        "States": null,
        "Name": "PANAMA",
        "Description": "PANAMA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PG",
        "PhoneCode": "675 ",
        "States": null,
        "Name": "PAPUA NEW GUINEA",
        "Description": "PAPUA NEW GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PY",
        "PhoneCode": "595 ",
        "States": null,
        "Name": "PARAGUAY",
        "Description": "PARAGUAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PE",
        "PhoneCode": "51 ",
        "States": null,
        "Name": "PERU",
        "Description": "PERU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PH",
        "PhoneCode": "63 ",
        "States": null,
        "Name": "PHILIPPINES",
        "Description": "PHILIPPINES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PL",
        "PhoneCode": "48 ",
        "States": null,
        "Name": "POLAND",
        "Description": "POLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PT",
        "PhoneCode": "351 ",
        "States": null,
        "Name": "PORTUGAL",
        "Description": "PORTUGAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PR",
        "PhoneCode": " 1787",
        "States": null,
        "Name": "PUERTO RICO",
        "Description": "PUERTO RICO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "QA",
        "PhoneCode": " 974",
        "States": null,
        "Name": "QATAR",
        "Description": "QATAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RE",
        "PhoneCode": "262 ",
        "States": null,
        "Name": "REUNION",
        "Description": "REUNION",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RO",
        "PhoneCode": "40 ",
        "States": null,
        "Name": "ROMANIA",
        "Description": "ROMANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RU",
        "PhoneCode": "7 ",
        "States": null,
        "Name": "RUSSIA",
        "Description": "RUSSIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RW",
        "PhoneCode": "250 ",
        "States": null,
        "Name": "RWANDA",
        "Description": "RWANDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BLM",
        "PhoneCode": "590",
        "States": null,
        "Name": "SAINT BARTHELEMY",
        "Description": "SAINT BARTHELEMY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SH",
        "PhoneCode": "290 ",
        "States": null,
        "Name": "SAINT HELENA",
        "Description": "SAINT HELENA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KN",
        "PhoneCode": "1869 ",
        "States": null,
        "Name": "SAINT KITTS AND NEVIS",
        "Description": "SAINT KITTS AND NEVIS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LC",
        "PhoneCode": "1758 ",
        "States": null,
        "Name": "SAINT LUCIA",
        "Description": "SAINT LUCIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MF",
        "PhoneCode": " 590",
        "States": null,
        "Name": "SAINT MARTIN (FRENCH PART)",
        "Description": "SAINT MARTIN (FRENCH PART)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PM",
        "PhoneCode": "508 ",
        "States": null,
        "Name": "SAINT PIERRE AND MIQUELON",
        "Description": "SAINT PIERRE AND MIQUELON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VC",
        "PhoneCode": "1784 ",
        "States": null,
        "Name": "SAINT VINCENT AND THE GRENADINES",
        "Description": "SAINT VINCENT AND THE GRENADINES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "WS",
        "PhoneCode": "685 ",
        "States": null,
        "Name": "SAMOA",
        "Description": "SAMOA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SM",
        "PhoneCode": "378 ",
        "States": null,
        "Name": "SAN MARINO",
        "Description": "SAN MARINO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ST",
        "PhoneCode": "239 ",
        "States": null,
        "Name": "SAO TOME AND PRINCIPE",
        "Description": "SAO TOME AND PRINCIPE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SA",
        "PhoneCode": " 966",
        "States": null,
        "Name": "SAUDI ARABIA",
        "Description": "SAUDI ARABIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SN",
        "PhoneCode": "221 ",
        "States": null,
        "Name": "SENEGAL",
        "Description": "SENEGAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RS",
        "PhoneCode": " 381",
        "States": null,
        "Name": "SERBIA",
        "Description": "SERBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SC",
        "PhoneCode": "248 ",
        "States": null,
        "Name": "SEYCHELLES",
        "Description": "SEYCHELLES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SL",
        "PhoneCode": "232 ",
        "States": null,
        "Name": "SIERRA LEONE",
        "Description": "SIERRA LEONE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SG",
        "PhoneCode": "65 ",
        "States": null,
        "Name": "SINGAPORE",
        "Description": "SINGAPORE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SX",
        "PhoneCode": "1 ",
        "States": null,
        "Name": "SINT MAARTEN (DUTCH PART)",
        "Description": "SINT MAARTEN (DUTCH PART)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SK",
        "PhoneCode": "421 ",
        "States": null,
        "Name": "SLOVAKIA",
        "Description": "SLOVAKIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SI",
        "PhoneCode": "386 ",
        "States": null,
        "Name": "SLOVENIA",
        "Description": "SLOVENIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SB",
        "PhoneCode": "677 ",
        "States": null,
        "Name": "SOLOMON ISLANDS",
        "Description": "SOLOMON ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SO",
        "PhoneCode": "252 ",
        "States": null,
        "Name": "SOMALIA",
        "Description": "SOMALIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZA",
        "PhoneCode": "27 ",
        "States": null,
        "Name": "SOUTH AFRICA",
        "Description": "SOUTH AFRICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GS",
        "PhoneCode": "500",
        "States": null,
        "Name": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
        "Description": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KR",
        "PhoneCode": "82 ",
        "States": null,
        "Name": "SOUTH KOREA",
        "Description": "SOUTH KOREA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SS",
        "PhoneCode": "211",
        "States": null,
        "Name": "SOUTH SUDAN",
        "Description": "SOUTH SUDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ES",
        "PhoneCode": "34 ",
        "States": null,
        "Name": "SPAIN",
        "Description": "SPAIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LK",
        "PhoneCode": "94 ",
        "States": null,
        "Name": "SRI LANKA",
        "Description": "SRI LANKA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SD",
        "PhoneCode": " 249",
        "States": null,
        "Name": "SUDAN",
        "Description": "SUDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SR",
        "PhoneCode": "597 ",
        "States": null,
        "Name": "SURINAME",
        "Description": "SURINAME",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SJ",
        "PhoneCode": "47 ",
        "States": null,
        "Name": "SVALBARD AND JAN MAYEN",
        "Description": "SVALBARD AND JAN MAYEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SZ",
        "PhoneCode": "268 ",
        "States": null,
        "Name": "SWAZILAND",
        "Description": "SWAZILAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SE",
        "PhoneCode": "46 ",
        "States": null,
        "Name": "SWEDEN",
        "Description": "SWEDEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CH",
        "PhoneCode": "41 ",
        "States": null,
        "Name": "SWITZERLAND",
        "Description": "SWITZERLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SY",
        "PhoneCode": "963 ",
        "States": null,
        "Name": "SYRIAN ARAB REPUBLIC",
        "Description": "SYRIAN ARAB REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TW",
        "PhoneCode": "886 ",
        "States": null,
        "Name": "TAIWAN",
        "Description": "TAIWAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TJ",
        "PhoneCode": " 992",
        "States": null,
        "Name": "TAJIKISTAN",
        "Description": "TAJIKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TZ",
        "PhoneCode": "255 ",
        "States": null,
        "Name": "TANZANIA",
        "Description": "TANZANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TH",
        "PhoneCode": "66 ",
        "States": null,
        "Name": "THAILAND",
        "Description": "THAILAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TL",
        "PhoneCode": "670 ",
        "States": null,
        "Name": "TIMOR-LESTE",
        "Description": "TIMOR-LESTE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TG",
        "PhoneCode": "228 ",
        "States": null,
        "Name": "TOGO",
        "Description": "TOGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TK",
        "PhoneCode": "690 ",
        "States": null,
        "Name": "TOKELAU",
        "Description": "TOKELAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TO",
        "PhoneCode": "676 ",
        "States": null,
        "Name": "TONGA",
        "Description": "TONGA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TT",
        "PhoneCode": "1868 ",
        "States": null,
        "Name": "TRINIDAD AND TOBAGO",
        "Description": "TRINIDAD AND TOBAGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TN",
        "PhoneCode": "216 ",
        "States": null,
        "Name": "TUNISIA",
        "Description": "TUNISIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TR",
        "PhoneCode": "90 ",
        "States": null,
        "Name": "TURKEY",
        "Description": "TURKEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TM",
        "PhoneCode": "993 ",
        "States": null,
        "Name": "TURKMENISTAN",
        "Description": "TURKMENISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TC",
        "PhoneCode": "1649 ",
        "States": null,
        "Name": "TURKS AND CAICOS",
        "Description": "TURKS AND CAICOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TV",
        "PhoneCode": "688 ",
        "States": null,
        "Name": "TUVALU",
        "Description": "TUVALU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UG",
        "PhoneCode": "256 ",
        "States": null,
        "Name": "UGANDA",
        "Description": "UGANDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UA",
        "PhoneCode": "380 ",
        "States": null,
        "Name": "UKRAINE",
        "Description": "UKRAINE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AE",
        "PhoneCode": "971 ",
        "States": null,
        "Name": "UNITED ARAB EMIRATES",
        "Description": "UNITED ARAB EMIRATES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GB",
        "PhoneCode": "44 ",
        "States": null,
        "Name": "UNITED KINGDOM",
        "Description": "UNITED KINGDOM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UY",
        "PhoneCode": "598 ",
        "States": null,
        "Name": "URUGUAY",
        "Description": "URUGUAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UZ",
        "PhoneCode": "998 ",
        "States": null,
        "Name": "UZBEKISTAN",
        "Description": "UZBEKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VU",
        "PhoneCode": "678 ",
        "States": null,
        "Name": "VANUATU",
        "Description": "VANUATU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VA",
        "PhoneCode": "379 ",
        "States": null,
        "Name": "VATICAN CITY",
        "Description": "VATICAN CITY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VE",
        "PhoneCode": "58 ",
        "States": null,
        "Name": "VENEZUELA",
        "Description": "VENEZUELA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VN",
        "PhoneCode": "84 ",
        "States": null,
        "Name": "VIETNAM",
        "Description": "VIETNAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VG",
        "PhoneCode": "1284 ",
        "States": null,
        "Name": "VIRGIN ISLANDS, BRITISH",
        "Description": "VIRGIN ISLANDS, BRITISH",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VI",
        "PhoneCode": "1340 ",
        "States": null,
        "Name": "VIRGIN ISLANDS, U.S.",
        "Description": "VIRGIN ISLANDS, U.S.",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "WF",
        "PhoneCode": "681 ",
        "States": null,
        "Name": "WALLIS AND FUTUNA",
        "Description": "WALLIS AND FUTUNA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EH",
        "PhoneCode": "212 ",
        "States": null,
        "Name": "WESTERN SAHARA",
        "Description": "WESTERN SAHARA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "YE",
        "PhoneCode": "967 ",
        "States": null,
        "Name": "YEMEN",
        "Description": "YEMEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZM",
        "PhoneCode": "260 ",
        "States": null,
        "Name": "ZAMBIA",
        "Description": "ZAMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZW",
        "PhoneCode": "263 ",
        "States": null,
        "Name": "ZIMBABWE",
        "Description": "ZIMBABWE",
        "SortOrder": 1,
        "Active": true
    }
];

// Helper function to conditionally log only in development
const devLog$1 = (environment, message, ...args) => {
    if (environment === common.Environment.LOCALDEVELOPMENT || environment === common.Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function addCard(operationsToken, userScopedAccessToken, requestBody, environment = common.Environment.PRODUCTION) {
    const apiConfig = common.getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.ADD_CARD}`;
    devLog$1(environment, 'Add Card Request Details:', {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Masking the tokens for security
            'Authorization': `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            'X-SW-API-KEY': `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`,
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${operationsToken}`,
                'X-SW-API-KEY': userScopedAccessToken,
            },
            body: JSON.stringify(requestBody),
        });
        devLog$1(environment, 'Add Card Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog$1(environment, 'Add Card Response Data:', responseData);
        // Check if the response JSON contains a status of 400
        if (responseData.status === 400) {
            devLog$1(environment, 'Validation Error Response:', responseData);
            return { success: false, errors: parseErrorResponse$1(responseData, environment) };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'An error occurred while adding the card.' };
        }
        devLog$1(environment, 'Card added successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error adding card:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
function parseErrorResponse$1(errorResponse, environment) {
    let processedMessages = [];
    if (errorResponse.errors) {
        // Format 1: Extract errors from the "errors" object with field context
        for (const fieldKey in errorResponse.errors) {
            if (errorResponse.errors[fieldKey] && Array.isArray(errorResponse.errors[fieldKey])) {
                const fieldErrors = errorResponse.errors[fieldKey];
                for (const errorMessage of fieldErrors) {
                    // Check if this is a field-specific validation error
                    if (isFieldSpecificError$1(fieldKey)) {
                        // Show BFF message as-is for field-specific errors
                        devLog$1(environment, `Field-specific error (${fieldKey}): showing as-is:`, errorMessage);
                        processedMessages.push(errorMessage);
                    }
                    else {
                        // Use translator for non-field-specific errors
                        const translatedMessage = translateErrorMessage(errorMessage);
                        devLog$1(environment, `Non-field error: "${errorMessage}" → "${translatedMessage}"`);
                        processedMessages.push(translatedMessage);
                    }
                }
            }
        }
    }
    else if (errorResponse.detail) {
        // Format 2: Extract the "detail" field - treat as non-field-specific
        const translatedMessage = translateErrorMessage(errorResponse.detail);
        processedMessages = [translatedMessage];
    }
    else {
        // Fallback: Return a generic error message
        processedMessages = ['An unknown error occurred. Please try again.'];
    }
    // Remove duplicate messages to avoid showing the same generic message multiple times
    const uniqueMessages = [...new Set(processedMessages)];
    devLog$1(environment, 'Final processed messages (duplicates removed):', uniqueMessages);
    return uniqueMessages;
}
// Helper function to determine if an error is field-specific
function isFieldSpecificError$1(fieldKey) {
    // Field-specific errors contain field names like:
    // "ExpirationYear", "BillingAddress.City", "CardNumber", etc.
    const fieldSpecificPatterns = [
        /^ExpirationYear$/i,
        /^ExpirationMonth$/i,
        /^CardNumber$/i,
        /^CardHolder$/i,
        /^BillingAddress\./i, // BillingAddress.City, BillingAddress.PostalCode, etc.
        /^PayorInformation\./i, // PayorInformation.FirstName, etc.
        /^WalletOwnerIdentifiers\./i,
        /^AccountNumber$/i,
        /^RoutingNumber$/i,
        /^BankAccountType$/i
    ];
    return fieldSpecificPatterns.some(pattern => pattern.test(fieldKey));
}

const isValidPOBoxAddess = (value) => {
    const poBoxRegex = /^\s*(?:p[\W_]*[o0]?|post(?:al)?)\s*(?:(?:[\W_]*[o0]ffice)?[\W_]*(?:b[o0]x|bin)|[\W_]*[o0]ffice)\s*(?:\d+)?\s*$/im;
    return poBoxRegex.test(value);
};

const addnewpaymentModuleCss = "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'); .add-new-payment{margin-top:20px;padding:20px}.add-new-payment h3{margin-top:0;margin-bottom:20px;font-weight:700;}.add-new-payment select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:white;border:1px solid #ccc;border-radius:4px;padding:8px 12px;font-size:14px;color:#333;cursor:pointer;background-image:url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>');background-repeat:no-repeat;background-position:right 8px center;background-size:12px;padding-right:30px}.add-new-payment select:focus{outline:none;border-color:#007bff;box-shadow:0 0 0 2px rgba(0, 123, 255, 0.25)}.add-new-payment select option{padding:8px;background-color:white;color:#333}.add-new-payment select option:hover{background-color:#f0f0f0}.dropdown-wrapper{position:relative;width:100%;margin-bottom:0px}.dropdown-header{all:unset;display:block;width:90%;padding:8px;border:1px solid #e9eaeb;border-radius:12px;font-weight:500;font-size:14px;cursor:pointer;background-color:white;margin-bottom:0px;transition:border 0.2s ease}.dropdown-header:focus{outline:none;border:1px solid #282829}.dropdown-list{position:absolute;width:100%;top:100%;left:0;z-index:10;background-color:white;border:1px solid #e9eaeb;border-radius:12px;opacity:1;transform:none;transform-origin:100px 0px;transition:opacity 263ms cubic-bezier(0.4, 0, 0.2, 1),\r\n              transform 175ms cubic-bezier(0.4, 0, 0.2, 1);max-height:150px;list-style-type:none;padding-left:0px;margin:0px;overflow-y:auto;scrollbar-width:none;scroll-behavior:smooth;min-width:250px}.dropdown-item{padding:8px 10px;font-size:14px !important;font-weight:400 !important;color:#282829 !important;cursor:pointer}.dropdown-item:hover{background-color:#e9eaeb}.dropdown-content{display:flex;justify-content:space-between;width:100%;margin-bottom:0px}.dropdown-button{all:unset;width:100%;display:block;cursor:pointer}.addressVerification-message-warning-info,.addressVerification-message-error-info{padding:0px 16px;border-radius:8px;box-shadow:0 1px 3px rgba(0, 0, 0, 0.05);margin:0px 0px 16px 0px;width:100%;display:flex;flex-direction:row;gap:2px;overflow:visible !important;max-height:none;align-items:flex-start;min-width:297px;min-height:103px}.addressVerification-message-warning-info{background-color:#E3F2FC;border-left:13px solid #0076CC}.addressVerification-message-error-info{background-color:#FFEBEE;border-left:13px solid #D01A1F}.addressVerification-message-notice-body{white-space:pre-wrap;word-break:break-word;margin-top:26px}.addressVerification-message-warning-content{white-space:pre-line;margin:0px;word-break:break-word;font-weight:400}.addressVerification-close-btn{background:none;border:none;font-size:24px;font-weight:bold;color:#6B7280;cursor:pointer;margin-top:22px}.addressVerification-close-btn:hover{color:#374151}.required-asterisk{color:red}.add-new-payment date-picker .date-picker-wrapper{margin-bottom:0px !important}.error::before,.error::after{display:none !important}";

const AddNewPayment = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.goToPaymentSelector = index.createEvent(this, "goToPaymentSelector");
        this.addressValidation = index.createEvent(this, "addressValidation");
        this.cardAdded = index.createEvent(this, "cardAdded");
    }
    goToPaymentSelector;
    addressValidation;
    errorBannerRef = null;
    // Helper function to conditionally log only in development
    devLog = (message, ...args) => {
        if (this.environment === common.Environment.LOCALDEVELOPMENT || this.environment === common.Environment.STAGING) {
            console.log(message, ...args);
        }
    };
    formattedMobileNumber;
    showAddNewPayment = false;
    showPaymentSelector = true;
    operationsToken;
    userScopedAccessToken;
    environment = common.Environment.PRODUCTION; // Environment parameter with production default
    availableCreditCards;
    cardAdded;
    nameOnCard = '';
    cardNumber = '';
    expiryDate = '';
    cvv = '';
    cardType = '';
    address2 = '';
    dateofBirth = '';
    paymentAccountNickname = '';
    firstName = '';
    lastName = '';
    address1 = '';
    city = '';
    state = '';
    country = '';
    zipCode = '';
    mobilePhoneNumber = '';
    selectedPhoneCode = '';
    isPhoneCodeDropdownOpen = false;
    emailAddress = '';
    apiErrors = {};
    isLoading = false;
    mfaPopUp = false;
    addCardRequestPayload;
    mfaResponsePayload;
    isAddressSuggestion = false;
    brokenRules = [];
    errors = {
        nameOnCard: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        firstName: '',
        lastName: '',
        address1: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        address2: '',
        dateofBirth: '',
        paymentAccountNickname: '',
        mobilePhoneNumber: '',
        emailAddress: '',
        selectedPhoneCode: '',
    };
    isAddressResubmission = false;
    get el() { return index.getElement(this); }
    dropdownWrapper;
    componentWillLoad() {
        // Initialize event tracking
        initWalletEvents('AddNewPayment', this.environment);
    }
    detectCardType(number) {
        if (/^4/.test(number))
            return common.CardType.VISA;
        // Mastercard: 5[1-5] (traditional) or 2221-2720 (new range)
        if (/^5[1-5]/.test(number) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[0-1]\d|720)/.test(number))
            return common.CardType.MASTERCARD;
        if (/^3[47]/.test(number))
            return common.CardType.AMEX;
        if (/^6011/.test(number) ||
            /^65\d{2}/.test(number) ||
            /^64[4-9]\d/.test(number) ||
            /^622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[0-1]\d|92[0-5])/.test(number))
            return common.CardType.DISCOVER;
        if (/^3(0[0-5]|[68]|9)/.test(number))
            return common.CardType.DINERS;
        if (/^35(2[89]|[3-8]\d)/.test(number))
            return common.CardType.JCB;
        if (/^62[013-9]/.test(number) || /^628[0-8]/.test(number) || /^81[0-7]/.test(number))
            return common.CardType.UNIONPAY;
        return '';
    }
    formatCardNumber(value) {
        const rawValue = value.replace(/\D/g, '');
        let formattedValue = rawValue;
        if (this.cardType === common.CardType.AMEX) {
            formattedValue = rawValue.replace(/(\d{4})(\d{6})?(\d{5})?/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
        }
        else if (this.cardType === common.CardType.DINERS && formattedValue.length <= 14) {
            formattedValue = rawValue.replace(/(\d{4})(\d{6})?(\d{4})?/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
        }
        else {
            formattedValue = rawValue.replace(/(\d{4})(\d{4})?(\d{4})?(\d{4})?/, (_, g1, g2, g3, g4) => [g1, g2, g3, g4].filter(Boolean).join(' '));
        }
        return formattedValue;
    }
    mapCardTypeToAvailableCC(cardType) {
        const cardTypeMapping = {
            [common.CardType.VISA]: 'Visa',
            [common.CardType.MASTERCARD]: 'Mastercard',
            [common.CardType.AMEX]: 'American_Express',
            [common.CardType.DISCOVER]: 'Discover',
            [common.CardType.DINERS]: 'Diners_Club',
            [common.CardType.JCB]: 'JCB'
        };
        return cardTypeMapping[cardType] || cardType;
    }
    validateCardTypeSupported() {
        const errors = {};
        // Only validate if availableCreditCards is provided and cardType is detected
        if (!this.availableCreditCards || !this.cardType) {
            return errors;
        }
        if (this.availableCreditCards.length === 0) {
            errors.cardNumber = `${this.cardType} cards are not allowed.`;
            return errors;
        }
        // Map detected card type to backend format
        const CardType = this.mapCardTypeToAvailableCC(this.cardType);
        // Check if the mapped card type is in the available list
        const isCardTypeSupported = this.availableCreditCards.some(card => card.name === CardType);
        if (!isCardTypeSupported) {
            errors.cardNumber = `${this.cardType} cards are not allowed.`;
        }
        return errors;
    }
    getExpectedCardLength() {
        const lengthMap = {
            [common.CardType.VISA]: [13, 16, 19],
            [common.CardType.MASTERCARD]: 16,
            [common.CardType.AMEX]: 15,
            [common.CardType.DISCOVER]: 16,
            [common.CardType.DINERS]: [14, 16],
            [common.CardType.JCB]: [16, 17, 18, 19],
            [common.CardType.UNIONPAY]: [16, 17, 18, 19]
        };
        return lengthMap[this.cardType] || 16;
    }
    isValidCardLength(cardLength) {
        const expectedLength = this.getExpectedCardLength();
        if (Array.isArray(expectedLength)) {
            return expectedLength.includes(cardLength);
        }
        return cardLength === expectedLength;
    }
    handleCardNumberChange(value) {
        const rawValue = value.replace(/\D/g, '');
        this.cardNumber = this.formatCardNumber(value);
        this.cardType = this.detectCardType(rawValue);
        if (this.errors.cardNumber) {
            this.errors = { ...this.errors, cardNumber: '' };
        }
    }
    handleInputChange(field, value) {
        this[field] = value;
        // Clear error when user starts typing
        if (this.errors[field]) {
            this.errors = { ...this.errors, [field]: '' };
        }
    }
    handleMobileNumberChange(event) {
        const input = event.target;
        let digits = '';
        if (this.country === 'US') {
            digits = input.value.replace(/\D/g, '').slice(0, 10);
        }
        else {
            digits = input.value.replace(/\D/g, '');
        }
        let formatted = '';
        if (this.country === 'US') {
            if (digits.length > 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            else if (digits.length > 3) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            }
            else if (digits.length > 0) {
                formatted = `(${digits}`;
            }
        }
        else {
            formatted = digits;
        }
        input.value = formatted;
        this.mobilePhoneNumber = formatted;
        if (this.errors[input.id]) {
            this.errors = { ...this.errors, [input.id]: '' };
        }
    }
    handleExpiryDateKeyDown(event) {
        const target = event.target;
        const cursorPosition = target.selectionStart || 0;
        // Handle backspace for better navigation
        if (event.key === 'Backspace') {
            // If cursor is right after the slash (position 3) and we're deleting
            // move cursor to before the slash to allow editing the month
            if (cursorPosition === 3 && target.value.charAt(2) === '/') {
                event.preventDefault();
                const newValue = target.value.slice(0, 2);
                this.expiryDate = newValue;
                target.value = newValue;
                // Set cursor position to end of month
                setTimeout(() => {
                    target.setSelectionRange(2, 2);
                }, 0);
                return;
            }
        }
    }
    handleBirthDateChange(value) {
        const numericValue = value.replace(/\D/g, "");
        // Format the date with slash after 2 digits
        let formattedValue = "";
        if (numericValue.length > 0) {
            formattedValue += numericValue.slice(0, 2);
            if (numericValue.length > 2) {
                formattedValue += "/" + numericValue.slice(2, 4);
                if (numericValue.length > 4) {
                    formattedValue += "/" + numericValue.slice(4, 8);
                }
            }
        }
        this.dateofBirth = formattedValue;
        // Clear error when user starts typing
        if (this.errors.dateofBirth) {
            this.errors = { ...this.errors, dateofBirth: '' };
        }
    }
    handleExpiryDateChange(event) {
        const target = event.target;
        const value = target.value.replace(/\D/g, ''); // Remove non-digit characters
        // Format the date with slash after 2 digits
        let formattedValue = '';
        if (value.length > 0) {
            formattedValue = value.slice(0, 2);
            if (value.length >= 2) {
                formattedValue += '/' + value.slice(2);
            }
            // Limit to 4 digits total (MM/YY)
            formattedValue = formattedValue.slice(0, 5);
        }
        this.expiryDate = formattedValue;
        target.value = formattedValue;
        // Clear error when user starts typing
        if (this.errors.expiryDate) {
            this.errors = { ...this.errors, expiryDate: '' };
        }
    }
    // Display an error banner when we have error messages
    showErrorBanner(messages) {
        setTimeout(() => {
            if (messages?.length > 0 && this.errorBannerRef) {
                this.devLog("showErrorBanner");
                const top = this.errorBannerRef.offsetTop;
                this.scrollToView(top);
            }
        }, 300);
    }
    scrollToView(topValue) {
        window.scrollTo({
            top: topValue - 20,
            behavior: 'smooth',
        });
    }
    handleStateChange(event) {
        const target = event.target;
        const selectedState = STATES(this.country).find(state => state.code === target.value);
        if (selectedState) {
            this.state = selectedState.code;
            // Clear state error when valid state is selected
            this.errors = { ...this.errors, state: '' };
        }
        else {
            // Handle case when user goes back to "Select state/province" (empty value)
            this.state = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, state: '' };
        }
    }
    isCountryUS() {
        return this.country === 'US';
    }
    isCountryUSorCanada() {
        return this.country === 'US' || this.country === 'CA';
    }
    getDefaultState() {
        // below LIne is commented as part of SonarQube improvements
        //return this.isCountryUSorCanada() ? '' : '';
        return '';
    }
    handleCountryChange(event) {
        const target = event.target;
        const selectedCountry = COUNTRY.find(country => country.code === target.value);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            // Clear country & phoneCode error (provided that for selected country phone code has to be there)when valid country is selected
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            // Reset state when country changes
            this.state = '';
            if (this.country === 'US') {
                this.mobilePhoneNumber = '';
                this.selectedPhoneCode = '';
            }
            if (this.country !== 'US') {
                const phoneCodeMap = new Map(CountryAndPhoneCodes.map(c => [c.Id, c.PhoneCode]));
                this.selectedPhoneCode = phoneCodeMap.get(this.country) || '';
                this.mobilePhoneNumber = '';
            }
        }
        else {
            // Handle case when user goes back to "Select country" (empty value)
            this.country = '';
            this.selectedPhoneCode = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            this.state = '';
        }
    }
    handlePhoneCodeChange(event) {
        const target = event.target;
        if (this.errors[target.id]) {
            this.errors = { ...this.errors, [target.id]: '' };
        }
        this.selectedPhoneCode = target.value;
    }
    isValidCardNumber(number) {
        let sum = 0;
        let shouldDouble = false;
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i], 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    }
    validateMobilePhoneNumber() {
        const errors = {};
        const phone = this.mobilePhoneNumber.trim();
        // Mobile Phone Number is now optional - only validate if provided
        if (phone.length === 0) {
            return errors; // No error if empty
        }
        let pattern;
        if (this.country === 'US') {
            pattern = /^\([1-9]\d{2}\)\s?\d{3}-\d{4}$/g;
        }
        else {
            pattern = /^\d*$/g;
        }
        if (!pattern.test(phone)) {
            errors.mobilePhoneNumber = 'Invalid Mobile Phone Number';
        }
        return errors;
    }
    validateEmailAddress() {
        const errors = {};
        // Email is now optional - only validate if provided
        if (!this.emailAddress.trim()) {
            return errors; // No error if empty
        }
        if (this.emailAddress.trim().length > 60) {
            errors.emailAddress = 'E-Mail Address must not exceed 60 characters.';
        }
        else {
            const re = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})$/;
            if (!re.test(this.emailAddress.trim())) {
                errors.emailAddress = 'Please enter a valid E-Mail Address.';
            }
        }
        return errors;
    }
    validateSelectedPhoneCode() {
        const errors = {};
        // Phone code is now optional - only validate if mobile phone number is provided
        // If user enters a phone number, they should also select the country code
        if (this.mobilePhoneNumber.trim().length > 0 && !this.isCountryUS() && !this.selectedPhoneCode.trim()) {
            errors.selectedPhoneCode = 'Country Code is required when phone number is provided';
        }
        return errors;
    }
    togglePhoneCodeDropdown = (event) => {
        event.stopPropagation();
        this.isPhoneCodeDropdownOpen = !this.isPhoneCodeDropdownOpen;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        if (this.isPhoneCodeDropdownOpen) {
            document.addEventListener('click', this.handleOutsideClick);
            document.addEventListener('keydown', this.handleEscapePress);
        }
        else {
            this.removeDropdownListeners();
        }
    };
    selectPhoneCode = (code) => {
        this.selectedPhoneCode = code;
        this.isPhoneCodeDropdownOpen = false;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        this.removeDropdownListeners();
    };
    handleOutsideClick = (event) => {
        if (this.dropdownWrapper && !this.dropdownWrapper.contains(event.target)) {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    handleEscapePress = (event) => {
        if (event.key === 'Escape') {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    removeDropdownListeners() {
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapePress);
    }
    ;
    validateCardFields() {
        const errors = {};
        const rawCardNumber = this.cardNumber.replace(/\s/g, '');
        if (rawCardNumber.length === 0) {
            errors.cardNumber = 'Card Number is required.';
            return errors;
        }
        const cardTypeErrors = this.validateCardTypeSupported();
        if (cardTypeErrors.cardNumber) {
            errors.cardNumber = cardTypeErrors.cardNumber;
            return errors;
        }
        // Validate card length
        if (this.cardType && !this.isValidCardLength(rawCardNumber.length)) {
            errors.cardNumber = `Please enter a valid Card Number.`;
        }
        // Validate Luhn algorithm
        else if (!this.isValidCardNumber(rawCardNumber)) {
            errors.cardNumber = 'Invalid Card Number.';
        }
        const cvvRegex = this.cardType === common.CardType.AMEX ? /^\d{4}$/ : /^\d{3}$/;
        if (!/^\d+$/.test(this.cvv)) {
            errors.cvv = 'CVV must contain only numbers.';
        }
        else if (!cvvRegex.test(this.cvv)) {
            errors.cvv = `CVV must be ${this.cardType === common.CardType.AMEX ? '4' : '3'} digits.`;
        }
        return errors;
    }
    validateExpiryDate() {
        const errors = {};
        const isValidFormat = /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiryDate);
        if (isValidFormat) {
            // Check if expiry date is in the past
            const [month, year] = this.expiryDate.split('/');
            const expiryMonth = parseInt(month, 10);
            const expiryYear = parseInt('20' + year, 10); // Convert YY to YYYY
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
            const currentYear = currentDate.getFullYear();
            // Check if expiry date is in the past
            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                errors.expiryDate = 'Card has expired. Please enter a valid Expiry Date.';
            }
            // Check if expiry date exceeds 10 years from now
            const maxYear = currentYear + 10;
            if (expiryYear > maxYear || (expiryYear === maxYear && expiryMonth > currentMonth)) {
                errors.expiryDate = 'Card expiry date cannot be more than 10 years from today.';
            }
        }
        else {
            errors.expiryDate = 'Expiry Date must be in MM/YY format.';
        }
        return errors;
    }
    validatePersonalFields() {
        const errors = {};
        // ONLY Name on Card is required for tokenization
        if (!this.nameOnCard.trim())
            errors.nameOnCard = 'Name on Card is required.';
        // First Name and Last Name are now OPTIONAL
        // if (!this.firstName.trim()) errors.firstName = 'First Name is required.';
        // if (!this.lastName.trim()) errors.lastName = 'Last Name is required.';
        // Payment Account Nickname is now optional
        // if (!this.paymentAccountNickname.trim()) errors.paymentAccountNickname = 'Payment Account Nickname is required.';
        return errors;
    }
    validateAddressFields() {
        const errors = {};
        // ALL ADDRESS FIELDS ARE NOW OPTIONAL FOR TOKENIZATION
        // Only validate format if values are provided
        // Address Line 1 - optional, but validate PO Box if provided
        if (this.address1.trim().length > 0 && isValidPOBoxAddess(this.address1)) {
            errors.address1 = 'PO Boxes are not allowed. Please enter a valid Address Line 1.';
        }
        // Address Line 2 - optional, but validate PO Box if provided
        if (this.address2.trim().length > 0 && isValidPOBoxAddess(this.address2)) {
            errors.address2 = 'PO Boxes are not allowed. Please enter a valid Address Line 2.';
        }
        // City - now optional
        // if (!this.city.trim()) errors.city = 'City is required.';
        // State - now optional
        // if (this.isCountryUSorCanada() && !this.state.trim()) errors.state = 'State is required';
        // Country - now optional
        // if (!this.country.trim()) errors.country = 'Country is required.';
        // Zip Code - now optional
        // if (!this.zipCode.trim()) errors.zipCode = 'Zip Code is required.';
        return errors;
    }
    validateDateOfBirth() {
        const errors = {};
        // Date of Birth is now optional - only validate if provided
        if (!this.dateofBirth.trim()) {
            return errors; // No error if empty
        }
        const re = /^(0[1-9]|1[012])[- /.](0[1-9]|[12]\d|3[01])[- /.](19|20)\d\d$/g;
        if (!re.test(this.dateofBirth)) {
            errors.dateofBirth = 'Please enter a valid date in MM/DD/YYYY format.';
            return errors;
        }
        const enteredDate = new Date(this.dateofBirth);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
        if (enteredDate > minAgeDate) {
            errors.dateofBirth = 'Must be at least 18 years of age.';
        }
        return errors;
    }
    handleMfaError(messages) {
        if (messages?.length > 0) {
            this.brokenRules = [messages[0]];
            this.showErrorBanner(messages);
        }
    }
    handleClosePopup = () => {
        this.mfaPopUp = false;
    };
    validate() {
        const newErrors = {
            nameOnCard: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
            ...this.validateCardFields(),
            ...this.validateExpiryDate(),
            ...this.validatePersonalFields(),
            ...this.validateAddressFields(),
            ...this.validateDateOfBirth(),
            ...this.validateMobilePhoneNumber(),
            ...this.validateEmailAddress(),
            ...this.validateSelectedPhoneCode(),
        };
        this.scrollToFirstError();
        this.errors = newErrors;
        return Object.keys(newErrors).every(key => !newErrors[key]);
    }
    scrollToFirstError() {
        // Wait for the next frame to ensure the DOM has updated
        requestAnimationFrame(() => {
            // Search the entire document for error elements
            const errorElement = this.el.querySelector('.validation-error');
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    async handleSubmit(event) {
        event.preventDefault();
        this.isLoading = true;
        this.apiErrors = {}; // Clear previous API errors
        this.brokenRules = [];
        if (!this.validate()) {
            this.isLoading = false;
            return;
        }
        const [expirationMonth, expirationYearShort] = this.expiryDate.split('/');
        const expirationYear = `20${expirationYearShort}`;
        this.formattedMobileNumber = this.selectedPhoneCode
            ? '+' + this.selectedPhoneCode.trim() + this.mobilePhoneNumber.trim()
            : this.mobilePhoneNumber;
        const payload = {
            walletOwnerIdentifiers: {
                customer: {
                    customerInformation: {
                        firstName: this.firstName,
                        lastName: this.lastName
                    }
                }
            },
            accountReferenceId: 'cardtoken-' + Date.now(),
            cardHolder: this.nameOnCard,
            billingAddress: {
                addressLine1: this.address1,
                addressLine2: this.address2,
                city: this.city,
                provinceOrStateCode: this.isCountryUSorCanada() ? this.state : '',
                countryCode: this.country || 'US',
                postalCode: this.zipCode,
                addressType: common.AddressType.Primary,
            },
            cardNumber: this.cardNumber.replace(/\s/g, ''),
            payorInformation: {
                firstName: this.firstName,
                lastName: this.lastName,
                paymentAccountNickname: this.paymentAccountNickname,
                validateAddress: !this.isAddressResubmission, // true for first submission, false for resubmission
                dateofBirth: this.formatDateForAPI(this.dateofBirth), // Format as YYYY-MM-DD
                contactInformation: {
                    emailAddress: this.emailAddress, // Add fallback for missing properties
                    phoneNumber: this.formattedMobileNumber,
                },
                identityVerificationInformation: null
            },
            expirationMonth,
            expirationYear,
            tokenizationType: 2,
        };
        this.addCardRequestPayload = payload;
        // Commit device data to Oscilar before making the API call
        oscilarService.commit();
        try {
            const response = await addCard(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            this.devLog('paymentInstrument,data,status:', response?.data?.paymentInstrument?.paymentInstrumentToken, response?.data, response.success);
            if (response.success && response?.data?.paymentInstrument?.paymentInstrumentToken) {
                this.handleSuccess(response);
            }
            else if (response.success && response?.data?.AccountStatus) {
                this.handleResponseSuccess(response);
            }
            else {
                this.handleResponseError(response);
            }
        }
        catch (error) {
            console.error('❌ Unexpected error in payment submission:', error);
            trackAddPaymentError(error.message || 'Unexpected error occurred');
            this.apiErrors = { General: [error.message || 'An unexpected error occurred.'] };
        }
        finally {
            this.isLoading = false;
        }
    }
    handleResponseSuccess(response) {
        // Initialize brokenRules to empty array if not present
        this.brokenRules = response?.data?.BrokenRules || [];
        if (response?.data?.AccountStatus === common.AccountStatus.AddressSuggested) {
            this.isAddressSuggestion = true;
        }
        else {
            this.isAddressSuggestion = false;
        }
        if (this.brokenRules.length > 0) {
            this.devLog("response.success");
            this.showErrorBanner(this.brokenRules);
        }
        const status = response?.data?.AccountStatus;
        switch (status) {
            case common.AccountStatus.AddressSuggested:
                this.handleAddressValidation(response);
                break;
            case common.AccountStatus.MFAPending:
                this.mfaPopUp = true;
                this.mfaResponsePayload = response;
                break;
            case common.AccountStatus.AddressValidationError:
            case common.AccountStatus.AddressValidationUnknownStatus:
                this.handleValidationError(response);
                break;
            case common.AccountStatus.Saved:
                this.handleSuccess(response);
                break;
            default:
                this.handleUnknownError(response);
                break;
        }
    }
    handleResponseError(response) {
        // Track payment addition error
        const errorMessage = response?.message || 'Payment method addition failed';
        trackAddPaymentError(errorMessage);
        // Capture API errors and display them in the UI
        if (response.errors) {
            // Track API validation errors
            trackValidationError('payment', response.errors);
            this.apiErrors = response.errors.reduce((acc, error) => {
                acc.General = acc.General || [];
                acc.General.push(error);
                return acc;
            }, {});
        }
        else if (response.message) {
            // Track single API validation error
            trackValidationError('payment', [response.message]);
            this.apiErrors = { General: [response.message] };
        }
    }
    handleAddressValidation(response) {
        this.address1 = response.data.SuggestedAddresses[0].AddressLine1;
        this.address2 = response.data.SuggestedAddresses[0].AddressLine2;
        this.city = response.data.SuggestedAddresses[0].City;
        this.zipCode = response.data.SuggestedAddresses[0].PostalCode;
        this.applySuggested(response.data.SuggestedAddresses[0].CountryCode, response.data.SuggestedAddresses[0].ProvinceOrStateCode);
        this.isAddressResubmission = true;
        const addressUpdatedMessage = response?.data?.BrokenRules?.[0] ||
            "Address updated. Please review and confirm the changes before submitting.";
        this.addressValidation.emit(addressUpdatedMessage);
        this.devLog('Address updated event emitted:', {
            message: addressUpdatedMessage,
            AddressValidation: common.AccountStatus[common.AccountStatus.AddressSuggested]
        });
    }
    handleValidationError(response) {
        let errorMessage = response?.data?.BrokenRules?.[0];
        if (response?.data?.AccountStatus === common.AccountStatus.AddressValidationError) {
            errorMessage = errorMessage || "Address provided could not be validated. Please update the provided address and resubmit.";
        }
        else if (response?.data?.AccountStatus === common.AccountStatus.AddressValidationUnknownStatus) {
            errorMessage = errorMessage || "Address could not be validated. Please update and resubmit.";
        }
        else {
            errorMessage = errorMessage || "Payment method addition failed.";
        }
        this.isAddressResubmission = true;
        trackAddPaymentError('Address validation error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('addressValidation event emitted:', {
            message: errorMessage,
            AddressValidation: common.AccountStatus[response?.data?.AccountStatus]
        });
    }
    handleUnknownError(response) {
        // Set default message if no broken rules exist
        if (!response?.data?.BrokenRules?.length) {
            response.data = {
                ...response.data,
                BrokenRules: ['Payment method addition failed']
            };
        }
        let errorMessage = response.data.BrokenRules[0];
        this.brokenRules = response.data.BrokenRules;
        this.showErrorBanner(this.brokenRules);
        trackAddPaymentError('Unknown Error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('Event emitted:', {
            message: errorMessage,
            UnKnown: common.AccountStatus[response?.data?.AccountStatus]
        });
    }
    applySuggested(countryCode, stateCode) {
        const selectedCountry = COUNTRY.find(country => country.code === countryCode);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        else {
            this.country = '';
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        if (this.isCountryUSorCanada()) {
            const stateExists = STATES(this.country).some(s => s.code === stateCode);
            if (stateExists)
                this.state = stateCode;
        }
        this.devLog('Applied suggested address:', { countryCode, stateCode });
    }
    handleSuccess(response) {
        this.devLog('🎉 Payment method added successfully, tracking event...');
        trackAddPaymentSuccess({
            cardType: this.cardType,
            lastFourDigits: this.cardNumber.slice(-4),
            expiryDate: this.expiryDate
        });
        this.devLog('✅ Success event tracked');
        const paymentInstrumentToken = response.data.paymentInstrument.paymentInstrumentToken;
        this.devLog('Emitting payment instrument token:', paymentInstrumentToken);
        this.devLog('Full response:', response);
        this.cardAdded.emit(paymentInstrumentToken);
        this.resetForm();
    }
    goToWallet = () => {
        // Track payment method addition cancellation
        trackAddPaymentCancelled();
        this.goToPaymentSelector.emit(true);
    };
    /**
     * Formats a date from MM/DD/YYYY to YYYY-MM-DD format for API
     * @param dateString - Date string in MM/DD/YYYY format
     * @returns Date string in YYYY-MM-DD format
     */
    formatDateForAPI(dateString) {
        if (!dateString || dateString.trim() === '') {
            return '';
        }
        // Parse MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length !== 3) {
            return dateString; // Return original if not in expected format
        }
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        // Return in YYYY-MM-DD format
        return `${year}-${month}-${day}`;
    }
    resetForm() {
        this.nameOnCard = '';
        this.cardNumber = '';
        this.expiryDate = '';
        this.cvv = '';
        this.cardType = '';
        this.firstName = '';
        this.lastName = '';
        this.address1 = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.country = '';
        this.address2 = '';
        this.dateofBirth = '';
        this.paymentAccountNickname = '';
        this.isAddressResubmission = false;
        this.brokenRules = [];
        // Reset the address validation flag
        this.mobilePhoneNumber = '';
        this.emailAddress = '';
        this.selectedPhoneCode = '';
        this.errors = {
            nameOnCard: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
        };
    }
    handleCloseBanner = () => {
        this.brokenRules = [];
    };
    renderErrorBanner() {
        if (!this.brokenRules.length)
            return null;
        return (index.h("div", { ref: el => this.errorBannerRef = el, class: `${this.isAddressSuggestion ? 'addressVerification-message-warning-info' : 'addressVerification-message-error-info'}` }, index.h("div", { class: "addressVerification-message-notice-body" }, index.h("div", { class: "addressVerification-message-warning-content" }, this.brokenRules[0])), index.h("button", { class: "addressVerification-close-btn", type: "button", "aria-label": "Close", onClick: this.handleCloseBanner }, "\u00D7")));
    }
    renderApiErrors() {
        if (!Object.keys(this.apiErrors).length)
            return null;
        return (index.h("div", { class: "api-errors" }, index.h("div", { class: "error-content" }, index.h("h5", null, "Error Message"), index.h("ul", null, Object.entries(this.apiErrors).map(([field, messages]) => messages.map((msg, idx) => (index.h("li", { key: `${field}-${idx}` }, index.h("strong", null, field === 'General' ? '' : `${field}: `), msg))))))));
    }
    renderCardFields() {
        return (index.h("div", { class: "wallet-row" }, index.h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, index.h("label", { htmlFor: "name-on-card", class: this.errors.nameOnCard ? 'validation-error' : '' }, "Name on Card ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "name-on-card", placeholder: "Enter Name on Card", value: this.nameOnCard, onInput: (event) => this.handleInputChange('nameOnCard', event.target.value) }), this.errors.nameOnCard && index.h("span", { class: "error" }, this.errors.nameOnCard)), index.h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, index.h("label", { htmlFor: "card-number", class: this.errors.cardNumber ? 'validation-error' : '' }, "Card Number ", index.h("span", { class: "required-asterisk" }, "*"), " ", this.cardType && index.h("span", null, "(", this.cardType, ")")), index.h("input", { type: "text", id: "card-number", placeholder: "Enter Card Number", autoComplete: "cc-number", value: this.cardNumber, onInput: (event) => this.handleCardNumberChange(event.target.value) }), this.errors.cardNumber && index.h("span", { class: "error" }, this.errors.cardNumber)), index.h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, index.h("label", { htmlFor: "expiry-date", class: this.errors.expiryDate ? 'validation-error' : '' }, "Expiry Date ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "expiry-date", autocomplete: "cc-exp", placeholder: "MM/YY", value: this.expiryDate, onInput: (event) => this.handleExpiryDateChange(event), onKeyDown: (event) => this.handleExpiryDateKeyDown(event) }), this.errors.expiryDate && index.h("span", { class: "error" }, this.errors.expiryDate)), index.h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, index.h("label", { htmlFor: "cvv", class: this.errors.cvv ? 'validation-error' : '' }, "CVV ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "cvv", inputmode: "numeric" // Show numeric keyboard on mobile
            ,
            autocomplete: "one-time-code" //  Tell browser it's a one-time value
            ,
            "data-lpignore": "true" //  LastPass ignore
            ,
            "data-1p-ignore": "true" //  1Password ignore
            ,
            "data-bwignore": "true" //  Bitwarden ignore
            ,
            "data-form-type": "other", placeholder: "Enter CVV", value: this.cvv, onInput: (event) => this.handleInputChange('cvv', event.target.value) }), this.errors.cvv && index.h("span", { class: "error" }, this.errors.cvv))));
    }
    renderMobilePhoneNumber() {
        return (index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "MobilePhoneNumber", class: this.errors.mobilePhoneNumber ? 'validation-error' : '' }, ' ', "Mobile Phone Number (Optional)"), this.country === 'US' ? (index.h("div", { class: "field-stack single-field" }, index.h("div", { class: "input-wrapper" }, index.h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 14, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && index.h("span", { class: "error" }, this.errors.mobilePhoneNumber)))) : (index.h("div", { class: "field-stack dual-field" }, index.h("div", { class: "input-wrapper" }, index.h("div", { class: "dropdown-wrapper", ref: el => (this.dropdownWrapper = el) }, index.h("button", { type: "button", class: "dropdown-header", onClick: this.togglePhoneCodeDropdown, "aria-haspopup": "listbox", "aria-expanded": this.isPhoneCodeDropdownOpen }, "+", this.selectedPhoneCode || ' '), this.isPhoneCodeDropdownOpen && (index.h("ul", { class: "dropdown-list" }, CountryAndPhoneCodes.map(country => (index.h("li", { class: "dropdown-item" }, index.h("button", { type: "button", class: "dropdown-button", onClick: () => this.selectPhoneCode(country.PhoneCode) }, index.h("div", { class: "dropdown-content" }, index.h("span", null, country.Description?.toLowerCase()), index.h("span", null, "+", country.PhoneCode))))))))), this.errors.selectedPhoneCode && index.h("span", { class: "error" }, this.errors.selectedPhoneCode)), index.h("div", { class: "input-wrapper" }, index.h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 20, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && index.h("span", { class: "error" }, this.errors.mobilePhoneNumber))))));
    }
    render() {
        return (index.h("div", { key: '45856423df62069f2a04be2bc44882c18a260434', class: "add-new-payment" }, index.h("h3", { key: '278dfb34747c251c662a055db4844a89224542fe' }, "Add New Payment"), this.mfaPopUp && (index.h("mfa-model-popup", { key: '992e3b6958084b3bc45b764a9d26c7668c133eeb', operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, addRequestPayload: this.addCardRequestPayload, initialMfaResponse: this.mfaResponsePayload, requestType: "card", onClose: this.handleClosePopup, errorHandler: (messages) => this.handleMfaError(messages), onSuccessEvent: (event) => this.handleSuccess(event.detail) })), index.h("form", { key: '9a992c833fb7c02e89964e34c92989edc64b17d2', onSubmit: (event) => this.handleSubmit(event) }, this.renderErrorBanner(), this.renderCardFields(), index.h("h4", { key: 'b5055bfef8cccc30024700ff186ef8ee798f8a94' }, "Billing Address"), index.h("div", { key: 'eb42b8dc4543f9a804d1487344712cf65e6a26a0', class: "wallet-row" }, index.h("div", { key: 'a503321eb6d24747568830c75ab493b6e31e865e', class: "wallet-col-md-6" }, index.h("label", { key: '646c68c9c66ecfc4999ed2d7c4731f50ecb69104', htmlFor: "first-name", class: this.errors.firstName ? 'validation-error' : '' }, "First Name (Optional)"), index.h("input", { key: '8ff20c5ef162c6ba7a4110ab5739cd4b467b6728', type: "text", id: "first-name", autoComplete: "cc-given-name", placeholder: "Enter First Name", value: this.firstName, onInput: (event) => this.handleInputChange('firstName', event.target.value) }), this.errors.firstName && index.h("span", { key: '6dc552d98b359182e3ecb6cd38c51bb31ff034de', class: "error" }, this.errors.firstName)), index.h("div", { key: '370f4909552ac87cf713df6baee63da1ebf5ec7c', class: "wallet-col-md-6" }, index.h("label", { key: '2ad4c2be9b0a8ec309545c50e50f4639b2b89bf4', htmlFor: "last-name", class: this.errors.lastName ? 'validation-error' : '' }, "Last Name (Optional)"), index.h("input", { key: '98706f0479c2d1aa25ec04855fd667df5d2c3bd7', type: "text", id: "last-name", autoComplete: "cc-family-name", placeholder: "Enter Last Name", value: this.lastName, onInput: (event) => this.handleInputChange('lastName', event.target.value) }), this.errors.lastName && index.h("span", { key: '452db89592e031d9097c5c1b3b1b7046edfbb4c9', class: "error" }, this.errors.lastName)), index.h("div", { key: '7740ec71d33adbf4b21c8d6d3c6f0d6a25b79c76', class: "wallet-col-md-6" }, index.h("label", { key: '93b79d641a2c6976d34831c4cdad5c2e15f22c96', htmlFor: "Nick-name", class: this.errors.paymentAccountNickname ? 'validation-error' : '' }, "Payment Account Nickname (Optional)"), index.h("input", { key: 'ca0f3083d08e039e02f53ee3dd9f47aa1e614bf9', type: "text", id: "Nick-name", autoComplete: "nickname", placeholder: "Enter Payment Account Nickname", value: this.paymentAccountNickname, onInput: (event) => this.handleInputChange('paymentAccountNickname', event.target.value) }), this.errors.paymentAccountNickname && index.h("span", { key: '2ebd87416b9c451ace0f7caa53a21b30dd57bf16', class: "error" }, this.errors.paymentAccountNickname)), index.h("div", { key: '93837a4e5af651b852698cc68775c865d7eaf2c5', class: "wallet-col-md-6" }, index.h("label", { key: 'e574cf9905f1a00c373cc48783bb620e26b2528c', htmlFor: "address1", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 1 (Optional)"), index.h("input", { key: '829f66c64409d1d132b8b53c83abec394fa59fab', type: "text", id: "address1", autoComplete: "address-line1", placeholder: "Enter Address Line 1", value: this.address1, onInput: (event) => this.handleInputChange('address1', event.target.value) }), this.errors.address1 && index.h("span", { key: 'a4e675d3c0fe1a1576fde623d0411ad65e4b8ca6', class: "error" }, this.errors.address1)), index.h("div", { key: '5c8064edabafe2de2c033d7078259e29f4f49586', class: "wallet-col-md-6" }, index.h("label", { key: '24e23622e6e6d69e0bf467e9e8c910f39f6d5dad', htmlFor: "address2", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 2 (Optional)"), index.h("input", { key: '4283069394aae4dca9d90c6afaa3265d5e839d6c', type: "text", id: "address2", autoComplete: "address-line2", placeholder: "Apt, suite, unit, etc. (optional)", value: this.address2, onInput: (event) => this.handleInputChange('address2', event.target.value) }), this.errors.address2 && index.h("span", { key: 'e67c2d835723cfe50b73d07bfc54c619969acc42', class: "error" }, this.errors.address2)), index.h("div", { key: '0af525e4a45c33d540fbda36dc31d7ed6f390b15', class: "wallet-col-md-6" }, index.h("label", { key: '12464390252c5ef4c79e70e895c571b61cffce9b', htmlFor: "city", class: this.errors.city ? 'validation-error' : '' }, "City (Optional)"), index.h("input", { key: 'c16edf03234a81cf3c6ad5f8bf97f65e11a941fa', type: "text", id: "city", autoComplete: "address-level2", placeholder: "Enter City", value: this.city, onInput: (event) => this.handleInputChange('city', event.target.value) }), this.errors.city && index.h("span", { key: '51c355b8e0c89ce4e189d12ab0bb733607815f68', class: "error" }, this.errors.city)), index.h("div", { key: 'bf03159ac49382c3bc5483615d11cb672fe1a78a', class: "wallet-col-md-6" }, index.h("label", { key: 'f680be5ee2907071d665ea8a5f13861b91d8be97', htmlFor: "country", class: this.errors.country ? 'validation-error' : '' }, "Country (Optional)"), index.h("select", { key: '5a29e04c008b77064e4300c61e37c5a397440e2d', id: "country", autoComplete: "country", onInput: (event) => this.handleCountryChange(event) }, index.h("option", { key: 'b15318b1c76b2a472067f83fdd98215ddf3e5236', value: "" }, "Select Country"), COUNTRY.map(country => (index.h("option", { key: country.code, value: country.code, selected: this.country === country.code }, country.name)))), this.errors.country && index.h("span", { key: '71ecbb61d12fbeed9e4da071ba4a6c07bad7d63b', class: "error" }, this.errors.country)), (this.country === 'US' || this.country === 'CA') && (index.h("div", { key: 'a2b64af1d0b8e3295a48d5a11a04ef9502c17fd5', class: "wallet-col-md-6" }, index.h("label", { key: '1737cd118e05e136ccc491d69d7fd9db81061797', htmlFor: "state", class: this.errors.state ? 'validation-error' : '' }, "State/Province (Optional)"), index.h("select", { key: '188f1fb8eeb305620e2d61161b74fc8222383d74', id: "state", autoComplete: "address-level1", onInput: (event) => this.handleStateChange(event) }, index.h("option", { key: '8f43c176efbe2d39f053c2b1e09244fc9d056ee2', value: "" }, "Select ", this.country === 'US' ? 'State' : 'Province'), STATES(this.country).map(state => (index.h("option", { key: state.code, value: state.code, selected: this.state === state.code }, state.name)))), this.errors.state && index.h("span", { key: '6d6d1f8cfefd60e185e1e6e7f992ea7cf35fe3ad', class: "error" }, this.errors.state))), index.h("div", { key: '9364c5045d4907e46abc058fd0ae6a21dccf9304', class: "wallet-col-md-6" }, index.h("label", { key: '5d2a0096e7e02785b5e315c1f5562b1200da1ab9', htmlFor: "zip-code", class: this.errors.zipCode ? 'validation-error' : '' }, "Zip Code (Optional)"), index.h("input", { key: 'd61ef8195d9f3bde2dfa014457c6963fa8051bb4', type: "text", id: "zip-code", autocomplete: "postal-code", placeholder: "Enter ZIP Code", value: this.zipCode, onInput: (event) => this.handleInputChange('zipCode', event.target.value) }), this.errors.zipCode && index.h("span", { key: '7d8f62ea43c34a482f055dd21893ebe546b0b5db', class: "error" }, this.errors.zipCode)), index.h("div", { key: '77a48f618b532fa20a9a1b282409f1e4ba93ec91', class: "wallet-col-md-6" }, index.h("label", { key: 'fd95637c2faa59928b47c474f6e6552b64aa0ad8', htmlFor: "EmailAddress", class: this.errors.emailAddress ? 'validation-error' : '' }, "E-Mail Address (Optional)"), index.h("input", { key: '2dc742f5ad24a16da958ec28ce686615010c77da', type: "text", id: "emailAddress", placeholder: "Enter E-Mail Address", value: this.emailAddress, onInput: event => this.handleInputChange('emailAddress', event.target.value) }), this.errors.emailAddress && index.h("span", { key: '6d420c60818c48cc810706283fdfd3bd068527ae', class: "error" }, this.errors.emailAddress)), this.renderMobilePhoneNumber(), index.h("div", { key: '5443311f02b0f80d594567029e98bc815206c99c', class: "wallet-col-md-6" }, index.h("label", { key: 'f6a5c0efb2b5a309a4060e7e8cbcb0cde369310a', htmlFor: "Date-of-Birth", class: this.errors.dateofBirth ? 'validation-error' : '' }, "Date of Birth (Optional)"), index.h("date-picker", { key: 'cbefe99008d75fc5b5d9a474a069e8c6763fb5f5', value: this.dateofBirth, placeholder: "MM/DD/YYYY", inputId: "Date-of-Birth", minAge: 18, onDateChange: (e) => this.handleBirthDateChange(e.detail) }), this.errors.dateofBirth && index.h("span", { key: 'ea817704ed48f4ca5c5590d305e3c211d22e9de7', class: "error" }, this.errors.dateofBirth))), this.renderApiErrors(), index.h("div", { key: '55a4ed1ac98c92a1680cb31f81299eef23260db8', class: "wallet-col-12 footer" }, index.h("md-filled-button", { key: 'ab800fc8745f4230f55ee48acc7f291bb1c46c23', class: "button button-secondary", onClick: this.goToWallet }, "Cancel"), this.isLoading ? (index.h("md-filled-button", { class: "button button-primary", type: "button" }, "Adding Account", ' ', index.h("span", { class: "dot-flashing" }))) : (index.h("md-filled-button", { class: "button button-primary" }, "Add Account"))))));
    }
};
AddNewPayment.style = addnewpaymentModuleCss;

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === common.Environment.LOCALDEVELOPMENT || environment === common.Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function addBankAccount(operationsToken, userScopedAccessToken, requestBody, environment = common.Environment.PRODUCTION) {
    const apiConfig = common.getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.ADD_BANK_ACCOUNT}`;
    devLog(environment, 'Add Bank Account Request Details:', {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Masking the token for security
            'Authorization': `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            'X-SW-API-KEY': `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`,
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${operationsToken}`,
                'X-SW-API-KEY': userScopedAccessToken,
            },
            body: JSON.stringify(requestBody),
        });
        devLog(environment, 'Add Bank Account Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Add Bank Account Response Data:', responseData);
        // Check if the response JSON contains a status of 400
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, errors: parseErrorResponse(responseData, environment) };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'An error occurred while adding the bank account.' };
        }
        devLog(environment, 'Bank account added successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error adding bank account:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
function parseErrorResponse(errorResponse, environment) {
    let processedMessages = [];
    if (errorResponse.errors) {
        // Format 1: Extract errors from the "errors" object with field context
        for (const fieldKey in errorResponse.errors) {
            if (errorResponse.errors[fieldKey] && Array.isArray(errorResponse.errors[fieldKey])) {
                const fieldErrors = errorResponse.errors[fieldKey];
                for (const errorMessage of fieldErrors) {
                    // Check if this is a field-specific validation error
                    if (isFieldSpecificError(fieldKey)) {
                        // Show BFF message as-is for field-specific errors
                        devLog(environment, `Field-specific error (${fieldKey}): showing as-is:`, errorMessage);
                        processedMessages.push(errorMessage);
                    }
                    else {
                        // Use translator for non-field-specific errors
                        const translatedMessage = translateErrorWithContext(errorMessage, 'bank');
                        devLog(environment, `Non-field error: "${errorMessage}" → "${translatedMessage.userMessage}"`);
                        processedMessages.push(translatedMessage.userMessage);
                    }
                }
            }
        }
    }
    else if (errorResponse.detail) {
        // Format 2: Extract the "detail" field - treat as non-field-specific
        const translatedMessage = translateErrorWithContext(errorResponse.detail, 'bank');
        processedMessages = [translatedMessage.userMessage];
    }
    else {
        // Fallback: Return a generic error message
        processedMessages = ['An unknown error occurred. Please try again.'];
    }
    // Remove duplicate messages to avoid showing the same generic message multiple times
    const uniqueMessages = [...new Set(processedMessages)];
    devLog(environment, 'Final processed messages (duplicates removed):', uniqueMessages);
    return uniqueMessages;
}
// Helper function to determine if an error is field-specific
function isFieldSpecificError(fieldKey) {
    // Field-specific errors contain field names like:
    // "ExpirationYear", "BillingAddress.City", "CardNumber", etc.
    const fieldSpecificPatterns = [
        /^ExpirationYear$/i,
        /^ExpirationMonth$/i,
        /^CardNumber$/i,
        /^CardHolder$/i,
        /^BillingAddress\./i, // BillingAddress.City, BillingAddress.PostalCode, etc.
        /^PayorInformation\./i, // PayorInformation.FirstName, etc.
        /^WalletOwnerIdentifiers\./i,
        /^AccountNumber$/i,
        /^RoutingNumber$/i,
        /^BankAccountType$/i
    ];
    return fieldSpecificPatterns.some(pattern => pattern.test(fieldKey));
}

const addbankaccountModuleCss = "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'); .add-bank-account{margin-top:20px;padding:20px}.add-bank-account h3{margin-top:0;margin-bottom:20px;font-weight:700}.add-bank-account form{display:flex;flex-direction:column;gap:15px}.add-bank-account select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:white;border:1px solid #ccc;border-radius:4px;padding:8px 12px;font-size:14px;color:#333;cursor:pointer;background-image:url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>');background-repeat:no-repeat;background-position:right 8px center;background-size:12px;padding-right:30px}.add-bank-account select:focus{outline:none;border-color:#007bff;box-shadow:0 0 0 2px rgba(0, 123, 255, 0.25)}.add-bank-account select option{padding:8px;background-color:white;color:#333}.add-bank-account select option:hover{background-color:#f0f0f0}.add-bank-account form button:not(date-picker button){width:100%;padding:12px;background-color:#007bff;color:white;border:none;border-radius:4px;font-size:1.1rem;font-weight:500;cursor:pointer;transition:background-color 0.3s ease, transform 0.2s ease}.add-bank-account form button:not(date-picker button):hover{background-color:#0056b3;transform:translateY(-2px)}.add-bank-account form button:active{background-color:#004085;transform:translateY(0)}.add-bank-account form button:disabled{background-color:#94c3f0;cursor:not-allowed;transform:none;position:relative;overflow:hidden}.add-bank-account form button:disabled::after{content:'';position:absolute;width:20px;height:20px;top:50%;left:50%;margin:-10px 0 0 -10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;opacity:0;transition:opacity 0.3s ease}.add-bank-account form button:disabled[data-loading=\"true\"]{color:transparent}.add-bank-account form button:disabled[data-loading=\"true\"]::after{opacity:1}@keyframes spin{to{transform:rotate(360deg)}}.add-bank-account form button:disabled{background-color:#94c3f0;cursor:not-allowed;transform:none;position:relative;overflow:hidden}.add-bank-account form button:disabled::after{content:'';position:absolute;width:20px;height:20px;top:50%;left:50%;margin:-10px 0 0 -10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;opacity:0;transition:opacity 0.3s ease}.add-bank-account form button:disabled[data-loading=\"true\"]{color:transparent}.add-bank-account form button:disabled[data-loading=\"true\"]::after{opacity:1}@keyframes spin{to{transform:rotate(360deg)}}.add-bank-account form input::placeholder{color:#aaa;font-style:italic}.bank-account-type{display:flex;flex-direction:row;gap:20px;align-items:center;margin-bottom:0;height:38px}.bank-account-type label{display:flex;align-items:center;gap:5px;cursor:pointer}.bank-account-type input[type=\"radio\"]{width:auto;margin:0}.custom-radio{font-size:16px;font-weight:500}.dropdown-wrapper{position:relative;width:100%;margin-bottom:0px}.dropdown-wrapper button.dropdown-header{all:unset;display:block;width:90%;padding:8px;border:1px solid #e9eaeb;border-radius:12px;font-weight:500;font-size:14px;cursor:pointer;background-color:white;margin-bottom:0px;transition:border 0.2s ease}.dropdown-wrapper button.dropdown-header:focus{outline:none;border:1px solid #282829;background-color:transparent;transform:none}.dropdown-wrapper button.dropdown-header:hover{background-color:transparent;transform:none}.dropdown-list{position:absolute;width:100%;top:100%;left:0;z-index:10;background-color:white;border:1px solid #e9eaeb;border-radius:12px;opacity:1;transform:none;transform-origin:100px 0px;transition:opacity 263ms cubic-bezier(0.4, 0, 0.2, 1),\r\n              transform 175ms cubic-bezier(0.4, 0, 0.2, 1);max-height:150px;list-style-type:none;padding-left:0px;margin:0px;overflow-y:auto;scrollbar-width:none;scroll-behavior:smooth;min-width:250px}.dropdown-item{padding:8px 10px;font-size:14px !important;font-weight:400 !important;color:#282829 !important;cursor:pointer}.dropdown-item:hover{background-color:#e9eaeb}.dropdown-content{display:flex;justify-content:space-between;width:100%;margin-bottom:0px}.dropdown-wrapper button.dropdown-button{all:unset;width:100%;display:block;cursor:pointer}.dropdown-wrapper button.dropdown-button:hover{background-color:transparent;transform:none}.addressVerification-message-warning-info,.addressVerification-message-error-info{padding:0px 16px;border-radius:8px;box-shadow:0 1px 3px rgba(0, 0, 0, 0.05);margin:0px 0px 16px 0px;width:100%;display:flex;flex-direction:row;gap:2px;overflow:visible !important;max-height:none;align-items:flex-start;min-width:297px;min-height:103px}.addressVerification-message-warning-info{background-color:#E3F2FC;border-left:13px solid #0076CC}.addressVerification-message-error-info{background-color:#FFEBEE;border-left:13px solid #D01A1F}.addressVerification-message-notice-body{white-space:pre-wrap;word-break:break-word;margin-top:26px}.addressVerification-message-warning-content{white-space:pre-line;margin:0px;word-break:break-word;font-weight:400}.add-bank-account .addressVerification-close-btn{background:none;border:none;font-size:24px;font-weight:bold;color:#6B7280;cursor:pointer;margin-top:24px;width:auto;padding:0}.add-bank-account .addressVerification-close-btn:hover{color:#374151}.required-asterisk{color:red}date-picker button.date-picker-icon{width:auto !important;height:auto !important;padding:5px !important;background:none !important;border:none !important;color:#666 !important;font-size:14px !important;font-weight:normal !important;transform:none !important;transition:none !important;top:20%}date-picker button.date-picker-icon:hover{background:none !important;color:#333 !important;transform:none !important}date-picker button:not(.date-picker-icon){width:auto !important;background-color:white !important;color:#333 !important;font-size:14px !important;font-weight:normal !important;transform:none !important}date-picker button:not(.date-picker-icon):hover{background-color:#f5f5f5 !important;transform:none !important}date-picker .date-picker-day.selected,date-picker .year-picker-item.selected{background-color:#007bff !important;color:white !important}.add-bank-account date-picker .date-picker-wrapper{margin-bottom:0px !important}.error::before,.error::after{display:none !important}";

const AddBankAccount = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.goToPaymentSelector = index.createEvent(this, "goToPaymentSelector");
        this.addressValidation = index.createEvent(this, "addressValidation");
        this.bankAccountAdded = index.createEvent(this, "bankAccountAdded");
    }
    goToPaymentSelector;
    addressValidation;
    errorBannerRef = null;
    // Helper function to conditionally log only in development
    devLog = (message, ...args) => {
        if (this.environment === common.Environment.LOCALDEVELOPMENT || this.environment === common.Environment.STAGING) {
            console.log(message, ...args);
        }
    };
    formattedMobileNumber;
    operationsToken;
    userScopedAccessToken;
    environment = common.Environment.PRODUCTION; // Environment parameter with production default
    bankAccountAdded;
    accountHolderName = '';
    accountNumber = '';
    routingNumber = '';
    bankAccountType = common.BankAccountType.Checking;
    dateofBirth = '';
    paymentAccountNickname = '';
    firstName = '';
    lastName = '';
    address1 = '';
    address2 = '';
    city = '';
    state = '';
    country = '';
    zipCode = '';
    mobilePhoneNumber = '';
    selectedPhoneCode = '';
    isPhoneCodeDropdownOpen = false;
    emailAddress = '';
    apiErrors = {};
    isLoading = false;
    mfaPopUp = false;
    PaymentAccountRequestPayload;
    mfaResponsePayload;
    brokenRules = [];
    isAddressSuggestion = false;
    isVerifying = false;
    errors = {
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        bankAccountType: '',
        firstName: '',
        lastName: '',
        address1: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        address2: '',
        dateofBirth: '',
        paymentAccountNickname: '',
        mobilePhoneNumber: '',
        emailAddress: '',
        selectedPhoneCode: '',
    };
    isAddressResubmission = false;
    get el() { return index.getElement(this); }
    dropdownWrapper;
    componentWillLoad() {
        // Initialize event tracking
        initWalletEvents('AddBankAccount', this.environment);
    }
    handleInputChange(field, value) {
        this[field] = value;
        // Clear error when user starts typing
        if (this.errors[field]) {
            this.errors = { ...this.errors, [field]: '' };
        }
    }
    handleMobileNumberChange(event) {
        const input = event.target;
        let digits = '';
        if (this.country === 'US') {
            digits = input.value.replace(/\D/g, '').slice(0, 10);
        }
        else {
            digits = input.value.replace(/\D/g, '');
        }
        let formatted = '';
        if (this.country === 'US') {
            if (digits.length > 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            else if (digits.length > 3) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            }
            else if (digits.length > 0) {
                formatted = `(${digits}`;
            }
        }
        else {
            formatted = digits;
        }
        input.value = formatted;
        this.mobilePhoneNumber = formatted;
        if (this.errors[input.id]) {
            this.errors = { ...this.errors, [input.id]: '' };
        }
    }
    showErrorBanner(messages) {
        setTimeout(() => {
            if (messages?.length > 0 && this.errorBannerRef) {
                this.devLog("showErrorBanner");
                const top = this.errorBannerRef.offsetTop;
                this.scrollToView(top);
            }
        }, 300);
    }
    scrollToView(topValue) {
        window.scrollTo({
            top: topValue - 20,
            behavior: 'smooth',
        });
    }
    handleStateChange(event) {
        const target = event.target;
        const selectedState = STATES(this.country).find(state => state.code === target.value);
        if (selectedState) {
            this.state = selectedState.code;
            // Clear state error when valid state is selected
            this.errors = { ...this.errors, state: '' };
        }
        else {
            // Handle case when user goes back to "Select state/province" (empty value)
            this.state = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, state: '' };
        }
    }
    isCountryUS() {
        return this.country === 'US';
    }
    isCountryUSorCanada() {
        return this.country === 'US' || this.country === 'CA';
    }
    getProvinceOrStateCode() {
        // If country is US or Canada, use the state value from picklist
        // For all other countries, pass an empty value
        return (this.country === 'US' || this.country === 'CA') ? this.state : '';
    }
    getDefaultState() {
        // below LIne is commented as part of SonarQube improvements
        //return this.isCountryUSorCanada() ? '' : '';
        return '';
    }
    handleCountryChange(event) {
        const target = event.target;
        const selectedCountry = COUNTRY.find(country => country.code === target.value);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            // Clear country & phoneCode error (provided that for selected country phone code has to be there)when valid country is selected
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            // Reset state when country changes
            this.state = '';
            if (this.country === 'US') {
                this.mobilePhoneNumber = '';
                this.selectedPhoneCode = '';
            }
            if (this.country !== 'US') {
                const phoneCodeMap = new Map(CountryAndPhoneCodes.map(c => [c.Id, c.PhoneCode]));
                this.selectedPhoneCode = phoneCodeMap.get(this.country) || '';
                this.mobilePhoneNumber = '';
            }
        }
        else {
            // Handle case when user goes back to "Select country" (empty value)
            this.country = '';
            this.selectedPhoneCode = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            this.state = '';
        }
    }
    handlePhoneCodeChange(event) {
        const target = event.target;
        if (this.errors[target.id]) {
            this.errors = { ...this.errors, [target.id]: '' };
        }
        this.selectedPhoneCode = target.value;
    }
    handleBirthDateChange(value) {
        const numericValue = value.replace(/\D/g, "");
        // Format the date with slash after 2 digits
        let formattedValue = "";
        if (numericValue.length > 0) {
            formattedValue += numericValue.slice(0, 2);
            if (numericValue.length > 2) {
                formattedValue += "/" + numericValue.slice(2, 4);
                if (numericValue.length > 4) {
                    formattedValue += "/" + numericValue.slice(4, 8);
                }
            }
        }
        this.dateofBirth = formattedValue;
        // Clear error when user starts typing
        if (this.errors.dateofBirth) {
            this.errors = { ...this.errors, dateofBirth: '' };
        }
    }
    validateMobilePhoneNumber() {
        const errors = {};
        const phone = this.mobilePhoneNumber.trim();
        // Mobile Phone Number is now optional - only validate if provided
        if (phone.length === 0) {
            return errors; // No error if empty
        }
        let pattern;
        if (this.country === 'US') {
            pattern = /^\([1-9]\d{2}\)\s?\d{3}-\d{4}$/g;
        }
        else {
            pattern = /^\d*$/g;
        }
        if (!pattern.test(phone)) {
            errors.mobilePhoneNumber = 'Invalid Mobile Phone Number';
        }
        return errors;
    }
    validateEmailAddress() {
        const errors = {};
        // Email is now optional - only validate if provided
        if (!this.emailAddress.trim()) {
            return errors; // No error if empty
        }
        if (this.emailAddress.trim().length > 60) {
            errors.emailAddress = 'E-Mail Address must not exceed 60 characters.';
        }
        else {
            const re = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})$/;
            if (!re.test(this.emailAddress.trim())) {
                errors.emailAddress = 'Please enter a valid E-Mail Address.';
            }
        }
        return errors;
    }
    validateSelectedPhoneCode() {
        const errors = {};
        // Phone code is now optional - only validate if mobile phone number is provided
        // If user enters a phone number, they should also select the country code
        if (this.mobilePhoneNumber.trim().length > 0 && !this.isCountryUS() && !this.selectedPhoneCode.trim()) {
            errors.selectedPhoneCode = 'Country Code is required when phone number is provided';
        }
        return errors;
    }
    togglePhoneCodeDropdown = (event) => {
        event.stopPropagation();
        this.isPhoneCodeDropdownOpen = !this.isPhoneCodeDropdownOpen;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        if (this.isPhoneCodeDropdownOpen) {
            document.addEventListener('click', this.handleOutsideClick);
            document.addEventListener('keydown', this.handleEscapePress);
        }
        else {
            this.removeDropdownListeners();
        }
    };
    selectPhoneCode = (code) => {
        this.selectedPhoneCode = code;
        this.isPhoneCodeDropdownOpen = false;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        this.removeDropdownListeners();
    };
    handleOutsideClick = (event) => {
        if (this.dropdownWrapper && !this.dropdownWrapper.contains(event.target)) {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    handleEscapePress = (event) => {
        if (event.key === 'Escape') {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    removeDropdownListeners() {
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapePress);
    }
    ;
    handleClosePopup = () => {
        this.mfaPopUp = false;
    };
    handleMfaError(messages) {
        if (messages?.length > 0) {
            this.brokenRules = [messages[0]];
            this.showErrorBanner(messages);
        }
    }
    validateAccountFields() {
        const errors = {};
        if (!this.accountHolderName.trim()) {
            errors.accountHolderName = 'Account Holder Name is required.';
        }
        if (!this.accountNumber.trim()) {
            errors.accountNumber = 'Account Number is required.';
        }
        else if (!/^\d+$/.test(this.accountNumber)) {
            errors.accountNumber = 'Account Number must contain only numbers.';
        }
        if (!this.routingNumber.trim()) {
            errors.routingNumber = 'Routing Number is required.';
        }
        else if (!/^\d{9}$/.test(this.routingNumber)) {
            errors.routingNumber = 'Routing Number must be 9 digits.';
        }
        return errors;
    }
    validatePersonalFields() {
        const errors = {};
        // First Name and Last Name are now OPTIONAL for tokenization
        // Only Account Holder Name, Account Number, and Routing Number are required
        // if (!this.firstName.trim()) {
        //   errors.firstName = 'First Name is required.';
        // }
        // if (!this.lastName.trim()) {
        //   errors.lastName = 'Last Name is required.';
        // }
        // Payment Account Nickname is now optional
        // if (!this.paymentAccountNickname.trim()) {
        //   errors.paymentAccountNickname = 'Payment Account Nickname is required.';
        // }
        return errors;
    }
    validateDateOfBirth() {
        const errors = {};
        // Date of Birth is now optional - only validate if provided
        if (!this.dateofBirth.trim()) {
            return errors; // No error if empty
        }
        const re = /^(0[1-9]|1[012])[- /.](0[1-9]|[12]\d|3[01])[- /.](19|20)\d\d$/g;
        if (!re.test(this.dateofBirth)) {
            errors.dateofBirth = 'Please enter a valid date in MM/DD/YYYY format.';
            return errors;
        }
        const enteredDate = new Date(this.dateofBirth);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
        if (enteredDate > minAgeDate) {
            errors.dateofBirth = 'Must be at least 18 years of age.';
        }
        return errors;
    }
    validateAddressFields() {
        const errors = {};
        // ALL ADDRESS FIELDS ARE NOW OPTIONAL FOR TOKENIZATION
        // Only validate format if values are provided
        // Address Line 1 - optional, but validate PO Box if provided
        if (this.address1.trim().length > 0 && isValidPOBoxAddess(this.address1)) {
            errors.address1 = 'PO Boxes are not allowed. Please enter a valid Address Line 1.';
        }
        // Address Line 2 - optional, but validate PO Box if provided
        if (this.address2.trim().length > 0 && isValidPOBoxAddess(this.address2)) {
            errors.address2 = 'PO Boxes are not allowed. Please enter a valid Address Line 2.';
        }
        // City - now optional
        // if (!this.city.trim()) {
        //   errors.city = 'City is required.';
        // }
        // State - now optional
        // if (this.isCountryUSorCanada() && !this.state.trim()) {
        //   errors.state = 'State is required.';
        // }
        // Country - now optional
        // if (!this.country.trim()) {
        //   errors.country = 'Country is required.';
        // }
        // Zip Code - now optional
        // if (!this.zipCode.trim()) {
        //   errors.zipCode = 'ZIP/Postal Code is required.';
        // }
        return errors;
    }
    validate() {
        this.isLoading = true;
        const newErrors = {
            accountHolderName: '',
            accountNumber: '',
            routingNumber: '',
            bankAccountType: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
            ...this.validateAccountFields(),
            ...this.validatePersonalFields(),
            ...this.validateDateOfBirth(),
            ...this.validateAddressFields(),
            ...this.validateMobilePhoneNumber(),
            ...this.validateEmailAddress(),
            ...this.validateSelectedPhoneCode(),
        };
        this.errors = newErrors;
        const errorMessages = Object.values(newErrors).filter(error => error !== '');
        if (errorMessages.length > 0) {
            trackValidationError('bank', errorMessages);
        }
        this.scrollToFirstError();
        return !Object.values(newErrors).some(error => error !== '');
    }
    scrollToFirstError() {
        // Wait for the next frame to ensure the DOM has updated
        requestAnimationFrame(() => {
            // Search the entire document for error elements
            const errorElement = this.el.querySelector('.validation-error');
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    async handleSubmit(event) {
        event.preventDefault();
        this.apiErrors = {}; // Clear previous API errors
        this.brokenRules = [];
        this.isVerifying = true;
        this.isLoading = true;
        if (!this.validate()) {
            this.isLoading = false;
            this.isVerifying = false;
            return;
        }
        this.formattedMobileNumber = this.selectedPhoneCode
            ? '+' + this.selectedPhoneCode.trim() + this.mobilePhoneNumber.trim()
            : this.mobilePhoneNumber;
        try {
            const payload = {
                walletOwnerIdentifiers: {
                    customer: {
                        customerInformation: {
                            firstName: this.firstName,
                            lastName: this.lastName
                        }
                    }
                },
                accountReferenceId: `bank-${Date.now()}`,
                accountNumber: this.accountNumber,
                payorInformation: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    paymentAccountNickname: this.paymentAccountNickname,
                    validateAddress: !this.isAddressResubmission, // true for first submission, false for resubmission
                    dateofBirth: this.formatDateForAPI(this.dateofBirth), // Format as YYYY-MM-DD
                    contactInformation: {
                        emailAddress: this.emailAddress, // Add fallback for missing properties
                        phoneNumber: this.formattedMobileNumber,
                    },
                    identityVerificationInformation: null
                },
                billingAddress: {
                    addressLine1: this.address1,
                    addressLine2: this.address2 || '',
                    city: this.city,
                    provinceOrStateCode: this.getProvinceOrStateCode(),
                    countryCode: this.country || 'US',
                    postalCode: this.zipCode,
                },
                routingNumber: this.routingNumber,
                bankAccountType: this.bankAccountType,
            };
            this.PaymentAccountRequestPayload = payload;
            // Commit device data to Oscilar before making the API call
            oscilarService.commit();
            const response = await addBankAccount(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            if (response.success && response?.data?.paymentInstrument?.paymentInstrumentToken) {
                this.handleSuccess(response);
            }
            else if (response.success && response?.data?.AccountStatus) {
                if (response?.data?.AccountStatus === common.AccountStatus.AddressSuggested) {
                    this.isAddressSuggestion = true;
                }
                else {
                    this.isAddressSuggestion = false;
                }
                // Initialize brokenRules to empty array if not present
                this.brokenRules = response?.data?.BrokenRules || [];
                if (this.brokenRules.length > 0) {
                    this.devLog("response.success");
                    this.showErrorBanner(this.brokenRules);
                }
                const status = response?.data?.AccountStatus;
                switch (status) {
                    case common.AccountStatus.AddressSuggested:
                        this.handleAddressValidation(response);
                        break;
                    case common.AccountStatus.MFAPending:
                        this.mfaPopUp = true;
                        this.mfaResponsePayload = response;
                        break;
                    case common.AccountStatus.AddressValidationError:
                    case common.AccountStatus.AddressValidationUnknownStatus:
                        this.handleValidationError(response);
                        break;
                    case common.AccountStatus.Saved:
                        this.handleSuccess(response);
                        break;
                    default:
                        this.handleUnknownError(response);
                        break;
                }
            }
            else {
                this.handleResponseError(response);
            }
        }
        catch (error) {
            this.isLoading = false;
            // Track unexpected error
            trackAddBankError(error.message || 'Unexpected error occurred');
            // Handle unexpected errors
            console.error('Error in handleSubmit:', error);
            this.apiErrors = {
                General: [error.message || 'An unexpected error occurred. Please try again.']
            };
        }
        finally {
            this.isVerifying = false;
            this.isLoading = false;
        }
    }
    formatDateForAPI(dateString) {
        if (!dateString || dateString.trim() === '') {
            return '';
        }
        // Parse MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length !== 3) {
            return dateString; // Return original if not in expected format
        }
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        // Return in YYYY-MM-DD format
        return `${year}-${month}-${day}`;
    }
    handleSuccess(response) {
        trackAddBankSuccess({
            bankAccountType: this.bankAccountType,
            routingNumber: this.routingNumber.slice(-4), // Last 4 digits only
            accountNumber: this.accountNumber.slice(-4) // Last 4 digits only
        });
        // If no errors, emit the success event with the payment instrument token
        const paymentInstrumentToken = response.data.paymentInstrument?.paymentInstrumentToken;
        this.devLog('Emitting bank account payment instrument token:', paymentInstrumentToken);
        this.devLog('Full response:', response);
        this.bankAccountAdded.emit(paymentInstrumentToken);
        this.resetForm();
    }
    handleResponseError(response) {
        // Track bank account addition error
        const errorMessage = response.message || 'Bank Account addition failed';
        trackAddBankError(errorMessage);
        // Capture API errors and display them in the UI
        if (response.errors) {
            // Track API validation errors
            trackValidationError('bank', response.errors);
            this.apiErrors = response.errors.reduce((acc, error) => {
                acc.General = acc.General || [];
                acc.General.push(error);
                return acc;
            }, {});
        }
        else if (response.message) {
            // Track single API validation error
            trackValidationError('bank', [response.message]);
            this.apiErrors = { General: [response.message] };
        }
    }
    applySuggested(countryCode, stateCode) {
        const selectedCountry = COUNTRY.find(country => country.code === countryCode);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        else {
            this.country = '';
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        if (this.isCountryUSorCanada()) {
            const stateExists = STATES(this.country).some(s => s.code === stateCode);
            if (stateExists)
                this.state = stateCode;
        }
        this.devLog('Applied suggested address:', { countryCode, stateCode });
    }
    handleUnknownError(response) {
        // Set default message if no broken rules exist
        if (!response?.data?.BrokenRules?.length) {
            response.data = {
                ...response.data,
                BrokenRules: ['Payment Method addition failed']
            };
        }
        let errorMessage = response.data.BrokenRules[0];
        this.brokenRules = response.data.BrokenRules;
        this.showErrorBanner(this.brokenRules);
        trackAddBankError('Unknown Error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('Event emitted:', {
            message: errorMessage,
            UnKnown: common.AccountStatus[response?.data?.AccountStatus]
        });
    }
    handleAddressValidation(response) {
        this.address1 = response.data.SuggestedAddresses[0].AddressLine1;
        this.address2 = response.data.SuggestedAddresses[0].AddressLine2;
        this.city = response.data.SuggestedAddresses[0].City;
        this.zipCode = response.data.SuggestedAddresses[0].PostalCode;
        this.applySuggested(response.data.SuggestedAddresses[0].CountryCode, response.data.SuggestedAddresses[0].ProvinceOrStateCode);
        this.isAddressResubmission = true;
        const addressUpdatedMessage = response?.data?.BrokenRules?.[0] ||
            "Address updated. Please review and confirm the changes before submitting.";
        this.addressValidation.emit(addressUpdatedMessage);
        this.devLog('Address updated event emitted:', {
            message: addressUpdatedMessage,
            AddressValidation: common.AccountStatus[common.AccountStatus.AddressSuggested]
        });
    }
    handleValidationError(response) {
        let errorMessage = response?.data?.BrokenRules?.[0];
        if (response?.data?.AccountStatus === common.AccountStatus.AddressValidationError) {
            errorMessage = errorMessage || "Address provided could not be validated. Please update the provided address and resubmit.";
        }
        else if (response?.data?.AccountStatus === common.AccountStatus.AddressValidationUnknownStatus) {
            errorMessage = errorMessage || "Address could not be validated. Please update and resubmit.";
        }
        else {
            errorMessage = errorMessage || "Payment method addition failed.";
        }
        this.isAddressResubmission = true;
        trackAddBankError('Address validation error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('addressValidation event emitted:', {
            message: errorMessage,
            AddressValidation: common.AccountStatus[response?.data?.AccountStatus]
        });
    }
    resetForm() {
        this.accountHolderName = '';
        this.accountNumber = '';
        this.routingNumber = '';
        this.bankAccountType = common.BankAccountType.Checking;
        this.firstName = '';
        this.lastName = '';
        this.address1 = '';
        this.address2 = '';
        this.city = '';
        this.state = '';
        this.country = 'US';
        this.zipCode = '';
        this.address2 = '';
        this.dateofBirth = '';
        this.paymentAccountNickname = '';
        this.mobilePhoneNumber = '';
        this.emailAddress = '';
        this.selectedPhoneCode = '';
        this.errors = {
            accountHolderName: '',
            accountNumber: '',
            routingNumber: '',
            bankAccountType: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
        };
    }
    goToWallet = () => {
        // Track bank account addition cancellation
        trackAddBankCancelled();
        this.goToPaymentSelector.emit(true);
    };
    handleCloseBanner = () => {
        this.brokenRules = [];
    };
    renderErrorBanner() {
        if (!this.brokenRules.length)
            return null;
        return (index.h("div", { ref: el => this.errorBannerRef = el, class: `${this.isAddressSuggestion ? 'addressVerification-message-warning-info' : 'addressVerification-message-error-info'}` }, index.h("div", { class: "addressVerification-message-notice-body" }, index.h("div", { class: "addressVerification-message-warning-content" }, this.brokenRules[0])), index.h("button", { class: "addressVerification-close-btn", type: "button", "aria-label": "Close", onClick: this.handleCloseBanner }, "\u00D7")));
    }
    renderAccountFields() {
        return (index.h("div", { class: "wallet-row" }, index.h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, index.h("label", { htmlFor: "account-holder-name", class: this.errors.accountHolderName ? 'validation-error' : '' }, "Account Holder Name ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "account-holder-name", autoComplete: "cc-given-name", placeholder: "Enter Account Holder Name", value: this.accountHolderName, onInput: (event) => this.handleInputChange('accountHolderName', event.target.value) }), this.errors.accountHolderName && index.h("span", { class: "error" }, this.errors.accountHolderName)), index.h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, index.h("label", { htmlFor: "account-number", class: this.errors.accountNumber ? 'validation-error' : '' }, "Account Number ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "account-number", placeholder: "Enter Account Number", value: this.accountNumber, onInput: (event) => this.handleInputChange('accountNumber', event.target.value) }), this.errors.accountNumber && index.h("span", { class: "error" }, this.errors.accountNumber)), index.h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, index.h("label", { htmlFor: "routing-number", class: this.errors.routingNumber ? 'validation-error' : '' }, "Routing Number ", index.h("span", { class: "required-asterisk" }, "*")), index.h("input", { type: "text", id: "routing-number", placeholder: "Enter Routing Number", value: this.routingNumber, onInput: (event) => this.handleInputChange('routingNumber', event.target.value) }), this.errors.routingNumber && index.h("span", { class: "error" }, this.errors.routingNumber)), index.h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, index.h("label", { htmlFor: "account-type", class: this.errors.bankAccountType ? 'validation-error' : '' }, "Account Type "), index.h("div", { class: "bank-account-type", role: "radiogroup", "aria-labelledby": "account-type" }, index.h("label", { class: "custom-radio" }, index.h("input", { type: "radio", name: "account-type", checked: this.bankAccountType === common.BankAccountType.Checking, onChange: () => this.handleInputChange('bankAccountType', common.BankAccountType.Checking) }), ' ', "Checking"), index.h("label", { class: "custom-radio" }, index.h("input", { type: "radio", name: "account-type", checked: this.bankAccountType === common.BankAccountType.Savings, onChange: () => this.handleInputChange('bankAccountType', common.BankAccountType.Savings) }), ' ', "Savings")), this.errors.bankAccountType && index.h("span", { class: "error" }, this.errors.bankAccountType))));
    }
    renderPersonalInfo() {
        return (index.h("div", { class: "wallet-row" }, index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "first-name", class: this.errors.firstName ? 'validation-error' : '' }, "First Name (Optional)"), index.h("input", { type: "text", id: "first-name", autoComplete: "cc-given-name", placeholder: "Enter First Name", value: this.firstName, onInput: (event) => this.handleInputChange('firstName', event.target.value) }), this.errors.firstName && index.h("span", { class: "error" }, this.errors.firstName)), index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "last-name", class: this.errors.lastName ? 'validation-error' : '' }, "Last Name (Optional)"), index.h("input", { type: "text", id: "last-name", autoComplete: "cc-family-name", placeholder: "Enter Last Name", value: this.lastName, onInput: (event) => this.handleInputChange('lastName', event.target.value) }), this.errors.lastName && index.h("span", { class: "error" }, this.errors.lastName)), index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "Nick-name", class: this.errors.paymentAccountNickname ? 'validation-error' : '' }, "Payment Account Nickname (Optional)"), index.h("input", { type: "text", id: "Nick-name", placeholder: "Enter Payment Account Nickname", value: this.paymentAccountNickname, onInput: (event) => this.handleInputChange('paymentAccountNickname', event.target.value) }), this.errors.paymentAccountNickname && index.h("span", { class: "error" }, this.errors.paymentAccountNickname))));
    }
    renderAddressSection() {
        return (index.h(index.h.Fragment, null, index.h("div", { class: "wallet-row" }, index.h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, index.h("label", { htmlFor: "address1", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 1 (Optional)"), index.h("input", { type: "text", id: "address1", autoComplete: "address-line1", placeholder: "Enter Address Line 1", value: this.address1, onInput: (event) => this.handleInputChange('address1', event.target.value) }), this.errors.address1 && index.h("span", { class: "error" }, this.errors.address1)), index.h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, index.h("label", { htmlFor: "address2" }, "Address Line 2 (Optional)"), index.h("input", { type: "text", id: "address2", autoComplete: "address-line2", placeholder: "Apt, suite, unit, etc. (optional)", value: this.address2, onInput: (event) => this.handleInputChange('address2', event.target.value) }), this.errors.address2 && index.h("span", { class: "error" }, this.errors.address2)), index.h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, index.h("label", { htmlFor: "city", class: this.errors.city ? 'validation-error' : '' }, "City (Optional)"), index.h("input", { type: "text", id: "city", autoComplete: "address-level2", placeholder: "Enter City", value: this.city, onInput: (event) => this.handleInputChange('city', event.target.value) }), this.errors.city && index.h("span", { class: "error" }, this.errors.city))), index.h("div", { class: "wallet-row" }, index.h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, index.h("label", { htmlFor: "country", class: this.errors.country ? 'validation-error' : '' }, "Country (Optional)"), index.h("select", { id: "country", autoComplete: "country", onInput: (event) => this.handleCountryChange(event) }, index.h("option", { value: "" }, "Select Country"), COUNTRY.map(country => (index.h("option", { key: country.code, value: country.code }, country.name)))), this.errors.country && index.h("span", { class: "error" }, this.errors.country)), (this.country === 'US' || this.country === 'CA') && (index.h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, index.h("label", { htmlFor: "state", class: this.errors.state ? 'validation-error' : '' }, "State/Province (Optional)"), index.h("select", { id: "state", autoComplete: "address-level1", onInput: (event) => this.handleStateChange(event) }, index.h("option", { value: "" }, "Select ", this.country === 'US' ? 'State' : 'Province'), STATES(this.country).map(state => (index.h("option", { key: state.code, value: state.code }, state.name)))), this.errors.state && index.h("span", { class: "error" }, this.errors.state))), index.h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, index.h("label", { htmlFor: "zip-code", class: this.errors.zipCode ? 'validation-error' : '' }, "ZIP/Postal Code (Optional)"), index.h("input", { type: "text", id: "zip-code", autoComplete: "postal-code", placeholder: "Enter ZIP/Postal Code", value: this.zipCode, onInput: (event) => this.handleInputChange('zipCode', event.target.value) }), this.errors.zipCode && index.h("span", { class: "error" }, this.errors.zipCode)), index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "emailAddress", class: this.errors.emailAddress ? 'validation-error' : '' }, "E-Mail Address (Optional)"), index.h("input", { type: "text", id: "emailAddress", placeholder: "Enter E-Mail Address", value: this.emailAddress, onInput: event => this.handleInputChange('emailAddress', event.target.value) }), this.errors.emailAddress && index.h("span", { class: "error" }, this.errors.emailAddress)), index.h("div", { class: "wallet-col-md-6" }, index.h("label", { htmlFor: "mobilePhoneNumber", class: this.errors.mobilePhoneNumber ? 'validation-error' : '' }, "Mobile Phone Number (Optional)"), this.country === 'US' ? (index.h("div", { class: "field-stack single-field" }, index.h("div", { class: "input-wrapper" }, index.h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 14, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && index.h("span", { class: "error" }, this.errors.mobilePhoneNumber)))) : (index.h("div", { class: "field-stack dual-field" }, index.h("div", { class: "input-wrapper" }, index.h("div", { class: "dropdown-wrapper", ref: el => (this.dropdownWrapper = el) }, index.h("button", { type: "button", class: "dropdown-header", onClick: this.togglePhoneCodeDropdown, "aria-haspopup": "listbox", "aria-expanded": this.isPhoneCodeDropdownOpen }, "+", this.selectedPhoneCode || ' '), this.isPhoneCodeDropdownOpen && (index.h("ul", { class: "dropdown-list" }, CountryAndPhoneCodes.map(country => (index.h("li", { class: "dropdown-item" }, index.h("button", { type: "button", class: "dropdown-button", onClick: () => this.selectPhoneCode(country.PhoneCode) }, index.h("div", { class: "dropdown-content" }, index.h("span", null, country.Description?.toLowerCase()), index.h("span", null, "+", country.PhoneCode))))))))), this.errors.selectedPhoneCode && index.h("span", { class: "error" }, this.errors.selectedPhoneCode)), index.h("div", { class: "input-wrapper" }, index.h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 20, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && index.h("span", { class: "error" }, this.errors.mobilePhoneNumber))))), index.h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, index.h("label", { htmlFor: "Date-of-Birth", class: this.errors.dateofBirth ? 'validation-error' : '' }, "Date of Birth (Optional)"), index.h("date-picker", { id: "Date-of-Birth", placeholder: "MM/DD/YYYY", minAge: 18, value: this.dateofBirth, onDateChange: (e) => this.handleBirthDateChange(e.detail) }), this.errors.dateofBirth && index.h("span", { class: "error" }, this.errors.dateofBirth)))));
    }
    renderApiErrors() {
        if (!Object.keys(this.apiErrors).length)
            return null;
        return (index.h("div", { class: "api-errors" }, index.h("div", { class: "error-content" }, index.h("h5", null, "Error Message:"), index.h("ul", null, Object.entries(this.apiErrors).map(([field, messages]) => messages.map((msg, idx) => (index.h("li", { key: `${field}-${idx}` }, index.h("strong", null, field === 'General' ? '' : `${field}: `), msg))))))));
    }
    renderFormActions() {
        return (index.h("div", { class: "wallet-col-12 footer" }, index.h("md-filled-button", { class: "button button-secondary", onClick: this.goToWallet }, "Cancel"), this.isLoading ? (index.h("md-filled-button", { class: "button button-primary", type: "button" }, index.h("span", null, "Adding Account\u00A0", index.h("span", { class: "dot-flashing" })))) : (index.h("md-filled-button", { class: "button button-primary", disabled: this.isVerifying, "data-loading": this.isVerifying ? 'true' : 'false' }, this.isVerifying ? 'Verifying...' : 'Add Account'))));
    }
    render() {
        return (index.h("div", { key: '7652ac164fcae44a2fd1cade8b895a6685985515', class: "add-bank-account" }, index.h("h3", { key: 'ff0ee5fe3a1b5ff295d27b181a7ace53453026f1' }, "Add Bank Account"), this.mfaPopUp && (index.h("mfa-model-popup", { key: 'd4af72be33e799397149879cc24d96af298d27ba', operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, addRequestPayload: this.PaymentAccountRequestPayload, requestType: "bank", initialMfaResponse: this.mfaResponsePayload, onClose: this.handleClosePopup, errorHandler: (messages) => this.handleMfaError(messages), onSuccessEvent: (event) => this.handleSuccess(event.detail) })), index.h("form", { key: 'e9e6f10357fd5ef8efe5229c2d602e109bb7b503', onSubmit: (event) => this.handleSubmit(event) }, this.renderErrorBanner(), this.renderAccountFields(), index.h("h4", { key: '756ca741f3568befa82aeffbd16272bc9c07152d' }, "Account Holder Information"), this.renderPersonalInfo(), index.h("h4", { key: '421d78781ff781d312aca709a1b22a431e9ab791' }, "Billing Address"), this.renderAddressSection(), this.renderApiErrors(), this.renderFormActions())));
    }
};
AddBankAccount.style = addbankaccountModuleCss;

exports.AddBankAccount = AddBankAccount;
exports.AddNewPayment = AddNewPayment;
exports.initWalletEvents = initWalletEvents;
exports.oscilarService = oscilarService;
exports.trackAddBankStarted = trackAddBankStarted;
exports.trackAddPaymentStarted = trackAddPaymentStarted;
exports.trackApiCall = trackApiCall;
exports.trackPaymentSelection = trackPaymentSelection;
//# sourceMappingURL=add-bank-account.add-new-payment-CGTTBy78.js.map

//# sourceMappingURL=add-bank-account.add-new-payment-CGTTBy78.js.map