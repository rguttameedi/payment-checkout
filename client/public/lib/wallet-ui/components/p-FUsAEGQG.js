import { p as proxyCustomElement, H, c as createEvent, h } from './index.js';

// Environment configuration
var Environment;
(function (Environment) {
    Environment["PRODUCTION"] = "production";
    Environment["STAGING"] = "staging";
    Environment["LOCALDEVELOPMENT"] = "localdevelopment";
})(Environment || (Environment = {}));
// Default configuration https://localhost:50155/
const DEFAULT_ENV = Environment.PRODUCTION;
const BFF_URLS = {
    localdevelopment: "http://localhost:50155",
    staging: "https://internalapi-sat.realpage.com/payments/sharedwallet-bff",
    production: "https://internalapi.realpage.com/payments/sharedwallet-bff"
};
const DEFAULT_URLS = {
    production: BFF_URLS.production,
    staging: BFF_URLS.staging,
    localdevelopment: BFF_URLS.localdevelopment,
};
// Get environment from window object (set in index.html) or use default
const getEnvVar = (key, defaultValue) => {
    // @ts-ignore - window.env is set in index.html
    const env = typeof window !== 'undefined' ? window.env : {};
    return env?.[key] ?? defaultValue;
};
// Get current environment (can be overridden by component parameter)
const ENV = getEnvVar('REACT_APP_ENV', DEFAULT_ENV) || DEFAULT_ENV;
// API configuration
const API_BASE_URLS = {
    [Environment.PRODUCTION]: getEnvVar('REACT_APP_API_URL_PRODUCTION', DEFAULT_URLS.production),
    [Environment.STAGING]: getEnvVar('REACT_APP_API_URL_STAGING', DEFAULT_URLS.staging),
    [Environment.LOCALDEVELOPMENT]: getEnvVar('REACT_APP_API_URL_LOCALDEVELOPMENT', DEFAULT_URLS.localdevelopment),
};
// Function to get API config for specific environment
const getApiConfig = (environment = DEFAULT_ENV) => ({
    BASE_URL: API_BASE_URLS[environment],
    RELATIVE_URLS: {
        ADD_CARD: '/api/SharedWallet/card',
        ADD_BANK_ACCOUNT: '/api/SharedWallet/bankaccount',
        FETCH_PAYMENT_OPTIONS: '/api/SharedWallet/wallet',
        GET_MFA_STATUS: '/api/SharedWallet/MfaStatus',
        RESEND_MFA_LINK: '/api/SharedWallet/ValidateMFA',
        SAVE_CARD_ON_MFA_SUCCESS: '/api/SharedWallet/SaveCardOnMfaSuccess',
        SAVE_BANK_ON_MFA_SUCCESS: '/api/SharedWallet/SaveBankAccountOnMfaSuccess',
    },
});
// Oscilar Script URLs
const OSCILAR_SCRIPT_URLS = {
    [Environment.PRODUCTION]: 'https://zqp.oscilar.com/v880i7rx/loader.js',
    [Environment.STAGING]: 'https://zqp-sand.oscilar.com/v880i7rx/loader.js',
    [Environment.LOCALDEVELOPMENT]: 'https://zqp-sand.oscilar.com/v880i7rx/loader.js'
};
// Function to get Oscilar script URL for specific environment
const getOscilarScriptUrl = (environment = ENV) => {
    return OSCILAR_SCRIPT_URLS[environment];
};

