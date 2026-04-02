import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useTokenStore, usePaletteStore } from "../_layout";
import { M3Input } from "../../src/components/M3";

export default function TokensScreen() {
  const insets = useSafeAreaInsets();
  const [newGroupName, setNewGroupName] = useState("");
  const [newTokenNames, setNewTokenNames] = useState<Record<string, string>>(
    {},
  );
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const { groups, addGroup, removeGroup, addToken, removeToken, assignColour } =
    useTokenStore();
  const { palettes } = usePaletteStore();

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    addGroup(newGroupName.trim());
    setNewGroupName("");
  };

  const handleAddToken = (groupId: string) => {
    const name = newTokenNames[groupId]?.trim();
    if (!name) return;
    addToken(groupId, name);
    setNewTokenNames((prev) => ({ ...prev, [groupId]: "" }));
  };

  const FilledButton = ({
    label,
    onPress,
  }: {
    label: string;
    onPress: () => void;
  }) => {
    if (Platform.OS === "android") {
      return (
        <View style={s.filledBtnWrapper}>
          <TouchableNativeFeedback
            onPress={onPress}
            background={TouchableNativeFeedback.Ripple(
              "rgba(255,255,255,0.2)",
              false,
            )}
            useForeground
          >
            <View style={s.filledBtn}>
              <Text style={s.filledBtnText}>{label}</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={s.filledBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={s.filledBtnText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Tokens</Text>
        <Text style={s.subtitle}>
          {groups.length} group{groups.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Groups list */}
      <ScrollView contentContainerStyle={s.list}>
        {groups.length === 0 && (
          <Text style={s.empty}>Add a group to start mapping tokens</Text>
        )}

        {groups.map((group) => (
          <View key={group.id} style={s.groupCard}>
            {/* Group header */}
            <TouchableOpacity
              style={s.groupHeader}
              activeOpacity={0.7}
              onPress={() =>
                setExpandedGroup(expandedGroup === group.id ? null : group.id)
              }
            >
              <Text style={s.groupLabel}>{group.name.toUpperCase()}</Text>
              <View style={s.groupHeaderRight}>
                <Text style={s.groupCount}>
                  {group.tokens.length} token
                  {group.tokens.length !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity
                  onPress={() => removeGroup(group.id)}
                  style={s.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Tokens */}
            {expandedGroup === group.id && (
              <View style={s.tokensSection}>
                {group.tokens.map((token) => {
                  const assignedPalette = palettes.find(
                    (p) => p.id === token.value.paletteId,
                  );
                  const assignedColour = assignedPalette?.colours.find(
                    (c) => c.id === token.value.colourId,
                  );

                  return (
                    <View key={token.id} style={s.tokenRow}>
                      <View
                        style={[
                          s.tokenSwatch,
                          { backgroundColor: assignedColour?.hex ?? "#2a2a2a" },
                        ]}
                      />
                      <Text style={s.tokenName} numberOfLines={1}>
                        {token.name}
                      </Text>
                      <TouchableOpacity
                        style={s.assignBtn}
                        onPress={() => {
                          const allColours = palettes.flatMap((p) =>
                            p.colours.map((c) => ({ ...c, paletteId: p.id })),
                          );
                          const currentIndex = allColours.findIndex(
                            (c) => c.id === token.value.colourId,
                          );
                          const next =
                            allColours[(currentIndex + 1) % allColours.length];
                          if (next)
                            assignColour(
                              group.id,
                              token.id,
                              next.paletteId,
                              next.id,
                            );
                        }}
                      >
                        <Text style={s.assignBtnText}>
                          {assignedColour
                            ? assignedColour.name || assignedColour.hex
                            : "Assign"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeToken(group.id, token.id)}
                        style={s.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={s.deleteText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Add token */}
                <View style={s.addTokenRow}>
                  <M3Input
                    placeholder="Token name…"
                    value={newTokenNames[group.id] ?? ""}
                    onChangeText={(v) =>
                      setNewTokenNames((prev) => ({ ...prev, [group.id]: v }))
                    }
                    onSubmitEditing={() => handleAddToken(group.id)}
                    returnKeyType="done"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <FilledButton
                    label="Add"
                    onPress={() => handleAddToken(group.id)}
                  />
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add group bar */}
      <View
        style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <M3Input
          placeholder="New group…"
          value={newGroupName}
          onChangeText={setNewGroupName}
          onSubmitEditing={handleAddGroup}
          returnKeyType="done"
          style={{ flex: 1 }}
        />
        <FilledButton label="Add" onPress={handleAddGroup} />
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
  list: { padding: 12, gap: 10, paddingBottom: 24 },
  empty: {
    textAlign: "center",
    color: "#5f5e5a",
    fontSize: 14,
    paddingTop: 48,
  },
  groupCard: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888780",
    letterSpacing: 0.08,
  },
  groupHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  groupCount: { fontSize: 11, color: "#5f5e5a" },
  removeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  removeBtnText: { fontSize: 12, color: "#f87171" },
  tokensSection: {
    borderTopWidth: 0.5,
    borderTopColor: "#2e2e2e",
    padding: 12,
    gap: 8,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    backgroundColor: "#242424",
    borderRadius: 12,
    padding: 10,
  },
  tokenSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tokenName: {
    flex: 1,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#c0bfba",
  },
  assignBtn: {
    backgroundColor: "#2e2e2e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  assignBtnText: { fontSize: 11, color: "#9d93f9" },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: "#5f5e5a", fontSize: 13 },
  addTokenRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 4,
  },
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
  filledBtnWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 72,
  },
  filledBtn: {
    backgroundColor: "#9d93f9",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    minHeight: 48,
  },
  filledBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
