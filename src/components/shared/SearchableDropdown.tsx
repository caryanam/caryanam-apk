import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronDown, Search, X } from "lucide-react-native";

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function SearchableDropdown({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
}: SearchableDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <>
      <View style={[styles.container, disabled && { opacity: 0.5 }]}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.trigger}
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found.</Text>
              }
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  triggerPlaceholder: {
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
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
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#0f172a",
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: {
    fontSize: 15,
    color: "#334155",
  },
  optionTextSelected: {
    color: "#f43f5e",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 20,
    fontSize: 14,
  },
});
