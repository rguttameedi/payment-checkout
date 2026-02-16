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

export { AddressType as A, BankAccountType as B, CardType as C, Environment as E, MFAStatusEnum as M, getOscilarScriptUrl as a, AccountStatus as b, getApiConfig as g };
//# sourceMappingURL=common-BoD18Nfo.js.map

//# sourceMappingURL=common-BoD18Nfo.js.map