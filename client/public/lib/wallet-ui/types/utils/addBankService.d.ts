import { Environment } from '../config';
import { BankAccountType } from "../interfaces/common";
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
interface AddBankAccountRequest {
    walletOwnerIdentifiers: WalletOwnerIdentifiers;
    accountReferenceId: string;
    accountNumber: string;
    payorInformation: PayorInformation;
    billingAddress: BillingAddress;
    routingNumber: string;
    bankAccountType: BankAccountType;
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
export declare function addBankAccount(operationsToken: string, userScopedAccessToken: string, requestBody: AddBankAccountRequest, environment?: Environment): Promise<any>;
export {};
