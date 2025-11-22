"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gizmo = void 0;
var __selfType = requireType("./Gizmo");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SharedContent_1 = require("../Shared/SharedContent");
const LensRegion_1 = require("../Common/Utilities/LensRegion/LensRegion");
let Gizmo = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Gizmo = _classThis = class extends _classSuper {
        onAwake() {
            this.screenT = this.getSceneObject().getComponent("Component.ScreenTransform");
            this.parentScreenT = this.getSceneObject().getParent().getComponent("Component.ScreenTransform");
            this.anchors = this.screenT.anchors;
            this.deviceCameraTexture = SharedContent_1.SharedContent.getInstance().deviceCameraTexture;
            this.oppositeIdxs = [1, 0, 3, 2, 5, 4, 7, 6];
            this.adjacentIdxs[0] = { "x": null, "y": 1 };
            this.adjacentIdxs[1] = { "x": null, "y": 0 };
            this.adjacentIdxs[2] = { "x": 3, "y": null };
            this.adjacentIdxs[3] = { "x": 2, "y": null };
            this.adjacentIdxs[4] = { "x": 6, "y": 7 };
            this.adjacentIdxs[5] = { "x": 7, "y": 6 };
            this.adjacentIdxs[6] = { "x": 4, "y": 5 };
            this.adjacentIdxs[7] = { "x": 5, "y": 4 };
            this.faceRegionScale[FaceInsetRegion.LeftEye] = new vec2(0.54, 0.19);
            this.faceRegionScale[FaceInsetRegion.RightEye] = new vec2(0.54, 0.19);
            this.faceRegionScale[FaceInsetRegion.Mouth] = new vec2(0.66, 0.21);
            this.faceRegionScale[FaceInsetRegion.Nose] = new vec2(0.5, 0.5);
            this.faceRegionScale[FaceInsetRegion.Face] = new vec2(1.5, 1.2);
            this.initSize = new vec2(0.502, 0.28);
            this.prevFaceRegion = FaceInsetRegion.Mouth;
            this.anchors.setSize(this.initSize);
            this.centerPointT = this.centerPoint.getComponent("Component.ScreenTransform");
            this.manipulatePoints.forEach((obj, idx) => {
                let interactionComponent = this.createInteractionComponent(obj);
                this.setUpTouchEvents(interactionComponent, idx, this.onTMove);
                let screenTransform = obj.getComponent("Component.ScreenTransform");
                this.updateZPoz(screenTransform, 0.2);
                this.manipulatePointsT.push(screenTransform);
            });
            this.rotationPoints.forEach((obj, idx) => {
                let interactionComponent = this.createInteractionComponent(obj);
                this.setUpTouchEvents(interactionComponent, idx, this.onTMoveRotation);
                let screenTransform = obj.getComponent("Component.ScreenTransform");
                this.updateZPoz(screenTransform, 0.1);
                this.rotationPointsT.push(screenTransform);
            });
            this.horizontalLines.forEach((obj) => {
                let screenTransform = obj.getComponent("Component.ScreenTransform");
                this.updateZPoz(screenTransform, 0.1);
                this.horizontalLinesT.push(screenTransform);
            });
            this.verticalLines.forEach((obj) => {
                let screenTransform = obj.getComponent("Component.ScreenTransform");
                this.updateZPoz(screenTransform, 0.1);
                this.verticalLinesT.push(screenTransform);
            });
        }
        updateGizmoData(newRot, newScale, newPivot) {
            if (this.touchIsBusy) {
                return;
            }
            // this.screenT.rotation = quat.fromEulerAngles(0, 0, newRot.z * Math.PI / 180);
            let prevPivotPos = this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(this.screenT.pivot));
            let newSize = new vec2(newScale.x * this.initSize.x, newScale.y * this.initSize.y);
            this.anchors.setSize(newSize);
            let newPivotPos = this.screenT.screenPointToParentPoint(this.screenT.localPointToScreenPoint(this.screenT.pivot));
            let newCenter = this.screenT.anchors.getCenter().add(prevPivotPos.sub(newPivotPos));
            this.screenT.anchors.setCenter(newCenter);
            this.centerPointT.anchors.setCenter(newPivot);
        }
        createInteractionComponent(obj) {
            obj.createComponent("Component.InteractionComponent");
            let interactionComponent = obj.getComponent("Component.InteractionComponent");
            interactionComponent.setCamera(SharedContent_1.SharedContent.getInstance().orthoCamera);
            interactionComponent.isFilteredByDepth = true;
            interactionComponent.addMeshVisual(obj.getComponent("Component.Image"));
            interactionComponent.enabled = true;
            return interactionComponent;
        }
        setUpTouchEvents(interactionComponent, idx, onTMove) {
            let prevTouchPos;
            let curTouchId = -1;
            interactionComponent.onTouchStart.add((eventData) => {
                if (this.touchIsBusy || LensRegion_1.LensRegion.isBusy) {
                    return;
                }
                this.touchIsBusy = true;
                prevTouchPos = eventData.position;
                curTouchId = eventData.touchId;
                this.onTouchStartCallback(eventData.position);
            });
            interactionComponent.onTouchMove.add((eventData) => {
                if (eventData.touchId != curTouchId || LensRegion_1.LensRegion.isBusy) {
                    return;
                }
                onTMove(this, eventData.position, prevTouchPos, idx);
                prevTouchPos = eventData.position;
            });
            interactionComponent.onTouchEnd.add((eventData) => {
                if (eventData.touchId != curTouchId) {
                    return;
                }
                curTouchId = -1;
                this.touchIsBusy = false;
                this.onTouchEndCallback(eventData.position);
            });
        }
        onTMove(_this, position, prevTouchPosition, idx) {
            let horizontalData = null;
            let verticalData = null;
            let newPos = null;
            var prevPivot = _this.screenT.pivot;
            let prevPos1 = _this.screenT.screenPointToParentPoint(_this.screenT.localPointToScreenPoint(vec2.zero()));
            _this.screenT.pivot = vec2.zero();
            let newPos1 = _this.screenT.screenPointToParentPoint(_this.screenT.localPointToScreenPoint(vec2.zero()));
            let newCenter1 = _this.screenT.anchors.getCenter().add(prevPos1.sub(newPos1));
            _this.screenT.anchors.setCenter(newCenter1);
            if (_this.adjacentIdxs[idx].x != null) {
                horizontalData = _this.getNewSizeData(idx, _this.adjacentIdxs[idx].x, position);
            }
            if (_this.adjacentIdxs[idx].y != null) {
                verticalData = _this.getNewSizeData(idx, _this.adjacentIdxs[idx].y, position);
            }
            if (horizontalData && horizontalData.isValid && verticalData && verticalData.isValid) {
                newPos = position;
            }
            else if (horizontalData && horizontalData.isValid) {
                newPos = horizontalData.newPos;
            }
            else if (verticalData && verticalData.isValid) {
                newPos = verticalData.newPos;
            }
            else {
                return;
            }
            let oppositePos = _this.screenT.localPointToScreenPoint(_this.manipulatePointsT[_this.oppositeIdxs[idx]].anchors.getCenter());
            let newCenter = newPos.add(oppositePos).uniformScale(0.5);
            _this.anchors.setCenter(_this.screenT.screenPointToParentPoint(newCenter));
            let prevSize = _this.anchors.getSize();
            if (horizontalData && horizontalData.isValid) {
                prevSize.x *= horizontalData.newDist / horizontalData.prevDist;
            }
            if (verticalData && verticalData.isValid) {
                prevSize.y *= verticalData.newDist / verticalData.prevDist;
            }
            _this.anchors.setSize(prevSize);
            let curScale = _this.screenT.scale;
            curScale.x = prevSize.x / _this.initSize.x;
            curScale.y = prevSize.y / _this.initSize.y;
            let prevPos2 = _this.screenT.screenPointToParentPoint(_this.screenT.localPointToScreenPoint(vec2.zero()));
            _this.screenT.pivot = prevPivot;
            let newPos2 = _this.screenT.screenPointToParentPoint(_this.screenT.localPointToScreenPoint(vec2.zero()));
            let newCenter2 = _this.screenT.anchors.getCenter().add(prevPos2.sub(newPos2));
            _this.screenT.anchors.setCenter(newCenter2);
            _this.onPositionChanged(newCenter);
            _this.onScaleChanged(curScale);
        }
        getNewSizeData(idx, oppositeIdx, newPosition) {
            let pointPos = this.screenT.localPointToScreenPoint(this.manipulatePointsT[idx].anchors.getCenter());
            let oppositePointPos = this.screenT.localPointToScreenPoint(this.manipulatePointsT[oppositeIdx].anchors.getCenter());
            let newPos = new vec2(newPosition.x, newPosition.y);
            let aspect = this.deviceCameraTexture.getHeight() / this.deviceCameraTexture.getWidth();
            pointPos.y *= aspect;
            oppositePointPos.y *= aspect;
            newPos.y *= aspect;
            let forward = pointPos.sub(oppositePointPos);
            forward = forward.normalize();
            let right = new vec2(forward.y, -forward.x);
            let prevDist = pointPos.distance(oppositePointPos);
            let dir = newPos.sub(pointPos);
            let dist = newPos.distance(pointPos);
            dist = this.calculateDistanceToOppositeSide(forward, dir, dist);
            newPos = pointPos.add(forward.uniformScale(dist));
            let newDist = newPos.distance(oppositePointPos);
            let isValid = (newDist > 0.01) && (this.isRightSide(right, oppositePointPos, pointPos) == this.isRightSide(right, oppositePointPos, newPos));
            newPos.y /= aspect;
            return { "isValid": isValid, "newPos": newPos, "prevDist": prevDist, "newDist": newDist };
        }
        onTMoveRotation(_this, position, prevTouchPosition, idx) {
            // let objCenter = _this.parentScreenT.localPointToScreenPoint(_this.anchors.getCenter());
            let objCenter = _this.centerPointT.localPointToScreenPoint(vec2.zero());
            let dir = prevTouchPosition.sub(objCenter);
            dir = dir.normalize();
            let newDir = position.sub(objCenter);
            newDir = newDir.normalize();
            let angle = _this.getAngleBetweenVectors([newDir.x, newDir.y], [dir.x, dir.y]);
            let curAngle = _this.screenT.rotation.toEulerAngles().z + angle;
            let newRot = quat.fromEulerAngles(0, 0, curAngle);
            _this.screenT.rotation = newRot;
            _this.onRotationChanged(newRot, angle);
        }
        updateZPoz(screenTransform, newZPos) {
            let curPosition = screenTransform.position;
            curPosition.z = newZPos;
            screenTransform.position = curPosition;
        }
        setDefault() {
            this.pointsParent.forEach((obj) => {
                obj.enabled = false;
            });
            this.frameMaterial.mainPass.Active = false;
        }
        setActive() {
            this.pointsParent.forEach((obj) => {
                obj.enabled = true;
            });
            this.frameMaterial.mainPass.Active = true;
        }
        onHoverStart() {
            this.frameMaterial.mainPass.Hover = true;
        }
        onHoverEnd() {
            this.frameMaterial.mainPass.Hover = false;
        }
        updateScale(mainScale) {
            let newScale = vec3.one().uniformScale(1 / mainScale);
            this.centerPointT.scale = newScale;
            this.manipulatePointsT.forEach((curScreenT) => {
                curScreenT.scale = newScale;
            });
            this.rotationPointsT.forEach((curScreenT) => {
                curScreenT.scale = newScale;
            });
            this.horizontalLinesT.forEach((curScreenT) => {
                let curScale = curScreenT.scale;
                curScale.y = newScale.y;
                curScreenT.scale = curScale;
            });
            this.verticalLinesT.forEach((curScreenT) => {
                let curScale = curScreenT.scale;
                curScale.x = newScale.x;
                curScreenT.scale = curScale;
            });
        }
        calculateDistanceToOppositeSide(forward, dir, dist) {
            let angle = forward.angleTo(dir);
            let curDist = Math.cos(angle) * dist;
            return curDist;
        }
        getAngleBetweenVectors(vector1, vector2) {
            let dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
            let crossProduct = vector1[0] * vector2[1] - vector1[1] * vector2[0];
            let magnitude1 = Math.sqrt(vector1[0] * vector1[0] + vector1[1] * vector1[1]);
            let magnitude2 = Math.sqrt(vector2[0] * vector2[0] + vector2[1] * vector2[1]);
            let cosTheta = dotProduct / (magnitude1 * magnitude2);
            if (cosTheta > 1) {
                return 0;
            }
            let radians = Math.acos(cosTheta);
            let sign = 1;
            if (crossProduct < 0) {
                sign = -1;
            }
            let degrees = sign * radians * (180 / Math.PI);
            if (degrees < 0) {
                degrees += 360;
            }
            return sign * radians;
        }
        isRightSide(right, pos, pt) {
            let x1, x2, x3, y1, y2, y3, D;
            x1 = pos.x;
            y1 = pos.y;
            x2 = 0;
            y2 = 0;
            x3 = pt.x;
            y3 = pt.y;
            D = (x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1);
            return D < 0;
        }
        __initialize() {
            super.__initialize();
            this.onTouchStartCallback = (screenPos) => { };
            this.onTouchEndCallback = (screenPos) => { };
            this.onPositionChanged = () => { };
            this.onRotationChanged = () => { };
            this.onScaleChanged = () => { };
            this.oppositeIdxs = [];
            this.adjacentIdxs = {};
            this.manipulatePointsT = [];
            this.rotationPointsT = [];
            this.horizontalLinesT = [];
            this.verticalLinesT = [];
            this.faceRegionScale = {};
            this.touchIsBusy = false;
        }
    };
    __setFunctionName(_classThis, "Gizmo");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Gizmo = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Gizmo = _classThis;
})();
exports.Gizmo = Gizmo;
//# sourceMappingURL=Gizmo.js.map