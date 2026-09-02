import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 22,
  },
  label: {
    fontSize: 12,
    marginTop: 12,
    color: "#8B8B8B",
  },
  labelError: {
    color: "#E53935",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    paddingBottom: 8,
  },
  boxedWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#F8F8FB",
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 83,
  },
  inputWrapperError: {
    borderBottomColor: "#E53935",
  },
  inputWrapperDisabled: {
    backgroundColor: "#F2F2F2",
    borderRadius: 6,
    paddingHorizontal: 10,
    borderBottomColor: "#E0E0E0",
  },
  addonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    width: 70,
  },
  calendarInline: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#DDDDDD",
    marginLeft: 15,
  },
  input: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    paddingVertical: 0,
    fontSize: 16,
    color: "#101010",
  },
  boxedInput: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#101010",
  },
  inputWithAddon: {},
  inputError: {
    color: "#E53935",
  },
  placeholderInput: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  boxedPlaceholderInput: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#8B8B8B",
    marginTop: 4,
    marginLeft: 2,
  },
  helperTextError: {
    color: "#E53935",
  },
  requiredAsterisk: {
    color: "#F32735",
    marginLeft: 4,
  },
});
