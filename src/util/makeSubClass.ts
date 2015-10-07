export = makeSubClass;




interface SomeClassStatic {
    new(...args): SomeClass;
}
interface SomeClass {
}


function subclassTemp(SuperClass: SomeClassStatic) {

    class SubClass extends SuperClass {
    }

    return SubClass;
}








// TODO: doc...
function makeSubClass(SuperClass: Function) {

    // TODO: hacky... see matching comment in makeCallableClass()
    if (SuperClass['isCallableClass']) {


        debugger;



    }
    //else {

        // Normal subclass...
        // TODO: see how TSC does it... __extends and all... 

        // TODO: eg...
        var SubClass = (function (_super) {
            __extends(SubClass, _super);
            function SubClass(...args) {
                return _super.apply(this, args) || this;
            }
            return SubClass;
        })(SuperClass);

        return SubClass;
    //}
}


// TODO: from TSC1.6 emit
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
