import React, { useEffect, Fragment } from 'react';
import Question from './Question';

const App = ({ setConfig, config: { include }, sampleData, object }) => {
    useEffect(() => {
        //convert to array if value is already set as string.
        if (include && !Array.isArray(include)) {
            setConfig(prevConfig => {
                if (!prevConfig[object]) prevConfig[object] = {};
                prevConfig[object].include = [include];
                return { ...prevConfig };
            });
        }
    }, []);

    function handleRemove(value) {
        setConfig(prevConfig => {
            if (!prevConfig[object]) prevConfig[object] = {};
            prevConfig[object].include = prevConfig[object].include.filter(item => item !== value);
            return { ...prevConfig };
        });
    }

    function handleSubmit(value) {
        if (!value) return;

        setConfig(prevConfig => {
            if (!prevConfig[object]) prevConfig[object] = {};
            if (!prevConfig[object].include) {
                prevConfig[object].include = [];
            }
            prevConfig[object].include.push(value);
            return { ...prevConfig };
        });
    }

    function handleChange(e) {
        let { value } = e.target;

        if (!value) return;

        setConfig(prevConfig => {
            if (!prevConfig[object]) prevConfig[object] = {};
            if (!prevConfig[object].include) {
                prevConfig[object].include = [];
            }
            prevConfig[object].include.push(value);
            return { ...prevConfig };
        });
    }

    return (
        <Fragment>
            <Question
                advanced={true}
                question={`Include additional values from the import file that do not map directly to a ${object} property?`}
                name="include"
                handleChange={handleChange}
                value={''}
                handleSubmit={handleSubmit}
                className="form-group "
                help={
                    <small className="form-text text-muted">
                        {`You may include additional fields from the records that do not directly map to an
                        xMatters record. These properties will be included for each record and made available
                        in the ${object} transform function found in config.js. The name of the field/column such as "Area Code" will be the name of the property. These are often used when data needs to
                        be combined from multiple fields. For example xMatters phone numbers are a single field. 
                        When creating a phone number where the area code, phone number, and extension exist in separate fields these fields would need to be included and combined
                         in a custom transform function in config.js.`}
                    </small>
                }
                options={
                    sampleData && sampleData[0]
                        ? [{ name: '', value: '' }].concat(
                              Object.keys(sampleData[0])
                                  .filter(key => !include || include.indexOf(key) === -1)
                                  .map(key => ({
                                      name: key + ' - sample: ' + sampleData[0][key],
                                      value: key,
                                  }))
                          )
                        : null
                }
            />

            {include && include.length > 0 && (
                <p className="">
                    <b>Included Fields:</b>
                </p>
            )}

            {include && Array.isArray(include) && (
                <div className="pl-2">
                    {include.map(item => (
                        <div className="badge badge-secondary mx-2" key={item}>
                            {item}{' '}
                            <button
                                className="btn btn-sm font-weight-bold"
                                onClick={() => handleRemove(item)}
                            >
                                <div className="align-middle mb-1">&times;</div>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Fragment>
    );
};

export default App;
