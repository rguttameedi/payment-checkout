import { Environment, getApiConfig } from "../config";
// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
export async function getMfaStatus(operationsToken, userScopedAccessToken, mfainquiryId, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.GET_MFA_STATUS}?mfaInquiryId=${encodeURIComponent(mfainquiryId)}`;
    devLog(environment, 'Get MFA Status Request Details:', {
        url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            'X-SW-API-KEY': `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`,
        },
    });
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${operationsToken}`,
                'X-SW-API-KEY': userScopedAccessToken,
            },
        });
        devLog(environment, 'Get MFA Status Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Get MFA Status Response Data:', responseData);
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, message: "We couldn't process your request at the moment. Please try again later or use a different payment method." };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'We are unable to retrieve your MFA status at the moment. Please try again later' };
        }
        devLog(environment, 'MFA status fetched successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error fetching MFA status:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'Unexpected error. Please refresh or try again later.' };
    }
}
export async function resendMfaLink(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.RESEND_MFA_LINK}`;
    devLog(environment, 'Resend MFA Link Request Details:', {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
        devLog(environment, 'Resend MFA Link Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Resend MFA Link Response Data:', responseData);
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, message: "Unable to resend MFA link at the moment. Please try again later" };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'Failed to resend MFA link. Please refresh and try again' };
        }
        devLog(environment, 'The MFA link has been resent successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error resending MFA link:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'Unexpected error occurred while resending MFA link. Please try again later.' };
    }
}
export async function saveCardOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.SAVE_CARD_ON_MFA_SUCCESS}`;
    devLog(environment, "Save Card On MFA Success Request Details:", {
        url,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            "X-SW-API-KEY": `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${operationsToken}`,
                "X-SW-API-KEY": userScopedAccessToken
            },
            body: JSON.stringify(requestBody)
        });
        devLog(environment, "Save Card On MFA Success Response Status:", response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, "Save Card On MFA Success Response Data:", responseData);
        if (responseData.status === 400) {
            devLog(environment, "Validation Error Response:", responseData);
            return {
                success: false,
                message: "We couldn't save your card details at the moment. Please try again later."
            };
        }
        if (!response.ok) {
            console.error("API Error Response:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: "Failed to save card details. Please refresh and try again." };
        }
        devLog(environment, 'Save Card on MFA success executed successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error("Error saving card on MFA success:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: "Unexpected error occurred while saving card details. Please try again later." };
    }
}
export async function saveBankOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.SAVE_BANK_ON_MFA_SUCCESS}`;
    devLog(environment, "Save Bank On MFA Success Request Details:", {
        url,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            "X-SW-API-KEY": `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${operationsToken}`,
                "X-SW-API-KEY": userScopedAccessToken
            },
            body: JSON.stringify(requestBody)
        });
        devLog(environment, "Save Bank On MFA Success Response Status:", response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, "Save Bank On MFA Success Response Data:", responseData);
        if (responseData.status === 400) {
            devLog(environment, "Validation Error Response:", responseData);
            return {
                success: false,
                message: "We couldn't save your bank details at the moment. Please try again later."
            };
        }
        if (!response.ok) {
            console.error("API Error Response:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: "Failed to save bank details. Please refresh and try again." };
        }
        devLog(environment, 'Save Bank on MFA success executed successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error("Error saving bank on MFA success:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: "Unexpected error occurred while saving bank details. Please try again later." };
    }
}
//# sourceMappingURL=mfaService.js.map
