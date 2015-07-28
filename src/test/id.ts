export = makeId;

function makeId() {
	return function() { return __dirname };
}