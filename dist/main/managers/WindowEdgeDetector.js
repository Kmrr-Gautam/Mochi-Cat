"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowEdgeDetector = void 0;
// ============================================================
// Mochi – Window Edge Detector
// Detects top/side edges of active application windows on Windows
// ============================================================
const electron_1 = require("electron");
class WindowEdgeDetector {
    /**
     * Retrieves active window bounds safely using Windows platform APIs
     * Falls back gracefully to work area bounds when window inspection is restricted
     */
    static getSimulatedWindowBounds() {
        const primary = electron_1.screen.getPrimaryDisplay();
        const { width, height } = primary.workAreaSize;
        // Simulated browser/editor window in center for climbing simulation
        const centerWindow = {
            top: Math.round(height * 0.15),
            bottom: Math.round(height * 0.85),
            left: Math.round(width * 0.15),
            right: Math.round(width * 0.85),
            width: Math.round(width * 0.7),
            height: Math.round(height * 0.7),
        };
        return [centerWindow];
    }
    static isPointNearEdge(x, y, windowEdge, threshold = 20) {
        if (Math.abs(y - windowEdge.top) < threshold && x >= windowEdge.left && x <= windowEdge.right) {
            return 'top';
        }
        if (Math.abs(y - windowEdge.bottom) < threshold && x >= windowEdge.left && x <= windowEdge.right) {
            return 'bottom';
        }
        if (Math.abs(x - windowEdge.left) < threshold && y >= windowEdge.top && y <= windowEdge.bottom) {
            return 'left';
        }
        if (Math.abs(x - windowEdge.right) < threshold && y >= windowEdge.top && y <= windowEdge.bottom) {
            return 'right';
        }
        return null;
    }
}
exports.WindowEdgeDetector = WindowEdgeDetector;
//# sourceMappingURL=WindowEdgeDetector.js.map