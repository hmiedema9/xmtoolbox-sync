/**
 * ***  NO CUSTOMIZATIONS ***
 * Make all customization in config.json or config.js.
 * Sync customizations are not to be made to this file.
 * If functionality is not supported via config,
 * open an enhancement request.
 */
const xm = require('xmtoolbox');
const fs = require('fs');

let invalidData = []; //[{ type: 'device', identifier: 'jsmith:Work Phone', value:'+1 123456789' }];

async function RunSync(config, config_js) {
    const { preSync, postSync } = config_js;
    if (typeof preSync === 'function') await preSync(config);

    const {
        subdomain,
        username,
        password,
        proxy,
        proxyPort,
        proxyHost,
        dryRun,
        workflowEndpoint,
        continueOnError = true,
        onboarding,
        onboardingSubject = 'Welcome to xMatters',
        onboardingSignature = "You've been invited to join your team in xMatters. We've already created an account for you - just specify a password so you can get started.",
        onboardingCustomMessage = 'Welcome Aboard! The xMatters Team',
        //note: other properties accessed programmatically via bracket notation
    } = config;

    const logLevel = config.logLevel || 'info';
    const backup = config.backup === false ? config.backup : config.backup || '7d';
    const backupDirectory = config.backupDirectory || './backup';
    const logs = config.logs === false ? config.logs : config.logs || '7d';
    const logsDirectory = config.logsDirectory || './logs';

    let { descriptor = 'xmatters-sync', summaryRecipients } = config;

    if (Array.isArray(summaryRecipients)) summaryRecipients = summaryRecipients.join();

    //make backup and logs directory
    fs.mkdirSync(backupDirectory, { recursive: true });
    fs.mkdirSync(logsDirectory, { recursive: true });

    const startAt = new Date();
    const startAtString = startAt.toISOString().split('.')[0].replace(/:/g, '-');

    //log paths
    let logDateString = '';
    if (logs === '7d') logDateString = startAt.getDay();
    if (logs === 'all') logDateString = startAtString;

    const errorLogPath = logs
        ? `${logsDirectory}/${logDateString ? logDateString + '-' : ''}error_log.csv`
        : '';
    const syncLogPath = logs
        ? `${logsDirectory}/${logDateString ? logDateString + '-' : ''}sync_log.txt`
        : '';

    //clear old logs enabled and not all
    if (logs && logs !== 'all') fs.writeFileSync(syncLogPath, '');

    //backup paths
    let backupDateString = '';
    if (backup === '7d') backupDateString = startAt.getDay();
    if (backup === 'all') backupDateString = startAtString;

    const inputBackupPath = backup
        ? `${backupDirectory}/${backupDateString ? backupDateString + '-' : ''}input_backup.json`
        : '';
    const xmattersBackupPath = backup
        ? `${backupDirectory}/${backupDateString ? backupDateString + '-' : ''}${subdomain}_backup.json`
        : '';

    let _proxy = proxy ? { port: proxyPort, host: proxyHost } : undefined;

    const env = xm.environments.create(subdomain, username, password, {
        logLevel,
        readOnly: dryRun,
        logPath: syncLogPath,
        proxy: _proxy,
    });
    const syncOptions = {
        continueOnError,
        dataExtracted: (destinationData, destinationEnv, sourceData) => {
            if (backup) {
                fs.writeFileSync(inputBackupPath, JSON.stringify(sourceData));
                fs.writeFileSync(xmattersBackupPath, JSON.stringify(destinationData));
            }
        },
    };
    const data = {
        people: [],
        devices: [],
        groups: [],
        groupMembers: [],
        sites: [],
    };
    data.remove = {};

    invalidData = [];

    ProcessUsers(config, data, syncOptions, config_js);
    ProcessDevices(config, data, syncOptions, config_js);
    ProcessGroups(config, data, syncOptions, config_js);
    ProcessGroupMembers(config, data, syncOptions, config_js);
    ProcessSites(config, data, syncOptions, config_js);
    try {
        const results = await xm.sync.DataToxMatters(data, env, syncOptions);
        const { syncResults } = results;

        const durationMs = Math.abs(startAt - new Date());
        const durationS = Math.ceil(durationMs / 1000);

        let sync_errors = [];
        const tableRows = [];

        for (const key in syncResults) {
            if (Object.hasOwnProperty.call(syncResults, key)) {
                const syncResult = syncResults[key];
                const name = key === 'people' ? 'Users' : key.charAt(0).toUpperCase() + key.slice(1);
                tableRows.push(
                    '<tr>' +
                        [
                            `<b>${name}</b>`,
                            syncResult.created.length,
                            syncResult.updated.length,
                            syncResult.remove.length,
                            syncResult.synced.length,
                            syncResult.errors.length,
                        ]
                            .map(count => `<td>${count}</td>`)
                            .join('') +
                        '</tr>'
                );

                if (syncResult.errors) {
                    sync_errors = sync_errors.concat(
                        syncResults[key].errors.map(({ operation, error, object }) => ({
                            type: key,
                            operation,
                            error: error.message,
                            object: JSON.stringify(object),
                        }))
                    );
                }
            }
        }

        if (logs && sync_errors.length) {
            fs.writeFileSync(errorLogPath, xm.util.JsonToCsv(sync_errors));
        }

        const errorPreviews = 10;
        const errorsPreview = sync_errors
            .slice(0, errorPreviews - 1)
            .map(({ operation, error, object, type }) => error)
            .join('<br>');

        let summaryHtml = `<table><tr><th></th><th>Added</th><th>Updated</th><th>Deleted</th><th>Found</th><th>Errors</th></tr>${tableRows.join(
            ''
        )}</table>`;

        if (errorsPreview) summaryHtml += `<b>Errors:</b><p>${errorsPreview.substring(0, 19000)}</p>`;

        if (sync_errors.length > errorPreviews)
            summaryHtml += `<p>1-${errorPreviews} of ${sync_errors.length}</p>`;

        let result = syncResults.failure ? 'failed' : 'completed';
        if (sync_errors.length > 0) result += ' with errors';

        const xmSummary = {
            descriptor,
            errorCount: sync_errors.length,
            errorLogPath: logs ? (sync_errors.length ? errorLogPath : 'none') : 'disabled',
            eventType: 'summary',
            inputBackupPath: backup ? inputBackupPath : 'disabled',
            recipients: summaryRecipients,
            result,
            startAtString,
            summaryHtml,
            syncLogPath: logs ? syncLogPath : 'disabled',
            xmattersBackupPath: backup ? xmattersBackupPath : 'disabled',
        };

        if (typeof postSync === 'function') await postSync(results, data, config, xmSummary, env);

        if (workflowEndpoint) {
            await xm.util.post(env, workflowEndpoint, xmSummary);
        }

        if (
            onboarding &&
            workflowEndpoint &&
            syncResults &&
            syncResults.people &&
            syncResults.people.created &&
            syncResults.people.created.length > 0
        ) {
            let recipientSets = [''];
            let set = 0;
            for (let i = 0; i < syncResults.people.created.length; i++) {
                if (recipientSets[set].length === 0) {
                    recipientSets[set] = syncResults.people.created[i].targetName;
                } else if (
                    recipientSets[set].length + syncResults.people.created[i].targetName.length + 1 >=
                    20000
                ) {
                    set += 1;
                    recipientSets[set] = syncResults.people.created[i].targetName;
                } else {
                    recipientSets[set] += ',' + syncResults.people.created[i].targetName;
                }
            }

            for (let i = 0; i < recipientSets.length; i++) {
                const xmOnboaring = {
                    subject: onboardingSubject,
                    signature: onboardingSignature,
                    customMessage: onboardingCustomMessage,
                    hostname: `${subdomain}.xmatters.com`,
                    startAtString,
                    descriptor,
                    eventType: 'onboarding',
                    recipients: recipientSets[i],
                };
                await xm.util.post(env, workflowEndpoint, xmOnboaring);
            }
        }
    } catch (error) {
        console.error(error);

        if (workflowEndpoint) {
            const xmSummary = {
                descriptor,
                errorCount: 1,
                errorLogPath: logs ? errorLogPath : 'disabled',
                eventType: 'summary',
                inputBackupPath: backup ? inputBackupPath : 'disabled',
                recipients: summaryRecipients,
                result: 'failed',
                startAtString,
                summaryHtml: `<b>Errors:</b><p>${error.message.substring(0, 19000)}</p>`,
                syncLogPath: logs ? syncLogPath : 'disabled',
                xmattersBackupPath: backup ? xmattersBackupPath : 'disabled',
            };

            await xm.util.post(env, workflowEndpoint, xmSummary);
        }
    }
}

