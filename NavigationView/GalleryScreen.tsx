import React from "react";
import { View, Text } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PhotoScreen from "./GalleryScreenView/PhotoScreen";
import VideoScreen from "./GalleryScreenView/VideoScreen";

const Tab = createMaterialTopTabNavigator();

const GalleryScreen: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Photos" component={PhotoScreen} />
      <Tab.Screen name="Videos" component={VideoScreen} />
    </Tab.Navigator>
  );
};

export default GalleryScreen;
