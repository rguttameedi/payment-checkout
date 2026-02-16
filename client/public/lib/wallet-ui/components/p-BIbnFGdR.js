import { E as Environment, b as getOscilarScriptUrl } from './p-FUsAEGQG.js';

const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'DC', name: 'District of Columbia' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'GU', name: 'Guam' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'VI', name: 'Virgin Islands, U.S.' },
];
const CANADA_STATES = [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
];
const STATES = (countryCode) => {
    switch (countryCode) {
        case 'CA':
            return CANADA_STATES;
        case 'US':
        default:
            return US_STATES;
    }
};
const COUNTRY = [
    { code: 'US', name: 'United States of America' },
    { code: 'AX', name: 'Aland Islands' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia (Plurinational State of)' },
    { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo (the Democratic Republic of the)' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CW', name: 'Curaçao' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FK', name: 'Falkland Islands [Malvinas]' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GR', name: 'Greece' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'VA', name: 'Holy See' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MK', name: 'Macedonia (the former Yugoslav Republic of)' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MD', name: 'Moldova (the Republic of)' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PS', name: 'Palestine, State of' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Réunion' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russian Federation' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BL', name: 'Saint Barthélemy' },
    { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'MF', name: 'Saint Martin (French part)' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SX', name: 'Sint Maarten (Dutch part)' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'KR', name: 'South Korea' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan (the)' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SZ', name: 'Swaziland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'TW', name: 'Taiwan (Province of China)' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania, United Republic of' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom of Great Britain and Northern Ireland' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VE', name: 'Venezuela (Bolivarian Republic of)' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VG', name: 'Virgin Islands (British)' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'EH', name: 'Western Sahara*' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
];
const CountryAndPhoneCodes = [
    {
        "Id": "US",
        "PhoneCode": "1 ",
        "States": null,
        "Name": "UNITED STATES",
        "Description": "UNITED STATES",
        "SortOrder": 0,
        "Active": true
    },
    {
        "Id": "AF",
        "PhoneCode": " 93",
        "States": null,
        "Name": "AFGHANISTAN",
        "Description": "AFGHANISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AX",
        "PhoneCode": "358 ",
        "States": null,
        "Name": "ALAND ISLANDS",
        "Description": "ALAND ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AL",
        "PhoneCode": "355 ",
        "States": null,
        "Name": "ALBANIA",
        "Description": "ALBANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DZ",
        "PhoneCode": "213 ",
        "States": null,
        "Name": "ALGERIA",
        "Description": "ALGERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AS",
        "PhoneCode": "1684 ",
        "States": null,
        "Name": "AMERICAN SAMOA",
        "Description": "AMERICAN SAMOA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AD",
        "PhoneCode": "376 ",
        "States": null,
        "Name": "ANDORRA",
        "Description": "ANDORRA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AO",
        "PhoneCode": "244 ",
        "States": null,
        "Name": "ANGOLA",
        "Description": "ANGOLA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AI",
        "PhoneCode": "1264 ",
        "States": null,
        "Name": "ANGUILLA",
        "Description": "ANGUILLA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AG",
        "PhoneCode": "1268 ",
        "States": null,
        "Name": "ANTIGUA AND BARBUDA",
        "Description": "ANTIGUA AND BARBUDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AR",
        "PhoneCode": "54 ",
        "States": null,
        "Name": "ARGENTINA",
        "Description": "ARGENTINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AM",
        "PhoneCode": "374 ",
        "States": null,
        "Name": "ARMENIA",
        "Description": "ARMENIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AW",
        "PhoneCode": " 297",
        "States": null,
        "Name": "ARUBA",
        "Description": "ARUBA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AU",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "AUSTRALIA",
        "Description": "AUSTRALIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AT",
        "PhoneCode": "43 ",
        "States": null,
        "Name": "AUSTRIA",
        "Description": "AUSTRIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AZ",
        "PhoneCode": " 994",
        "States": null,
        "Name": "AZERBAIJAN REPUBLIC",
        "Description": "AZERBAIJAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BS",
        "PhoneCode": " 1242",
        "States": null,
        "Name": "BAHAMAS",
        "Description": "BAHAMAS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BH",
        "PhoneCode": " 973",
        "States": null,
        "Name": "BAHRAIN",
        "Description": "BAHRAIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BD",
        "PhoneCode": " 880",
        "States": null,
        "Name": "BANGLADESH",
        "Description": "BANGLADESH",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BB",
        "PhoneCode": " 1246",
        "States": null,
        "Name": "BARBADOS",
        "Description": "BARBADOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BY",
        "PhoneCode": "375 ",
        "States": null,
        "Name": "BELARUS",
        "Description": "BELARUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BE",
        "PhoneCode": "32 ",
        "States": null,
        "Name": "BELGIUM",
        "Description": "BELGIUM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BZ",
        "PhoneCode": "501 ",
        "States": null,
        "Name": "BELIZE",
        "Description": "BELIZE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BJ",
        "PhoneCode": " 229",
        "States": null,
        "Name": "BENIN",
        "Description": "BENIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BM",
        "PhoneCode": "1441 ",
        "States": null,
        "Name": "BERMUDA",
        "Description": "BERMUDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BT",
        "PhoneCode": "975 ",
        "States": null,
        "Name": "BHUTAN",
        "Description": "BHUTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BO",
        "PhoneCode": "591 ",
        "States": null,
        "Name": "BOLIVIA",
        "Description": "BOLIVIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BQ",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "BONAIRE, SINT EUSTATIUS AND SABA",
        "Description": "BONAIRE, SINT EUSTATIUS AND SABA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BA",
        "PhoneCode": "387 ",
        "States": null,
        "Name": "BOSNIA AND HERZEGOVINA",
        "Description": "BOSNIA AND HERZEGOVINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BW",
        "PhoneCode": "267 ",
        "States": null,
        "Name": "BOTSWANA",
        "Description": "BOTSWANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BR",
        "PhoneCode": "55 ",
        "States": null,
        "Name": "BRAZIL",
        "Description": "BRAZIL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IO",
        "PhoneCode": "246 ",
        "States": null,
        "Name": "BRITISH INDIAN OCEAN TERRITORY",
        "Description": "BRITISH INDIAN OCEAN TERRITORY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BN",
        "PhoneCode": "673 ",
        "States": null,
        "Name": "BRUNEI DARUSSALAM",
        "Description": "BRUNEI DARUSSALAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BG",
        "PhoneCode": "359 ",
        "States": null,
        "Name": "BULGARIA",
        "Description": "BULGARIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BF",
        "PhoneCode": "226 ",
        "States": null,
        "Name": "BURKINA FASO",
        "Description": "BURKINA FASO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BI",
        "PhoneCode": "257 ",
        "States": null,
        "Name": "BURUNDI",
        "Description": "BURUNDI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KH",
        "PhoneCode": " 855",
        "States": null,
        "Name": "CAMBODIA",
        "Description": "CAMBODIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CM",
        "PhoneCode": " 237",
        "States": null,
        "Name": "CAMEROON",
        "Description": "CAMEROON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CA",
        "PhoneCode": " 1",
        "States": null,
        "Name": "CANADA",
        "Description": "CANADA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CV",
        "PhoneCode": " 238",
        "States": null,
        "Name": "CAPE VERDE",
        "Description": "CAPE VERDE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KY",
        "PhoneCode": "1345 ",
        "States": null,
        "Name": "CAYMAN ISLANDS",
        "Description": "CAYMAN ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CF",
        "PhoneCode": "236 ",
        "States": null,
        "Name": "CENTRAL AFRICAN REPUBLIC",
        "Description": "CENTRAL AFRICAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TD",
        "PhoneCode": "235 ",
        "States": null,
        "Name": "CHAD",
        "Description": "CHAD",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CL",
        "PhoneCode": "56 ",
        "States": null,
        "Name": "CHILE",
        "Description": "CHILE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CN",
        "PhoneCode": "86 ",
        "States": null,
        "Name": "CHINA",
        "Description": "CHINA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CX",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "CHRISTMAS ISLAND",
        "Description": "CHRISTMAS ISLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CC",
        "PhoneCode": "61 ",
        "States": null,
        "Name": "COCOS (KEELING) ISLANDS",
        "Description": "COCOS (KEELING) ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CO",
        "PhoneCode": " 57",
        "States": null,
        "Name": "COLOMBIA",
        "Description": "COLOMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KM",
        "PhoneCode": "269 ",
        "States": null,
        "Name": "COMOROS",
        "Description": "COMOROS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CG",
        "PhoneCode": "242 ",
        "States": null,
        "Name": "CONGO",
        "Description": "CONGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CD",
        "PhoneCode": " 243",
        "States": null,
        "Name": "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
        "Description": "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CK",
        "PhoneCode": "682 ",
        "States": null,
        "Name": "COOK ISLANDS",
        "Description": "COOK ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CR",
        "PhoneCode": "506 ",
        "States": null,
        "Name": "COSTA RICA",
        "Description": "COSTA RICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CI",
        "PhoneCode": "225 ",
        "States": null,
        "Name": "COTE D'IVOIRE",
        "Description": "COTE D'IVOIRE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HR",
        "PhoneCode": "385 ",
        "States": null,
        "Name": "CROATIA",
        "Description": "CROATIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CU",
        "PhoneCode": "53 ",
        "States": null,
        "Name": "CUBA",
        "Description": "CUBA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CUW",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "CURACAO",
        "Description": "CURACAO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CY",
        "PhoneCode": " 357",
        "States": null,
        "Name": "CYPRUS",
        "Description": "CYPRUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CZ",
        "PhoneCode": " 420",
        "States": null,
        "Name": "CZECH REPUBLIC",
        "Description": "CZECH REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DK",
        "PhoneCode": " 45",
        "States": null,
        "Name": "DENMARK",
        "Description": "DENMARK",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DJ",
        "PhoneCode": "253 ",
        "States": null,
        "Name": "DJIBOUTI",
        "Description": "DJIBOUTI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DM",
        "PhoneCode": " 1767",
        "States": null,
        "Name": "DOMINICA",
        "Description": "DOMINICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DO",
        "PhoneCode": "1809 ",
        "States": null,
        "Name": "DOMINICAN REPUBLIC",
        "Description": "DOMINICAN REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EC",
        "PhoneCode": "593 ",
        "States": null,
        "Name": "ECUADOR",
        "Description": "ECUADOR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EG",
        "PhoneCode": "20 ",
        "States": null,
        "Name": "EGYPT",
        "Description": "EGYPT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SV",
        "PhoneCode": "503 ",
        "States": null,
        "Name": "EL SALVADOR",
        "Description": "EL SALVADOR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GQ",
        "PhoneCode": "240 ",
        "States": null,
        "Name": "EQUATORIAL GUINEA",
        "Description": "EQUATORIAL GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ER",
        "PhoneCode": "291 ",
        "States": null,
        "Name": "ERITREA",
        "Description": "ERITREA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EE",
        "PhoneCode": "372 ",
        "States": null,
        "Name": "ESTONIA",
        "Description": "ESTONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ET",
        "PhoneCode": "251 ",
        "States": null,
        "Name": "ETHIOPIA",
        "Description": "ETHIOPIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FK",
        "PhoneCode": "500 ",
        "States": null,
        "Name": "FALKLAND ISLANDS",
        "Description": "FALKLAND ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FO",
        "PhoneCode": "298 ",
        "States": null,
        "Name": "FAROE ISLANDS",
        "Description": "FAROE ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FM",
        "PhoneCode": "691 ",
        "States": null,
        "Name": "FEDERATED STATES OF MICRONESIA",
        "Description": "FEDERATED STATES OF MICRONESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FJ",
        "PhoneCode": "679 ",
        "States": null,
        "Name": "FIJI",
        "Description": "FIJI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FI",
        "PhoneCode": "358 ",
        "States": null,
        "Name": "FINLAND",
        "Description": "FINLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FR",
        "PhoneCode": "33 ",
        "States": null,
        "Name": "FRANCE",
        "Description": "FRANCE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GF",
        "PhoneCode": "594 ",
        "States": null,
        "Name": "FRENCH GUIANA",
        "Description": "FRENCH GUIANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PF",
        "PhoneCode": " 689",
        "States": null,
        "Name": "FRENCH POLYNESIA",
        "Description": "FRENCH POLYNESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GA",
        "PhoneCode": "241 ",
        "States": null,
        "Name": "GABON REPUBLIC",
        "Description": "GABON REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GM",
        "PhoneCode": "220 ",
        "States": null,
        "Name": "GAMBIA",
        "Description": "GAMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GE",
        "PhoneCode": "995 ",
        "States": null,
        "Name": "GEORGIA",
        "Description": "GEORGIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "DE",
        "PhoneCode": "995 ",
        "States": null,
        "Name": "GERMANY",
        "Description": "GERMANY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GH",
        "PhoneCode": " 233",
        "States": null,
        "Name": "GHANA",
        "Description": "GHANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GI",
        "PhoneCode": "350 ",
        "States": null,
        "Name": "GIBRALTAR",
        "Description": "GIBRALTAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GR",
        "PhoneCode": "30 ",
        "States": null,
        "Name": "GREECE",
        "Description": "GREECE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GL",
        "PhoneCode": "299 ",
        "States": null,
        "Name": "GREENLAND",
        "Description": "GREENLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GD",
        "PhoneCode": "1473 ",
        "States": null,
        "Name": "GRENADA",
        "Description": "GRENADA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GP",
        "PhoneCode": "590 ",
        "States": null,
        "Name": "GUADELOUPE",
        "Description": "GUADELOUPE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GU",
        "PhoneCode": "1671 ",
        "States": null,
        "Name": "GUAM",
        "Description": "GUAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GT",
        "PhoneCode": "502 ",
        "States": null,
        "Name": "GUATEMALA",
        "Description": "GUATEMALA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GG",
        "PhoneCode": "441481 ",
        "States": null,
        "Name": "GUERNSEY",
        "Description": "GUERNSEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GN",
        "PhoneCode": "224 ",
        "States": null,
        "Name": "GUINEA",
        "Description": "GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GW",
        "PhoneCode": "245 ",
        "States": null,
        "Name": "GUINEA-BISSAU",
        "Description": "GUINEA-BISSAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GY",
        "PhoneCode": "592 ",
        "States": null,
        "Name": "GUYANA",
        "Description": "GUYANA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HT",
        "PhoneCode": "509 ",
        "States": null,
        "Name": "HAITI",
        "Description": "HAITI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VA",
        "PhoneCode": "379 ",
        "States": null,
        "Name": "HOLY SEE (VATICAN CITY STATE)",
        "Description": "HOLY SEE (VATICAN CITY STATE)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HN",
        "PhoneCode": " 504",
        "States": null,
        "Name": "HONDURAS",
        "Description": "HONDURAS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HK",
        "PhoneCode": "852 ",
        "States": null,
        "Name": "HONG KONG",
        "Description": "HONG KONG",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "HU",
        "PhoneCode": " 36",
        "States": null,
        "Name": "HUNGARY",
        "Description": "HUNGARY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IS",
        "PhoneCode": "354 ",
        "States": null,
        "Name": "ICELAND",
        "Description": "ICELAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IN",
        "PhoneCode": " 91",
        "States": null,
        "Name": "INDIA",
        "Description": "INDIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ID",
        "PhoneCode": "62 ",
        "States": null,
        "Name": "INDONESIA",
        "Description": "INDONESIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IR",
        "PhoneCode": "98 ",
        "States": null,
        "Name": "IRAN, ISLAMIC REPUBLIC OF",
        "Description": "IRAN, ISLAMIC REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IQ",
        "PhoneCode": "964 ",
        "States": null,
        "Name": "IRAQ",
        "Description": "IRAQ",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IE",
        "PhoneCode": " 353",
        "States": null,
        "Name": "IRELAND",
        "Description": "IRELAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IM",
        "PhoneCode": "44 ",
        "States": null,
        "Name": "ISLE OF MAN",
        "Description": "ISLE OF MAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IL",
        "PhoneCode": " 972",
        "States": null,
        "Name": "ISRAEL",
        "Description": "ISRAEL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "IT",
        "PhoneCode": "39 ",
        "States": null,
        "Name": "ITALY",
        "Description": "ITALY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JM",
        "PhoneCode": "1876 ",
        "States": null,
        "Name": "JAMAICA",
        "Description": "JAMAICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JP",
        "PhoneCode": " 81",
        "States": null,
        "Name": "JAPAN",
        "Description": "JAPAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JE",
        "PhoneCode": "441534 ",
        "States": null,
        "Name": "JERSEY",
        "Description": "JERSEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "JO",
        "PhoneCode": "962 ",
        "States": null,
        "Name": "JORDAN",
        "Description": "JORDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KZ",
        "PhoneCode": " 7",
        "States": null,
        "Name": "KAZAKHSTAN",
        "Description": "KAZAKHSTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KE",
        "PhoneCode": "254 ",
        "States": null,
        "Name": "KENYA",
        "Description": "KENYA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KI",
        "PhoneCode": "686 ",
        "States": null,
        "Name": "KIRIBATI",
        "Description": "KIRIBATI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KP",
        "PhoneCode": "850 ",
        "States": null,
        "Name": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
        "Description": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KR",
        "PhoneCode": "82 ",
        "States": null,
        "Name": "KOREA, REPUBLIC OF",
        "Description": "KOREA, REPUBLIC OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KW",
        "PhoneCode": "965 ",
        "States": null,
        "Name": "KUWAIT",
        "Description": "KUWAIT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KG",
        "PhoneCode": "996 ",
        "States": null,
        "Name": "KYRGYZSTAN",
        "Description": "KYRGYZSTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LA",
        "PhoneCode": "856 ",
        "States": null,
        "Name": "LAOS",
        "Description": "LAOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LV",
        "PhoneCode": "371 ",
        "States": null,
        "Name": "LATVIA",
        "Description": "LATVIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LB",
        "PhoneCode": "961 ",
        "States": null,
        "Name": "LEBANON",
        "Description": "LEBANON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LS",
        "PhoneCode": "266 ",
        "States": null,
        "Name": "LESOTHO",
        "Description": "LESOTHO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LR",
        "PhoneCode": "231 ",
        "States": null,
        "Name": "LIBERIA",
        "Description": "LIBERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LY",
        "PhoneCode": " 218",
        "States": null,
        "Name": "LIBYAN ARAB JAMAHIRIYA",
        "Description": "LIBYAN ARAB JAMAHIRIYA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LI",
        "PhoneCode": "423 ",
        "States": null,
        "Name": "LIECHTENSTEIN",
        "Description": "LIECHTENSTEIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LT",
        "PhoneCode": "370 ",
        "States": null,
        "Name": "LITHUANIA",
        "Description": "LITHUANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LU",
        "PhoneCode": "352 ",
        "States": null,
        "Name": "LUXEMBOURG",
        "Description": "LUXEMBOURG",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MO",
        "PhoneCode": "853 ",
        "States": null,
        "Name": "MACAO",
        "Description": "MACAO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MK",
        "PhoneCode": "389 ",
        "States": null,
        "Name": "MACEDONIA",
        "Description": "MACEDONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MG",
        "PhoneCode": " 261",
        "States": null,
        "Name": "MADAGASCAR",
        "Description": "MADAGASCAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MW",
        "PhoneCode": "265 ",
        "States": null,
        "Name": "MALAWI",
        "Description": "MALAWI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MY",
        "PhoneCode": "60 ",
        "States": null,
        "Name": "MALAYSIA",
        "Description": "MALAYSIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MV",
        "PhoneCode": "960 ",
        "States": null,
        "Name": "MALDIVES",
        "Description": "MALDIVES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ML",
        "PhoneCode": "223 ",
        "States": null,
        "Name": "MALI",
        "Description": "MALI",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MT",
        "PhoneCode": "356 ",
        "States": null,
        "Name": "MALTA",
        "Description": "MALTA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MH",
        "PhoneCode": "692 ",
        "States": null,
        "Name": "MARSHALL ISLANDS",
        "Description": "MARSHALL ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MQ",
        "PhoneCode": "596 ",
        "States": null,
        "Name": "MARTINIQUE",
        "Description": "MARTINIQUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MR",
        "PhoneCode": "222 ",
        "States": null,
        "Name": "MAURITANIA",
        "Description": "MAURITANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MU",
        "PhoneCode": "230 ",
        "States": null,
        "Name": "MAURITIUS",
        "Description": "MAURITIUS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "YT",
        "PhoneCode": "269 ",
        "States": null,
        "Name": "MAYOTTE",
        "Description": "MAYOTTE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MX",
        "PhoneCode": "52 ",
        "States": null,
        "Name": "MEXICO",
        "Description": "MEXICO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "FM",
        "PhoneCode": "691 ",
        "States": null,
        "Name": "MICRONESIA, FEDERATED STATES OF",
        "Description": "MICRONESIA, FEDERATED STATES OF",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MD",
        "PhoneCode": "373533 ",
        "States": null,
        "Name": "MOLDOVA",
        "Description": "MOLDOVA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MC",
        "PhoneCode": "377 ",
        "States": null,
        "Name": "MONACO",
        "Description": "MONACO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MN",
        "PhoneCode": "976 ",
        "States": null,
        "Name": "MONGOLIA",
        "Description": "MONGOLIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ME",
        "PhoneCode": "382 ",
        "States": null,
        "Name": "MONTENEGRO",
        "Description": "MONTENEGRO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MS",
        "PhoneCode": " 1664",
        "States": null,
        "Name": "MONTSERRAT",
        "Description": "MONTSERRAT",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MA",
        "PhoneCode": " 212",
        "States": null,
        "Name": "MOROCCO",
        "Description": "MOROCCO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MZ",
        "PhoneCode": "258 ",
        "States": null,
        "Name": "MOZAMBIQUE",
        "Description": "MOZAMBIQUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MM",
        "PhoneCode": "95 ",
        "States": null,
        "Name": "MYANMAR",
        "Description": "MYANMAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NA",
        "PhoneCode": "264 ",
        "States": null,
        "Name": "NAMIBIA",
        "Description": "NAMIBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NR",
        "PhoneCode": "674 ",
        "States": null,
        "Name": "NAURU",
        "Description": "NAURU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NP",
        "PhoneCode": "977 ",
        "States": null,
        "Name": "NEPAL",
        "Description": "NEPAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NL",
        "PhoneCode": "31 ",
        "States": null,
        "Name": "NETHERLANDS",
        "Description": "NETHERLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AN",
        "PhoneCode": "599 ",
        "States": null,
        "Name": "NETHERLANDS ANTILLES",
        "Description": "NETHERLANDS ANTILLES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NC",
        "PhoneCode": "687 ",
        "States": null,
        "Name": "NEW CALEDONIA",
        "Description": "NEW CALEDONIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NZ",
        "PhoneCode": "64 ",
        "States": null,
        "Name": "NEW ZEALAND",
        "Description": "NEW ZEALAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NI",
        "PhoneCode": "505 ",
        "States": null,
        "Name": "NICARAGUA",
        "Description": "NICARAGUA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NE",
        "PhoneCode": " 227",
        "States": null,
        "Name": "NIGER",
        "Description": "NIGER",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NG",
        "PhoneCode": "234 ",
        "States": null,
        "Name": "NIGERIA",
        "Description": "NIGERIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NU",
        "PhoneCode": "683 ",
        "States": null,
        "Name": "NIUE",
        "Description": "NIUE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NF",
        "PhoneCode": "672 ",
        "States": null,
        "Name": "NORFOLK ISLAND",
        "Description": "NORFOLK ISLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MP",
        "PhoneCode": "1670 ",
        "States": null,
        "Name": "NORTHERN MARIANA ISLANDS",
        "Description": "NORTHERN MARIANA ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "NO",
        "PhoneCode": "47 ",
        "States": null,
        "Name": "NORWAY",
        "Description": "NORWAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "OM",
        "PhoneCode": "968 ",
        "States": null,
        "Name": "OMAN",
        "Description": "OMAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PK",
        "PhoneCode": " 92",
        "States": null,
        "Name": "PAKISTAN",
        "Description": "PAKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PW",
        "PhoneCode": "680 ",
        "States": null,
        "Name": "PALAU",
        "Description": "PALAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PS",
        "PhoneCode": "970 ",
        "States": null,
        "Name": "PALESTINIAN TERRITORY, OCCUPIED",
        "Description": "PALESTINIAN TERRITORY, OCCUPIED",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PA",
        "PhoneCode": " 507",
        "States": null,
        "Name": "PANAMA",
        "Description": "PANAMA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PG",
        "PhoneCode": "675 ",
        "States": null,
        "Name": "PAPUA NEW GUINEA",
        "Description": "PAPUA NEW GUINEA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PY",
        "PhoneCode": "595 ",
        "States": null,
        "Name": "PARAGUAY",
        "Description": "PARAGUAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PE",
        "PhoneCode": "51 ",
        "States": null,
        "Name": "PERU",
        "Description": "PERU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PH",
        "PhoneCode": "63 ",
        "States": null,
        "Name": "PHILIPPINES",
        "Description": "PHILIPPINES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PL",
        "PhoneCode": "48 ",
        "States": null,
        "Name": "POLAND",
        "Description": "POLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PT",
        "PhoneCode": "351 ",
        "States": null,
        "Name": "PORTUGAL",
        "Description": "PORTUGAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PR",
        "PhoneCode": " 1787",
        "States": null,
        "Name": "PUERTO RICO",
        "Description": "PUERTO RICO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "QA",
        "PhoneCode": " 974",
        "States": null,
        "Name": "QATAR",
        "Description": "QATAR",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RE",
        "PhoneCode": "262 ",
        "States": null,
        "Name": "REUNION",
        "Description": "REUNION",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RO",
        "PhoneCode": "40 ",
        "States": null,
        "Name": "ROMANIA",
        "Description": "ROMANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RU",
        "PhoneCode": "7 ",
        "States": null,
        "Name": "RUSSIA",
        "Description": "RUSSIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RW",
        "PhoneCode": "250 ",
        "States": null,
        "Name": "RWANDA",
        "Description": "RWANDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "BLM",
        "PhoneCode": "590",
        "States": null,
        "Name": "SAINT BARTHELEMY",
        "Description": "SAINT BARTHELEMY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SH",
        "PhoneCode": "290 ",
        "States": null,
        "Name": "SAINT HELENA",
        "Description": "SAINT HELENA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KN",
        "PhoneCode": "1869 ",
        "States": null,
        "Name": "SAINT KITTS AND NEVIS",
        "Description": "SAINT KITTS AND NEVIS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LC",
        "PhoneCode": "1758 ",
        "States": null,
        "Name": "SAINT LUCIA",
        "Description": "SAINT LUCIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "MF",
        "PhoneCode": " 590",
        "States": null,
        "Name": "SAINT MARTIN (FRENCH PART)",
        "Description": "SAINT MARTIN (FRENCH PART)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "PM",
        "PhoneCode": "508 ",
        "States": null,
        "Name": "SAINT PIERRE AND MIQUELON",
        "Description": "SAINT PIERRE AND MIQUELON",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VC",
        "PhoneCode": "1784 ",
        "States": null,
        "Name": "SAINT VINCENT AND THE GRENADINES",
        "Description": "SAINT VINCENT AND THE GRENADINES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "WS",
        "PhoneCode": "685 ",
        "States": null,
        "Name": "SAMOA",
        "Description": "SAMOA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SM",
        "PhoneCode": "378 ",
        "States": null,
        "Name": "SAN MARINO",
        "Description": "SAN MARINO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ST",
        "PhoneCode": "239 ",
        "States": null,
        "Name": "SAO TOME AND PRINCIPE",
        "Description": "SAO TOME AND PRINCIPE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SA",
        "PhoneCode": " 966",
        "States": null,
        "Name": "SAUDI ARABIA",
        "Description": "SAUDI ARABIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SN",
        "PhoneCode": "221 ",
        "States": null,
        "Name": "SENEGAL",
        "Description": "SENEGAL",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "RS",
        "PhoneCode": " 381",
        "States": null,
        "Name": "SERBIA",
        "Description": "SERBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SC",
        "PhoneCode": "248 ",
        "States": null,
        "Name": "SEYCHELLES",
        "Description": "SEYCHELLES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SL",
        "PhoneCode": "232 ",
        "States": null,
        "Name": "SIERRA LEONE",
        "Description": "SIERRA LEONE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SG",
        "PhoneCode": "65 ",
        "States": null,
        "Name": "SINGAPORE",
        "Description": "SINGAPORE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SX",
        "PhoneCode": "1 ",
        "States": null,
        "Name": "SINT MAARTEN (DUTCH PART)",
        "Description": "SINT MAARTEN (DUTCH PART)",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SK",
        "PhoneCode": "421 ",
        "States": null,
        "Name": "SLOVAKIA",
        "Description": "SLOVAKIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SI",
        "PhoneCode": "386 ",
        "States": null,
        "Name": "SLOVENIA",
        "Description": "SLOVENIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SB",
        "PhoneCode": "677 ",
        "States": null,
        "Name": "SOLOMON ISLANDS",
        "Description": "SOLOMON ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SO",
        "PhoneCode": "252 ",
        "States": null,
        "Name": "SOMALIA",
        "Description": "SOMALIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZA",
        "PhoneCode": "27 ",
        "States": null,
        "Name": "SOUTH AFRICA",
        "Description": "SOUTH AFRICA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GS",
        "PhoneCode": "500",
        "States": null,
        "Name": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
        "Description": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "KR",
        "PhoneCode": "82 ",
        "States": null,
        "Name": "SOUTH KOREA",
        "Description": "SOUTH KOREA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SS",
        "PhoneCode": "211",
        "States": null,
        "Name": "SOUTH SUDAN",
        "Description": "SOUTH SUDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ES",
        "PhoneCode": "34 ",
        "States": null,
        "Name": "SPAIN",
        "Description": "SPAIN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "LK",
        "PhoneCode": "94 ",
        "States": null,
        "Name": "SRI LANKA",
        "Description": "SRI LANKA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SD",
        "PhoneCode": " 249",
        "States": null,
        "Name": "SUDAN",
        "Description": "SUDAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SR",
        "PhoneCode": "597 ",
        "States": null,
        "Name": "SURINAME",
        "Description": "SURINAME",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SJ",
        "PhoneCode": "47 ",
        "States": null,
        "Name": "SVALBARD AND JAN MAYEN",
        "Description": "SVALBARD AND JAN MAYEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SZ",
        "PhoneCode": "268 ",
        "States": null,
        "Name": "SWAZILAND",
        "Description": "SWAZILAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SE",
        "PhoneCode": "46 ",
        "States": null,
        "Name": "SWEDEN",
        "Description": "SWEDEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "CH",
        "PhoneCode": "41 ",
        "States": null,
        "Name": "SWITZERLAND",
        "Description": "SWITZERLAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "SY",
        "PhoneCode": "963 ",
        "States": null,
        "Name": "SYRIAN ARAB REPUBLIC",
        "Description": "SYRIAN ARAB REPUBLIC",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TW",
        "PhoneCode": "886 ",
        "States": null,
        "Name": "TAIWAN",
        "Description": "TAIWAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TJ",
        "PhoneCode": " 992",
        "States": null,
        "Name": "TAJIKISTAN",
        "Description": "TAJIKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TZ",
        "PhoneCode": "255 ",
        "States": null,
        "Name": "TANZANIA",
        "Description": "TANZANIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TH",
        "PhoneCode": "66 ",
        "States": null,
        "Name": "THAILAND",
        "Description": "THAILAND",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TL",
        "PhoneCode": "670 ",
        "States": null,
        "Name": "TIMOR-LESTE",
        "Description": "TIMOR-LESTE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TG",
        "PhoneCode": "228 ",
        "States": null,
        "Name": "TOGO",
        "Description": "TOGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TK",
        "PhoneCode": "690 ",
        "States": null,
        "Name": "TOKELAU",
        "Description": "TOKELAU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TO",
        "PhoneCode": "676 ",
        "States": null,
        "Name": "TONGA",
        "Description": "TONGA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TT",
        "PhoneCode": "1868 ",
        "States": null,
        "Name": "TRINIDAD AND TOBAGO",
        "Description": "TRINIDAD AND TOBAGO",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TN",
        "PhoneCode": "216 ",
        "States": null,
        "Name": "TUNISIA",
        "Description": "TUNISIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TR",
        "PhoneCode": "90 ",
        "States": null,
        "Name": "TURKEY",
        "Description": "TURKEY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TM",
        "PhoneCode": "993 ",
        "States": null,
        "Name": "TURKMENISTAN",
        "Description": "TURKMENISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TC",
        "PhoneCode": "1649 ",
        "States": null,
        "Name": "TURKS AND CAICOS",
        "Description": "TURKS AND CAICOS",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "TV",
        "PhoneCode": "688 ",
        "States": null,
        "Name": "TUVALU",
        "Description": "TUVALU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UG",
        "PhoneCode": "256 ",
        "States": null,
        "Name": "UGANDA",
        "Description": "UGANDA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UA",
        "PhoneCode": "380 ",
        "States": null,
        "Name": "UKRAINE",
        "Description": "UKRAINE",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "AE",
        "PhoneCode": "971 ",
        "States": null,
        "Name": "UNITED ARAB EMIRATES",
        "Description": "UNITED ARAB EMIRATES",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "GB",
        "PhoneCode": "44 ",
        "States": null,
        "Name": "UNITED KINGDOM",
        "Description": "UNITED KINGDOM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UY",
        "PhoneCode": "598 ",
        "States": null,
        "Name": "URUGUAY",
        "Description": "URUGUAY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "UZ",
        "PhoneCode": "998 ",
        "States": null,
        "Name": "UZBEKISTAN",
        "Description": "UZBEKISTAN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VU",
        "PhoneCode": "678 ",
        "States": null,
        "Name": "VANUATU",
        "Description": "VANUATU",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VA",
        "PhoneCode": "379 ",
        "States": null,
        "Name": "VATICAN CITY",
        "Description": "VATICAN CITY",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VE",
        "PhoneCode": "58 ",
        "States": null,
        "Name": "VENEZUELA",
        "Description": "VENEZUELA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VN",
        "PhoneCode": "84 ",
        "States": null,
        "Name": "VIETNAM",
        "Description": "VIETNAM",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VG",
        "PhoneCode": "1284 ",
        "States": null,
        "Name": "VIRGIN ISLANDS, BRITISH",
        "Description": "VIRGIN ISLANDS, BRITISH",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "VI",
        "PhoneCode": "1340 ",
        "States": null,
        "Name": "VIRGIN ISLANDS, U.S.",
        "Description": "VIRGIN ISLANDS, U.S.",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "WF",
        "PhoneCode": "681 ",
        "States": null,
        "Name": "WALLIS AND FUTUNA",
        "Description": "WALLIS AND FUTUNA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "EH",
        "PhoneCode": "212 ",
        "States": null,
        "Name": "WESTERN SAHARA",
        "Description": "WESTERN SAHARA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "YE",
        "PhoneCode": "967 ",
        "States": null,
        "Name": "YEMEN",
        "Description": "YEMEN",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZM",
        "PhoneCode": "260 ",
        "States": null,
        "Name": "ZAMBIA",
        "Description": "ZAMBIA",
        "SortOrder": 1,
        "Active": true
    },
    {
        "Id": "ZW",
        "PhoneCode": "263 ",
        "States": null,
        "Name": "ZIMBABWE",
        "Description": "ZIMBABWE",
        "SortOrder": 1,
        "Active": true
    }
];

/**
 * Error Message Translator for Wallet UI Components
 * Converts technical API error messages to user-friendly ones
 */
// Error translation mappings
const ERROR_TRANSLATIONS = [
    // Duplicate payment method errors
    {
        pattern: /same payment instrument details already existed/i,
        userMessage: "This card is already saved to your account. Please use a different card or update your existing card details.",
        category: 'duplicate'
    },
    {
        pattern: /payment instrument.*already exists/i,
        userMessage: "This payment method is already saved to your account.",
        category: 'duplicate'
    },
    {
        pattern: /tokenization request was rejected.*same payment instrument details already existed/i,
        userMessage: "This card is already saved to your wallet. Please use a different card or update your existing card information.",
        category: 'duplicate'
    },
    {
        pattern: /tokenization request was rejected/i,
        userMessage: "We couldn't process this card. Please check your card details and try again, or use a different card.",
        category: 'validation'
    },
    // Card validation errors
    {
        pattern: /invalid card number/i,
        userMessage: "Please enter a valid card number.",
        category: 'validation'
    },
    {
        pattern: /card number.*invalid/i,
        userMessage: "The card number you entered is not valid. Please check and try again.",
        category: 'validation'
    },
    {
        pattern: /invalid expiration/i,
        userMessage: "Please enter a valid expiration date.",
        category: 'validation'
    },
    {
        pattern: /expired card/i,
        userMessage: "This card has expired. Please use a different card.",
        category: 'validation'
    },
    {
        pattern: /invalid cvv/i,
        userMessage: "Please enter a valid security code (CVV).",
        category: 'validation'
    },
    {
        pattern: /insufficient funds/i,
        userMessage: "This card has insufficient funds. Please use a different payment method.",
        category: 'validation'
    },
    {
        pattern: /card declined/i,
        userMessage: "Your card was declined. Please contact your bank or use a different card.",
        category: 'validation'
    },
    // Bank account validation errors
    {
        pattern: /invalid routing number/i,
        userMessage: "Please enter a valid routing number.",
        category: 'validation'
    },
    {
        pattern: /invalid account number/i,
        userMessage: "Please enter a valid account number.",
        category: 'validation'
    },
    {
        pattern: /bank account.*not found/i,
        userMessage: "We couldn't verify this bank account. Please check your details and try again.",
        category: 'validation'
    },
    // Security and authentication errors
    {
        pattern: /unauthorized/i,
        userMessage: "Your session has expired. Please refresh the page and try again.",
        category: 'security'
    },
    {
        pattern: /forbidden/i,
        userMessage: "You don't have permission to perform this action.",
        category: 'security'
    },
    {
        pattern: /authentication.*failed/i,
        userMessage: "Authentication failed. Please refresh the page and try again.",
        category: 'security'
    },
    // Network and server errors
    {
        pattern: /network.*error/i,
        userMessage: "Network connection error. Please check your internet connection and try again.",
        category: 'network'
    },
    {
        pattern: /server.*error/i,
        userMessage: "We're experiencing technical difficulties. Please try again in a few moments.",
        category: 'network'
    },
    {
        pattern: /timeout/i,
        userMessage: "The request timed out. Please try again.",
        category: 'network'
    },
    // Generic validation errors
    {
        pattern: /required.*missing/i,
        userMessage: "Please fill in all required fields.",
        category: 'validation'
    },
    {
        pattern: /invalid.*format/i,
        userMessage: "Please check the format of your information and try again.",
        category: 'validation'
    },
    {
        pattern: /validation.*failed/i,
        userMessage: "Please check your information and try again.",
        category: 'validation'
    }
];
/**
 * Translates a technical API error message to a user-friendly message
 * @param technicalMessage - The technical error message from the API
 * @returns User-friendly error message
 */
function translateErrorMessage(technicalMessage) {
    if (!technicalMessage || typeof technicalMessage !== 'string') {
        return "An unexpected error occurred. Please try again.";
    }
    // Find matching translation
    for (const translation of ERROR_TRANSLATIONS) {
        if (typeof translation.pattern === 'string') {
            if (technicalMessage.toLowerCase().includes(translation.pattern.toLowerCase())) {
                return translation.userMessage;
            }
        }
        else {
            // RegExp pattern
            if (translation.pattern.test(technicalMessage)) {
                return translation.userMessage;
            }
        }
    }
    // If no specific translation found, return a generic user-friendly message
    return "We encountered an issue processing your request. Please check your information and try again.";
}
/**
 * Gets the error category for analytics/logging purposes
 * @param technicalMessage - The technical error message
 * @returns Error category
 */
function getErrorCategory(technicalMessage) {
    if (!technicalMessage || typeof technicalMessage !== 'string') {
        return 'generic';
    }
    for (const translation of ERROR_TRANSLATIONS) {
        if (typeof translation.pattern === 'string') {
            if (technicalMessage.toLowerCase().includes(translation.pattern.toLowerCase())) {
                return translation.category;
            }
        }
        else {
            if (translation.pattern.test(technicalMessage)) {
                return translation.category;
            }
        }
    }
    return 'generic';
}
/**
 * Enhanced error translation with additional context
 * @param technicalMessage - The technical error message
 * @param context - Additional context (e.g., 'card', 'bank', 'general')
 * @returns Enhanced user-friendly error message
 */
function translateErrorWithContext(technicalMessage, context = 'general') {
    const userMessage = translateErrorMessage(technicalMessage);
    const category = getErrorCategory(technicalMessage);
    // Add context-specific enhancements
    let enhancedMessage = userMessage;
    if (context === 'card' && category === 'duplicate') {
        enhancedMessage = "This card is already saved to your wallet. You can update your existing card details or add a different card.";
    }
    else if (context === 'bank' && category === 'duplicate') {
        enhancedMessage = "This bank account is already saved to your wallet. You can update your existing account details or add a different account.";
    }
    return {
        userMessage: enhancedMessage,
        category,
        originalMessage: technicalMessage
    };
}

// Event types for wallet UI components
var WalletEventType;
(function (WalletEventType) {
    // API Events
    WalletEventType["API_CALL_SUCCESS"] = "wallet:api:success";
    WalletEventType["API_CALL_ERROR"] = "wallet:api:error";
    // Payment Method Events
    WalletEventType["PAYMENT_METHOD_SELECTED"] = "wallet:payment:selected";
    WalletEventType["PAYMENT_METHOD_CHANGED"] = "wallet:payment:changed";
    // Add Payment Method Events
    WalletEventType["ADD_PAYMENT_STARTED"] = "wallet:add-payment:started";
    WalletEventType["ADD_PAYMENT_SUCCESS"] = "wallet:add-payment:success";
    WalletEventType["ADD_PAYMENT_CANCELLED"] = "wallet:add-payment:cancelled";
    WalletEventType["ADD_PAYMENT_ERROR"] = "wallet:add-payment:error";
    // Add Bank Account Events
    WalletEventType["ADD_BANK_STARTED"] = "wallet:add-bank:started";
    WalletEventType["ADD_BANK_SUCCESS"] = "wallet:add-bank:success";
    WalletEventType["ADD_BANK_CANCELLED"] = "wallet:add-bank:cancelled";
    WalletEventType["ADD_BANK_ERROR"] = "wallet:add-bank:error";
    // Form Events
    WalletEventType["FORM_VALIDATION_ERROR"] = "wallet:form:validation-error";
    WalletEventType["FORM_FIELD_CHANGED"] = "wallet:form:field-changed";
    // UI Events
    WalletEventType["DROPDOWN_OPENED"] = "wallet:ui:dropdown-opened";
    WalletEventType["DROPDOWN_CLOSED"] = "wallet:ui:dropdown-closed";
    WalletEventType["COMPONENT_LOADED"] = "wallet:ui:component-loaded";
})(WalletEventType || (WalletEventType = {}));

// Helper function to conditionally log only in development
const devLog = (environment, message, ...args) => {
    if (environment === Environment.LOCALDEVELOPMENT || environment === Environment.STAGING) {
        console.log(message, ...args);
    }
};
/**
 * Central event tracking utility for wallet UI components
 * Emits CustomEvents that parent applications can listen to
 */
class WalletEventTracker {
    static instance;
    componentName = '';
    environment = 'production';
    sessionId = '';
    constructor() {
        this.sessionId = this.generateSessionId();
    }
    static getInstance() {
        if (!WalletEventTracker.instance) {
            WalletEventTracker.instance = new WalletEventTracker();
        }
        return WalletEventTracker.instance;
    }
    /**
     * Initialize the tracker with component context
     */
    init(componentName, environment = 'production') {
        this.componentName = componentName;
        this.environment = environment;
    }
    /**
     * Track an event with standardized data structure
     */
    track(eventType, eventData = {}) {
        const standardizedData = {
            timestamp: new Date().toISOString(),
            component: this.componentName,
            environment: this.environment,
            sessionId: this.sessionId,
            ...eventData
        };
        // Emit CustomEvent for parent application
        this.emitCustomEvent(eventType, standardizedData);
        // Optional: Console log for development
        devLog(this.environment, `[WalletEvent] ${eventType}:`, standardizedData);
    }
    /**
     * Emit CustomEvent that bubbles up to parent application
     */
    emitCustomEvent(eventType, data) {
        const customEvent = new CustomEvent(eventType, {
            detail: data,
            bubbles: true,
            composed: true // Allows event to cross shadow DOM boundaries
        });
        // Dispatch on document to ensure parent app can catch it
        document.dispatchEvent(customEvent);
    }
    /**
     * Generate a unique session ID for tracking user sessions
     */
    generateSessionId() {
        return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Convenience methods for common events
     */
    trackApiCall(endpoint, method, success, duration, statusCode, error) {
        this.track(success ? WalletEventType.API_CALL_SUCCESS : WalletEventType.API_CALL_ERROR, {
            endpoint,
            method,
            duration,
            statusCode,
            error
        });
    }
    trackPaymentMethodSelected(paymentMethodId, paymentMethodType, paymentMethodText) {
        this.track(WalletEventType.PAYMENT_METHOD_SELECTED, {
            paymentMethodId,
            paymentMethodType,
            paymentMethodText
        });
    }
    trackFormEvent(eventType, formType, additionalData = {}) {
        this.track(eventType, {
            formType,
            ...additionalData
        });
    }
    trackUIEvent(eventType, action, elementId, elementType) {
        this.track(eventType, {
            action,
            elementId,
            elementType
        });
    }
}
// Export singleton instance for easy use
const eventTracker = WalletEventTracker.getInstance();

/**
 * Simple helper functions for wallet event tracking
 * Provides easy-to-use methods for components with minimal code changes
 */
/**
 * Initialize event tracking for a component
 */
function initWalletEvents(componentName, environment = 'production') {
    eventTracker.init(componentName, environment);
    eventTracker.trackUIEvent(WalletEventType.COMPONENT_LOADED, 'component-initialized');
}
/**
 * Track API calls with automatic timing
 */
async function trackApiCall(endpoint, method, apiCall) {
    const startTime = Date.now();
    try {
        const result = await apiCall();
        const duration = Date.now() - startTime;
        eventTracker.trackApiCall(endpoint, method, true, duration, 200);
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        eventTracker.trackApiCall(endpoint, method, false, duration, 500, errorMessage);
        throw error;
    }
}
/**
 * Track payment method selection
 */
function trackPaymentSelection(paymentMethodId, paymentMethodType, paymentMethodText) {
    eventTracker.trackPaymentMethodSelected(paymentMethodId, paymentMethodType, paymentMethodText);
}
/**
 * Track form lifecycle events
 */
function trackAddPaymentStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_STARTED, 'payment');
}
function trackAddPaymentSuccess(paymentMethodData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_SUCCESS, 'payment', paymentMethodData);
}
function trackAddPaymentCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_CANCELLED, 'payment');
}
function trackAddPaymentError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_PAYMENT_ERROR, 'payment', {
        error,
        errorCategory
    });
}
function trackAddBankStarted() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_STARTED, 'bank');
}
function trackAddBankSuccess(bankAccountData) {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_SUCCESS, 'bank', bankAccountData);
}
function trackAddBankCancelled() {
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_CANCELLED, 'bank');
}
function trackAddBankError(error) {
    const errorCategory = getErrorCategory(error);
    eventTracker.trackFormEvent(WalletEventType.ADD_BANK_ERROR, 'bank', {
        error,
        errorCategory
    });
}
/**
 * Track form validation errors
 */