function ProcessUsers(config, data, syncOptions, config_js = {}) {
    const { userTransform } = config_js;
    const mirrorTag = config.mirrorTag || 'XMSYNC_';
    if (config.users && config.users.sync) {
        const {
            inputPath,
            mirrorMode,
            processInput,
            processDeleteValue,
            properties,
            rolesDefault,
            rolesDelimiter = '|',
            rolesInitial,
            rolesInput,
            supervisorsDefault,
            supervisorsDelimiter = '|',
            supervisorsInitial,
            supervisorsInput,
            siteCreate,
            include,
            //note: other properties accessed programmatically via bracket notation
        } = config.users;

        const keys = [
            'targetName',
            'firstName',
            'externallyOwned',
            'lastName',
            'language',
            'phoneLogin',
            'phonePin',
            'site',
            'status',
            'timezone',
            'webLogin',
            'licenseType'
        ];

        //set xmtoolbox syncOptions
        syncOptions.people = true;

        const fields = [];

        keys.map(key => {
            if (
                config.users[key + 'Input'] ||
                config.users[key + 'Default'] ||
                config.users[key + 'Default'] === false
            )
                fields.push(key);
        });

        if (mirrorMode) fields.push('externalKey');
        if (properties && properties.length > 0) fields.push('properties');
        if (supervisorsInput || supervisorsDefault) fields.push('supervisors');
        if (rolesInput || rolesDefault) fields.push('roles');

        const embedList = [];
        if (rolesInput || rolesDefault) embedList.push('roles');
        if (supervisorsInput || supervisorsDefault) embedList.push('supervisors');
        const embed = embedList.join(',');
        syncOptions.peopleQuery = { embed };

        syncOptions.peopleOptions = {
            fields,
            mirror: mirrorMode,
            siteCreate,
        };

        syncOptions.peopleTransform = (person, sourceData, destinationData) => {
            if (typeof userTransform === 'function')
                person = userTransform(person, sourceData, destinationData);

            //do not refactor to common function. much slower
            if (mirrorMode === 'greedy') {
                const match = destinationData.people.find(
                    ({ targetName }) => targetName === person.targetName
                );
                if (match) match.inSource = true;
                person.inSource = true;
            }

            return person;
        };

        if (mirrorMode) {
            syncOptions.peopleFilter = ({ externalKey, inSource }) => {
                if (inSource) return true;
                //filter for ones that have the prefix, exclude all others
                return externalKey && externalKey.startsWith(mirrorTag);
            };
        }

        const json = GetJsonFromFile(inputPath);

        json.map(record => {
            //start to build person object
            const person = {
                initial: {},
            };

            InputInitialDefaultMap(person, record, config.users, keys);

            //supports an array or delimited string for roles
            if (rolesInput || rolesDefault) {
                const roles = record[rolesInput] || rolesDefault;
                if (roles) {
                    if (Array.isArray(roles)) {
                        person.roles = roles;
                    } else {
                        person.roles = roles.split(rolesDelimiter).map(r => r.trim());
                    }
                }
            }

            if (rolesInitial) {
                if (Array.isArray(rolesInitial)) {
                    person.initial.roles = rolesInitial;
                } else {
                    person.initial.roles = rolesInitial.split(rolesDelimiter).map(r => r.trim());
                }
            }

            if (supervisorsInput || supervisorsDefault) {
                const supervisors = record[supervisorsInput] || supervisorsDefault;
                if (supervisors) {
                    if (Array.isArray(supervisors)) {
                        person.supervisors = supervisors;
                    } else {
                        person.supervisors = supervisors.split(supervisorsDelimiter).map(r => r.trim());
                    }
                }
            }

            if (supervisorsInitial) {
                if (Array.isArray(supervisorsInitial)) {
                    person.initial.supervisors = supervisorsInitial;
                } else {
                    person.initial.supervisors = supervisorsInitial
                        .split(supervisorsDelimiter)
                        .map(r => r.trim());
                }
            }

            if (properties && properties.length > 0) {
                person.properties = {};
                properties.forEach(({ input, name: _name, default: _default, delimiter }) => {
                    const name = _name || input; //use an xMatters specific name or default to the column name.
                    const value = record[input] || _default;
                    person.properties[name] = value && delimiter ? value.split(delimiter) : value;
                });
            }

            if (mirrorMode) {
                person.externalKey = mirrorTag + person.targetName;
            }

            //non-mirror mode record removal
            if (!mirrorMode && record[processInput] && record[processInput] === processDeleteValue) {
                if (!data.remove.people) data.remove.people = [];
                data.remove.people.push(person);
                return;
            }

            if (Array.isArray(include)) {
                include.map(key => {
                    person[key] = record[key];
                });
            } else if (include) {
                person[include] = record[include];
            }

            //add person to data to sync
            data.people.push(person);
        });

        if (siteCreate && config.sites && config.sites.sync) {
            throw new Error(
                'The options sites.sync and user.siteCreate are enabled. Only one source for sites is allowed. Disable one of the options.'
            );
        }

        ObjectRules(config, data, 'people', 'users');
    }
}

