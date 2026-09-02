import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  container: { flex: 1, width: "100%" },
  contentTitle: {
    fontSize: 22,
    color: "#404040",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    marginTop: 12,
    color: "#8B8B8B",
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 6,
    marginLeft: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  unitPicker: { width: 100 },
  sectionTitle: {
    fontSize: 22,
    color: "#404040",
    marginTop: 16,
    marginBottom: 24,
  },
  option: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  optionText: { marginLeft: 8, fontSize: 15 },
  agreement: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  agreementText: { color: "#404040", fontSize: 15 },
  link: { color: "green", textDecorationLine: "underline" },
  footer: {
    paddingVertical: 20,
  },
});
