import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import {
  ChevronDown as ChevronDownIcon,
  X as XIcon,
} from "lucide-react-native";

const ChevronDown = ChevronDownIcon as any;
const X = XIcon as any;

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[] | string[];
  placeholder?: string;
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  label,
  error,
  style,
  triggerStyle,
  textStyle,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Normalize options array
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[
          styles.trigger,
          error ? styles.triggerError : null,
          triggerStyle,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption ? styles.placeholderText : null,
            textStyle,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={18} color={(StyleSheet.flatten(textStyle) as TextStyle)?.color as string || "#64748b"} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || placeholder || "Select option"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={normalizedOptions}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemActive,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.listContent}
            />
          </SafeAreaView>
        </View>
      </Modal>
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
  trigger: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  placeholderText: {
    color: "#94a3b8",
    fontWeight: "400",
  },
  triggerError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dismissOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionItemActive: {
    backgroundColor: "#fff1f2",
  },
  optionLabel: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "400",
  },
  optionLabelActive: {
    color: "#f43f5e",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  listContent: {
    paddingBottom: 24,
  },
});
