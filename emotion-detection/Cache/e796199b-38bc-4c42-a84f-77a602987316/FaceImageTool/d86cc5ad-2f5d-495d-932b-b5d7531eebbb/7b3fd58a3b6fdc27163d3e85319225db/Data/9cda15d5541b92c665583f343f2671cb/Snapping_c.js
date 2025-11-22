if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @input SceneObject greenCircle
// @input SceneObject editorFrame
// @input Component.Camera camera
// @input Component.ScriptComponent lineRenderer
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/Scripts/Editor/Snapping");
Object.setPrototypeOf(script, Module.Snapping.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("greenCircle", []);
    checkUndefined("editorFrame", []);
    checkUndefined("camera", []);
    checkUndefined("lineRenderer", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
