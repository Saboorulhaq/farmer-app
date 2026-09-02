import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoContainer: {
    marginLeft: 6,
    flexDirection: "row",
    marginTop: 40,
  },
  infoText: {
    textAlign: "left",
    color: "#404040",
    fontSize: 16,
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    marginVertical: 40,
    borderRadius: 10,
  },
  cameraInner: {
    width: "100%",
    aspectRatio: 3 / 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  capturedImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  retakeButton: {
    backgroundColor: "#10B981",
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  retakeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
