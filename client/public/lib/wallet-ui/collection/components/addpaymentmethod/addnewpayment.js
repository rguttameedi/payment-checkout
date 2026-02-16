import { h } from "@stencil/core";
import { STATES, COUNTRY, CountryAndPhoneCodes } from "../../utils/state";
import { addCard } from "../../utils/addCardService";
import { Environment } from "../../config";
import { oscilarService } from "../../utils/oscilarService";
import { initWalletEvents, trackAddPaymentSuccess, trackAddPaymentError, trackAddPaymentCancelled, trackValidationError } from "../../utils/walletEvents";
import { AccountStatus, AddressType, CardType } from "../../interfaces/common";
import { isValidPOBoxAddess } from "../../utils/validations";
// Material Design components imported at parent level (wallet-dropdown) to prevent duplicate registration
export class AddNewPayment {
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
    showAddNewPayment = false;
    showPaymentSelector = true;
    operationsToken;
    userScopedAccessToken;
    environment = Environment.PRODUCTION; // Environment parameter with production default
    availableCreditCards;
    cardAdded;
    nameOnCard = '';
    cardNumber = '';
    expiryDate = '';
    cvv = '';
    cardType = '';
    address2 = '';
    dateofBirth = '';
    paymentAccountNickname = '';
    firstName = '';
    lastName = '';
    address1 = '';
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
    addCardRequestPayload;
    mfaResponsePayload;
    isAddressSuggestion = false;
    brokenRules = [];
    errors = {
        nameOnCard: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
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
        initWalletEvents('AddNewPayment', this.environment);
    }
    detectCardType(number) {
        if (/^4/.test(number))
            return CardType.VISA;
        // Mastercard: 5[1-5] (traditional) or 2221-2720 (new range)
        if (/^5[1-5]/.test(number) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[0-1]\d|720)/.test(number))
            return CardType.MASTERCARD;
        if (/^3[47]/.test(number))
            return CardType.AMEX;
        if (/^6011/.test(number) ||
            /^65\d{2}/.test(number) ||
            /^64[4-9]\d/.test(number) ||
            /^622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[0-1]\d|92[0-5])/.test(number))
            return CardType.DISCOVER;
        if (/^3(0[0-5]|[68]|9)/.test(number))
            return CardType.DINERS;
        if (/^35(2[89]|[3-8]\d)/.test(number))
            return CardType.JCB;
        if (/^62[013-9]/.test(number) || /^628[0-8]/.test(number) || /^81[0-7]/.test(number))
            return CardType.UNIONPAY;
        return '';
    }
    formatCardNumber(value) {
        const rawValue = value.replace(/\D/g, '');
        let formattedValue = rawValue;
        if (this.cardType === CardType.AMEX) {
            formattedValue = rawValue.replace(/(\d{4})(\d{6})?(\d{5})?/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
        }
        else if (this.cardType === CardType.DINERS && formattedValue.length <= 14) {
            formattedValue = rawValue.replace(/(\d{4})(\d{6})?(\d{4})?/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
        }
        else {
            formattedValue = rawValue.replace(/(\d{4})(\d{4})?(\d{4})?(\d{4})?/, (_, g1, g2, g3, g4) => [g1, g2, g3, g4].filter(Boolean).join(' '));
        }
        return formattedValue;
    }
    mapCardTypeToAvailableCC(cardType) {
        const cardTypeMapping = {
            [CardType.VISA]: 'Visa',
            [CardType.MASTERCARD]: 'Mastercard',
            [CardType.AMEX]: 'American_Express',
            [CardType.DISCOVER]: 'Discover',
            [CardType.DINERS]: 'Diners_Club',
            [CardType.JCB]: 'JCB'
        };
        return cardTypeMapping[cardType] || cardType;
    }
    validateCardTypeSupported() {
        const errors = {};
        // Only validate if availableCreditCards is provided and cardType is detected
        if (!this.availableCreditCards || !this.cardType) {
            return errors;
        }
        if (this.availableCreditCards.length === 0) {
            errors.cardNumber = `${this.cardType} cards are not allowed.`;
            return errors;
        }
        // Map detected card type to backend format
        const CardType = this.mapCardTypeToAvailableCC(this.cardType);
        // Check if the mapped card type is in the available list
        const isCardTypeSupported = this.availableCreditCards.some(card => card.name === CardType);
        if (!isCardTypeSupported) {
            errors.cardNumber = `${this.cardType} cards are not allowed.`;
        }
        return errors;
    }
    getExpectedCardLength() {
        const lengthMap = {
            [CardType.VISA]: [13, 16, 19],
            [CardType.MASTERCARD]: 16,
            [CardType.AMEX]: 15,
            [CardType.DISCOVER]: 16,
            [CardType.DINERS]: [14, 16],
            [CardType.JCB]: [16, 17, 18, 19],
            [CardType.UNIONPAY]: [16, 17, 18, 19]
        };
        return lengthMap[this.cardType] || 16;
    }
    isValidCardLength(cardLength) {
        const expectedLength = this.getExpectedCardLength();
        if (Array.isArray(expectedLength)) {
            return expectedLength.includes(cardLength);
        }
        return cardLength === expectedLength;
    }
    handleCardNumberChange(value) {
        const rawValue = value.replace(/\D/g, '');
        this.cardNumber = this.formatCardNumber(value);
        this.cardType = this.detectCardType(rawValue);
        if (this.errors.cardNumber) {
            this.errors = { ...this.errors, cardNumber: '' };
        }
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
    handleExpiryDateKeyDown(event) {
        const target = event.target;
        const cursorPosition = target.selectionStart || 0;
        // Handle backspace for better navigation
        if (event.key === 'Backspace') {
            // If cursor is right after the slash (position 3) and we're deleting
            // move cursor to before the slash to allow editing the month
            if (cursorPosition === 3 && target.value.charAt(2) === '/') {
                event.preventDefault();
                const newValue = target.value.slice(0, 2);
                this.expiryDate = newValue;
                target.value = newValue;
                // Set cursor position to end of month
                setTimeout(() => {
                    target.setSelectionRange(2, 2);
                }, 0);
                return;
            }
        }
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
    handleExpiryDateChange(event) {
        const target = event.target;
        const value = target.value.replace(/\D/g, ''); // Remove non-digit characters
        // Format the date with slash after 2 digits
        let formattedValue = '';
        if (value.length > 0) {
            formattedValue = value.slice(0, 2);
            if (value.length >= 2) {
                formattedValue += '/' + value.slice(2);
            }
            // Limit to 4 digits total (MM/YY)
            formattedValue = formattedValue.slice(0, 5);
        }
        this.expiryDate = formattedValue;
        target.value = formattedValue;
        // Clear error when user starts typing
        if (this.errors.expiryDate) {
            this.errors = { ...this.errors, expiryDate: '' };
        }
    }
    // Display an error banner when we have error messages
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
    isValidCardNumber(number) {
        let sum = 0;
        let shouldDouble = false;
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i], 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
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
    validateCardFields() {
        const errors = {};
        const rawCardNumber = this.cardNumber.replace(/\s/g, '');
        if (rawCardNumber.length === 0) {
            errors.cardNumber = 'Card Number is required.';
            return errors;
        }
        const cardTypeErrors = this.validateCardTypeSupported();
        if (cardTypeErrors.cardNumber) {
            errors.cardNumber = cardTypeErrors.cardNumber;
            return errors;
        }
        // Validate card length
        if (this.cardType && !this.isValidCardLength(rawCardNumber.length)) {
            errors.cardNumber = `Please enter a valid Card Number.`;
        }
        // Validate Luhn algorithm
        else if (!this.isValidCardNumber(rawCardNumber)) {
            errors.cardNumber = 'Invalid Card Number.';
        }
        const cvvRegex = this.cardType === CardType.AMEX ? /^\d{4}$/ : /^\d{3}$/;
        if (!/^\d+$/.test(this.cvv)) {
            errors.cvv = 'CVV must contain only numbers.';
        }
        else if (!cvvRegex.test(this.cvv)) {
            errors.cvv = `CVV must be ${this.cardType === CardType.AMEX ? '4' : '3'} digits.`;
        }
        return errors;
    }
    validateExpiryDate() {
        const errors = {};
        const isValidFormat = /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiryDate);
        if (isValidFormat) {
            // Check if expiry date is in the past
            const [month, year] = this.expiryDate.split('/');
            const expiryMonth = parseInt(month, 10);
            const expiryYear = parseInt('20' + year, 10); // Convert YY to YYYY
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
            const currentYear = currentDate.getFullYear();
            // Check if expiry date is in the past
            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                errors.expiryDate = 'Card has expired. Please enter a valid Expiry Date.';
            }
            // Check if expiry date exceeds 10 years from now
            const maxYear = currentYear + 10;
            if (expiryYear > maxYear || (expiryYear === maxYear && expiryMonth > currentMonth)) {
                errors.expiryDate = 'Card expiry date cannot be more than 10 years from today.';
            }
        }
        else {
            errors.expiryDate = 'Expiry Date must be in MM/YY format.';
        }
        return errors;
    }
    validatePersonalFields() {
        const errors = {};
        // ONLY Name on Card is required for tokenization
        if (!this.nameOnCard.trim())
            errors.nameOnCard = 'Name on Card is required.';
        // First Name and Last Name are now OPTIONAL
        // if (!this.firstName.trim()) errors.firstName = 'First Name is required.';
        // if (!this.lastName.trim()) errors.lastName = 'Last Name is required.';
        // Payment Account Nickname is now optional
        // if (!this.paymentAccountNickname.trim()) errors.paymentAccountNickname = 'Payment Account Nickname is required.';
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
        // if (!this.city.trim()) errors.city = 'City is required.';
        // State - now optional
        // if (this.isCountryUSorCanada() && !this.state.trim()) errors.state = 'State is required';
        // Country - now optional
        // if (!this.country.trim()) errors.country = 'Country is required.';
        // Zip Code - now optional
        // if (!this.zipCode.trim()) errors.zipCode = 'Zip Code is required.';
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
    handleMfaError(messages) {
        if (messages?.length > 0) {
            this.brokenRules = [messages[0]];
            this.showErrorBanner(messages);
        }
    }
    handleClosePopup = () => {
        this.mfaPopUp = false;
    };
    validate() {
        const newErrors = {
            nameOnCard: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            dateofBirth: '',
            paymentAccountNickname: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            mobilePhoneNumber: '',
            emailAddress: '',
            selectedPhoneCode: '',
            ...this.validateCardFields(),
            ...this.validateExpiryDate(),
            ...this.validatePersonalFields(),
            ...this.validateAddressFields(),
            ...this.validateDateOfBirth(),
            ...this.validateMobilePhoneNumber(),
            ...this.validateEmailAddress(),
            ...this.validateSelectedPhoneCode(),
        };
        this.scrollToFirstError();
        this.errors = newErrors;
        return Object.keys(newErrors).every(key => !newErrors[key]);
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
        this.isLoading = true;
        this.apiErrors = {}; // Clear previous API errors
        this.brokenRules = [];
        if (!this.validate()) {
            this.isLoading = false;
            return;
        }
        const [expirationMonth, expirationYearShort] = this.expiryDate.split('/');
        const expirationYear = `20${expirationYearShort}`;
        this.formattedMobileNumber = this.selectedPhoneCode
            ? '+' + this.selectedPhoneCode.trim() + this.mobilePhoneNumber.trim()
            : this.mobilePhoneNumber;
        const payload = {
            walletOwnerIdentifiers: {
                customer: {
                    customerInformation: {
                        firstName: this.firstName,
                        lastName: this.lastName
                    }
                }
            },
            accountReferenceId: 'cardtoken-' + Date.now(),
            cardHolder: this.nameOnCard,
            billingAddress: {
                addressLine1: this.address1,
                addressLine2: this.address2,
                city: this.city,
                provinceOrStateCode: this.isCountryUSorCanada() ? this.state : '',
                countryCode: this.country || 'US',
                postalCode: this.zipCode,
                addressType: AddressType.Primary,
            },
            cardNumber: this.cardNumber.replace(/\s/g, ''),
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
            expirationMonth,
            expirationYear,
            tokenizationType: 2,
        };
        this.addCardRequestPayload = payload;
        // Commit device data to Oscilar before making the API call
        oscilarService.commit();
        try {
            const response = await addCard(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            this.devLog('paymentInstrument,data,status:', response?.data?.paymentInstrument?.paymentInstrumentToken, response?.data, response.success);
            if (response.success && response?.data?.paymentInstrument?.paymentInstrumentToken) {
                this.handleSuccess(response);
            }
            else if (response.success && response?.data?.AccountStatus) {
                this.handleResponseSuccess(response);
            }
            else {
                this.handleResponseError(response);
            }
        }
        catch (error) {
            console.error('❌ Unexpected error in payment submission:', error);
            trackAddPaymentError(error.message || 'Unexpected error occurred');
            this.apiErrors = { General: [error.message || 'An unexpected error occurred.'] };
        }
        finally {
            this.isLoading = false;
        }
    }
    handleResponseSuccess(response) {
        // Initialize brokenRules to empty array if not present
        this.brokenRules = response?.data?.BrokenRules || [];
        if (response?.data?.AccountStatus === AccountStatus.AddressSuggested) {
            this.isAddressSuggestion = true;
        }
        else {
            this.isAddressSuggestion = false;
        }
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
    handleResponseError(response) {
        // Track payment addition error
        const errorMessage = response?.message || 'Payment method addition failed';
        trackAddPaymentError(errorMessage);
        // Capture API errors and display them in the UI
        if (response.errors) {
            // Track API validation errors
            trackValidationError('payment', response.errors);
            this.apiErrors = response.errors.reduce((acc, error) => {
                acc.General = acc.General || [];
                acc.General.push(error);
                return acc;
            }, {});
        }
        else if (response.message) {
            // Track single API validation error
            trackValidationError('payment', [response.message]);
            this.apiErrors = { General: [response.message] };
        }
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
        trackAddPaymentError('Address validation error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('addressValidation event emitted:', {
            message: errorMessage,
            AddressValidation: AccountStatus[response?.data?.AccountStatus]
        });
    }
    handleUnknownError(response) {
        // Set default message if no broken rules exist
        if (!response?.data?.BrokenRules?.length) {
            response.data = {
                ...response.data,
                BrokenRules: ['Payment method addition failed']
            };
        }
        let errorMessage = response.data.BrokenRules[0];
        this.brokenRules = response.data.BrokenRules;
        this.showErrorBanner(this.brokenRules);
        trackAddPaymentError('Unknown Error: ' + errorMessage);
        this.addressValidation.emit(errorMessage);
        this.devLog('Event emitted:', {
            message: errorMessage,
            UnKnown: AccountStatus[response?.data?.AccountStatus]
        });
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
    handleSuccess(response) {
        this.devLog('🎉 Payment method added successfully, tracking event...');
        trackAddPaymentSuccess({
            cardType: this.cardType,
            lastFourDigits: this.cardNumber.slice(-4),
            expiryDate: this.expiryDate
        });
        this.devLog('✅ Success event tracked');
        const paymentInstrumentToken = response.data.paymentInstrument.paymentInstrumentToken;
        this.devLog('Emitting payment instrument token:', paymentInstrumentToken);
        this.devLog('Full response:', response);
        this.cardAdded.emit(paymentInstrumentToken);
        this.resetForm();
    }
    goToWallet = () => {
        // Track payment method addition cancellation
        trackAddPaymentCancelled();
        this.goToPaymentSelector.emit(true);
    };
    /**
     * Formats a date from MM/DD/YYYY to YYYY-MM-DD format for API
     * @param dateString - Date string in MM/DD/YYYY format
     * @returns Date string in YYYY-MM-DD format
     */
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
    resetForm() {
        this.nameOnCard = '';
        this.cardNumber = '';
        this.expiryDate = '';
        this.cvv = '';
        this.cardType = '';
        this.firstName = '';
        this.lastName = '';
        this.address1 = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.country = '';
        this.address2 = '';
        this.dateofBirth = '';
        this.paymentAccountNickname = '';
        this.isAddressResubmission = false;
        this.brokenRules = [];
        // Reset the address validation flag
        this.mobilePhoneNumber = '';
        this.emailAddress = '';
        this.selectedPhoneCode = '';
        this.errors = {
            nameOnCard: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
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
    handleCloseBanner = () => {
        this.brokenRules = [];
    };
    renderErrorBanner() {
        if (!this.brokenRules.length)
            return null;
        return (h("div", { ref: el => this.errorBannerRef = el, class: `${this.isAddressSuggestion ? 'addressVerification-message-warning-info' : 'addressVerification-message-error-info'}` }, h("div", { class: "addressVerification-message-notice-body" }, h("div", { class: "addressVerification-message-warning-content" }, this.brokenRules[0])), h("button", { class: "addressVerification-close-btn", type: "button", "aria-label": "Close", onClick: this.handleCloseBanner }, "\u00D7")));
    }
    renderApiErrors() {
        if (!Object.keys(this.apiErrors).length)
            return null;
        return (h("div", { class: "api-errors" }, h("div", { class: "error-content" }, h("h5", null, "Error Message"), h("ul", null, Object.entries(this.apiErrors).map(([field, messages]) => messages.map((msg, idx) => (h("li", { key: `${field}-${idx}` }, h("strong", null, field === 'General' ? '' : `${field}: `), msg))))))));
    }
    renderCardFields() {
        return (h("div", { class: "wallet-row" }, h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, h("label", { htmlFor: "name-on-card", class: this.errors.nameOnCard ? 'validation-error' : '' }, "Name on Card ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "name-on-card", placeholder: "Enter Name on Card", value: this.nameOnCard, onInput: (event) => this.handleInputChange('nameOnCard', event.target.value) }), this.errors.nameOnCard && h("span", { class: "error" }, this.errors.nameOnCard)), h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, h("label", { htmlFor: "card-number", class: this.errors.cardNumber ? 'validation-error' : '' }, "Card Number ", h("span", { class: "required-asterisk" }, "*"), " ", this.cardType && h("span", null, "(", this.cardType, ")")), h("input", { type: "text", id: "card-number", placeholder: "Enter Card Number", autoComplete: "cc-number", value: this.cardNumber, onInput: (event) => this.handleCardNumberChange(event.target.value) }), this.errors.cardNumber && h("span", { class: "error" }, this.errors.cardNumber)), h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, h("label", { htmlFor: "expiry-date", class: this.errors.expiryDate ? 'validation-error' : '' }, "Expiry Date ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "expiry-date", autocomplete: "cc-exp", placeholder: "MM/YY", value: this.expiryDate, onInput: (event) => this.handleExpiryDateChange(event), onKeyDown: (event) => this.handleExpiryDateKeyDown(event) }), this.errors.expiryDate && h("span", { class: "error" }, this.errors.expiryDate)), h("div", { class: "wallet-col-lg-3 wallet-col-md-6" }, h("label", { htmlFor: "cvv", class: this.errors.cvv ? 'validation-error' : '' }, "CVV ", h("span", { class: "required-asterisk" }, "*")), h("input", { type: "text", id: "cvv", inputmode: "numeric" // Show numeric keyboard on mobile
            ,
            autocomplete: "one-time-code" //  Tell browser it's a one-time value
            ,
            "data-lpignore": "true" //  LastPass ignore
            ,
            "data-1p-ignore": "true" //  1Password ignore
            ,
            "data-bwignore": "true" //  Bitwarden ignore
            ,
            "data-form-type": "other", placeholder: "Enter CVV", value: this.cvv, onInput: (event) => this.handleInputChange('cvv', event.target.value) }), this.errors.cvv && h("span", { class: "error" }, this.errors.cvv))));
    }
    renderMobilePhoneNumber() {
        return (h("div", { class: "wallet-col-md-6" }, h("label", { htmlFor: "MobilePhoneNumber", class: this.errors.mobilePhoneNumber ? 'validation-error' : '' }, ' ', "Mobile Phone Number (Optional)"), this.country === 'US' ? (h("div", { class: "field-stack single-field" }, h("div", { class: "input-wrapper" }, h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 14, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && h("span", { class: "error" }, this.errors.mobilePhoneNumber)))) : (h("div", { class: "field-stack dual-field" }, h("div", { class: "input-wrapper" }, h("div", { class: "dropdown-wrapper", ref: el => (this.dropdownWrapper = el) }, h("button", { type: "button", class: "dropdown-header", onClick: this.togglePhoneCodeDropdown, "aria-haspopup": "listbox", "aria-expanded": this.isPhoneCodeDropdownOpen }, "+", this.selectedPhoneCode || ' '), this.isPhoneCodeDropdownOpen && (h("ul", { class: "dropdown-list" }, CountryAndPhoneCodes.map(country => (h("li", { class: "dropdown-item" }, h("button", { type: "button", class: "dropdown-button", onClick: () => this.selectPhoneCode(country.PhoneCode) }, h("div", { class: "dropdown-content" }, h("span", null, country.Description?.toLowerCase()), h("span", null, "+", country.PhoneCode))))))))), this.errors.selectedPhoneCode && h("span", { class: "error" }, this.errors.selectedPhoneCode)), h("div", { class: "input-wrapper" }, h("input", { type: "text", id: "mobilePhoneNumber", placeholder: "Enter Mobile Phone Number", maxLength: 20, value: this.mobilePhoneNumber, onInput: event => this.handleMobileNumberChange(event) }), this.errors.mobilePhoneNumber && h("span", { class: "error" }, this.errors.mobilePhoneNumber))))));
    }
    render() {
        return (h("div", { key: '45856423df62069f2a04be2bc44882c18a260434', class: "add-new-payment" }, h("h3", { key: '278dfb34747c251c662a055db4844a89224542fe' }, "Add New Payment"), this.mfaPopUp && (h("mfa-model-popup", { key: '992e3b6958084b3bc45b764a9d26c7668c133eeb', operationsToken: this.operationsToken, userScopedAccessToken: this.userScopedAccessToken, environment: this.environment, addRequestPayload: this.addCardRequestPayload, initialMfaResponse: this.mfaResponsePayload, requestType: "card", onClose: this.handleClosePopup, errorHandler: (messages) => this.handleMfaError(messages), onSuccessEvent: (event) => this.handleSuccess(event.detail) })), h("form", { key: '9a992c833fb7c02e89964e34c92989edc64b17d2', onSubmit: (event) => this.handleSubmit(event) }, this.renderErrorBanner(), this.renderCardFields(), h("h4", { key: 'b5055bfef8cccc30024700ff186ef8ee798f8a94' }, "Billing Address"), h("div", { key: 'eb42b8dc4543f9a804d1487344712cf65e6a26a0', class: "wallet-row" }, h("div", { key: 'a503321eb6d24747568830c75ab493b6e31e865e', class: "wallet-col-md-6" }, h("label", { key: '646c68c9c66ecfc4999ed2d7c4731f50ecb69104', htmlFor: "first-name", class: this.errors.firstName ? 'validation-error' : '' }, "First Name (Optional)"), h("input", { key: '8ff20c5ef162c6ba7a4110ab5739cd4b467b6728', type: "text", id: "first-name", autoComplete: "cc-given-name", placeholder: "Enter First Name", value: this.firstName, onInput: (event) => this.handleInputChange('firstName', event.target.value) }), this.errors.firstName && h("span", { key: '6dc552d98b359182e3ecb6cd38c51bb31ff034de', class: "error" }, this.errors.firstName)), h("div", { key: '370f4909552ac87cf713df6baee63da1ebf5ec7c', class: "wallet-col-md-6" }, h("label", { key: '2ad4c2be9b0a8ec309545c50e50f4639b2b89bf4', htmlFor: "last-name", class: this.errors.lastName ? 'validation-error' : '' }, "Last Name (Optional)"), h("input", { key: '98706f0479c2d1aa25ec04855fd667df5d2c3bd7', type: "text", id: "last-name", autoComplete: "cc-family-name", placeholder: "Enter Last Name", value: this.lastName, onInput: (event) => this.handleInputChange('lastName', event.target.value) }), this.errors.lastName && h("span", { key: '452db89592e031d9097c5c1b3b1b7046edfbb4c9', class: "error" }, this.errors.lastName)), h("div", { key: '7740ec71d33adbf4b21c8d6d3c6f0d6a25b79c76', class: "wallet-col-md-6" }, h("label", { key: '93b79d641a2c6976d34831c4cdad5c2e15f22c96', htmlFor: "Nick-name", class: this.errors.paymentAccountNickname ? 'validation-error' : '' }, "Payment Account Nickname (Optional)"), h("input", { key: 'ca0f3083d08e039e02f53ee3dd9f47aa1e614bf9', type: "text", id: "Nick-name", autoComplete: "nickname", placeholder: "Enter Payment Account Nickname", value: this.paymentAccountNickname, onInput: (event) => this.handleInputChange('paymentAccountNickname', event.target.value) }), this.errors.paymentAccountNickname && h("span", { key: '2ebd87416b9c451ace0f7caa53a21b30dd57bf16', class: "error" }, this.errors.paymentAccountNickname)), h("div", { key: '93837a4e5af651b852698cc68775c865d7eaf2c5', class: "wallet-col-md-6" }, h("label", { key: 'e574cf9905f1a00c373cc48783bb620e26b2528c', htmlFor: "address1", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 1 (Optional)"), h("input", { key: '829f66c64409d1d132b8b53c83abec394fa59fab', type: "text", id: "address1", autoComplete: "address-line1", placeholder: "Enter Address Line 1", value: this.address1, onInput: (event) => this.handleInputChange('address1', event.target.value) }), this.errors.address1 && h("span", { key: 'a4e675d3c0fe1a1576fde623d0411ad65e4b8ca6', class: "error" }, this.errors.address1)), h("div", { key: '5c8064edabafe2de2c033d7078259e29f4f49586', class: "wallet-col-md-6" }, h("label", { key: '24e23622e6e6d69e0bf467e9e8c910f39f6d5dad', htmlFor: "address2", class: this.errors.address1 ? 'validation-error' : '' }, "Address Line 2 (Optional)"), h("input", { key: '4283069394aae4dca9d90c6afaa3265d5e839d6c', type: "text", id: "address2", autoComplete: "address-line2", placeholder: "Apt, suite, unit, etc. (optional)", value: this.address2, onInput: (event) => this.handleInputChange('address2', event.target.value) }), this.errors.address2 && h("span", { key: 'e67c2d835723cfe50b73d07bfc54c619969acc42', class: "error" }, this.errors.address2)), h("div", { key: '0af525e4a45c33d540fbda36dc31d7ed6f390b15', class: "wallet-col-md-6" }, h("label", { key: '12464390252c5ef4c79e70e895c571b61cffce9b', htmlFor: "city", class: this.errors.city ? 'validation-error' : '' }, "City (Optional)"), h("input", { key: 'c16edf03234a81cf3c6ad5f8bf97f65e11a941fa', type: "text", id: "city", autoComplete: "address-level2", placeholder: "Enter City", value: this.city, onInput: (event) => this.handleInputChange('city', event.target.value) }), this.errors.city && h("span", { key: '51c355b8e0c89ce4e189d12ab0bb733607815f68', class: "error" }, this.errors.city)), h("div", { key: 'bf03159ac49382c3bc5483615d11cb672fe1a78a', class: "wallet-col-md-6" }, h("label", { key: 'f680be5ee2907071d665ea8a5f13861b91d8be97', htmlFor: "country", class: this.errors.country ? 'validation-error' : '' }, "Country (Optional)"), h("select", { key: '5a29e04c008b77064e4300c61e37c5a397440e2d', id: "country", autoComplete: "country", onInput: (event) => this.handleCountryChange(event) }, h("option", { key: 'b15318b1c76b2a472067f83fdd98215ddf3e5236', value: "" }, "Select Country"), COUNTRY.map(country => (h("option", { key: country.code, value: country.code, selected: this.country === country.code }, country.name)))), this.errors.country && h("span", { key: '71ecbb61d12fbeed9e4da071ba4a6c07bad7d63b', class: "error" }, this.errors.country)), (this.country === 'US' || this.country === 'CA') && (h("div", { key: 'a2b64af1d0b8e3295a48d5a11a04ef9502c17fd5', class: "wallet-col-md-6" }, h("label", { key: '1737cd118e05e136ccc491d69d7fd9db81061797', htmlFor: "state", class: this.errors.state ? 'validation-error' : '' }, "State/Province (Optional)"), h("select", { key: '188f1fb8eeb305620e2d61161b74fc8222383d74', id: "state", autoComplete: "address-level1", onInput: (event) => this.handleStateChange(event) }, h("option", { key: '8f43c176efbe2d39f053c2b1e09244fc9d056ee2', value: "" }, "Select ", this.country === 'US' ? 'State' : 'Province'), STATES(this.country).map(state => (h("option", { key: state.code, value: state.code, selected: this.state === state.code }, state.name)))), this.errors.state && h("span", { key: '6d6d1f8cfefd60e185e1e6e7f992ea7cf35fe3ad', class: "error" }, this.errors.state))), h("div", { key: '9364c5045d4907e46abc058fd0ae6a21dccf9304', class: "wallet-col-md-6" }, h("label", { key: '5d2a0096e7e02785b5e315c1f5562b1200da1ab9', htmlFor: "zip-code", class: this.errors.zipCode ? 'validation-error' : '' }, "Zip Code (Optional)"), h("input", { key: 'd61ef8195d9f3bde2dfa014457c6963fa8051bb4', type: "text", id: "zip-code", autocomplete: "postal-code", placeholder: "Enter ZIP Code", value: this.zipCode, onInput: (event) => this.handleInputChange('zipCode', event.target.value) }), this.errors.zipCode && h("span", { key: '7d8f62ea43c34a482f055dd21893ebe546b0b5db', class: "error" }, this.errors.zipCode)), h("div", { key: '77a48f618b532fa20a9a1b282409f1e4ba93ec91', class: "wallet-col-md-6" }, h("label", { key: 'fd95637c2faa59928b47c474f6e6552b64aa0ad8', htmlFor: "EmailAddress", class: this.errors.emailAddress ? 'validation-error' : '' }, "E-Mail Address (Optional)"), h("input", { key: '2dc742f5ad24a16da958ec28ce686615010c77da', type: "text", id: "emailAddress", placeholder: "Enter E-Mail Address", value: this.emailAddress, onInput: event => this.handleInputChange('emailAddress', event.target.value) }), this.errors.emailAddress && h("span", { key: '6d420c60818c48cc810706283fdfd3bd068527ae', class: "error" }, this.errors.emailAddress)), this.renderMobilePhoneNumber(), h("div", { key: '5443311f02b0f80d594567029e98bc815206c99c', class: "wallet-col-md-6" }, h("label", { key: 'f6a5c0efb2b5a309a4060e7e8cbcb0cde369310a', htmlFor: "Date-of-Birth", class: this.errors.dateofBirth ? 'validation-error' : '' }, "Date of Birth (Optional)"), h("date-picker", { key: 'cbefe99008d75fc5b5d9a474a069e8c6763fb5f5', value: this.dateofBirth, placeholder: "MM/DD/YYYY", inputId: "Date-of-Birth", minAge: 18, onDateChange: (e) => this.handleBirthDateChange(e.detail) }), this.errors.dateofBirth && h("span", { key: 'ea817704ed48f4ca5c5590d305e3c211d22e9de7', class: "error" }, this.errors.dateofBirth))), this.renderApiErrors(), h("div", { key: '55a4ed1ac98c92a1680cb31f81299eef23260db8', class: "wallet-col-12 footer" }, h("md-filled-button", { key: 'ab800fc8745f4230f55ee48acc7f291bb1c46c23', class: "button button-secondary", onClick: this.goToWallet }, "Cancel"), this.isLoading ? (h("md-filled-button", { class: "button button-primary", type: "button" }, "Adding Account", ' ', h("span", { class: "dot-flashing" }))) : (h("md-filled-button", { class: "button button-primary" }, "Add Account"))))));
    }
    static get is() { return "add-new-payment"; }
    static get originalStyleUrls() {
        return {
            "$": ["addnewpayment.module.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["addnewpayment.module.css"]
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
            },
            "availableCreditCards": {
                "type": "unknown",
                "attribute": "available-credit-cards",
                "mutable": false,
                "complexType": {
                    "original": "CreditCardType[] | null",
                    "resolved": "CreditCardType[]",
                    "references": {
                        "CreditCardType": {
                            "location": "import",
                            "path": "../../utils/apiService",
                            "id": "src/utils/apiService.ts::CreditCardType"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get states() {
        return {
            "showAddNewPayment": {},
            "showPaymentSelector": {},
            "nameOnCard": {},
            "cardNumber": {},
            "expiryDate": {},
            "cvv": {},
            "cardType": {},
            "address2": {},
            "dateofBirth": {},
            "paymentAccountNickname": {},
            "firstName": {},
            "lastName": {},
            "address1": {},
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
            "addCardRequestPayload": {},
            "mfaResponsePayload": {},
            "isAddressSuggestion": {},
            "brokenRules": {},
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
                "method": "cardAdded",
                "name": "cardAdded",
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
//# sourceMappingURL=addnewpayment.js.map
