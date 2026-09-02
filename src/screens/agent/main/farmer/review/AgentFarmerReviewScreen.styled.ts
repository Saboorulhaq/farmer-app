import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },

  contentTitle: {
    fontSize: 22,
    color: "#404040",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#8B8B8B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  field: {
    marginTop: 10,
  },
  listItem: {
    color: "#101010",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  confirmButton: {
    marginTop: 8,
  },
  agreement: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  agreementText: { color: "#404040", fontSize: 15 },
  link: { color: "green", textDecorationLine: "underline" },
});