function trackValidationError(formType, errors) {
    eventTracker.trackFormEvent(WalletEventType.FORM_VALIDATION_ERROR, formType, { validationErrors: errors });
}

const isValidPOBoxAddess = (value) => {
    const poBoxRegex = /^\s*(?:p[\W_]*[o0]?|post(?:al)?)\s*(?:(?:[\W_]*[o0]ffice)?[\W_]*(?:b[o0]x|bin)|[\W_]*[o0]ffice)\s*(?:\d+)?\s*$/im;
    return poBoxRegex.test(value);
};

class OscilarService {
    // Holds the single instance of the service
    static instance;
    // Configuration
    scriptId = 'oscilar-script';
    defaultTimeout = 5000; // 5 seconds
    // State
    scriptLoadPromise = null;
    scriptElement = null;
    debug = "production" !== 'production';
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
const oscilarService = OscilarService.getInstance();

export { COUNTRY as C, STATES as S, CountryAndPhoneCodes as a, isValidPOBoxAddess as b, trackValidationError as c, trackAddBankError as d, trackAddBankSuccess as e, trackAddBankCancelled as f, translateErrorMessage as g, trackAddPaymentError as h, initWalletEvents as i, trackAddPaymentSuccess as j, trackAddPaymentCancelled as k, trackApiCall as l, trackAddPaymentStarted as m, trackAddBankStarted as n, oscilarService as o, trackPaymentSelection as p, translateErrorWithContext as t };
//# sourceMappingURL=p-BIbnFGdR.js.map

//# sourceMappingURL=p-BIbnFGdR.js.map