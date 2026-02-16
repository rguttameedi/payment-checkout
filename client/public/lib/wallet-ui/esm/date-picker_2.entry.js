import { r as registerInstance, c as createEvent, g as getElement, h } from './index-hYWQIH0y.js';
import { E as Environment, g as getApiConfig, M as MFAStatusEnum } from './common-BoD18Nfo.js';

const datePickerCss = ".date-picker-wrapper{position:relative;display:inline-block;width:100%;box-sizing:border-box}.date-picker-wrapper input{width:100%;padding-right:40px;box-sizing:border-box}.date-picker-icon{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none !important;border:none;cursor:pointer;padding:5px;display:flex;align-items:center;justify-content:center;color:#666;width:auto !important;height:auto !important;min-width:auto !important}.date-picker-icon:hover{color:#333;background:none !important;transform:translateY(-50%)}.date-picker-icon:focus{outline:none;background:none !important}.date-picker-icon:active{background:none !important;transform:translateY(-50%)}.date-picker-dropdown{position:absolute;bottom:100%;left:0;margin-bottom:4px;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 -4px 6px rgba(0, 0, 0, 0.1);z-index:1000;width:320px !important;min-width:320px !important;max-width:320px !important;max-height:400px;overflow:hidden;box-sizing:border-box}.date-picker-header{padding:12px;border-bottom:1px solid #eee;background-color:#f8f9fa;width:100%;box-sizing:border-box}.date-picker-selectors{display:flex;gap:8px;align-items:center;justify-content:center;width:100%;box-sizing:border-box}.date-picker-month-select{flex:1;min-width:120px;max-width:180px;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:14px;background-color:white;cursor:pointer;box-sizing:border-box}.date-picker-month-select:hover{background-color:#f5f5f5}.date-picker-month-select:focus{outline:2px solid #007bff;outline-offset:2px}.date-picker-year-button{padding:6px 12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;white-space:nowrap}.date-picker-year-button:hover{background-color:#f5f5f5}.date-picker-year-button:focus{outline:2px solid #007bff;outline-offset:2px}.year-picker-navigation{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%}.year-nav-button{width:40px;height:40px;flex-shrink:0;padding:8px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}.year-nav-button:hover:not(:disabled){background-color:#f5f5f5}.year-nav-button:disabled{opacity:0.5;cursor:not-allowed}.year-nav-button:active:not(:disabled){background-color:#e9ecef}.year-nav-button:focus{outline:2px solid #007bff;outline-offset:2px}.year-range-button{flex:1;height:40px;padding:8px 12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}.year-range-button:hover{background-color:#f5f5f5}.year-range-button:active{background-color:#e9ecef}.date-picker-calendar-wrapper{max-height:280px;overflow-y:auto;overflow-x:hidden;width:100%;box-sizing:border-box}.date-picker-calendar{width:100%;border-collapse:collapse;table-layout:fixed}.date-picker-calendar thead th{padding:8px;text-align:center;font-weight:600;color:#666;font-size:12px;border-bottom:1px solid #eee}.date-picker-calendar tbody td{padding:2px;text-align:center}.date-picker-day{width:100%;padding:8px;border:none;background:none;cursor:pointer;border-radius:4px;font-size:14px;transition:background-color 0.2s}.date-picker-day:hover{background-color:#e9ecef}.date-picker-day.selected{background-color:#007bff;color:white}.date-picker-day.selected:hover{background-color:#0056b3}.date-picker-day.today{border:2px solid #007bff;font-weight:bold}.year-picker-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;padding:12px;max-height:320px;overflow-y:auto;width:100%;box-sizing:border-box}.year-picker-item{padding:12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;transition:background-color 0.2s}.year-picker-item:hover{background-color:#e9ecef}.year-picker-item.selected{background-color:#007bff;color:white;border-color:#007bff}.year-picker-item.selected:hover{background-color:#0056b3}.year-picker-item.today{border:2px solid #007bff;font-weight:bold}";

