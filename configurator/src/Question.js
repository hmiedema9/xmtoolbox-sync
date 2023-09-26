import React, { useState, useRef, Fragment } from 'react';

import HelpButton from './HelpButton';
import AdvancedPill from './AdvancedPill';

const App = ({
    advanced,
    question,
    name,
    handleChange,
    handleSubmit,
    value,
    help,
    options,
    multiple,
    placeholder,
    className = 'form-group  mb-5',
}) => {
    const input = useRef(null);
    const [showHelp, setShowHelp] = useState(false);

    const handleButtonClick = () => {
        handleSubmit(input.current.value);
        input.current.value = '';
    };

    const handleKeyDown = e => {
        if (e.key == 'Enter') {
            handleButtonClick();
        }
    };

    return (
        <div className={className}>
            <label>
                <Fragment>
                    {advanced && <AdvancedPill />}
                    {question}
                </Fragment>
            </label>
            {help && <HelpButton setShowHelp={setShowHelp} showHelp={showHelp} />}

            {!options && !handleSubmit && (
                <input
                    type="text"
                    className="form-control rounded-0"
                    name={name}
                    onInput={handleChange}
                    defaultValue={value}
                    placeholder={placeholder}
                />
            )}

            {!options && handleSubmit && (
                <div className="input-group mb-3">
                    <input
                        ref={input}
                        type="text"
                        onKeyDown={handleKeyDown}
                        className="form-control rounded-0"
                        name={name}
                        placeholder={placeholder}
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-secondary rounded-0 text-xm-black"
                            type="button"
                            onClick={handleButtonClick}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {options && (
                <select
                    name={name}
                    className="form-control rounded-0"
                    value={value === undefined ? placeholder : value}
                    onChange={handleChange}
                    multiple={multiple}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            )}

            {showHelp && help}
        </div>
    );
};

export default App;
