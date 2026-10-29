"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManager = void 0;
// ============================================================
// Mochi – Update Manager
// ============================================================
const electron_1 = require("electron");
const RELEASES_URL = 'https://github.com/your-org/mochi-cat/releases';
class UpdateManager {
    checkForUpdates() {
        // Open releases page — real auto-update requires a configured update server
        electron_1.shell.openExternal(RELEASES_URL);
    }
}
exports.UpdateManager = UpdateManager;
//# sourceMappingURL=UpdateManager.js.map