const DatePicker = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dateChange = createEvent(this, "dateChange");
    }
    get el() { return getElement(this); }
    value = '';
    placeholder = 'MM/DD/YYYY';
    inputId = 'date-input';
    minAge; // Optional: minimum age requirement (e.g., 18)
    dateChange;
    inputValue = '';
    isDatePickerOpen = false;
    selectedDate = null;
    isYearPickerOpen = false;
    isSelectingMonth = false;
    isSelectingYear = false;
    yearRangeStart = 1900;
    _isOpeningYearPicker = false;
    _isOpeningMonthSelect = false;
    valueChanged(newValue) {
        this.inputValue = newValue;
        // Update selectedDate when value prop changes
        if (newValue && newValue.length === 10) {
            const parts = newValue.split('/');
            if (parts.length === 3) {
                const month = parseInt(parts[0], 10) - 1;
                const day = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                if (year >= 1900 && year <= 2099) {
                    const date = new Date(year, month, day);
                    if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
                        this.selectedDate = date;
                    }
                }
            }
        }
        else if (!newValue) {
            this.selectedDate = null;
        }
    }
    componentDidLoad() {
        // Initialize inputValue with value prop
        this.inputValue = this.value;
        setTimeout(() => {
            document.addEventListener('click', this.handleClickOutside, false);
        }, 300);
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }
    handleClickOutside = (event) => {
        if (!this.isDatePickerOpen)
            return;
        if (this._isOpeningYearPicker || this._isOpeningMonthSelect) {
            return;
        }
        if (this.isSelectingMonth || this.isSelectingYear) {
            return;
        }
        const target = event.target;
        const datePickerWrapper = this.el.querySelector('.date-picker-wrapper');
        if (!datePickerWrapper)
            return;
        if (datePickerWrapper.contains(target)) {
            return;
        }
        if (target.classList.contains('year-picker-item') ||
            target.classList.contains('year-range-button') ||
            target.classList.contains('date-picker-year-button') ||
            target.closest('.year-picker-grid') ||
            target.closest('.year-range-button') ||
            target.closest('.date-picker-year-button')) {
            return;
        }
        if (target.tagName === 'SELECT' ||
            target.tagName === 'OPTION' ||
            target.closest('select')) {
            return;
        }
        this.isDatePickerOpen = false;
        this.isYearPickerOpen = false;
    };
    handleManualInput = (event) => {
        const input = event.target;
        let value = input.value;
        // Remove all non-digit characters
        let digits = value.replace(/\D/g, '');
        // Auto-format as MM/DD/YYYY
        let formatted = this.formatDateInput(digits);
        // Update input value with formatted date
        input.value = formatted;
        this.inputValue = formatted;
        // Emit the formatted value
        this.dateChange.emit(formatted);
        // Try to parse and update selectedDate if complete and valid
        if (formatted.length === 10) {
            const parsedDate = this.parseAndValidateDate(formatted);
            if (parsedDate) {
                this.selectedDate = parsedDate;
            }
        }
    };
    formatDateInput(digits) {
        let formatted = '';
        if (digits.length > 0) {
            // Add month (first 2 digits)
            formatted = digits.slice(0, 2);
            if (digits.length >= 3) {
                // Add slash after month and day (next 2 digits)
                formatted += '/' + digits.slice(2, 4);
            }
            if (digits.length >= 5) {
                // Add slash after day and year (last 4 digits)
                formatted += '/' + digits.slice(4, 8);
            }
        }
        return formatted;
    }
    parseAndValidateDate(formatted) {
        const parts = formatted.split('/');
        if (parts.length !== 3)
            return null;
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        // Basic validation before creating date
        if (month < 0 || month > 11 || day < 1 || day > 31 || year < 1900 || year > 2099) {
            return null;
        }
        const date = new Date(year, month, day);
        // Verify the date is valid (handles invalid dates like 02/30/2020)
        if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
            return date;
        }
        return null;
    }
    toggleDatePicker = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.isDatePickerOpen = !this.isDatePickerOpen;
        if (this.isDatePickerOpen) {
            setTimeout(() => {
                const datePickerDropdown = this.el.querySelector('.date-picker-dropdown');
                if (datePickerDropdown) {
                    const rect = datePickerDropdown.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    if (rect.bottom > viewportHeight) {
                        const availableHeight = viewportHeight - rect.top - 20;
                        datePickerDropdown.style.maxHeight = `${availableHeight}px`;
                        datePickerDropdown.style.overflowY = 'auto';
                    }
                }
            }, 50);
        }
    };
    handleDateSelect = (date, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.selectedDate = date;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        this.dateChange.emit(formattedDate);
        this.isDatePickerOpen = false;
        this.isYearPickerOpen = false;
    };
    toggleYearPicker = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this._isOpeningYearPicker = true;
        this.isSelectingYear = true;
        this.isYearPickerOpen = !this.isYearPickerOpen;
        if (this.isYearPickerOpen) {
            const currentYear = this.selectedDate
                ? this.selectedDate.getFullYear()
                : new Date().getFullYear() - (this.minAge || 18);
            this.yearRangeStart = Math.floor((currentYear - 1900) / 18) * 18 + 1900;
        }
        if (!this.isYearPickerOpen) {
            setTimeout(() => {
                this.isSelectingYear = false;
                this._isOpeningYearPicker = false;
            }, 300);
        }
        else {
            setTimeout(() => {
                this._isOpeningYearPicker = false;
            }, 500);
        }
    };
    handleYearRangeChange = (direction, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (direction === 'prev') {
            const newStart = this.yearRangeStart - 18;
            this.yearRangeStart = Math.max(1900, newStart);
        }
        else {
            const newStart = this.yearRangeStart + 18;
            this.yearRangeStart = Math.min(2082, newStart);
        }
    };
    handleYearSelect = (year, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const currentMonth = this.selectedDate ? this.selectedDate.getMonth() : new Date().getMonth();
        const newDate = new Date(year, currentMonth, 1);
        this.selectedDate = newDate;
        this.isYearPickerOpen = false;
        setTimeout(() => {
            this.isSelectingYear = false;
            this._isOpeningYearPicker = false;
        }, 300);
    };
    renderDatePicker() {
        if (!this.isDatePickerOpen)
            return null;
        const today = new Date();
        const currentMonth = this.selectedDate ? this.selectedDate.getMonth() : today.getMonth();
        const currentYear = this.selectedDate ? this.selectedDate.getFullYear() : today.getFullYear() - (this.minAge || 18);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const handleMonthChange = (event) => {
            const target = event.target;
            const newMonth = parseInt(target.value, 10);
            const newDate = new Date(currentYear, newMonth, 1);
            this.selectedDate = newDate;
            setTimeout(() => {
                this.isSelectingMonth = false;
                this._isOpeningMonthSelect = false;
            }, 100);
        };
        const handleMonthFocus = () => {
            this._isOpeningMonthSelect = true;
            this.isSelectingMonth = true;
        };
        const handleMonthBlur = () => {
            setTimeout(() => {
                this.isSelectingMonth = false;
                this._isOpeningMonthSelect = false;
            }, 200);
        };
        const renderCalendarDays = () => {
            const days = [];
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(h("td", null));
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const isSelected = this.selectedDate &&
                    this.selectedDate.getDate() === day &&
                    this.selectedDate.getMonth() === currentMonth &&
                    this.selectedDate.getFullYear() === currentYear;
                const isToday = today.getDate() === day &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;
                days.push(h("td", null, h("button", { type: "button", class: `date-picker-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`, onClick: (e) => this.handleDateSelect(date, e) }, day)));
            }
            const weeks = [];
            let week = [];
            days.forEach((day, index) => {
                week.push(day);
                if ((index + 1) % 7 === 0 || index === days.length - 1) {
                    while (week.length < 7) {
                        week.push(h("td", null));
                    }
                    weeks.push(h("tr", null, week));
                    week = [];
                }
            });
            return weeks;
        };
        if (this.isYearPickerOpen) {
            const years = [];
            const startYear = this.yearRangeStart;
            const endYear = Math.min(startYear + 17, 2099);
            const yearCount = endYear - startYear + 1;
            for (let i = 0; i < yearCount; i++) {
                const year = startYear + i;
                if (year <= 2099) {
                    years.push(year);
                }
            }
            const isPrevDisabled = this.yearRangeStart <= 1900;
            const isNextDisabled = this.yearRangeStart >= 2082;
            return (h("div", { class: "date-picker-dropdown" }, h("div", { class: "date-picker-header" }, h("div", { class: "year-picker-navigation" }, h("button", { type: "button", class: "year-nav-button", onClick: (e) => this.handleYearRangeChange('prev', e), disabled: isPrevDisabled }, "\u2039"), h("button", { type: "button", class: "year-range-button", onClick: (e) => this.toggleYearPicker(e) }, startYear, " - ", Math.min(startYear + 17, 2099)), h("button", { type: "button", class: "year-nav-button", onClick: (e) => this.handleYearRangeChange('next', e), disabled: isNextDisabled }, "\u203A"))), h("div", { class: "year-picker-grid" }, years.map(year => (h("button", { type: "button", class: `year-picker-item ${year === currentYear ? 'selected' : ''} ${year === today.getFullYear() ? 'today' : ''}`, onClick: (e) => this.handleYearSelect(year, e) }, year))))));
        }
        return (h("div", { class: "date-picker-dropdown" }, h("div", { class: "date-picker-header" }, h("div", { class: "date-picker-selectors" }, h("select", { class: "date-picker-month-select", onInput: handleMonthChange, onFocus: handleMonthFocus, onBlur: handleMonthBlur }, monthNames.map((month, index) => (h("option", { value: index, selected: index === currentMonth }, month)))), h("button", { type: "button", class: "date-picker-year-button", onClick: (e) => this.toggleYearPicker(e) }, currentYear))), h("div", { class: "date-picker-calendar-wrapper" }, h("table", { class: "date-picker-calendar" }, h("thead", null, h("tr", null, h("th", null, "S"), h("th", null, "M"), h("th", null, "T"), h("th", null, "W"), h("th", null, "T"), h("th", null, "F"), h("th", null, "S"))), h("tbody", null, renderCalendarDays())))));
    }
    render() {
        return (h("div", { key: 'eae29dc3ac91b8f6399c5be49a2bd2cccead5ae0', class: "date-picker-wrapper" }, h("input", { key: 'cb4db79c5a172451151d4fe56b2fb102de5946f2', type: "text", id: this.inputId, placeholder: this.placeholder, value: this.inputValue, onInput: (e) => this.handleManualInput(e), maxLength: 10, autocomplete: "off" }), h("button", { key: '39d724ff5e9ecd6508cde1359edb63de5efb31f5', type: "button", class: "date-picker-icon", onClick: (e) => this.toggleDatePicker(e) }, h("svg", { key: '7cda325431da9434a3fb9b4e514279265ea8412f', xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { key: '86e1b35b89b44ab94eab446ae1cc31402b7228b8', x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), h("line", { key: '4df9cc25f1dc1d9cd628e2169b052a44f22ad634', x1: "16", y1: "2", x2: "16", y2: "6" }), h("line", { key: '4f42cfac0345263bf425d9be22a3257200ee8a7d', x1: "8", y1: "2", x2: "8", y2: "6" }), h("line", { key: 'b9c29ccdc399424b365482715c5e4901c6372aa5', x1: "3", y1: "10", x2: "21", y2: "10" }))), this.renderDatePicker()));
    }
    static get watchers() { return {
        "value": ["valueChanged"]
    }; }
};
DatePicker.style = datePickerCss;

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
async function getMfaStatus(operationsToken, userScopedAccessToken, mfainquiryId, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.GET_MFA_STATUS}?mfaInquiryId=${encodeURIComponent(mfainquiryId)}`;
    devLog(environment, 'Get MFA Status Request Details:', {
        url,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            'X-SW-API-KEY': `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`,
        },
    });
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${operationsToken}`,
                'X-SW-API-KEY': userScopedAccessToken,
            },
        });
        devLog(environment, 'Get MFA Status Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Get MFA Status Response Data:', responseData);
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, message: "We couldn't process your request at the moment. Please try again later or use a different payment method." };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'We are unable to retrieve your MFA status at the moment. Please try again later' };
        }
        devLog(environment, 'MFA status fetched successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error fetching MFA status:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'Unexpected error. Please refresh or try again later.' };
    }
}
async function resendMfaLink(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.RESEND_MFA_LINK}`;
    devLog(environment, 'Resend MFA Link Request Details:', {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
        devLog(environment, 'Resend MFA Link Response Status:', response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, 'Resend MFA Link Response Data:', responseData);
        if (responseData.status === 400) {
            devLog(environment, 'Validation Error Response:', responseData);
            return { success: false, message: "Unable to resend MFA link at the moment. Please try again later" };
        }
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: 'Failed to resend MFA link. Please refresh and try again' };
        }
        devLog(environment, 'The MFA link has been resent successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error('Error resending MFA link:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: 'Unexpected error occurred while resending MFA link. Please try again later.' };
    }
}
async function saveCardOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.SAVE_CARD_ON_MFA_SUCCESS}`;
    devLog(environment, "Save Card On MFA Success Request Details:", {
        url,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            "X-SW-API-KEY": `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${operationsToken}`,
                "X-SW-API-KEY": userScopedAccessToken
            },
            body: JSON.stringify(requestBody)
        });
        devLog(environment, "Save Card On MFA Success Response Status:", response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, "Save Card On MFA Success Response Data:", responseData);
        if (responseData.status === 400) {
            devLog(environment, "Validation Error Response:", responseData);
            return {
                success: false,
                message: "We couldn't save your card details at the moment. Please try again later."
            };
        }
        if (!response.ok) {
            console.error("API Error Response:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: "Failed to save card details. Please refresh and try again." };
        }
        devLog(environment, 'Save Card on MFA success executed successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error("Error saving card on MFA success:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: "Unexpected error occurred while saving card details. Please try again later." };
    }
}
async function saveBankOnMfaSuccess(operationsToken, userScopedAccessToken, requestBody, environment = Environment.PRODUCTION) {
    const apiConfig = getApiConfig(environment);
    const url = `${apiConfig.BASE_URL}${apiConfig.RELATIVE_URLS.SAVE_BANK_ON_MFA_SUCCESS}`;
    devLog(environment, "Save Bank On MFA Success Request Details:", {
        url,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${operationsToken.substring(0, 5)}...${operationsToken.substring(operationsToken.length - 5)}`,
            "X-SW-API-KEY": `${userScopedAccessToken.substring(0, 5)}...${userScopedAccessToken.substring(userScopedAccessToken.length - 5)}`
        },
        body: JSON.stringify(requestBody)
    });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${operationsToken}`,
                "X-SW-API-KEY": userScopedAccessToken
            },
            body: JSON.stringify(requestBody)
        });
        devLog(environment, "Save Bank On MFA Success Response Status:", response.status, response.statusText);
        const responseData = await response.json();
        devLog(environment, "Save Bank On MFA Success Response Data:", responseData);
        if (responseData.status === 400) {
            devLog(environment, "Validation Error Response:", responseData);
            return {
                success: false,
                message: "We couldn't save your bank details at the moment. Please try again later."
            };
        }
        if (!response.ok) {
            console.error("API Error Response:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            return { success: false, message: "Failed to save bank details. Please refresh and try again." };
        }
        devLog(environment, 'Save Bank on MFA success executed successfully:', responseData);
        return { success: true, data: responseData };
    }
    catch (error) {
        console.error("Error saving bank on MFA success:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return { success: false, message: "Unexpected error occurred while saving bank details. Please try again later." };
    }
}

