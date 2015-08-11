import Types = require('slownode-prev');
import Knex = require('knex');
export = settings;


// TODO: rename to 'globals' or 'state' or ...
var settings = {
    DEBUG: false,
    configuration: <Types.SlowConfig> null,
    connection: <Knex> null,
    flushCallback: <NodeJS.Timer> null
};