var AddressType;
(function (AddressType) {
    AddressType[AddressType["Primary"] = 1] = "Primary";
    AddressType[AddressType["Home"] = 2] = "Home";
    AddressType[AddressType["Work"] = 3] = "Work";
    AddressType[AddressType["Emergency"] = 4] = "Emergency";
    AddressType[AddressType["Billing"] = 5] = "Billing";
    AddressType[AddressType["Payor"] = 6] = "Payor";
})(AddressType || (AddressType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus[AccountStatus["Unknown"] = 0] = "Unknown";
    AccountStatus[AccountStatus["Saved"] = 1] = "Saved";
    AccountStatus[AccountStatus["AddressSuggested"] = 2] = "AddressSuggested";
    AccountStatus[AccountStatus["AddressValidationError"] = 3] = "AddressValidationError";
    AccountStatus[AccountStatus["AddressValidationSuccess"] = 4] = "AddressValidationSuccess";
    AccountStatus[AccountStatus["AddressValidationUnknownStatus"] = 5] = "AddressValidationUnknownStatus";
    AccountStatus[AccountStatus["IdentityValidationError"] = 6] = "IdentityValidationError";
    AccountStatus[AccountStatus["MFARequired"] = 7] = "MFARequired";
    AccountStatus[AccountStatus["IdentityValidationSuccess"] = 8] = "IdentityValidationSuccess";
    AccountStatus[AccountStatus["NachaValidationError"] = 9] = "NachaValidationError";
    AccountStatus[AccountStatus["NachaValidationFailed"] = 10] = "NachaValidationFailed";
    AccountStatus[AccountStatus["NachaValidationSuccess"] = 11] = "NachaValidationSuccess";
    AccountStatus[AccountStatus["MFAPending"] = 12] = "MFAPending";
    AccountStatus[AccountStatus["MFASuccess"] = 13] = "MFASuccess";
    AccountStatus[AccountStatus["MFAFailed"] = 14] = "MFAFailed";
})(AccountStatus || (AccountStatus = {}));
var CardType;
(function (CardType) {
    CardType["VISA"] = "Visa";
    CardType["MASTERCARD"] = "Mastercard";
    CardType["AMEX"] = "Amex";
    CardType["DISCOVER"] = "Discover";
    CardType["DINERS"] = "Diners";
    CardType["JCB"] = "JCB";
    CardType["UNIONPAY"] = "UnionPay";
})(CardType || (CardType = {}));
var BankAccountType;
(function (BankAccountType) {
    BankAccountType["Checking"] = "Checking";
    BankAccountType["Savings"] = "Savings";
})(BankAccountType || (BankAccountType = {}));
var MFAStatusEnum;
(function (MFAStatusEnum) {
    MFAStatusEnum[MFAStatusEnum["Pending"] = 1] = "Pending";
    MFAStatusEnum[MFAStatusEnum["Failed"] = 2] = "Failed";
    MFAStatusEnum[MFAStatusEnum["Pass"] = 3] = "Pass";
})(MFAStatusEnum || (MFAStatusEnum = {}));

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function getMfaStatus(operationsToken, userScopedAccessToken, mfainquiryId, environment = Environment.PRODUCTION) {
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
async function resendMfaLink(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
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
async function saveCardOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
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
async function saveBankOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
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

/* -------------------------------------------------------------------------- */
/* ------------------------- Resend MFA Link Payload ------------------------ */
/* -------------------------------------------------------------------------- */
function buildResendMfaLinkPayload(addRequestPayload, // can be card or bank payload
initialMfaResponse) {
    return {
        firstName: addRequestPayload?.payorInformation?.firstName,
        lastName: addRequestPayload?.payorInformation?.lastName,
        dateofBirth: addRequestPayload?.payorInformation?.dateofBirth,
        emailAddress: addRequestPayload?.payorInformation?.contactInformation?.emailAddress,
        phoneNumber: addRequestPayload?.payorInformation?.contactInformation?.phoneNumber,
        address: {
            addressLine1: addRequestPayload?.billingAddress?.addressLine1,
            addressLine2: addRequestPayload?.billingAddress?.addressLine2,
            city: addRequestPayload?.billingAddress?.city,
            provinceOrStateCode: addRequestPayload?.billingAddress?.provinceOrStateCode,
            postalCode: addRequestPayload?.billingAddress?.postalCode,
            countryCode: addRequestPayload?.billingAddress?.countryCode,
        },
        inquiryCorrelationId: initialMfaResponse?.data?.InquiryCorrelationId,
    };
}
function buildIdentityVerificationInformation(mfaData, newInquiryId) {
    return {
        inquiryCorrelationId: mfaData?.InquiryCorrelationId,
        mfaStatus: 3,
        trustLevel: mfaData?.TrustLevel,
        inquiryId: newInquiryId || mfaData?.MfaInquiryId,
        isAddressVerified: !mfaData?.IsAddressValidationFailed,
    };
}
function buildPayorInformation(requestPayload, mfaData, newInquiryId) {
    return {
        firstName: requestPayload?.payorInformation?.firstName,
        lastName: requestPayload?.payorInformation?.lastName,
        dateofBirth: requestPayload?.payorInformation?.dateofBirth,
        validateAddress: requestPayload?.payorInformation?.validateAddress,
        contactInformation: {
            emailAddress: requestPayload?.payorInformation?.contactInformation?.emailAddress,
            phoneNumber: requestPayload?.payorInformation?.contactInformation?.phoneNumber,
        },
        identityVerificationInformation: buildIdentityVerificationInformation(mfaData, newInquiryId),
    };
}
function buildBillingAddress(requestPayload) {
    return {
        addressLine1: requestPayload?.billingAddress?.addressLine1,
        addressLine2: requestPayload?.billingAddress?.addressLine2,
        city: requestPayload?.billingAddress?.city,
        provinceOrStateCode: requestPayload?.billingAddress?.provinceOrStateCode,
        postalCode: requestPayload?.billingAddress?.postalCode,
        countryCode: requestPayload?.billingAddress?.countryCode,
    };
}
// /**
// * Build the SaveCardOnMfaSuccess payload from addCardRequestPayload + initialMfaResponse
// */
function buildSaveCardOnMfaSuccessPayload(addCardRequestPayload, initialMfaResponse, newInquiryId) {
    const mfaData = initialMfaResponse?.data;
    return {
        payorInformation: buildPayorInformation(addCardRequestPayload, mfaData, newInquiryId),
        accountReferenceId: addCardRequestPayload?.accountReferenceId,
        billingAddress: buildBillingAddress(addCardRequestPayload),
        cardNumber: addCardRequestPayload?.cardNumber,
        expirationMonth: addCardRequestPayload?.expirationMonth,
        expirationYear: addCardRequestPayload?.expirationYear,
    };
}
// /**
// * Build the SaveBankOnMfaSuccess payload from addBankRequestPayload + initialMfaResponse
// */
function buildSaveBankOnMfaSuccessPayload(addBankRequestPayload, initialMfaResponse, newInquiryId) {
    const mfaData = initialMfaResponse?.data;
    return {
        payorInformation: buildPayorInformation(addBankRequestPayload, mfaData, newInquiryId),
        accountReferenceId: addBankRequestPayload?.accountReferenceId,
        billingAddress: buildBillingAddress(addBankRequestPayload),
        accountNumber: addBankRequestPayload?.accountNumber,
        routingNumber: addBankRequestPayload?.routingNumber,
        bankAccountType: addBankRequestPayload?.bankAccountType,
    };
}

const mfaModelPopUpModuleCss = ".action-modal .modal-footer .button-box .primary-btn,.action-modal .modal-footer .button-box .secondarybtn{background-image:none;border-radius:12px;box-shadow:none;box-sizing:border-box;font-family:\"Inter\", sans-serif;font-size:14px;font-weight:700;height:48px;line-height:14px;padding:16px;text-align:center;text-shadow:none;cursor:pointer}.popup{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.5);display:flex;justify-content:center;align-items:center;z-index:999}.action-modal{position:absolute;top:80px;border-radius:12px;background:white;display:flex;flex-direction:column;gap:24px;opacity:1;padding:40px}.action-modal .modal-container{display:flex;flex-direction:column;gap:24px;width:237px;margin:0 auto}.action-modal .modal-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #e9eaeb}.action-modal .modal-header h3{font-family:\"p22-mackinac-pro\";font-weight:800;font-size:24px;margin:0;line-height:27px;color:#282829}.action-modal .modal-body{padding:0}.action-modal .modal-body .dialogContentText{font-family:\"Inter\", sans-serif;font-weight:400;font-size:14px;color:#282829;line-height:21px}.action-modal .modal-body .highlight{font-weight:700;font-style:normal}.action-modal .modal-body .time-highlight{font-weight:700;color:#d01a1f}.action-modal .modal-footer{background-color:transparent;box-shadow:none;padding-top:4px;display:flex;flex-direction:column;align-items:stretch}.action-modal .modal-footer .button-box{display:flex;flex-direction:column;gap:14px;width:100%}.action-modal .modal-footer .button-box .secondarybtn{background-color:#FFFFFF;border:1.5px solid #e9eaeb;color:#282829;width:100%}.action-modal .modal-footer .button-box .primary-btn{background-color:#282829;border:1px solid #282829;color:#FFFFFF;width:100%}.action-modal .modal-footer .button-box .primary-btn[disabled]{background-color:#e9eaeb;border-color:#e9eaeb;color:#9ba3a7;cursor:default}@media (min-width: 545px){.action-modal{padding:40px}.action-modal .modal-container{width:440px;margin:0 auto;gap:24px}.action-modal .modal-footer{align-items:center}.action-modal .modal-footer .button-box{display:flex;flex-direction:row;justify-content:flex-end;gap:8px;width:100%}.action-modal .modal-footer .button-box .secondarybtn,.action-modal .modal-footer .button-box .primary-btn{width:fit-content}}";

const MfaModelPopUP = /*@__PURE__*/ proxyCustomElement(class MfaModelPopUP extends H {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
        this.successEvent = createEvent(this, "successEvent");
    }
    operationsToken;
    userScopedAccessToken;
    environment; // Environment parameter with production default
    onClose;
    mfaResponse = null;
    addRequestPayload;
    initialMfaResponse;
    requestType;
    time = 60; // 1 minutes in seconds
    isRunning = true;
    currentInquiryId = '';
    timer;
    countdownIntervalId;
    pollingIntervalId;
    errorHandler;
    accountSubmissionSuccess = null;
    noOfAttempts = 2;
    timeoutId;
    successEvent;
    handleIsRunningTrue(newValue) {
        if (newValue === true) {
            this.handleStart();
        }
    }
    handleIsRunningFalse(newValue) {
        if (newValue === false) {
            this.handleStop();
        }
    }
    handleStart() {
        this.startCountdownTimer();
        this.scheduleMfaStatusPolling();
    }
    handleStop() {
        this.stopCountdownTimer();
        this.clearPollingTimers();
    }
    componentWillLoad() {
        this.currentInquiryId = this.initialMfaResponse?.data?.MfaInquiryId || '';
    }
    componentDidLoad() {
        if (this.isRunning) {
            this.startCountdownTimer();
            this.scheduleMfaStatusPolling();
        }
    }
    scheduleMfaStatusPolling() {
        const getMfaStatusAndSetInterval = () => {
            this.pollingIntervalId = setInterval(async () => {
                const response = await getMfaStatus(this.operationsToken, this.userScopedAccessToken, this.currentInquiryId, this.environment);
                if (response.success) {
                    this.mfaResponse = response.data;
                }
                else {
                    const msg = response.message ?? 'Unexpected error. Please refresh or try again later.';
                    // send error up to parent
                    if (this.errorHandler) {
                        this.errorHandler([msg]);
                    }
                    // stop polling when error occurs
                    this.handleCancel();
                }
            }, this.recurringInterval * 1000);
        };
        this.timeoutId = setTimeout(() => {
            getMfaStatusAndSetInterval();
        }, this.startInterval * 1000);
    }
    async handleMfaResponseChanged(newValue) {
        if (!newValue)
            return;
        if (newValue.mfaStatus === MFAStatusEnum.Pass) {
            this.clearPollingTimers();
            let payload;
            let response;
            if (this.requestType === 'card') {
                payload = buildSaveCardOnMfaSuccessPayload(this.addRequestPayload, this.initialMfaResponse, this.currentInquiryId);
                response = await saveCardOnMfaSuccess(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            }
            else if (this.requestType === 'bank') {
                payload = buildSaveBankOnMfaSuccessPayload(this.addRequestPayload, this.initialMfaResponse, this.currentInquiryId);
                response = await saveBankOnMfaSuccess(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            }
            if (response.success) {
                this.accountSubmissionSuccess = response.data;
            }
            else {
                const msg = response.message ?? 'Unexpected error while saving card.';
                if (this.errorHandler) {
                    this.errorHandler([msg]);
                }
                // stop polling when error occurs
                this.handleCancel();
            }
        }
        else if (newValue.mfaStatus === MFAStatusEnum.Failed) {
            this.clearPollingTimers();
            const msg = 'Your MFA verification has failed. Please try again or use a different payment method.';
            // send error up to parent
            if (this.errorHandler) {
                this.errorHandler([msg]);
            }
            this.handleCancel(); // close popup
        }
    }
    handleAccountSubmissionSuccessChanged(newValue) {
        if (!newValue)
            return;
        if (newValue?.resultMessage === 'Success' &&
            newValue?.paymentInstrument) {
            this.successEvent.emit({ data: newValue });
            this.handleCancel();
        }
    }
    clearPollingTimers() {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    startCountdownTimer() {
        this.countdownIntervalId = setInterval(() => {
            if (this.time > 0) {
                this.time = this.time - 1;
            }
            else {
                this.isRunning = false;
                if (this.noOfAttempts === 0) {
                    const msg = 'You have reached the maximum number of MFA attempts. Please use a different payment method.';
                    if (this.errorHandler) {
                        this.errorHandler([msg]);
                    }
                    this.handleCancel(); // Cancel if no attempts left
                }
                clearInterval(this.countdownIntervalId);
            }
        }, 1000);
    }
    stopCountdownTimer() {
        clearInterval(this.countdownIntervalId);
    }
    disconnectedCallback() {
        this.stopCountdownTimer();
        this.clearPollingTimers();
    }
    handleResendLinkClick = async () => {
        if (this.noOfAttempts > 0) {
            this.noOfAttempts = this.noOfAttempts - 1;
            // build the payload using the builder
            const payload = buildResendMfaLinkPayload(this.addRequestPayload, this.initialMfaResponse);
            // call the service
            const response = await resendMfaLink(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            if (response.success) {
                // update inquiryId with the new one from backend
                this.currentInquiryId = response.data?.inquiryId || '';
                this.time = 60;
                this.isRunning = true;
            }
            else {
                const msg = response.message ?? 'Unexpected error. Please refresh or try again later.';
                if (this.errorHandler) {
                    this.errorHandler([msg]);
                }
                // stop polling when error occurs
                this.handleCancel();
            }
        }
    };
    handleCancel = () => {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.countdownIntervalId) {
            clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
        }
        this.onClose();
    };
    get mfaPoolSettings() {
        return this.initialMfaResponse?.data?.MfaPoolSettings || '20-5'; // fallback if missing
    }
    get mobileNumberLastFourDigits() {
        const mobile = this.addRequestPayload?.payorInformation?.contactInformation?.phoneNumber || '';
        return mobile.length >= 4 ? mobile.slice(-4) : mobile;
    }
    get startInterval() {
        const [start] = this.mfaPoolSettings?.split('-') || [];
        return Number(start);
    }
    get recurringInterval() {
        const [, recurring] = this.mfaPoolSettings?.split('-') || [];
        return Number(recurring);
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    getAttemptLabel() {
        return this.noOfAttempts === 1 || this.noOfAttempts === 0 ? 'attempt' : 'attempts';
    }
    render() {
        return (h("div", { key: '5de043eea173405086f78a6e185e4d80b48ed81f', class: "popup" }, h("div", { key: '3c3352e1f220f4ee5aaa7ac171bb2da6ca119bd5', class: "action-modal" }, h("div", { key: '895772d846b9e6a5f5739ce998631e1a60cbeee2', class: "modal-container" }, h("div", { key: 'a4ab42afb23c614bec19b23b41d52200034e8241', class: "modal-header" }, h("h3", { key: '22e77c17a562b26cab4dc05e947e4f02ba37cf5d' }, "Verification Link Sent")), h("div", { key: '66b16cbbf996f68c603413aaf16a8cfdab814469', class: "modal-body" }, h("p", { key: '9e26756546f5a85bb50d9d2a04877b78774611ca', class: "dialogContentText" }, "A verification link has been sent to your ", h("span", { key: 'beb3ef90f640e49857fad56d1935e3c4cc95a0e7', class: "highlight" }, "mobile number ending in ", this.mobileNumberLastFourDigits, "."), h("br", { key: 'bbd0feb709fc2295df6c2952e29d1c1359c64809' }), "Please tap the link and follow the instructions to confirm your identity.", h("br", { key: '66c011c5c5d70fc71ada769fa65c7a407ace6a39' }), h("br", { key: 'e69b20f14910a18c8036e0f13a64a612c4106ada' }), "The link will expire in ", h("span", { key: 'b7f974b1b09a05ba2e54c6bba8c1b6ea691edc45', class: "time-highlight" }, this.formatTime(this.time)), ".", h("br", { key: 'a86388a63e57e3f807f79e6ce092df3846d2ff25' }), "You have ", this.noOfAttempts, " remaining ", this.getAttemptLabel(), " to resend the link if needed."), h("div", { key: 'e4453569af76aa3d57958810180a9a413ee81642', class: "modal-footer" }, h("div", { key: '57947d11ec1f9479a87081c596442a3674bcfd19', class: "button-box" }, h("button", { key: '213402979888e5227f5b9adec8133bc26178a6c2', class: "secondarybtn", onClick: this.handleCancel }, "Cancel"), h("button", { key: '543da21f48b02a8f383b5639815b905f9941405c', class: "primary-btn", disabled: this.isRunning, onClick: this.handleResendLinkClick }, "Resend Link"))))))));
    }
    static get watchers() { return {
        "isRunning": ["handleIsRunningTrue", "handleIsRunningFalse"],
        "mfaResponse": ["handleMfaResponseChanged"],
        "accountSubmissionSuccess": ["handleAccountSubmissionSuccessChanged"]
    }; }
    static get style() { return mfaModelPopUpModuleCss; }
}, [1, "mfa-model-popup", {
        "operationsToken": [1, "operations-token"],
        "userScopedAccessToken": [1, "user-scoped-access-token"],
        "environment": [1],
        "onClose": [16, "on-close"],
        "addRequestPayload": [8, "add-request-payload"],
        "initialMfaResponse": [8, "initial-mfa-response"],
        "requestType": [1, "request-type"],
        "errorHandler": [16, "error-handler"],
        "mfaResponse": [32],
        "time": [32],
        "isRunning": [32],
        "currentInquiryId": [32],
        "accountSubmissionSuccess": [32],
        "noOfAttempts": [32]
    }, undefined, {
        "isRunning": ["handleIsRunningTrue", "handleIsRunningFalse"],
        "mfaResponse": ["handleMfaResponseChanged"],
        "accountSubmissionSuccess": ["handleAccountSubmissionSuccessChanged"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["mfa-model-popup"];
    components.forEach(tagName => { switch (tagName) {
        case "mfa-model-popup":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, MfaModelPopUP);
            }
            break;
    } });
}
defineCustomElement();

export { AccountStatus as A, BankAccountType as B, CardType as C, Environment as E, MfaModelPopUP as M, AddressType as a, getOscilarScriptUrl as b, defineCustomElement as d, getApiConfig as g };
//# sourceMappingURL=p-FUsAEGQG.js.map

//# sourceMappingURL=p-FUsAEGQG.js.map