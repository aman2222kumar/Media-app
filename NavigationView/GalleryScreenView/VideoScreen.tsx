import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FlatList, Text } from "react-native";
import { Provider as PaperProvider, Card } from "react-native-paper";
import { Video } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { PermissionStatus } from "expo-media-library";

const VideoScreen: React.FC = () => {
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== PermissionStatus.GRANTED) {
          throw new Error("Media library permission not granted");
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const mediaAssets = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.video,
          first: 20, // Fetch first 20 videos, adjust as needed
        });
        setVideos(mediaAssets.assets);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoPress = (videoUri: string) => {
    setSelectedVideoUri(videoUri);
  };

  const handleVideoClose = () => {
    setSelectedVideoUri(null);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {selectedVideoUri ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: selectedVideoUri }}
              style={styles.video}
              useNativeControls
              shouldPlay
              isLooping
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleVideoClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={videos}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleVideoPress(item.uri)}
                style={styles.card}
              >
                <Card>
                  <Card.Cover source={{ uri: item.uri }} />
                </Card>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={3} // Display videos in 3 columns, adjust as needed
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  flatListContent: {
    paddingVertical: 8,
  },
  card: {
    flex: 1,
    margin: 4,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default VideoScreen;
