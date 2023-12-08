import "react-native-gesture-handler";

import { useCallback } from "react";

import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { AppRegistry, Pressable, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import IonIcons from "@expo/vector-icons/Ionicons";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { name as appName } from "./app.json";
import UpdateNotification from "./assets/components/UpdateNotification";
import CreateForm from "./screens/CreateForm";
import EditMap from "./screens/EditMap";
import EditScreen from "./screens/EditScreen";
import Home from "./screens/Home";
import MapSelect from "./screens/MapSelect";
import Memories from "./screens/Memories";
import MemorizedScreen from "./screens/MemorizedScreen";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const DefaultTheme = {
  colors: {
    primaryContainer: "rgba(0,0,0,0)",
    secondaryContainer: "rgb(0, 0, 0)",
  },
};

const BottomNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="white"
      inactiveColor="gray"
      barStyle={{ backgroundColor: "black" }}
      shifting={true}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <IonIcons name="home" color={color} size={24} />
          ),
        }}
      />

      <Tab.Screen
        name="Memories"
        component={Memories}
        options={{
          tabBarLabel: "Memories",
          tabBarIcon: ({ color }) => (
            <IonIcons name="save" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("./assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("./assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("./assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Montserrat-Light": require("./assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Black": require("./assets/fonts/Montserrat-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      return;
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName="BottomNavigation"
      screenOptions={{
        title: "Travelary",
        headerTitleStyle: {
          fontFamily: "Poppins-Italic",
        },
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "white",

        headerRight: ({ tintColor }) => {
          return (
            <Pressable
              android_ripple={{ color: "black" }}
              style={{ backgroundColor: "gray", borderRadius: 5 }}
              onPress={() => {
                navigation.navigate("StackScreen");
              }}
            >
              <View
                onLayout={onLayoutRootView}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: 4,
                  padding: 6,
                }}
              >
                <Text style={{ color: tintColor, fontFamily: "Poppins-Light" }}>
                  New Travel
                </Text>
                <MaterialCommunityIcons
                  name="airplane"
                  color={tintColor}
                  size={20}
                />
              </View>
            </Pressable>
          );
        },
      }}
    >
      <Stack.Screen name="StackScreen" component={CreateForm} />

      <Stack.Screen name="MapSelect" component={MapSelect} />

      <Stack.Screen name="MemorizedScreen" component={MemorizedScreen} />

      <Stack.Screen name="EditScreen" component={EditScreen} />

      <Stack.Screen name="EditMap" component={EditMap} />

      <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" hidden={false} />
      <NavigationContainer>
        <PaperProvider theme={DefaultTheme}>
          <Navigation />
          <UpdateNotification />
        </PaperProvider>
      </NavigationContainer>
    </SafeAreaView>
  );
}

AppRegistry.registerComponent(appName, () => App);
