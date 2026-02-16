import { Environment } from '../config';
export interface CreditCardType {
    accountTypeId: number;
    name: string;
    sortOrder: number;
}
export interface PaymentOptionsResponse {
    paymentOptions: {
        value: string;
        text: string;
        type: string;
    }[];
    availableCreditCards: CreditCardType[] | null;
}
export declare function fetchPaymentOptions(operationsToken: string, userScopedAccessToken: string, paymentType?: string, environment?: Environment): Promise<PaymentOptionsResponse>;
