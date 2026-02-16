/**
 * NMI-specific directives for payment processing
 */
export interface NmiDirectives {
    /**
     * Merchant Defined Field 1 - Custom field for merchant-specific data
     * @example "PropertyID-12345"
     */
    merchantDefinedField1?: string;
    /**
     * Merchant Defined Field 2 - Custom field for merchant-specific data
     * @example "ResidentID-67890"
     */
    merchantDefinedField2?: string;
    /**
     * Merchant Defined Field 3 - Custom field for merchant-specific data
     * @example "LeaseID-ABCDE"
     */
    merchantDefinedField3?: string;
    /**
     * Whether to validate CVV before card tokenization
     * Set to false to skip CVV validation for card-present transactions using track data
     * @default true
     */
    validateCvv?: boolean;
    /**
     * Magnesafe Track 1 - Encrypted track 1 data from a MagneSafe card reader
     */
    magnesafeTrack1?: string;
    /**
     * Magnesafe Track 2 - Encrypted track 2 data from a MagneSafe card reader
     */
    magnesafeTrack2?: string;
    /**
     * MagneSafe Key Serial Number (KSN) - Unique identifier for the encryption key used
     */
    magnesafeKsn?: string;
    /**
     * MagneSafe Magneprint - Digital fingerprint of the magnetic stripe
     */
    magnesafeMagneprint?: string;
    /**
     * MagneSafe Magneprint Status - Status code indicating the quality/validity of the Magneprint
     */
    magnesafeMagneprintStatus?: string;
    /**
     * Track 1 - Unencrypted track 1 data from a magnetic stripe card
     */
    track1?: string;
    /**
     * Track 2 - Unencrypted track 2 data from a magnetic stripe card
     */
    track2?: string;
    /**
     * Track 3 - Unencrypted track 3 data from a magnetic stripe card
     */
    track3?: string;
}
/**
 * Jack Henry-specific directives for payment processing
 */
export interface JackHenryDirectives {
    /**
     * The Jack Henry Location ID where the account will be tokenized
     * @example 12345
     */
    locationId?: number;
    /**
     * The Jack Henry Entity ID where the account will be tokenized
     * @example 54322
     */
    entityId?: number;
}
/**
 * Vendor-specific directives for payment processing
 * Contains vendor-specific configuration for tokenization operations
 */
export interface VendorDirectives {
    /**
     * NMI-specific directives
     */
    nmiDirectives?: NmiDirectives;
    /**
     * Jack Henry-specific directives
     */
    jackHenryDirectives?: JackHenryDirectives;
}
