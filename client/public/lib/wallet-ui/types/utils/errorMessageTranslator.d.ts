/**
 * Error Message Translator for Wallet UI Components
 * Converts technical API error messages to user-friendly ones
 */
/**
 * Translates a technical API error message to a user-friendly message
 * @param technicalMessage - The technical error message from the API
 * @returns User-friendly error message
 */
export declare function translateErrorMessage(technicalMessage: string): string;
/**
 * Translates multiple error messages
 * @param technicalMessages - Array of technical error messages
 * @returns Array of user-friendly error messages
 */
export declare function translateErrorMessages(technicalMessages: string[]): string[];
/**
 * Gets the error category for analytics/logging purposes
 * @param technicalMessage - The technical error message
 * @returns Error category
 */
export declare function getErrorCategory(technicalMessage: string): string;
/**
 * Enhanced error translation with additional context
 * @param technicalMessage - The technical error message
 * @param context - Additional context (e.g., 'card', 'bank', 'general')
 * @returns Enhanced user-friendly error message
 */
export declare function translateErrorWithContext(technicalMessage: string, context?: 'card' | 'bank' | 'general'): {
    userMessage: string;
    category: string;
    originalMessage: string;
};
