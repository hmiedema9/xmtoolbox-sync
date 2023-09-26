import React, { useState, Fragment } from 'react';

import CommonQuestions from './CommonQuestions';
import DeviceList from './DeviceList';
import Include from './Include';
import Question from './Question';

const { BooleanOptions } = require('./common');

const App = ({ config = {}, setConfig }) => {
    const [sampleData, setSampleData] = useState();

    const { sync, ownerInput, priorityThresholdSync, delaySync, sequenceSync } = config;

    function handleChange(e) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            prevConfig.devices[name] = value;
            return { ...prevConfig };
        });
    }

    return (
        <Fragment>
            <CommonQuestions
                config={config}
                setConfig={setConfig}
                object="devices"
                setSampleData={setSampleData}
                sampleData={sampleData}
            />
            {sync && (
                <Question
                    key="priorityThresholdSync"
                    question="Will this sync set device priority threshold?"
                    name="priorityThresholdSync"
                    handleChange={handleChange}
                    value={priorityThresholdSync}
                    help={
                        <small className="form-text text-muted">
                            If enabled, the device priority threshold may be configured for each device
                            configured in this sync. Device priority threshold is the minimum priority of an
                            event that will be delivered to this device.
                        </small>
                    }
                    options={BooleanOptions}
                />
            )}
            {sync && (
                <Question
                    key="delaySync"
                    question="Will this sync set device delay?"
                    name="delaySync"
                    handleChange={handleChange}
                    value={delaySync}
                    help={
                        <small className="form-text text-muted">
                            If enabled, the delay may be configured for each device configured in this sync.
                            Device delay is the number of minutes to wait for a response before contacting the
                            next device.
                        </small>
                    }
                    options={BooleanOptions}
                />
            )}
            {sync && (
                <Question
                    key="sequenceSync"
                    question="Will this sync set device sequence?"
                    name="sequenceSync"
                    handleChange={handleChange}
                    value={sequenceSync}
                    help={
                        <small className="form-text text-muted">
                            If enabled, the sequence may be configured for each device configured in this
                            sync. Device sequence is the order in which the device will be contacted, where 1
                            represents the first device contacted. If the provided sequence number is higher
                            than the number of existing devices, the device is added to the end of the device
                            order.
                        </small>
                    }
                    options={BooleanOptions}
                />
            )}
            {sync && (
                <Question
                    key="ownerInput"
                    question="Specify the field that contains the device owner username?"
                    name="ownerInput"
                    handleChange={handleChange}
                    value={ownerInput}
                    help={
                        <small className="form-text text-muted">
                            This field specified should contain the users' targetName in xMatters.
                        </small>
                    }
                    options={
                        sampleData && sampleData[0]
                            ? [{ name: 'none', value: '' }].concat(
                                  Object.keys(sampleData[0]).map(key => ({
                                      name: key + ' - sample: ' + sampleData[0][key],
                                      value: key,
                                  }))
                              )
                            : null
                    }
                />
            )}
            {sync && <DeviceList config={config} setConfig={setConfig} sampleData={sampleData} />}
            {sync && (
                <Include config={config} setConfig={setConfig} object="devices" sampleData={sampleData} />
            )}
        </Fragment>
    );
};

export default App;
