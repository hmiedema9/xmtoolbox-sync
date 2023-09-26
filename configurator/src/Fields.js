import React, { useState } from 'react';

import HelpButton from './HelpButton';

const App = ({ config, setConfig, object, sampleData, fields, keyHeader }) => {
    const _object = object.split('.');
    function handleChange(e) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            if (_object.length > 1) {
                //only supports things like devices.devices.0 where the second one is an array.
                prevConfig[_object[0]][_object[1]][_object[2]][name] = value;
            } else {
                if (!prevConfig[object]) prevConfig[object] = {};
                prevConfig[object][name] = value;
            }

            return { ...prevConfig };
        });
    }

    const [showHelp, setShowHelp] = useState(false);

    const inputOptions = [];

    const showDelimiterColumn = fields.some(f => f.enableDelimiter);

    if (sampleData && sampleData[0]) {
        Object.keys(sampleData[0]).map(key => {
            inputOptions.push({
                name: key + ' - sample: ' + sampleData[0][key],
                value: key,
            });
        });
    }

    const Rows = fields.map(({ name, key, defaultOptions, initialOptions, enableDelimiter }) => {
        return (
            <tr key={key}>
                <td>{name}</td>
                <td>
                    {/* Input */}
                    {inputOptions.length === 0 && (
                        <input
                            type="text"
                            className="form-control rounded-0"
                            name={key + 'Input'}
                            onInput={handleChange}
                            defaultValue={config[key + 'Input']}
                        />
                    )}

                    {inputOptions.length > 0 && (
                        <select
                            name={key + 'Input'}
                            className="form-control rounded-0"
                            value={config[key + 'Input']}
                            onChange={handleChange}
                        >
                            <option key="null" value={null}>
                                Not Synchronized
                            </option>
                            {inputOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    )}
                </td>

                <td>
                    {/* Default */}

                    {!defaultOptions && (
                        <input
                            type="text"
                            className="form-control rounded-0"
                            name={key + 'Default'}
                            onChange={handleChange}
                            defaultValue={config[key + 'Default']}
                        />
                    )}

                    {defaultOptions && (
                        <select
                            name={key + 'Default'}
                            value={config[key + 'Default']}
                            className="form-control rounded-0"
                            onChange={handleChange}
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
                    {/* Initial */}
                    {!initialOptions &&
                        ((<option key="null" value={null}></option>),
                        (
                            <input
                                type="text"
                                className="form-control rounded-0"
                                name={key + 'Initial'}
                                onChange={handleChange}
                                defaultValue={config[key + 'Initial']}
                            />
                        ))}

                    {initialOptions && (
                        <select
                            name={key + 'Initial'}
                            value={config[key + 'Initial']}
                            className="form-control rounded-0"
                            onChange={handleChange}
                        >
                            <option key="null" value={null}></option>
                            {initialOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    )}
                </td>
                {enableDelimiter && (
                    <td>
                        <input
                            type="text"
                            className="form-control rounded-0"
                            name={key + 'Delimiter'}
                            onChange={handleChange}
                            placeholder="|"
                            defaultValue={config[key + 'Delimiter']}
                        />
                    </td>
                )}
            </tr>
        );
    });

    return (
        <div className="px-3 pb-3">
            <label>Configure the xMatters fields.</label>
            <HelpButton setShowHelp={setShowHelp} showHelp={showHelp} />

            {showHelp && (
                <small className="form-text text-muted mb-3">
                    Set the File Input to synchronize a value from a file. Specify a default value to use if
                    the file input is empty or not available. Initial values are applied when creating the
                    record for the first time.{' '}
                    {showDelimiterColumn &&
                        'Delimiters are used to specify multiple values and are applied to the input from the file, the default value, and the initial value. If you want to set multiple values for these separate the default and initial values by the same delimiter.'}
                </small>
            )}
            <table className="table">
                <thead>
                    <tr>
                        <th>{keyHeader}</th>
                        <th>File Input</th>
                        <th>Default Value</th>
                        <th>Initial Value</th>
                        {showDelimiterColumn && <th>Delimiter</th>}
                    </tr>
                </thead>
                <tbody>{Rows}</tbody>
            </table>
        </div>
    );
};

export default App;