function ProcessDevices(config, data, syncOptions, config_js = {}) {
    const { deviceTransform } = config_js;
    const mirrorTag = config.mirrorTag || 'XMSYNC_';
    if (config.devices && config.devices.sync) {
        //note: other properties accessed programmatically via bracket notation
        const {
            inputPath,
            mirrorMode,
            processInput,
            processDeleteValue,
            ownerInput,
            validate,
            include,
            sequenceSync,
        } = config.devices;

        const keys = ['delay', 'sequence', 'priorityThreshold', 'externallyOwned'];
        //set xmtoolbox syncOptions
        syncOptions.devices = true;

        const fields = ['owner', 'targetName', 'name', 'deviceType', 'emailAddress', 'phoneNumber'];

        keys.map(key => {
            if (config.devices[key + 'Sync']) fields.push(key);
        });

        if (mirrorMode) fields.push('externalKey');

        syncOptions.devicesOptions = {
            fields,
            mirror: mirrorMode,
        };

        syncOptions.devicesTransform = (device, sourceData, destinationData) => {
            if (typeof deviceTransform === 'function')
                device = deviceTransform(device, sourceData, destinationData);

            //do not refactor to common function - much slower
            if (mirrorMode === 'greedy') {
                const match = destinationData.devices.find(
                    ({ targetName }) => targetName === device.targetName
                );
                if (match) match.inSource = true;
                device.inSource = true;
            }

            return device;
        };

        if (mirrorMode) {
            syncOptions.devicesFilter = ({ externalKey, inSource }) => {
                //filter for ones that have the prefix, exclude all others
                if (inSource) return true;
                return externalKey && externalKey.startsWith(mirrorTag);
            };
        }

        const json = GetJsonFromFile(inputPath);

        json.map(record => {
            //for each configured device in the record
            const owner = record[ownerInput];
            let recordDevices = [];

            if (config.devices.devices && Array.isArray(config.devices.devices)) {
                config.devices.devices.forEach(deviceConfig => {
                    const { input, name: _name } = deviceConfig;

                    if (!record[input]) return;

                    const deviceType = deviceConfig.deviceType
                        ? deviceConfig.deviceType.toUpperCase()
                        : 'EMAIL';

                    //use custom name or column name
                    const name = _name || input;

                    //start to build device object
                    const device = {
                        owner,
                        targetName: owner + '|' + name,
                        name,
                        deviceType,
                        initial: {},
                    };

                    if (deviceType === 'EMAIL') {
                        device.emailAddress = record[input];
                    } else {
                        device.phoneNumber = record[input];
                    }

                    keys.map(key => {
                        //for each device key, check if the sync is enabled and input is configured.
                        //if so, set the value from the input source or use the initial.
                        if (
                            (config.devices[key + 'Sync'] && deviceConfig[key + 'Input']) ||
                            deviceConfig[key + 'Default']
                        ) {
                            //ex equivalent: device.delay = record[deviceConfig.delayInput] || deviceConfig.delayDefault
                            device[key] =
                                record[deviceConfig[key + 'Input']] || deviceConfig[key + 'Default'];
                        }

                        if (deviceConfig.hasOwnProperty([key + 'Initial'])) {
                            //ex equivalent: device.delay = deviceConfig.delay
                            device.initial[key] = deviceConfig[key + 'Initial'];
                        }
                    });

                    if (mirrorMode) {
                        device.externalKey = mirrorTag + device.targetName;
                    }

                    //non-mirror mode record removal
                    if (!mirrorMode && record[processInput] && record[processInput] === processDeleteValue) {
                        if (!data.remove.devices) data.remove.devices = [];
                        data.remove.devices.push(device);
                        return;
                    }

                    if (Array.isArray(include)) {
                        include.map(key => {
                            device[key] = record[key];
                        });
                    } else if (include) {
                        device[include] = record[include];
                    }

                    //add device to data to sync
                    recordDevices.push(device);
                });
            }

            if (sequenceSync) {
                //eliminate any gaps in sequence by sorting by assigned sequence and using index.
                recordDevices = recordDevices
                    .sort((a, b) => (a.sequence > b.sequence ? 1 : -1))
                    .map((d, i) => ({ ...d, sequence: i + 1 }));
            }

            data.devices.push(...recordDevices);
        });

        if (validate == true) {
            // filter ones not meeting standards specified by xMatters.
            const phoneRegex = /^\+\d{1,3}\s\d{1,14}(\s\d{1,13})?/;
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            data.devices.map(({ phoneNumber, emailAddress, targetName }) => {
                if (phoneNumber && !phoneRegex.test(phoneNumber)) {
                    PushInvalidData('device', targetName, phoneNumber);
                }

                if (emailAddress && !emailRegex.test(emailAddress)) {
                    PushInvalidData('device', targetName, emailAddress);
                }
            });
        }

        //write reports

        if (invalidData.length) {
            const csv = xm.util.JsonToCsv(invalidData);
            fs.writeFileSync(`${logsDirectory}/${startAtString}-invalid_data.csv`, csv);
        }

        ObjectRules(config, data, 'devices');
    }
}

