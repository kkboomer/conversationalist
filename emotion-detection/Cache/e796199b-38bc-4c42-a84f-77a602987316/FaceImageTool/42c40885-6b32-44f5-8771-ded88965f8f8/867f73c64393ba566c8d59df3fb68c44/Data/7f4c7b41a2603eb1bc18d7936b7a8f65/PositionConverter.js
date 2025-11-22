"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionConverter = void 0;
class PositionConverter {
    constructor() {
        this.isInitialized = false;
        this.minSquarePos = -0.8;
        this.squareSize = 0.4;
        this.largeSquareSize = 0.8;
        this.squareCount = 4;
        this.largeSquareCount = 2;
        this.triangleIdxs = {};
        this.edges = {};
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PositionConverter();
        }
        return this.instance;
    }
    init(points, candideTriangles) {
        let edgeCnt = {};
        candideTriangles.forEach((curTriangle, idx) => {
            for (let i = 0; i < curTriangle.length; i++) {
                for (let j = i + 1; j < curTriangle.length; j++) {
                    let edgeIdx = Math.min(curTriangle[i], curTriangle[j]) * 1000 + Math.max(curTriangle[i], curTriangle[j]);
                    if (edgeCnt[edgeIdx]) {
                        edgeCnt[edgeIdx]++;
                    }
                    else {
                        if (Math.max(curTriangle[i], curTriangle[j]) <= 65) {
                            edgeCnt[edgeIdx] = 1;
                        }
                        else {
                            edgeCnt[edgeIdx] = 2;
                        }
                    }
                }
            }
        });
        edgeCnt[28030] = 1;
        edgeCnt[61063] = 1;
        candideTriangles.forEach((curTriangle, idx) => {
            let minX = Math.min(points[curTriangle[0]].x, points[curTriangle[1]].x, points[curTriangle[2]].x);
            let maxX = Math.max(points[curTriangle[0]].x, points[curTriangle[1]].x, points[curTriangle[2]].x);
            let minY = Math.min(points[curTriangle[0]].y, points[curTriangle[1]].y, points[curTriangle[2]].y);
            let maxY = Math.max(points[curTriangle[0]].y, points[curTriangle[1]].y, points[curTriangle[2]].y);
            const minSquareIdxX = Math.floor((minX - this.minSquarePos) / this.squareSize);
            const maxSquareIdxX = Math.floor((maxX - this.minSquarePos) / this.squareSize);
            const minSquareIdxY = Math.floor((minY - this.minSquarePos) / this.squareSize);
            const maxSquareIdxY = Math.floor((maxY - this.minSquarePos) / this.squareSize);
            for (let i = minSquareIdxX; i <= maxSquareIdxX; i++) {
                for (let j = minSquareIdxY; j <= maxSquareIdxY; j++) {
                    let squareId = i * 100 + j;
                    if (!this.triangleIdxs[squareId]) {
                        this.triangleIdxs[squareId] = [];
                    }
                    this.triangleIdxs[squareId].push(idx);
                }
            }
            let isEdge = false;
            for (let i = 0; i < curTriangle.length; i++) {
                for (let j = i + 1; j < curTriangle.length; j++) {
                    let edgeIdx = Math.min(curTriangle[i], curTriangle[j]) * 1000 + Math.max(curTriangle[i], curTriangle[j]);
                    if (edgeCnt[edgeIdx] === 1 && curTriangle[3 - i - j] <= 100) {
                        isEdge = true;
                    }
                }
            }
            if (isEdge) {
                const minSquareIdxX = Math.floor((minX - this.minSquarePos) / this.largeSquareSize);
                const maxSquareIdxX = Math.floor((maxX - this.minSquarePos) / this.largeSquareSize);
                const minSquareIdxY = Math.floor((minY - this.minSquarePos) / this.largeSquareSize);
                const maxSquareIdxY = Math.floor((maxY - this.minSquarePos) / this.largeSquareSize);
                for (let i = minSquareIdxX; i <= maxSquareIdxX; i++) {
                    for (let j = minSquareIdxY; j <= maxSquareIdxY; j++) {
                        let largeSquareId = i * 100 + j;
                        if (!this.edges[largeSquareId]) {
                            this.edges[largeSquareId] = [];
                        }
                        let centroid = {
                            x: (points[curTriangle[0]].x + points[curTriangle[1]].x + points[curTriangle[2]].x) / 3,
                            y: (points[curTriangle[0]].y + points[curTriangle[1]].y + points[curTriangle[2]].y) / 3
                        };
                        this.edges[largeSquareId].push({ id: idx, centroid: centroid });
                    }
                }
            }
        });
    }
    getBarycentricCoordinates(screenPos, editorFrameRatio, points, idxs, candideTriangles) {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.init(points, candideTriangles);
        }
        const squareIdxX = Math.floor((screenPos.x - this.minSquarePos) / this.squareSize);
        const squareIdxY = Math.floor((screenPos.y - this.minSquarePos) / this.squareSize);
        const squareIdx = squareIdxX * 100 + squareIdxY;
        if (squareIdxX >= 0 && squareIdxX < this.squareCount && squareIdxY >= 0 && squareIdxY < this.squareCount && this.triangleIdxs[squareIdx]) {
            this.triangleIdxs[squareIdx].forEach((idx) => {
                let curTriangle = candideTriangles[idx];
                if (this.isPointInsideTriangle(points[curTriangle[0]], points[curTriangle[1]], points[curTriangle[2]], screenPos)) {
                    idxs = curTriangle;
                }
            });
        }
        else {
            let largeSquareIdxX = Math.floor((screenPos.x - this.minSquarePos) / this.largeSquareSize);
            let largeSquareIdxY = Math.floor((screenPos.y - this.minSquarePos) / this.largeSquareSize);
            largeSquareIdxX = this.clamp(largeSquareIdxX, 0, this.largeSquareCount - 1);
            largeSquareIdxY = this.clamp(largeSquareIdxY, 0, this.largeSquareCount - 1);
            const largeSquareIdx = largeSquareIdxX * 100 + largeSquareIdxY;
            let minDist = Number.MAX_VALUE;
            this.edges[largeSquareIdx].forEach((data) => {
                let curTriangle = candideTriangles[data.id];
                let dist = editorFrameRatio * editorFrameRatio * (screenPos.x - data.centroid.x) * (screenPos.x - data.centroid.x) + (screenPos.y - data.centroid.y) * (screenPos.y - data.centroid.y);
                if (dist < minDist) {
                    minDist = dist;
                    idxs = curTriangle;
                }
            });
        }
        let weights = this.barycentricCoordinates(points[idxs[0]], points[idxs[1]], points[idxs[2]], screenPos);
        return { "indices": idxs, "weights": weights };
    }
    barycentricCoordinates(A, B, C, P) {
        const dX = P.x - C.x;
        const dY = P.y - C.y;
        const dX21 = B.x - C.x;
        const dY21 = B.y - C.y;
        const dX31 = A.x - C.x;
        const dY31 = A.y - C.y;
        const dot00 = dX31 * dX31 + dY31 * dY31;
        const dot01 = dX31 * dX21 + dY31 * dY21;
        const dot02 = dX31 * dX + dY31 * dY;
        const dot11 = dX21 * dX21 + dY21 * dY21;
        const dot12 = dX21 * dX + dY21 * dY;
        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        const w = 1 - u - v;
        return [u, v, w];
    }
    isPointInsideTriangle(A, B, C, P) {
        let weights = this.barycentricCoordinates(A, B, C, P);
        return weights[0] >= 0 && weights[1] >= 0 && weights[0] + weights[1] < 1;
    }
    barycentricToCoordinates(A, B, C, barycentricCoords) {
        let x = A.x * barycentricCoords[0] + B.x * barycentricCoords[1] + C.x * barycentricCoords[2];
        let y = A.y * barycentricCoords[0] + B.y * barycentricCoords[1] + C.y * barycentricCoords[2];
        return new vec2(x, y);
    }
    planeLineIntersection(dirVector, dist) {
        let pointOnLine = new vec3(0, 0, 0);
        let pointOnPlane = new vec3(0, 0, dist);
        let normal = new vec3(0, 0, 1);
        var d = -(normal.x * pointOnPlane.x + normal.y * pointOnPlane.y + normal.z * pointOnPlane.z);
        var t = -(normal.x * pointOnLine.x + normal.y * pointOnLine.y + normal.z * pointOnLine.z + d) / (normal.x * dirVector.x + normal.y * dirVector.y + normal.z * dirVector.z);
        var intersectionPos = new vec3(pointOnLine.x + t * dirVector.x, pointOnLine.y + t * dirVector.y, pointOnLine.z + t * dirVector.z);
        return intersectionPos;
    }
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
}
exports.PositionConverter = PositionConverter;
//# sourceMappingURL=PositionConverter.js.map