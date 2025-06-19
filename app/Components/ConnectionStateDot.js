import React from 'react';
import {View, StyleSheet} from 'react-native';

const COLORS = {
  connected: '#4CAF50', // Green
  connecting: '#FFC107', // Amber/Yellow
  disconnected: '#F44336', // Red
};

const ConnectionStateDot = ({state}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.dot,
          {backgroundColor: COLORS[state] || COLORS.disconnected},
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    elevation: 9999,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: COLORS.disconnected,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default ConnectionStateDot;
