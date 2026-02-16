export declare const US_STATES: {
    code: string;
    name: string;
}[];
export declare const CANADA_STATES: {
    code: string;
    name: string;
}[];
export declare const STATES: (countryCode: string) => {
    code: string;
    name: string;
}[];
export declare const COUNTRY: {
    code: string;
    name: string;
}[];
export declare const CountryAndPhoneCodes: {
    Id: string;
    PhoneCode: string;
    States: any;
    Name: string;
    Description: string;
    SortOrder: number;
    Active: boolean;
}[];
