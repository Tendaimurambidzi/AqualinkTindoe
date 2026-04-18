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
    o.default = v;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WaveStatsBadge;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
function WaveStatsBadge(_a) {
    var waveId = _a.waveId, style = _a.style, _b = _a.compact, compact = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(0), splashes = _c[0], setSplashes = _c[1];
    (0, react_1.useEffect)(function () {
        var firestoreMod = null;
        try {
            firestoreMod = require('@react-native-firebase/firestore').default;
        }
        catch (_a) { }
        if (!firestoreMod || !waveId)
            return;
        var ref = firestoreMod().collection('waves').doc(waveId);
        var unsub = ref.onSnapshot(function (snap) {
            var _a;
            try {
                var d = ((_a = snap === null || snap === void 0 ? void 0 : snap.data) === null || _a === void 0 ? void 0 : _a.call(snap)) || (snap === null || snap === void 0 ? void 0 : snap.data) || {};
                var counts = (d === null || d === void 0 ? void 0 : d.counts) || {};
                setSplashes(Math.max(0, Number((counts === null || counts === void 0 ? void 0 : counts.splashes) || 0)));
            }
            catch (_b) { }
        }, function () { });
        return function () { try {
            unsub && unsub();
        }
        catch (_a) { } };
    }, [waveId]);
    return (<react_native_1.View style={[{
                flexDirection: 'row',
                backgroundColor: '#0009',
                paddingHorizontal: 8,
                paddingVertical: compact ? 4 : 6,
                borderRadius: 14,
                alignItems: 'center',
                gap: 8,
            }, style]}> 
      <react_native_1.Text style={{ color: 'white', fontWeight: '700' }}>💧 {formatCount(splashes)}</react_native_1.Text>
    </react_native_1.View>);
}
function formatCount(n) {
    if (!Number.isFinite(n))
        return '-';
    if (n < 1000)
        return String(n);
    return "".concat(Math.floor(n / 1000), "k");
}