function ProcessGroups(config, data, syncOptions, config_js = {}) {
    const { groupTransform } = config_js;
    const mirrorTag = config.mirrorTag || 'XMSYNC_';
    if (config.groups && config.groups.sync) {
        //note: other properties accessed programmatically via bracket notation
        const {
            inputPath,
            mirrorMode,
            processInput,
            processDeleteValue,
            include,
            supervisorsDefault,
            supervisorsDelimiter = '|',
            supervisorsInitial,
            supervisorsInput,
            observersDefault,
            observersDelimiter = '|',
            observersInitial,
            observersInput,
        } = config.groups;

        const keys = [
            'targetName',
            'description',
            'allowDuplicates',
            'useDefaultDevices',
            'observedByAll',
            'externallyOwned',
            'status',
            'site',
        ];

        //set xmtoolbox syncOptions
        syncOptions.groups = true;

        const fields = [];

        keys.map(key => {
            if (
                config.groups[key + 'Input'] ||
                config.groups[key + 'Default'] ||
                config.groups[key + 'Default'] === false
            )
                fields.push(key);
        });

        if (mirrorMode) fields.push('externalKey');

        const embedList = [];

        if (supervisorsInput || supervisorsDefault) {
            embedList.push('supervisors');
            fields.push('supervisors');
        }
        if (observersInput || observersDefault) {
            fields.push('observers');
            embedList.push('observers');
        }
        const embed = embedList.join(',');
        syncOptions.groupsQuery = { embed };

        syncOptions.groupsOptions = {
            fields,
            mirror: mirrorMode,
        };

        syncOptions.groupsTransform = (group, sourceData, destinationData) => {
            if (typeof groupTransform === 'function')
                group = groupTransform(group, sourceData, destinationData);

            //do not refactor to common function - much slower
            if (mirrorMode === 'greedy') {
                const match = destinationData.groups.find(
                    ({ targetName }) => targetName === group.targetName
                );
                if (match) match.inSource = true;
                group.inSource = true;
            }

            return group;
        };

        if (mirrorMode) {
            syncOptions.groupsFilter = ({ externalKey, inSource }) => {
                //filter for ones that have the prefix, exclude all others
                if (inSource) return true;
                return externalKey && externalKey.startsWith(mirrorTag);
            };
        }

        const json = GetJsonFromFile(inputPath);

        json.map(record => {
            //start to build group object
            const group = { initial: {} };

            if (supervisorsInput || supervisorsDefault) {
                const supervisors = record[supervisorsInput] || supervisorsDefault;
                if (supervisors) {
                    if (Array.isArray(supervisors)) {
                        group.supervisors = supervisors;
                    } else {
                        group.supervisors = supervisors.split(supervisorsDelimiter).map(r => r.trim());
                    }
                }
            }

            if (supervisorsInitial) {
                if (Array.isArray(supervisorsInitial)) {
                    group.initial.supervisors = supervisorsInitial;
                } else {
                    group.initial.supervisors = supervisorsInitial
                        .split(supervisorsDelimiter)
                        .map(r => r.trim());
                }
            }

            if (observersInput || observersDefault) {
                const observers = record[observersInput] || observersDefault;
                if (observers) {
                    if (Array.isArray(observers)) {
                        group.observers = observers;
                    } else {
                        group.observers = observers.split(observersDelimiter).map(r => r.trim());
                    }
                }
            }

            if (observersInitial) {
                if (Array.isArray(observersInitial)) {
                    group.initial.observers = observersInitial;
                } else {
                    group.initial.observers = observersInitial.split(observersDelimiter).map(r => r.trim());
                }
            }

            InputInitialDefaultMap(group, record, config.groups, keys);

            if (mirrorMode) {
                group.externalKey = mirrorTag + group.targetName;
            }

            //non-mirror mode record removal
            if (!mirrorMode && record[processInput] && record[processInput] === processDeleteValue) {
                if (!data.groups.people) data.remove.groups = [];
                data.remove.groups.push(group);
                return;
            }

            if (Array.isArray(include)) {
                include.map(key => {
                    group[key] = record[key];
                });
            } else if (include) {
                group[include] = record[include];
            }

            //add group to data to sync
            data.groups.push(group);
        });

        ObjectRules(config, data, 'groups');
    }
}

