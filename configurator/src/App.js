import React, { useState, Fragment } from 'react';
import General from './General';
import Users from './Users';
import Devices from './Devices';
import Groups from './Groups';
import GroupMembers from './GroupMembers';
import Sites from './Sites';
import Save from './Save';

const App = () => {
    const [config, setConfig] = useState({});
    const [showNav, setShowNav] = useState(true);

    const handleConfigUpload = event => {
        const file = event.target.files[0];

        if (!file) return;

        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (e) {
            const text = e.target.result;

            try {
                setConfig(JSON.parse(text));
            } catch (error) {
                console.log(error);
            }
        };
    };

    return (
        <div className="container">
            <div className="sidenav text-center col-1 ">
                <small className="btn link-xm-greyblue" onClick={() => setShowNav(!showNav)}>
                    {showNav ? (
                        <div className="hamburger-xm"></div>
                    ) : (
                        <div>
                            <div className="hamburger-xm"></div>
                            <div className="hamburger-xm"></div>
                            <div className="hamburger-xm"></div>
                        </div>
                    )}
                </small>
                {showNav && (
                    <Fragment>
                        <a href="#general">General</a>
                        <a href="#users">Users</a>
                        <a href="#devices">Devices</a>
                        <a href="#groups">Groups</a>
                        <a href="#groupMembers">Group Members</a>
                        <a href="#sites">Sites</a>
                        <a href="#configuration">Config</a>
                    </Fragment>
                )}
            </div>
            <div className="row">
                <div className="col">
                    <div className="">
                        <h1 className="title display-3 text-center ">xmatters-sync</h1>
                        <div className="input-group pl-1">
                            <p>
                                Complete the questions below to configure xmatters-sync. Reloading this page
                                will lose the configuration. Please{' '}
                                <a href="#configuration">export the configuration</a> before leaving this page
                                or closing the browser.
                            </p>
                        </div>

                        <div className=" pt-3">
                            <label className="">{`To modify an existing configuration, upload the xmatters-sync config.json.`}</label>
                            <div className="input-group mb-5 pl-1">
                                <div className="input-group-prepend">
                                    <span className="input-group-text rounded-0">Upload</span>
                                </div>
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        className="custom-file-input"
                                        name="file"
                                        onChange={handleConfigUpload}
                                    />
                                    <label className="custom-file-label rounded-0">{`select your xmatters-sync config.json file`}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="general">
                        General
                    </h1>
                    <p className="">General sync configuration.</p>
                    <General config={config} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className=" text-center" id="users">
                        Users
                    </h1>
                    <Users config={config.users} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="devices">
                        Devices
                    </h1>
                    <Devices config={config.devices} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="groups">
                        Groups
                    </h1>
                    <Groups config={config.groups} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="groupMembers">
                        Group Members
                    </h1>
                    <GroupMembers config={config.groupMembers} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="sites">
                        Sites
                    </h1>
                    <Sites config={config.sites} setConfig={setConfig} />
                </div>
            </div>
            <div className="row justify-content-center pb-3">
                <div className="col">
                    <h1 className="text-center" id="configuration">
                        Configuration
                    </h1>
                    <Save config={config} />
                </div>
            </div>
        </div>
    );
};

export default App;
