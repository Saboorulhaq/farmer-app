import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  errorToast: {
    marginHorizontal: 20,
    backgroundColor: "#FFF4F2",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FBECE9",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  successToast: {
    marginHorizontal: 20,
    backgroundColor: "#E6F9F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C4F1DC",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoToast: {
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    color: "#000000",
    fontSize: 16,
    lineHeight: 24,
  },
  message: {
    fontFamily: "Poppins-Regular",
    color: "#000",
    fontSize: 14,
    lineHeight: 20,
  },
});
