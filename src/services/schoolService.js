"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
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
exports.registerNoticeBoard = registerNoticeBoard;
exports.registerSchool = registerSchool;
exports.getZimbabweSchools = getZimbabweSchools;
exports.registerTeacher = registerTeacher;
exports.createLesson = createLesson;
var react_native_1 = require("react-native");
/**
 * Register organization for Notice Board
 */
function registerNoticeBoard(data) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Configuration Error', 'Backend URL not configured');
                        return [2 /*return*/, { ok: false, message: 'Backend not configured' }];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/notice-board/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('Registration Received!', result.message || 'Your registration has been submitted. Proceed to payment to activate your account.', [{ text: 'OK' }]);
                        return [2 /*return*/, { ok: true, registrationId: result.registrationId, message: result.message }];
                    }
                    else {
                        react_native_1.Alert.alert('Registration Failed', result.error || 'Please try again');
                        return [2 /*return*/, { ok: false, message: result.error }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Notice Board registration error:', error_1);
                    react_native_1.Alert.alert('Error', 'No internet right now. Please try again.');
                    return [2 /*return*/, { ok: false, message: 'Network error' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Register a school (Zimbabwe schools)
 */
function registerSchool(data) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Configuration Error', 'Backend URL not configured');
                        return [2 /*return*/, { ok: false, message: 'Backend not configured' }];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/school/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result_1 = _a.sent();
                    if (response.ok && result_1.ok) {
                        react_native_1.Alert.alert('School Registered!', result_1.message || 'Your school has been successfully registered.', [{ text: 'OK' }]);
                        return [2 /*return*/, { ok: true, schoolId: result_1.schoolId, message: result_1.message }];
                    }
                    else {
                        react_native_1.Alert.alert('Registration Issue', result_1.error || 'Please ensure your school is in our Zimbabwe schools list', result_1.suggestion ? [
                            { text: 'OK' },
                            { text: 'Contact Support', onPress: function () { return react_native_1.Alert.alert('Support', result_1.suggestion); } }
                        ] : [{ text: 'OK' }]);
                        return [2 /*return*/, { ok: false, message: result_1.error }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('School registration error:', error_2);
                    react_native_1.Alert.alert('Error', 'No internet right now. Please try again.');
                    return [2 /*return*/, { ok: false, message: 'Network error' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get list of registered Zimbabwe schools
 */
function getZimbabweSchools() {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/school/list-zimbabwe"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.schools) {
                        return [2 /*return*/, result.schools];
                    }
                    return [2 /*return*/, []];
                case 3:
                    error_3 = _a.sent();
                    console.error('Get Zimbabwe schools error:', error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Register a teacher
 */
function registerTeacher(data) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Configuration Error', 'Backend URL not configured');
                        return [2 /*return*/, { ok: false, message: 'Backend not configured' }];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/teacher/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('Teacher Registered!', result.message || 'Teacher account created successfully.', [{ text: 'OK' }]);
                        return [2 /*return*/, { ok: true, teacherId: result.teacherId, message: result.message }];
                    }
                    else {
                        react_native_1.Alert.alert('Registration Failed', result.error || 'Please try again');
                        return [2 /*return*/, { ok: false, message: result.error }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Teacher registration error:', error_4);
                    react_native_1.Alert.alert('Error', 'No internet right now. Please try again.');
                    return [2 /*return*/, { ok: false, message: 'Network error' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a lesson (Teacher's Dock)
 */
function createLesson(data) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Configuration Error', 'Backend URL not configured');
                        return [2 /*return*/, { ok: false, message: 'Backend not configured' }];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/teacher/create-lesson"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('Lesson Created!', result.message || 'Your lesson has been scheduled successfully.', [{ text: 'OK' }]);
                        return [2 /*return*/, { ok: true, lessonId: result.lessonId, message: result.message }];
                    }
                    else {
                        react_native_1.Alert.alert('Creation Failed', result.error || 'Please try again');
                        return [2 /*return*/, { ok: false, message: result.error }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Create lesson error:', error_5);
                    react_native_1.Alert.alert('Error', 'No internet right now. Please try again.');
                    return [2 /*return*/, { ok: false, message: 'Network error' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
