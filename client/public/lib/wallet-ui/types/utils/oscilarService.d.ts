import { Environment } from '../config';
interface OscilarIDs {
    transactionID: string;
    tabID: string;
}
declare class OscilarService {
    private static instance;
    private readonly scriptId;
    private readonly defaultTimeout;
    private scriptLoadPromise;
    private scriptElement;
    private readonly debug;
    private scriptLoadRetryCount;
    private readonly maxRetries;
    private constructor();
    static getInstance(): OscilarService;
    /**
     * Loads the Oscilar script and returns a promise that resolves with the device IDs
     * @param environment The current environment (production, staging, localdevelopment)
     * @param timeoutMs Optional timeout in milliseconds (default: 5000)
     */
    private validateOscilarUrl;
    loadScript(environment: Environment, timeoutMs?: number): Promise<OscilarIDs>;
    private handleExistingScript;
    private log;
    private initializeOscilar;
    private validateOscilarIDs;
    private getOscilarScriptUrl;
    /**
     * Commits data to Oscilar
     * @param userID - Optional user identifier
     * @param sessionID - Optional session identifier
     */
    commit(userID?: string, sessionID?: string): void;
}
export declare const oscilarService: OscilarService;
export {};