function ProcessGroupMembers(config, data, syncOptions, config_js = {}) {
    const { groupMemberTransform } = config_js;
    if (config.groupMembers && config.groupMembers.sync) {
        const {
            inputPath,
            mirrorMode,
            processInput,
            processDeleteValue,
            groupInput,
            groupDefault,
            membersInput,
            membersDelimiter = '|',
            include,
        } = config.groupMembers;

        //sync fields
        syncOptions.groupMembers = true;
        const fields = ['id', 'group'];

        syncOptions.groupMembersOptions = {
            fields,
            mirror: mirrorMode,
        };

        syncOptions.groupMembersTransform = (groupMember, sourceData, destinationData) => {
            if (typeof groupMemberTransform === 'function')
                groupMember = groupMemberTransform(groupMember, sourceData, destinationData);

            return groupMember;
        };

        if (mirrorMode) {
            syncOptions.groupMembersFilter = ({ group }) => {
                //groupMembers lack externalKey. To support mirrorMode, groupMembers depends on groups synced with groupMembers.
                //In mirror mode, only look at groupMembers where group is included in sync.

                return (
                    data.groups &&
                    data.groups.some(({ targetName }) => targetName === (group.targetName || group))
                );
            };
        }

        //get group data and map to correct fields for each group
        const json = GetJsonFromFile(inputPath);

        json.map(record => {
            //start to build group object
            if (!record[membersInput]) return;

            let ids = [];

            if (Array.isArray(record[membersInput])) {
                ids = record[membersInput];
            } else {
                ids = record[membersInput].split(membersDelimiter);
            }

            ids.forEach(id => {
                const groupMember = {
                    group: record[groupInput] || groupDefault,
                    id: id.trim(),
                };

                //non-mirror mode record removal
                if (!mirrorMode && record[processInput] && record[processInput] === processDeleteValue) {
                    if (!data.remove.groupMembers) data.remove.groupMembers = [];
                    data.remove.groupMembers.push(groupMember);
                    return;
                }

                if (Array.isArray(include)) {
                    include.map(key => {
                        groupMember[key] = record[key];
                    });
                } else if (include) {
                    groupMember[include] = record[include];
                }

                //add group member to data to sync
                data.groupMembers.push(groupMember);
            });
        });

        ObjectRules(config, data, 'groupMembers');
    }
}

