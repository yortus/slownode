import start = require("./start");
import stop = require("./stop");


stop().then(() => start({ pollIntervalMs: 100 }));
    
