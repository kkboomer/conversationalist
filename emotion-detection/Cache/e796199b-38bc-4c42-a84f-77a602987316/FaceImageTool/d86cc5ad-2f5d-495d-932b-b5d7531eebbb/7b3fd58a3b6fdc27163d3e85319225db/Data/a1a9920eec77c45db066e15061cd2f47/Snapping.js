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
exports.Snapping = void 0;
var __selfType = requireType("./Snapping");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let Snapping = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Snapping = _classThis = class extends _classSuper {
        onAwake() {
            this.parentScreenT = this.editorFrame.getComponent("ScreenTransform");
            this.initLocalPositions.push(new vec2(-0.287, 0.0034));
            this.initLocalPositions.push(new vec2(0.287, 0.0034));
            this.initLocalPositions.push(new vec2(-0.005922, -0.082768));
            this.initLocalPositions.push(new vec2(-0.0035657, -0.356853));
            this.initLocalPositions.forEach((pos) => {
                let newCircle = this.spawnNewGreenCircle(pos);
                this.initObjects.push(newCircle.obj);
                this.initObjectsScreenT.push(newCircle.screenT);
            });
        }
        checkNewDiff(pointsData, diff) {
            let minDist = Number.MAX_VALUE;
            this.lineRenderer.reset();
            let pointsPositions = [];
            pointsData.forEach((pointData) => {
                let curDiff = vec2.zero();
                curDiff.x = diff.x;
                curDiff.y = diff.y;
                if (pointData.isSymmetrical) {
                    curDiff.x *= -1;
                }
                pointsPositions.push(pointData.pointPos.add(curDiff));
            });
            //--------------------
            let initPositions = [];
            this.initLocalPositions.forEach((pos) => {
                initPositions.push(this.parentScreenT.localPointToScreenPoint(pos));
            });
            let closestInitPoint = this.getClosestIndices(initPositions, pointsPositions, minDist);
            let spawnedPositions = [];
            for (let i = 0; i <= this.spawnedObjectIdx; i++) {
                spawnedPositions.push(this.parentScreenT.localPointToScreenPoint(this.spawnedObjectsScreenT[i].anchors.getCenter()));
            }
            let closestSpawnedPoint = this.getClosestIndices(spawnedPositions, pointsPositions, minDist);
            //--------------------
            let closestPoint = null;
            if (closestSpawnedPoint.wasFound) {
                closestPoint = { wasFound: true, minDist: closestSpawnedPoint.minDist, greenPointPos: spawnedPositions[closestSpawnedPoint.greenPointIdx],
                    pointPos: pointsPositions[closestSpawnedPoint.pointIdx], isSymmetrical: pointsData[closestSpawnedPoint.pointIdx].isSymmetrical };
            }
            else {
                if (closestInitPoint.wasFound) {
                    closestPoint = { wasFound: true, minDist: closestInitPoint.minDist, greenPointPos: initPositions[closestInitPoint.greenPointIdx],
                        pointPos: pointsPositions[closestInitPoint.pointIdx], isSymmetrical: pointsData[closestInitPoint.pointIdx].isSymmetrical };
                }
                else {
                    closestPoint = { wasFound: false };
                }
            }
            //--------------------
            let otherCirclesPos = [];
            for (let i = 0; i <= this.spawnedObjectIdx; i++) {
                let spawnedObjCenter = this.spawnedObjectsScreenT[i].anchors.getCenter();
                spawnedObjCenter.x *= -1;
                otherCirclesPos.push(this.parentScreenT.localPointToScreenPoint(spawnedObjCenter));
            }
            let closestLines = this.getClosestLines(otherCirclesPos, pointsPositions);
            if (closestLines.horizontal.wasFound) {
                closestLines.horizontal.circlePos = otherCirclesPos[closestLines.horizontal.circleIdx];
                closestLines.horizontal.isSymmetrical = pointsData[closestLines.horizontal.pointIdx].isSymmetrical;
            }
            if (closestLines.vertical.wasFound) {
                closestLines.vertical.circlePos = otherCirclesPos[closestLines.vertical.circleIdx];
                closestLines.vertical.isSymmetrical = pointsData[closestLines.vertical.pointIdx].isSymmetrical;
            }
            //--------------------
            let offset = this.getOffset(closestPoint, closestLines);
            if (offset.wasFound) {
                if (offset.isHorizontalLine) {
                    this.addLine(closestLines.horizontal.circlePos, pointsPositions[closestLines.horizontal.pointIdx].add(offset.offset));
                }
                if (offset.isVerticalLine) {
                    this.addLine(closestLines.vertical.circlePos, pointsPositions[closestLines.vertical.pointIdx].add(offset.offset));
                }
                if (offset.isSymmetrical) {
                    offset.offset.x *= -1;
                }
                this.touchDiff = this.touchDiff.sub(offset.offset);
                diff = diff.add(offset.offset);
            }
            else {
                diff = diff.add(this.touchDiff);
                this.touchDiff = vec2.zero();
            }
            return diff;
        }
        getOffset(closestPoint, closestLines) {
            let offset = vec2.zero();
            let isHorizontalLine = false;
            let isVerticalLine = false;
            if (closestLines.horizontal.wasFound && (!closestLines.vertical.wasFound || closestLines.horizontal.minDist < closestLines.vertical.minDist) &&
                (!closestPoint.wasFound || closestLines.horizontal.minDist < closestPoint.minDist)) {
                offset.y = closestLines.horizontal.diff;
                isHorizontalLine = true;
                if (closestLines.vertical.wasFound && (!closestPoint.wasFound || closestLines.vertical.minDist < closestPoint.minDist)) {
                    offset.x = closestLines.vertical.diff;
                    isVerticalLine = true;
                }
                else {
                    if (closestPoint.wasFound && Math.abs(closestPoint.greenPointPos.y - closestLines.horizontal.circlePos.y) < this.EPS) {
                        offset.x = closestPoint.greenPointPos.x - closestPoint.pointPos.x;
                    }
                }
                return { offset: offset, isSymmetrical: closestLines.horizontal.isSymmetrical, wasFound: true, isHorizontalLine: isHorizontalLine, isVerticalLine: isVerticalLine };
            }
            if (closestLines.vertical.wasFound && (!closestLines.horizontal.wasFound || closestLines.vertical.minDist < closestLines.horizontal.minDist) &&
                (!closestPoint.wasFound || closestLines.vertical.minDist < closestPoint.minDist)) {
                offset.x = closestLines.vertical.diff;
                isVerticalLine = true;
                if (closestLines.horizontal.wasFound && (!closestPoint.wasFound || closestLines.horizontal.minDist < closestPoint.minDist)) {
                    offset.y = closestLines.horizontal.diff;
                    isHorizontalLine = true;
                }
                else {
                    if (closestPoint.wasFound && Math.abs(closestPoint.greenPointPos.x - closestLines.vertical.circlePos.x) < this.EPS) {
                        offset.y = closestPoint.greenPointPos.y - closestPoint.pointPos.y;
                    }
                }
                return { offset: offset, isSymmetrical: closestLines.vertical.isSymmetrical, wasFound: true, isHorizontalLine: isHorizontalLine, isVerticalLine: isVerticalLine };
            }
            if (closestPoint.wasFound) {
                offset = closestPoint.greenPointPos.sub(closestPoint.pointPos);
                return { offset: offset, isSymmetrical: closestPoint.isSymmetrical, wasFound: true, isHorizontalLine: isHorizontalLine, isVerticalLine: isVerticalLine };
            }
            return { offset: offset, isSymmetrical: false, wasFound: false, isHorizontalLine: isHorizontalLine, isVerticalLine: isVerticalLine };
        }
        getClosestIndices(greenPointsPositions, pointsPositions, minDist) {
            let greenPointIdx = -1;
            let pointIdx = -1;
            let wasFound = false;
            greenPointsPositions.forEach((greenCirclePos, gIdx) => {
                pointsPositions.forEach((pointPos, pIdx) => {
                    let curDist = pointPos.add(this.touchDiff).distance(greenCirclePos);
                    if (curDist < minDist && curDist < this.closestDistToPoint) {
                        wasFound = true;
                        minDist = curDist;
                        greenPointIdx = gIdx;
                        pointIdx = pIdx;
                    }
                });
            });
            return { wasFound: wasFound, minDist: minDist, greenPointIdx: greenPointIdx, pointIdx: pointIdx };
        }
        getClosestLines(otherPointsPosition, pointsPosition) {
            let horizontalPointIdx = -1;
            let horizontalCircleIdx = -1;
            let minDistX = Number.MAX_VALUE;
            let diffX = 0;
            let verticalPointIdx = -1;
            let verticalCircleIdx = -1;
            let minDistY = Number.MAX_VALUE;
            let diffY = 0;
            otherPointsPosition.forEach((otherCirclePos, initIdx) => {
                pointsPosition.forEach((pointPos, pointIdx) => {
                    let curDistX = Math.abs((pointPos.x + this.touchDiff.x) - otherCirclePos.x);
                    if (curDistX < this.closestDistToPoint && curDistX < minDistX) {
                        verticalPointIdx = pointIdx;
                        verticalCircleIdx = initIdx;
                        minDistX = curDistX;
                        diffX = otherCirclePos.x - pointPos.x;
                    }
                    let curDistY = Math.abs((pointPos.y + this.touchDiff.y) - otherCirclePos.y);
                    if (curDistY < this.closestDistToPoint && curDistY < minDistY) {
                        horizontalPointIdx = pointIdx;
                        horizontalCircleIdx = initIdx;
                        minDistY = curDistY;
                        diffY = otherCirclePos.y - pointPos.y;
                    }
                });
            });
            return { horizontal: { wasFound: horizontalPointIdx >= 0, pointIdx: horizontalPointIdx, circleIdx: horizontalCircleIdx, minDist: minDistY, diff: diffY, circlePos: null, isSymmetrical: null },
                vertical: { wasFound: verticalPointIdx >= 0, pointIdx: verticalPointIdx, circleIdx: verticalCircleIdx, minDist: minDistX, diff: diffX, circlePos: null, isSymmetrical: null } };
        }
        addLine(screenPos1, screenPos2) {
            let worldPoint1 = this.camera.screenSpaceToWorldSpace(screenPos1, 10);
            let worldPoint2 = this.camera.screenSpaceToWorldSpace(screenPos2, 10);
            this.lineRenderer.addLine(worldPoint1, worldPoint2);
            this.lineRenderer.update();
        }
        addSnappingPoint(pos) {
            this.spawnedObjectIdx++;
            pos.x *= -1;
            if (this.spawnedObjectIdx == this.spawnedObjects.length) {
                let newCircle = this.spawnNewGreenCircle(pos);
                newCircle.obj.enabled = true;
                this.spawnedObjects.push(newCircle.obj);
                this.spawnedObjectsScreenT.push(newCircle.screenT);
            }
            else {
                this.spawnedObjects[this.spawnedObjectIdx].enabled = true;
                this.spawnedObjectsScreenT[this.spawnedObjectIdx].anchors.setCenter(pos);
            }
        }
        spawnNewGreenCircle(pos) {
            let newCircle = this.editorFrame.copyWholeHierarchyAndAssets(this.greenCircle);
            let newCircleScreenT = newCircle.getComponent("ScreenTransform");
            newCircleScreenT.anchors.setCenter(pos);
            return { obj: newCircle, screenT: newCircleScreenT };
        }
        updateScreenCircleScale(lensRegionScale = 1) {
            this.initObjectsScreenT.forEach((screenT) => {
                screenT.scale = vec3.one().uniformScale(1 / lensRegionScale);
            });
            this.spawnedObjectsScreenT.forEach((screenT) => {
                screenT.scale = vec3.one().uniformScale(1 / lensRegionScale);
            });
            this.lineRenderer.reset();
        }
        show() {
            this.touchDiff = vec2.zero();
            this.shown = true;
            this.lineRenderer.reset();
            this.initObjects.forEach((obj) => {
                obj.enabled = true;
            });
        }
        hide() {
            this.shown = false;
            this.touchDiff = vec2.zero();
            this.lineRenderer.reset();
            this.spawnedObjectIdx = -1;
            this.initObjects.forEach((obj) => {
                obj.enabled = false;
            });
            this.spawnedObjects.forEach((obj) => {
                obj.enabled = false;
            });
        }
        get positionIsFixed() {
            return this.posIsFixed;
        }
        get isShown() {
            return this.shown;
        }
        __initialize() {
            super.__initialize();
            this.closestDistToPoint = 0.02;
            this.EPS = 1e5;
            this.touchDiff = vec2.zero();
            this.posIsFixed = false;
            this.shown = false;
            this.initLocalPositions = [];
            this.initObjects = [];
            this.initObjectsScreenT = [];
            this.spawnedObjectIdx = -1;
            this.spawnedObjects = [];
            this.spawnedObjectsScreenT = [];
        }
    };
    __setFunctionName(_classThis, "Snapping");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Snapping = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Snapping = _classThis;
})();
exports.Snapping = Snapping;
//# sourceMappingURL=Snapping.js.map