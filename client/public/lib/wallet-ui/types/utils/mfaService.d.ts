import { ResendMfaLinkRequest, SaveBankOnMfaSuccessRequest, SaveCardOnMfaSuccessRequest } from "../components/mfaModelPopUp/mfaPayloadBuilder";
import { Environment } from "../config";
export declare function getMfaStatus(operationsToken: string, userScopedAccessToken: string, mfainquiryId: string, environment?: Environment): Promise<any>;
export declare function resendMfaLink(operationsToken: string, userScopedAccessToken: string, requestBody: ResendMfaLinkRequest, environment?: Environment): Promise<any>;
export declare function saveCardOnMfaSuccess(operationsToken: string, userScopedAccessToken: string, requestBody: SaveCardOnMfaSuccessRequest, environment?: Environment): Promise<any>;
export declare function saveBankOnMfaSuccess(operationsToken: string, userScopedAccessToken: string, requestBody: SaveBankOnMfaSuccessRequest, environment?: Environment): Promise<any>;
