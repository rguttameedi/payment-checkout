export var AddressType;
(function (AddressType) {
    AddressType[AddressType["Primary"] = 1] = "Primary";
    AddressType[AddressType["Home"] = 2] = "Home";
    AddressType[AddressType["Work"] = 3] = "Work";
    AddressType[AddressType["Emergency"] = 4] = "Emergency";
    AddressType[AddressType["Billing"] = 5] = "Billing";
    AddressType[AddressType["Payor"] = 6] = "Payor";
})(AddressType || (AddressType = {}));
export var AccountStatus;
(function (AccountStatus) {
    AccountStatus[AccountStatus["Unknown"] = 0] = "Unknown";
    AccountStatus[AccountStatus["Saved"] = 1] = "Saved";
    AccountStatus[AccountStatus["AddressSuggested"] = 2] = "AddressSuggested";
    AccountStatus[AccountStatus["AddressValidationError"] = 3] = "AddressValidationError";
    AccountStatus[AccountStatus["AddressValidationSuccess"] = 4] = "AddressValidationSuccess";
    AccountStatus[AccountStatus["AddressValidationUnknownStatus"] = 5] = "AddressValidationUnknownStatus";
    AccountStatus[AccountStatus["IdentityValidationError"] = 6] = "IdentityValidationError";
    AccountStatus[AccountStatus["MFARequired"] = 7] = "MFARequired";
    AccountStatus[AccountStatus["IdentityValidationSuccess"] = 8] = "IdentityValidationSuccess";
    AccountStatus[AccountStatus["NachaValidationError"] = 9] = "NachaValidationError";
    AccountStatus[AccountStatus["NachaValidationFailed"] = 10] = "NachaValidationFailed";
    AccountStatus[AccountStatus["NachaValidationSuccess"] = 11] = "NachaValidationSuccess";
    AccountStatus[AccountStatus["MFAPending"] = 12] = "MFAPending";
    AccountStatus[AccountStatus["MFASuccess"] = 13] = "MFASuccess";
    AccountStatus[AccountStatus["MFAFailed"] = 14] = "MFAFailed";
})(AccountStatus || (AccountStatus = {}));
export var CardType;
(function (CardType) {
    CardType["VISA"] = "Visa";
    CardType["MASTERCARD"] = "Mastercard";
    CardType["AMEX"] = "Amex";
    CardType["DISCOVER"] = "Discover";
    CardType["DINERS"] = "Diners";
    CardType["JCB"] = "JCB";
    CardType["UNIONPAY"] = "UnionPay";
})(CardType || (CardType = {}));
export var BankAccountType;
(function (BankAccountType) {
    BankAccountType["Checking"] = "Checking";
    BankAccountType["Savings"] = "Savings";
})(BankAccountType || (BankAccountType = {}));
export var MFAStatusEnum;
(function (MFAStatusEnum) {
    MFAStatusEnum[MFAStatusEnum["Pending"] = 1] = "Pending";
    MFAStatusEnum[MFAStatusEnum["Failed"] = 2] = "Failed";
    MFAStatusEnum[MFAStatusEnum["Pass"] = 3] = "Pass";
})(MFAStatusEnum || (MFAStatusEnum = {}));
//# sourceMappingURL=common.js.map
