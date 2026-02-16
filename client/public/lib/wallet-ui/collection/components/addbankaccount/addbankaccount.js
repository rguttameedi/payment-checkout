import { h } from "@stencil/core";
import { STATES, COUNTRY, CountryAndPhoneCodes } from "../../utils/state";
import { addBankAccount as addBankAccountService } from "../../utils/addBankService";
import { Environment } from "../../config";
import { initWalletEvents, trackAddBankSuccess, trackAddBankError, trackAddBankCancelled, trackValidationError } from "../../utils/walletEvents";
import { AccountStatus, BankAccountType } from "../../interfaces/common";
import { isValidPOBoxAddess } from "../../utils/validations";
import { oscilarService } from "../../utils/oscilarService";
export class AddBankAccount {
    goToPaymentSelector;
    addressValidation;
    errorBannerRef = null;
    // Helper function to conditionally log only in development
    devLog = (message, ...args) => {
        if (this.environment === Environment.LOCALDEVELOPMENT || this.environment === Environment.STAGING) {
            console.log(message, ...args);
        }
    };
    formattedMobileNumber;
    operationsToken;
    userScopedAccessToken;
    environment = Environment.PRODUCTION; // Environment parameter with production default
    bankAccountAdded;
    accountHolderName = '';
    accountNumber = '';
    routingNumber = '';
    bankAccountType = BankAccountType.Checking;
    dateofBirth = '';
    paymentAccountNickname = '';
    firstName = '';
    lastName = '';
    address1 = '';
    address2 = '';
    city = '';
    state = '';
    country = '';
    zipCode = '';
    mobilePhoneNumber = '';
    selectedPhoneCode = '';
    isPhoneCodeDropdownOpen = false;
    emailAddress = '';
    apiErrors = {};
    isLoading = false;
    mfaPopUp = false;
    PaymentAccountRequestPayload;
    mfaResponsePayload;
    brokenRules = [];
    isAddressSuggestion = false;
    isVerifying = false;
    errors = {
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        bankAccountType: '',
        firstName: '',
        lastName: '',
        address1: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        address2: '',
        dateofBirth: '',
        paymentAccountNickname: '',
        mobilePhoneNumber: '',
        emailAddress: '',
        selectedPhoneCode: '',
    };
    isAddressResubmission = false;
    el;
    dropdownWrapper;
    componentWillLoad() {
        // Initialize event tracking
        initWalletEvents('AddBankAccount', this.environment);
    }
    handleInputChange(field, value) {
        this[field] = value;
        // Clear error when user starts typing
        if (this.errors[field]) {
            this.errors = { ...this.errors, [field]: '' };
        }
    }
    handleMobileNumberChange(event) {
        const input = event.target;
        let digits = '';
        if (this.country === 'US') {
            digits = input.value.replace(/\D/g, '').slice(0, 10);
        }
        else {
            digits = input.value.replace(/\D/g, '');
        }
        let formatted = '';
        if (this.country === 'US') {
            if (digits.length > 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            else if (digits.length > 3) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            }
            else if (digits.length > 0) {
                formatted = `(${digits}`;
            }
        }
        else {
            formatted = digits;
        }
        input.value = formatted;
        this.mobilePhoneNumber = formatted;
        if (this.errors[input.id]) {
            this.errors = { ...this.errors, [input.id]: '' };
        }
    }
    showErrorBanner(messages) {
        setTimeout(() => {
            if (messages?.length > 0 && this.errorBannerRef) {
                this.devLog("showErrorBanner");
                const top = this.errorBannerRef.offsetTop;
                this.scrollToView(top);
            }
        }, 300);
    }
    scrollToView(topValue) {
        window.scrollTo({
            top: topValue - 20,
            behavior: 'smooth',
        });
    }
    handleStateChange(event) {
        const target = event.target;
        const selectedState = STATES(this.country).find(state => state.code === target.value);
        if (selectedState) {
            this.state = selectedState.code;
            // Clear state error when valid state is selected
            this.errors = { ...this.errors, state: '' };
        }
        else {
            // Handle case when user goes back to "Select state/province" (empty value)
            this.state = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, state: '' };
        }
    }
    isCountryUS() {
        return this.country === 'US';
    }
    isCountryUSorCanada() {
        return this.country === 'US' || this.country === 'CA';
    }
    getProvinceOrStateCode() {
        // If country is US or Canada, use the state value from picklist
        // For all other countries, pass an empty value
        return (this.country === 'US' || this.country === 'CA') ? this.state : '';
    }
    getDefaultState() {
        // below LIne is commented as part of SonarQube improvements
        //return this.isCountryUSorCanada() ? '' : '';
        return '';
    }
    handleCountryChange(event) {
        const target = event.target;
        const selectedCountry = COUNTRY.find(country => country.code === target.value);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            // Clear country & phoneCode error (provided that for selected country phone code has to be there)when valid country is selected
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            // Reset state when country changes
            this.state = '';
            if (this.country === 'US') {
                this.mobilePhoneNumber = '';
                this.selectedPhoneCode = '';
            }
            if (this.country !== 'US') {
                const phoneCodeMap = new Map(CountryAndPhoneCodes.map(c => [c.Id, c.PhoneCode]));
                this.selectedPhoneCode = phoneCodeMap.get(this.country) || '';
                this.mobilePhoneNumber = '';
            }
        }
        else {
            // Handle case when user goes back to "Select country" (empty value)
            this.country = '';
            this.selectedPhoneCode = '';
            // Clear the error to allow validation to trigger again on form submit
            this.errors = { ...this.errors, country: '', selectedPhoneCode: '', };
            this.state = '';
        }
    }
    handlePhoneCodeChange(event) {
        const target = event.target;
        if (this.errors[target.id]) {
            this.errors = { ...this.errors, [target.id]: '' };
        }
        this.selectedPhoneCode = target.value;
    }
    handleBirthDateChange(value) {
        const numericValue = value.replace(/\D/g, "");
        // Format the date with slash after 2 digits
        let formattedValue = "";
        if (numericValue.length > 0) {
            formattedValue += numericValue.slice(0, 2);
            if (numericValue.length > 2) {
                formattedValue += "/" + numericValue.slice(2, 4);
                if (numericValue.length > 4) {
                    formattedValue += "/" + numericValue.slice(4, 8);
                }
            }
        }
        this.dateofBirth = formattedValue;
        // Clear error when user starts typing
        if (this.errors.dateofBirth) {
            this.errors = { ...this.errors, dateofBirth: '' };
        }
    }
    validateMobilePhoneNumber() {
        const errors = {};
        const phone = this.mobilePhoneNumber.trim();
        // Mobile Phone Number is now optional - only validate if provided
        if (phone.length === 0) {
            return errors; // No error if empty
        }
        let pattern;
        if (this.country === 'US') {
            pattern = /^\([1-9]\d{2}\)\s?\d{3}-\d{4}$/g;
        }
        else {
            pattern = /^\d*$/g;
        }
        if (!pattern.test(phone)) {
            errors.mobilePhoneNumber = 'Invalid Mobile Phone Number';
        }
        return errors;
    }
    validateEmailAddress() {
        const errors = {};
        // Email is now optional - only validate if provided
        if (!this.emailAddress.trim()) {
            return errors; // No error if empty
        }
        if (this.emailAddress.trim().length > 60) {
            errors.emailAddress = 'E-Mail Address must not exceed 60 characters.';
        }
        else {
            const re = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})$/;
            if (!re.test(this.emailAddress.trim())) {
                errors.emailAddress = 'Please enter a valid E-Mail Address.';
            }
        }
        return errors;
    }
    validateSelectedPhoneCode() {
        const errors = {};
        // Phone code is now optional - only validate if mobile phone number is provided
        // If user enters a phone number, they should also select the country code
        if (this.mobilePhoneNumber.trim().length > 0 && !this.isCountryUS() && !this.selectedPhoneCode.trim()) {
            errors.selectedPhoneCode = 'Country Code is required when phone number is provided';
        }
        return errors;
    }
    togglePhoneCodeDropdown = (event) => {
        event.stopPropagation();
        this.isPhoneCodeDropdownOpen = !this.isPhoneCodeDropdownOpen;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        if (this.isPhoneCodeDropdownOpen) {
            document.addEventListener('click', this.handleOutsideClick);
            document.addEventListener('keydown', this.handleEscapePress);
        }
        else {
            this.removeDropdownListeners();
        }
    };
    selectPhoneCode = (code) => {
        this.selectedPhoneCode = code;
        this.isPhoneCodeDropdownOpen = false;
        this.errors = { ...this.errors, selectedPhoneCode: '' };
        this.removeDropdownListeners();
    };
    handleOutsideClick = (event) => {
        if (this.dropdownWrapper && !this.dropdownWrapper.contains(event.target)) {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    handleEscapePress = (event) => {
        if (event.key === 'Escape') {
            this.isPhoneCodeDropdownOpen = false;
            this.removeDropdownListeners();
        }
    };
    removeDropdownListeners() {
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapePress);
    }
    ;
    handleClosePopup = () => {
        this.mfaPopUp = false;
    };
    handleMfaError(messages) {
        if (messages?.length > 0) {
            this.brokenRules = [messages[0]];
            this.showErrorBanner(messages);
        }
    }
    validateAccountFields() {
        const errors = {};
        if (!this.accountHolderName.trim()) {
            errors.accountHolderName = 'Account Holder Name is required.';
        }
        if (!this.accountNumber.trim()) {
            errors.accountNumber = 'Account Number is required.';
        }
        else if (!/^\d+$/.test(this.accountNumber)) {
            errors.accountNumber = 'Account Number must contain only numbers.';
        }
        if (!this.routingNumber.trim()) {
            errors.routingNumber = 'Routing Number is required.';
        }
        else if (!/^\d{9}$/.test(this.routingNumber)) {
            errors.routingNumber = 'Routing Number must be 9 digits.';
        }
        return errors;
    }
    validatePersonalFields() {
        const errors = {};
        // First Name and Last Name are now OPTIONAL for tokenization
        // Only Account Holder Name, Account Number, and Routing Number are required
        // if (!this.firstName.trim()) {
        //   errors.firstName = 'First Name is required.';
        // }
        // if (!this.lastName.trim()) {
        //   errors.lastName = 'Last Name is required.';
        // }
        // Payment Account Nickname is now optional
        // if (!this.paymentAccountNickname.trim()) {
        //   errors.paymentAccountNickname = 'Payment Account Nickname is required.';
        // }
        return errors;
    }
    validateDateOfBirth() {
        const errors = {};
        // Date of Birth is now optional - only validate if provided
        if (!this.dateofBirth.trim()) {
            return errors; // No error if empty
        }
        const re = /^(0[1-9]|1[012])[- /.](0[1-9]|[12]\d|3[01])[- /.](19|20)\d\d$/g;
        if (!re.test(this.dateofBirth)) {
            errors.dateofBirth = 'Please enter a valid date in MM/DD/YYYY format.';
            return errors;
        }
        const enteredDate = new Date(this.dateofBirth);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
        if (enteredDate > minAgeDate) {
            errors.dateofBirth = 'Must be at least 18 years of age.';
        }
        return errors;
    }
    validateAddressFields() {
        const errors = {};
        // ALL ADDRESS FIELDS ARE NOW OPTIONAL FOR TOKENIZATION
        // Only validate format if values are provided
        // Address Line 1 - optional, but validate PO Box if provided
        if (this.address1.trim().length > 0 && isValidPOBoxAddess(this.address1)) {
            errors.address1 = 'PO Boxes are not allowed. Please enter a valid Address Line 1.';
        }
        // Address Line 2 - optional, but validate PO Box if provided
        if (this.address2.trim().length > 0 && isValidPOBoxAddess(this.address2)) {
            errors.address2 = 'PO Boxes are not allowed. Please enter a valid Address Line 2.';
        }
        // City - now optional
        // if (!this.city.trim()) {
        //   errors.city = 'City is required.';
        // }
        // State - now optional
        // if (this.isCountryUSorCanada() && !this.state.trim()) {
        //   errors.state = 'State is required.';
        // }
        // Country - now optional
        // if (!this.country.trim()) {
        //   errors.country = 'Country is required.';
        // }
        // Zip Code - now optional
        // if (!this.zipCode.trim()) {
        //   errors.zipCode = 'ZIP/Postal Code is required.';
        // }
        return errors;
    }
    validate() {
        this.isLoading = true;
        const newErrors = {
            accountHolderName: '',
            accountNumber: '',
            routingNumber: '',
            bankAccountType: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
            ...this.validateAccountFields(),
            ...this.validatePersonalFields(),
            ...this.validateDateOfBirth(),
            ...this.validateAddressFields(),
            ...this.validateMobilePhoneNumber(),
            ...this.validateEmailAddress(),
            ...this.validateSelectedPhoneCode(),
        };
        this.errors = newErrors;
        const errorMessages = Object.values(newErrors).filter(error => error !== '');
        if (errorMessages.length > 0) {
            trackValidationError('bank', errorMessages);
        }
        this.scrollToFirstError();
        return !Object.values(newErrors).some(error => error !== '');
    }
    scrollToFirstError() {
        // Wait for the next frame to ensure the DOM has updated
        requestAnimationFrame(() => {
            // Search the entire document for error elements
            const errorElement = this.el.querySelector('.validation-error');
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    async handleSubmit(event) {
        event.preventDefault();
        this.apiErrors = {}; // Clear previous API errors
        this.brokenRules = [];
        this.isVerifying = true;
        this.isLoading = true;
        if (!this.validate()) {
            this.isLoading = false;
            this.isVerifying = false;
            return;
        }
        this.formattedMobileNumber = this.selectedPhoneCode
            ? '+' + this.selectedPhoneCode.trim() + this.mobilePhoneNumber.trim()
            : this.mobilePhoneNumber;
        try {
            const payload = {
                walletOwnerIdentifiers: {
                    customer: {
                        customerInformation: {
                            firstName: this.firstName,
                            lastName: this.lastName
                        }
                    }
                },
                accountReferenceId: `bank-${Date.now()}`,
                accountNumber: this.accountNumber,
                payorInformation: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    paymentAccountNickname: this.paymentAccountNickname,
                    validateAddress: !this.isAddressResubmission, // true for first submission, false for resubmission
                    dateofBirth: this.formatDateForAPI(this.dateofBirth), // Format as YYYY-MM-DD
                    contactInformation: {
                        emailAddress: this.emailAddress, // Add fallback for missing properties
                        phoneNumber: this.formattedMobileNumber,
                    },
                    identityVerificationInformation: null
                },
                billingAddress: {
                    addressLine1: this.address1,
                    addressLine2: this.address2 || '',
                    city: this.city,
                    provinceOrStateCode: this.getProvinceOrStateCode(),
                    countryCode: this.country || 'US',
                    postalCode: this.zipCode,
                },
                routingNumber: this.routingNumber,
                bankAccountType: this.bankAccountType,
            };
            this.PaymentAccountRequestPayload = payload;
            // Commit device data to Oscilar before making the API call
            oscilarService.commit();
            const response = await addBankAccountService(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            if (response.success && response?.data?.paymentInstrument?.paymentInstrumentToken) {
                this.handleSuccess(response);
            }
            else if (response.success && response?.data?.AccountStatus) {
                if (response?.data?.AccountStatus === AccountStatus.AddressSuggested) {
                    this.isAddressSuggestion = true;
                }
                else {
                    this.isAddressSuggestion = false;
                }
                // Initialize brokenRules to empty array if not present
                this.brokenRules = response?.data?.BrokenRules || [];
                if (this.brokenRules.length > 0) {
                    this.devLog("response.success");
                    this.showErrorBanner(this.brokenRules);
                }
                const status = response?.data?.AccountStatus;
                switch (status) {
                    case AccountStatus.AddressSuggested:
                        this.handleAddressValidation(response);
                        break;
                    case AccountStatus.MFAPending:
                        this.mfaPopUp = true;
                        this.mfaResponsePayload = response;
                        break;
                    case AccountStatus.AddressValidationError:
                    case AccountStatus.AddressValidationUnknownStatus:
                        this.handleValidationError(response);
                        break;
                    case AccountStatus.Saved:
                        this.handleSuccess(response);
                        break;
                    default:
                        this.handleUnknownError(response);
                        break;
                }
            }
            else {
                this.handleResponseError(response);
            }
        }
        catch (error) {
            this.isLoading = false;
            // Track unexpected error
            trackAddBankError(error.message || 'Unexpected error occurred');
            // Handle unexpected errors
            console.error('Error in handleSubmit:', error);
            this.apiErrors = {
                General: [error.message || 'An unexpected error occurred. Please try again.']
            };
        }
        finally {
            this.isVerifying = false;
            this.isLoading = false;
        }
    }
    formatDateForAPI(dateString) {
        if (!dateString || dateString.trim() === '') {
            return '';
        }
        // Parse MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length !== 3) {
            return dateString; // Return original if not in expected format
        }
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        // Return in YYYY-MM-DD format
        return `${year}-${month}-${day}`;
    }
    handleSuccess(response) {
        trackAddBankSuccess({
            bankAccountType: this.bankAccountType,
            routingNumber: this.routingNumber.slice(-4), // Last 4 digits only
            accountNumber: this.accountNumber.slice(-4) // Last 4 digits only
        });
        // If no errors, emit the success event with the payment instrument token
        const paymentInstrumentToken = response.data.paymentInstrument?.paymentInstrumentToken;
        this.devLog('Emitting bank account payment instrument token:', paymentInstrumentToken);
        this.devLog('Full response:', response);
        this.bankAccountAdded.emit(paymentInstrumentToken);
        this.resetForm();
    }
    handleResponseError(response) {
        // Track bank account addition error
        const errorMessage = response.message || 'Bank Account addition failed';
        trackAddBankError(errorMessage);
        // Capture API errors and display them in the UI
        if (response.errors) {
            // Track API validation errors
            trackValidationError('bank', response.errors);
            this.apiErrors = response.errors.reduce((acc, error) => {
                acc.General = acc.General || [];
                acc.General.push(error);
                return acc;
            }, {});
        }
        else if (response.message) {
            // Track single API validation error
            trackValidationError('bank', [response.message]);
            this.apiErrors = { General: [response.message] };
        }
    }
    applySuggested(countryCode, stateCode) {
        const selectedCountry = COUNTRY.find(country => country.code === countryCode);
        if (selectedCountry) {
            this.country = selectedCountry.code;
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        else {
            this.country = '';
            this.errors = { ...this.errors, country: '' };
            this.state = '';
        }
        if (this.isCountryUSorCanada()) {
            const stateExists = STATES(this.country).some(s => s.code === stateCode);
            if (stateExists)
                this.state = stateCode;
        }
        this.devLog('Applied suggested address:', { countryCode, stateCode });
    }
    handleUnknownError(response) {
        // Set default message if no broken rules exist
        if (!response?.data?.BrokenRules?.length) {
            response.data = {
                ...response.data,
                BrokenRules: ['Payment Method addition failed']
            };
        }
        let errorMessage = response.data.BrokenRules[0];
        this.brokenRules = response.data.BrokenRules;
        this.showErrorBanner(this.brokenRules);
        trackAddBankError('Unknown Error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('Event emitted:', {
            message: errorMessage,
            UnKnown: AccountStatus[response?.data?.AccountStatus]
        });
    }
    handleAddressValidation(response) {
        this.address1 = response.data.SuggestedAddresses[0].AddressLine1;
        this.address2 = response.data.SuggestedAddresses[0].AddressLine2;
        this.city = response.data.SuggestedAddresses[0].City;
        this.zipCode = response.data.SuggestedAddresses[0].PostalCode;
        this.applySuggested(response.data.SuggestedAddresses[0].CountryCode, response.data.SuggestedAddresses[0].ProvinceOrStateCode);
        this.isAddressResubmission = true;
        const addressUpdatedMessage = response?.data?.BrokenRules?.[0] ||
            "Address updated. Please review and confirm the changes before submitting.";
        this.addressValidation.emit(addressUpdatedMessage);
        this.devLog('Address updated event emitted:', {
            message: addressUpdatedMessage,
            AddressValidation: AccountStatus[AccountStatus.AddressSuggested]
        });
    }
    handleValidationError(response) {
        let errorMessage = response?.data?.BrokenRules?.[0];
        if (response?.data?.AccountStatus === AccountStatus.AddressValidationError) {
            errorMessage = errorMessage || "Address provided could not be validated. Please update the provided address and resubmit.";
        }
        else if (response?.data?.AccountStatus === AccountStatus.AddressValidationUnknownStatus) {
            errorMessage = errorMessage || "Address could not be validated. Please update and resubmit.";
        }
        else {
            errorMessage = errorMessage || "Payment method addition failed.";
        }
        this.isAddressResubmission = true;
        trackAddBankError('Address validation error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('addressValidation event emitted:', {
            message: errorMessage,
            AddressValidation: AccountStatus[response?.data?.AccountStatus]
        });
    }
    resetForm() {
        this.accountHolderName = '';
        this.accountNumber = '';
        this.routingNumber = '';
        this.bankAccountType = BankAccountType.Checking;
        this.firstName = '';
        this.lastName = '';
        this.address1 = '';
        this.address2 = '';
        this.city = '';
        this.state = '';
        this.country = 'US';
        this.zipCode = '';
        this.address2 = '';
        this.dateofBirth = '';
        this.paymentAccountNickname = '';
        this.mobilePhoneNumber = '';
        this.emailAddress = '';
        this.selectedPhoneCode = '';
        this.errors = {
            accountHolderName: '',
            accountNumber: '',
            routingNumber: '',
            bankAccountType: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
        };
    }
    goToWallet = () => {
        // Track bank account addition cancellation
        trackAddBankCancelled();
        this.goToPaymentSelector.emit(true);
    };
    handleCloseBanner = () => {
        this.brokenRules = [];
    };
    renderErrorBanner() {
        if (!this.brokenRules.length)
            return null;
        return (h("div", { ref: el => this.errorBannerRef = el, class: `${this.isAddressSuggestion ? 'addressVerification-message-warning-info' : 'addressVerification-message-error-info'}` }, h("div", { class: "addressVerification-message-notice-body" }, h("div", { class: "addressVerification-message-warning-content" }, this.brokenRules[0])), h("button", { class: "addressVerification-close-btn", type: "button", "aria-label": "Close", onClick: this.handleCloseBanner }, "\u00D7")));
    }
    renderAccountFields() {
        return (h("div", { class: "wallet-row" }, h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, h("label", { htmlFor: "account-holder-name", class: this.errors.accountHolderName ? 'validation-error' : '' }, "Account Holder Name ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "account-holder-name", autoComplete: "cc-given-name", placeholder: "Enter Account Holder Name", value: this.accountHolderName, onInput: (event) => this.handleInputChange('accountHolderName', event.target.value) }), this.errors.accountHolderName && h("span", { class: "error" }, this.errors.accountHolderName)), h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, h("label", { htmlFor: "account-number", class: this.errors.accountNumber ? 'validation-error' : '' }, "Account Number ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "account-number", placeholder: "Enter Account Number", value: this.accountNumber, onInput: (event) => this.handleInputChange('accountNumber', event.target.value) }), this.errors.accountNumber && h("span", { class: "error" }, this.errors.accountNumber)), h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, h("label", { htmlFor: "routing-number", class: this.errors.routingNumber ? 'validation-error' : '' }, "Routing Number ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "routing-number", placeholder: "Enter Routing Number", value: this.routingNumber, onInput: (event) => this.handleInputChange('routingNumber', event.target.value) }), this.errors.routingNumber && h("span", { class: "error" }, this.errors.routingNumber)), h("div", { class: "wallet-col-md-6 wallet-col-lg-3" }, h("label", { htmlFor: "account-type", class: this.errors.bankAccountType ? 'validation-error' : '' }, "Account Type "), h("div", { class: "bank-account-type", role: "radiogroup", "aria-labelledby": "account-type" }, h("label", { class: "custom-radio" }, h("input", { type: "radio", name: "account-type", checked: this.bankAccountType === BankAccountType.Checking, onChange: () => this.handleInputChange('bankAccountType', BankAccountType.Checking) }), ' ', "Checking"), h("label", { class: "custom-radio" }, h("input", { type: "radio", name: "account-type", checked: this.bankAccountType === BankAccountType.Savings, onChange: () => this.handleInputChange('bankAccountType', BankAccountType.Savings) }), ' ', "Savings")), this.errors.bankAccountType && h("span", { class: "error" }, this.errors.bankAccountType))));
    }
    renderPersonalInfo() {
        return (h("div", { class: "wallet-row" }, h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "first-name", class: this.errors.firstName ? 'validation-error' : '' }, "First Name (Optional)"), h("input", { type: "text", id: "first-name", autoComplete: "cc-given-name", placeholder: "Enter First Name", value: this.firstName, onInput: (event) => this.handleInputChange('firstName', event.target.value) }), this.errors.firstName && h("span", { class: "error" }, this.errors.firstName)), h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "last-name", class: this.errors.lastName ? 'validation-error' : '' }, "Last Name (Optional)"), h("input", { type: "text", id: "last-name", autoComplete: "cc-family-name", placeholder: "Enter Last Name", value: this.lastName, onInput: (event) => this.handleInputChange('lastName', event.target.value) }), this.errors.lastName && h("span", { class: "error" }, this.errors.lastName)), h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "Nick-name", class: this.errors.paymentAccountNickname ? 'validation-error' : '' }, "Payment Account Nickname (Optional)"), h("input", { type: "text", id: "Nick-name", placeholder: "Enter Payment Account Nickname", value: this.paymentAccountNickname, onInput: (event) => this.handleInputChange('paymentAccountNickname', event.target.value) }), this.errors.paymentAccountNickname && h("span", { class: "error" }, this.errors.paymentAccountNickname))));
    }
    renderAddressSection() {
        return (h(h.Fragment, null, h("div", { class: "wallet-row" }, h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, h("label", { htmlFor: "address1", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 1 (Optional)"), h("input", { type: "text", id: "address1", autoComplete: "address-line1", placeholder: "Enter Address Line 1", value: this.address1, onInput: (event) => this.handleInputChange('address1', event.target.value) }), this.errors.address1 && h("span", { class: "error" }, this.errors.address1)), h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, h("label", { htmlFor: "address2" }, "Address Line 2 (Optional)"), h("input", { type: "text", id: "address2", autoComplete: "address-line2", placeholder: "Apt, suite, unit, etc. (optional)", value: this.address2, onInput: (event) => this.handleInputChange('address2', event.target.value) }), this.errors.address2 && h("span", { class: "error" }, this.errors.address2)), h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, h("label", { htmlFor: "city", class: this.errors.city ? 'validation-error' : '' }, "City (Optional)"), h("input", { type: "text", id: "city", autoComplete: "address-level2", placeholder: "Enter City", value: this.city, onInput: (event) => this.handleInputChange('city', event.target.value) }), this.errors.city && h("span", { class: "error" }, this.errors.city))), h("div", { class: "wallet-row" }, h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, h("label", { htmlFor: "country", class: this.errors.country ? 'validation-error' : '' }, "Country (Optional)"), h("select", { id: "country", autoComplete: "country", onInput: (event) => this.handleCountryChange(event) }, h("option", { value: "" }, "Select Country"), COUNTRY.map(country => (h("option", { key: country.code, value: country.code }, country.name)))), this.errors.country && h("span", { class: "error" }, this.errors.country)), (this.country === 'US' || this.country === 'CA') && (h("div", { class: "wallet-col-md-6 wallet-col-lg-4" }, h("label", { htmlFor: "state", class: this.errors.state ? 'validation-error' : '' }, "State/Province (Optional)"), h("select", { id: "state", autoComplete: "address-level1", onInput: (event) => this.handleStateChange(event) }, h("option", { value: "" }, "Select ", this.country === 'US' ? 'State' : 'Province'), STATES(this.country).map(state => (h("option", { key: state.code, value: state.code }, state.name)))), this.errors.state && h("span", { class: "error" }, this.errors.state))), h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, h("label", { htmlFor: "zip-code", class: this.errors.zipCode ? 'validation-error' : '' }, "ZIP/Postal Code (Optional)"), h("input", { type: "text", id: "zip-code", autoComplete: "postal-code", placeholder: "Enter ZIP/Postal Code", value: this.zipCode, onInput: (event) => this.handleInputChange('zipCode', event.target.value) }), this.errors.zipCode && h("span", { class: "error" }, this.errors.zipCode)), h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "emailAddress", class: this.errors.emailAddress ? 'validation-error' : '' }, "E-Mail Address (Optional)"), h("input", { type: "text", id: "emailAddress", placeholder: "Enter E-Mail Address", value: this.emailAddress, onInput: event => this.handleInputChange('emailAddress', event.target.value) }), this.errors.emailAddress && h("span", { class: "error" }, this.errors.emailAddress)), h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "mobilePhoneNumber", class: this.errors.mobilePhoneNumber ? 'validation-error' : '' }, "Mobile Phone Number (Optional)"), this.country === 'US' ? (h("div", { class: "field-stack single-field" }, h("div", { class: "input-wrapper" }, h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 14, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && h("span", { class: "error" }, this.errors.mobilePhoneNumber)))) : (h("div", { class: "field-stack dual-field" }, h("div", { class: "input-wrapper" }, h("div", { class: "dropdown-wrapper", ref: el => (this.dropdownWrapper = el) }, h("button", { type: "button", class: "dropdown-header", onClick: this.togglePhoneCodeDropdown, "aria-haspopup": "listbox", "aria-expanded": this.isPhoneCodeDropdownOpen }, "+", this.selectedPhoneCode || ' '), this.isPhoneCodeDropdownOpen && (h("ul", { class: "dropdown-list" }, CountryAndPhoneCodes.map(country => (h("li", { class: "dropdown-item" }, h("button", { type: "button", class: "dropdown-button", onClick: () => this.selectPhoneCode(country.PhoneCode) }, h("div", { class: "dropdown-content" }, h("span", null, country.Description?.toLowerCase()), h("span", null, "+", country.PhoneCode))))))))), this.errors.selectedPhoneCode && h("span", { class: "error" }, this.errors.selectedPhoneCode)), h("div", { class: "input-wrapper" }, h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 20, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && h("span", { class: "error" }, this.errors.mobilePhoneNumber))))), h("div", { class: `wallet-col-md-6 ${this.isCountryUS() ? 'wallet-col-lg-4' : ''}` }, h("label", { htmlFor: "Date-of-Birth", class: this.errors.dateofBirth ? 'validation-error' : '' }, "Date of Birth (Optional)"), h("date-picker", { id: "Date-of-Birth", placeholder: "MM/DD/YYYY", minAge: 18, value: this.dateofBirth, onDateChange: (e) => this.handleBirthDateChange(e.detail) }), this.errors.dateofBirth && h("span", { class: "error" }, this.errors.dateofBirth)))));
    }
    renderApiErrors() {
        if (!Object.keys(this.apiErrors).length)
            return null;
        return (h("div", { class: "api-errors" }, h("div", { class: "error-content" }, h("h5", null, "Error Message:"), h("ul", null, Object.entries(this.apiErrors).map(([field, messages]) => messages.map((msg, idx) => (h("li", { key: `${field}-${idx}` }, h("strong", null, field === 'General' ? '' : `${field}: `), msg))))))));
    }
    renderFormActions() {
        return (h("div", { class: "wallet-col-12 footer" }, h("md-filled-button", { class: "button button-secondary", onClick: this.goToWallet }, "Cancel"), this.isLoading ? (h("md-filled-button", { class: "button button-primary", type: "button" }, h("span", null, "Adding Account\u00A0", h("span", { class: "dot-flashing" })))) : (h("md-filled-button", { class: "button button-primary", disabled: this.isVerifying, "data-loading": this.isVerifying ? 'true' : 'false' }, this.isVerifying ? 'Verifying...' : 'Add Account'))));
    }
    render() {
        return (h("div", { key: '7652ac164fcae44a2fd1cade8b895a6685985515', class: "add-bank-account" }, h("h3", { key: 'ff0ee5fe3a1b5ff295d27b181a7ace53453026f1' }, "Add Bank Account"), this.mfaPopUp && (h("mfa-model-popup", { key: 'd4af72be33e799397149879cc24d96af298d27ba', operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, addRequestPayload: this.PaymentAccountRequestPayload, requestType: "bank", initialMfaResponse: this.mfaResponsePayload, onClose: this.handleClosePopup, errorHandler: (messages) => this.handleMfaError(messages), onSuccessEvent: (event) => this.handleSuccess(event.detail) })), h("form", { key: 'e9e6f10357fd5ef8efe5229c2d602e109bb7b503', onSubmit: (event) => this.handleSubmit(event) }, this.renderErrorBanner(), this.renderAccountFields(), h("h4", { key: '756ca741f3568befa82aeffbd16272bc9c07152d' }, "Account Holder Information"), this.renderPersonalInfo(), h("h4", { key: '421d78781ff781d312aca709a1b22a431e9ab791' }, "Billing Address"), this.renderAddressSection(), this.renderApiErrors(), this.renderFormActions())));
    }
    static get is() { return "add-bank-account"; }
    static get originalStyleUrls() {
        return {
            "$": ["addbankaccount.module.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["addbankaccount.module.css"]
        };
    }
    static get properties() {
        return {
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
                "reflect": false
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
                "reflect": false
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
            "accountHolderName": {},
            "accountNumber": {},
            "routingNumber": {},
            "bankAccountType": {},
            "dateofBirth": {},
            "paymentAccountNickname": {},
            "firstName": {},
            "lastName": {},
            "address1": {},
            "address2": {},
            "city": {},
            "state": {},
            "country": {},
            "zipCode": {},
            "mobilePhoneNumber": {},
            "selectedPhoneCode": {},
            "isPhoneCodeDropdownOpen": {},
            "emailAddress": {},
            "apiErrors": {},
            "isLoading": {},
            "mfaPopUp": {},
            "PaymentAccountRequestPayload": {},
            "mfaResponsePayload": {},
            "brokenRules": {},
            "isAddressSuggestion": {},
            "isVerifying": {},
            "errors": {},
            "isAddressResubmission": {}
        };
    }
    static get events() {
        return [{
                "method": "goToPaymentSelector",
                "name": "goToPaymentSelector",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                }
            }, {
                "method": "addressValidation",
                "name": "addressValidation",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }, {
                "method": "bankAccountAdded",
                "name": "bankAccountAdded",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }];
    }
    static get elementRef() { return "el"; }
}
//# sourceMappingURL=addbankaccount.js.map
