import Types = require('slownode');
import Knex = require('knex');
export = settings;


// TODO: rename to 'globals' or 'state' or ...
var settings = {
    DEBUG: false,
    configuration: <Types.ISlowConfig> null,
    connection: <Knex> null,
    flushCallback: <NodeJS.Timer> null
};
