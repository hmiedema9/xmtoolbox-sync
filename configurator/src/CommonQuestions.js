import React from 'react';
import { CsvToJson } from 'xmtoolbox/lib/util';
import Question from './Question';

const { BooleanOptions, VariableToWords } = require('./common');

const App = ({ config, setConfig, object, setSampleData, sampleData, simpleMirrorMode }) => {
    const { sync, inputPath, mirrorMode, processInput, processDeleteValue } = config;

    function handleChange(e) {
        let { name, value } = e.target;

        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        setConfig(prevConfig => {
            if (!prevConfig[object]) prevConfig[object] = {};
            prevConfig[object][name] = value;
            return { ...prevConfig };
        });
    }

    const handleFileUpload = event => {
        const file = event.target.files[0];

        if (!file) return;

        const { name } = file;

        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (e) {
            const text = e.target.result;

            if (name.toLowerCase().endsWith('.json')) {
                setSampleData(JSON.parse(text));
            } else if (name.toLowerCase().endsWith('.csv')) {
                setSampleData(CsvToJson(text));
            } else {
                throw Error(`File format not supported: ${name}`);
            }
        };

        if (!inputPath) {
            setConfig(prevConfig => {
                if (!prevConfig[object]) prevConfig[object] = {};
                prevConfig[object].inputPath = './input/' + name;
                return { ...prevConfig };
            });
        }
    };

    const questions = [
        <Question
            key="sync"
            question={`Synchronize ${VariableToWords(object)}?`}
            name="sync"
            handleChange={handleChange}
            value={sync}
            options={BooleanOptions}
        />,
    ];

    if (sync) {
        questions.push(
            <div key="file">
                <label className="">{`Upload a sample ${object} input file to assist with configuration.`}</label>
                <div className="input-group  mb-5">
                    <div className="input-group-prepend">
                        <span className="input-group-text rounded-0">Upload</span>
                    </div>
                    <div className="custom-file">
                        <input
                            type="file"
                            className="custom-file-input"
                            name="file"
                            onChange={handleFileUpload}
                        />
                        <label className="custom-file-label rounded-0">{`choose sample ${object} file`}</label>
                    </div>
                </div>
            </div>
        );

        questions.push(
            <Question
                key="inputPath"
                question={`What is the file path of the input file for ${object}?`}
                name="inputPath"
                handleChange={handleChange}
                value={inputPath}
                help={
                    <small className="form-text text-muted">
                        The file can be a CSV or JSON. If JSON, it must be an array of records.
                        {` example: ./input/${object}_input.csv`}
                    </small>
                }
            />
        );

        const mirrorOptions = simpleMirrorMode ? [
            { name: 'No', value: false },
            { name: 'Yes', value: true },
        ]: [
            { name: 'No', value: false },
            { name: 'Yes', value: true },
            { name: 'Yes, and adopt matching records', value: 'greedy' },
        ]

        questions.push(
            <Question
                key="mirrorMode"
                question="When records are removed from the file should they be removed from xMatters?"
                name="mirrorMode"
                handleChange={handleChange}
                value={mirrorMode}
                help={
                    <small className="form-text text-muted">
                        Choosing yes will only modify records synchronized by this sync. If you choose 'No',
                        your file may optionally include a column to specific when records should be added or
                        removed. If you choose to adopt existing records it will take ownership of any records
                        with matches. If choosing to adopt matching records, consider switching this back to
                        Yes after running the sync initially for better performance.
                    </small>
                }
                options={mirrorOptions}
            />
        );

        if (!mirrorMode) {
            questions.push(
                <Question
                    key="processInput"
                    question="If one exists, select a field that specifies if the record should be removed or added/updated?"
                    name="processInput"
                    handleChange={handleChange}
                    value={processInput}
                    help={
                        <small className="form-text text-muted">
                            If not specified, all records will be added or updated and no records will be
                            removed by xmatters-sync.
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
            );
        }

        if (!mirrorMode && processInput) {
            questions.push(
                <Question
                    key="processDeleteValue"
                    question={`What value in the ${processInput} field should result in the record being removed from xMatters?`}
                    name="processDeleteValue"
                    handleChange={handleChange}
                    value={processDeleteValue}
                    help={<small className="form-text text-muted">Example: remove</small>}
                />
            );
        }
    }

    return questions;
};

export default App;
