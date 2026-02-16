import { p as proxyCustomElement, H, c as createEvent, h } from './index.js';

const datePickerCss = ".date-picker-wrapper{position:relative;display:inline-block;width:100%;box-sizing:border-box}.date-picker-wrapper input{width:100%;padding-right:40px;box-sizing:border-box}.date-picker-icon{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none !important;border:none;cursor:pointer;padding:5px;display:flex;align-items:center;justify-content:center;color:#666;width:auto !important;height:auto !important;min-width:auto !important}.date-picker-icon:hover{color:#333;background:none !important;transform:translateY(-50%)}.date-picker-icon:focus{outline:none;background:none !important}.date-picker-icon:active{background:none !important;transform:translateY(-50%)}.date-picker-dropdown{position:absolute;bottom:100%;left:0;margin-bottom:4px;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 -4px 6px rgba(0, 0, 0, 0.1);z-index:1000;width:320px !important;min-width:320px !important;max-width:320px !important;max-height:400px;overflow:hidden;box-sizing:border-box}.date-picker-header{padding:12px;border-bottom:1px solid #eee;background-color:#f8f9fa;width:100%;box-sizing:border-box}.date-picker-selectors{display:flex;gap:8px;align-items:center;justify-content:center;width:100%;box-sizing:border-box}.date-picker-month-select{flex:1;min-width:120px;max-width:180px;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:14px;background-color:white;cursor:pointer;box-sizing:border-box}.date-picker-month-select:hover{background-color:#f5f5f5}.date-picker-month-select:focus{outline:2px solid #007bff;outline-offset:2px}.date-picker-year-button{padding:6px 12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;white-space:nowrap}.date-picker-year-button:hover{background-color:#f5f5f5}.date-picker-year-button:focus{outline:2px solid #007bff;outline-offset:2px}.year-picker-navigation{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%}.year-nav-button{width:40px;height:40px;flex-shrink:0;padding:8px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}.year-nav-button:hover:not(:disabled){background-color:#f5f5f5}.year-nav-button:disabled{opacity:0.5;cursor:not-allowed}.year-nav-button:active:not(:disabled){background-color:#e9ecef}.year-nav-button:focus{outline:2px solid #007bff;outline-offset:2px}.year-range-button{flex:1;height:40px;padding:8px 12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}.year-range-button:hover{background-color:#f5f5f5}.year-range-button:active{background-color:#e9ecef}.date-picker-calendar-wrapper{max-height:280px;overflow-y:auto;overflow-x:hidden;width:100%;box-sizing:border-box}.date-picker-calendar{width:100%;border-collapse:collapse;table-layout:fixed}.date-picker-calendar thead th{padding:8px;text-align:center;font-weight:600;color:#666;font-size:12px;border-bottom:1px solid #eee}.date-picker-calendar tbody td{padding:2px;text-align:center}.date-picker-day{width:100%;padding:8px;border:none;background:none;cursor:pointer;border-radius:4px;font-size:14px;transition:background-color 0.2s}.date-picker-day:hover{background-color:#e9ecef}.date-picker-day.selected{background-color:#007bff;color:white}.date-picker-day.selected:hover{background-color:#0056b3}.date-picker-day.today{border:2px solid #007bff;font-weight:bold}.year-picker-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;padding:12px;max-height:320px;overflow-y:auto;width:100%;box-sizing:border-box}.year-picker-item{padding:12px;border:1px solid #ddd;border-radius:4px;background-color:white;cursor:pointer;font-size:14px;transition:background-color 0.2s}.year-picker-item:hover{background-color:#e9ecef}.year-picker-item.selected{background-color:#007bff;color:white;border-color:#007bff}.year-picker-item.selected:hover{background-color:#0056b3}.year-picker-item.today{border:2px solid #007bff;font-weight:bold}";

const DatePicker = /*@__PURE__*/ proxyCustomElement(class DatePicker extends H {
    constructor() {
        super();
        this.__registerHost();
        this.dateChange = createEvent(this, "dateChange");
    }
    get el() { return this; }
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
    static get style() { return datePickerCss; }
}, [0, "date-picker", {
        "value": [1],
        "placeholder": [1],
        "inputId": [1, "input-id"],
        "minAge": [2, "min-age"],
        "inputValue": [32],
        "isDatePickerOpen": [32],
        "selectedDate": [32],
        "isYearPickerOpen": [32],
        "isSelectingMonth": [32],
        "isSelectingYear": [32],
        "yearRangeStart": [32]
    }, undefined, {
        "value": ["valueChanged"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["date-picker"];
    components.forEach(tagName => { switch (tagName) {
        case "date-picker":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, DatePicker);
            }
            break;
    } });
}
defineCustomElement();

export { DatePicker as D, defineCustomElement as d };
//# sourceMappingURL=p-Cd2Eytzd.js.map

//# sourceMappingURL=p-Cd2Eytzd.js.map