import { getApiConfig, Environment } from "../config";
// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
export async function fetchPaymentOptions(operationsToken, userScopedAccessToken, paymentType = 'all', environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.FETCH_PAYMENT_OPTIONS}`; // Construct the full URL
    try {
        const response = await fetch(url, {
            method: 'GET', // Use GET for wallet endpoint
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${operationsToken}`, // Operations token
                'X-SW-API-KEY': userScopedAccessToken, // User scoped access token
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch payment options: ${response.statusText}`);
        }
        const data = await response.json();
        devLog(environment, 'Fetched payment options:', data); // Debugging log
        const availableCreditCards = data.availableCreditCards ?? null;
        // Process the payment instruments to extract the required data with sorting
        const paymentOptions = data.paymentInstruments
            // Filter by payment type if specified
            .filter((instrument) => {
            if (paymentType === 'all') {
                return true;
            }
            else if (paymentType === 'card') {
                return instrument.paymentInstrumentType === 'Card';
            }
            return true;
        })
            .map((instrument) => {
            if (instrument.paymentInstrumentType === 'BankAccount') {
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${instrument.bankAccountType}: ${instrument.maskedAccountNumber}`,
                    type: `BankAccount-${instrument.bankAccountType}`,
                    sortOrder: 4 // Bank accounts come after cards
                };
            }
            else if (instrument.paymentInstrumentType === 'Card') {
                const cardType = instrument.cardProduct || 'Card';
                devLog(environment, '🔍 Raw card type from API:', cardType);
                // Normalize card type for consistent icon mapping
                let normalizedCardType = cardType.toLowerCase().trim().replace(/\s+/g, '');
                devLog(environment, '🔍 After initial normalization:', normalizedCardType);
                // Map common variations to standard names
                if (normalizedCardType.includes('visa')) {
                    normalizedCardType = 'visa';
                    devLog(environment, '✅ Matched as Visa');
                }
                else if (normalizedCardType.includes('master')) {
                    normalizedCardType = 'mastercard';
                    devLog(environment, '✅ Matched as Mastercard');
                }
                else if (normalizedCardType.includes('amex') || normalizedCardType.includes('americanexpress')) {
                    normalizedCardType = 'americanexpress';
                    devLog(environment, '✅ Matched as American Express');
                }
                else if (normalizedCardType.includes('discover')) {
                    normalizedCardType = 'discover';
                    devLog(environment, '✅ Matched as Discover');
                }
                else {
                    devLog(environment, '⚠️ No match found for card type, keeping as:', normalizedCardType);
                }
                devLog(environment, '🎯 Final normalized card type:', normalizedCardType);
                // Define sort order based on normalized card type
                let sortOrder = 5; // Default for other/unknown card types (will come after bank accounts)
                if (normalizedCardType === 'visa') {
                    sortOrder = 0; // Visa first
                }
                else if (normalizedCardType === 'mastercard') {
                    sortOrder = 1; // Mastercard second
                }
                else if (normalizedCardType === 'discover') {
                    sortOrder = 2; // Discover third
                }
                else if (normalizedCardType === 'americanexpress') {
                    sortOrder = 3; // American Express fourth
                }
                // Create user-friendly display names to prevent UI issues with long card names
                let displayCardName = instrument.cardProduct;
                if (normalizedCardType === 'americanexpress') {
                    displayCardName = 'Amex';
                }
                else if (normalizedCardType === 'mastercard') {
                    displayCardName = 'Master';
                }
                else if (normalizedCardType === 'visa') {
                    displayCardName = 'Visa';
                }
                else if (normalizedCardType === 'discover') {
                    displayCardName = 'Discover';
                }
                const finalType = `Card-${normalizedCardType}`;
                devLog(environment, 'Final card type for icon mapping:', finalType);
                devLog(environment, 'Display card name:', displayCardName);
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${displayCardName}: ${instrument.maskedNumber}`,
                    type: finalType,
                    sortOrder
                };
            }
            else {
                // Handle other payment instrument types
                return {
                    value: instrument.paymentInstrumentToken,
                    text: `${instrument.paymentInstrumentType}: ${instrument.paymentInstrumentToken}`,
                    type: instrument.paymentInstrumentType,
                    sortOrder: 6 // Other types come last
                };
            }
        })
            .filter((option) => option !== null)
            // Sort by sortOrder first, then by text for items with same sort order
            .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            return a.text.localeCompare(b.text);
        })
            // Remove the sortOrder property from the final objects
            .map(({ sortOrder, ...rest }) => rest);
        return { paymentOptions, availableCreditCards };
    }
    catch (error) {
        console.error('Error fetching payment options:', error);
        return { paymentOptions: [], availableCreditCards: null };
    }
}
//# sourceMappingURL=apiService.js.map