/* -------------------------------------------------------------------------- */
/* ------------------------- Resend MFA Link Payload ------------------------ */
/* -------------------------------------------------------------------------- */
function buildResendMfaLinkPayload(addRequestPayload, // can be card or bank payload
initialMfaResponse) {
    return {
        firstName: addRequestPayload?.payorInformation?.firstName,
        lastName: addRequestPayload?.payorInformation?.lastName,
        dateofBirth: addRequestPayload?.payorInformation?.dateofBirth,
        emailAddress: addRequestPayload?.payorInformation?.contactInformation?.emailAddress,
        phoneNumber: addRequestPayload?.payorInformation?.contactInformation?.phoneNumber,
        address: {
            addressLine1: addRequestPayload?.billingAddress?.addressLine1,
            addressLine2: addRequestPayload?.billingAddress?.addressLine2,
            city: addRequestPayload?.billingAddress?.city,
            provinceOrStateCode: addRequestPayload?.billingAddress?.provinceOrStateCode,
            postalCode: addRequestPayload?.billingAddress?.postalCode,
            countryCode: addRequestPayload?.billingAddress?.countryCode,
        },
        inquiryCorrelationId: initialMfaResponse?.data?.InquiryCorrelationId,
    };
}
function buildIdentityVerificationInformation(mfaData, newInquiryId) {
    return {
        inquiryCorrelationId: mfaData?.InquiryCorrelationId,
        mfaStatus: 3,
        trustLevel: mfaData?.TrustLevel,
        inquiryId: newInquiryId || mfaData?.MfaInquiryId,
        isAddressVerified: !mfaData?.IsAddressValidationFailed,
    };
}
function buildPayorInformation(requestPayload, mfaData, newInquiryId) {
    return {
        firstName: requestPayload?.payorInformation?.firstName,
        lastName: requestPayload?.payorInformation?.lastName,
        dateofBirth: requestPayload?.payorInformation?.dateofBirth,
        validateAddress: requestPayload?.payorInformation?.validateAddress,
        contactInformation: {
            emailAddress: requestPayload?.payorInformation?.contactInformation?.emailAddress,
            phoneNumber: requestPayload?.payorInformation?.contactInformation?.phoneNumber,
        },
        identityVerificationInformation: buildIdentityVerificationInformation(mfaData, newInquiryId),
    };
}
function buildBillingAddress(requestPayload) {
    return {
        addressLine1: requestPayload?.billingAddress?.addressLine1,
        addressLine2: requestPayload?.billingAddress?.addressLine2,
        city: requestPayload?.billingAddress?.city,
        provinceOrStateCode: requestPayload?.billingAddress?.provinceOrStateCode,
        postalCode: requestPayload?.billingAddress?.postalCode,
        countryCode: requestPayload?.billingAddress?.countryCode,
    };
}
// /**
// * Build the SaveCardOnMfaSuccess payload from addCardRequestPayload + initialMfaResponse
// */
function buildSaveCardOnMfaSuccessPayload(addCardRequestPayload, initialMfaResponse, newInquiryId) {
    const mfaData = initialMfaResponse?.data;
    return {
        payorInformation: buildPayorInformation(addCardRequestPayload, mfaData, newInquiryId),
        accountReferenceId: addCardRequestPayload?.accountReferenceId,
        billingAddress: buildBillingAddress(addCardRequestPayload),
        cardNumber: addCardRequestPayload?.cardNumber,
        expirationMonth: addCardRequestPayload?.expirationMonth,
        expirationYear: addCardRequestPayload?.expirationYear,
    };
}
// /**
// * Build the SaveBankOnMfaSuccess payload from addBankRequestPayload + initialMfaResponse
// */
function buildSaveBankOnMfaSuccessPayload(addBankRequestPayload, initialMfaResponse, newInquiryId) {
    const mfaData = initialMfaResponse?.data;
    return {
        payorInformation: buildPayorInformation(addBankRequestPayload, mfaData, newInquiryId),
        accountReferenceId: addBankRequestPayload?.accountReferenceId,
        billingAddress: buildBillingAddress(addBankRequestPayload),
        accountNumber: addBankRequestPayload?.accountNumber,
        routingNumber: addBankRequestPayload?.routingNumber,
        bankAccountType: addBankRequestPayload?.bankAccountType,
    };
}

