import { p as proxyCustomElement, H, c as createEvent, h } from './index.js';
import { t as translateErrorWithContext, i as initWalletEvents, S as STATES, C as COUNTRY, a as CountryAndPhoneCodes, b as isValidPOBoxAddess, c as trackValidationError, o as oscilarService, d as trackAddBankError, e as trackAddBankSuccess, f as trackAddBankCancelled } from './p-BIbnFGdR.js';
import { E as Environment, g as getApiConfig, d as defineCustomElement$1, B as BankAccountType, A as AccountStatus } from './p-FUsAEGQG.js';
import { d as defineCustomElement$2 } from './p-Cd2Eytzd.js';

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function addBankAccount(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.ADD_BANK_ACCOUNT}`;
    devLog(environment, 'Add Bank Account Request Details:', {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Masking the token for security
            'Authorization': `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            'X-SW-API-KEY': `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`,
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${operationsToken}`,
                'X-SW-API-KEY': userScopedAccessToken,
            },
            body: JSON.stringify(requestBody),
        });
        devLog(environment, 'Add Bank Account Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Add Bank Account Response Data:', responseData);
        // Check if the response JSON contains a status of 400
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, errors: parseErrorResponse(responseData, environment) };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'An error occurred while adding the bank account.' };
        }
        devLog(environment, 'Bank account added successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error adding bank account:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
function parseErrorResponse(errorResponse, environment) {
    let processedMessages = [];
    if (errorResponse.errors) {
        // Format 1: Extract errors from the "errors" object with field context
        for (const fieldKey in errorResponse.errors) {
            if (errorResponse.errors[fieldKey] && Array.isArray(errorResponse.errors[fieldKey])) {
                const fieldErrors = errorResponse.errors[fieldKey];
                for (const errorMessage of fieldErrors) {
                    // Check if this is a field-specific validation error
                    if (isFieldSpecificError(fieldKey)) {
                        // Show BFF message as-is for field-specific errors
                        devLog(environment, `Field-specific error (${fieldKey}): showing as-is:`, errorMessage);
                        processedMessages.push(errorMessage);
                    }
                    else {
                        // Use translator for non-field-specific errors
                        const translatedMessage = translateErrorWithContext(errorMessage, 'bank');
                        devLog(environment, `Non-field error: "${errorMessage}" → "${translatedMessage.userMessage}"`);
                        processedMessages.push(translatedMessage.userMessage);
                    }
                }
            }
        }
    }
    else if (errorResponse.detail) {
        // Format 2: Extract the "detail" field - treat as non-field-specific
        const translatedMessage = translateErrorWithContext(errorResponse.detail, 'bank');
        processedMessages = [translatedMessage.userMessage];
    }
    else {
        // Fallback: Return a generic error message
        processedMessages = ['An unknown error occurred. Please try again.'];
    }
    // Remove duplicate messages to avoid showing the same generic message multiple times
    const uniqueMessages = [...new Set(processedMessages)];
    devLog(environment, 'Final processed messages (duplicates removed):', uniqueMessages);
    return uniqueMessages;
}
// Helper function to determine if an error is field-specific
function isFieldSpecificError(fieldKey) {
    // Field-specific errors contain field names like:
    // "ExpirationYear", "BillingAddress.City", "CardNumber", etc.
    const fieldSpecificPatterns = [
        /^ExpirationYear$/i,
        /^ExpirationMonth$/i,
        /^CardNumber$/i,
        /^CardHolder$/i,
        /^BillingAddress\./i, // BillingAddress.City, BillingAddress.PostalCode, etc.
        /^PayorInformation\./i, // PayorInformation.FirstName, etc.
        /^WalletOwnerIdentifiers\./i,
        /^AccountNumber$/i,
        /^RoutingNumber$/i,
        /^BankAccountType$/i
    ];
    return fieldSpecificPatterns.some(pattern => pattern.test(fieldKey));
}

const addbankaccountModuleCss = "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'); .add-bank-account{margin-top:20px;padding:20px}.add-bank-account h3{margin-top:0;margin-bottom:20px;font-weight:700}.add-bank-account form{display:flex;flex-direction:column;gap:15px}.add-bank-account select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:white;border:1px solid #ccc;border-radius:4px;padding:8px 12px;font-size:14px;color:#333;cursor:pointer;background-image:url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>');background-repeat:no-repeat;background-position:right 8px center;background-size:12px;padding-right:30px}.add-bank-account select:focus{outline:none;border-color:#007bff;box-shadow:0 0 0 2px rgba(0, 123, 255, 0.25)}.add-bank-account select option{padding:8px;background-color:white;color:#333}.add-bank-account select option:hover{background-color:#f0f0f0}.add-bank-account form button:not(date-picker button){width:100%;padding:12px;background-color:#007bff;color:white;border:none;border-radius:4px;font-size:1.1rem;font-weight:500;cursor:pointer;transition:background-color 0.3s ease, transform 0.2s ease}.add-bank-account form button:not(date-picker button):hover{background-color:#0056b3;transform:translateY(-2px)}.add-bank-account form button:active{background-color:#004085;transform:translateY(0)}.add-bank-account form button:disabled{background-color:#94c3f0;cursor:not-allowed;transform:none;position:relative;overflow:hidden}.add-bank-account form button:disabled::after{content:'';position:absolute;width:20px;height:20px;top:50%;left:50%;margin:-10px 0 0 -10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;opacity:0;transition:opacity 0.3s ease}.add-bank-account form button:disabled[data-loading=\"true\"]{color:transparent}.add-bank-account form button:disabled[data-loading=\"true\"]::after{opacity:1}@keyframes spin{to{transform:rotate(360deg)}}.add-bank-account form button:disabled{background-color:#94c3f0;cursor:not-allowed;transform:none;position:relative;overflow:hidden}.add-bank-account form button:disabled::after{content:'';position:absolute;width:20px;height:20px;top:50%;left:50%;margin:-10px 0 0 -10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;opacity:0;transition:opacity 0.3s ease}.add-bank-account form button:disabled[data-loading=\"true\"]{color:transparent}.add-bank-account form button:disabled[data-loading=\"true\"]::after{opacity:1}@keyframes spin{to{transform:rotate(360deg)}}.add-bank-account form input::placeholder{color:#aaa;font-style:italic}.bank-account-type{display:flex;flex-direction:row;gap:20px;align-items:center;margin-bottom:0;height:38px}.bank-account-type label{display:flex;align-items:center;gap:5px;cursor:pointer}.bank-account-type input[type=\"radio\"]{width:auto;margin:0}.custom-radio{font-size:16px;font-weight:500}.dropdown-wrapper{position:relative;width:100%;margin-bottom:0px}.dropdown-wrapper button.dropdown-header{all:unset;display:block;width:90%;padding:8px;border:1px solid #e9eaeb;border-radius:12px;font-weight:500;font-size:14px;cursor:pointer;background-color:white;margin-bottom:0px;transition:border 0.2s ease}.dropdown-wrapper button.dropdown-header:focus{outline:none;border:1px solid #282829;background-color:transparent;transform:none}.dropdown-wrapper button.dropdown-header:hover{background-color:transparent;transform:none}.dropdown-list{position:absolute;width:100%;top:100%;left:0;z-index:10;background-color:white;border:1px solid #e9eaeb;border-radius:12px;opacity:1;transform:none;transform-origin:100px 0px;transition:opacity 263ms cubic-bezier(0.4, 0, 0.2, 1),\r\n              transform 175ms cubic-bezier(0.4, 0, 0.2, 1);max-height:150px;list-style-type:none;padding-left:0px;margin:0px;overflow-y:auto;scrollbar-width:none;scroll-behavior:smooth;min-width:250px}.dropdown-item{padding:8px 10px;font-size:14px !important;font-weight:400 !important;color:#282829 !important;cursor:pointer}.dropdown-item:hover{background-color:#e9eaeb}.dropdown-content{display:flex;justify-content:space-between;width:100%;margin-bottom:0px}.dropdown-wrapper button.dropdown-button{all:unset;width:100%;display:block;cursor:pointer}.dropdown-wrapper button.dropdown-button:hover{background-color:transparent;transform:none}.addressVerification-message-warning-info,.addressVerification-message-error-info{padding:0px 16px;border-radius:8px;box-shadow:0 1px 3px rgba(0, 0, 0, 0.05);margin:0px 0px 16px 0px;width:100%;display:flex;flex-direction:row;gap:2px;overflow:visible !important;max-height:none;align-items:flex-start;min-width:297px;min-height:103px}.addressVerification-message-warning-info{background-color:#E3F2FC;border-left:13px solid #0076CC}.addressVerification-message-error-info{background-color:#FFEBEE;border-left:13px solid #D01A1F}.addressVerification-message-notice-body{white-space:pre-wrap;word-break:break-word;margin-top:26px}.addressVerification-message-warning-content{white-space:pre-line;margin:0px;word-break:break-word;font-weight:400}.add-bank-account .addressVerification-close-btn{background:none;border:none;font-size:24px;font-weight:bold;color:#6B7280;cursor:pointer;margin-top:24px;width:auto;padding:0}.add-bank-account .addressVerification-close-btn:hover{color:#374151}.required-asterisk{color:red}date-picker button.date-picker-icon{width:auto !important;height:auto !important;padding:5px !important;background:none !important;border:none !important;color:#666 !important;font-size:14px !important;font-weight:normal !important;transform:none !important;transition:none !important;top:20%}date-picker button.date-picker-icon:hover{background:none !important;color:#333 !important;transform:none !important}date-picker button:not(.date-picker-icon){width:auto !important;background-color:white !important;color:#333 !important;font-size:14px !important;font-weight:normal !important;transform:none !important}date-picker button:not(.date-picker-icon):hover{background-color:#f5f5f5 !important;transform:none !important}date-picker .date-picker-day.selected,date-picker .year-picker-item.selected{background-color:#007bff !important;color:white !important}.add-bank-account date-picker .date-picker-wrapper{margin-bottom:0px !important}.error::before,.error::after{display:none !important}";

const AddBankAccount = /*@__PURE__*/ proxyCustomElement(class AddBankAccount extends H {
    constructor() {
        super();
        this.__registerHost();
        this.goToPaymentSelector = createEvent(this, "goToPaymentSelector");
        this.addressValidation = createEvent(this, "addressValidation");
        this.bankAccountAdded = createEvent(this, "bankAccountAdded");
    }
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
    get el() { return this; }
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
            const response = await addBankAccount(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
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
    static get style() { return addbankaccountModuleCss; }
}, [0, "add-bank-account", {
        "operationsToken": [1, "operations-token"],
        "userScopedAccessToken": [1, "user-scoped-access-token"],
        "environment": [1],
        "accountHolderName": [32],
        "accountNumber": [32],
        "routingNumber": [32],
        "bankAccountType": [32],
        "dateofBirth": [32],
        "paymentAccountNickname": [32],
        "firstName": [32],
        "lastName": [32],
        "address1": [32],
        "address2": [32],
        "city": [32],
        "state": [32],
        "country": [32],
        "zipCode": [32],
        "mobilePhoneNumber": [32],
        "selectedPhoneCode": [32],
        "isPhoneCodeDropdownOpen": [32],
        "emailAddress": [32],
        "apiErrors": [32],
        "isLoading": [32],
        "mfaPopUp": [32],
        "PaymentAccountRequestPayload": [32],
        "mfaResponsePayload": [32],
        "brokenRules": [32],
        "isAddressSuggestion": [32],
        "isVerifying": [32],
        "errors": [32],
        "isAddressResubmission": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["add-bank-account", "date-picker", "mfa-model-popup"];
    components.forEach(tagName => { switch (tagName) {
        case "add-bank-account":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, AddBankAccount);
            }
            break;
        case "date-picker":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
        case "mfa-model-popup":
            if (!customElements.get(tagName)) {
                defineCustomElement$1();
            }
            break;
    } });
}
defineCustomElement();

export { AddBankAccount as A, defineCustomElement as d };
//# sourceMappingURL=p-CEQ7vRTX.js.map

//# sourceMappingURL=p-CEQ7vRTX.js.map