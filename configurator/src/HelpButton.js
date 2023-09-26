import React from 'react';

const App = ({ showHelp, setShowHelp }) => {
    return (
        <button
            className={`ml-1 mb-1 btn help-button ${showHelp ? 'btn-dark' : 'btn-outline-dark'}`}
            title={showHelp ? 'hide help' : 'show help'}
            onClick={() => {
                setShowHelp(!showHelp);
            }}
        >
            <b>?</b>
        </button>
    );
};

export default App;
