import React, { useState, Fragment } from 'react';
import Question from './Question';
import Fields from './Fields';
import HelpButton from './HelpButton';

const { VariableToWords } = require('./common');

const App = ({ setConfig, config, sampleData }) => {
    const devices = config.devices || [];
    const syncKeys = ['delay', 'sequence', 'priorityThreshold', 'externallyOwned'];
    const enabledSyncKeys = syncKeys.filter(key => config[key + 'Sync']);

    function handleRemove(index) {
        setConfig(prevConfig => {
            if (!prevConfig.devices) prevConfig.devices = {};
            prevConfig.devices.devices.splice(index, 1);
            return { ...prevConfig };
        });
    }
    const [showHelp, setShowHelp] = useState(false);

    function handleSubmit(value) {
        if (!value) return;

        setConfig(prevConfig => {
            if (!prevConfig.devices) prevConfig.devices = {};
            if (!prevConfig.devices.devices) {
                prevConfig.devices.devices = [];
            }
            prevConfig.devices.devices.push({ input: value });
            return { ...prevConfig };
        });
    }

    function handleChange(e) {
        let { value } = e.target;

        if (!value) return;

        setConfig(prevConfig => {
            if (!prevConfig.devices) prevConfig.devices = {};
            if (!prevConfig.devices.devices) {
                prevConfig.devices.devices = [];
            }

            prevConfig.devices.devices.push({ input: value });
            return { ...prevConfig };
        });
    }
    function handlePropertyChange(e, index) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            const device = prevConfig.devices.devices[index];
            device[name] = value;
            return { ...prevConfig };
        });
    }

    const Rows = devices.map(({ input, name, default: _default, defaultOptions, deviceType }, i) => {
        //input, name: _name, default: _default, delimiter

        const fields = enabledSyncKeys.map(key => {
            return { name: VariableToWords(key), key };
        });

        return (
            <Fragment key={i}>
                <tr>
                    <td>
                        {input}
                        <button
                            title="remove device"
                            className="btn btn-sm font-weight-bold text-danger"
                            onClick={() => handleRemove(i)}
                        >
                            <div className="align-middle mb-1">&times;</div>
                        </button>
                    </td>

                    <td>
                        <input
                            type="text"
                            className="form-control rounded-0"
                            name={'name'}
                            onInput={e => handlePropertyChange(e, i)}
                            defaultValue={name}
                            placeholder={input}
                        />
                    </td>

                    <td>
                        <select
                            name={'deviceType'}
                            value={deviceType}
                            className="form-control"
                            onChange={e => handlePropertyChange(e, i)}
                        >
                            <option value="EMAIL">Email</option>
                            <option value="VOICE">Phone - Voice</option>
                            <option value="TEXT_PHONE">Phone - SMS</option>
                        </select>
                    </td>
                </tr>
                {enabledSyncKeys.length > 0 && (
                    <tr className="bg-xm-lightgrey">
                        <td colSpan="4">
                            <Fields
                                config={config.devices}
                                setConfig={setConfig}
                                object={'devices.devices.' + i}
                                sampleData={sampleData}
                                fields={fields}
                                keyHeader={(name || input) + ' Fields'}
                            />
                        </td>
                    </tr>
                )}
            </Fragment>
        );
    });

    return (
        <div className="pb-3">
            <Question
                question={`Add any devices that will be synchronized from the file.`}
                name="devices"
                handleChange={handleChange}
                value={''}
                handleSubmit={handleSubmit}
                className="form-group "
                //help={<small className="form-text text-muted">{``}</small>}
                options={
                    sampleData && sampleData[0]
                        ? [{ name: '', value: '' }].concat(
                              Object.keys(sampleData[0]).map(key => ({
                                  name: key + ' - sample: ' + sampleData[0][key],
                                  value: key,
                              }))
                          )
                        : null
                }
            />

            {devices && devices.length > 0 && (
                <p className="">
                    <b>Devices:</b>
                </p>
            )}

            {devices && devices.length > 0 && (
                <div className="px-3">
                    <label>Configure synchronized devices</label>
                    <HelpButton setShowHelp={setShowHelp} showHelp={showHelp} />
                    {showHelp && (
                        <small className="form-text text-muted mb-3">
                            All values in the Devices table are optional. The field name will be used as the
                            device name in xMatters. Setting the xMatters name will overwrite this and allow
                            you to change the name to match a different device name in xMatters. Default
                            values are applied when no value is supplied in the input file for a record.
                            Delimiters are used to specify multiple values and are applied to the input from
                            the file and the default value.
                        </small>
                    )}

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>xMatters Device Name</th>
                                <th>Device Type</th>
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