function ProcessSites(config, data, syncOptions, config_js = {}) {
    const { siteTransform } = config_js;
    const mirrorTag = config.mirrorTag || 'XMSYNC_';
    if (config.sites && config.sites.sync) {
        const { inputPath, mirrorMode, processInput, processDeleteValue, include } = config.sites;

        const keys = [
            'name',
            'address1',
            'address2',
            'city',
            'country',
            'externallyOwned',
            'language',
            'latitude',
            'longitude',
            'postalCode',
            'state',
            'status',
            'timezone',
        ];

        //set xmtoolbox syncOptions
        syncOptions.sites = true;

        const fields = [];

        keys.map(key => {
            if (
                config.sites[key + 'Input'] ||
                config.sites[key + 'Default'] ||
                config.sites[key + 'Default'] === false
            )
                fields.push(key);
        });

        if (mirrorMode) fields.push('externalKey');

        syncOptions.sitesOptions = {
            fields,
            mirror: mirrorMode,
        };

        syncOptions.sitesTransform = (site, sourceData, destinationData) => {
            if (typeof siteTransform === 'function') site = siteTransform(site, sourceData, destinationData);

            //do not refactor to common function - much slower
            if (mirrorMode === 'greedy') {
                const match = destinationData.sites.find(({ name }) => name === site.name);
                if (match) match.inSource = true;
                site.inSource = true;
            }

            return site;
        };

        if (mirrorMode) {
            syncOptions.sitesFilter = ({ externalKey, inSource }) => {
                //filter for ones that have the prefix, exclude all others
                if (inSource) return true;
                return externalKey && externalKey.startsWith(mirrorTag);
            };
        }

        const json = GetJsonFromFile(inputPath);

        //get sites from input and map to correct fields for each
        json.map(record => {
            //start to build site object
            const site = { initial: {} };

            InputInitialDefaultMap(site, record, config.sites, keys);

            if (mirrorMode) {
                site.externalKey = mirrorTag + site.name;
            }

            //non-mirror mode record removal
            if (!mirrorMode && record[processInput] && record[processInput] === processDeleteValue) {
                if (!data.remove.sites) data.remove.sites = [];
                data.remove.sites.push(site);
                return;
            }

            if (Array.isArray(include)) {
                include.map(key => {
                    site[key] = record[key];
                });
            } else if (include) {
                site[include] = record[include];
            }

            //add site to data to sync
            data.sites.push(site);
        });

        ObjectRules(config, data, 'sites');
    }
}

