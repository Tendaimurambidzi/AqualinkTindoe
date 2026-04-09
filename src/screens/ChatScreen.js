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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var ChatScreen = function (_a) {
    var route = _a.route;
    var _b = route.params, userId = _b.userId, username = _b.username;
    var _c = (0, react_1.useState)([]), messages = _c[0], setMessages = _c[1];
    var _d = (0, react_1.useState)(''), input = _d[0], setInput = _d[1];
    var currentUser = (0, firestore_1.default)().app.auth().currentUser;
    var chatId = [currentUser.uid, userId].sort().join('_');
    (0, react_1.useEffect)(function () {
        var unsubscribe = (0, firestore_1.default)()
            .collection('chats')
            .doc(chatId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot(function (snapshot) {
            setMessages(snapshot.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); }));
        });
        return unsubscribe;
    }, [chatId]);
    var sendMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!input.trim())
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('chats')
                            .doc(chatId)
                            .collection('messages')
                            .add({
                            text: input,
                            from: currentUser.uid,
                            to: userId,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                        })];
                case 1:
                    _a.sent();
                    // Trigger VIBE ALERT for recipient
                    try {
                        app = require('../../App');
                        if (app && app.showVibeAlert) {
                            app.showVibeAlert({
                                hostUid: currentUser.uid,
                                liveId: chatId,
                                hostName: currentUser.displayName || 'You',
                                hostPhoto: currentUser.photoURL || null,
                            });
                        }
                    }
                    catch (e) {
                        // fallback: do nothing
                    }
                    setInput('');
                    return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.header}>Chat with {username}</react_native_1.Text>
      <react_native_1.FlatList data={messages} keyExtractor={function (item) { return item.id; }} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.View style={[styles.message, item.from === currentUser.uid ? styles.myMessage : styles.theirMessage]}>
            <react_native_1.Text style={styles.messageText}>{item.text}</react_native_1.Text>
          </react_native_1.View>);
        }} style={styles.messagesList}/>
      <react_native_1.View style={styles.inputRow}>
        <react_native_1.TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..."/>
        <react_native_1.Pressable style={styles.sendBtn} onPress={sendMessage}>
          <react_native_1.Text style={styles.sendText}>Send</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { fontSize: 18, fontWeight: 'bold', padding: 16, backgroundColor: '#00C2FF', color: '#fff' },
    messagesList: { flex: 1, padding: 16 },
    message: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '80%' },
    myMessage: { backgroundColor: '#00C2FF', alignSelf: 'flex-end' },
    theirMessage: { backgroundColor: '#eee', alignSelf: 'flex-start' },
    messageText: { color: '#222' },
    inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
    sendBtn: { backgroundColor: '#00C2FF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
    sendText: { color: '#fff', fontWeight: 'bold' },
});
exports.default = ChatScreen;
