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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BridgeDataSaverPanel;
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var DataSaverProvider_1 = require("./DataSaverProvider");
function BridgeDataSaverPanel() {
    var s = (0, DataSaverProvider_1.useDataSaver)();
    var Seg = function (_a) {
        var opt = _a.opt;
        return (<react_native_1.Pressable onPress={function () { return s.setState({ maxResolution: opt }); }}>
      <react_native_1.Text style={{
                color: s.maxResolution === opt ? '#012' : '#aee',
                backgroundColor: s.maxResolution === opt ? '#7fd' : 'transparent',
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 10,
                marginRight: 6,
                fontWeight: '700',
            }}>
        {opt.toUpperCase()}
      </react_native_1.Text>
    </react_native_1.Pressable>);
    };
    var ChangeCap = function (_a) {
        var delta = _a.delta;
        return (<react_native_1.Pressable onPress={function () {
                return s.setState({
                    mobileDataCapMB: Math.max(5, Math.min(200, s.mobileDataCapMB + delta)),
                });
            }}>
      <react_native_1.Text style={{ color: '#00C2FF', fontWeight: '800', paddingHorizontal: 8 }}>
        {delta > 0 ? '+5' : '-5'}
      </react_native_1.Text>
    </react_native_1.Pressable>);
    };
    var setDownloadRule = function (network, key, value) {
        var _a, _b;
        s.setState((_a = {},
            _a[network] = __assign(__assign({}, s[network]), (_b = {}, _b[key] = value, _b)),
            _a));
    };
    return (<react_native_1.View style={{ gap: 10 }}>
      <Row label="Enable Data Saver" value={s.enabled} onChange={function (v) { return s.setState({ enabled: v }); }}/>
      <Row label="Autoplay on Wi-Fi only" value={s.autoplayOnWifiOnly} onChange={function (v) { return s.setState({ autoplayOnWifiOnly: v }); }}/>
      <Row label="Thumbnails-only feed" value={s.thumbnailsOnlyInFeed} onChange={function (v) { return s.setState({ thumbnailsOnlyInFeed: v }); }}/>
      <Row label="Wi-Fi-only downloads" value={s.wifiOnlyDownloads} onChange={function (v) { return s.setState({ wifiOnlyDownloads: v }); }}/>
      <Row label="Prefer AV1/HEVC if available" value={s.preferModernCodec} onChange={function (v) { return s.setState({ preferModernCodec: v }); }}/>

      <react_native_1.Text style={{ color: '#9cc', marginTop: 6 }}>Downloads on mobile data</react_native_1.Text>
      <DownloadRuleRow label="Photos" value={s.downloadOnCellular.photos} onChange={function (v) { return setDownloadRule('downloadOnCellular', 'photos', v); }}/>
      <DownloadRuleRow label="Videos" value={s.downloadOnCellular.videos} onChange={function (v) { return setDownloadRule('downloadOnCellular', 'videos', v); }}/>
      <DownloadRuleRow label="Audio" value={s.downloadOnCellular.audio} onChange={function (v) { return setDownloadRule('downloadOnCellular', 'audio', v); }}/>
      <DownloadRuleRow label="Documents" value={s.downloadOnCellular.documents} onChange={function (v) { return setDownloadRule('downloadOnCellular', 'documents', v); }}/>

      <react_native_1.Text style={{ color: '#9cc', marginTop: 6 }}>Downloads on Wi-Fi</react_native_1.Text>
      <DownloadRuleRow label="Photos" value={s.downloadOnWifi.photos} onChange={function (v) { return setDownloadRule('downloadOnWifi', 'photos', v); }}/>
      <DownloadRuleRow label="Videos" value={s.downloadOnWifi.videos} onChange={function (v) { return setDownloadRule('downloadOnWifi', 'videos', v); }}/>
      <DownloadRuleRow label="Audio" value={s.downloadOnWifi.audio} onChange={function (v) { return setDownloadRule('downloadOnWifi', 'audio', v); }}/>
      <DownloadRuleRow label="Documents" value={s.downloadOnWifi.documents} onChange={function (v) { return setDownloadRule('downloadOnWifi', 'documents', v); }}/>

      <react_native_1.Text style={{ color: '#9cc', marginTop: 6 }}>Video quality</react_native_1.Text>
      <react_native_1.View style={{
            flexDirection: 'row',
            backgroundColor: '#0c2136',
            borderRadius: 12,
            padding: 4,
            alignSelf: 'flex-start',
        }}>
        <Seg opt="low"/>
        <Seg opt="med"/>
        <Seg opt="high"/>
      </react_native_1.View>

      <react_native_1.View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
        <react_native_1.Text style={{ color: '#9cc' }}>Mobile data limit: {s.mobileDataCapMB} MB</react_native_1.Text>
        <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ChangeCap delta={-5}/>
          <ChangeCap delta={+5}/>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.Text style={{ color: '#6fa' }}>
        Current network: {s.cellular ? 'Cellular' : 'Wi-Fi / Other'}
      </react_native_1.Text>
    </react_native_1.View>);
}
function Row(_a) {
    var label = _a.label, value = _a.value, onChange = _a.onChange;
    return (<react_native_1.View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
        }}>
      <react_native_1.Text style={{ color: '#dfe', fontSize: 16 }}>{label}</react_native_1.Text>
      <react_native_1.Switch value={value} onValueChange={onChange}/>
    </react_native_1.View>);
}
function DownloadRuleRow(_a) {
    var label = _a.label, value = _a.value, onChange = _a.onChange;
    return (<react_native_1.View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
        }}>
      <react_native_1.Text style={{ color: '#bfe6ff', fontSize: 15 }}>{label}</react_native_1.Text>
      <react_native_1.Switch value={value} onValueChange={onChange}/>
    </react_native_1.View>);
}
