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
export function translateErrorMessage(technicalMessage) {
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
 * Translates multiple error messages
 * @param technicalMessages - Array of technical error messages
 * @returns Array of user-friendly error messages
 */
export function translateErrorMessages(technicalMessages) {
    if (!Array.isArray(technicalMessages)) {
        return [translateErrorMessage(String(technicalMessages))];
    }
    return technicalMessages.map(message => translateErrorMessage(message));
}
/**
 * Gets the error category for analytics/logging purposes
 * @param technicalMessage - The technical error message
 * @returns Error category
 */
export function getErrorCategory(technicalMessage) {
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
export function translateErrorWithContext(technicalMessage, context = 'general') {
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
//# sourceMappingURL=errorMessageTranslator.js.map
