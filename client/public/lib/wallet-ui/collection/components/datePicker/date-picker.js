import { h } from "@stencil/core";
export class DatePicker {
    el;
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
    static get is() { return "date-picker"; }
    static get originalStyleUrls() {
        return {
            "$": ["date-picker.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["date-picker.css"]
        };
    }
    static get properties() {
        return {
            "value": {
                "type": "string",
                "attribute": "value",
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
            "placeholder": {
                "type": "string",
                "attribute": "placeholder",
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
                "defaultValue": "'MM/DD/YYYY'"
            },
            "inputId": {
                "type": "string",
                "attribute": "input-id",
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
                "defaultValue": "'date-input'"
            },
            "minAge": {
                "type": "number",
                "attribute": "min-age",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false
            }
        };
    }
    static get states() {
        return {
            "inputValue": {},
            "isDatePickerOpen": {},
            "selectedDate": {},
            "isYearPickerOpen": {},
            "isSelectingMonth": {},
            "isSelectingYear": {},
            "yearRangeStart": {}
        };
    }
    static get events() {
        return [{
                "method": "dateChange",
                "name": "dateChange",
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
    static get watchers() {
        return [{
                "propName": "value",
                "methodName": "valueChanged"
            }];
    }
}
//# sourceMappingURL=date-picker.js.map
