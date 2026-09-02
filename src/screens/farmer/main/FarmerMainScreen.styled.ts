import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 50,
  },
  hello: { color: "#5A5A5A", fontSize: 16, lineHeight: 22 },
  name: { color: "#1E1E20", fontSize: 16, lineHeight: 22 },
});
