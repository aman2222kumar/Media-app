import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { FlatList } from "react-native";
import { Provider as PaperProvider, Card } from "react-native-paper";
import * as MediaLibrary from "expo-media-library";
import { PermissionStatus } from "expo-media-library";

const PhotoScreen: React.FC = () => {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);

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
    const fetchPhotos = async () => {
      try {
        const mediaAssets = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.photo,
          first: 20, // Fetch first 20 photos, adjust as needed
        });
        setPhotos(mediaAssets.assets);
      } catch (error) {
        console.error("Failed to fetch photos", error);
      }
    };

    fetchPhotos();
  }, []);

  const handlePhotoPress = (uri: string) => {
    setSelectedPhotoUri(uri);
  };

  const handleCloseModal = () => {
    setSelectedPhotoUri(null);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePhotoPress(item.uri)}>
              <Card style={styles.card}>
                <Card.Cover
                  style={styles.cardCover}
                  source={{ uri: item.uri }}
                />
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={3} // Display photos in 3 columns, adjust as needed
          contentContainerStyle={styles.flatListContent}
        />
      </View>
      <Modal
        visible={selectedPhotoUri !== null}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedPhotoUri ?? "" }}
            style={styles.modalImage}
          />
        </View>
      </Modal>
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
  cardCover: {
    flex: 1,
    aspectRatio: 1, // Set the aspect ratio to 1 to maintain image proportions
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1, // Ensure the button is above other elements
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PhotoScreen;
