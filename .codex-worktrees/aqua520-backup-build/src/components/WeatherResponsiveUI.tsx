import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WeatherCondition = 'sunny' | 'rainy' | 'stormy' | 'night' | 'cloudy';

interface WeatherResponsiveUIProps {
  children: React.ReactNode;
}

interface WeatherTheme {
  background: string;
  accentColor: string;
  particleEmoji: string;
  overlayOpacity: number;
}

const WeatherResponsiveUI: React.FC<WeatherResponsiveUIProps> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [currentTheme, setCurrentTheme] = useState<WeatherTheme>({
    background: 'linear-gradient(180deg, #001F3F 0%, #003366 100%)',
    accentColor: '#00C2FF',
    particleEmoji: '',
    overlayOpacity: 0,
  });

  useEffect(() => {
    checkWeatherAndTime();
    const interval = setInterval(checkWeatherAndTime, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const checkWeatherAndTime = async () => {
    const hour = new Date().getHours();
    
    // Check if it's night time
    if (hour >= 20 || hour < 6) {
      setWeather('night');
      setCurrentTheme({
        background: 'linear-gradient(180deg, #000814 0%, #001D3D 100%)',
        accentColor: '#00FFD1',
        particleEmoji: '✨',
        overlayOpacity: 0.2,
      });
      return;
    }

    // Try to get actual weather (in production, use weather API)
    // For now, use simulated weather based on time
    const weatherCondition = simulateWeather();
    setWeather(weatherCondition);
    setCurrentTheme(getThemeForWeather(weatherCondition));
  };

  const simulateWeather = (): WeatherCondition => {
    const hour = new Date().getHours();
    
    // Morning and evening more likely to be cloudy
    if ((hour >= 6 && hour < 9) || (hour >= 17 && hour < 20)) {
      return Math.random() > 0.5 ? 'cloudy' : 'sunny';
    }
    
    // Midday usually sunny
    if (hour >= 10 && hour < 16) {
      return 'sunny';
    }
    
    // Random other times
    const rand = Math.random();
    if (rand > 0.8) return 'rainy';
    if (rand > 0.6) return 'stormy';
    if (rand > 0.3) return 'cloudy';
    return 'sunny';
  };

  const getThemeForWeather = (condition: WeatherCondition): WeatherTheme => {
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

  return (
    <View style={styles.container}>
      {/* Weather overlay */}
      <View
        style={[
          styles.weatherOverlay,
          {
            backgroundColor:
              weather === 'night'
                ? 'rgba(0, 0, 40, 0.4)'
                : weather === 'stormy'
                ? 'rgba(20, 20, 20, 0.5)'
                : weather === 'rainy'
                ? 'rgba(40, 60, 80, 0.3)'
                : 'transparent',
          },
        ]}
        pointerEvents="none"
      />

      {/* Weather particles */}
      {weather === 'rainy' && <RainParticles />}
      {weather === 'stormy' && <StormEffect />}
      {weather === 'night' && <NightStars />}

      {/* Weather indicator */}
      <View style={styles.weatherIndicator} pointerEvents="none">
        <Text style={styles.weatherEmoji}>{currentTheme.particleEmoji}</Text>
        <Text style={styles.weatherLabel}>
          {weather.charAt(0).toUpperCase() + weather.slice(1)}
        </Text>
      </View>

      {children}
    </View>
  );
};

const RainParticles: React.FC = () => {
  const raindrops = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 2,
  }));

  return (
    <View style={styles.particlesContainer} pointerEvents="none">
      {raindrops.map((drop) => (
        <View
          key={drop.id}
          style={[
            styles.raindrop,
            {
              left: `${drop.left}%`,
            },
          ]}
        />
      ))}
    </View>
  );
};

const StormEffect: React.FC = () => {
  return (
    <View style={styles.particlesContainer} pointerEvents="none">
      <View style={styles.lightning} />
    </View>
  );
};

const NightStars: React.FC = () => {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * SCREEN_WIDTH,
    top: Math.random() * SCREEN_HEIGHT * 0.5,
    size: 2 + Math.random() * 3,
  }));

  return (
    <View style={styles.particlesContainer} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weatherOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
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
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
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

export default WeatherResponsiveUI;
