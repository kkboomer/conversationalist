"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceImageObjectController = void 0;
const SceneUtils_1 = require("./SceneUtils");
class FaceImageObjectController {
    constructor(imageObject, isIsolated) {
        //@ts-ignore
        this.prevAttachmentPoint = null;
        this.frameSize = new vec2(10.5, 14);
        this.createNewFaceImageObject(imageObject);
        this.imageComponent.enabled = !isIsolated;
    }
    createNewFaceImageObject(imageObject) {
        this.imageObject = imageObject;
        this.imageObjectT = imageObject.getComponent("ScreenTransform");
        this.imageParentT = imageObject.getParent().getComponent("ScreenTransform");
        this.imageComponent = imageObject.getComponent("Component.Image");
    }
    //@ts-ignore
    updateComponents(headComponent, fijiComp, fijiObject) {
        this.headComponent = headComponent;
        this.fijiComponent = fijiComp;
        this.fijiObject = fijiObject;
    }
    updateFaceImageData() {
        let lensCoreObject = SceneUtils_1.SceneUtils.findObjectInLensCore(this.fijiObject);
        let lensComponent = lensCoreObject.getComponent("Component.Image");
        this.imageComponent.flipX = lensComponent.flipX;
        this.imageComponent.flipY = lensComponent.flipY;
        this.imageComponent.pivot = lensComponent.pivot;
        this.imageComponent.stretchMode = lensComponent.stretchMode;
        let material = lensComponent.mainMaterial;
        if (material) {
            if (!material.isSame(this.imageComponent.mainMaterial)) {
                this.imageComponent.mainMaterial = material;
            }
        }
        let fijiObjectRotation = this.fijiObject.localTransform.rotation;
        let objectRotation = lensCoreObject.getTransform().getLocalRotation().toEulerAngles();
        this.imageObjectT.rotation = quat.fromEulerAngles(fijiObjectRotation.x * Math.PI / 180, fijiObjectRotation.y * Math.PI / 180, 0);
        this.imageParentT.rotation = quat.fromEulerAngles(0, 0, objectRotation.z);
    }
    setWorldPosition(screenPos) {
    }
    setFijiObjectLocalPosition(screenPos) {
        //@ts-ignore
        let fijiObjectT = this.fijiObject.localTransform;
        let position = fijiObjectT.position;
        position.x = screenPos.x * this.frameSize.x;
        position.y = screenPos.y * this.frameSize.y;
        fijiObjectT.position = position;
        this.fijiObject.localTransform = fijiObjectT;
    }
    setRotation(newRot, angle) {
        //@ts-ignore
        let lookAtComponent = this.fijiObject.getComponent("LookAtComponent");
        if (lookAtComponent) {
            let curQuat = lookAtComponent.offsetRotation;
            let newQuat = quat.fromEulerAngles(0, 0, angle);
            lookAtComponent.offsetRotation = curQuat.multiply(newQuat);
        }
        else {
            let eulerAngles = newRot.toEulerAngles();
            let prevRot = this.imageObjectT.rotation.toEulerAngles();
            newRot = quat.fromEulerAngles(prevRot.x, prevRot.y, eulerAngles.z);
            //@ts-ignore
            let fijiObjectT = this.fijiObject.localTransform;
            fijiObjectT.rotation = newRot.toEulerAngles().uniformScale(180 / Math.PI);
            this.fijiObject.localTransform = fijiObjectT;
        }
    }
    setScale(newScale) {
        //@ts-ignore
        let fijiObjectT = this.fijiObject.localTransform;
        fijiObjectT.scale = newScale;
        this.fijiObject.localTransform = fijiObjectT;
    }
    updateAttachmentPoint() {
        this.prevAttachmentPoint = this.headComponent.attachmentPoint;
    }
    localToScreenPosition() {
        //@ts-ignore
        let fijiObjectT = this.fijiObject.localTransform;
        let position = fijiObjectT.position;
        return new vec2(position.x / this.frameSize.x, position.y / this.frameSize.y);
    }
    setIsolationStatus(status) {
        this.imageComponent.enabled = !status;
    }
    get isSameAttachmentPoint() {
        return this.headComponent.attachmentPoint === this.prevAttachmentPoint;
    }
    //@ts-ignore
    get attachmentPoint() {
        return this.headComponent.attachmentPoint;
    }
    get isDetached() {
        //@ts-ignore
        let fijiObjectT = this.fijiObject.localTransform;
        let position = fijiObjectT.position;
        return !position.equal(vec3.zero());
    }
    //@ts-ignore
    get headComp() {
        return this.headComponent;
    }
    hide() {
        // this.faceImageObject.enabled = false;
    }
    show() {
        // this.faceImageObject.enabled = true;
    }
    //@ts-ignore
    get lsObject() {
        return this.fijiObject;
    }
    get rotation() {
        return this.fijiObject.localTransform.rotation;
    }
    get scale() {
        return this.fijiObject.localTransform.scale;
    }
    get isValid() {
        return !isNull(this.fijiObject) && !isNull(this.fijiComponent) && this.fijiObject.enabled && this.fijiComponent.enabled;
    }
}
exports.FaceImageObjectController = FaceImageObjectController;
//# sourceMappingURL=FaceImageObjectController.js.map