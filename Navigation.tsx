import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import PlaylistScreen from "./NavigationView/PlaylistScreen";
import GalleryScreen from "./NavigationView/GalleryScreen";
import AudioScreen from "./NavigationView/AudioScreen";

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "blue",
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Playlist" component={PlaylistScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Audio" component={AudioScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeTabs} />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default Navigation;
