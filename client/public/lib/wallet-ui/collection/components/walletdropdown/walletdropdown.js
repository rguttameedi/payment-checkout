import { h } from "@stencil/core";
import { Environment } from "../../config";
import { oscilarService } from "../../utils/oscilarService";
import { fetchPaymentOptions } from "../../utils/apiService";
import { initWalletEvents, trackApiCall, trackPaymentSelection, trackAddPaymentStarted, trackAddBankStarted } from "../../utils/walletEvents";
import "../addpaymentmethod/addnewpayment";
import "../addbankaccount/addbankaccount";
// Import Material Design components once at the parent level to prevent duplicate registration
import "@material/web/button/filled-button.js";
export class WalletDropdown {
    options = []; // Accept both string and array
    selectOption;
    operationsToken = ''; // Operations token for authentication
    userScopedAccessToken = ''; // User scoped access token
    selectPayment = ''; // New select-payment parameter
    displayMode = 'full'; // New display mode parameter
    paymentType = 'all'; // New payment-type parameter to filter payment options
    environment = Environment.PRODUCTION; // Environment parameter with production default
    parsedOptions = [];
    showAddNewPayment = false;
    showAddBankAccount = false;
    selectedOption = '';
    selectedPaymentMethod = '';
    selectedPaymentDate = '';
    selectedPaymentIconType = 'default';
    showPaymentSelector = true;
    showPaymentDate = false;
    walletResponse = null;
    el;
    oscilarCleanup = null;
    disconnectedCallback() {
        // Clean up when component is removed from the DOM
        if (this.oscilarCleanup) {
            this.oscilarCleanup();
        }
    }
    // Helper function to conditionally log only in development
    devLog = (message, ...args) => {
        if (this.environment === Environment.LOCALDEVELOPMENT || this.environment === Environment.STAGING) {
            console.log(message, ...args);
        }
    };
    async handleNewCard(paymentInstrumentToken) {
        this.showAddNewPayment = false;
        this.showPaymentSelector = true;
        await this.handleNewPaymentMethod(paymentInstrumentToken.detail, 'card');
        requestAnimationFrame(() => {
            this.expandAccordion();
        });
    }
    expandAccordion() {
        const picklistWrapper = this.el.shadowRoot?.querySelector('#picklist');
        const picklistContent = this.el.shadowRoot?.querySelector('#paymentListContainer');
        if (picklistWrapper instanceof HTMLElement &&
            picklistContent instanceof HTMLElement) {
            picklistWrapper.classList.remove('collapsed');
            picklistContent.style.height = picklistContent.scrollHeight + 'px';
            // Optionally remove the 'collapsed' class from content as well if used
            picklistContent.classList.remove('collapsed');
        }
    }
    async handleNewBankAccount(paymentInstrumentToken) {
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
        await this.handleNewPaymentMethod(paymentInstrumentToken.detail, 'bank');
        requestAnimationFrame(() => {
            this.expandAccordion();
        });
    }
    updateDate(event) {
        this.devLog('listener activated: ', event);
        this.selectedPaymentDate = event.detail;
        this.collapseSection(this.el.shadowRoot.querySelector('#paymentDateContainer'));
        this.el.shadowRoot.querySelector('#paymentDate').classList.add('collapsed');
        this.devLog('State Date: ', this.selectedPaymentDate);
    }
    ;
    goToPaymentSelector(event) {
        this.devLog('goToPaymentSelector event:', event);
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
    }
    ;
    handleSelectPaymentChange(newValue) {
        this.devLog('🔄 selectPayment prop changed:', {
            newValue,
            parsedOptionsLength: this.parsedOptions.length,
            currentSelectedOption: this.selectedOption
        });
        // Handle selectPayment prop changes without causing infinite loops
        if (newValue && this.parsedOptions.length > 0) {
            const matchingOption = this.parsedOptions.find(option => {
                if (typeof option === 'string') {
                    return option === newValue;
                }
                return option.value === newValue;
            });
            if (matchingOption) {
                if (matchingOption !== this.selectedOption) {
                    this.devLog('✅ Found matching option, updating selection:', matchingOption);
                    this.selectedOption = matchingOption;
                    this.selectedPaymentMethod = typeof matchingOption === 'string' ? matchingOption : matchingOption.text;
                    this.selectedPaymentIconType = typeof matchingOption === 'string' ? 'default' : matchingOption.type;
                }
                else {
                    this.devLog('ℹ️ Matching option already selected, no change needed');
                }
            }
            else {
                this.devLog('⚠️ No matching option found for selectPayment:', newValue);
            }
        }
        else if (newValue && this.parsedOptions.length === 0) {
            this.devLog('⏳ selectPayment changed but options not loaded yet, will be handled in componentWillLoad');
        }
    }
    async handleNewPaymentMethod(token, type) {
        this.devLog(`Received ${type} payment instrument token:`, token);
        // Refresh the options to include the new payment method
        await this.fetchPaymentOptions();
        this.parsedOptions = this.reorderOptionsWithNewPayment(this.parsedOptions, token);
        this.devLog('📋 Reordered options with new payment at top:', this.parsedOptions);
        // Find and select the matching option
        const matchingOption = this.parsedOptions.find(option => {
            if (typeof option === 'string') {
                return option === token;
            }
            return option.value === token;
        });
        if (matchingOption) {
            this.devLog('Found matching option:', matchingOption);
            this.selectedOption = typeof matchingOption === 'string' ? matchingOption : matchingOption;
            // Use the text property which contains the masked card number
            this.selectedPaymentMethod = typeof this.selectedOption === 'string' ? this.selectedOption : this.selectedOption.text;
            // 🔧 FIX: Update the selectedPaymentIconType for the newly added payment method
            this.selectedPaymentIconType = typeof matchingOption === 'string' ? 'default' : (matchingOption.type || 'default');
            this.devLog('🔧 Updated selectedPaymentIconType for new payment method:', this.selectedPaymentIconType);
            // Update the selectPayment property with the token value after a delay
            setTimeout(() => {
                this.selectPayment = typeof matchingOption === 'string' ? matchingOption : matchingOption.value;
            }, 0);
            // Emit the selection event
            this.selectOption.emit({
                value: typeof matchingOption === 'string' ? matchingOption : matchingOption.value,
                text: typeof matchingOption === 'string' ? matchingOption : matchingOption.text,
                type: typeof matchingOption === 'string' ? 'default' : matchingOption.type
            });
        }
        else {
            this.devLog('No matching option found for token:', token);
        }
        // Hide the appropriate form
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        this.showPaymentSelector = true;
    }
    async initializeOscilar() {
        const oscilarIDs = await oscilarService.loadScript(this.environment);
        this.devLog('Oscilar initialized with IDs:', oscilarIDs);
    }
    async componentWillLoad() {
        this.initializeOscilar().catch(error => {
            this.devLog('Oscilar initialization failed, continuing without Oscilar:', error);
        });
        this.devLog('🚀 WalletDropdown componentWillLoad started');
        this.devLog('Component props:', {
            operationsToken: this.operationsToken ? '***PROVIDED***' : 'MISSING',
            userScopedAccessToken: this.userScopedAccessToken ? '***PROVIDED***' : 'MISSING',
            displayMode: this.displayMode,
            paymentType: this.paymentType,
            options: this.options,
            environment: this.environment
        });
        // Initialize event tracking
        initWalletEvents('WalletDropdown', this.environment);
        this.devLog('Raw options prop:', this.options);
        this.devLog('Payment type:', this.paymentType);
        // Initialize with empty array
        let options = [];
        // Parse options if passed as a string
        if (typeof this.options === 'string') {
            try {
                options = JSON.parse(this.options);
                this.devLog('Parsed options:', options);
            }
            catch (error) {
                console.error('Invalid options format. Expected a JSON string.', error);
            }
        }
        else if (Array.isArray(this.options)) {
            options = [...this.options];
            this.devLog('Options passed as array:', options);
        }
        // Fetch payment options using the dual tokens
        if (this.operationsToken && this.userScopedAccessToken) {
            try {
                this.walletResponse = await trackApiCall('/payment-options', 'GET', () => fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment));
                this.devLog('API options:', this.walletResponse?.paymentOptions);
                // Map API options to the correct format
                const mappedApiOptions = this.walletResponse?.paymentOptions.map(option => typeof option === 'string'
                    ? { value: option, text: option, type: 'default' }
                    : { value: option.value, text: option.text, type: option.type });
                // Combine with existing options
                options = [...options, ...mappedApiOptions];
            }
            catch (error) {
                console.error('Error fetching payment options:', error);
            }
        }
        // Update state with all options
        this.parsedOptions = options;
        // Handle initial selectPayment prop or auto-select first option
        if (options.length > 0 && !this.selectedOption) {
            let optionToSelect = null;
            // First, check if selectPayment prop was provided and find matching option
            if (this.selectPayment) {
                optionToSelect = options.find(option => {
                    if (typeof option === 'string') {
                        return option === this.selectPayment;
                    }
                    return option.value === this.selectPayment;
                });
                if (optionToSelect) {
                    this.devLog('🎯 Found matching option for selectPayment prop:', optionToSelect);
                }
                else {
                    this.devLog('⚠️ No matching option found for selectPayment:', this.selectPayment);
                }
            }
            // If no selectPayment match found, default to first option
            if (!optionToSelect) {
                optionToSelect = options[0];
                this.devLog('📌 Auto-selecting first payment option:', optionToSelect);
            }
            // Set the selected option
            this.selectedOption = optionToSelect;
            this.selectedPaymentMethod = optionToSelect.text || optionToSelect.value;
            this.selectedPaymentIconType = optionToSelect.type || 'default';
            // Update selectPayment prop to reflect the actual selected value
            if (!this.selectPayment || this.selectPayment !== (optionToSelect.value || optionToSelect)) {
                this.selectPayment = typeof optionToSelect === 'string' ? optionToSelect : optionToSelect.value;
            }
            // Emit the selection event
            this.selectOption.emit({
                value: optionToSelect.value || optionToSelect,
                text: optionToSelect.text || optionToSelect.value || optionToSelect,
                type: optionToSelect.type || 'default'
            });
            this.devLog('✅ Selected payment option on load:', {
                selectedOption: this.selectedOption,
                selectPayment: this.selectPayment,
                selectedPaymentMethod: this.selectedPaymentMethod
            });
        }
        this.devLog('✅ componentWillLoad completed. Final state:', {
            parsedOptionsLength: this.parsedOptions.length,
            selectedOption: this.selectedOption,
            showPaymentSelector: this.showPaymentSelector,
            showAddNewPayment: this.showAddNewPayment
        });
    }
    getPaymentIconClass = (paymentType) => {
        const paymentTypeClasses = {
            'BankAccount': 'icon-echeck',
            'BankAccount-checking': 'icon-echeck',
            'BankAccount-savings': 'icon-echeck',
            'Card-visa': 'icon-visa',
            'Card-mastercard': 'icon-mastercard',
            'Card-americanexpress': 'icon-amex',
            'Card-discover': 'icon-discover',
            'Card-jcb': 'icon-jcb',
            'Card-upi': 'icon-upi',
            'default': '' // No icon if no match found
        };
        this.devLog(`🎯 Icon mapping debug: paymentType='${paymentType}' (type: ${typeof paymentType})`);
        this.devLog('🎯 Available mapping keys:', Object.keys(paymentTypeClasses));
        const iconClass = paymentTypeClasses[paymentType] || paymentTypeClasses['default'];
        this.devLog(`🎯 Mapped to iconClass: '${iconClass}'`);
        // Additional debugging for Mastercard specifically
        if (paymentType && paymentType.toLowerCase().includes('master')) {
            this.devLog('🔍 Mastercard detected in paymentType:', paymentType);
            this.devLog('🔍 Exact match check for "Card-mastercard":', paymentTypeClasses['Card-mastercard']);
            this.devLog('🔍 paymentType === "Card-mastercard":', paymentType === 'Card-mastercard');
        }
        // Debug for any undefined/null paymentType
        if (!paymentType || paymentType === 'undefined' || paymentType === 'null') {
            this.devLog('⚠️ WARNING: paymentType is undefined/null/string-null:', paymentType);
        }
        return iconClass;
    };
    goToNewPayment = () => {
        trackAddPaymentStarted();
        this.showAddNewPayment = true;
        this.showPaymentSelector = false;
    };
    goToNewBankAccount = () => {
        trackAddBankStarted();
        this.showAddBankAccount = true;
        this.showPaymentSelector = false;
    };
    handleSelect(option) {
        this.selectedOption = typeof option === 'string'
            ? { value: option, text: option, type: 'default' }
            : option;
        this.selectedPaymentMethod = this.selectedOption.text;
        // Update selectPayment after a brief delay to avoid render cycle issues
        setTimeout(() => {
            this.selectPayment = typeof option === 'string' ? option : option.value;
        }, 0);
        // Track payment method selection
        trackPaymentSelection(this.selectedOption.value || this.selectedOption.text, this.selectedOption.type || 'default', this.selectedOption.text);
        this.selectOption.emit(this.selectedOption);
        this.collapseSection(this.el.shadowRoot.querySelector('#paymentListContainer'));
        // Debug the icon type assignment
        this.devLog('🔧 Setting selectedPaymentIconType from selectedOption.type:', this.selectedOption.type);
        this.devLog('🔧 Full selectedOption object:', this.selectedOption);
        this.selectedPaymentIconType = this.selectedOption.type || 'default';
        this.devLog('🔧 Final selectedPaymentIconType set to:', this.selectedPaymentIconType);
        this.el.shadowRoot.querySelector('#picklist').classList.add('collapsed');
    }
    mapPaymentOptions(paymentOptions) {
        return paymentOptions.map((option) => typeof option === 'string'
            ? { value: option, text: option, type: 'default' }
            : { value: option.value, text: option.text, type: option.type });
    }
    reorderOptionsWithNewPayment(options, newPaymentToken) {
        // Move the newly added payment method to the top if token provided
        if (!newPaymentToken) {
            return options;
        }
        return [
            ...options.filter(option => option.value === newPaymentToken),
            ...options.filter(option => option.value !== newPaymentToken)
        ];
    }
    findNewlyAddedOption(options, newPaymentToken) {
        // If we have a new payment token, try to find and select that payment method
        if (!newPaymentToken) {
            return null;
        }
        const newlyAddedOption = options.find(option => (typeof option === 'string' ? option : option.value) === newPaymentToken);
        if (newlyAddedOption) {
            this.devLog('🎯 Found and selecting newly added payment method:', newlyAddedOption);
        }
        else {
            this.devLog('⚠️ Could not find newly added payment method with token:', newPaymentToken);
        }
        return newlyAddedOption;
    }
    updateSelectedOption(selectedOption) {
        this.selectedOption = selectedOption;
        this.selectedPaymentMethod = typeof selectedOption === 'string' ? selectedOption : selectedOption.text;
        // Update selectPayment after a delay to avoid render cycle issues
        setTimeout(() => {
            this.selectPayment = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
        }, 0);
        // Set the payment icon type for the selected option
        this.selectedPaymentIconType = typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default');
    }
    trackAndEmitSelection(selectedOption) {
        // Track selection of payment method after refresh
        this.devLog('🔄 Selecting payment method after refresh, tracking event...');
        trackPaymentSelection(typeof selectedOption === 'string' ? selectedOption : selectedOption.value, typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default'), typeof selectedOption === 'string' ? selectedOption : selectedOption.text);
        this.devLog('✅ Selection event tracked');
        this.selectOption.emit({
            value: typeof selectedOption === 'string' ? selectedOption : selectedOption.value,
            text: typeof selectedOption === 'string' ? selectedOption : selectedOption.text,
            type: typeof selectedOption === 'string' ? 'default' : (selectedOption.type || 'default')
        });
        this.devLog('Selected payment option after refresh:', selectedOption);
    }
    async refreshDropdown(type = 'card', newPaymentToken) {
        this.devLog(`Refreshing dropdown after ${type} addition`, newPaymentToken ? `with new token: ${newPaymentToken}` : '');
        this.showAddNewPayment = false;
        this.showAddBankAccount = false;
        if (!(this.operationsToken && this.userScopedAccessToken)) {
            return;
        }
        this.walletResponse = await trackApiCall('/payment-options-refresh', 'GET', () => fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment));
        this.devLog('Updated payment options:', this.walletResponse?.paymentOptions);
        const paymentOptions = this.walletResponse?.paymentOptions || [];
        let options = this.mapPaymentOptions(paymentOptions);
        // Move the newly added payment method to the top if token provided
        options = this.reorderOptionsWithNewPayment(options, newPaymentToken);
        this.parsedOptions = options;
        // Select the newly added payment method if token provided, otherwise select first option
        if (this.parsedOptions.length === 0) {
            return;
        }
        const newlyAddedOption = this.findNewlyAddedOption(this.parsedOptions, newPaymentToken);
        // Default to first option
        const selectedOption = newlyAddedOption || this.parsedOptions[0];
        this.updateSelectedOption(selectedOption);
        this.trackAndEmitSelection(selectedOption);
    }
    async fetchPaymentOptions() {
        try {
            if (this.operationsToken && this.userScopedAccessToken) {
                this.walletResponse = await fetchPaymentOptions(this.operationsToken, this.userScopedAccessToken, this.paymentType, this.environment);
                this.devLog('Updated payment options:', this.walletResponse?.paymentOptions);
                // Map all options to ensure consistent format
                const parsedOptions = this.walletResponse?.paymentOptions.map(option => typeof option === 'string'
                    ? { value: option, text: option, type: 'default' }
                    : { value: option.value, text: option.text, type: option.type });
                // Update the parsed options
                this.parsedOptions = parsedOptions;
                // If there are payment options, select the first one by default
                if (parsedOptions.length > 0) {
                    const firstOption = parsedOptions[0];
                    this.selectedOption = firstOption;
                    // Use the text property which contains the masked card number
                    this.selectedPaymentMethod = firstOption.text;
                    // Don't modify selectPayment here to avoid render cycle issues
                    // Set the payment icon type for the selected option
                    this.selectedPaymentIconType = firstOption.type || 'default';
                    // Emit the selection event
                    this.selectOption.emit({
                        value: firstOption.value,
                        text: firstOption.text,
                        type: firstOption.type
                    });
                    this.devLog('Auto-selected first payment option:', firstOption);
                }
            }
        }
        catch (error) {
            console.error('Error fetching payment options:', error);
        }
    }
    collapseSection(element) {
        this.devLog('Collapsing Section');
        const sectionHeight = element.scrollHeight;
        const elementTransition = element.style.transition;
        element.style.transition = '';
        requestAnimationFrame(() => {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;
            requestAnimationFrame(() => {
                element.style.height = 0 + 'px';
                element.classList.add('collapsed');
            });
        });
    }
    toggleCollapse(event) {
        const collapseButton = event.currentTarget;
        const collapseWrapper = this.el.shadowRoot.querySelector(`#${collapseButton.dataset.collapsewrapper}`);
        const element = collapseWrapper.querySelector('.collapsible-content');
        // const element = this.el.shadowRoot.querySelector('.collapsible-content') as HTMLElement;
        const collapsed = collapseWrapper.classList.contains('collapsed');
        if (element) {
            if (collapsed) {
                this.expandSection(element);
                collapseWrapper.classList.remove('collapsed');
            }
            else {
                collapseWrapper.classList.add('collapsed');
                this.collapseSection(element);
            }
        }
    }
    expandSection(element) {
        const sectionHeight = element.scrollHeight;
        element.style.height = sectionHeight + 'px';
    }
    isCheckingWithLongNumber(option) {
        const text = typeof option === 'string' ? option : option.text ?? '';
        if (text.toLowerCase().startsWith('checking:')) {
            // Extract everything after "checking:"
            const accountPart = text.replace(/^checking:\s*/, '');
            return accountPart.length > 15;
        }
        return false;
    }
    render() {
        this.devLog('🎨 WalletDropdown render() called');
        this.devLog('Render state:', {
            displayMode: this.displayMode,
            showPaymentSelector: this.showPaymentSelector,
            showAddNewPayment: this.showAddNewPayment,
            showAddBankAccount: this.showAddBankAccount,
            parsedOptionsLength: this.parsedOptions.length,
            selectedOption: this.selectedOption
        });
        // Text-only mode - render just the selected payment method text
        if (this.displayMode === 'text-only') {
            // Default text when no option is selected
            if (!this.selectedOption) {
                return h("div", { class: "wallet-text-only wallet-text-only--empty" }, "Default payment: Not selected");
            }
            // Get the display text from the selected option and format it
            const displayText = typeof this.selectedOption === 'string'
                ? `Default payment: ${this.selectedOption}`
                : `Default payment: ${this.selectedOption.text}`;
            return (h("div", { class: "wallet-text-only" }, displayText));
        }
        // Full mode - render the complete dropdown
        return (h("div", { class: "shared-wallet" }, this.showPaymentSelector && (h("div", { class: "payment-selector", style: {
                maxWidth: this.isCheckingWithLongNumber(this.selectedOption) ? '430px' : '400px',
            } }, h("div", { class: "collapsible-wrapper accordion-item collapsed", id: "picklist" }, h("div", { class: "collapsible-header", "data-collapsewrapper": "picklist", onClick: (event) => this.toggleCollapse(event), "aria-expanded": "false", "aria-controls": "paymentList" }, h("h3", { class: "panel-header text-medium-strong" }, "Choose a Payment Method to Add")), h("div", { class: "collapsible-content", id: "paymentListContainer", style: { height: '0' } }, h("md-filled-button", { class: "button button-secondary button-bold button-thick-border w-100", onClick: this.goToNewPayment }, "Add New Card Account"), this.paymentType !== 'card' && (h("md-filled-button", { class: "button button-secondary button-bold button-thick-border w-100", onClick: this.goToNewBankAccount }, "Add New Bank Account")))))), this.showAddNewPayment && (h("div", { class: "add-payment-container" }, h("add-new-payment", { operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, availableCreditCards: this.walletResponse?.availableCreditCards, onCardAdded: (event) => this.refreshDropdown('card', event.detail) }))), this.showAddBankAccount && (h("div", { class: "add-payment-container" }, h("add-bank-account", { operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, onBankAccountAdded: (event) => this.refreshDropdown('bank', event.detail) })))));
    }
    static get is() { return "wallet-dropdown"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["walletdropdown.module.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["walletdropdown.module.css"]
        };
    }
    static get properties() {
        return {
            "options": {
                "type": "string",
                "attribute": "options",
                "mutable": false,
                "complexType": {
                    "original": "string | string[]",
                    "resolved": "string | string[]",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "[]"
            },
            "operationsToken": {
                "type": "string",
                "attribute": "operations-token",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "''"
            },
            "userScopedAccessToken": {
                "type": "string",
                "attribute": "user-scoped-access-token",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "''"
            },
            "selectPayment": {
                "type": "string",
                "attribute": "select-payment",
                "mutable": true,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "defaultValue": "''"
            },
            "displayMode": {
                "type": "string",
                "attribute": "display-mode",
                "mutable": false,
                "complexType": {
                    "original": "'full' | 'text-only'",
                    "resolved": "\"full\" | \"text-only\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "'full'"
            },
            "paymentType": {
                "type": "string",
                "attribute": "payment-type",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "'all'"
            },
            "environment": {
                "type": "string",
                "attribute": "environment",
                "mutable": false,
                "complexType": {
                    "original": "Environment",
                    "resolved": "Environment.LOCALDEVELOPMENT | Environment.PRODUCTION | Environment.STAGING",
                    "references": {
                        "Environment": {
                            "location": "import",
                            "path": "../../config",
                            "id": "src/config.ts::Environment"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "Environment.PRODUCTION"
            }
        };
    }
    static get states() {
        return {
            "parsedOptions": {},
            "showAddNewPayment": {},
            "showAddBankAccount": {},
            "selectedOption": {},
            "selectedPaymentMethod": {},
            "selectedPaymentDate": {},
            "selectedPaymentIconType": {},
            "showPaymentSelector": {},
            "showPaymentDate": {},
            "walletResponse": {}
        };
    }
    static get events() {
        return [{
                "method": "selectOption",
                "name": "selectOption",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "PaymentOption",
                    "resolved": "PaymentOption",
                    "references": {
                        "PaymentOption": {
                            "location": "local",
                            "path": "C:/Misc/Project_Learning/upp-wallet-ui/src/components/walletdropdown/walletdropdown.tsx",
                            "id": "src/components/walletdropdown/walletdropdown.tsx::PaymentOption"
                        }
                    }
                }
            }];
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "selectPayment",
                "methodName": "handleSelectPaymentChange"
            }];
    }
    static get listeners() {
        return [{
                "name": "cardAdded",
                "method": "handleNewCard",
                "target": undefined,
                "capture": false,
                "passive": false
            }, {
                "name": "bankAccountAdded",
                "method": "handleNewBankAccount",
                "target": undefined,
                "capture": false,
                "passive": false
            }, {
                "name": "updateDate",
                "method": "updateDate",
                "target": "body",
                "capture": false,
                "passive": false
            }, {
                "name": "goToPaymentSelector",
                "method": "goToPaymentSelector",
                "target": "body",
                "capture": false,
                "passive": false
            }];
    }
}
//# sourceMappingURL=walletdropdown.js.map
