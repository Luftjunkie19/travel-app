import { useCallback, useEffect, useState } from "react";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Pressable, Text, View } from "react-native";

import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import RateModal from "../assets/components/RateModal";
import UpdateNotification from "../assets/components/UpdateNotification";

SplashScreen.preventAutoHideAsync();

function Home({ navigation }) {
  const navigateToCreateForm = () => {
    navigation.navigate("StackScreen");
  };

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
  });

  const [showModal, setShowModal] = useState();

  const isFocused = useIsFocused();

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const hasRated = await AsyncStorage.getItem("hasRated");
      const hasRatedConverted = JSON.parse(hasRated);

      const lastNotificationTime = await AsyncStorage.getItem(
        "lastNotificationTime"
      );
      const nextNotificationTime = await AsyncStorage.getItem(
        "nextNotificationTime"
      );
      const lastNotificationTimeConverted = JSON.parse(lastNotificationTime);
      const nextNotificationTimeConverted = JSON.parse(nextNotificationTime);

      if (hasRatedConverted && hasRatedConverted === true) {
        setShowModal(false);
        return;
      }

      if (!hasRatedConverted || hasRatedConverted === false) {
        if (
          !nextNotificationTimeConverted ||
          Date.now() >= parseInt(nextNotificationTimeConverted)
        ) {
          setShowModal(true);
          return;
        }

        if (
          !lastNotificationTimeConverted ||
          Date.now() - parseInt(lastNotificationTimeConverted) >=
            7 * 24 * 60 * 60 * 1000
        ) {
          setShowModal(true);
          return;
        }
      }
    };

    if (isFocused) {
      checkNotificationStatus();
    }
  }, [isFocused]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      onLayout={onLayoutRootView}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Poppins-Black",
          padding: 10,
        }}
      >
        Welcome to Travelary !
      </Text>
      <Text style={{ fontFamily: "Poppins-Light", padding: 10 }}>
        The place where you store the memories forever
      </Text>

      <Pressable
        style={{ backgroundColor: "black", borderRadius: 5 }}
        android_ripple={{ color: "gray" }}
        onPress={navigateToCreateForm}
      >
        <View
          style={{ padding: 16, flexDirection: "row", alignItems: "center" }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: "Poppins-Light",
            }}
          >
            Save new memories
          </Text>
          <IonIcons
            name="save"
            style={{ fontSize: 20, marginLeft: 6, color: "white" }}
          />
        </View>
      </Pressable>

      <UpdateNotification />

      <RateModal isVisible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

export default Home;
