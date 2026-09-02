import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  wrapper: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  input: {},
  addonBeforeContainer: {
    width: 24,
    marginRight: 8,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    position: "absolute",
    right: 38,
    top: 12,
    height: 18,
    width: 1,
    backgroundColor: "#DDDDDD",
  },
});
