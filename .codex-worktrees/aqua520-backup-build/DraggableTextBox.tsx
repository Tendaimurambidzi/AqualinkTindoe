import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  Pressable,
} from 'react-native';

type DraggableTextBoxProps = {
  containerWidth: number;
  containerHeight: number;
  initialX?: number;
  initialY?: number;
  text?: string;
};

const DraggableTextBox: React.FC<DraggableTextBoxProps> = ({
  containerWidth,
  containerHeight,
  initialX = 50,
  initialY = 50,
  text = 'Sonar captions',
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const lastPosition = useRef({ x: initialX, y: initialY });
  const canDragRef = useRef(false); // only true after long press

  // Reset position if container size changes (e.g., new media)
  React.useEffect(() => {
    setPosition({ x: initialX, y: initialY });
    lastPosition.current = { x: initialX, y: initialY };
  }, [containerWidth, containerHeight, initialX, initialY]);

  const clampPos = (x: number, y: number) => {
    const padding = 10;
    const clampedX = Math.max(padding, Math.min(x, containerWidth - padding));
    const clampedY = Math.max(padding, Math.min(y, containerHeight - padding));
    return { x: clampedX, y: clampedY };
  };

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (!canDragRef.current) return; // only drag after long press
        const newX = lastPosition.current.x + gestureState.dx;
        const newY = lastPosition.current.y + gestureState.dy;
        const clamped = clampPos(newX, newY);
        setPosition(clamped);
      },

      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (!canDragRef.current) return;
        const newX = lastPosition.current.x + gestureState.dx;
        const newY = lastPosition.current.y + gestureState.dy;
        const clamped = clampPos(newX, newY);
        lastPosition.current = clamped;
        setPosition(clamped);
        // lock dragging again until next long press
        canDragRef.current = false;
      },
    })
  ).current;

  // Always clamp position if container size changes
  React.useEffect(() => {
    setPosition(pos => clampPos(pos.x, pos.y));
    lastPosition.current = clampPos(lastPosition.current.x, lastPosition.current.y);
  }, [containerWidth, containerHeight]);

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.boxContainer,
        {
          left: position.x,
          top: position.y,
          zIndex: 10,
        },
      ]}
      pointerEvents="box-only"
    >
      <Pressable
        onLongPress={() => {
          // after long press, allow dragging
          canDragRef.current = true;
        }}
        delayLongPress={250}
      >
        <View style={styles.textBox}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    position: 'absolute',
  },
  textBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DraggableTextBox;
