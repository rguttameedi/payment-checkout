export declare enum Environment {
    PRODUCTION = "production",
    STAGING = "staging",
    LOCALDEVELOPMENT = "localdevelopment"
}
export declare const getApiConfig: (environment?: Environment) => {
    BASE_URL: string;
    RELATIVE_URLS: {
        ADD_CARD: string;
        ADD_BANK_ACCOUNT: string;
        FETCH_PAYMENT_OPTIONS: string;
        GET_MFA_STATUS: string;
        RESEND_MFA_LINK: string;
        SAVE_CARD_ON_MFA_SUCCESS: string;
        SAVE_BANK_ON_MFA_SUCCESS: string;
    };
};
export declare const getOscilarScriptUrl: (environment?: Environment) => string;
export declare const API_CONFIG: {
    BASE_URL: string;
    RELATIVE_URLS: {
        ADD_CARD: string;
        ADD_BANK_ACCOUNT: string;
        FETCH_PAYMENT_OPTIONS: string;
        GET_MFA_STATUS: string;
        RESEND_MFA_LINK: string;
        SAVE_CARD_ON_MFA_SUCCESS: string;
        SAVE_BANK_ON_MFA_SUCCESS: string;
    };
};
