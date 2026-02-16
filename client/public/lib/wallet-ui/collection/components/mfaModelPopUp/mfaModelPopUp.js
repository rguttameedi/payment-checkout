import { h } from "@stencil/core";
import { MFAStatusEnum } from "../../interfaces/common";
import { getMfaStatus, resendMfaLink, saveBankOnMfaSuccess, saveCardOnMfaSuccess } from "../../utils/mfaService";
import { buildResendMfaLinkPayload, buildSaveBankOnMfaSuccessPayload, buildSaveCardOnMfaSuccessPayload } from "./mfaPayloadBuilder";
export class MfaModelPopUP {
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
    static get is() { return "mfa-model-popup"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["mfaModelPopUp.module.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["mfaModelPopUp.module.css"]
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
                "reflect": false
            },
            "onClose": {
                "type": "unknown",
                "attribute": "on-close",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "addRequestPayload": {
                "type": "any",
                "attribute": "add-request-payload",
                "mutable": false,
                "complexType": {
                    "original": "any",
                    "resolved": "any",
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
            "initialMfaResponse": {
                "type": "any",
                "attribute": "initial-mfa-response",
                "mutable": false,
                "complexType": {
                    "original": "any",
                    "resolved": "any",
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
            "requestType": {
                "type": "string",
                "attribute": "request-type",
                "mutable": false,
                "complexType": {
                    "original": "'card' | 'bank'",
                    "resolved": "\"bank\" | \"card\"",
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
            "errorHandler": {
                "type": "unknown",
                "attribute": "error-handler",
                "mutable": false,
                "complexType": {
                    "original": "(messages: string[]) => void",
                    "resolved": "(messages: string[]) => void",
                    "references": {}
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
            "mfaResponse": {},
            "time": {},
            "isRunning": {},
            "currentInquiryId": {},
            "accountSubmissionSuccess": {},
            "noOfAttempts": {}
        };
    }
    static get events() {
        return [{
                "method": "successEvent",
                "name": "successEvent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "any",
                    "resolved": "any",
                    "references": {}
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "isRunning",
                "methodName": "handleIsRunningTrue"
            }, {
                "propName": "isRunning",
                "methodName": "handleIsRunningFalse"
            }, {
                "propName": "mfaResponse",
                "methodName": "handleMfaResponseChanged"
            }, {
                "propName": "accountSubmissionSuccess",
                "methodName": "handleAccountSubmissionSuccessChanged"
            }];
    }
}
//# sourceMappingURL=mfaModelPopUp.js.map
