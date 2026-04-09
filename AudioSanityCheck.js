"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AudioSanityCheck;
// @ts-nocheck
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var react_native_video_1 = __importDefault(require("react-native-video"));
function AudioSanityCheck() {
    return (<react_native_1.View style={{ flex: 1, backgroundColor: '#000' }}>
      <react_native_video_1.default source={{ uri: 'https://file-examples.com/storage/fe7e9f7b8f95f451dbd9b8c/2017/11/file_example_MP3_700KB.mp3' }} audioOnly paused={false} playInBackground ignoreSilentSwitch="ignore" onError={function (e) { return console.log('SANITY AUDIO ERROR', e); }} onLoad={function (m) { return console.log('SANITY AUDIO LOADED sec=', m.duration); }} style={{ height: 0, width: 0 }}/>
    </react_native_1.View>);
}
