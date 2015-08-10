import async = require('asyncawait/async');
import await = require('asyncawait/await');
import slow = require('slownode');


var fn = async(() => {
	await (slow.stop());
});


fn();
