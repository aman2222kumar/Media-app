import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";

const AudioScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordings, setRecordings] = useState<
    { sound: Audio.Sound; duration: string; file: string }[]
  >([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    Audio.requestPermissionsAsync().then((permission) => {
      if (permission.status !== "granted") {
        setMessage("Please grant permission to app to access microphone");
      }
    });
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync();
      await recordingObject.startAsync();
      setRecording(recordingObject);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const durationMillis = (status as any).durationMillis ?? 0;
      const fileUri = recording.getURI() ?? "";
      const updatedRecordings = [...recordings];
      updatedRecordings.push({
        sound: sound,
        duration: getDurationFormatted(durationMillis),
        file: fileUri,
      });
      setRecordings(updatedRecordings);
    } catch (err) {
      console.error("Failed to stop recording", err);
    } finally {
      setRecording(null);
    }
  };

  const getDurationFormatted = (millis: number): string => {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  };

  const playRecording = async (sound: Audio.Sound) => {
    try {
      await sound.replayAsync();
    } catch (error) {
      console.error("Failed to play recording", error);
    }
  };

  const renderRecordings = () => {
    return (
      <FlatList
        data={recordings}
        renderItem={({ item, index }) => (
          <View style={styles.recordingItem}>
            <Text>
              Recording {index + 1} - {item.duration}
            </Text>
            <Button title="Play" onPress={() => playRecording(item.sound)} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      {renderRecordings()}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
});

export default AudioScreen;
