import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';

interface DraggableTextBoxProps {
  text: string;
  initialX?: number;
  initialY?: number;
  containerWidth: number;
  containerHeight: number;
  onPositionChange?: (x: number, y: number) => void;
}

export default function DraggableTextBox({
  text,
  initialX = 24,
  initialY = 100,
  containerWidth,
  containerHeight,
  onPositionChange,
}: DraggableTextBoxProps) {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const lastPosition = useRef({ x: initialX, y: initialY });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: lastPosition.current.x,
          y: lastPosition.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        // Calculate final position
        let finalX = lastPosition.current.x + gesture.dx;
        let finalY = lastPosition.current.y + gesture.dy;

        // Constrain within bounds (with padding)
        const textBoxWidth = 200; // Approximate width
        const textBoxHeight = 60; // Approximate height
        const padding = 10;

        finalX = Math.max(padding, Math.min(containerWidth - textBoxWidth - padding, finalX));
        finalY = Math.max(padding, Math.min(containerHeight - textBoxHeight - padding, finalY));

        // Update position
        lastPosition.current = { x: finalX, y: finalY };
        
        // Animate to constrained position
        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();

        // Notify parent
        onPositionChange?.(finalX, finalY);
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggable,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  draggable: {
    position: 'absolute',
    zIndex: 1000,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 100,
    maxWidth: 300,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
