import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  style?: ViewStyle | ViewStyle[];
}

export default function Skeleton({ style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        { opacity: animatedValue },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#cbd5e1",
    borderRadius: 4,
  },
});