const mfaModelPopUpModuleCss = ".action-modal .modal-footer .button-box .primary-btn,.action-modal .modal-footer .button-box .secondarybtn{background-image:none;border-radius:12px;box-shadow:none;box-sizing:border-box;font-family:\"Inter\", sans-serif;font-size:14px;font-weight:700;height:48px;line-height:14px;padding:16px;text-align:center;text-shadow:none;cursor:pointer}.popup{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.5);display:flex;justify-content:center;align-items:center;z-index:999}.action-modal{position:absolute;top:80px;border-radius:12px;background:white;display:flex;flex-direction:column;gap:24px;opacity:1;padding:40px}.action-modal .modal-container{display:flex;flex-direction:column;gap:24px;width:237px;margin:0 auto}.action-modal .modal-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #e9eaeb}.action-modal .modal-header h3{font-family:\"p22-mackinac-pro\";font-weight:800;font-size:24px;margin:0;line-height:27px;color:#282829}.action-modal .modal-body{padding:0}.action-modal .modal-body .dialogContentText{font-family:\"Inter\", sans-serif;font-weight:400;font-size:14px;color:#282829;line-height:21px}.action-modal .modal-body .highlight{font-weight:700;font-style:normal}.action-modal .modal-body .time-highlight{font-weight:700;color:#d01a1f}.action-modal .modal-footer{background-color:transparent;box-shadow:none;padding-top:4px;display:flex;flex-direction:column;align-items:stretch}.action-modal .modal-footer .button-box{display:flex;flex-direction:column;gap:14px;width:100%}.action-modal .modal-footer .button-box .secondarybtn{background-color:#FFFFFF;border:1.5px solid #e9eaeb;color:#282829;width:100%}.action-modal .modal-footer .button-box .primary-btn{background-color:#282829;border:1px solid #282829;color:#FFFFFF;width:100%}.action-modal .modal-footer .button-box .primary-btn[disabled]{background-color:#e9eaeb;border-color:#e9eaeb;color:#9ba3a7;cursor:default}@media (min-width: 545px){.action-modal{padding:40px}.action-modal .modal-container{width:440px;margin:0 auto;gap:24px}.action-modal .modal-footer{align-items:center}.action-modal .modal-footer .button-box{display:flex;flex-direction:row;justify-content:flex-end;gap:8px;width:100%}.action-modal .modal-footer .button-box .secondarybtn,.action-modal .modal-footer .button-box .primary-btn{width:fit-content}}";

