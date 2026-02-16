let oscilarState = {
    transactionID: null,
    tabID: null
};
export const setOscilarIDs = (transactionID, tabID) => {
    oscilarState = {
        transactionID,
        tabID
    };
};
export const getOscilarIDs = () => ({ ...oscilarState });
//# sourceMappingURL=oscilarState.js.map
