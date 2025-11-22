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
// @input Component.ScriptComponent main
// @input Component.ScriptComponent snappingScript
// @input SceneObject editorObject
// @input Component.ScreenTransform screenTransform
// @input SceneObject effects
// @input Component.Image editorImage
// @input float editorFrameWidth
// @input float editorFrameHeight
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/Scripts/Editor/EffectEditor");
Object.setPrototypeOf(script, Module.EffectEditor.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("main", []);
    checkUndefined("snappingScript", []);
    checkUndefined("editorObject", []);
    checkUndefined("screenTransform", []);
    checkUndefined("effects", []);
    checkUndefined("editorImage", []);
    checkUndefined("editorFrameWidth", []);
    checkUndefined("editorFrameHeight", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
