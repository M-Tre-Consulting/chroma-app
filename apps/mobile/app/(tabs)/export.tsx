import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  exportCSS,
  exportSCSS,
  exportJSON,
  exportTailwind,
  exportAndroidXml,
} from "@chroma/core";
import { useTokenStore, usePaletteStore } from "../_layout";

type Format = "css" | "scss" | "json" | "tailwind" | "android";

const FORMATS: {
  id: Format;
  label: string;
  ext: string;
  description: string;
}[] = [
  {
    id: "css",
    label: "CSS custom properties",
    ext: "css",
    description: "Paste into any stylesheet",
  },
  {
    id: "scss",
    label: "SCSS variables",
    ext: "scss",
    description: "Import into SCSS projects",
  },
  {
    id: "json",
    label: "Style Dictionary",
    ext: "json",
    description: "Amazon Style Dictionary format",
  },
  {
    id: "tailwind",
    label: "Tailwind config",
    ext: "ts",
    description: "Paste into tailwind.config.ts",
  },
  {
    id: "android",
    label: "Android XML",
    ext: "xml",
    description: "Drop into res/values/colors.xml",
  },
];

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const [format, setFormat] = useState<Format>("css");
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { groups } = useTokenStore();
  const { palettes } = usePaletteStore();

  function generate(f: Format): string {
    switch (f) {
      case "css":
        return exportCSS(groups, palettes);
      case "scss":
        return exportSCSS(groups, palettes);
      case "json":
        return exportJSON(groups, palettes);
      case "tailwind":
        return exportTailwind(groups, palettes);
      case "android":
        return exportAndroidXml(groups, palettes);
    }
  }

  const output = generate(format);
  const isEmpty =
    groups.length === 0 || groups.every((g) => g.tokens.length === 0);
  const currentFormat = FORMATS.find((f) => f.id === format)!;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({
      message: output,
      title: `chroma-tokens.${currentFormat.ext}`,
    });
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Export</Text>
        <Text style={s.subtitle}>
          {groups.length} group{groups.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Format selector */}
      <View style={s.selectorSection}>
        <Text style={s.selectorLabel}>Format</Text>
        <TouchableOpacity
          style={s.selectorTrigger}
          activeOpacity={0.7}
          onPress={() => setShowDropdown(true)}
        >
          <View style={s.selectorTriggerLeft}>
            <View style={s.selectorIconWrapper}>
              <MaterialCommunityIcons
                name="code-braces"
                size={18}
                color="#9d93f9"
              />
            </View>
            <View>
              <Text style={s.selectorTriggerText}>{currentFormat.label}</Text>
              <Text style={s.selectorTriggerSub}>.{currentFormat.ext}</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#5f5e5a"
          />
        </TouchableOpacity>
      </View>

      {/* Output preview */}
      <ScrollView
        style={s.outputScroll}
        contentContainerStyle={s.outputContent}
      >
        {isEmpty ? (
          <Text style={s.empty}>
            Add tokens in the Tokens tab to generate exports
          </Text>
        ) : (
          <Text style={s.outputText}>{output}</Text>
        )}
      </ScrollView>

      {/* Actions */}
      {!isEmpty && (
        <View style={[s.actions, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnCopy]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Text style={s.actionBtnText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnShare]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={[s.actionBtnText, { color: "#9d93f9" }]}>
              Share as .{currentFormat.ext}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowDropdown(false)} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Select format</Text>
          {FORMATS.map((f, index) => (
            <TouchableOpacity
              key={f.id}
              style={[
                s.sheetItem,
                index < FORMATS.length - 1 && s.sheetItemBorder,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                setFormat(f.id);
                setShowDropdown(false);
              }}
            >
              <View style={s.sheetItemLeft}>
                <Text
                  style={[
                    s.sheetItemLabel,
                    format === f.id && s.sheetItemLabelActive,
                  ]}
                >
                  {f.label}
                </Text>
                <Text style={s.sheetItemDesc}>{f.description}</Text>
              </View>
              <View style={s.sheetItemRight}>
                <Text style={s.sheetItemExt}>.{f.ext}</Text>
                {format === f.id && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#9d93f9"
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111110" },
  header: { padding: 16, paddingBottom: 12 },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: "#f0efe9",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, color: "#888780", marginTop: 2 },

  selectorSection: { paddingHorizontal: 16, paddingBottom: 12 },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888780",
    letterSpacing: 0.08,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  selectorTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#2e2e2e",
  },
  selectorTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(157,147,249,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorTriggerText: { fontSize: 14, fontWeight: "500", color: "#f0efe9" },
  selectorTriggerSub: {
    fontSize: 11,
    color: "#888780",
    marginTop: 1,
    fontFamily: "monospace",
  },

  outputScroll: { flex: 1 },
  outputContent: { padding: 12 },
  empty: {
    textAlign: "center",
    color: "#5f5e5a",
    fontSize: 14,
    paddingTop: 48,
  },
  outputText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#c0bfba",
    lineHeight: 20,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#2e2e2e",
  },
  actionBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  actionBtnCopy: { backgroundColor: "#9d93f9" },
  actionBtnShare: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#9d93f9",
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3a3a3a",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: 0.08,
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  sheetItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#2e2e2e",
  },
  sheetItemLeft: { flex: 1, gap: 2 },
  sheetItemLabel: { fontSize: 15, fontWeight: "500", color: "#f0efe9" },
  sheetItemLabelActive: { color: "#9d93f9" },
  sheetItemDesc: { fontSize: 11, color: "#5f5e5a" },
  sheetItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  sheetItemExt: { fontSize: 11, color: "#5f5e5a", fontFamily: "monospace" },
});
