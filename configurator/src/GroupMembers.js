import React, { useState, Fragment } from 'react';

import CommonQuestions from './CommonQuestions';
import Fields from './Fields';
import Include from './Include';

const App = ({ config = {}, setConfig }) => {
    const [sampleData, setSampleData] = useState();

    const { sync } = config;

    const fields = [
        { name: 'Group', key: 'group' },
        { name: 'Member(s)', key: 'members', enableDelimiter: true },
    ];

    return (
        <Fragment>
            <CommonQuestions
                config={config}
                setConfig={setConfig}
                object="groupMembers"
                setSampleData={setSampleData}
                sampleData={sampleData}
                simpleMirrorMode={true}
            />

            {sync && (
                <Fields
                    config={config}
                    setConfig={setConfig}
                    object="groupMembers"
                    sampleData={sampleData}
                    fields={fields}
                    keyHeader="Group Member Fields"
                />
            )}

            {sync && (
                <Include
                    config={config}
                    setConfig={setConfig}
                    object="groupMembers"
                    sampleData={sampleData}
                />
            )}
        </Fragment>
    );
};

export default App;
