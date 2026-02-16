import { Environment } from '../config';
interface WalletOwnerIdentifiers {
    realPageId?: string;
    customer: {
        customerNumber?: string;
        customerInformation: {
            firstName: string;
            lastName: string;
        };
    };
}
interface BillingAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    provinceOrStateCode: string;
    countryCode: string;
    postalCode: string;
}
interface ContactInformation {
    emailAddress: string;
    phoneNumber: string;
    addressType?: number;
}
interface IdentityVerificationInformation {
    inquiryCorrelationId: string;
    mfaStatus: number;
    trustLevel: number;
    inquiryId: string;
    verifiedDate: string;
    isAddressVerified: boolean;
    mfaVerifiedDate: string;
}
interface PayorInformation {
    firstName: string;
    lastName: string;
    paymentAccountNickname: string;
    validateAddress: boolean;
    dateofBirth: string;
    contactInformation: ContactInformation;
    identityVerificationInformation?: IdentityVerificationInformation | null;
}
interface AddCardRequest {
    walletOwnerIdentifiers: WalletOwnerIdentifiers;
    accountReferenceId: string;
    cardHolder: string;
    billingAddress: BillingAddress;
    cardNumber: string;
    payorInformation: PayorInformation;
    expirationMonth: string;
    expirationYear: string;
    tokenizationType: number;
}
export declare function addCard(operationsToken: string, userScopedAccessToken: string, requestBody: AddCardRequest, environment?: Environment): Promise<any>;
export {};
