import {
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

const ACCENT = "#9d93f9";
const SURFACE_2 = "#2a2a2a";
const TEXT_PRIMARY = "#f0efe9";
const TEXT_SECONDARY = "#888780";

/** Material 3 filled text input */
export function M3Input({
  style,
  ...props
}: TextInputProps & { style?: ViewStyle }) {
  return (
    <TextInput
      style={[s.input, style]}
      placeholderTextColor={TEXT_SECONDARY}
      selectionColor={ACCENT}
      cursorColor={ACCENT}
      {...props}
    />
  );
}

/** Material 3 button — filled, tonal, outlined, or text variant */
export function M3Button({
  label,
  onPress,
  variant = "filled",
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "filled" | "tonal" | "outlined" | "text";
  style?: ViewStyle;
}) {
  const btnStyle = [
    s.btn,
    variant === "filled" && s.btnFilled,
    variant === "tonal" && s.btnTonal,
    variant === "outlined" && s.btnOutlined,
    variant === "text" && s.btnText,
    style,
  ];

  const textStyle = [
    s.btnLabel,
    variant === "filled" && s.btnLabelFilled,
    variant === "tonal" && s.btnLabelTonal,
    variant === "outlined" && s.btnLabelOutlined,
    variant === "text" && s.btnLabelText,
  ];

  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(
          variant === "filled"
            ? "rgba(255,255,255,0.2)"
            : "rgba(157,147,249,0.2)",
          false,
        )}
        useForeground
      >
        <View style={btnStyle}>
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={btnStyle}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Material 3 FAB — large rounded square with ripple on Android */
export function M3Fab({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: ViewStyle;
}) {
  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(
          "rgba(255,255,255,0.2)",
          false,
        )}
        useForeground
      >
        <View style={[s.fab, style]}>
          <Text style={s.fabText}>+</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.fab, style]}
    >
      <Text style={s.fabText}>+</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  input: {
    backgroundColor: SURFACE_2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  btn: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    overflow: "hidden",
  },
  btnFilled: {
    backgroundColor: ACCENT,
    elevation: 2,
  },
  btnTonal: {
    backgroundColor: "rgba(157,147,249,0.15)",
  },
  btnOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: ACCENT,
  },
  btnText: {
    backgroundColor: "transparent",
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  btnLabelFilled: { color: "#fff" },
  btnLabelTonal: { color: ACCENT },
  btnLabelOutlined: { color: ACCENT },
  btnLabelText: { color: ACCENT },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    overflow: "hidden",
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
});
