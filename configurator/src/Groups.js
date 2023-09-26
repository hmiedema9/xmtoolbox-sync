import React, { useState, Fragment } from 'react';

import CommonQuestions from './CommonQuestions';
import Fields from './Fields';
import Include from './Include';

const { BooleanOptions, StatusOptions } = require('./common');

const App = ({ config = {}, setConfig }) => {
    const [sampleData, setSampleData] = useState();

    const { sync } = config;

    const fields = [
        { name: 'Name', key: 'targetName' },
        { name: 'Description', key: 'description' },
        { name: 'Observers', key: 'observers', enableDelimiter: true },
        {
            name: 'Observed By All',
            key: 'observedByAll',
            defaultOptions: BooleanOptions,
            initialOptions: BooleanOptions,
        },
        { name: 'Supervisors', key: 'supervisors', enableDelimiter: true },
        { name: 'Site', key: 'site' },
        {
            name: 'Allow Duplicates',
            key: 'allowDuplicates',
            defaultOptions: BooleanOptions,
            initialOptions: BooleanOptions,
        },
        {
            name: 'Use Default Devices',
            key: 'useDefaultDevices',
            defaultOptions: BooleanOptions,
            initialOptions: BooleanOptions,
        },
        {
            name: 'Externally Owned',
            key: 'externallyOwned',
            defaultOptions: BooleanOptions,
            initialOptions: BooleanOptions,
        },
        { name: 'Status', key: 'status', defaultOptions: StatusOptions, initialOptions: StatusOptions },
    ];

    return (
        <Fragment>
            <CommonQuestions
                config={config}
                setConfig={setConfig}
                object="groups"
                setSampleData={setSampleData}
                sampleData={sampleData}
            />

            {sync && (
                <Fields
                    config={config}
                    setConfig={setConfig}
                    object="groups"
                    sampleData={sampleData}
                    fields={fields}
                    keyHeader="Group Fields"
                />
            )}

            {sync && (
                <Include config={config} setConfig={setConfig} object="groups" sampleData={sampleData} />
            )}
        </Fragment>
    );
};

export default App;
