"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g.throw = verb(1), g.return = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var WeatherResponsiveUI = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)('sunny'), weather = _b[0], setWeather = _b[1];
    var _c = (0, react_1.useState)({
        background: 'linear-gradient(180deg, #001F3F 0%, #003366 100%)',
        accentColor: '#00C2FF',
        particleEmoji: '',
        overlayOpacity: 0,
    }), currentTheme = _c[0], setCurrentTheme = _c[1];
    (0, react_1.useEffect)(function () {
        checkWeatherAndTime();
        var interval = setInterval(checkWeatherAndTime, 300000); // Check every 5 minutes
        return function () { return clearInterval(interval); };
    }, []);
    var checkWeatherAndTime = function () { return __awaiter(void 0, void 0, void 0, function () {
        var hour, weatherCondition;
        return __generator(this, function (_a) {
            hour = new Date().getHours();
            // Check if it's night time
            if (hour >= 20 || hour < 6) {
                setWeather('night');
                setCurrentTheme({
                    background: 'linear-gradient(180deg, #000814 0%, #001D3D 100%)',
                    accentColor: '#00FFD1',
                    particleEmoji: '✨',
                    overlayOpacity: 0.2,
                });
                return [2 /*return*/];
            }
            weatherCondition = simulateWeather();
            setWeather(weatherCondition);
            setCurrentTheme(getThemeForWeather(weatherCondition));
            return [2 /*return*/];
        });
    }); };
    var simulateWeather = function () {
        var hour = new Date().getHours();
        // Morning and evening more likely to be cloudy
        if ((hour >= 6 && hour < 9) || (hour >= 17 && hour < 20)) {
            return Math.random() > 0.5 ? 'cloudy' : 'sunny';
        }
        // Midday usually sunny
        if (hour >= 10 && hour < 16) {
            return 'sunny';
        }
        // Random other times
        var rand = Math.random();
        if (rand > 0.8)
            return 'rainy';
        if (rand > 0.6)
            return 'stormy';
        if (rand > 0.3)
            return 'cloudy';
        return 'sunny';
    };
    var getThemeForWeather = function (condition) {
        switch (condition) {
            case 'sunny':
                return {
                    background: 'linear-gradient(180deg, #00A8E8 0%, #007EA7 100%)',
                    accentColor: '#FFD700',
                    particleEmoji: '☀️',
                    overlayOpacity: 0,
                };
            case 'rainy':
                return {
                    background: 'linear-gradient(180deg, #2C3E50 0%, #34495E 100%)',
                    accentColor: '#95A5A6',
                    particleEmoji: '💧',
                    overlayOpacity: 0.3,
                };
            case 'stormy':
                return {
                    background: 'linear-gradient(180deg, #1C1C1C 0%, #2C3E50 100%)',
                    accentColor: '#E74C3C',
                    particleEmoji: '⚡',
                    overlayOpacity: 0.5,
                };
            case 'cloudy':
                return {
                    background: 'linear-gradient(180deg, #5D6D7E 0%, #85929E 100%)',
                    accentColor: '#BDC3C7',
                    particleEmoji: '☁️',
                    overlayOpacity: 0.2,
                };
            case 'night':
                return {
                    background: 'linear-gradient(180deg, #000814 0%, #001D3D 100%)',
                    accentColor: '#00FFD1',
                    particleEmoji: '🌙',
                    overlayOpacity: 0.4,
                };
            default:
                return {
                    background: 'linear-gradient(180deg, #001F3F 0%, #003366 100%)',
                    accentColor: '#00C2FF',
                    particleEmoji: '',
                    overlayOpacity: 0,
                };
        }
    };
    return (<react_native_1.View style={styles.container}>
      {/* Weather overlay */}
      <react_native_1.View style={[
            styles.weatherOverlay,
            {
                backgroundColor: weather === 'night'
                    ? 'rgba(0, 0, 40, 0.4)'
                    : weather === 'stormy'
                        ? 'rgba(20, 20, 20, 0.5)'
                        : weather === 'rainy'
                            ? 'rgba(40, 60, 80, 0.3)'
                            : 'transparent',
            },
        ]} pointerEvents="none"/>

      {/* Weather particles */}
      {weather === 'rainy' && <RainParticles />}
      {weather === 'stormy' && <StormEffect />}
      {weather === 'night' && <NightStars />}

      {/* Weather indicator */}
      <react_native_1.View style={styles.weatherIndicator} pointerEvents="none">
        <react_native_1.Text style={styles.weatherEmoji}>{currentTheme.particleEmoji}</react_native_1.Text>
        <react_native_1.Text style={styles.weatherLabel}>
          {weather.charAt(0).toUpperCase() + weather.slice(1)}
        </react_native_1.Text>
      </react_native_1.View>

      {children}
    </react_native_1.View>);
};
var RainParticles = function () {
    var raindrops = Array.from({ length: 20 }, function (_, i) { return ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
    }); });
    return (<react_native_1.View style={styles.particlesContainer} pointerEvents="none">
      {raindrops.map(function (drop) { return (<react_native_1.View key={drop.id} style={[
                styles.raindrop,
                {
                    left: "".concat(drop.left, "%"),
                },
            ]}/>); })}
    </react_native_1.View>);
};
var StormEffect = function () {
    return (<react_native_1.View style={styles.particlesContainer} pointerEvents="none">
      <react_native_1.View style={styles.lightning}/>
    </react_native_1.View>);
};
var NightStars = function () {
    var stars = Array.from({ length: 30 }, function (_, i) { return ({
        id: i,
        left: Math.random() * SCREEN_WIDTH,
        top: Math.random() * SCREEN_HEIGHT * 0.5,
        size: 2 + Math.random() * 3,
    }); });
    return (<react_native_1.View style={styles.particlesContainer} pointerEvents="none">
      {stars.map(function (star) { return (<react_native_1.View key={star.id} style={[
                styles.star,
                {
                    left: star.left,
                    top: star.top,
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                },
            ]}/>); })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    weatherOverlay: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 1, pointerEvents: 'none' }),
    weatherIndicator: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 100,
    },
    weatherEmoji: {
        fontSize: 20,
    },
    weatherLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    particlesContainer: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 2 }),
    raindrop: {
        position: 'absolute',
        top: -10,
        width: 2,
        height: 20,
        backgroundColor: 'rgba(173, 216, 230, 0.6)',
        borderRadius: 1,
    },
    lightning: {
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 3,
        height: '40%',
        backgroundColor: '#FFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#FFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
});
exports.default = WeatherResponsiveUI;
