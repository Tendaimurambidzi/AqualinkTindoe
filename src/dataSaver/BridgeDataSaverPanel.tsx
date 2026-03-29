import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useDataSaver } from './DataSaverProvider';

type DownloadKey = 'photos' | 'videos' | 'audio' | 'documents';
type DownloadNetwork = 'downloadOnWifi' | 'downloadOnCellular';

export default function BridgeDataSaverPanel() {
  const s = useDataSaver();

  const Seg = ({ opt }: { opt: 'low' | 'med' | 'high' }) => (
    <Pressable onPress={() => s.setState({ maxResolution: opt })}>
      <Text
        style={{
          color: s.maxResolution === opt ? '#012' : '#aee',
          backgroundColor: s.maxResolution === opt ? '#7fd' : 'transparent',
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 10,
          marginRight: 6,
          fontWeight: '700',
        }}
      >
        {opt.toUpperCase()}
      </Text>
    </Pressable>
  );

  const ChangeCap = ({ delta }: { delta: number }) => (
    <Pressable
      onPress={() =>
        s.setState({
          mobileDataCapMB: Math.max(5, Math.min(200, s.mobileDataCapMB + delta)),
        })
      }
    >
      <Text style={{ color: '#00C2FF', fontWeight: '800', paddingHorizontal: 8 }}>
        {delta > 0 ? '+5' : '-5'}
      </Text>
    </Pressable>
  );

  const setDownloadRule = (
    network: DownloadNetwork,
    key: DownloadKey,
    value: boolean,
  ) => {
    s.setState({
      [network]: {
        ...s[network],
        [key]: value,
      },
    } as any);
  };

  return (
    <View style={{ gap: 10 }}>
      <Row
        label="Enable Data Saver"
        value={s.enabled}
        onChange={v => s.setState({ enabled: v })}
      />
      <Row
        label="Autoplay on Wi-Fi only"
        value={s.autoplayOnWifiOnly}
        onChange={v => s.setState({ autoplayOnWifiOnly: v })}
      />
      <Row
        label="Thumbnails-only feed"
        value={s.thumbnailsOnlyInFeed}
        onChange={v => s.setState({ thumbnailsOnlyInFeed: v })}
      />
      <Row
        label="Wi-Fi-only downloads"
        value={s.wifiOnlyDownloads}
        onChange={v => s.setState({ wifiOnlyDownloads: v })}
      />
      <Row
        label="Prefer AV1/HEVC if available"
        value={s.preferModernCodec}
        onChange={v => s.setState({ preferModernCodec: v })}
      />

      <Text style={{ color: '#9cc', marginTop: 6 }}>Downloads on mobile data</Text>
      <DownloadRuleRow
        label="Photos"
        value={s.downloadOnCellular.photos}
        onChange={v => setDownloadRule('downloadOnCellular', 'photos', v)}
      />
      <DownloadRuleRow
        label="Videos"
        value={s.downloadOnCellular.videos}
        onChange={v => setDownloadRule('downloadOnCellular', 'videos', v)}
      />
      <DownloadRuleRow
        label="Audio"
        value={s.downloadOnCellular.audio}
        onChange={v => setDownloadRule('downloadOnCellular', 'audio', v)}
      />
      <DownloadRuleRow
        label="Documents"
        value={s.downloadOnCellular.documents}
        onChange={v => setDownloadRule('downloadOnCellular', 'documents', v)}
      />

      <Text style={{ color: '#9cc', marginTop: 6 }}>Downloads on Wi-Fi</Text>
      <DownloadRuleRow
        label="Photos"
        value={s.downloadOnWifi.photos}
        onChange={v => setDownloadRule('downloadOnWifi', 'photos', v)}
      />
      <DownloadRuleRow
        label="Videos"
        value={s.downloadOnWifi.videos}
        onChange={v => setDownloadRule('downloadOnWifi', 'videos', v)}
      />
      <DownloadRuleRow
        label="Audio"
        value={s.downloadOnWifi.audio}
        onChange={v => setDownloadRule('downloadOnWifi', 'audio', v)}
      />
      <DownloadRuleRow
        label="Documents"
        value={s.downloadOnWifi.documents}
        onChange={v => setDownloadRule('downloadOnWifi', 'documents', v)}
      />

      <Text style={{ color: '#9cc', marginTop: 6 }}>Video quality</Text>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#0c2136',
          borderRadius: 12,
          padding: 4,
          alignSelf: 'flex-start',
        }}
      >
        <Seg opt="low" />
        <Seg opt="med" />
        <Seg opt="high" />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#9cc' }}>Mobile data limit: {s.mobileDataCapMB} MB</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ChangeCap delta={-5} />
          <ChangeCap delta={+5} />
        </View>
      </View>

      <Text style={{ color: '#6fa' }}>
        Current network: {s.cellular ? 'Cellular' : 'Wi-Fi / Other'}
      </Text>
    </View>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: '#dfe', fontSize: 16 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function DownloadRuleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: '#bfe6ff', fontSize: 15 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