const MfaModelPopUP = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.successEvent = createEvent(this, "successEvent");
    }
    operationsToken;
    userScopedAccessToken;
    environment; // Environment parameter with production default
    onClose;
    mfaResponse = null;
    addRequestPayload;
    initialMfaResponse;
    requestType;
    time = 60; // 1 minutes in seconds
    isRunning = true;
    currentInquiryId = '';
    timer;
    countdownIntervalId;
    pollingIntervalId;
    errorHandler;
    accountSubmissionSuccess = null;
    noOfAttempts = 2;
    timeoutId;
    successEvent;
    handleIsRunningTrue(newValue) {
        if (newValue === true) {
            this.handleStart();
        }
    }
    handleIsRunningFalse(newValue) {
        if (newValue === false) {
            this.handleStop();
        }
    }
    handleStart() {
        this.startCountdownTimer();
        this.scheduleMfaStatusPolling();
    }
    handleStop() {
        this.stopCountdownTimer();
        this.clearPollingTimers();
    }
    componentWillLoad() {
        this.currentInquiryId = this.initialMfaResponse?.data?.MfaInquiryId || '';
    }
    componentDidLoad() {
        if (this.isRunning) {
            this.startCountdownTimer();
            this.scheduleMfaStatusPolling();
        }
    }
    scheduleMfaStatusPolling() {
        const getMfaStatusAndSetInterval = () => {
            this.pollingIntervalId = setInterval(async () => {
                const response = await getMfaStatus(this.operationsToken, this.userScopedAccessToken, this.currentInquiryId, this.environment);
                if (response.success) {
                    this.mfaResponse = response.data;
                }
                else {
                    const msg = response.message ?? 'Unexpected error. Please refresh or try again later.';
                    // send error up to parent
                    if (this.errorHandler) {
                        this.errorHandler([msg]);
                    }
                    // stop polling when error occurs
                    this.handleCancel();
                }
            }, this.recurringInterval * 1000);
        };
        this.timeoutId = setTimeout(() => {
            getMfaStatusAndSetInterval();
        }, this.startInterval * 1000);
    }
    async handleMfaResponseChanged(newValue) {
        if (!newValue)
            return;
        if (newValue.mfaStatus === MFAStatusEnum.Pass) {
            this.clearPollingTimers();
            let payload;
            let response;
            if (this.requestType === 'card') {
                payload = buildSaveCardOnMfaSuccessPayload(this.addRequestPayload, this.initialMfaResponse, this.currentInquiryId);
                response = await saveCardOnMfaSuccess(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            }
            else if (this.requestType === 'bank') {
                payload = buildSaveBankOnMfaSuccessPayload(this.addRequestPayload, this.initialMfaResponse, this.currentInquiryId);
                response = await saveBankOnMfaSuccess(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            }
            if (response.success) {
                this.accountSubmissionSuccess = response.data;
            }
            else {
                const msg = response.message ?? 'Unexpected error while saving card.';
                if (this.errorHandler) {
                    this.errorHandler([msg]);
                }
                // stop polling when error occurs
                this.handleCancel();
            }
        }
        else if (newValue.mfaStatus === MFAStatusEnum.Failed) {
            this.clearPollingTimers();
            const msg = 'Your MFA verification has failed. Please try again or use a different payment method.';
            // send error up to parent
            if (this.errorHandler) {
                this.errorHandler([msg]);
            }
            this.handleCancel(); // close popup
        }
    }
    handleAccountSubmissionSuccessChanged(newValue) {
        if (!newValue)
            return;
        if (newValue?.resultMessage === 'Success' &&
            newValue?.paymentInstrument) {
            this.successEvent.emit({ data: newValue });
            this.handleCancel();
        }
    }
    clearPollingTimers() {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    startCountdownTimer() {
        this.countdownIntervalId = setInterval(() => {
            if (this.time > 0) {
                this.time = this.time - 1;
            }
            else {
                this.isRunning = false;
                if (this.noOfAttempts === 0) {
                    const msg = 'You have reached the maximum number of MFA attempts. Please use a different payment method.';
                    if (this.errorHandler) {
                        this.errorHandler([msg]);
                    }
                    this.handleCancel(); // Cancel if no attempts left
                }
                clearInterval(this.countdownIntervalId);
            }
        }, 1000);
    }
    stopCountdownTimer() {
        clearInterval(this.countdownIntervalId);
    }
    disconnectedCallback() {
        this.stopCountdownTimer();
        this.clearPollingTimers();
    }
    handleResendLinkClick = async () => {
        if (this.noOfAttempts > 0) {
            this.noOfAttempts = this.noOfAttempts - 1;
            // build the payload using the builder
            const payload = buildResendMfaLinkPayload(this.addRequestPayload, this.initialMfaResponse);
            // call the service
            const response = await resendMfaLink(this.operationsToken, this.userScopedAccessToken, payload, this.environment);
            if (response.success) {
                // update inquiryId with the new one from backend
                this.currentInquiryId = response.data?.inquiryId || '';
                this.time = 60;
                this.isRunning = true;
            }
            else {
                const msg = response.message ?? 'Unexpected error. Please refresh or try again later.';
                if (this.errorHandler) {
                    this.errorHandler([msg]);
                }
                // stop polling when error occurs
                this.handleCancel();
            }
        }
    };
    handleCancel = () => {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.countdownIntervalId) {
            clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
        }
        this.onClose();
    };
    get mfaPoolSettings() {
        return this.initialMfaResponse?.data?.MfaPoolSettings || '20-5'; // fallback if missing
    }
    get mobileNumberLastFourDigits() {
        const mobile = this.addRequestPayload?.payorInformation?.contactInformation?.phoneNumber || '';
        return mobile.length >= 4 ? mobile.slice(-4) : mobile;
    }
    get startInterval() {
        const [start] = this.mfaPoolSettings?.split('-') || [];
        return Number(start);
    }
    get recurringInterval() {
        const [, recurring] = this.mfaPoolSettings?.split('-') || [];
        return Number(recurring);
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    getAttemptLabel() {
        return this.noOfAttempts === 1 || this.noOfAttempts === 0 ? 'attempt' : 'attempts';
    }
    render() {
        return (h("div", { key: '5de043eea173405086f78a6e185e4d80b48ed81f', class: "popup" }, h("div", { key: '3c3352e1f220f4ee5aaa7ac171bb2da6ca119bd5', class: "action-modal" }, h("div", { key: '895772d846b9e6a5f5739ce998631e1a60cbeee2', class: "modal-container" }, h("div", { key: 'a4ab42afb23c614bec19b23b41d52200034e8241', class: "modal-header" }, h("h3", { key: '22e77c17a562b26cab4dc05e947e4f02ba37cf5d' }, "Verification Link Sent")), h("div", { key: '66b16cbbf996f68c603413aaf16a8cfdab814469', class: "modal-body" }, h("p", { key: '9e26756546f5a85bb50d9d2a04877b78774611ca', class: "dialogContentText" }, "A verification link has been sent to your ", h("span", { key: 'beb3ef90f640e49857fad56d1935e3c4cc95a0e7', class: "highlight" }, "mobile number ending in ", this.mobileNumberLastFourDigits, "."), h("br", { key: 'bbd0feb709fc2295df6c2952e29d1c1359c64809' }), "Please tap the link and follow the instructions to confirm your identity.", h("br", { key: '66c011c5c5d70fc71ada769fa65c7a407ace6a39' }), h("br", { key: 'e69b20f14910a18c8036e0f13a64a612c4106ada' }), "The link will expire in ", h("span", { key: 'b7f974b1b09a05ba2e54c6bba8c1b6ea691edc45', class: "time-highlight" }, this.formatTime(this.time)), ".", h("br", { key: 'a86388a63e57e3f807f79e6ce092df3846d2ff25' }), "You have ", this.noOfAttempts, " remaining ", this.getAttemptLabel(), " to resend the link if needed."), h("div", { key: 'e4453569af76aa3d57958810180a9a413ee81642', class: "modal-footer" }, h("div", { key: '57947d11ec1f9479a87081c596442a3674bcfd19', class: "button-box" }, h("button", { key: '213402979888e5227f5b9adec8133bc26178a6c2', class: "secondarybtn", onClick: this.handleCancel }, "Cancel"), h("button", { key: '543da21f48b02a8f383b5639815b905f9941405c', class: "primary-btn", disabled: this.isRunning, onClick: this.handleResendLinkClick }, "Resend Link"))))))));
    }
    static get watchers() { return {
        "isRunning": ["handleIsRunningTrue", "handleIsRunningFalse"],
        "mfaResponse": ["handleMfaResponseChanged"],
        "accountSubmissionSuccess": ["handleAccountSubmissionSuccessChanged"]
    }; }
};
MfaModelPopUP.style = mfaModelPopUpModuleCss;

export { DatePicker as date_picker, MfaModelPopUP as mfa_model_popup };
//# sourceMappingURL=date-picker.mfa-model-popup.entry.js.map

//# sourceMappingURL=date-picker_2.entry.js.map