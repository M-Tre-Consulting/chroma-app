import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { usePaletteStore } from "../../_layout";
import { M3Input } from "../../../src/components/M3";
import { TouchableNativeFeedback, Platform } from "react-native";

export default function PalettesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const { palettes, addPalette, removePalette, setActivePalette } =
    usePaletteStore();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPalette(newName.trim());
    setNewName("");
  };

  const handleSelect = (id: string) => {
    setActivePalette(id);
    router.push(`/palettes/${id}`);
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Chroma</Text>
          <Text style={s.subtitle}>
            {palettes.length} palette{palettes.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Palette list */}
        <FlatList
          data={palettes}
          keyExtractor={(p) => p.id}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>Create your first palette below</Text>
          }
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.7}
              onPress={() => handleSelect(p.id)}
            >
              {/* Swatches */}
              <View style={s.swatches}>
                {p.colours.slice(0, 5).map((c) => (
                  <View
                    key={c.id}
                    style={[s.swatch, { backgroundColor: c.hex }]}
                  />
                ))}
                {p.colours.length === 0 && (
                  <View style={[s.swatch, { backgroundColor: "#2e2e2e" }]} />
                )}
              </View>

              {/* Info */}
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{p.name}</Text>
                <Text style={s.cardSub}>
                  {p.colours.length} colour{p.colours.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {/* Delete */}
              <TouchableOpacity
                onPress={() => removePalette(p.id)}
                style={s.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.deleteText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

        {/* Add palette bar */}
        <View
          style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <M3Input
            style={s.inputField}
            placeholder="New palette…"
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          {Platform.OS === "android" ? (
            <View style={s.addBtnWrapper}>
              <TouchableNativeFeedback
                onPress={handleAdd}
                background={TouchableNativeFeedback.Ripple(
                  "rgba(255,255,255,0.2)",
                  false,
                )}
                useForeground
              >
                <View style={s.addBtn}>
                  <Text style={s.addBtnText}>+</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          ) : (
            <TouchableOpacity
              style={s.addBtn}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111110" },
  header: { padding: 16, paddingBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#f0efe9",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, color: "#888780", marginTop: 2 },
  list: { padding: 12, gap: 8, paddingBottom: 24 },
  empty: {
    textAlign: "center",
    color: "#5f5e5a",
    fontSize: 14,
    paddingTop: 48,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 14,
    minHeight: 68,
  },
  swatches: { flexDirection: "row", gap: 5 },
  swatch: { width: 24, height: 24, borderRadius: 8 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "500", color: "#f0efe9" },
  cardSub: { fontSize: 12, color: "#888780", marginTop: 2 },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: "#5f5e5a", fontSize: 14 },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#2e2e2e",
    backgroundColor: "#111110",
    alignItems: "center",
  },
  inputField: { flex: 1 },
  addBtnWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#9d93f9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  addBtnText: { color: "#fff", fontSize: 26, lineHeight: 30 },
});
