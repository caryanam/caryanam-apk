import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { VehicleCard, VehicleCardSkeleton } from "../../components/cards/VehicleCard";
import { useAllVehicles } from "../../hooks/public/useAllVehicles";
import { useAreas } from "../../hooks/public/useAreas";
import { getCustomerBrands, getCustomerModels, getCustomerVariants } from "../../data/customerCarDatabase";
import { BUDGET_BANDS, FUELS, OWNERSHIPS } from "../../utils/constants";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import {
  SlidersHorizontal as SlidersHorizontalIcon,
  Search as SearchIcon,
  X as XIcon,
  RefreshCw as RefreshCwIcon,
  Car as CarIcon,
} from "lucide-react-native";

const SlidersHorizontal = SlidersHorizontalIcon as any;
const Search = SearchIcon as any;
const X = XIcon as any;
const RefreshCw = RefreshCwIcon as any;
const Car = CarIcon as any;

const isPCMC = (area: string) => {
  const pcmcAreas = [
    "pcmc",
    "chinchwad",
    "pimpri",
    "akurdi",
    "nigdi",
    "bhosari",
    "sangvi",
    "wakad",
    "hinjawadi",
    "hinjeweadi",
    "tathawade",
    "ravet",
    "moshi",
    "talawade",
    "kalewadi",
    "thergaon",
    "rahatani",
    "pimple saudagar",
    "pimple nilakh",
  ];
  return pcmcAreas.some((a) => area.toLowerCase().includes(a));
};

type CarsScreenRouteProp = RouteProp<RootStackParamList, "Cars">;

const PAGE_SIZE = 10;

