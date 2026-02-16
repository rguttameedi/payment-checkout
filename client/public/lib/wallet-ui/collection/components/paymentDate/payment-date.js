import { h } from "@stencil/core";
import flatpickr from "flatpickr";
export class PaymentDate {
    el;
    // Helper function to conditionally log only in development
    // Since this component doesn't have environment context, we'll default to not logging
    devLog = (message, ...args) => {
        // Only log if explicitly in development mode (can be detected via hostname or other means)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(message, ...args);
        }
    };
    updateDate;
    componentDidLoad() {
        const displayElement = this.el.querySelector('#paymentDate');
        const appendElement = this.el.querySelector('#payementDateWrapper');
        flatpickr(displayElement, { appendTo: appendElement, dateFormat: "m/d/Y", inline: true });
    }
    handleDateSelect = (event) => {
        this.devLog('Payment date selected:', event);
        const selectedDate = event.target.value;
        // this.selectedPaymentMethod = selectedOption;
        // this.selectOption.emit(selectedOption);
        // this.collapseSection(this.el.shadowRoot.querySelector('#paymentListContainer'));
        // this.el.shadowRoot.querySelector('#picklist').classList.add('collapsed');
        this.updateDate.emit(selectedDate);
    };
    render() {
        return (h("div", { key: '73f8510c7506ee76ab11ccad613dae5edc45f073', class: "payment-date", id: "payementDateWrapper" }, h("input", { key: 'd03bb82f4924294eaf680df40adc82f68511de32', type: "text", id: "paymentDate", class: "payment-date-input", placeholder: "MM/DD/YYYY", onChange: this.handleDateSelect })));
    }
    static get is() { return "payment-date"; }
    static get originalStyleUrls() {
        return {
            "$": ["payment-date.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["payment-date.css"]
        };
    }
    static get events() {
        return [{
                "method": "updateDate",
                "name": "updateDate",
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
//# sourceMappingURL=payment-date.js.map
