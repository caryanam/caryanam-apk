import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "premium";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  onPress,
  title,
  variant = "default",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyles = () => {
    const base: any[] = [styles.button];
    if (variant === "default") base.push(styles.variantDefault);
    else if (variant === "secondary") base.push(styles.variantSecondary);
    else if (variant === "outline") base.push(styles.variantOutline);
    else if (variant === "destructive") base.push(styles.variantDestructive);
    else if (variant === "premium") base.push(styles.variantPremium);

    if (size === "sm") base.push(styles.sizeSm);
    else if (size === "md") base.push(styles.sizeMd);
    else if (size === "lg") base.push(styles.sizeLg);

    if (disabled || loading) base.push(styles.disabled);

    return base;
  };

  const getTextStyles = () => {
    const base: any[] = [styles.text];
    if (variant === "default" || variant === "destructive" || variant === "premium") {
      base.push(styles.textLight);
    } else if (variant === "secondary") {
      base.push(styles.textDark);
    } else if (variant === "outline") {
      base.push(styles.textOutline);
    }

    if (size === "sm") base.push(styles.textSm);
    else if (size === "md") base.push(styles.textMd);
    else if (size === "lg") base.push(styles.textLg);

    return base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getButtonStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "secondary" ? "#0f172a" : "#fff"
          }
          size="small"
        />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  variantDefault: {
    backgroundColor: "#f43f5e", // Rose 500
  },
  variantSecondary: {
    backgroundColor: "#f1f5f9", // Slate 100
    borderColor: "#e2e8f0",
  },
  variantOutline: {
    backgroundColor: "transparent",
    borderColor: "#cbd5e1",
  },
  variantDestructive: {
    backgroundColor: "#ef4444", // Red 500
  },
  variantPremium: {
    backgroundColor: "#1e1b4b", // Deep indigo
    borderColor: "#312e81",
  },
  sizeSm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sizeMd: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sizeLg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  textLight: {
    color: "#fff",
  },
  textDark: {
    color: "#0f172a",
  },
  textOutline: {
    color: "#475569",
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },
});