export default function Cars() {
  const route = useRoute<any>();

  // Filter overlays state
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Core search states
  const [searchQuery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState(route.params?.brand || "");
  const [model, setModel] = useState(route.params?.model || "");
  const [city, setCity] = useState(route.params?.city || "");
  const [variant, setVariant] = useState("");
  const [fuel, setFuel] = useState("");
  const [ownership, setOwnership] = useState("");
  const [sort, setSort] = useState("latest");
  const [budgetLabel, setBudgetLabel] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync route params when navigated with deep link parameters
  useEffect(() => {
    if (route.params?.brand) {
      setBrand(route.params.brand);
    }
    if (route.params?.model) {
      setModel(route.params.model);
    }
    if (route.params?.city) {
      setCity(route.params.city);
    }
  }, [route.params]);

  // Fetch all listings
  const { vehicles: all, loading, error, refetch, isRefetching } = useAllVehicles();
  const { data: areas = [] } = useAreas();

  // Dynamic location list including broad and specific choices
  const CITIES_DYNAMIC = useMemo(() => {
    const apiSet = new Set(areas.map((a) => a.toLowerCase()));
    const uniqueFromVehicles = Array.from(new Set(all.map((v) => v.city).filter(Boolean)))
      .map((c: any) => c.trim())
      .filter((c: any) => c.length > 0 && !apiSet.has(c.toLowerCase()))
      .sort();
    return [...areas, ...uniqueFromVehicles];
  }, [areas, all]);

  const CAR_BRANDS = getCustomerBrands("non-premium");

  // Cascading options dynamically generated from the fetched data
  const modelsList = useMemo(() => {
    if (!brand) return [];
    return getCustomerModels(brand, "non-premium");
  }, [brand]);

  const variantsList = useMemo(() => {
    if (!brand || !model) return [];
    return getCustomerVariants(brand, model, "non-premium");
  }, [brand, model]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setBrand("");
    setModel("");
    setVariant("");
    setCity("");
    setFuel("");
    setOwnership("");
    setBudgetLabel("");
    setMinYear("");
    setMaxKm("");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
  };

  // Resolve budget values
  const activeBudgetBand = useMemo(() => {
    if (!budgetLabel) return null;
    return BUDGET_BANDS.find((b) => b.label === budgetLabel);
  }, [budgetLabel]);

  const FUEL_LABELS: Record<string, string> = { PETROL: "Petrol", DIESEL: "Diesel", CNG: "CNG", LPG: "LPG", ELECTRIC: "Electric", HYBRID: "Hybrid" };
  const OWNERSHIP_LABELS: Record<string, string> = { "1": "1st Owner", "2": "2nd Owner", "3": "3rd Owner", "4": "4th Owner" };

  // Filter listings local logic
  const filteredVehicles = useMemo(() => {
    let result = [...all];

    if (brand && brand !== "all") {
      result = result.filter((v) => v.brand?.toLowerCase() === brand.toLowerCase());
    }

    if (model && model !== "all") {
      result = result.filter((v) => {
        const vm = v.model?.toLowerCase() || "";
        const m = model.toLowerCase();
        return vm.includes(m);
      });
    }

    if (variant && variant !== "all") {
      result = result.filter((v) => v.variant?.toLowerCase().includes(variant.toLowerCase()));
    }

    if (city && city !== "all") {
      if (city.toLowerCase() === "pcmc") {
        result = result.filter((v) => v.city && isPCMC(v.city));
      } else if (city.toLowerCase() === "pune") {
        result = result.filter((v) => v.city && !isPCMC(v.city));
      } else {
        result = result.filter((v) => v.city?.toLowerCase() === city.toLowerCase());
      }
    }

    if (fuel && fuel !== "all") {
      result = result.filter((v) => v.fuelType?.toUpperCase() === fuel.toUpperCase());
    }

    if (ownership && ownership !== "all") {
      result = result.filter((v) => Number(v.ownershipDetails) === Number(ownership));
    }

    if (activeBudgetBand) {
      result = result.filter(
        (v) => v.askingPrice >= activeBudgetBand.min && v.askingPrice < activeBudgetBand.max
      );
    }

    if (minPrice || maxPrice) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || 5000000;
      result = result.filter(
        (v) => v.askingPrice >= min && v.askingPrice <= max
      );
    }

    if (minYear) {
      const y = parseInt(minYear, 10);
      if (!isNaN(y)) {
        result = result.filter((v) => v.registrationYear >= y);
      }
    }

    if (maxKm) {
      const k = parseInt(maxKm, 10);
      if (!isNaN(k)) {
        result = result.filter((v) => v.kilometerDriven <= k);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.brand?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.variant?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q)
      );
    }

    // Sort listings local logic
    if (sort === "price-asc") {
      result.sort((a, b) => a.askingPrice - b.askingPrice);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.askingPrice - a.askingPrice);
    } else if (sort === "km-asc") {
      result.sort((a, b) => a.kilometerDriven - b.kilometerDriven);
    } else if (sort === "year-desc") {
      result.sort((a, b) => b.registrationYear - a.registrationYear);
    } else {
      // Default Sort: Latest (Created Date)
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [
    all,
    searchQuery,
    brand,
    model,
    city,
    fuel,
    ownership,
    activeBudgetBand,
    minYear,
    maxKm,
    minPrice,
    maxPrice,
    sort,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredVehicles]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = useMemo(() => {
    return (
      (brand && brand !== "all") ||
      (model && model !== "all") ||
      (variant && variant !== "all") ||
      (city && city !== "all") ||
      (fuel && fuel !== "all") ||
      (ownership && ownership !== "all") ||
      budgetLabel ||
      minYear ||
      maxKm ||
      minPrice ||
      maxPrice
    );
  }, [brand, model, variant, city, fuel, ownership, budgetLabel, minYear, maxKm, minPrice, maxPrice]);

  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      <View>
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>Browse Cars Collection — Caryanam</Text>
          <Text style={styles.description}>
            Explore our vast collection of certified used cars. Find the perfect vehicle that fits your budget and lifestyle.
          </Text>
        </View>
        
        {/* Search Header Row */}
        <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search brand, model..."
            style={styles.searchInputWrapper}
            inputStyle={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFilterModalVisible(true)}
          style={styles.filterButton}
        >
          <SlidersHorizontal size={18} color="#0f172a" />
          <Text style={styles.filterButtonText}>Filter</Text>
          {hasActiveFilters ? <View style={styles.activeFilterDot} /> : null}
        </TouchableOpacity>
      </View>

      {/* Sorting bar & listing counts */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {loading ? "Loading..." : `${filteredVehicles.length} cars found`}
        </Text>

        <View style={styles.sortDropdownContainer}>
          <Select
            value={sort}
            onValueChange={setSort}
            options={[
              { value: "latest", label: "Newest first" },
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "km-asc", label: "Lowest KM" },
              { value: "year-desc", label: "Newest Year" },
            ]}
            placeholder="Sort by"
            style={styles.sortSelect}
          />
        </View>
      </View>

      {/* Main List */}
      <View>
        {loading ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={(i) => String(i)}
            renderItem={() => <VehicleCardSkeleton />}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={refetch} style={styles.retryButton} />
          </View>
        ) : filteredVehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconSquare}>
              <Car size={32} color="#ffffff" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 10, textAlign: "center" }}>
              No vehicles match your criteria
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 }}>
              Try adjusting or clearing some filters to broaden your search results.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: "#f43f5e", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, minWidth: 160 }} 
              onPress={handleClearFilters}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold", textAlign: "center", fontSize: 16 }}>
                Reset All Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={paginatedVehicles}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <VehicleCard vehicle={item} />
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        )}
        
        {/* Pagination Controls */}
        {!loading && !error && filteredVehicles.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]} 
              onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            
            <TouchableOpacity 
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]} 
              onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Detailed Filters Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Refine Search</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={["form"]}
            keyExtractor={(i) => i}
            renderItem={() => (
              <View style={styles.modalBody}>
                {/* Brand */}
                <Select
                  label="Brand"
                  value={brand}
                  onValueChange={(v) => {
                    setBrand(v === "all" ? "" : v);
                    setModel("");
                    setVariant("");
                  }}
                  options={[
                    { value: "all", label: "All Brands" },
                    ...CAR_BRANDS.map((b) => ({ value: b, label: b })),
                  ]}
                  placeholder="Select Brand"
                />

                {/* Model */}
                {brand && brand !== "all" && (
                  <Select
                    label="Model"
                    value={model}
                    onValueChange={(v) => {
                      setModel(v === "all" ? "" : v);
                      setVariant("");
                    }}
                    options={[
                      { value: "all", label: "All Models" },
                      ...modelsList.map((m) => ({ value: m, label: m })),
                    ]}
                    placeholder="Select Model"
                  />
                )}

                {/* Variant */}
                {model && model !== "all" && (
                  <Select
                    label="Variant"
                    value={variant}
                    onValueChange={(v) => setVariant(v === "all" ? "" : v)}
                    options={[
                      { value: "all", label: "All Variants" },
                      ...variantsList.map((v) => ({ value: v, label: v })),
                    ]}
                    placeholder="Select Variant"
                  />
                )}

                {/* City */}
                <Select
                  label="City"
                  value={city}
                  onValueChange={(v) => setCity(v === "all" ? "" : v)}
                  options={[
                    { value: "all", label: "All Cities" },
                    { value: "pcmc", label: "PCMC" },
                    { value: "pune", label: "Pune" },
                    ...CITIES_DYNAMIC.map((c) => ({ value: c, label: c })),
                  ]}
                  placeholder="Select City"
                />

                {/* Fuel Type */}
                <Select
                  label="Fuel Type"
                  value={fuel}
                  onValueChange={(v) => setFuel(v === "all" ? "" : v)}
                  options={[
                    { value: "all", label: "All Fuels" },
                    ...FUELS.map((f) => ({ value: f, label: FUEL_LABELS[f] || f })),
                  ]}
                  placeholder="Select Fuel"
                />

                {/* Ownership */}
                <Select
                  label="Ownership"
                  value={ownership}
                  onValueChange={(v) => setOwnership(v === "all" ? "" : v)}
                  options={[
                    { value: "all", label: "Any Owner" },
                    ...OWNERSHIPS.map((o) => ({ value: String(o), label: OWNERSHIP_LABELS[String(o)] || String(o) })),
                  ]}
                  placeholder="Select Ownership"
                />

                {/* Budget */}
                <Select
                  label="Budget"
                  value={budgetLabel}
                  onValueChange={setBudgetLabel}
                  options={["all", ...BUDGET_BANDS.map((b) => b.label)]}
                  placeholder="Select Budget"
                />

                {/* Min Registration Year */}
                <Input
                  label="Min Year"
                  value={minYear}
                  onChangeText={setMinYear}
                  placeholder="e.g. 2018"
                  keyboardType="numeric"
                />

                {/* Min Kilometers Driven */}
                <Input
                  label="Max KM Driven"
                  value={maxKm}
                  onChangeText={setMaxKm}
                  placeholder="e.g. 50000"
                  keyboardType="numeric"
                />

                {/* Min Price */}
                <Input
                  label="Min Price (₹)"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="e.g. 500000"
                  keyboardType="numeric"
                />

                {/* Max Price */}
                <Input
                  label="Max Price (₹)"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="e.g. 1500000"
                  keyboardType="numeric"
                />
              </View>
            )}
            contentContainerStyle={styles.modalScroll}
          />

          <View style={styles.modalFooter}>
            <Button
              title="Reset All"
              variant="outline"
              onPress={() => {
                handleClearFilters();
                setFilterModalVisible(false);
              }}
              style={styles.modalFooterBtn}
            />
            <Button
              title="Apply Filters"
              onPress={() => setFilterModalVisible(false)}
              style={[styles.modalFooterBtn, { marginLeft: 12 }]}
            />
          </View>
        </SafeAreaView>
      </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    marginRight: 10,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    fontSize: 14,
    height: "100%",
  },
  clearSearch: {
    padding: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginLeft: 8,
  },
  activeFilterDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#be185d",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
  },
  statsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  sortDropdownContainer: {
    width: 140,
  },
  sortSelect: {
    marginBottom: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  pageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: "#f8fafc",
    borderColor: "#f1f5f9",
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  pageButtonTextDisabled: {
    color: "#94a3b8",
  },
  pageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  retryButton: {
    width: 120,
  },
  emptyContainer: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
    marginBottom: 60,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIconSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#be123c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  resetBtn: {
    minWidth: 160,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontWeight: "800",
    color: "#0f172a",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  modalBody: {
    paddingBottom: 40,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  modalFooterBtn: {
    flex: 1,
  },
});
