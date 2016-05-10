'use strict';





export default class Scope {
    start = 0;
    count = 0;
    depth = 0;
    parent = <Scope> null;
    children = <Scope[]> [];

    addChild() {
        let child = new Scope();
        child.depth = this.depth + 1;
        child.parent = this;
        this.children.push(child);
        return child;
    }
}
