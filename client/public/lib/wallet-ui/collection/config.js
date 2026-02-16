// Environment configuration
export var Environment;
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
export const getApiConfig = (environment = DEFAULT_ENV) => ({
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
export const getOscilarScriptUrl = (environment = ENV) => {
    return OSCILAR_SCRIPT_URLS[environment];
};
// Default API config (for backward compatibility)
export const API_CONFIG = getApiConfig(ENV);
//# sourceMappingURL=config.js.map
