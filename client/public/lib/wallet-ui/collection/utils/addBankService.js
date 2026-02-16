import { getApiConfig, Environment } from "../config";
import { translateErrorWithContext } from "./errorMessageTranslator";
// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
export async function addBankAccount(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
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
//# sourceMappingURL=addBankService.js.map
