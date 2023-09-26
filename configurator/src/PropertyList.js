import React, { useState } from 'react';
import Question from './Question';

import HelpButton from './HelpButton';

const App = ({ setConfig, config, sampleData }) => {
    const properties = config.properties || [];

    const [showHelp, setShowHelp] = useState(false);

    function handleSubmit(value) {
        console.log('properties handleSubmit');
        if (!value) return;

        setConfig(prevConfig => {
            console.log(prevConfig);
            if (!prevConfig.users.properties) {
                prevConfig.users.properties = [];
            }
            prevConfig.users.properties.push({ input: value });
            console.log(prevConfig);
            return { ...prevConfig };
        });
    }

    function handleChange(e) {
        console.log('properties handleChange');
        let { value } = e.target;

        if (!value) return;

        setConfig(prevConfig => {
            if (!prevConfig.users) prevConfig.users = {};
            if (!prevConfig.users.properties) {
                prevConfig.users.properties = [];
            }

            prevConfig.users.properties.push({ input: value });
            return { ...prevConfig };
        });
    }
    function handlePropertyChange(e, input) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            const property = prevConfig.users.properties.find(property => property.input === input);
            property[name] = value;
            return { ...prevConfig };
        });
    }

    function handlePropertyRemove(input) {
        setConfig(prevConfig => {
            prevConfig.users.properties = prevConfig.users.properties.filter(
                property => property.input !== input
            );

            return { ...prevConfig };
        });
    }

    const Rows = properties.map(({ input, name, default: _default, delimiter, defaultOptions }) => {
        //input, name: _name, default: _default, delimiter
        return (
            <tr key={input}>
                <td>
                    {input}
                    <button
                        title="remove property"
                        className="btn btn-sm font-weight-bold text-danger"
                        onClick={() => handlePropertyRemove(input)}
                    >
                        <div className="align-middle mb-1">&times;</div>
                    </button>
                </td>
                <td>
                    <input
                        type="text"
                        className="form-control rounded-0"
                        name={'name'}
                        onInput={e => handlePropertyChange(e, input)}
                        defaultValue={name}
                        placeholder={input}
                    />
                </td>

                <td>
                    {/* Default */}

                    {!defaultOptions && (
                        <input
                            type="text"
                            className="form-control rounded-0"
                            name={'default'}
                            onChange={e => handlePropertyChange(e, input)}
                            defaultValue={_default}
                        />
                    )}

                    {defaultOptions && (
                        <select
                            name={'default'}
                            value={_default}
                            className="form-control rounded-0"
                            onChange={e => handlePropertyChange(e, input)}
                        >
                            <option key="null" value={null}></option>
                            {defaultOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    )}
                </td>
                <td>
                    <input
                        type="text"
                        className="form-control rounded-0"
                        name={'delimiter'}
                        onChange={e => handlePropertyChange(e, input)}
                        placeholder=""
                        defaultValue={delimiter}
                    />
                </td>
            </tr>
        );
    });

    return (
        <div className="pb-3">
            <Question
                question={`Add any user custom fields that will be synchronized in the file.`}
                name="properties"
                handleChange={handleChange}
                value={''}
                handleSubmit={handleSubmit}
                className="form-group "
                //help={<small className="form-text text-muted">{``}</small>}
                options={
                    sampleData && sampleData[0]
                        ? [{ name: '', value: '' }].concat(
                              Object.keys(sampleData[0])
                                  .filter(
                                      key =>
                                          !properties || !properties.some(property => property.input === key)
                                  )
                                  .map(key => ({
                                      name: key + ' - sample: ' + sampleData[0][key],
                                      value: key,
                                  }))
                          )
                        : null
                }
            />

            {properties && properties.length > 0 && (
                <p className="">
                    <b>User Properties:</b>
                </p>
            )}

            {properties && properties.length > 0 && (
                <div className="px-3">
                    <label>Configure User Custom Fields</label>
                    <HelpButton setShowHelp={setShowHelp} showHelp={showHelp} />
                    {showHelp && (
                        <small className="form-text text-muted mb-3">
                            All values in the User Properties table are optional. The field name will be used
                            as the property name in xMatters. Setting the xMatters name will overwrite this
                            and allow you to change the name to match a different custom field name in
                            xMatters. Default values are applied when no value is supplied in the input file
                            for a record. Delimiters are used to specify multiple values and are applied to
                            the input from the file and the default value. If you want to set multiple values
                            for the default separate values by the same delimiter.
                        </small>
                    )}

                    <table className="table">
                        <thead>
                            <tr>
                                <th className="text-capitalize">Field</th>
                                <th>xMatters Name</th>
                                <th>Default Value</th>
                                {/* <th>Initial Value</th> */}
                                <th>Delimiter</th>
                            </tr>
                        </thead>
                        <tbody>{Rows}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;
