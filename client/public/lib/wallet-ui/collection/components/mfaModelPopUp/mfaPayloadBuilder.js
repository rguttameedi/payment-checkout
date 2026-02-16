/* -------------------------------------------------------------------------- */
/* ------------------------- Resend MFA Link Payload ------------------------ */
/* -------------------------------------------------------------------------- */
export function buildResendMfaLinkPayload(addRequestPayload, // can be card or bank payload
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
export function buildSaveCardOnMfaSuccessPayload(addCardRequestPayload, initialMfaResponse, newInquiryId) {
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
export function buildSaveBankOnMfaSuccessPayload(addBankRequestPayload, initialMfaResponse, newInquiryId) {
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
//# sourceMappingURL=mfaPayloadBuilder.js.map
