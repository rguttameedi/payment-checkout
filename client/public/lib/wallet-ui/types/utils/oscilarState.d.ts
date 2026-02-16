interface OscilarState {
    transactionID: string | null;
    tabID: string | null;
}
export declare const setOscilarIDs: (transactionID: string, tabID: string) => void;
export declare const getOscilarIDs: () => OscilarState;
export {};
