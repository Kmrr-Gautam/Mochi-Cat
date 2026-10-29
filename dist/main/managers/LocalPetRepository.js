"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalPetRepository = void 0;
// ============================================================
// Mochi – Local Pet Repository (Main Process)
// ============================================================
const electron_store_1 = __importDefault(require("electron-store"));
const constants_1 = require("../../shared/constants");
const crypto = __importStar(require("crypto"));
function createDefaultPetData() {
    return {
        petId: crypto.randomUUID ? crypto.randomUUID() : 'mochi-' + Date.now(),
        name: 'Mochi',
        appearance: { ...constants_1.DEFAULT_APPEARANCE },
        personality: { ...constants_1.DEFAULT_PERSONALITY },
        emotions: { ...constants_1.DEFAULT_EMOTIONS },
        vitals: { ...constants_1.DEFAULT_VITALS },
        favoriteRestPosition: { x: 0.8, y: 0.8 },
        lastSeen: new Date().toISOString(),
        totalPlaytimeMs: 0,
        totalPetCount: 0,
        totalTreatsGiven: 0,
        preferredToys: ['yarn_ball', 'laser_dot'],
        trustLevel: 50,
        version: constants_1.STATE_DATA_VERSION,
    };
}
class LocalPetRepository {
    store;
    constructor() {
        this.store = new electron_store_1.default({
            name: 'mochi-petdata',
            defaults: { petData: createDefaultPetData() },
        });
        this.migrate();
    }
    migrate() {
        const data = this.store.get('petData');
        if (!data.version || data.version < constants_1.STATE_DATA_VERSION) {
            const migrated = { ...createDefaultPetData(), ...data, version: constants_1.STATE_DATA_VERSION };
            this.store.set('petData', migrated);
        }
    }
    getPetData() {
        return this.store.get('petData');
    }
    updatePetData(partial) {
        const current = this.getPetData();
        const updated = {
            ...current,
            ...partial,
            lastSeen: new Date().toISOString(),
        };
        // Clamp emotion values
        if (updated.emotions) {
            const e = updated.emotions;
            for (const key of Object.keys(e)) {
                e[key] = Math.max(0, Math.min(100, e[key]));
            }
        }
        this.store.set('petData', updated);
        return updated;
    }
    resetPetData() {
        const fresh = createDefaultPetData();
        this.store.set('petData', fresh);
        return fresh;
    }
    /** Increment playtime and pet count etc. */
    recordSession(durationMs, petCount, treatCount) {
        const data = this.getPetData();
        this.updatePetData({
            totalPlaytimeMs: data.totalPlaytimeMs + durationMs,
            totalPetCount: data.totalPetCount + petCount,
            totalTreatsGiven: data.totalTreatsGiven + treatCount,
            trustLevel: Math.min(100, data.trustLevel + petCount * 0.1 + treatCount * 0.5),
        });
    }
}
exports.LocalPetRepository = LocalPetRepository;
//# sourceMappingURL=LocalPetRepository.js.map