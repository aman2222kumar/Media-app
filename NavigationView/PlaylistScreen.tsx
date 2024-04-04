import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { IconButton, Provider as PaperProvider } from "react-native-paper";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";

const PlaylistScreen: React.FC = () => {
  const [musicFiles, setMusicFiles] = useState<MediaLibrary.Asset[]>([]);
  const [selectedMusicIndex, setSelectedMusicIndex] = useState<number | null>(
    null
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [positionSeconds, setPositionSeconds] = useState<number | null>(null); // Updated state to hold position in seconds

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const media = await MediaLibrary.getAssetsAsync({ mediaType: "audio" });
        setMusicFiles(media.assets);
      } else {
        console.log("Permission not granted");
      }
    })();
  }, []);

  const playMusic = async (index: number, positionMillis?: number) => {
    setSelectedMusicIndex(index);
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: musicFiles[index].uri },
      { shouldPlay: true, positionMillis } // Pass positionMillis to start from a specific position
    );
    setSound(newSound);
    setIsPlaying(true);
    newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
  };

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (status.isLoaded && !status.isPlaying) {
      setIsPlaying(false);
    }
    setPositionSeconds(
      status.positionMillis ? status.positionMillis / 1000 : null
    ); // Convert milliseconds to seconds
  };

  const stopMusic = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const nextMusic = async () => {
    const nextIndex = (selectedMusicIndex ?? -1) + 1;
    if (nextIndex < musicFiles.length) {
      stopMusic();
      await playMusic(nextIndex);
    }
  };

  const ResumeMusic = async () => {
    const currentIndex = selectedMusicIndex ?? -1;
    if (currentIndex < musicFiles.length) {
      stopMusic();
      await playMusic(
        currentIndex,
        positionSeconds ? positionSeconds * 1000 : undefined
      ); // Convert seconds to milliseconds
    }
  };

  const previousMusic = async () => {
    const prevIndex = (selectedMusicIndex ?? 1) - 1;
    if (prevIndex >= 0) {
      stopMusic();
      await playMusic(prevIndex);
    }
  };

  const exitMusic = async () => {
    stopMusic();
    setSelectedMusicIndex(null);
  };

  const renderMusicItem = ({
    item,
    index,
  }: {
    item: MediaLibrary.Asset;
    index: number;
  }) => (
    <TouchableOpacity onPress={() => playMusic(index)}>
      <View style={styles.item}>
        <Text>{item.filename}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={musicFiles}
          renderItem={renderMusicItem}
          keyExtractor={(item) => item.id}
        />
      </View>
      <Modal visible={selectedMusicIndex !== null} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>{musicFiles[selectedMusicIndex ?? 0]?.filename}</Text>
            {positionSeconds !== null && (
              <Text>{formatTime(positionSeconds)}</Text>
            )}

            {/* Display position in minutes and seconds */}
            <View style={styles.controls}>
              <IconButton icon="skip-previous" onPress={previousMusic} />
              {isPlaying ? (
                <IconButton icon="pause" onPress={stopMusic} />
              ) : (
                <IconButton icon="play" onPress={ResumeMusic} />
              )}
              <IconButton icon="skip-next" onPress={nextMusic} />
              <IconButton icon="close" onPress={exitMusic} />
            </View>
          </View>
        </View>
      </Modal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
};

export default PlaylistScreen;
