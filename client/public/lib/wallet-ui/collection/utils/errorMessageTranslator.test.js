/**
 * Test examples for Error Message Translator
 * This file demonstrates how the error translation works
 */
import { translateErrorMessage, translateErrorWithContext } from "./errorMessageTranslator";
// Example API error responses that you might receive
const exampleApiErrors = [
    {
        technical: "The tokenization request was rejected because the same payment instrument details already existed in the system. Please use the Update Card Payment Instrument method to update your payment details.",
        expected: "This card is already saved to your wallet. Please use a different card or update your existing card information."
    },
    {
        technical: "Invalid card number provided",
        expected: "The card number you entered is not valid. Please check and try again."
    },
    {
        technical: "Card has expired",
        expected: "This card has expired. Please use a different card."
    },
    {
        technical: "Invalid routing number format",
        expected: "Please enter a valid routing number."
    },
    {
        technical: "Network connection timeout occurred",
        expected: "The request timed out. Please try again."
    }
];
// Test function to demonstrate translations
export function testErrorTranslations() {
    console.log('🧪 Testing Error Message Translations\n');
    exampleApiErrors.forEach((example, index) => {
        const translated = translateErrorMessage(example.technical);
        console.log(`Test ${index + 1}:`);
        console.log(`Technical: "${example.technical}"`);
        console.log(`Translated: "${translated}"`);
        console.log(`Expected: "${example.expected}"`);
        console.log(`✅ Match: ${translated === example.expected ? 'Yes' : 'No'}\n`);
    });
}
// Test with context
export function testErrorTranslationsWithContext() {
    console.log('🧪 Testing Error Message Translations with Context\n');
    const duplicateCardError = "The tokenization request was rejected because the same payment instrument details already existed in the system.";
    const cardContext = translateErrorWithContext(duplicateCardError, 'card');
    const bankContext = translateErrorWithContext(duplicateCardError, 'bank');
    const generalContext = translateErrorWithContext(duplicateCardError, 'general');
    console.log('Duplicate Error with Different Contexts:');
    console.log(`Card Context: "${cardContext.userMessage}"`);
    console.log(`Bank Context: "${bankContext.userMessage}"`);
    console.log(`General Context: "${generalContext.userMessage}"`);
    console.log(`Category: ${cardContext.category}\n`);
}
// Uncomment to run tests in browser console:
// testErrorTranslations();
// testErrorTranslationsWithContext();
//# sourceMappingURL=errorMessageTranslator.test.js.map
