import { Environment, getOscilarScriptUrl } from "../config";
import { setOscilarIDs } from "./oscilarState";
class OscilarService {
    // Holds the single instance of the service
    static instance;
    // Configuration
    scriptId = 'oscilar-script';
    defaultTimeout = 5000; // 5 seconds
    // State
    scriptLoadPromise = null;
    scriptElement = null;
    debug = process.env.NODE_ENV !== 'production';
    scriptLoadRetryCount = 0;
    maxRetries = 1;
    constructor() { }
    // Ensures only one instance exists throughout the application
    static getInstance() {
        if (!OscilarService.instance) {
            OscilarService.instance = new OscilarService();
        }
        return OscilarService.instance;
    }
    /**
     * Loads the Oscilar script and returns a promise that resolves with the device IDs
     * @param environment The current environment (production, staging, localdevelopment)
     * @param timeoutMs Optional timeout in milliseconds (default: 5000)
     */
    validateOscilarUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Only allow Oscilar domains
            const allowedHosts = ['oscilar.com', 'zqp.oscilar.com', 'zqp-sand.oscilar.com'];
            const isAllowed = allowedHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
            if (!isAllowed) {
                this.log(`Invalid Oscilar URL host: ${parsedUrl.hostname}`, 'error');
                return false;
            }
            // Only allow HTTPS
            if (parsedUrl.protocol !== 'https:') {
                this.log(`Oscilar URL must use HTTPS, got: ${parsedUrl.protocol}`, 'error');
                return false;
            }
            return true;
        }
        catch (error) {
            this.log(`Invalid Oscilar URL format: ${url}`, 'error');
            return false;
        }
    }
    loadScript(environment, timeoutMs = this.defaultTimeout) {
        // Validate environment
        if (!Object.values(Environment).includes(environment)) {
            return Promise.reject(new Error(`Invalid environment: ${environment}`));
        }
        // Get the script URL and validate it
        const scriptUrl = this.getOscilarScriptUrl(environment);
        if (!this.validateOscilarUrl(scriptUrl)) {
            return Promise.reject(new Error(`Invalid Oscilar script URL: ${scriptUrl}. Only HTTPS connections to approved Oscilar domains are allowed.`));
        }
        // Return existing promise if script is already loading/loaded
        if (this.scriptLoadPromise !== null) {
            this.log('Using existing script load promise');
            return this.scriptLoadPromise;
        }
        this.scriptLoadPromise = new Promise((resolve, reject) => {
            // Early return if document is not available (SSR)
            if (typeof document === 'undefined') {
                reject(new Error('Document is not available'));
                return;
            }
            // Check if script is already loaded in the DOM
            if (document.getElementById(this.scriptId)) {
                this.handleExistingScript(resolve, reject);
                return;
            }
            // Create and configure script element
            this.scriptElement = document.createElement('script');
            this.scriptElement.id = this.scriptId;
            this.scriptElement.defer = true;
            this.scriptElement.type = 'text/javascript';
            this.scriptElement.src = scriptUrl;
            // Set up timeout for script loading
            const timeoutId = setTimeout(() => {
                reject(new Error('Oscilar script load timeout'));
            }, timeoutMs);
            // Handle script load success
            this.scriptElement.onload = async () => {
                this.scriptLoadRetryCount = 0;
                clearTimeout(timeoutId);
                try {
                    const oscilarIDs = await new Promise((res, rej) => this.initializeOscilar(res, rej));
                    // Call commit after we successfully get IDs
                    this.commit();
                    resolve(oscilarIDs);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    reject(new Error(`Failed to initialize Oscilar: ${errorMessage}`));
                }
            };
            // Handle script load error
            this.scriptElement.onerror = () => {
                clearTimeout(timeoutId);
                // Clean up the failed script
                if (this.scriptElement?.parentNode) {
                    this.scriptElement.parentNode.removeChild(this.scriptElement);
                }
                this.scriptElement = null;
                if (this.scriptLoadRetryCount < this.maxRetries) {
                    this.scriptLoadRetryCount++;
                    this.log('Retrying script load...');
                    setTimeout(() => {
                        this.scriptLoadPromise = null;
                        this.loadScript(environment)
                            .then(resolve)
                            .catch(reject);
                    }, 100);
                    return;
                }
                this.scriptLoadPromise = null;
                const errorMsg = 'Failed to load Oscilar script. verify that your Content Security Policy (CSP) allows loading scripts from oscilar.com';
                this.log(errorMsg, 'error');
                reject(new Error(errorMsg));
            };
            // Add script to document
            document.head.appendChild(this.scriptElement);
        });
        return this.scriptLoadPromise;
    }
    // Check for existing script
    handleExistingScript(resolve, reject) {
        this.log('Found existing Oscilar script, initializing...');
        const existingScript = document.getElementById(this.scriptId);
        if (existingScript && window['__ojsdk__']?.getIDs) {
            this.initializeOscilar(resolve, reject);
        }
        else {
            const errorMsg = 'Oscilar script element exists but SDK not initialized';
            this.log(errorMsg, 'error');
            reject(new Error(errorMsg));
        }
    }
    // Logs debug information in development mode
    log(message, level = 'log') {
        if (!this.debug)
            return;
        const timestamp = new Date().toISOString();
        const logMessage = `[OscilarService][${timestamp}] ${message}`;
        switch (level) {
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
                console.error(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
    // Initializes the Oscilar SDK
    initializeOscilar(resolve, reject) {
        this.log('Initializing Oscilar SDK...');
        try {
            const __ojsdk__ = window['__ojsdk__'] = window['__ojsdk__'] || {};
            // Check if Oscilar is already initialized with IDs
            if (__ojsdk__.transactionID && __ojsdk__.tabID) {
                const existingIds = {
                    transactionID: __ojsdk__.transactionID,
                    tabID: __ojsdk__.tabID
                };
                if (this.validateOscilarIDs(existingIds)) {
                    this.log('Using existing Oscilar IDs', 'log');
                    setOscilarIDs(existingIds.transactionID, existingIds.tabID);
                    resolve(existingIds);
                    return;
                }
                else {
                    this.log('Found existing but invalid Oscilar IDs', 'warn');
                }
            }
            // If not already initialized, set up the callback
            __ojsdk__.getIDs = __ojsdk__.getIDs || [];
            const callback = (ojsIDs) => {
                if (this.validateOscilarIDs(ojsIDs)) {
                    // Store IDs in the shared state
                    setOscilarIDs(ojsIDs.transactionID, ojsIDs.tabID);
                    // Resolve the promise with the IDs
                    resolve(ojsIDs);
                    // Callback for the current operation
                }
                else {
                    const errorMsg = 'Invalid Oscilar IDs received';
                    this.log(errorMsg, 'error');
                    reject(new Error(errorMsg));
                }
            };
            __ojsdk__.getIDs.push(callback);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorMsg = `Failed to initialize Oscilar: ${errorMessage}`;
            this.log(errorMsg, 'error');
            reject(new Error(errorMsg));
        }
    }
    // Validate that the received Oscilar IDs are in the correct format
    validateOscilarIDs(ids) {
        return !!(ids &&
            typeof ids === 'object' &&
            typeof ids.transactionID === 'string' &&
            typeof ids.tabID === 'string' &&
            ids.transactionID.length > 0 &&
            ids.tabID.length > 0);
    }
    // Get the Oscilar script URL for the given environment
    getOscilarScriptUrl(environment) {
        return getOscilarScriptUrl(environment);
    }
    /**
     * Commits data to Oscilar
     * @param userID - Optional user identifier
     * @param sessionID - Optional session identifier
     */
    commit(userID, sessionID) {
        try {
            // Type-safe window access with fallback
            const win = window;
            const oscilar = win.__ojsdk__ = win.__ojsdk__ || {};
            // Initialize commit array if it doesn't exist
            oscilar.commit = oscilar.commit || [];
            // Create the commit data object
            const commitData = {};
            // Only add properties if they are provided
            if (userID)
                commitData.userID = userID;
            if (sessionID)
                commitData.sessionID = sessionID;
            // Push the commit data
            oscilar.commit.push(commitData);
            this.log(`Data committed to Oscilar - ${Object.keys(commitData).length ? JSON.stringify(commitData) : 'empty object'}`);
        }
        catch (error) {
            this.log(`Error committing to Oscilar: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            // Fail silently in production
        }
    }
}
export const oscilarService = OscilarService.getInstance();
//# sourceMappingURL=oscilarService.js.map
