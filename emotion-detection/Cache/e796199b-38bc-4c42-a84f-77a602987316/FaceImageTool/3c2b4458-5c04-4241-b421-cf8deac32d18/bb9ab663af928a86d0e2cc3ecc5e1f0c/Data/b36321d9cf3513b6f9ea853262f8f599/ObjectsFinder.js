"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectsFinder = void 0;
class ObjectsFinder {
    constructor() {
        this.faceImageObjects = {};
        this.headObjects = {};
    }
    getObjectsData() {
        //@ts-ignore
        if (typeof Editor === 'undefined') {
            return { faceImageObjects: {}, headObjects: {} };
        }
        this.faceImageObjects = {};
        this.headObjects = {};
        //@ts-ignore
        let headComponents = Editor.context.scene.findComponents("Head");
        headComponents.forEach((headComp) => {
            let prevLength = Object.keys(this.faceImageObjects).length;
            this.findFaceImageComponents(headComp.sceneObject, headComp);
            let curLength = Object.keys(this.faceImageObjects).length;
            this.headObjects[headComp.sceneObject.id.toString()] = (curLength - prevLength) <= 1;
        });
        return { faceImageObjects: this.faceImageObjects, headObjects: this.headObjects };
    }
    //@ts-ignore
    findFaceImageComponents(obj, headComp) {
        //@ts-ignore
        let faceImageComponent = obj.getComponent("Image");
        if (faceImageComponent) {
            this.faceImageObjects[obj.id.toString()] = {
                "sceneObject": obj,
                "faceImageComponent": faceImageComponent,
                "headComponent": headComp
            };
        }
        for (let i = 0; i < obj.getChildrenCount(); i++) {
            this.findFaceImageComponents(obj.getChildAt(i), headComp);
        }
    }
}
exports.ObjectsFinder = ObjectsFinder;
//# sourceMappingURL=ObjectsFinder.js.map