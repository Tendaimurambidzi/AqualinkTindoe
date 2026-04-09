import React from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

type SectionHeaderRowProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<TextStyle>;
};

const SectionHeaderRow: React.FC<SectionHeaderRowProps> = ({
  title,
  actionLabel,
  onActionPress,
  containerStyle,
  titleStyle,
  actionStyle,
}) => {
  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={actionStyle}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default SectionHeaderRow;

