import React, { useCallback, useEffect, useState } from "react";

import { useFonts } from "expo-font";
import { Alert, Pressable, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import IonIcons from "@expo/vector-icons/Ionicons";

const MapSelect = ({ route, navigation }) => {
  const [markerCoords, setMarkerCoords] = useState(null);
  const [newMapLayout, setNewMapLayout] = useState(null);
  const [isError, setIsError] = useState(false);
  const coordsForMap = route.params.coords;
  const existingMarkerCoords = route.params.marker;

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
  });

  useEffect(() => {
    if (existingMarkerCoords) {
      setMarkerCoords(existingMarkerCoords);
    }
  }, [existingMarkerCoords]);

  const selectPlaceOnMap = (e) => {
    setIsError(false);
    const coords = e.nativeEvent.coordinate;
    console.log(coords);

    const newMapsCoords = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setNewMapLayout(newMapsCoords);
    setMarkerCoords(coords);

    setIsError(false);
    console.log(newMapsCoords);
    console.log(coords);
  };

  const saveMarker = () => {
    if (!markerCoords) {
      setIsError(true);
      return;
    }

    navigation.navigate("StackScreen", {
      mapLayout: newMapLayout,
      markerCoords: markerCoords,
    });
  };

  useEffect(() => {
    navigation.setOptions(
      {
        headerRight: () => (
          <Pressable
            onPress={saveMarker}
            android_ripple={{ color: "black" }}
            style={{
              marginRight: 6,
              padding: 4,
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins-Light",
                backgroundColor: "gray",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 5,
              }}
            >
              Save <IonIcons name="save-sharp" />
            </Text>
          </Pressable>
        ),
      },
      []
    );
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
    <View onLayout={onLayoutRootView}>
      <Text
        style={{
          padding: 4,
          textAlign: "center",
          color: "white",
          backgroundColor: "black",
          fontFamily: "Poppins-Light",
        }}
      >
        Select The Place on the map, tapping on the screen.
      </Text>

      {isError &&
        Alert.alert(
          "No place chosen",
          "type on the map to choose the place you were."
        )}

      <MapView
        provider={PROVIDER_GOOGLE}
        initialRegion={coordsForMap}
        style={{ width: "100%", height: "100%" }}
        onPress={selectPlaceOnMap}
      >
        {markerCoords && <Marker coordinate={markerCoords} />}
      </MapView>
    </View>
  );
};

export default MapSelect;
