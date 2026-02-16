import { EventEmitter } from '../../stencil-public-runtime';
import { Environment } from '../../config';
import { PaymentOptionsResponse } from '../../utils/apiService';
import '../addpaymentmethod/addnewpayment';
import '../addbankaccount/addbankaccount';
import '@material/web/button/filled-button.js';
export interface PaymentOption {
    value: string;
    text: string;
    type: string;
}
export declare class WalletDropdown {
    options: string | string[];
    selectOption: EventEmitter<PaymentOption>;
    operationsToken: string;
    userScopedAccessToken: string;
    selectPayment: string;
    displayMode: 'full' | 'text-only';
    paymentType: string;
    environment: Environment;
    parsedOptions: (string | {
        value: string;
        text: string;
        type: string;
    })[];
    showAddNewPayment: boolean;
    showAddBankAccount: boolean;
    selectedOption: string | {
        value: string;
        text: string;
        type: string;
    };
    selectedPaymentMethod: string;
    selectedPaymentDate: string;
    selectedPaymentIconType: string;
    showPaymentSelector: boolean;
    showPaymentDate: boolean;
    walletResponse: PaymentOptionsResponse | null;
    el: HTMLElement;
    private readonly oscilarCleanup;
    disconnectedCallback(): void;
    private devLog;
    handleNewCard(paymentInstrumentToken: CustomEvent<string>): Promise<void>;
    private expandAccordion;
    handleNewBankAccount(paymentInstrumentToken: CustomEvent<string>): Promise<void>;
    updateDate(event: CustomEvent<string>): void;
    goToPaymentSelector(event: CustomEvent<boolean>): void;
    handleSelectPaymentChange(newValue: string): void;
    handleNewPaymentMethod(token: string, type: 'card' | 'bank'): Promise<void>;
    private initializeOscilar;
    componentWillLoad(): Promise<void>;
    getPaymentIconClass: (paymentType: string) => string;
    goToNewPayment: () => void;
    goToNewBankAccount: () => void;
    handleSelect(option: string | PaymentOption): void;
    private mapPaymentOptions;
    private reorderOptionsWithNewPayment;
    private findNewlyAddedOption;
    private updateSelectedOption;
    private trackAndEmitSelection;
    refreshDropdown(type?: 'card' | 'bank', newPaymentToken?: string): Promise<void>;
    fetchPaymentOptions(): Promise<void>;
    collapseSection(element: HTMLElement): void;
    toggleCollapse(event: any): void;
    expandSection(element: HTMLElement): void;
    private isCheckingWithLongNumber;
    render(): any;
}
