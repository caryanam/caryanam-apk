import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ChevronDown, Search, X, Plus } from "lucide-react-native";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  allowCustom?: boolean;
}

export default function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allowCustom = false,
}: SearchableSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lowerSearch));
  }, [options, search]);

  const exactMatchExists = useMemo(() => {
    return options.some(
      (opt) => opt.toLowerCase() === search.trim().toLowerCase()
    );
  }, [options, search]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setModalVisible(false);
    setSearch("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.triggerBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[styles.triggerText, value ? styles.hasValue : styles.noValue]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color="#94a3b8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  {!allowCustom || search.trim() === "" ? (
                    <Text style={styles.emptyText}>No results found.</Text>
                  ) : null}
                </View>
              )}
              ListFooterComponent={() => (
                <>
                  {allowCustom && search.trim() !== "" && !exactMatchExists && (
                    <TouchableOpacity
                      style={styles.addCustomBtn}
                      onPress={() => handleSelect(search.trim())}
                    >
                      <Plus size={16} color="#e11d48" />
                      <Text style={styles.addCustomText}>
                        Add "{search.trim()}"
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  triggerText: {
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  hasValue: {
    color: "#0f172a",
    fontWeight: "500",
  },
  noValue: {
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 15,
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
  selectedOptionText: {
    color: "#e11d48",
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  addCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 8,
  },
  addCustomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e11d48",
  },
});
