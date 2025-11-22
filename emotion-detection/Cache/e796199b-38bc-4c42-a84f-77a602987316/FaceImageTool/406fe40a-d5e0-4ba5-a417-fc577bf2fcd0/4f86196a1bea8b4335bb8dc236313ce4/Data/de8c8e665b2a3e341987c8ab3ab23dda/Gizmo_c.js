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
// @input SceneObject frameObject
// @input Asset.Material frameMaterial
// @input SceneObject[] pointsParent
// @input SceneObject centerPoint
// @input SceneObject[] manipulatePoints
// @input SceneObject[] rotationPoints
// @input SceneObject[] horizontalLines
// @input SceneObject[] verticalLines
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/Scripts/Editor/Gizmo");
Object.setPrototypeOf(script, Module.Gizmo.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("frameObject", []);
    checkUndefined("frameMaterial", []);
    checkUndefined("pointsParent", []);
    checkUndefined("centerPoint", []);
    checkUndefined("manipulatePoints", []);
    checkUndefined("rotationPoints", []);
    checkUndefined("horizontalLines", []);
    checkUndefined("verticalLines", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
