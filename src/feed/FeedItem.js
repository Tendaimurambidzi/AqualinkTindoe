"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeedItem;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var DataSaverProvider_1 = require("../dataSaver/DataSaverProvider");
var VideoTile_1 = __importDefault(require("../components/VideoTile"));
function FeedItem(_a) {
    var item = _a.item, uid = _a.uid;
    var s = (0, DataSaverProvider_1.useDataSaver)();
    return (<react_native_1.View style={{ marginBottom: 16 }}>
      <react_native_1.Text style={{ color: '#fff', marginBottom: 8, fontWeight: '700' }}>{item.title}</react_native_1.Text>
      <VideoTile_1.default videoId={item.id} uid={uid} initialAutoPlay={!s.enabled || (!s.autoplayOnWifiOnly || !s.cellular)}/>
    </react_native_1.View>);
}
