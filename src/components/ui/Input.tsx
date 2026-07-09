import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  StyleProp,
} from "react-native";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  maxLength?: number;
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  keyboardType = "default",
  autoCapitalize = "none",
  style,
  inputStyle,
  multiline = false,
  numberOfLines,
  editable = true,
  maxLength,
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        maxLength={maxLength}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.inputDisabled,
          error ? styles.inputError : null,
          inputStyle,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});
