import React, { useState, Fragment } from 'react';

import CommonQuestions from './CommonQuestions';
import Fields from './Fields';
import Include from './Include';
const { StatusOptions, LanguageOptions, CountryOptions } = require('./common');

const App = ({ config = {}, setConfig }) => {
    const [sampleData, setSampleData] = useState();

    const { sync } = config;

    const fields = [
        { name: 'Name', key: 'name' },
        { name: 'Address Line 1', key: 'address1' },
        { name: 'Address Line 2', key: 'address2' },
        { name: 'City', key: 'city' },
        { name: 'State', key: 'state' },
        { name: 'Postal Code', key: 'postalCode' },
        { name: 'Country', key: 'country', defaultOptions: CountryOptions, initialOptions: CountryOptions },
        { name: 'Latitude', key: 'latitude' },
        { name: 'Longitude', key: 'longitude' },
        {
            name: 'Language',
            key: 'language',
            defaultOptions: LanguageOptions,
            initialOptions: LanguageOptions,
        },
        { name: 'Timezone', key: 'timezone' },
        { name: 'Status', key: 'status', defaultOptions: StatusOptions, initialOptions: StatusOptions },
    ];

    return (
        <Fragment>
            <CommonQuestions
                config={config}
                setConfig={setConfig}
                object="sites"
                setSampleData={setSampleData}
                sampleData={sampleData}
            />

            {sync && (
                <Fields
                    config={config}
                    setConfig={setConfig}
                    object="sites"
                    sampleData={sampleData}
                    fields={fields}
                    keyHeader="Site Fields"
                />
            )}

            {sync && <Include config={config} setConfig={setConfig} object="sites" sampleData={sampleData} />}
        </Fragment>
    );
};

export default App;
