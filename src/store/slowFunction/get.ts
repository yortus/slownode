import Types = require("slownode");
import settings = require("../../settings");
export = get;

function get(functionId: string): Promise<Types.Schema.Function> {
    return settings.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(funcs => funcs[0]);
}
