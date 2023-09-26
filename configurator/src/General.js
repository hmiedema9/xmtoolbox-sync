import React, { Fragment } from 'react';
import Question from './Question';
import WorkflowSetup from './assets/WorkflowSetup.gif';
import CreateXMPW from './assets/CreateXMPW.gif';

const { BooleanOptions } = require('./common');

const App = ({ config = {}, setConfig }) => {
    function handleChange(e) {
        let { name, value } = e.target;

        if (['summaryRecipients'].includes(name)) {
            setConfig({
                ...config,
                [name]: value
                    .split(',')
                    .filter(recipient => recipient)
                    .map(recipient => recipient.trim()),
            });
        } else {
            if (value === 'true') value = true;
            else if (value === 'false') value = false;

            setConfig({
                ...config,
                [name]: value,
            });
        }
    }

    return (
        <div className="">
            <Question
                question="What is your xMatters subdomain?"
                name="subdomain"
                handleChange={handleChange}
                value={config.subdomain}
                help={
                    <small className="form-text text-muted">
                        company is the subdomain from the xMatters url https://<u>company</u>.xmatters.com
                    </small>
                }
            />
            <Question
                question="What is the xMatters user or API key you will use to run the sync?"
                name="username"
                handleChange={handleChange}
                value={config.username}
                help={
                    <small className="form-text text-muted">
                        The user should have the "REST Web Service User" Role.
                    </small>
                }
            />
            <Question
                question={`What is the xmpw encryption key or password for ${
                    config.username ? 'user "' + config.username + '"' : 'the user specified above'
                }?`}
                name="password"
                handleChange={handleChange}
                value={config.password}
                help={
                    <small className="form-text text-muted">
                        This configuration can take an xmpw encryption key, an API key secret or a user's
                        password. The recommended method is to use an xmpw file to store an api-key secret or
                        a user's password. If leveraged the encryption key may be supplied here or in an
                        environment variable given to you when using <code>npx create-xmpw</code>. See
                        instructions below for encrypting your password in an xmpw file.
                        <img src={CreateXMPW} alt="workflow setup" />
                    </small>
                }
            />
            <Question
                question="Is xmatters-sync behind a proxy?"
                name="proxy"
                handleChange={handleChange}
                value={config.proxy}
                help={
                    <small className="form-text text-muted">
                        If xmatters-sync is behind a proxy enable this and set the host and port for the
                        proxy. HTTP proxies without a path are supported currently.
                    </small>
                }
                options={BooleanOptions}
            />
            {config.proxy && (
                <Fragment>
                    <Question
                        question="What is the ip address or hostname of the proxy?"
                        name="proxyHost"
                        handleChange={handleChange}
                        value={config.proxyHost}
                    />
                    <Question
                        question="What port is the proxy is hosted at?"
                        name="proxyPort"
                        handleChange={handleChange}
                        value={config.proxyPort}
                    />
                </Fragment>
            )}
            <Question
                question="What is the url for your xmatters-sync workflow?"
                name="workflowEndpoint"
                handleChange={handleChange}
                value={config.workflowEndpoint}
                help={<img src={WorkflowSetup} alt="workflow setup" />}
            />
            {config.workflowEndpoint && (
                <Fragment>
                    <Question
                        question="Which xMatters users should receive the summary notification?"
                        name="summaryRecipients"
                        handleChange={handleChange}
                        value={
                            Array.isArray(config.summaryRecipients)
                                ? config.summaryRecipients.join(',')
                                : config.summaryRecipients
                        }
                        help={
                            <small className="form-text text-muted">
                                Set to an xMatters recipient identifier such as a user's username, group name,
                                or dynamic team name. Separate multiple with a comma.
                            </small>
                        }
                    />

                    <Question
                        question="Should an onboarding email be sent to new xMatters users?"
                        name="onboarding"
                        handleChange={handleChange}
                        value={config.onboarding}
                        help={
                            <small className="form-text text-muted">
                                If enabled, any users created when the sync runs with email devices will
                                receive an onboarding email.
                            </small>
                        }
                        options={BooleanOptions}
                    />
                </Fragment>
            )}

            {config.workflowEndpoint && config.onboarding && (
                <Fragment>
                    <Question
                        question="What should be the subject of the onboarding email?"
                        name="onboardingSubject"
                        value={config.onboardingSubject}
                        handleChange={handleChange}
                        placeholder={'Welcome to xMatters'}
                        help={
                            <small className="form-text text-muted">
                                A custom email subject may be configured for the onboarding emails if desired.
                            </small>
                        }
                    />
                    <Question
                        question="What should be the signature of the onboarding email?"
                        name="onboardingSignature"
                        value={config.onboardingSignature}
                        handleChange={handleChange}
                        placeholder={
                            "You've been invited to join your team in xMatters. We've already created an account for you - just specify a password so you can get started."
                        }
                        help={
                            <small className="form-text text-muted">
                                A custom email signature may be configured for the onboarding emails if
                                desired.
                            </small>
                        }
                    />
                    <Question
                        question="What should be the message in the onboarding email?"
                        name="onboardingCustomMessage"
                        value={config.onboardingCustomMessage}
                        handleChange={handleChange}
                        placeholder={'Welcome Aboard! The xMatters Team'}
                        help={
                            <small className="form-text text-muted">
                                A custom message may be configured for the onboarding emails if desired.
                            </small>
                        }
                    />
                </Fragment>
            )}

            <Question
                question="What logging level would you like?"
                advanced={true}
                name="logLevel"
                handleChange={handleChange}
                value={config.logLevel}
                placeholder={'info'}
                help={
                    <small className="form-text text-muted">
                        The logging level applies to the console output and the sync log.
                    </small>
                }
                options={[
                    { name: 'everything', value: 'debug' },
                    { name: 'info, warnings, and errors only', value: 'info' },
                    { name: 'warning and errors only', value: 'warn' },
                    { name: 'errors only', value: 'error' },
                    { name: 'no logging', value: 'silent' },
                ]}
            />

            <Question
                question="What frequency of logs do you want to keep?"
                advanced={true}
                name="logs"
                handleChange={handleChange}
                value={config.logs}
                placeholder={'7d'}
                help={
                    <small className="form-text text-muted">
                        The sync log and error logs are controlled by this option.
                    </small>
                }
                options={[
                    { name: 'no logging', value: false },
                    { name: 'save only the last log', value: true },
                    { name: 'save last log each day for 7 days', value: '7d' },
                    { name: 'save all logs', value: 'all' },
                ]}
            />

            <Question
                question="Where should the logs be placed?"
                advanced={true}
                name="logsDirectory"
                handleChange={handleChange}
                value={config.logsDirectory}
                placeholder="./logs"
                help={
                    <small className="form-text text-muted">
                        xmatters-sync must have rights to write to the specified directory. The path can be a
                        fully qualified path or a path relative to xmatters-sync.
                    </small>
                }
            />

            <Question
                question="What frequency of backup do you want to keep?"
                advanced={true}
                name="backup"
                handleChange={handleChange}
                value={config.backup}
                placeholder={'7d'}
                help={
                    <small className="form-text text-muted">
                        The backup option keeps a backup of all incoming data and your xMatters environment
                        before it was processed by xmatters-sync.
                    </small>
                }
                options={[
                    { name: 'no backup', value: 'false' },
                    { name: 'save only the last backup', value: 'true' },
                    { name: 'save last backup each day for 7 days', value: '7d' },
                    { name: 'save all backups', value: 'all' },
                ]}
            />

            <Question
                question="Where should the backups be placed?"
                advanced={true}
                name="backupDirectory"
                handleChange={handleChange}
                value={config.backupDirectory}
                placeholder="./backup"
                help={
                    <small className="form-text text-muted">
                        xmatters-sync must have rights to write to the specified directory. The path can be a
                        fully qualified path or a path relative to xmatters-sync.
                    </small>
                }
            />

            <Question
                question="Do you want to prevent changes in xMatters and run a simulated sync (a dry run)?"
                advanced={true}
                name="dryRun"
                handleChange={handleChange}
                value={config.dryRun}
                placeholder={'false'}
                help={
                    <small className="form-text text-muted">
                        This option allows you to simulate a sync run in your environment. Preventing changes
                        in your environment will output the records that would be added, removed, or updated
                        in xMatters when the sync runs. When preventing changes in xMatters, errors from
                        xMatters and time to run are not simulated.
                    </small>
                }
                options={[
                    {
                        name: 'simulate the sync and prevent data from being added, changed or removed from xMatters',
                        value: 'true',
                    },
                    { name: 'sync normally and update xMatters', value: 'false' },
                ]}
            />

            <Question
                question="Would you like to configure a custom external key tag?"
                advanced={true}
                name="mirrorTag"
                handleChange={handleChange}
                value={config.mirrorTag}
                placeholder="XMSYNC_"
                help={
                    <small className="form-text text-muted">
                        Required for multiple mirror-mode syncs(when record being removed from a file results
                        in it being removed from xMatters) to the same xMatters instance. This is a string
                        that is applied as a prefix to the external keys of xMatters records "owned" by this
                        sync. Configuring two syncs with the same tags is not supported and will lead to an
                        unstable and unpredictable results. Default: "XMSYNC_"
                    </small>
                }
            />

            <Question
                question="What should happen if there are errors while adding or updating records in xMatters?"
                advanced={true}
                name="continueOnError"
                handleChange={handleChange}
                value={config.continueOnError}
                placeholder={'true'}
                help={
                    <small className="form-text text-muted">
                        The logging level applies to the console output and the sync log.
                    </small>
                }
                options={[
                    { name: 'continue processing other records', value: 'true' },
                    { name: 'stop the sync', value: 'false' },
                ]}
            />
        </div>
    );
};

export default App;
