/**
 * ***  NO CUSTOMIZATIONS ***
 * Make all customization in config.json or config.js.
 * Sync customizations are not to be made to this file.
 * If functionality is not supported via config,
 * open an enhancement request.
 */
const fs = require('fs');

const config = require('../config.json');
//optional config.js
const config_js = fs.existsSync(__dirname + '/../config.js') ? require('../config.js') : {};

const lib = require('./lib');
lib.RunSync(config, config_js);
