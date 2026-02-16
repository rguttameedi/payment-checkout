export const isValidPOBoxAddess = (value) => {
    const poBoxRegex = /^\s*(?:p[\W_]*[o0]?|post(?:al)?)\s*(?:(?:[\W_]*[o0]ffice)?[\W_]*(?:b[o0]x|bin)|[\W_]*[o0]ffice)\s*(?:\d+)?\s*$/im;
    return poBoxRegex.test(value);
};
//# sourceMappingURL=validations.js.map
