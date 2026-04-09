import pathlib
import sys
path = pathlib.Path('App.tsx')
data = path.read_text(encoding='utf-8')
old = """        <Animated.View
          style={{
            alignItems: 'center',
            opacity: fadeAnim,
            paddingBottom: 40,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center' }}>
              ?? Dive into waves
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 15,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              ?? Make splashes
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 15,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              ?? Send echoes
            </Text>
          </View>
          
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 }}>
            Tap to continue
          </Text>
          
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>
            Version 2
          </Text>
        </Animated.View>
"""
new = """        <Animated.View
          style={{
            alignItems: 'center',
            opacity: fadeAnim,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              Dive into waves
            </Text>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#7C0000',
              }}
            />
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              Make Splashes
            </Text>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#7C0000',
              }}
            />
            <Text
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              Send echoes
            </Text>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 }}>
            Tap to continue
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>
            Version 2
          </Text>
        </Animated.View>
"""
new_data = data.replace(old, new, 1)
if old == new_data:
    sys.exit('pattern not found')
path.write_text(new_data, encoding='utf-8')
