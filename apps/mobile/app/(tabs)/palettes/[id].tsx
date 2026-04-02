import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import ColorPicker from "react-native-wheel-color-picker";
import { contrastRatio, wcagLevel } from "@chroma/core";
import { usePaletteStore } from "../../_layout";
import { M3Input, M3Button, M3Fab } from "../../../src/components/M3";

const WCAG_COLORS: Record<string, { bg: string; fg: string }> = {
  AAA: { bg: "#0f3d2e", fg: "#4ade80" },
  AA: { bg: "#1e1e4a", fg: "#a5b4fc" },
  "AA Large": { bg: "#2a2a1a", fg: "#fbbf24" },
  Fail: { bg: "#3d1515", fg: "#f87171" },
};

export default function PaletteColoursScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { palettes, addColour, removeColour } = usePaletteStore();
  const palette = palettes.find((p) => p.id === id);

  const [showModal, setShowModal] = useState(false);
  const [hex, setHex] = useState("9d93f9");
  const [colourName, setColourName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!palette) return null;

  const handleAdd = () => {
    if (!hex) return;
    addColour(palette.id, `#${hex}`, colourName || undefined);
    setColourName("");
    setHex("9d93f9");
    setShowModal(false);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>{palette.name}</Text>
          <Text style={s.subtitle}>
            {palette.colours.length} colour
            {palette.colours.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Colours list */}
      <FlatList
        data={palette.colours}
        keyExtractor={(c) => c.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Tap + to add a colour</Text>}
        renderItem={({ item: c }) => {
          const isExpanded = expandedId === c.id;
          const isValidHex = /^#[0-9a-fA-F]{6}$/.test(c.hex);
          const ratioWhite = isValidHex
            ? contrastRatio(c.hex, "#ffffff")
            : null;
          const ratioBlack = isValidHex
            ? contrastRatio(c.hex, "#000000")
            : null;
          const levelWhite = ratioWhite !== null ? wcagLevel(ratioWhite) : null;
          const ws = levelWhite ? WCAG_COLORS[levelWhite] : WCAG_COLORS["Fail"];

          return (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.8}
              onPress={() => setExpandedId(isExpanded ? null : c.id)}
            >
              {/* Top row */}
              <View style={s.cardRow}>
                <View style={[s.swatch, { backgroundColor: c.hex }]} />
                <View style={s.cardInfo}>
                  <Text style={s.cardName}>{c.name || c.hex}</Text>
                  <Text style={s.cardHex}>{c.hex.toUpperCase()}</Text>
                </View>
                {levelWhite && (
                  <View style={[s.badge, { backgroundColor: ws.bg }]}>
                    <Text style={[s.badgeText, { color: ws.fg }]}>
                      {levelWhite}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeColour(palette.id, c.id)}
                  style={s.deleteBtn}
                >
                  <Text style={s.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Expanded section */}
              {isExpanded && (
                <View style={s.expandedSection}>
                  {/* vs white */}
                  <View style={s.contrastRow}>
                    <View
                      style={[s.contrastSwatch, { backgroundColor: "#ffffff" }]}
                    />
                    <Text style={s.contrastLabel}>vs white</Text>
                    <Text style={s.contrastRatioText}>
                      {ratioWhite !== null ? `${ratioWhite}:1` : "—"}
                    </Text>
                    {levelWhite && (
                      <View
                        style={[
                          s.badge,
                          { backgroundColor: WCAG_COLORS[levelWhite].bg },
                        ]}
                      >
                        <Text
                          style={[
                            s.badgeText,
                            { color: WCAG_COLORS[levelWhite].fg },
                          ]}
                        >
                          {levelWhite}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[s.previewBox, { backgroundColor: "#ffffff" }]}>
                    <Text style={{ color: c.hex, fontSize: 14 }}>
                      The quick brown fox
                    </Text>
                  </View>

                  {/* vs black */}
                  <View style={s.contrastRow}>
                    <View
                      style={[
                        s.contrastSwatch,
                        { backgroundColor: "#000000", borderColor: "#333" },
                      ]}
                    />
                    <Text style={s.contrastLabel}>vs black</Text>
                    <Text style={s.contrastRatioText}>
                      {ratioBlack !== null ? `${ratioBlack}:1` : "—"}
                    </Text>
                    {ratioBlack !== null && (
                      <View
                        style={[
                          s.badge,
                          {
                            backgroundColor:
                              WCAG_COLORS[wcagLevel(ratioBlack)].bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.badgeText,
                            { color: WCAG_COLORS[wcagLevel(ratioBlack)].fg },
                          ]}
                        >
                          {wcagLevel(ratioBlack)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[s.previewBox, { backgroundColor: "#000000" }]}>
                    <Text style={{ color: c.hex, fontSize: 14 }}>
                      The quick brown fox
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* FAB */}
      <M3Fab
        onPress={() => setShowModal(true)}
        style={{ position: "absolute", right: 16, bottom: 24 }}
      />

      {/* Add colour modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowModal(false)} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sheetTitle}>Add colour</Text>

            {/* Colour wheel */}
            <View style={s.pickerWrapper}>
              <ColorPicker
                color={`#${hex}`}
                onColorChange={(color: string) =>
                  setHex(color.replace("#", ""))
                }
                thumbSize={28}
                sliderSize={28}
                noSnap
                row={false}
                swatchesLast={false}
                swatches={false}
                discrete={false}
              />
            </View>

            {/* Hex preview + input */}
            <View style={s.hexRow}>
              <View style={[s.hexPreview, { backgroundColor: `#${hex}` }]} />
              <View style={s.hexInputWrapper}>
                <Text style={s.hashSign}>#</Text>
                <M3Input
                  value={hex}
                  onChangeText={(v) => setHex(v.replace("#", ""))}
                  placeholder="9d93f9"
                  maxLength={6}
                  autoCapitalize="characters"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    borderBottomWidth: 0,
                    backgroundColor: "transparent",
                    paddingHorizontal: 4,
                  }}
                />
              </View>
            </View>

            {/* Name input */}
            <M3Input
              placeholder="Colour name (optional)"
              value={colourName}
              onChangeText={setColourName}
              style={{ marginTop: 10 }}
            />

            {/* Actions */}
            <View style={s.sheetActions}>
              <M3Button
                label="Cancel"
                onPress={() => setShowModal(false)}
                variant="outlined"
                style={{ flex: 1 }}
              />
              <M3Button
                label="Add colour"
                onPress={handleAdd}
                variant="filled"
                style={{ flex: 2 }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111110" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#f0efe9", fontSize: 20 },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "#f0efe9",
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 13, color: "#888780", marginTop: 2 },
  list: { padding: 12, gap: 8 },
  empty: {
    textAlign: "center",
    color: "#5f5e5a",
    fontSize: 14,
    paddingTop: 48,
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 14,
    minHeight: 64,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  swatch: { width: 44, height: 44, borderRadius: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: "500", color: "#f0efe9" },
  cardHex: { fontSize: 11, color: "#888780", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  deleteBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: "#5f5e5a", fontSize: 14 },
  expandedSection: {
    marginTop: 12,
    gap: 8,
  },
  contrastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contrastSwatch: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  contrastLabel: { flex: 1, fontSize: 12, color: "#888780" },
  contrastRatioText: { fontSize: 12, fontWeight: "500", color: "#f0efe9" },
  previewBox: { borderRadius: 8, padding: 10 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#f0efe9",
    marginBottom: 12,
  },
  pickerWrapper: {
    height: 280,
    marginBottom: 16,
  },
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hexPreview: { width: 44, height: 44, borderRadius: 12 },
  hexInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#9d93f9",
    paddingHorizontal: 12,
  },
  hashSign: { color: "#888780", fontSize: 14 },
  sheetActions: { flexDirection: "row", gap: 10, marginTop: 16 },
});
