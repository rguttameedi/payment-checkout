export declare enum AddressType {
    Primary = 1,
    Home = 2,
    Work = 3,
    Emergency = 4,
    Billing = 5,
    Payor = 6
}
export declare enum AccountStatus {
    Unknown = 0,
    Saved = 1,
    AddressSuggested = 2,
    AddressValidationError = 3,
    AddressValidationSuccess = 4,
    AddressValidationUnknownStatus = 5,
    IdentityValidationError = 6,
    MFARequired = 7,
    IdentityValidationSuccess = 8,
    NachaValidationError = 9,
    NachaValidationFailed = 10,
    NachaValidationSuccess = 11,
    MFAPending = 12,//Show Pop up in UI
    MFASuccess = 13,
    MFAFailed = 14
}
export declare enum CardType {
    VISA = "Visa",
    MASTERCARD = "Mastercard",
    AMEX = "Amex",
    DISCOVER = "Discover",
    DINERS = "Diners",
    JCB = "JCB",
    UNIONPAY = "UnionPay"
}
export declare enum BankAccountType {
    Checking = "Checking",
    Savings = "Savings"
}
export declare enum MFAStatusEnum {
    Pending = 1,
    Failed = 2,
    Pass = 3
}
export interface IMFAResponse {
    inquiryId: string;
    mfaStatus: MFAStatusEnum;
}
