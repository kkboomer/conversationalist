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
exports.EffectEditor = void 0;
var __selfType = requireType("./EffectEditor");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SelectionListener_1 = require("./SelectionListener");
const Data_1 = require("../Shared/Data");
const ObjectsFinder_1 = require("./ObjectsFinder");
const ScreenObjectController_1 = require("./ScreenObjectController");
const FaceImageObjectController_1 = require("./FaceImageObjectController");
const KeyboardListener_1 = require("./KeyboardListener");
const PositionConverter_1 = require("./PositionConverter");
const LensRegion_1 = require("../Common/Utilities/LensRegion/LensRegion");
let EffectEditor = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var EffectEditor = _classThis = class extends _classSuper {
        onAwake() {
            let resolution = this.editorImage.mainPass.baseTex.control.resolution;
            this.renderTargetRatio = resolution.y / resolution.x;
            this.frameRatio = this.editorFrameHeight / (this.editorFrameWidth * this.renderTargetRatio);
            this.editorFrameRatio = this.editorFrameHeight / this.editorFrameWidth;
            this.effectsT = this.effects.getTransform();
            this.initEffectsScale = this.effectsT.getLocalScale();
            this.objectsFinder = new ObjectsFinder_1.ObjectsFinder();
            this.main.addPinchOnUpdateCallback(() => {
                this.updateGizmoScale();
                this.updateSnappingCirclesScale();
            });
            let candideEvent = this.createEvent("CandideUpdatedEvent");
            candideEvent.bind(() => {
                this.points = candideEvent.points2d;
                this.setupSelectionListener();
                candideEvent.enabled = false;
            });
        }
        //@ts-ignore
        getFirstSelectedObject() {
            return this.selectedObjects[Object.keys(this.selectedObjects)[0]];
        }
        setupSelectionListener() {
            this.selectionListener = new SelectionListener_1.SelectionListener(this);
            this.selectionListener.setOnSelectionUpdate(() => {
                this.update();
            });
            this.createEvent("UpdateEvent").bind(() => {
                this.copyTo();
            });
        }
        update() {
            this.selectedObjects = this.selectionListener.getSelectedObjects();
        }
        copyTo() {
            if (this.touchStarted) {
                return;
            }
            for (let objId of Object.keys(this.faceImageObjects)) {
                this.faceImageObjects[objId].screenObjectController.hide();
                // this.faceImageObjects[objId].faceImageObjectController.hide();
            }
            let objs = this.objectsFinder.getObjectsData();
            for (let objId of Object.keys(objs.faceImageObjects)) {
                if (!this.faceImageObjects[objId]) {
                    this.createNewFaceImage(objId);
                    this.faceImageObjects[objId].faceImageObjectController.updateComponents(objs.faceImageObjects[objId].headComponent, objs.faceImageObjects[objId].faceImageComponent, objs.faceImageObjects[objId].sceneObject);
                    this.faceImageObjects[objId].faceImageObjectController.updateFaceImageData();
                    this.faceImageObjects[objId].screenObjectController.updateScreenObjectData(this.faceImageObjects[objId].faceImageObjectController.rotation, this.faceImageObjects[objId].faceImageObjectController.scale, objs.faceImageObjects[objId].faceImageComponent);
                }
                this.faceImageObjects[objId].faceImageObjectController.updateComponents(objs.faceImageObjects[objId].headComponent, objs.faceImageObjects[objId].faceImageComponent, objs.faceImageObjects[objId].sceneObject);
                this.faceImageObjects[objId].screenObjectController.setHeadComponentStatus(objs.headObjects[objs.faceImageObjects[objId].headComponent.sceneObject.id.toString()], this.faceImageObjects[objId].faceImageObjectController.isDetached);
                if (this.faceImageObjects[objId].faceImageObjectController.isValid) {
                    if (!this.faceImageObjects[objId].faceImageObjectController.isSameAttachmentPoint) {
                        this.setFaceRegionCoords(objId, this.getBarycentricVertex(objId));
                        this.faceImageObjects[objId].faceImageObjectController.updateAttachmentPoint();
                    }
                    else {
                        if (this.faceImageObjects[objId].screenObjectController.isDetached) {
                            this.setFaceRegionCoords(objId, this.getBarycentricVertex(objId));
                        }
                    }
                    this.faceImageObjects[objId].screenObjectController.show();
                    this.faceImageObjects[objId].faceImageObjectController.show();
                    if (this.selectedObjects[objId]) {
                        this.faceImageObjects[objId].screenObjectController.setActive();
                        this.faceImageObjects[objId].faceImageObjectController.updateFaceImageData();
                        this.faceImageObjects[objId].screenObjectController.updateScreenObjectData(this.faceImageObjects[objId].faceImageObjectController.rotation, this.faceImageObjects[objId].faceImageObjectController.scale, objs.faceImageObjects[objId].faceImageComponent);
                    }
                    else {
                        this.faceImageObjects[objId].screenObjectController.setDefault();
                    }
                }
            }
        }
        createNewFaceImage(objId) {
            this.offsets[objId] = vec2.zero();
            this.faceImageObjects[objId] = {};
            this.faceImageObjects[objId].screenObjectController = new ScreenObjectController_1.ScreenObjectController(this.screenTransform.getSceneObject(), this.isIsolationMode);
            this.faceImageObjects[objId].faceImageObjectController = new FaceImageObjectController_1.FaceImageObjectController(this.faceImageObjects[objId].screenObjectController.gizmoImageObject, this.isIsolationMode);
            this.faceImageObjects[objId].screenObjectController.addOnTouchStartCallback((position) => {
                this.touchStarted = true;
                if (!this.selectedObjects[objId]) {
                    //@ts-ignore
                    if (!KeyboardListener_1.KeyboardListener.isKeyPressed(Keys.Key_Control)) {
                        this.setDefaultToPoints();
                        this.selectionListener.setNewSelectedObject(this.faceImageObjects[objId].faceImageObjectController.lsObject);
                    }
                    else {
                        this.selectionListener.addSelectedObject(this.faceImageObjects[objId].faceImageObjectController.lsObject);
                    }
                    this.faceImageObjects[objId].screenObjectController.setActive();
                }
            });
            this.faceImageObjects[objId].screenObjectController.addOnTouchEndCallback(() => {
                this.touchStarted = false;
                if (this.isSnappingMode) {
                    this.snappingScript.hide();
                }
            });
            this.faceImageObjects[objId].screenObjectController.addOnTouchMoveCallback((diff) => {
                if (this.isSnappingMode && !this.snappingScript.isShown) {
                    this.snappingScript.show();
                    Object.keys(this.faceImageObjects).forEach((idx) => {
                        if (!this.selectedObjects[idx] && this.faceImageObjects[idx].faceImageObjectController.isValid) {
                            this.snappingScript.addSnappingPoint(this.faceImageObjects[idx].screenObjectController.center);
                        }
                    });
                }
                if (this.isSnappingMode) {
                    let pointsData = [];
                    Object.keys(this.selectedObjects).forEach((idx, i) => {
                        if (!this.faceImageObjects[idx]) {
                            return;
                        }
                        if (this.isSymmetricMode && objId != idx) {
                            pointsData.push({
                                pointPos: this.faceImageObjects[idx].screenObjectController.centerScreenPos,
                                isSymmetrical: true
                            });
                        }
                        else {
                            pointsData.push({
                                pointPos: this.faceImageObjects[idx].screenObjectController.centerScreenPos,
                                isSymmetrical: false
                            });
                        }
                    });
                    diff = this.snappingScript.checkNewDiff(pointsData, diff);
                }
                this.manipulateSelectedPoints(objId, diff);
            });
            this.faceImageObjects[objId].screenObjectController.addOnPositionChangedCallback((newPos) => {
                this.setFaceImagePosition(objId, this.faceImageObjects[objId].screenObjectController.center);
            });
            this.faceImageObjects[objId].screenObjectController.addOnRotationChangedCallback((newRot, angle) => {
                this.faceImageObjects[objId].faceImageObjectController.setRotation(newRot, angle);
            });
            this.faceImageObjects[objId].screenObjectController.addOnScaleChangedCallback((newScale) => {
                this.faceImageObjects[objId].faceImageObjectController.setScale(newScale.uniformScale(5));
            });
        }
        manipulateSelectedPoints(objId, diff) {
            Object.keys(this.selectedObjects).forEach((idx, i) => {
                if (!this.faceImageObjects[idx]) {
                    return;
                }
                let xRatio = 1;
                if (this.isSymmetricMode && objId != idx) {
                    xRatio = -1;
                    diff.x *= xRatio;
                }
                this.faceImageObjects[idx].screenObjectController.setPositionDiff(diff);
                diff.x *= xRatio;
                this.setFaceImagePosition(idx, this.faceImageObjects[idx].screenObjectController.center);
            });
        }
        setDefaultToPoints() {
            for (let objId of Object.keys(this.faceImageObjects)) {
                this.faceImageObjects[objId].screenObjectController.setDefault();
            }
        }
        setFaceImagePosition(objId, screenPos) {
            screenPos.y *= this.frameRatio;
            if (this.faceImageObjects[objId].screenObjectController.isDetached) {
                let vertex = this.getBarycentricVertex(objId);
                let prevScreenPos = PositionConverter_1.PositionConverter.getInstance().barycentricToCoordinates(this.points[vertex.indices[0]], this.points[vertex.indices[1]], this.points[vertex.indices[2]], vertex.weights);
                this.faceImageObjects[objId].faceImageObjectController.setFijiObjectLocalPosition(screenPos.sub(prevScreenPos));
            }
            else {
                //@ts-ignore
                this.faceImageObjects[objId].faceImageObjectController.headComp.attachmentPoint = Editor.Components.HeadAttachmentPointType.TriangleBarycentric;
                this.faceImageObjects[objId].faceImageObjectController.updateAttachmentPoint();
                let vertex = this.faceImageObjects[objId].faceImageObjectController.headComp.attachedBarycentricVertex;
                let barycentricCoords = PositionConverter_1.PositionConverter.getInstance().getBarycentricCoordinates(screenPos, this.editorFrameRatio, this.points, vertex.indices, Data_1.Constants.CANDIDE_TRIANGLES);
                vertex.indices = [barycentricCoords.indices[0], barycentricCoords.indices[1], barycentricCoords.indices[2]];
                vertex.weights = [barycentricCoords.weights[0], barycentricCoords.weights[1], barycentricCoords.weights[2]];
                this.faceImageObjects[objId].faceImageObjectController.headComp.attachedBarycentricVertex = vertex;
            }
            this.faceImageObjects[objId].faceImageObjectController.setWorldPosition(this.faceImageObjects[objId].screenObjectController.centerScreenPos);
        }
        setFaceRegionCoords(objId, vertex) {
            let screenPos = PositionConverter_1.PositionConverter.getInstance().barycentricToCoordinates(this.points[vertex.indices[0]], this.points[vertex.indices[1]], this.points[vertex.indices[2]], vertex.weights);
            let newScreenPos = screenPos.add(this.faceImageObjects[objId].faceImageObjectController.localToScreenPosition());
            newScreenPos.y /= this.frameRatio;
            this.faceImageObjects[objId].screenObjectController.setNewPosition(newScreenPos);
            this.updateWorldPosition(objId);
        }
        getBarycentricVertex(objId) {
            if (Data_1.Constants.BARYCENTRIC_VERTICES[this.faceImageObjects[objId].faceImageObjectController.attachmentPoint]) {
                return Data_1.Constants.BARYCENTRIC_VERTICES[this.faceImageObjects[objId].faceImageObjectController.attachmentPoint];
            }
            return this.faceImageObjects[objId].faceImageObjectController.headComp.attachedBarycentricVertex;
        }
        updateWorldPosition(id) {
            this.faceImageObjects[id].faceImageObjectController.setWorldPosition(this.faceImageObjects[id].screenObjectController.centerScreenPos);
        }
        updateIteractionPointsScale() {
            let curScale = this.main.getLensRegion().getPinchControl().getScale();
            this.effectsT.setLocalScale(this.initEffectsScale.uniformScale(curScale));
        }
        updateGizmoScale() {
            for (let objId of Object.keys(this.faceImageObjects)) {
                this.faceImageObjects[objId].screenObjectController.updateGizmoScale(this.main.getLensRegion().getPinchControl().getScale());
            }
        }
        getLensRegionStatus() {
            return LensRegion_1.LensRegion.isBusy;
        }
        updateSnappingCirclesScale() {
            this.snappingScript.updateScreenCircleScale(this.main.getLensRegion().getPinchControl().getScale());
        }
        setIsolationStatus(status) {
            this.isIsolationMode = status;
            for (let objId of Object.keys(this.faceImageObjects)) {
                if (!this.selectedObjects[objId]) {
                    this.faceImageObjects[objId].screenObjectController.setIsolationStatus(status);
                    this.faceImageObjects[objId].faceImageObjectController.setIsolationStatus(status);
                }
                else {
                    this.faceImageObjects[objId].screenObjectController.setIsolationStatus(false);
                    this.faceImageObjects[objId].faceImageObjectController.setIsolationStatus(false);
                }
            }
        }
        setSymmetricStatus(status) {
            this.isSymmetricMode = status;
        }
        setSnappingStatus(status) {
            this.isSnappingMode = status;
        }
        clearSelection() {
            this.setDefaultToPoints();
            this.selectionListener.clearSelection();
        }
        __initialize() {
            super.__initialize();
            this.selectedObjects = {};
            this.faceImageObjects = {};
            this.points = [];
            this.offsets = {};
            this.frameRatio = 1.0;
            this.editorFrameRatio = 1.0;
            this.renderTargetRatio = 1.0;
            this.touchStarted = false;
            this.isIsolationMode = false;
            this.isSymmetricMode = false;
            this.isSnappingMode = false;
        }
    };
    __setFunctionName(_classThis, "EffectEditor");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EffectEditor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EffectEditor = _classThis;
})();
exports.EffectEditor = EffectEditor;
//# sourceMappingURL=EffectEditor.js.map