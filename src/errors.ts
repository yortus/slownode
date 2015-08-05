export = errors;

var errors = {
	FunctionExists: "The functionId already exists on that topic",
	NoHandler: "This is no handler available for that filter and functionId",
	InvalidDatabaseName: "An invalid database name was provided",
	MustBeNumber: "Polling delay must be a number",
	InvalidPollDelay: "An invalid polling delay as provided. Must be >= 50",
	NotInfinity: "Polling delay can not be infinity",
	InvalidConnection: "Invalid connection to database",
	DatabaseInvalid: "Database is in an invalid state and is not compatible with this version",
	MustBeFunction: "Input must be a function",
	MustBeString: "Input must be a string",
	UnableToDeserialise: "Unable to deserialise to a function",
	DidNotParseAsFunction: "Unable to deserialise to a function: The deserialised result was not a function",
	DatabaseInitFailed: "Failed to initialise the database",
	TimedFuncsMustHaveOptions: "Timed functions must be provided options"
}