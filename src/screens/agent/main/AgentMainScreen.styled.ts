import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topContainer: {
    height: "70%",
    maxHeight: 600,
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
    overflow: "hidden",
  },
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
  hello: { color: "#D7D7D7", fontSize: 16, lineHeight: 22 },
  name: { color: "#fff", fontSize: 16, lineHeight: 22 },
  centerCard: {
    padding: 24,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 24, textAlign: "center", marginBottom: 8 },
  subtitle: {
    color: "#FAFAFA",
    fontSize: 20,
    textAlign: "center",
    opacity: 0.9,
  },
  verifiedBox: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    justifyContent: "space-between",
    borderRadius: 10,
  },
  verifiedTitle: {
    fontSize: 16,
    color: "#fff",
  },
  verifiedSubtitle: {
    fontSize: 16,
    color: "#FAFAFA",
    marginBottom: 16,
  },
  bottomCardWrapper: { flex: 1 },
  card: {
    margin: 24,
    backgroundColor: "#E7F8F0",
    borderRadius: 12,
    padding: 24,
  },
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterNumber: {
    fontSize: 38,
    lineHeight: 44,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  counterTextWrapper: { flex: 1 },
  counterTitle: {
    fontSize: 16,
  },
  counterDescription: {
    width: "100%",
    fontSize: 14,
  },
  bottomTabsSpacer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  viewAllFarmersBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 12,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllFarmersBtnText: {
    color: '#fff',
    fontSize: 16,
  },
});
