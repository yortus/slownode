var errors = {
    FunctionExists: "The functionId already exists on that topic",
    NoHandler: "This is no handler available for that filter and functionId",
    InvalidDatabaseName: "An invalid database name was provided",
    MustBeNumber: "Polling delay must be a number",
    InvalidPollDelay: "An invalid polling delay as provided. Must be >= 50",
    NotInfinity: "Polling delay can not be infinity",
    InvalidConnection: "Invalid connection to database"
};
module.exports = errors;
//# sourceMappingURL=errors.js.map