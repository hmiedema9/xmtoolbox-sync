const dictionary = require('xmtoolbox/lib/dictionary');
const BooleanOptions = [
    {
        value: 'false',
        name: 'No',
    },
    {
        value: 'true',
        name: 'Yes',
    },
];

const StatusOptions = [
    {
        value: 'ACTIVE',
        name: 'Active',
    },
    {
        value: 'INACTIVE',
        name: 'Inactive',
    },
];

const LanguageOptions = Object.keys(dictionary.language.nameByCode).map(code => ({
    value: code,
    name: `${dictionary.language.nameByCode[code]} (${code})`,
}));

const CountryOptions = Object.keys(dictionary.country.nameByCode).map(code => ({
    value: code,
    name: `${dictionary.country.nameByCode[code]} (${code})`,
}));

const VariableToWords = variable => {
    let words = variable.replace(/([A-Z])/g, ' $1');
    return words.charAt(0).toUpperCase() + words.slice(1);
};

module.exports = { BooleanOptions, StatusOptions, LanguageOptions, CountryOptions, VariableToWords };
