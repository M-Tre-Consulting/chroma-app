import { Tabs } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const ACCENT = "#9d93f9";
const INACTIVE = "#5f5e5a";
const NAV_BG = "#1c1c1e";

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TABS: { name: string; label: string; icon: MCIName; iconOff: MCIName }[] =
  [
    {
      name: "palettes",
      label: "Palettes",
      icon: "palette",
      iconOff: "palette-outline",
    },
    { name: "tokens", label: "Tokens", icon: "variable", iconOff: "variable" },
    {
      name: "export",
      label: "Export",
      icon: "export-variant",
      iconOff: "export-variant",
    },
  ];

function MaterialTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS[index];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={s.tabItem}
          >
            <View style={[s.pill, focused && s.pillActive]}>
              <MaterialCommunityIcons
                name={focused ? tab.icon : tab.iconOff}
                size={24}
                color={focused ? ACCENT : INACTIVE}
              />
            </View>
            <Text style={[s.label, focused && s.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <MaterialTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="palettes" options={{ title: "Palettes" }} />
      <Tabs.Screen name="tokens" options={{ title: "Tokens" }} />
      <Tabs.Screen name="export" options={{ title: "Export" }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: NAV_BG,
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  pill: {
    width: 64,
    height: 32,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "rgba(157, 147, 249, 0.2)",
  },
  label: {
    fontSize: 11,
    color: INACTIVE,
    fontWeight: "500",
  },
  labelActive: {
    color: ACCENT,
  },
});
