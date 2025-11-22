"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenObjectController = void 0;
const LensRegion_1 = require("../Common/Utilities/LensRegion/LensRegion");
class ScreenObjectController {
    constructor(screenObject, isIsolated) {
        this.isOneChild = false;
        this.usesLocalTransform = false;
        this.isIsolated = false;
        this.onTouchStartCallback = [];
        this.onTouchEndCallback = [];
        this.onTouchMoveCallback = [];
        this.onPositionChangedCallback = [];
        this.onRotationChangedCallback = [];
        this.onScaleChangedCallback = [];
        this.isIsolated = isIsolated;
        this.createNewGizmo(screenObject);
    }
    createNewGizmo(screenObject) {
        let newScreenObj = screenObject.getParent().copyWholeHierarchyAndAssets(screenObject);
        newScreenObj.enabled = true;
        this.gizmoObject = newScreenObj;
        this.gizmo = this.gizmoObject.getComponent("Component.ScriptComponent");
        this.interactionComp = newScreenObj.getComponent("Component.InteractionComponent");
        this.screenT = newScreenObj.getComponent("Component.ScreenTransform");
        this.parentScreenT = newScreenObj.getParent().getComponent("ScreenTransform");
        this.screenT.position = new vec3(0, 0, -1);
        this.setUpEvents(this.interactionComp);
        this.setCallbacks();
    }
    setUpEvents(interactionComp) {
        let prevTouchPos;
        let touchStarted = false;
        interactionComp.onHoverStart.add((eventData) => {
            if (this.isIsolated) {
                return;
            }
            if (this.screenT.containsScreenPoint(eventData.position)) {
                this.gizmo.onHoverStart();
            }
        });
        interactionComp.onHover.add((eventData) => {
            if (this.isIsolated) {
                return;
            }
            if (this.screenT.containsScreenPoint(eventData.position)) {
                this.gizmo.onHoverStart();
            }
            else {
                this.gizmo.onHoverEnd();
            }
        });
        interactionComp.onHoverEnd.add((eventData) => {
            if (this.isIsolated) {
                return;
            }
            this.gizmo.onHoverEnd();
        });
        interactionComp.onTouchStart.add((eventData) => {
            if (LensRegion_1.LensRegion.isBusy || this.isIsolated) {
                return;
            }
            touchStarted = true;
            prevTouchPos = eventData.position;
            this.onTouchStartCallback.forEach((callback) => {
                callback(eventData.position);
            });
        });
        interactionComp.onTouchMove.add((eventData) => {
            if (LensRegion_1.LensRegion.isBusy || !touchStarted || this.isIsolated) {
                touchStarted = false;
                return;
            }
            let diff = eventData.position.sub(prevTouchPos);
            this.onTouchMoveCallback.forEach((callback) => {
                callback(diff);
            });
            prevTouchPos = eventData.position;
        });
        interactionComp.onTouchEnd.add((eventData) => {
            if (this.isIsolated) {
                return;
            }
            touchStarted = false;
            this.onTouchEndCallback.forEach((callback) => {
                callback(eventData.position);
            });
        });
    }
    setCallbacks() {
        this.gizmo.onTouchStartCallback = (position) => {
            this.onTouchStartCallback.forEach((callback) => {
                callback(position);
            });
        };
        this.gizmo.onTouchEndCallback = (position) => {
            this.onTouchEndCallback.forEach((callback) => {
                callback(position);
            });
        };
        this.gizmo.onPositionChanged = (newPos) => {
            this.onPositionChangedCallback.forEach((callback) => {
                callback(newPos);
            });
        };
        this.gizmo.onRotationChanged = (newRot, angle) => {
            this.onRotationChangedCallback.forEach((callback) => {
                callback(newRot, angle);
            });
        };
        this.gizmo.onScaleChanged = (newScale) => {
            this.onScaleChangedCallback.forEach((callback) => {
                callback(newScale);
            });
        };
    }
    updateZPoz(screenTransform, newZPos) {
        let curPosition = screenTransform.position;
        curPosition.z = newZPos;
        screenTransform.position = curPosition;
    }
    //@ts-ignore
    updateScreenObjectData(newRot, newScale, lensComponent) {
        if (this.screenT.pivot.distance(lensComponent.pivot) > 0.0001) {
            let prevPos = this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(vec2.zero()));
            let pivotDiff = lensComponent.pivot.sub(this.screenT.pivot);
            this.screenT.pivot = lensComponent.pivot;
            let newPos = this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(pivotDiff));
            let newCenter = this.screenT.anchors.getCenter().add(prevPos.sub(newPos));
            this.screenT.anchors.setCenter(newCenter);
        }
        this.gizmo.updateGizmoData(newRot, newScale.uniformScale(0.2), lensComponent.pivot);
    }
    updateGizmoScale(mainScale) {
        this.gizmo.updateScale(mainScale);
    }
    setNewPosition(screenPos) {
        this.screenT.anchors.setCenter(screenPos.add(this.screenT.anchors.getCenter().sub(this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(this.screenT.pivot)))));
    }
    setPositionDiff(diff) {
        if (this.isIsolated) {
            return;
        }
        let screenPos = this.parentScreenT.localPointToScreenPoint(this.screenT.anchors.getCenter());
        this.screenT.anchors.setCenter(this.screenT.screenPointToParentPoint(screenPos.add(diff)));
    }
    setIsolationStatus(status) {
        this.isIsolated = status;
    }
    addOnTouchStartCallback(callback) {
        this.onTouchStartCallback.push(callback);
    }
    addOnTouchEndCallback(callback) {
        this.onTouchEndCallback.push(callback);
    }
    addOnTouchMoveCallback(callback) {
        this.onTouchMoveCallback.push(callback);
    }
    addOnPositionChangedCallback(callback) {
        this.onPositionChangedCallback.push(callback);
    }
    addOnRotationChangedCallback(callback) {
        this.onRotationChangedCallback.push(callback);
    }
    addOnScaleChangedCallback(callback) {
        this.onScaleChangedCallback.push(callback);
    }
    get center() {
        return this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(this.screenT.pivot));
    }
    get centerScreenPos() {
        return this.screenT.localPointToScreenPoint(this.screenT.pivot);
    }
    get isDetached() {
        return !this.isOneChild || this.usesLocalTransform;
    }
    get gizmoImageObject() {
        return this.gizmoObject.getChild(0);
    }
    setHeadComponentStatus(hasOneChild, usesLocalTransform) {
        this.isOneChild = hasOneChild;
        this.usesLocalTransform = usesLocalTransform;
    }
    setDefault() {
        this.gizmo.setDefault();
        this.updateZPoz(this.screenT, -1);
    }
    setActive() {
        if (this.isIsolated) {
            return;
        }
        this.gizmo.setActive();
        this.gizmo.onHoverEnd();
        this.updateZPoz(this.screenT, -0.9);
    }
    hide() {
        this.gizmoObject.enabled = false;
    }
    show() {
        this.gizmoObject.enabled = true;
    }
}
exports.ScreenObjectController = ScreenObjectController;
//# sourceMappingURL=ScreenObjectController.js.map