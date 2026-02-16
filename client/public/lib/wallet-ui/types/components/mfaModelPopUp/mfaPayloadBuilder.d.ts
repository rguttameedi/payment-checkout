export interface Address {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    provinceOrStateCode: string;
    postalCode: string;
    countryCode: string;
}
export interface ResendMfaLinkRequest {
    firstName: string;
    lastName: string;
    dateofBirth: string;
    emailAddress: string;
    phoneNumber: string;
    address: Address;
    inquiryCorrelationId: string;
}
export declare function buildResendMfaLinkPayload(addRequestPayload: any, // can be card or bank payload
initialMfaResponse: any): ResendMfaLinkRequest;
export interface IdentityVerificationInformation {
    inquiryCorrelationId: string;
    mfaStatus: number;
    trustLevel: number;
    inquiryId: string;
    isAddressVerified: boolean;
}
export interface ContactInformation {
    emailAddress: string;
    phoneNumber: string;
}
export interface PayorInformation {
    firstName: string;
    lastName: string;
    dateofBirth: string;
    validateAddress: boolean;
    contactInformation: ContactInformation;
    identityVerificationInformation: IdentityVerificationInformation;
}
export interface BillingAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    provinceOrStateCode: string;
    postalCode: string;
    countryCode: string;
}
export interface SaveCardOnMfaSuccessRequest {
    payorInformation: PayorInformation;
    accountReferenceId: string;
    billingAddress: BillingAddress;
    cardNumber: string;
    expirationMonth: string;
    expirationYear: string;
}
export declare function buildSaveCardOnMfaSuccessPayload(addCardRequestPayload: any, initialMfaResponse: any, newInquiryId?: string): SaveCardOnMfaSuccessRequest;
export interface SaveBankOnMfaSuccessRequest {
    payorInformation: PayorInformation;
    accountReferenceId: string;
    billingAddress: BillingAddress;
    accountNumber: string;
    routingNumber: string;
    bankAccountType: string;
}
export declare function buildSaveBankOnMfaSuccessPayload(addBankRequestPayload: any, initialMfaResponse: any, newInquiryId?: string): SaveBankOnMfaSuccessRequest;
