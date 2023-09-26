import React, { useState, Fragment } from 'react';

import CommonQuestions from './CommonQuestions';
import Fields from './Fields';
import Include from './Include';
import PropertyList from './PropertyList';
import Question from './Question';

const { BooleanOptions, StatusOptions, LanguageOptions } = require('./common');

const App = ({ config = {}, setConfig }) => {
    const [sampleData, setSampleData] = useState();

    const { sync, siteDefault, siteInput, siteCreate } = config;

    function handleChange(e) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            prevConfig.users[name] = value;
            return { ...prevConfig };
        });
    }

    const fields = [
        { name: 'Target Name', key: 'targetName' },
        { name: 'Web Login', key: 'webLogin' },
        { name: 'First Name', key: 'firstName' },
        { name: 'Last Name', key: 'lastName' },
        {
            name: 'Language',
            key: 'language',
            defaultOptions: LanguageOptions,
            initialOptions: LanguageOptions,
        },
        { name: 'Phone Login', key: 'phoneLogin' },
        { name: 'Phone PIN', key: 'phonePin' },
        { name: 'Roles', key: 'roles', enableDelimiter: true },
        { name: 'Site', key: 'site' },
        { name: 'Supervisors', key: 'supervisors', enableDelimiter: true },
        { name: 'Timezone', key: 'timezone' },

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
                object="users"
                setSampleData={setSampleData}
                sampleData={sampleData}
            />

            {sync && (
                <Fields
                    config={config}
                    setConfig={setConfig}
                    object="users"
                    sampleData={sampleData}
                    fields={fields}
                    keyHeader="User Fields"
                />
            )}

            {sync && (siteInput || siteDefault) && (
                <Question
                    key="siteCreate"
                    question="Should xMatters sites be created automatically from the user's site?"
                    name="siteCreate"
                    handleChange={handleChange}
                    value={siteCreate}
                    help={
                        <small className="form-text text-muted">
                            This will create any sites from the user's sites. The value in site is treated as
                            a site name. This cannot be enabled when synchronizing sites. If this is not
                            enabled, sites need to be created manually or synchronized with matching site
                            names.
                        </small>
                    }
                    options={BooleanOptions}
                />
            )}

            {sync && <PropertyList config={config} setConfig={setConfig} sampleData={sampleData} />}

            {sync && <Include config={config} setConfig={setConfig} object="users" sampleData={sampleData} />}
        </Fragment>
    );
};

export default App;
