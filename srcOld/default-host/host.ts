'use strict';
import CreateGlobalObject from './create-global-object';
import Task from '../task';
import TaskRunner from '../task-runner';





export default class Host {


    run(task: Task) {
        let global = CreateGlobalObject();
        let runner = new TaskRunner(task, global);
        while (true) {
            let result = runner.step();
            if (result === true) {
                // TODO: ...
            }
            if (result instanceof Error) {
                // TODO: ...
            }

            // TODO: resolve any promises...
            
        }
    }



}
