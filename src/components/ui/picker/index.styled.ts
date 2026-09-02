import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
  },
  label: { fontSize: 12, marginTop: 12, color: "#8B8B8B" },
  pickerTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  selectedValue: {
    fontSize: 14,
    color: "#101010",
  },
  placeholderText: {
    color: "#EDEDED",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    maxHeight: "50%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 12,
    color: "#8B8B8B",
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 14,
    color: "#1E1E20",
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "black",
  },
  inlinePickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 50,
    paddingRight: 8,
    gap: 6,
  },
  inlineSelectedValue: {
    fontSize: 14,
    color: "#101010",
    marginRight: 4,
  },
  inlinePlaceholder: {
    color: "#EDEDED",
  },
});
