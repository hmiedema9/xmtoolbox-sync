var assert = require('assert');
var fs = require('fs').promises;

const {
    ProcessDevices,
    ProcessUsers,
    ProcessGroups,
    ProcessGroupMembers,
    ProcessSites,
} = require('../bin/lib');
const temp = './temp';

function getRandomString(length = 10) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function getFilePath(fileExtension) {
    return temp + '/' + getRandomString() + '.' + fileExtension;
}

describe('unit tests', () => {
    before(async () => {
        // runs once before the first test in this block
        //create temp directory
        await fs.mkdir(temp, { recursive: true });
    });

    after(async () => {
        // runs once before the first test in this block
        //create temp directory
        await fs.rmdir(temp, { recursive: true });
    });

    describe('groups', () => {
        describe('inputPath', () => {
            it('inputPath is used when inputPath is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, targetNameInput: 'Group' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.groups, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorTag', () => {
            it('default mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, targetNameInput: 'Group', mirrorMode: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.groups, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    groups: { sync: true, inputPath: filePath, targetNameInput: 'Group', mirrorMode: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.groups, [
                    {
                        externalKey: 'Abc123Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.groups, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.groups, [
                    {
                        externalKey: 'Abc123Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        mirrorMode: false,
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.groups, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        mirrorMode: false,
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.groups, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('allowDuplicates', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, allowDuplicatesInput: 'Allow Duplicates' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].allowDuplicates, 'string');
                assert.strictEqual(data.groups[0].allowDuplicates, 'true');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, undefined);
            });

            it('default is used when default is set (true)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesDefault: 'true',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].allowDuplicates, 'string');
                assert.strictEqual(data.groups[0].allowDuplicates, 'true');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, undefined);
            });

            it('default is used when default is set (false)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesDefault: false,
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.deepStrictEqual(syncOptions.groupsOptions.fields, ['allowDuplicates']);
                assert.deepStrictEqual(data.groups, [
                    {
                        allowDuplicates: false,
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, allowDuplicatesInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].allowDuplicates, undefined);
                assert.strictEqual(typeof data.groups[0].initial.allowDuplicates, 'boolean');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesInput: 'Allow Duplicates',
                        allowDuplicatesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].allowDuplicates, 'true');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesInput: 'Allow Duplicates',
                        allowDuplicatesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].allowDuplicates, '_default');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, undefined);
            });

            it('default is used when input and default are set, allowDuplicates input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesInput: 'allowDuplicates',
                        allowDuplicatesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].allowDuplicates, '_default');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Allow Duplicates\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        allowDuplicatesInput: 'Allow Duplicates',
                        allowDuplicatesDefault: '_default',
                        allowDuplicatesInitial: 'false',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'allowDuplicates');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].allowDuplicates, 'true');
                assert.strictEqual(data.groups[0].initial.allowDuplicates, 'false');
            });
        });

        describe('description', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Description\nTest1,A Group Description.';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, descriptionInput: 'Description' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].description, 'string');
                assert.strictEqual(data.groups[0].description, 'A Group Description.');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Description\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionDefault: 'A Group Description.',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].description, 'string');
                assert.strictEqual(data.groups[0].description, 'A Group Description.');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, descriptionInitial: 'A Group Description.' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].description, undefined);
                assert.strictEqual(typeof data.groups[0].initial.description, 'string');
                assert.strictEqual(data.groups[0].initial.description, 'A Group Description.');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Description\nTest1,A Group Description.';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionInput: 'Description',
                        descriptionDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].description, 'A Group Description.');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Description\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionInput: 'Description',
                        descriptionDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].description, '_default');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('default is used when input and default are set, description input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionInput: 'description',
                        descriptionDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].description, '_default');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Description\nTest1,A Group Description.';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionInput: 'Description',
                        descriptionDefault: '_default',
                        descriptionInitial: 'Initial-Name',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'description');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].description, 'A Group Description.');
                assert.strictEqual(data.groups[0].initial.description, 'Initial-Name');
            });
        });

        describe('externalKey', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, externalKeyInput: 'ExternalKey' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyDefault: 'My-ExternalKey',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, externalKeyInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, externalKey input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'externalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                        externalKeyInitial: 'Initial-Key',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externalKey, undefined);
                assert.strictEqual(data.groups[0].initial.externalKey, undefined);
            });
        });

        describe('externallyOwned', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, externallyOwnedInput: 'ExternallyOwned' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].externallyOwned, 'string');
                assert.strictEqual(data.groups[0].externallyOwned, 'true');
                assert.strictEqual(data.groups[0].initial.externallyOwned, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedDefault: 'true',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].externallyOwned, 'string');
                assert.strictEqual(data.groups[0].externallyOwned, 'true');
                assert.strictEqual(data.groups[0].initial.externallyOwned, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, externallyOwnedInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].externallyOwned, undefined);
                assert.strictEqual(typeof data.groups[0].initial.externallyOwned, 'boolean');
                assert.strictEqual(data.groups[0].initial.externallyOwned, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].externallyOwned, 'true');
                assert.strictEqual(data.groups[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].externallyOwned, '_default');
                assert.strictEqual(data.groups[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, externallyOwned input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'externallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].externallyOwned, '_default');
                assert.strictEqual(data.groups[0].initial.externallyOwned, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                        externallyOwnedInitial: 'false',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].externallyOwned, 'true');
                assert.strictEqual(data.groups[0].initial.externallyOwned, 'false');
            });
        });

        describe('id', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, idInput: 'ID' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        idDefault: 'My-ID',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, idInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, id input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'id',
                        idDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                        idInitial: 'Initial-ID',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].id, undefined);
                assert.strictEqual(data.groups[0].initial.id, undefined);
            });
        });

        describe('observedByAll', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observed By All\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, observedByAllInput: 'Observed By All' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].observedByAll, 'string');
                assert.strictEqual(data.groups[0].observedByAll, 'true');
                assert.strictEqual(data.groups[0].initial.observedByAll, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observed By All\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observedByAllDefault: 'true',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].observedByAll, 'string');
                assert.strictEqual(data.groups[0].observedByAll, 'true');
                assert.strictEqual(data.groups[0].initial.observedByAll, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, observedByAllInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].observedByAll, undefined);
                assert.strictEqual(typeof data.groups[0].initial.observedByAll, 'boolean');
                assert.strictEqual(data.groups[0].initial.observedByAll, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observed By All\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observedByAllInput: 'Observed By All',
                        observedByAllDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observedByAll, 'true');
                assert.strictEqual(data.groups[0].initial.observedByAll, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observed By All\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observedByAllInput: 'Observed By All',
                        observedByAllDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observedByAll, '_default');
                assert.strictEqual(data.groups[0].initial.observedByAll, undefined);
            });

            it('default is used when input and default are set, observedByAll input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observedByAllInput: 'observedByAll',
                        observedByAllDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observedByAll, '_default');
                assert.strictEqual(data.groups[0].initial.observedByAll, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observed By All\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observedByAllInput: 'Observed By All',
                        observedByAllDefault: '_default',
                        observedByAllInitial: 'false',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observedByAll');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observedByAll, 'true');
                assert.strictEqual(data.groups[0].initial.observedByAll, 'false');
            });
        });

        describe('observers', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, observersInput: 'Observers' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 2);
                assert.strictEqual(data.groups[0].observers[0], 'Role2');
                assert.strictEqual(data.groups[0].observers[1], 'Role3');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('default is used when default[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersDefault: 'Role2|Role3',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 2);
                assert.strictEqual(data.groups[0].observers[0], 'Role2');
                assert.strictEqual(data.groups[0].observers[1], 'Role3');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('default is used when default[array] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersDefault: ['Role2', 'Role3'],
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 2);
                assert.strictEqual(data.groups[0].observers[0], 'Role2');
                assert.strictEqual(data.groups[0].observers[1], 'Role3');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, observersInitial: 'Role2|Role3' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].initial.observers.length, 2);
                assert.strictEqual(data.groups[0].initial.observers[0], 'Role2');
                assert.strictEqual(data.groups[0].initial.observers[1], 'Role3');
                assert.strictEqual(data.groups[0].observers, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, observersInitial: ['Role2', 'Role3'] },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].initial.observers.length, 2);
                assert.strictEqual(data.groups[0].initial.observers[0], 'Role2');
                assert.strictEqual(data.groups[0].initial.observers[1], 'Role3');
                assert.strictEqual(data.groups[0].observers, undefined);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersInput: 'Observers',
                        observersDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 2);
                assert.strictEqual(data.groups[0].observers[0], 'Role2');
                assert.strictEqual(data.groups[0].observers[1], 'Role3');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersInput: 'Observers',
                        observersDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 1);
                assert.strictEqual(data.groups[0].observers[0], 'DefaultSup');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('default is used when input and default are set, observers input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersInput: 'Observers',
                        observersDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 1);
                assert.strictEqual(data.groups[0].observers[0], 'DefaultSup');
                assert.strictEqual(data.groups[0].initial.observers, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Observers\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        observersInput: 'Observers',
                        observersDefault: 'DefaultSup',
                        observersInitial: 'Role4|Role5',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'observers');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].observers.length, 2);
                assert.strictEqual(data.groups[0].observers[0], 'Role2');
                assert.strictEqual(data.groups[0].observers[1], 'Role3');
                assert.strictEqual(data.groups[0].initial.observers.length, 2);
                assert.strictEqual(data.groups[0].initial.observers[0], 'Role4');
                assert.strictEqual(data.groups[0].initial.observers[1], 'Role5');
            });
        });

        describe('recipientType', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, recipientTypeInput: 'RecipientType' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,RecipientType\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeDefault: 'My-RecipientType',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, recipientTypeInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,RecipientType\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('default is not used when input and default are set, recipientType input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'recipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                        recipientTypeInitial: 'Initial-RT',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].recipientType, undefined);
                assert.strictEqual(data.groups[0].initial.recipientType, undefined);
            });
        });

        describe('site', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, siteInput: 'Site' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].site, 'string');
                assert.strictEqual(data.groups[0].site, 'Default Site');
                assert.strictEqual(data.groups[0].initial.site, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Site\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        siteDefault: 'Default Site',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].site, 'string');
                assert.strictEqual(data.groups[0].site, 'Default Site');
                assert.strictEqual(data.groups[0].initial.site, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, siteInitial: 'Initial Site' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].site, undefined);
                assert.strictEqual(typeof data.groups[0].initial.site, 'string');
                assert.strictEqual(data.groups[0].initial.site, 'Initial Site');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].site, 'Default Site');
                assert.strictEqual(data.groups[0].initial.site, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Site\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].site, '_default');
                assert.strictEqual(data.groups[0].initial.site, undefined);
            });

            it('default is used when input and default are set, site input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'site',
                        siteDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].site, '_default');
                assert.strictEqual(data.groups[0].initial.site, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                        siteInitial: 'San Ramon',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].site, 'Default Site');
                assert.strictEqual(data.groups[0].initial.site, 'San Ramon');
            });
        });

        describe('status', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, statusInput: 'Status' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].status, 'string');
                assert.strictEqual(data.groups[0].status, 'ACTIVE');
                assert.strictEqual(data.groups[0].initial.status, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        statusDefault: 'ACTIVE',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].status, 'string');
                assert.strictEqual(data.groups[0].status, 'ACTIVE');
                assert.strictEqual(data.groups[0].initial.status, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, statusInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].status, undefined);
                assert.strictEqual(typeof data.groups[0].initial.status, 'boolean');
                assert.strictEqual(data.groups[0].initial.status, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].status, 'ACTIVE');
                assert.strictEqual(data.groups[0].initial.status, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].status, '_default');
                assert.strictEqual(data.groups[0].initial.status, undefined);
            });

            it('default is used when input and default are set, status input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'status',
                        statusDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].status, '_default');
                assert.strictEqual(data.groups[0].initial.status, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                        statusInitial: 'INACTIVE',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].status, 'ACTIVE');
                assert.strictEqual(data.groups[0].initial.status, 'INACTIVE');
            });
        });

        describe('supervisors', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, supervisorsInput: 'Sups' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 2);
                assert.strictEqual(data.groups[0].supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('default is used when default[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsDefault: 'Test2|Test3',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 2);
                assert.strictEqual(data.groups[0].supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('default is used when default[array] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsDefault: ['Test2', 'Test3'],
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 2);
                assert.strictEqual(data.groups[0].supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, supervisorsInitial: 'Test2|Test3' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed, '');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].initial.supervisors.length, 2);
                assert.strictEqual(data.groups[0].initial.supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].initial.supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].supervisors, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, supervisorsInitial: ['Test2', 'Test3'] },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed, '');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].initial.supervisors.length, 2);
                assert.strictEqual(data.groups[0].initial.supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].initial.supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].supervisors, undefined);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 2);
                assert.strictEqual(data.groups[0].supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 1);
                assert.strictEqual(data.groups[0].supervisors[0], 'DefaultSup');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('default is used when input and default are set, supervisors input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 1);
                assert.strictEqual(data.groups[0].supervisors[0], 'DefaultSup');
                assert.strictEqual(data.groups[0].initial.supervisors, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                        supervisorsInitial: 'Test4|Test5',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.groupsQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].supervisors.length, 2);
                assert.strictEqual(data.groups[0].supervisors[0], 'Test2');
                assert.strictEqual(data.groups[0].supervisors[1], 'Test3');
                assert.strictEqual(data.groups[0].initial.supervisors.length, 2);
                assert.strictEqual(data.groups[0].initial.supervisors[0], 'Test4');
                assert.strictEqual(data.groups[0].initial.supervisors[1], 'Test5');
            });
        });

        describe('targetName', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, targetNameInput: 'Group' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, 'Test1');
                assert.strictEqual(data.groups[0].initial.targetName, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameDefault: 'Test1',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, 'Test1');
                assert.strictEqual(data.groups[0].initial.targetName, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, targetNameInitial: 'Test_1' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].targetName, undefined);
                assert.strictEqual(data.groups[0].initial.targetName, 'Test_1');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        targetNameDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, 'Test1');
                assert.strictEqual(data.groups[0].initial.targetName, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        targetNameDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, '_default');
                assert.strictEqual(data.groups[0].initial.targetName, undefined);
            });

            it('default is used when input and default are set, targetName input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\n';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        targetNameDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, '_default');
                assert.strictEqual(data.groups[0].initial.targetName, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'Group',
                        targetNameDefault: '_default',
                        targetNameInitial: 'Test_1',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].targetName, 'Test1');
                assert.strictEqual(data.groups[0].initial.targetName, 'Test_1');
            });
        });

        describe('useDefaultDevices', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Use Default Devices\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesInput: 'Use Default Devices',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].useDefaultDevices, 'string');
                assert.strictEqual(data.groups[0].useDefaultDevices, 'true');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Use Default Devices\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesDefault: 'true',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].useDefaultDevices, 'string');
                assert.strictEqual(data.groups[0].useDefaultDevices, 'true');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, useDefaultDevicesInitial: true },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(data.groups[0].useDefaultDevices, undefined);
                assert.strictEqual(typeof data.groups[0].initial.useDefaultDevices, 'boolean');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Use Default Devices\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesInput: 'Use Default Devices',
                        useDefaultDevicesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].useDefaultDevices, 'true');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Use Default Devices\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesInput: 'Use Default Devices',
                        useDefaultDevicesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].useDefaultDevices, '_default');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, undefined);
            });

            it('default is used when input and default are set, useDefaultDevices input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesInput: 'useDefaultDevices',
                        useDefaultDevicesDefault: '_default',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].useDefaultDevices, '_default');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Use Default Devices\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        useDefaultDevicesInput: 'Use Default Devices',
                        useDefaultDevicesDefault: '_default',
                        useDefaultDevicesInitial: 'false',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields[0], 'useDefaultDevices');
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(data.groups[0].useDefaultDevices, 'true');
                assert.strictEqual(data.groups[0].initial.useDefaultDevices, 'false');
            });
        });

        describe('include', () => {
            it('input is used when include is set as string', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, include: 'Custom' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(typeof data.groups[0].Custom, 'string');
                assert.strictEqual(data.groups[0].Custom, 'Yellow');
                assert.strictEqual(data.groups[0].initial.Custom, undefined);
                assert.strictEqual(data.groups[0].custom, undefined);
            });

            it('input is used when include is set as array', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, include: ['Custom'] },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(typeof data.groups[0].Custom, 'string');
                assert.strictEqual(data.groups[0].Custom, 'Yellow');
                assert.strictEqual(data.groups[0].initial.Custom, undefined);
                assert.strictEqual(data.groups[0].custom, undefined);
            });

            it('input is used when include is set with multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom,Custom2\nTest1,Yellow,Red';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, include: ['Custom', 'Custom2'] },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(typeof data.groups[0].Custom, 'string');
                assert.strictEqual(data.groups[0].Custom, 'Yellow');
                assert.strictEqual(data.groups[0].Custom2, 'Red');
                assert.strictEqual(data.groups[0].initial.Custom, undefined);
                assert.strictEqual(data.groups[0].initial.Custom2, undefined);
                assert.strictEqual(data.groups[0].custom, undefined);
                assert.strictEqual(data.groups[0].custom2, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict not synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,description\nTest1,John';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: { sync: true, inputPath: filePath, include: 'description' },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 0);
                assert.strictEqual(typeof data.groups[0].description, 'string');
                assert.strictEqual(data.groups[0].description, 'John');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,description\nTest1,John';
                await fs.writeFile(filePath, text);
                const config = {
                    groups: {
                        sync: true,
                        inputPath: filePath,
                        descriptionInput: 'description',
                        include: 'description',
                    },
                };
                const data = { groups: [], remove: { groups: [] } };
                const syncOptions = {};
                ProcessGroups(config, data, syncOptions);

                assert.strictEqual(syncOptions.groups, true);
                assert.strictEqual(syncOptions.groupsOptions.fields.length, 1);
                assert.strictEqual(typeof data.groups[0].description, 'string');
                assert.strictEqual(data.groups[0].description, 'John');
                assert.strictEqual(data.groups[0].initial.description, undefined);
            });
        });
    });

    describe('group-members', () => {
        describe('group', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Members\nGroupA,Test1';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        groupInput: 'Group',
                        membersInput: 'Members',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('group') > -1, true);
                assert.strictEqual(typeof data.groupMembers[0].group, 'string');
                assert.strictEqual(data.groupMembers[0].group, 'GroupA');
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        groupDefault: 'GroupA.',
                        membersInput: 'Members',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('group') > -1, true);
                assert.strictEqual(typeof data.groupMembers[0].group, 'string');
                assert.strictEqual(data.groupMembers[0].group, 'GroupA.');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Members\nGroupA.,Test1';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        groupInput: 'Group',
                        groupDefault: '_default',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('group') > -1, true);
                assert.strictEqual(data.groupMembers[0].group, 'GroupA.');
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Members\n,Test1';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        groupInput: 'Group',
                        groupDefault: '_default',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('group') > -1, true);
                assert.strictEqual(data.groupMembers[0].group, '_default');
            });

            it('default is used when input and default are set, group input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        groupInput: 'group',
                        groupDefault: '_default',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('group') > -1, true);
                assert.strictEqual(data.groupMembers[0].group, '_default');
            });
        });

        describe('members', () => {
            it('input is used when input is set - Single', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Members\nTest1,Test2';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: { sync: true, inputPath: filePath, membersInput: 'Members' },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('id') > -1, true);
                assert.strictEqual(data.groupMembers.length, 1);
                assert.strictEqual(data.groupMembers[0].id, 'Test2');
            });

            it('input is used when input is set - Multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'Group,Members\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: { sync: true, inputPath: filePath, membersInput: 'Members' },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('id') > -1, true);
                assert.strictEqual(data.groupMembers.length, 2);
                assert.strictEqual(data.groupMembers[0].id, 'Test2');
                assert.strictEqual(data.groupMembers[1].id, 'Test3');
            });

            it('input is used when input is set - Multiple - JSON Array', async () => {
                const filePath = getFilePath('json');
                const json = [{ Group: 'Test1', Members: ['Test2', 'Test3'] }];
                await fs.writeFile(filePath, JSON.stringify(json));
                const config = {
                    groupMembers: { sync: true, inputPath: filePath, membersInput: 'Members' },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.indexOf('id') > -1, true);
                assert.strictEqual(data.groupMembers.length, 2);
                assert.strictEqual(data.groupMembers[0].id, 'Test2');
                assert.strictEqual(data.groupMembers[1].id, 'Test3');
            });
        });

        describe('include', () => {
            it('input is used when include is set as string', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        include: 'Custom',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(typeof data.groupMembers[0].Custom, 'string');
                assert.strictEqual(data.groupMembers[0].Custom, 'Yellow');
                assert.strictEqual(data.groupMembers[0].custom, undefined);
            });

            it('input is used when include is set as array', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        include: ['Custom'],
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(typeof data.groupMembers[0].Custom, 'string');
                assert.strictEqual(data.groupMembers[0].Custom, 'Yellow');
                assert.strictEqual(data.groupMembers[0].custom, undefined);
            });

            it('input is used when include is set with multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members,Custom,Custom2\nTest1,Yellow,Red';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        include: ['Custom', 'Custom2'],
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(typeof data.groupMembers[0].Custom, 'string');
                assert.strictEqual(data.groupMembers[0].Custom, 'Yellow');
                assert.strictEqual(data.groupMembers[0].Custom2, 'Red');
                assert.strictEqual(data.groupMembers[0].custom, undefined);
                assert.strictEqual(data.groupMembers[0].custom2, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict not synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members,description\nTest1,JS123';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        include: 'description',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(typeof data.groupMembers[0].description, 'string');
                assert.strictEqual(data.groupMembers[0].description, 'JS123');
            });

            it('input is used when include is set as string - key conflict, conflict synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'Members,group\nTest1,JS123';
                await fs.writeFile(filePath, text);
                const config = {
                    groupMembers: {
                        sync: true,
                        inputPath: filePath,
                        membersInput: 'Members',
                        groupInput: 'group',
                        include: 'group',
                    },
                };
                const data = { groupMembers: [], remove: { groupMembers: [] } };
                const syncOptions = {};
                ProcessGroupMembers(config, data, syncOptions);

                assert.strictEqual(syncOptions.groupMembers, true);
                assert.strictEqual(syncOptions.groupMembersOptions.fields.length, 2);
                assert.strictEqual(typeof data.groupMembers[0].group, 'string');
                assert.strictEqual(data.groupMembers[0].group, 'JS123');
            });
        });
    });

    describe('users', () => {
        describe('inputPath', () => {
            it('inputPath is used when inputPath is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, targetNameInput: 'User' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.people, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorMode', () => {
            it('mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, targetNameInput: 'User', mirrorMode: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(
                    syncOptions.peopleTransform({ targetName: 'Test1' }, [], {
                        people: [{ targetName: 'Test1' }, { targetName: 'Test2' }],
                    }),
                    {
                        targetName: 'Test1',
                    }
                );
                assert.deepStrictEqual(
                    syncOptions.peopleTransform({ targetName: 'Test3' }, [], {
                        people: [{ targetName: 'Test1' }, { targetName: 'Test2' }],
                    }),
                    {
                        targetName: 'Test3',
                    }
                );
                const destinationData = { people: [{ targetName: 'Test1' }, { targetName: 'Test2' }] };
                syncOptions.peopleTransform({ targetName: 'Test1' }, [], destinationData);
                assert.deepStrictEqual(destinationData, {
                    people: [{ targetName: 'Test1' }, { targetName: 'Test2' }],
                });

                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(
                    syncOptions.peopleTransform({ targetName: 'Test1' }, [], {
                        people: [{ targetName: 'Test1' }, { targetName: 'Test2' }],
                    }),
                    {
                        targetName: 'Test1',
                        inSource: true,
                    }
                );
                assert.deepStrictEqual(
                    syncOptions.peopleTransform({ targetName: 'Test3' }, [], {
                        people: [{ targetName: 'Test1' }, { targetName: 'Test2' }],
                    }),
                    {
                        targetName: 'Test3',
                        inSource: true,
                    }
                );
                const destinationData = { people: [{ targetName: 'Test1' }, { targetName: 'Test2' }] };
                syncOptions.peopleTransform({ targetName: 'Test1' }, [], destinationData);
                assert.deepStrictEqual(destinationData, {
                    people: [{ targetName: 'Test1', inSource: true }, { targetName: 'Test2' }],
                });
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: false,
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.people, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorTag', () => {
            it('default mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, targetNameInput: 'User', mirrorMode: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    users: { sync: true, inputPath: filePath, targetNameInput: 'User', mirrorMode: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'Abc123Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName', 'externalKey']);
                assert.deepStrictEqual(data.people, [
                    {
                        externalKey: 'Abc123Test1',
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: false,
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.people, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        mirrorMode: false,
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.peopleOptions.fields, ['targetName']);
                assert.deepStrictEqual(data.people, [
                    {
                        targetName: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('externalKey', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, externalKeyInput: 'ExternalKey' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyDefault: 'My-ExternalKey',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, externalKeyInitial: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, externalKey input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'externalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                        externalKeyInitial: 'Initial-Key',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externalKey, undefined);
                assert.strictEqual(data.people[0].initial.externalKey, undefined);
            });
        });

        describe('externallyOwned', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, externallyOwnedInput: 'ExternallyOwned' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].externallyOwned, 'string');
                assert.strictEqual(data.people[0].externallyOwned, 'true');
                assert.strictEqual(data.people[0].initial.externallyOwned, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedDefault: 'true',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].externallyOwned, 'string');
                assert.strictEqual(data.people[0].externallyOwned, 'true');
                assert.strictEqual(data.people[0].initial.externallyOwned, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, externallyOwnedInitial: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].externallyOwned, undefined);
                assert.strictEqual(typeof data.people[0].initial.externallyOwned, 'boolean');
                assert.strictEqual(data.people[0].initial.externallyOwned, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].externallyOwned, 'true');
                assert.strictEqual(data.people[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].externallyOwned, '_default');
                assert.strictEqual(data.people[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, externallyOwned input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'externallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].externallyOwned, '_default');
                assert.strictEqual(data.people[0].initial.externallyOwned, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                        externallyOwnedInitial: 'false',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].externallyOwned, 'true');
                assert.strictEqual(data.people[0].initial.externallyOwned, 'false');
            });
        });

        describe('firstName', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,FirstName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, firstNameInput: 'FirstName' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].firstName, 'string');
                assert.strictEqual(data.people[0].firstName, 'My-Name');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,FirstName\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameDefault: 'My-Name',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].firstName, 'string');
                assert.strictEqual(data.people[0].firstName, 'My-Name');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, firstNameInitial: 'My-Name' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].firstName, undefined);
                assert.strictEqual(typeof data.people[0].initial.firstName, 'string');
                assert.strictEqual(data.people[0].initial.firstName, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,FirstName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameInput: 'FirstName',
                        firstNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].firstName, 'My-Name');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,FirstName\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameInput: 'FirstName',
                        firstNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].firstName, '_default');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('default is used when input and default are set, firstName input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameInput: 'firstName',
                        firstNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].firstName, '_default');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,FirstName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameInput: 'FirstName',
                        firstNameDefault: '_default',
                        firstNameInitial: 'Initial-Name',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'firstName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].firstName, 'My-Name');
                assert.strictEqual(data.people[0].initial.firstName, 'Initial-Name');
            });
        });

        describe('id', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, idInput: 'ID' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        idDefault: 'My-ID',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, idInitial: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, id input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'id',
                        idDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                        idInitial: 'Initial-ID',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].id, undefined);
                assert.strictEqual(data.people[0].initial.id, undefined);
            });
        });

        describe('language', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, languageInput: 'Language' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].language, 'string');
                assert.strictEqual(data.people[0].language, 'en');
                assert.strictEqual(data.people[0].initial.language, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Language\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        languageDefault: 'en',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].language, 'string');
                assert.strictEqual(data.people[0].language, 'en');
                assert.strictEqual(data.people[0].initial.language, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, languageInitial: 'en' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].language, undefined);
                assert.strictEqual(typeof data.people[0].initial.language, 'string');
                assert.strictEqual(data.people[0].initial.language, 'en');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].language, 'en');
                assert.strictEqual(data.people[0].initial.language, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Language\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].language, '_default');
                assert.strictEqual(data.people[0].initial.language, undefined);
            });

            it('default is used when input and default are set, language input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'language',
                        languageDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].language, '_default');
                assert.strictEqual(data.people[0].initial.language, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                        languageInitial: 'es',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].language, 'en');
                assert.strictEqual(data.people[0].initial.language, 'es');
            });
        });

        describe('lastName', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,LastName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, lastNameInput: 'LastName' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].lastName, 'string');
                assert.strictEqual(data.people[0].lastName, 'My-Name');
                assert.strictEqual(data.people[0].initial.lastName, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,LastName\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        lastNameDefault: 'My-Name',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].lastName, 'string');
                assert.strictEqual(data.people[0].lastName, 'My-Name');
                assert.strictEqual(data.people[0].initial.lastName, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, lastNameInitial: 'My-Name' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].lastName, undefined);
                assert.strictEqual(typeof data.people[0].initial.lastName, 'string');
                assert.strictEqual(data.people[0].initial.lastName, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,LastName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        lastNameInput: 'LastName',
                        lastNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].lastName, 'My-Name');
                assert.strictEqual(data.people[0].initial.lastName, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,LastName\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        lastNameInput: 'LastName',
                        lastNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].lastName, '_default');
                assert.strictEqual(data.people[0].initial.lastName, undefined);
            });

            it('default is used when input and default are set, lastName input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        lastNameInput: 'lastName',
                        lastNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].lastName, '_default');
                assert.strictEqual(data.people[0].initial.lastName, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,LastName\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        lastNameInput: 'LastName',
                        lastNameDefault: '_default',
                        lastNameInitial: 'Initial-Name',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'lastName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].lastName, 'My-Name');
                assert.strictEqual(data.people[0].initial.lastName, 'Initial-Name');
            });
        });

        describe('phoneLogin', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhoneLogin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, phoneLoginInput: 'PhoneLogin' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].phoneLogin, 'string');
                assert.strictEqual(data.people[0].phoneLogin, '1234');
                assert.strictEqual(data.people[0].initial.phoneLogin, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhoneLogin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phoneLoginDefault: '1234',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].phoneLogin, 'string');
                assert.strictEqual(data.people[0].phoneLogin, '1234');
                assert.strictEqual(data.people[0].initial.phoneLogin, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, phoneLoginInitial: '1234' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].phoneLogin, undefined);
                assert.strictEqual(typeof data.people[0].initial.phoneLogin, 'string');
                assert.strictEqual(data.people[0].initial.phoneLogin, '1234');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhoneLogin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phoneLoginInput: 'PhoneLogin',
                        phoneLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phoneLogin, '1234');
                assert.strictEqual(data.people[0].initial.phoneLogin, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhoneLogin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phoneLoginInput: 'PhoneLogin',
                        phoneLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phoneLogin, '_default');
                assert.strictEqual(data.people[0].initial.phoneLogin, undefined);
            });

            it('default is used when input and default are set, phoneLogin input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phoneLoginInput: 'phoneLogin',
                        phoneLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phoneLogin, '_default');
                assert.strictEqual(data.people[0].initial.phoneLogin, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhoneLogin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phoneLoginInput: 'PhoneLogin',
                        phoneLoginDefault: '_default',
                        phoneLoginInitial: '4321',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phoneLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phoneLogin, '1234');
                assert.strictEqual(data.people[0].initial.phoneLogin, '4321');
            });
        });

        describe('phonePin', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhonePin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, phonePinInput: 'PhonePin' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].phonePin, 'string');
                assert.strictEqual(data.people[0].phonePin, '1234');
                assert.strictEqual(data.people[0].initial.phonePin, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhonePin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phonePinDefault: '1234',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].phonePin, 'string');
                assert.strictEqual(data.people[0].phonePin, '1234');
                assert.strictEqual(data.people[0].initial.phonePin, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, phonePinInitial: '1234' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].phonePin, undefined);
                assert.strictEqual(typeof data.people[0].initial.phonePin, 'string');
                assert.strictEqual(data.people[0].initial.phonePin, '1234');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhonePin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phonePinInput: 'PhonePin',
                        phonePinDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phonePin, '1234');
                assert.strictEqual(data.people[0].initial.phonePin, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhonePin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phonePinInput: 'PhonePin',
                        phonePinDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phonePin, '_default');
                assert.strictEqual(data.people[0].initial.phonePin, undefined);
            });

            it('default is used when input and default are set, phonePin input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phonePinInput: 'phonePin',
                        phonePinDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phonePin, '_default');
                assert.strictEqual(data.people[0].initial.phonePin, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,PhonePin\nTest1,1234';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        phonePinInput: 'PhonePin',
                        phonePinDefault: '_default',
                        phonePinInitial: '4321',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'phonePin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].phonePin, '1234');
                assert.strictEqual(data.people[0].initial.phonePin, '4321');
            });
        });

        describe('recipientType', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, recipientTypeInput: 'RecipientType' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,RecipientType\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeDefault: 'My-RecipientType',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, recipientTypeInitial: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,RecipientType\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('default is not used when input and default are set, recipientType input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'recipientType',
                        recipientTypeDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,RecipientType\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        recipientTypeInput: 'RecipientType',
                        recipientTypeDefault: '_default',
                        recipientTypeInitial: 'Initial-RT',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].recipientType, undefined);
                assert.strictEqual(data.people[0].initial.recipientType, undefined);
            });
        });

        describe('roles', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, rolesInput: 'Roles' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 2);
                assert.strictEqual(data.people[0].roles[0], 'Role2');
                assert.strictEqual(data.people[0].roles[1], 'Role3');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('default is used when default[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesDefault: 'Role2|Role3',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 2);
                assert.strictEqual(data.people[0].roles[0], 'Role2');
                assert.strictEqual(data.people[0].roles[1], 'Role3');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('default is used when default[array] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesDefault: ['Role2', 'Role3'],
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 2);
                assert.strictEqual(data.people[0].roles[0], 'Role2');
                assert.strictEqual(data.people[0].roles[1], 'Role3');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, rolesInitial: 'Role2|Role3' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].initial.roles.length, 2);
                assert.strictEqual(data.people[0].initial.roles[0], 'Role2');
                assert.strictEqual(data.people[0].initial.roles[1], 'Role3');
                assert.strictEqual(data.people[0].roles, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, rolesInitial: ['Role2', 'Role3'] },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].initial.roles.length, 2);
                assert.strictEqual(data.people[0].initial.roles[0], 'Role2');
                assert.strictEqual(data.people[0].initial.roles[1], 'Role3');
                assert.strictEqual(data.people[0].roles, undefined);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesInput: 'Roles',
                        rolesDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 2);
                assert.strictEqual(data.people[0].roles[0], 'Role2');
                assert.strictEqual(data.people[0].roles[1], 'Role3');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesInput: 'Roles',
                        rolesDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 1);
                assert.strictEqual(data.people[0].roles[0], 'DefaultSup');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('default is used when input and default are set, roles input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesInput: 'Roles',
                        rolesDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 1);
                assert.strictEqual(data.people[0].roles[0], 'DefaultSup');
                assert.strictEqual(data.people[0].initial.roles, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Roles\nTest1,Role2|Role3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        rolesInput: 'Roles',
                        rolesDefault: 'DefaultSup',
                        rolesInitial: 'Role4|Role5',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'roles');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].roles.length, 2);
                assert.strictEqual(data.people[0].roles[0], 'Role2');
                assert.strictEqual(data.people[0].roles[1], 'Role3');
                assert.strictEqual(data.people[0].initial.roles.length, 2);
                assert.strictEqual(data.people[0].initial.roles[0], 'Role4');
                assert.strictEqual(data.people[0].initial.roles[1], 'Role5');
            });
        });

        describe('site', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, siteInput: 'Site' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].site, 'string');
                assert.strictEqual(data.people[0].site, 'Default Site');
                assert.strictEqual(data.people[0].initial.site, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Site\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        siteDefault: 'Default Site',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].site, 'string');
                assert.strictEqual(data.people[0].site, 'Default Site');
                assert.strictEqual(data.people[0].initial.site, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, siteInitial: 'Initial Site' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].site, undefined);
                assert.strictEqual(typeof data.people[0].initial.site, 'string');
                assert.strictEqual(data.people[0].initial.site, 'Initial Site');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].site, 'Default Site');
                assert.strictEqual(data.people[0].initial.site, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Site\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].site, '_default');
                assert.strictEqual(data.people[0].initial.site, undefined);
            });

            it('default is used when input and default are set, site input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'site',
                        siteDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].site, '_default');
                assert.strictEqual(data.people[0].initial.site, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Site\nTest1,Default Site';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        siteInput: 'Site',
                        siteDefault: '_default',
                        siteInitial: 'San Ramon',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'site');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].site, 'Default Site');
                assert.strictEqual(data.people[0].initial.site, 'San Ramon');
            });
        });

        describe('status', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, statusInput: 'Status' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].status, 'string');
                assert.strictEqual(data.people[0].status, 'ACTIVE');
                assert.strictEqual(data.people[0].initial.status, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        statusDefault: 'ACTIVE',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].status, 'string');
                assert.strictEqual(data.people[0].status, 'ACTIVE');
                assert.strictEqual(data.people[0].initial.status, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, statusInitial: true },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].status, undefined);
                assert.strictEqual(typeof data.people[0].initial.status, 'boolean');
                assert.strictEqual(data.people[0].initial.status, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].status, 'ACTIVE');
                assert.strictEqual(data.people[0].initial.status, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].status, '_default');
                assert.strictEqual(data.people[0].initial.status, undefined);
            });

            it('default is used when input and default are set, status input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'status',
                        statusDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].status, '_default');
                assert.strictEqual(data.people[0].initial.status, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                        statusInitial: 'INACTIVE',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].status, 'ACTIVE');
                assert.strictEqual(data.people[0].initial.status, 'INACTIVE');
            });
        });

        describe('supervisors', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, supervisorsInput: 'Sups' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 2);
                assert.strictEqual(data.people[0].supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('default is used when default[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsDefault: 'Test2|Test3',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 2);
                assert.strictEqual(data.people[0].supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('default is used when default[array] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsDefault: ['Test2', 'Test3'],
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 2);
                assert.strictEqual(data.people[0].supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, supervisorsInitial: 'Test2|Test3' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed, '');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].initial.supervisors.length, 2);
                assert.strictEqual(data.people[0].initial.supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].initial.supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].supervisors, undefined);
            });

            it('initial is used when initial[string] is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, supervisorsInitial: ['Test2', 'Test3'] },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed, '');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].initial.supervisors.length, 2);
                assert.strictEqual(data.people[0].initial.supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].initial.supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].supervisors, undefined);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 2);
                assert.strictEqual(data.people[0].supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 1);
                assert.strictEqual(data.people[0].supervisors[0], 'DefaultSup');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('default is used when input and default are set, supervisors input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 1);
                assert.strictEqual(data.people[0].supervisors[0], 'DefaultSup');
                assert.strictEqual(data.people[0].initial.supervisors, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Sups\nTest1,Test2|Test3';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        supervisorsInput: 'Sups',
                        supervisorsDefault: 'DefaultSup',
                        supervisorsInitial: 'Test4|Test5',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',').length, 1);
                assert.strictEqual(syncOptions.peopleQuery.embed.split(',')[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'supervisors');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].supervisors.length, 2);
                assert.strictEqual(data.people[0].supervisors[0], 'Test2');
                assert.strictEqual(data.people[0].supervisors[1], 'Test3');
                assert.strictEqual(data.people[0].initial.supervisors.length, 2);
                assert.strictEqual(data.people[0].initial.supervisors[0], 'Test4');
                assert.strictEqual(data.people[0].initial.supervisors[1], 'Test5');
            });
        });

        describe('targetName', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, targetNameInput: 'User' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, 'Test1');
                assert.strictEqual(data.people[0].initial.targetName, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameDefault: 'Test1',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, 'Test1');
                assert.strictEqual(data.people[0].initial.targetName, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, targetNameInitial: 'Test_1' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].targetName, undefined);
                assert.strictEqual(data.people[0].initial.targetName, 'Test_1');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        targetNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, 'Test1');
                assert.strictEqual(data.people[0].initial.targetName, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        targetNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, '_default');
                assert.strictEqual(data.people[0].initial.targetName, undefined);
            });

            it('default is used when input and default are set, targetName input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\n';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        targetNameDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, '_default');
                assert.strictEqual(data.people[0].initial.targetName, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        targetNameInput: 'User',
                        targetNameDefault: '_default',
                        targetNameInitial: 'Test_1',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'targetName');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].targetName, 'Test1');
                assert.strictEqual(data.people[0].initial.targetName, 'Test_1');
            });
        });

        describe('timezone', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, timezoneInput: 'Timezone' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].timezone, 'string');
                assert.strictEqual(data.people[0].timezone, 'US/Eastern');
                assert.strictEqual(data.people[0].initial.timezone, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Timezone\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        timezoneDefault: 'US/Eastern',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].timezone, 'string');
                assert.strictEqual(data.people[0].timezone, 'US/Eastern');
                assert.strictEqual(data.people[0].initial.timezone, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, timezoneInitial: 'US/Eastern' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].timezone, undefined);
                assert.strictEqual(typeof data.people[0].initial.timezone, 'string');
                assert.strictEqual(data.people[0].initial.timezone, 'US/Eastern');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].timezone, 'US/Eastern');
                assert.strictEqual(data.people[0].initial.timezone, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Timezone\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].timezone, '_default');
                assert.strictEqual(data.people[0].initial.timezone, undefined);
            });

            it('default is used when input and default are set, timezone input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].timezone, '_default');
                assert.strictEqual(data.people[0].initial.timezone, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                        timezoneInitial: 'US/Pacific',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].timezone, 'US/Eastern');
                assert.strictEqual(data.people[0].initial.timezone, 'US/Pacific');
            });
        });

        describe('webLogin', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,WebLogin\nTest1,Test_1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, webLoginInput: 'WebLogin' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].webLogin, 'string');
                assert.strictEqual(data.people[0].webLogin, 'Test_1');
                assert.strictEqual(data.people[0].initial.webLogin, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,WebLogin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        webLoginDefault: 'Test_1',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].webLogin, 'string');
                assert.strictEqual(data.people[0].webLogin, 'Test_1');
                assert.strictEqual(data.people[0].initial.webLogin, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, webLoginInitial: 'Test_1' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(data.people[0].webLogin, undefined);
                assert.strictEqual(typeof data.people[0].initial.webLogin, 'string');
                assert.strictEqual(data.people[0].initial.webLogin, 'Test_1');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,WebLogin\nTest1,Test_1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        webLoginInput: 'WebLogin',
                        webLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].webLogin, 'Test_1');
                assert.strictEqual(data.people[0].initial.webLogin, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,WebLogin\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        webLoginInput: 'WebLogin',
                        webLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].webLogin, '_default');
                assert.strictEqual(data.people[0].initial.webLogin, undefined);
            });

            it('default is used when input and default are set, webLogin input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'User\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        webLoginInput: 'webLogin',
                        webLoginDefault: '_default',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].webLogin, '_default');
                assert.strictEqual(data.people[0].initial.webLogin, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,WebLogin\nTest1,Test_1';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        webLoginInput: 'WebLogin',
                        webLoginDefault: '_default',
                        webLoginInitial: '1_Test',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields[0], 'webLogin');
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(data.people[0].webLogin, 'Test_1');
                assert.strictEqual(data.people[0].initial.webLogin, '1_Test');
            });
        });

        describe('include', () => {
            it('input is used when include is set as string', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, include: 'Custom' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(typeof data.people[0].Custom, 'string');
                assert.strictEqual(data.people[0].Custom, 'Yellow');
                assert.strictEqual(data.people[0].initial.Custom, undefined);
                assert.strictEqual(data.people[0].custom, undefined);
            });

            it('input is used when include is set as array', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, include: ['Custom'] },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(typeof data.people[0].Custom, 'string');
                assert.strictEqual(data.people[0].Custom, 'Yellow');
                assert.strictEqual(data.people[0].initial.Custom, undefined);
                assert.strictEqual(data.people[0].custom, undefined);
            });

            it('input is used when include is set with multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom,Custom2\nTest1,Yellow,Red';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, include: ['Custom', 'Custom2'] },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(typeof data.people[0].Custom, 'string');
                assert.strictEqual(data.people[0].Custom, 'Yellow');
                assert.strictEqual(data.people[0].Custom2, 'Red');
                assert.strictEqual(data.people[0].initial.Custom, undefined);
                assert.strictEqual(data.people[0].initial.Custom2, undefined);
                assert.strictEqual(data.people[0].custom, undefined);
                assert.strictEqual(data.people[0].custom2, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict not synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,firstName\nTest1,John';
                await fs.writeFile(filePath, text);
                const config = {
                    users: { sync: true, inputPath: filePath, include: 'firstName' },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 0);
                assert.strictEqual(typeof data.people[0].firstName, 'string');
                assert.strictEqual(data.people[0].firstName, 'John');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,firstName\nTest1,John';
                await fs.writeFile(filePath, text);
                const config = {
                    users: {
                        sync: true,
                        inputPath: filePath,
                        firstNameInput: 'firstName',
                        include: 'firstName',
                    },
                };
                const data = { people: [], remove: { people: [] } };
                const syncOptions = {};
                ProcessUsers(config, data, syncOptions);

                assert.strictEqual(syncOptions.people, true);
                assert.strictEqual(syncOptions.peopleOptions.fields.length, 1);
                assert.strictEqual(typeof data.people[0].firstName, 'string');
                assert.strictEqual(data.people[0].firstName, 'John');
                assert.strictEqual(data.people[0].initial.firstName, undefined);
            });
        });
    });

    describe('devices', () => {
        describe('inputPath', () => {
            it('inputPath is used when inputPath is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorTag', () => {
            it('default mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: true,
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externalKey',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externalKey: 'XMSYNC_Test1|Device',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: true,
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externalKey',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externalKey: 'Abc123Test1|Device',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: 'greedy',
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externalKey',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externalKey: 'XMSYNC_Test1|Device',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: 'greedy',
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externalKey',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externalKey: 'Abc123Test1|Device',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: false,
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        mirrorMode: false,
                        devices: [{ input: 'Device' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    },
                ]);
            });
        });

        describe('delay', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Delay\ntest1@xmatters.com,Test1,5';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [{ input: 'Device', delayInput: 'Delay' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '5',
                        initial: {},
                    },
                ]);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Delay\ntest1@xmatters.com,Test1,3';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [{ input: 'Device', delayDefault: '4' }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '4',
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device', delayInitial: 2 }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: { delay: 2 },
                    },
                ]);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Delay\nTest1,test1@xmatters.com,4';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [
                            {
                                input: 'Device',
                                delayInput: 'Delay',
                                delayDefault: 5,
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '4',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Delay\nTest1,test1@xmatters.com,';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [
                            {
                                input: 'Device',
                                delayInput: 'Delay',
                                delayDefault: '3',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '3',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, delay input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [
                            {
                                input: 'Device',
                                delayInput: 'Delay',
                                delayDefault: '1',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '1',
                        initial: {},
                    },
                ]);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Delay\ntest1@xmatters.com,Test1,1';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        delaySync: true,
                        devices: [
                            {
                                input: 'Device',
                                delayInput: 'Delay',
                                delayDefault: '2',
                                delayInitial: '3',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'delay',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        delay: '1',
                        initial: { delay: '3' },
                    },
                ]);
            });
        });

        describe('deviceType', () => {
            describe('default', () => {
                it('input is used when input is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\ntest1@xmatters.com,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });

                it('name is used when name is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\ntest1@xmatters.com,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', name: 'Work Email' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Email',
                        name: 'Work Email',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });
            });

            describe('email', () => {
                it('input is used when input is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\ntest1@xmatters.com,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', deviceType: 'EMAIL' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });

                it('name is used when name is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\ntest1@xmatters.com,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', name: 'Work Email', deviceType: 'EMAIL' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Email',
                        name: 'Work Email',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });
            });

            describe('voice', () => {
                it('input is used when input is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\n+12345678999,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', deviceType: 'VOICE' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'VOICE',
                        phoneNumber: '+12345678999',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });

                it('name is used when name is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\n+12345678999,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', name: 'Work Phone', deviceType: 'VOICE' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Phone',
                        name: 'Work Phone',
                        deviceType: 'VOICE',
                        phoneNumber: '+12345678999',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });
            });

            describe('text', () => {
                it('input is used when input is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\n+12345678901,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', deviceType: 'TEXT_PHONE' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'TEXT_PHONE',
                        phoneNumber: '+12345678901',
                        initial: {},
                    });
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });

                it('name is used when name is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\n+12345678901,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', name: 'Work Cell', deviceType: 'TEXT_PHONE' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Cell',
                        name: 'Work Cell',
                        deviceType: 'TEXT_PHONE',
                        phoneNumber: '+12345678901',
                        initial: {},
                    });

                    assert.deepStrictEqual(data.devices[0].initial, {});
                });
            });

            describe('multiple', () => {
                it('input is used when input is set', async () => {
                    const filePath = getFilePath('csv');
                    const text =
                        'Owner,Work Phone,Work Cell,Email\nTest1,+12345678999,+12345678901,test1@xmatters.com';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [
                                ,
                                { input: 'Work Phone', deviceType: 'VOICE' },
                                { input: 'Work Cell', deviceType: 'TEXT_PHONE' },
                                { input: 'Email' },
                            ],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);

                    assert.deepStrictEqual(data.devices[0], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Phone',
                        name: 'Work Phone',
                        deviceType: 'VOICE',
                        phoneNumber: '+12345678999',
                        initial: {},
                    });

                    assert.deepStrictEqual(data.devices[1], {
                        owner: 'Test1',
                        targetName: 'Test1|Work Cell',
                        name: 'Work Cell',
                        deviceType: 'TEXT_PHONE',
                        phoneNumber: '+12345678901',
                        initial: {},
                    });

                    assert.deepStrictEqual(data.devices[2], {
                        owner: 'Test1',
                        targetName: 'Test1|Email',
                        name: 'Email',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: {},
                    });
                    assert.strictEqual(data.devices.length, 3);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });

                it('name is used when name is set', async () => {
                    const filePath = getFilePath('csv');
                    const text = 'Device,Owner\n+12345678901,Test1';
                    await fs.writeFile(filePath, text);
                    const config = {
                        devices: {
                            sync: true,
                            inputPath: filePath,
                            ownerInput: 'Owner',
                            devices: [{ input: 'Device', name: 'Work Cell', deviceType: 'TEXT_PHONE' }],
                        },
                    };
                    const data = { devices: [], remove: { devices: [] } };
                    const syncOptions = {};
                    ProcessDevices(config, data, syncOptions);

                    assert.strictEqual(syncOptions.devices, true);
                    assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                        'owner',
                        'targetName',
                        'name',
                        'deviceType',
                        'emailAddress',
                        'phoneNumber',
                    ]);
                    assert.strictEqual(data.devices[0].owner, 'Test1');
                    assert.strictEqual(data.devices[0].targetName, 'Test1|Work Cell');
                    assert.strictEqual(data.devices[0].name, 'Work Cell');
                    assert.strictEqual(data.devices[0].deviceType, 'TEXT_PHONE');
                    assert.strictEqual(data.devices[0].phoneNumber, '+12345678901');
                    assert.strictEqual(data.devices.length, 1);
                    assert.deepStrictEqual(data.devices[0].initial, {});
                });
            });
        });

        describe('include', () => {
            it('input is used when include is set as string', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Custom\nTest1,test1@xmatters.com,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device' }],
                        include: 'Custom',
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices[0], {
                    owner: 'Test1',
                    targetName: 'Test1|Device',
                    name: 'Device',
                    deviceType: 'EMAIL',
                    emailAddress: 'test1@xmatters.com',
                    Custom: 'Yellow',
                    initial: {},
                });
                assert.strictEqual(data.devices.length, 1);
                assert.deepStrictEqual(data.devices[0].initial, {});
            });

            it('input is used when include is set as array', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Custom\nTest1,test1@xmatters.com,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device' }],
                        include: ['Custom'],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices[0], {
                    owner: 'Test1',
                    targetName: 'Test1|Device',
                    name: 'Device',
                    deviceType: 'EMAIL',
                    emailAddress: 'test1@xmatters.com',
                    Custom: 'Yellow',
                    initial: {},
                });
            });

            it('input is used when include is set with multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Custom,Custom2\nTest1,test1@xmatters.com,Yellow,Red';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device' }],
                        include: ['Custom', 'Custom2'],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        Custom: 'Yellow',
                        Custom2: 'Red',
                        initial: {},
                    },
                ]);
                assert.strictEqual(data.devices.length, 1);
                assert.deepStrictEqual(data.devices[0].initial, {});

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices[0], {
                    owner: 'Test1',
                    targetName: 'Test1|Device',
                    name: 'Device',
                    deviceType: 'EMAIL',
                    emailAddress: 'test1@xmatters.com',
                    Custom: 'Yellow',
                    Custom2: 'Red',
                    initial: {},
                });
            });

            it('input is used when include is set as string - key conflict, conflict not synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,sequence\nTest1,test1@xmatters.com,1';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device' }],
                        include: ['sequence'],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices[0], {
                    owner: 'Test1',
                    targetName: 'Test1|Device',
                    name: 'Device',
                    deviceType: 'EMAIL',
                    emailAddress: 'test1@xmatters.com',
                    sequence: '1',
                    initial: {},
                });
            });

            it('input is used when include is set as string - key conflict, conflict synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'owner',
                        devices: [{ input: 'Device' }],
                        include: ['owner'],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices[0], {
                    owner: 'Test1',
                    targetName: 'Test1|Device',
                    name: 'Device',
                    deviceType: 'EMAIL',
                    emailAddress: 'test1@xmatters.com',
                    initial: {},
                });
            });
        });

        describe('externallyOwned', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,ExternallyOwned\ntest1@xmatters.com,Test1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [{ input: 'Device', externallyOwnedInput: 'ExternallyOwned' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: 'true',
                        initial: {},
                    },
                ]);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,ExternallyOwned\ntest1@xmatters.com,Test1';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [{ input: 'Device', externallyOwnedDefault: 'true' }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: 'true',
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device', externallyOwnedInitial: false }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: { externallyOwned: false },
                    },
                ]);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,ExternallyOwned\nTest1,test1@xmatters.com,false';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [
                            {
                                input: 'Device',
                                externallyOwnedInput: 'ExternallyOwned',
                                externallyOwnedDefault: 'true',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: 'false',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,ExternallyOwned\nTest1,test1@xmatters.com,';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [
                            {
                                input: 'Device',
                                externallyOwnedInput: 'ExternallyOwned',
                                externallyOwnedDefault: '_default',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: '_default',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, externallyOwned input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [
                            {
                                input: 'Device',
                                externallyOwnedInput: 'ExternallyOwned',
                                externallyOwnedDefault: '_default',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: '_default',
                        initial: {},
                    },
                ]);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,ExternallyOwned\ntest1@xmatters.com,Test1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        externallyOwnedSync: true,
                        devices: [
                            {
                                input: 'Device',
                                externallyOwnedInput: 'ExternallyOwned',
                                externallyOwnedDefault: false,
                                externallyOwnedInitial: 'false',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'externallyOwned',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        externallyOwned: 'true',
                        initial: { externallyOwned: 'false' },
                    },
                ]);
            });
        });

        describe('owner', () => {
            it('No Devices Configured', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner\nTest1,JS123';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: { sync: true, inputPath: filePath, ownerInput: 'Owner' },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.strictEqual(syncOptions.devicesOptions.fields.includes('owner'), true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.strictEqual(data.devices.length, 0);
            });

            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner\nTest1,JS123';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [
                            {
                                input: 'Device',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.strictEqual(syncOptions.devicesOptions.fields.includes('owner'), true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.strictEqual(data.devices.length, 1);
                assert.strictEqual(typeof data.devices[0].owner, 'string');
                assert.strictEqual(data.devices[0].owner, 'JS123');
                assert.strictEqual(data.devices[0].initial.owner, undefined);
            });
        });

        describe('sequence', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Sequence\ntest1@xmatters.com,Test1,5';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [{ input: 'Device', sequenceInput: 'Sequence' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                ]);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Sequence\ntest1@xmatters.com,Test1,3';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [{ input: 'Device', sequenceDefault: '4' }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device', sequenceInitial: 2 }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: { sequence: 2 },
                    },
                ]);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Sequence\nTest1,test1@xmatters.com,4';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: 5,
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Sequence\nTest1,test1@xmatters.com,';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: '3',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, sequence input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: '1',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                ]);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,Sequence\ntest1@xmatters.com,Test1,1';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: '2',
                                sequenceInitial: '3',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: { sequence: '3' },
                    },
                ]);
            });

            it('input is used when input is set (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text =
                    'Device,Device2,Owner,Sequence,Sequence2\ntest1@xmatters.com,test1@example.com,Test1,3,2';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            { input: 'Device', sequenceInput: 'Sequence' },
                            { input: 'Device2', sequenceInput: 'Sequence2' },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 1,
                        initial: {},
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 2,
                        initial: {},
                    },
                ]);
            });

            it('default is used when default is set (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text =
                    'Device,Device2,Owner,Sequence,Sequence2\ntest1@xmatters.com,test1@example.com,Test1,3,2';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            { input: 'Device', sequenceDefault: '1' },
                            { input: 'Device2', sequenceDefault: '2' },
                        ],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 2,
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Device2,Owner\ntest1@xmatters.com,test1@example.com,Test1';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [
                            { input: 'Device', sequenceInitial: 1 },
                            { input: 'Device2', sequenceInitial: 2 },
                        ],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: { sequence: 1 },
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        initial: { sequence: 2 },
                    },
                ]);
            });

            it('input is used when input and default are set, input value supplied (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text =
                    'Device,Device2,Owner,Sequence,Sequence2\ntest1@xmatters.com,test1@example.com,Test1,1,2';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: 4,
                            },
                            { input: 'Device2', sequenceInput: 'Sequence2', sequenceDefault: 3 },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: {},
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 2,
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, input value not supplied (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text =
                    'Owner,Device,Device2,Sequence,Sequence2\nTest1,test1@xmatters.com,test1@example.com,,';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: '3',
                            },
                            {
                                input: 'Device2',
                                sequenceInput: 'Sequence2',
                                sequenceDefault: '2',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 1,
                        initial: {},
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 2,
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, sequence input column not defined (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,Device2\nTest1,test1@xmatters.com,test1@example.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: '3',
                            },
                            {
                                input: 'Device2',
                                sequenceInput: 'Sequence2',
                                sequenceDefault: '2',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 1,
                        initial: {},
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 2,
                        initial: {},
                    },
                ]);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied (multiple)', async () => {
                const filePath = getFilePath('csv');
                const text =
                    'Device,Device2,Owner,Sequence,Sequence2\ntest1@xmatters.com,test1@example.com,Test1,1,2';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        sequenceSync: true,
                        devices: [
                            {
                                input: 'Device',
                                sequenceInput: 'Sequence',
                                sequenceDefault: 4,
                                sequenceInitial: 5,
                            },
                            {
                                input: 'Device2',
                                sequenceInput: 'Sequence2',
                                sequenceDefault: 3,
                                sequenceInitial: 6,
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'sequence',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        sequence: 1,
                        initial: { sequence: 5 },
                    },
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device2',
                        name: 'Device2',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@example.com',
                        sequence: 2,
                        initial: { sequence: 6 },
                    },
                ]);
            });
        });

        describe('priorityThreshold', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,PriorityThreshold\ntest1@xmatters.com,Test1,LOW';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [{ input: 'Device', priorityThresholdInput: 'PriorityThreshold' }],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'LOW',
                        initial: {},
                    },
                ]);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,PriorityThreshold\ntest1@xmatters.com,Test1,MEDIUM';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [{ input: 'Device', priorityThresholdDefault: 'HIGH' }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'HIGH',
                        initial: {},
                    },
                ]);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        devices: [{ input: 'Device', priorityThresholdInitial: 'LOW' }],
                    },
                };

                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        initial: { priorityThreshold: 'LOW' },
                    },
                ]);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,PriorityThreshold\nTest1,test1@xmatters.com,HIGH';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [
                            {
                                input: 'Device',
                                priorityThresholdInput: 'PriorityThreshold',
                                priorityThresholdDefault: 'LOW',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'HIGH',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device,PriorityThreshold\nTest1,test1@xmatters.com,';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [
                            {
                                input: 'Device',
                                priorityThresholdInput: 'PriorityThreshold',
                                priorityThresholdDefault: 'MEDIUM',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'MEDIUM',
                        initial: {},
                    },
                ]);
            });

            it('default is used when input and default are set, priorityThreshold input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Owner,Device\nTest1,test1@xmatters.com';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [
                            {
                                input: 'Device',
                                priorityThresholdInput: 'PriorityThreshold',
                                priorityThresholdDefault: 'LOW',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'LOW',
                        initial: {},
                    },
                ]);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Device,Owner,PriorityThreshold\ntest1@xmatters.com,Test1,LOW';
                await fs.writeFile(filePath, text);
                const config = {
                    devices: {
                        sync: true,
                        inputPath: filePath,
                        ownerInput: 'Owner',
                        priorityThresholdSync: true,
                        devices: [
                            {
                                input: 'Device',
                                priorityThresholdInput: 'PriorityThreshold',
                                priorityThresholdDefault: 'MEDIUM',
                                priorityThresholdInitial: 'HIGH',
                            },
                        ],
                    },
                };
                const data = { devices: [], remove: { devices: [] } };
                const syncOptions = {};
                ProcessDevices(config, data, syncOptions);

                assert.strictEqual(syncOptions.devices, true);
                assert.deepStrictEqual(syncOptions.devicesOptions.fields, [
                    'owner',
                    'targetName',
                    'name',
                    'deviceType',
                    'emailAddress',
                    'phoneNumber',
                    'priorityThreshold',
                ]);
                assert.deepStrictEqual(data.devices, [
                    {
                        owner: 'Test1',
                        targetName: 'Test1|Device',
                        name: 'Device',
                        deviceType: 'EMAIL',
                        emailAddress: 'test1@xmatters.com',
                        priorityThreshold: 'LOW',
                        initial: { priorityThreshold: 'HIGH' },
                    },
                ]);
            });
        });
    });

    describe('sites', () => {
        describe('inputPath', () => {
            it('inputPath is used when inputPath is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, nameInput: 'Site' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name']);
                assert.deepStrictEqual(data.sites, [
                    {
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorMode', () => {
            it('mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, nameInput: 'Site', mirrorMode: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(
                    syncOptions.sitesTransform({ name: 'Test1' }, [], {
                        sites: [{ name: 'Test1' }, { name: 'Test2' }],
                    }),
                    {
                        name: 'Test1',
                    }
                );
                assert.deepStrictEqual(
                    syncOptions.sitesTransform({ name: 'Test3' }, [], {
                        sites: [{ name: 'Test1' }, { name: 'Test2' }],
                    }),
                    {
                        name: 'Test3',
                    }
                );
                const destinationData = { sites: [{ name: 'Test1' }, { name: 'Test2' }] };
                syncOptions.sitesTransform({ name: 'Test1' }, [], destinationData);
                assert.deepStrictEqual(destinationData, { sites: [{ name: 'Test1' }, { name: 'Test2' }] });

                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(
                    syncOptions.sitesTransform({ name: 'Test1' }, [], {
                        sites: [{ name: 'Test1' }, { name: 'Test2' }],
                    }),
                    {
                        name: 'Test1',
                        inSource: true,
                    }
                );
                assert.deepStrictEqual(
                    syncOptions.sitesTransform({ name: 'Test3' }, [], {
                        sites: [{ name: 'Test1' }, { name: 'Test2' }],
                    }),
                    {
                        name: 'Test3',
                        inSource: true,
                    }
                );
                const destinationData = { sites: [{ name: 'Test1' }, { name: 'Test2' }] };
                syncOptions.sitesTransform({ name: 'Test1' }, [], destinationData);
                assert.deepStrictEqual(destinationData, {
                    sites: [{ name: 'Test1', inSource: true }, { name: 'Test2' }],
                });
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name', 'externalKey']);
                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: false,
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name']);
                assert.deepStrictEqual(data.sites, [
                    {
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('mirrorTag', () => {
            it('default mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, nameInput: 'Site', mirrorMode: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name', 'externalKey']);
                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(standard)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    sites: { sync: true, inputPath: filePath, nameInput: 'Site', mirrorMode: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name', 'externalKey']);
                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'Abc123Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name', 'externalKey']);
                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'XMSYNC_Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is applied in mirror mode(greedy)', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: 'greedy',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name', 'externalKey']);
                assert.deepStrictEqual(data.sites, [
                    {
                        externalKey: 'Abc123Test1',
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('default mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: false,
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name']);
                assert.deepStrictEqual(data.sites, [
                    {
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });

            it('custom mirrorTag is not applied in non-mirror mode', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    mirrorTag: 'Abc123',
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        mirrorMode: false,
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);
                assert.deepStrictEqual(syncOptions.sitesOptions.fields, ['name']);
                assert.deepStrictEqual(data.sites, [
                    {
                        name: 'Test1',
                        initial: {},
                    },
                ]);
            });
        });

        describe('address1', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address1\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, address1Input: 'Address1' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].address1, 'string');
                assert.strictEqual(data.sites[0].address1, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address1\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Default: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].address1, 'string');
                assert.strictEqual(data.sites[0].address1, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, address1Initial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].address1, undefined);
                assert.strictEqual(typeof data.sites[0].initial.address1, 'string');
                assert.strictEqual(data.sites[0].initial.address1, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address1\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Input: 'Address1',
                        address1Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address1, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address1\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Input: 'Address1',
                        address1Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address1, '_default');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('default is used when input and default are set, address1 input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Input: 'address1',
                        address1Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address1, '_default');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address1\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Input: 'Address1',
                        address1Default: '_default',
                        address1Initial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address1');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address1, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address1, 'Initial-Name');
            });
        });

        describe('address2', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address2\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, address2Input: 'Address2' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].address2, 'string');
                assert.strictEqual(data.sites[0].address2, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address2, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address2\nTest2,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address2Default: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].address2, 'string');
                assert.strictEqual(data.sites[0].address2, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address2, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest2';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, address2Initial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].address2, undefined);
                assert.strictEqual(typeof data.sites[0].initial.address2, 'string');
                assert.strictEqual(data.sites[0].initial.address2, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address2\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address2Input: 'Address2',
                        address2Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address2, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address2, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address2\nTest2,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address2Input: 'Address2',
                        address2Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address2, '_default');
                assert.strictEqual(data.sites[0].initial.address2, undefined);
            });

            it('default is used when input and default are set, address2 input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest2';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address2Input: 'address2',
                        address2Default: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address2, '_default');
                assert.strictEqual(data.sites[0].initial.address2, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Address2\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address2Input: 'Address2',
                        address2Default: '_default',
                        address2Initial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'address2');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].address2, 'My-Name');
                assert.strictEqual(data.sites[0].initial.address2, 'Initial-Name');
            });
        });

        describe('city', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,City\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, cityInput: 'City' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].city, 'string');
                assert.strictEqual(data.sites[0].city, 'My-Name');
                assert.strictEqual(data.sites[0].initial.city, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,City\nTest2,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        cityDefault: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].city, 'string');
                assert.strictEqual(data.sites[0].city, 'My-Name');
                assert.strictEqual(data.sites[0].initial.city, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest2';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, cityInitial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].city, undefined);
                assert.strictEqual(typeof data.sites[0].initial.city, 'string');
                assert.strictEqual(data.sites[0].initial.city, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,City\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        cityInput: 'City',
                        cityDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].city, 'My-Name');
                assert.strictEqual(data.sites[0].initial.city, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,City\nTest2,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        cityInput: 'City',
                        cityDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].city, '_default');
                assert.strictEqual(data.sites[0].initial.city, undefined);
            });

            it('default is used when input and default are set, city input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest2';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        cityInput: 'city',
                        cityDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].city, '_default');
                assert.strictEqual(data.sites[0].initial.city, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,City\nTest2,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        cityInput: 'City',
                        cityDefault: '_default',
                        cityInitial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'city');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].city, 'My-Name');
                assert.strictEqual(data.sites[0].initial.city, 'Initial-Name');
            });
        });

        describe('country', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Country\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, countryInput: 'Country' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].country, 'string');
                assert.strictEqual(data.sites[0].country, 'en');
                assert.strictEqual(data.sites[0].initial.country, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Country\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        countryDefault: 'en',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].country, 'string');
                assert.strictEqual(data.sites[0].country, 'en');
                assert.strictEqual(data.sites[0].initial.country, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, countryInitial: 'en' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].country, undefined);
                assert.strictEqual(typeof data.sites[0].initial.country, 'string');
                assert.strictEqual(data.sites[0].initial.country, 'en');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Country\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        countryInput: 'Country',
                        countryDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].country, 'en');
                assert.strictEqual(data.sites[0].initial.country, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Country\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        countryInput: 'Country',
                        countryDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].country, '_default');
                assert.strictEqual(data.sites[0].initial.country, undefined);
            });

            it('default is used when input and default are set, country input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        countryInput: 'country',
                        countryDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].country, '_default');
                assert.strictEqual(data.sites[0].initial.country, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Country\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        countryInput: 'Country',
                        countryDefault: '_default',
                        countryInitial: 'es',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'country');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].country, 'en');
                assert.strictEqual(data.sites[0].initial.country, 'es');
            });
        });

        describe('externalKey', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, externalKeyInput: 'ExternalKey' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyDefault: 'My-ExternalKey',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, externalKeyInitial: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternalKey\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('default is not used when input and default are set, externalKey input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'externalKey',
                        externalKeyDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternalKey\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externalKeyInput: 'ExternalKey',
                        externalKeyDefault: '_default',
                        externalKeyInitial: 'Initial-Key',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externalKey, undefined);
                assert.strictEqual(data.sites[0].initial.externalKey, undefined);
            });
        });

        describe('externallyOwned', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, externallyOwnedInput: 'ExternallyOwned' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].externallyOwned, 'string');
                assert.strictEqual(data.sites[0].externallyOwned, 'true');
                assert.strictEqual(data.sites[0].initial.externallyOwned, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedDefault: 'true',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].externallyOwned, 'string');
                assert.strictEqual(data.sites[0].externallyOwned, 'true');
                assert.strictEqual(data.sites[0].initial.externallyOwned, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, externallyOwnedInitial: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].externallyOwned, undefined);
                assert.strictEqual(typeof data.sites[0].initial.externallyOwned, 'boolean');
                assert.strictEqual(data.sites[0].initial.externallyOwned, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].externallyOwned, 'true');
                assert.strictEqual(data.sites[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternallyOwned\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].externallyOwned, '_default');
                assert.strictEqual(data.sites[0].initial.externallyOwned, undefined);
            });

            it('default is used when input and default are set, externallyOwned input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'externallyOwned',
                        externallyOwnedDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].externallyOwned, '_default');
                assert.strictEqual(data.sites[0].initial.externallyOwned, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ExternallyOwned\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        externallyOwnedInput: 'ExternallyOwned',
                        externallyOwnedDefault: '_default',
                        externallyOwnedInitial: 'false',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'externallyOwned');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].externallyOwned, 'true');
                assert.strictEqual(data.sites[0].initial.externallyOwned, 'false');
            });
        });

        describe('id', () => {
            it('input is not used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, idInput: 'ID' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('default is not used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        idDefault: 'My-ID',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('initial is not used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, idInitial: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('input is not used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ID\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('default is not used when input and default are set, id input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'id',
                        idDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });

            it('input is not used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,ID\nTest1,true';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        idInput: 'ID',
                        idDefault: '_default',
                        idInitial: 'Initial-ID',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].id, undefined);
                assert.strictEqual(data.sites[0].initial.id, undefined);
            });
        });

        describe('language', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, languageInput: 'Language' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].language, 'string');
                assert.strictEqual(data.sites[0].language, 'en');
                assert.strictEqual(data.sites[0].initial.language, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Language\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        languageDefault: 'en',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].language, 'string');
                assert.strictEqual(data.sites[0].language, 'en');
                assert.strictEqual(data.sites[0].initial.language, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, languageInitial: 'en' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].language, undefined);
                assert.strictEqual(typeof data.sites[0].initial.language, 'string');
                assert.strictEqual(data.sites[0].initial.language, 'en');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].language, 'en');
                assert.strictEqual(data.sites[0].initial.language, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Language\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].language, '_default');
                assert.strictEqual(data.sites[0].initial.language, undefined);
            });

            it('default is used when input and default are set, language input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'language',
                        languageDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].language, '_default');
                assert.strictEqual(data.sites[0].initial.language, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Language\nTest1,en';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        languageInput: 'Language',
                        languageDefault: '_default',
                        languageInitial: 'es',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'language');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].language, 'en');
                assert.strictEqual(data.sites[0].initial.language, 'es');
            });
        });

        describe('latitude', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Latitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, latitudeInput: 'Latitude' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].latitude, 'string');
                assert.strictEqual(data.sites[0].latitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.latitude, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Latitude\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        latitudeDefault: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].latitude, 'string');
                assert.strictEqual(data.sites[0].latitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.latitude, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, latitudeInitial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].latitude, undefined);
                assert.strictEqual(typeof data.sites[0].initial.latitude, 'string');
                assert.strictEqual(data.sites[0].initial.latitude, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Latitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        latitudeInput: 'Latitude',
                        latitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].latitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.latitude, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Latitude\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        latitudeInput: 'Latitude',
                        latitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].latitude, '_default');
                assert.strictEqual(data.sites[0].initial.latitude, undefined);
            });

            it('default is used when input and default are set, latitude input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        latitudeInput: 'latitude',
                        latitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].latitude, '_default');
                assert.strictEqual(data.sites[0].initial.latitude, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Latitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        latitudeInput: 'Latitude',
                        latitudeDefault: '_default',
                        latitudeInitial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'latitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].latitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.latitude, 'Initial-Name');
            });
        });

        describe('longitude', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Longitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, longitudeInput: 'Longitude' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].longitude, 'string');
                assert.strictEqual(data.sites[0].longitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.longitude, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Longitude\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        longitudeDefault: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].longitude, 'string');
                assert.strictEqual(data.sites[0].longitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.longitude, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, longitudeInitial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].longitude, undefined);
                assert.strictEqual(typeof data.sites[0].initial.longitude, 'string');
                assert.strictEqual(data.sites[0].initial.longitude, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Longitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        longitudeInput: 'Longitude',
                        longitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].longitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.longitude, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Longitude\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        longitudeInput: 'Longitude',
                        longitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].longitude, '_default');
                assert.strictEqual(data.sites[0].initial.longitude, undefined);
            });

            it('default is used when input and default are set, longitude input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        longitudeInput: 'longitude',
                        longitudeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].longitude, '_default');
                assert.strictEqual(data.sites[0].initial.longitude, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Longitude\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        longitudeInput: 'Longitude',
                        longitudeDefault: '_default',
                        longitudeInitial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'longitude');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].longitude, 'My-Name');
                assert.strictEqual(data.sites[0].initial.longitude, 'Initial-Name');
            });
        });

        describe('postalCode', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,PostalCode\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, postalCodeInput: 'PostalCode' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].postalCode, 'string');
                assert.strictEqual(data.sites[0].postalCode, 'My-Name');
                assert.strictEqual(data.sites[0].initial.postalCode, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,PostalCode\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        postalCodeDefault: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].postalCode, 'string');
                assert.strictEqual(data.sites[0].postalCode, 'My-Name');
                assert.strictEqual(data.sites[0].initial.postalCode, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, postalCodeInitial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].postalCode, undefined);
                assert.strictEqual(typeof data.sites[0].initial.postalCode, 'string');
                assert.strictEqual(data.sites[0].initial.postalCode, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,PostalCode\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        postalCodeInput: 'PostalCode',
                        postalCodeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].postalCode, 'My-Name');
                assert.strictEqual(data.sites[0].initial.postalCode, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,PostalCode\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        postalCodeInput: 'PostalCode',
                        postalCodeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].postalCode, '_default');
                assert.strictEqual(data.sites[0].initial.postalCode, undefined);
            });

            it('default is used when input and default are set, postalCode input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        postalCodeInput: 'postalCode',
                        postalCodeDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].postalCode, '_default');
                assert.strictEqual(data.sites[0].initial.postalCode, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,PostalCode\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        postalCodeInput: 'PostalCode',
                        postalCodeDefault: '_default',
                        postalCodeInitial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'postalCode');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].postalCode, 'My-Name');
                assert.strictEqual(data.sites[0].initial.postalCode, 'Initial-Name');
            });
        });

        describe('state', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,State\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, stateInput: 'State' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].state, 'string');
                assert.strictEqual(data.sites[0].state, 'My-Name');
                assert.strictEqual(data.sites[0].initial.state, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,State\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        stateDefault: 'My-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].state, 'string');
                assert.strictEqual(data.sites[0].state, 'My-Name');
                assert.strictEqual(data.sites[0].initial.state, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, stateInitial: 'My-Name' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].state, undefined);
                assert.strictEqual(typeof data.sites[0].initial.state, 'string');
                assert.strictEqual(data.sites[0].initial.state, 'My-Name');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,State\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        stateInput: 'State',
                        stateDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].state, 'My-Name');
                assert.strictEqual(data.sites[0].initial.state, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,State\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        stateInput: 'State',
                        stateDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].state, '_default');
                assert.strictEqual(data.sites[0].initial.state, undefined);
            });

            it('default is used when input and default are set, state input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        stateInput: 'state',
                        stateDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].state, '_default');
                assert.strictEqual(data.sites[0].initial.state, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,State\nTest1,My-Name';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        stateInput: 'State',
                        stateDefault: '_default',
                        stateInitial: 'Initial-Name',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'state');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].state, 'My-Name');
                assert.strictEqual(data.sites[0].initial.state, 'Initial-Name');
            });
        });

        describe('name', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, nameInput: 'Site' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, 'Test1');
                assert.strictEqual(data.sites[0].initial.name, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameDefault: 'Test1',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, 'Test1');
                assert.strictEqual(data.sites[0].initial.name, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, nameInitial: 'Test_1' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].name, undefined);
                assert.strictEqual(data.sites[0].initial.name, 'Test_1');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        nameDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, 'Test1');
                assert.strictEqual(data.sites[0].initial.name, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\n,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        nameDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, '_default');
                assert.strictEqual(data.sites[0].initial.name, undefined);
            });

            it('default is used when input and default are set, name input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\n';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        nameDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, '_default');
                assert.strictEqual(data.sites[0].initial.name, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        nameInput: 'Site',
                        nameDefault: '_default',
                        nameInitial: 'Test_1',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'name');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].name, 'Test1');
                assert.strictEqual(data.sites[0].initial.name, 'Test_1');
            });
        });

        describe('status', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, statusInput: 'Status' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].status, 'string');
                assert.strictEqual(data.sites[0].status, 'ACTIVE');
                assert.strictEqual(data.sites[0].initial.status, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        statusDefault: 'ACTIVE',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].status, 'string');
                assert.strictEqual(data.sites[0].status, 'ACTIVE');
                assert.strictEqual(data.sites[0].initial.status, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, statusInitial: true },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].status, undefined);
                assert.strictEqual(typeof data.sites[0].initial.status, 'boolean');
                assert.strictEqual(data.sites[0].initial.status, true);
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].status, 'ACTIVE');
                assert.strictEqual(data.sites[0].initial.status, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Status\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].status, '_default');
                assert.strictEqual(data.sites[0].initial.status, undefined);
            });

            it('default is used when input and default are set, status input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'status',
                        statusDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].status, '_default');
                assert.strictEqual(data.sites[0].initial.status, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Status\nTest1,ACTIVE';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        statusInput: 'Status',
                        statusDefault: '_default',
                        statusInitial: 'INACTIVE',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'status');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].status, 'ACTIVE');
                assert.strictEqual(data.sites[0].initial.status, 'INACTIVE');
            });
        });

        describe('timezone', () => {
            it('input is used when input is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, timezoneInput: 'Timezone' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].timezone, 'string');
                assert.strictEqual(data.sites[0].timezone, 'US/Eastern');
                assert.strictEqual(data.sites[0].initial.timezone, undefined);
            });

            it('default is used when default is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Timezone\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        timezoneDefault: 'US/Eastern',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].timezone, 'string');
                assert.strictEqual(data.sites[0].timezone, 'US/Eastern');
                assert.strictEqual(data.sites[0].initial.timezone, undefined);
            });

            it('initial is used when initial is set', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, timezoneInitial: 'US/Eastern' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(data.sites[0].timezone, undefined);
                assert.strictEqual(typeof data.sites[0].initial.timezone, 'string');
                assert.strictEqual(data.sites[0].initial.timezone, 'US/Eastern');
            });

            it('input is used when input and default are set, input value supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].timezone, 'US/Eastern');
                assert.strictEqual(data.sites[0].initial.timezone, undefined);
            });

            it('default is used when input and default are set, input value not supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Timezone\nTest1,';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].timezone, '_default');
                assert.strictEqual(data.sites[0].initial.timezone, undefined);
            });

            it('default is used when input and default are set, timezone input column not defined', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site\nTest1';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'timezone',
                        timezoneDefault: '_default',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].timezone, '_default');
                assert.strictEqual(data.sites[0].initial.timezone, undefined);
            });

            it('input is used and initial is set when input, default, and initial are set and supplied', async () => {
                const filePath = getFilePath('csv');
                const text = 'Site,Timezone\nTest1,US/Eastern';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        timezoneInput: 'Timezone',
                        timezoneDefault: '_default',
                        timezoneInitial: 'US/Pacific',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields[0], 'timezone');
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(data.sites[0].timezone, 'US/Eastern');
                assert.strictEqual(data.sites[0].initial.timezone, 'US/Pacific');
            });
        });

        describe('include', () => {
            it('input is used when include is set as string', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, include: 'Custom' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(typeof data.sites[0].Custom, 'string');
                assert.strictEqual(data.sites[0].Custom, 'Yellow');
                assert.strictEqual(data.sites[0].initial.Custom, undefined);
                assert.strictEqual(data.sites[0].custom, undefined);
            });

            it('input is used when include is set as array', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom\nTest1,Yellow';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, include: ['Custom'] },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(typeof data.sites[0].Custom, 'string');
                assert.strictEqual(data.sites[0].Custom, 'Yellow');
                assert.strictEqual(data.sites[0].initial.Custom, undefined);
                assert.strictEqual(data.sites[0].custom, undefined);
            });

            it('input is used when include is set with multiple', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,Custom,Custom2\nTest1,Yellow,Red';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, include: ['Custom', 'Custom2'] },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(typeof data.sites[0].Custom, 'string');
                assert.strictEqual(data.sites[0].Custom, 'Yellow');
                assert.strictEqual(data.sites[0].Custom2, 'Red');
                assert.strictEqual(data.sites[0].initial.Custom, undefined);
                assert.strictEqual(data.sites[0].initial.Custom2, undefined);
                assert.strictEqual(data.sites[0].custom, undefined);
                assert.strictEqual(data.sites[0].custom2, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict not synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,address1\nTest1,123 Main Street';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: { sync: true, inputPath: filePath, include: 'address1' },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 0);
                assert.strictEqual(typeof data.sites[0].address1, 'string');
                assert.strictEqual(data.sites[0].address1, '123 Main Street');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });

            it('input is used when include is set as string - key conflict, conflict synced', async () => {
                const filePath = getFilePath('csv');
                const text = 'User,address1\nTest1,123 Main Street';
                await fs.writeFile(filePath, text);
                const config = {
                    sites: {
                        sync: true,
                        inputPath: filePath,
                        address1Input: 'address1',
                        include: 'address1',
                    },
                };
                const data = { sites: [], remove: { sites: [] } };
                const syncOptions = {};
                ProcessSites(config, data, syncOptions);

                assert.strictEqual(syncOptions.sites, true);
                assert.strictEqual(syncOptions.sitesOptions.fields.length, 1);
                assert.strictEqual(typeof data.sites[0].address1, 'string');
                assert.strictEqual(data.sites[0].address1, '123 Main Street');
                assert.strictEqual(data.sites[0].initial.address1, undefined);
            });
        });
    });
});