function InputInitialDefaultMap(object, inputObject, config, keys) {
    if (typeof keys === 'string') keys = [keys];
    keys.map(key => {
        //for each object key, check if the sync is enabled and input is configured.
        //if so, set the value from the input source or use the initial.
        if (config[key + 'Input'] || config[key + 'Default'] || config[key + 'Default'] === false) {
            //ex equivalent: object.firstName = inputObject[config.firstNameInput] || config.firstNameDefault
            object[key] = inputObject[config[key + 'Input']] || config[key + 'Default'];
        }

        if (config[key + 'Initial'] || config[key + 'Initial'] === false) {
            //ex equivalent: object.firstName = config.firstName
            object.initial[key] = config[key + 'Initial'];
        }
    });
}

function PushInvalidData(type, identifier, value) {
    invalidData.push({ type, identifier, value });
}

/** supports CSV and JSON files */
function GetJsonFromFile(path, delimiter = ',') {
    const text = fs.readFileSync(path, 'utf8');
    if (path.toLowerCase().endsWith('.json')) {
        return JSON.parse(text);
    } else if (path.toLowerCase().endsWith('.csv')) {
        return xm.util.CsvToJsonFromData(text, { delimiter });
    } else {
        throw Error(`File format not supported: ${path}`);
    }
}

function ObjectRules(config, data, name, description) {
    const syncName = description || name;
    const { minimum, maximum, maxDelete, mirrorMode } = config[syncName];

    if (mirrorMode) {
        if (minimum && data[name].length < minimum) {
            throw Error(
                `The ${syncName} input file contains ${data[name].length}. The configured minimum is ${minimum}`
            );
        }

        if (maximum && data[name].length > maximum) {
            throw Error(
                `The ${syncName} input file contains ${data[name].length}. The configured maximum is ${maximum}`
            );
        }
    } else {
        if (maxDelete && data[name].length > maxDelete) {
            throw Error(
                `The ${syncName} input file will remove ${data.remove[name].length}. The configured maximum is ${maxDelete}`
            );
        }
    }
}

module.exports = { RunSync, ProcessUsers, ProcessDevices, ProcessGroups, ProcessGroupMembers, ProcessSites };
