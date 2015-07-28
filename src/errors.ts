export = errors;

var errors = {
	FunctionExists: "The functionId already exists on that topic",
	NoHandler: "This is no handler available for that filter and functionId",
	MustSupplyDbName: "An invalid database name was provided",
	InvalidPollDelay: "An invalid polling delay as provided. Must be >= 50"
}