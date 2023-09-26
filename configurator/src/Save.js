import React, { useRef } from 'react';

const App = ({ config = {} }) => {
    const copyArea = useRef();

    return (
        <div className=" pb-5">
            <p>
                The configuration should be placed in the main project directory and in a file named
                config.json.
            </p>
            <button
                className="btn btn-xm rounded-0"
                onClick={() => {
                    let textData = JSON.stringify(config, null, 2);
                    let blobData = new Blob([textData], { type: 'application/json' });
                    let url = window.URL.createObjectURL(blobData);
                    let a = document.createElement('a');
                    a.style = 'display: none';
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = 'config.json';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                }}
            >
                Download Config
            </button>

            <button
                className="btn btn-xm ml-3 rounded-0"
                onClick={() => {
                    copyArea.current.select();
                    document.execCommand('copy');
                    if (window.getSelection) {
                        if (window.getSelection().empty) {
                            // Chrome
                            window.getSelection().empty();
                        } else if (window.getSelection().removeAllRanges) {
                            // Firefox
                            window.getSelection().removeAllRanges();
                        }
                    } else if (document.selection) {
                        // IE?
                        document.selection.empty();
                    }
                }}
            >
                Copy to Clipboard
            </button>

            <div className="pt-4">
                <p>The configuration below was generated based on the answers to the questions above.</p>

                <textarea
                    className="form-control my-3"
                    ref={copyArea}
                    onChange={() => {}}
                    value={JSON.stringify(config, null, 2)}
                    rows={JSON.stringify(config, null, 2).split('\n').length}
                ></textarea>
            </div>
        </div>
    );
};

export default App;
