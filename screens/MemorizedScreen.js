import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useFonts } from "expo-font";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import PagerView from "react-native-pager-view";

import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const MemorizedScreen = ({ navigation, route }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [pictureIndex, setPictureIndex] = useState(0);
  const [countryPlace, setPlaceCountry] = useState(null);
  const isFocused = useIsFocused();

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
  });

  useEffect(() => {
    const loadMemorized = async () => {
      const allItems = await AsyncStorage.getItem("memorized");
      const itemsConverted = JSON.parse(allItems);
      const searchedItem = itemsConverted.find(
        (searched) => searched.id === route.params.id
      );
      setSelectedItem(searchedItem);
    };

    if (isFocused && route.params) {
      loadMemorized();
    }
  }, [isFocused, route]);

  const fetchCountryData = async () => {
    if (selectedItem) {
      const requestData = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${selectedItem.markedPlace.latitude}&lon=${selectedItem.markedPlace.longitude}&apiKey=efef1bd97cb7434390f088236099a24d`
      );

      const useableData = await requestData.json();

      const country = {
        countryName: useableData.features[0].properties.country,
        countryCode: useableData.features[0].properties.country_code,
        traveledCity: useableData.features[0].properties.city,
      };

      setPlaceCountry(country);
    }
  };

  useEffect(() => {
    if (isFocused && selectedItem) {
      fetchCountryData();
    }
  }, [fetchCountryData, isFocused, selectedItem]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              backgroundColor: "rgb(3, 138, 255)",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 4,
              marginRight: 5,
            }}
            onPress={() => {
              navigation.navigate("EditScreen", {
                editId: selectedItem.id,
              });
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins-Medium",
                textAlign: "center",
              }}
            >
              Edit <IonIcons name="pencil" style={{ fontSize: 18 }} />
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "red",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 4,
              marginRight: 5,
            }}
            onPress={async () => {
              if (selectedItem) {
                const allItems = await AsyncStorage.getItem("memorized");
                let itemsConverted = JSON.parse(allItems);
                itemsConverted = itemsConverted.filter(
                  (doc) => doc.id !== selectedItem.id
                );
                const newArray = await AsyncStorage.setItem(
                  "memorized",
                  JSON.stringify(itemsConverted)
                );
                navigation.navigate("BottomNavigation", {
                  newArray: newArray,
                });
              }
            }}
          >
            <Text style={{ color: "white", fontFamily: "Poppins-Medium" }}>
              Delete <IonIcons name="trash" />
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  });

  const ref = useRef();

  const pullBack = () => {
    if (!ref.current || !selectedItem) {
      return;
    }

    setPictureIndex(
      pictureIndex <= 0 ? selectedItem.pictures.length - 1 : pictureIndex - 1
    );
    ref.current.setPage(
      pictureIndex <= 0 ? selectedItem.pictures.length - 1 : pictureIndex - 1
    );
  };

  const pushForward = () => {
    if (!ref.current || !selectedItem) {
      return;
    }

    setPictureIndex(
      pictureIndex >= selectedItem.pictures.length - 1 ? 0 : pictureIndex + 1
    );
    ref.current.setPage(
      pictureIndex >= selectedItem.pictures.length - 1 ? 0 : pictureIndex + 1
    );
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.setPage(pictureIndex);
    }
  }, [pictureIndex]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      return;
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView
      style={{ backgroundColor: "black" }}
      onLayout={onLayoutRootView}
    >
      {selectedItem && (
        <View>
          <PagerView
            initialPage={0}
            ref={ref}
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height / 2,
            }}
          >
            {selectedItem.pictures.map((item, index) => (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  top: 0,
                  left: 0,
                }}
                key={`${index}`}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    zIndex: 100,
                    padding: 6,
                    backgroundColor: "white",
                    width: "100%",
                    borderTopStartRadius: 6,
                    borderTopEndRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "Poppins-Medium",
                    }}
                  >
                    {item.description && item.description.trim("").length > 0
                      ? item.description
                      : "No description"}
                  </Text>
                </View>
              </View>
            ))}
          </PagerView>

          {countryPlace && (
            <View
              style={{
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
                padding: 6,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Image
                  source={{
                    uri: `https://flagcdn.com/40x30/${countryPlace.countryCode}.png`,
                  }}
                  style={{ width: 40, height: 30, objectFit: "cover" }}
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontFamily: "Poppins-Black",
                  }}
                >
                  {countryPlace.countryName}
                </Text>
                <Image
                  source={{
                    uri: `https://flagcdn.com/40x30/${countryPlace.countryCode}.png`,
                  }}
                  style={{ width: 40, height: 30, objectFit: "cover" }}
                />
              </View>
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontFamily: "Poppins-Black",
                }}
              >
                {selectedItem.travelTitle}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              padding: 8,
            }}
          >
            <Pressable
              style={{
                paddingVertical: 4,
                paddingHorizontal: 15,
                borderRadius: 5,
                backgroundColor: "#5068CB",
              }}
              onPress={pullBack}
              android_ripple={{ color: "#3A739D" }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Poppins-Light",
                }}
              >
                <IonIcons name="arrow-back" style={{ fontSize: 20 }} /> Back
              </Text>
            </Pressable>

            <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
              {pictureIndex + 1}/{selectedItem.pictures.length}
            </Text>

            <Pressable
              style={{
                paddingVertical: 4,
                paddingHorizontal: 15,
                borderRadius: 5,
                backgroundColor: "#5068CB",
              }}
              onPress={pushForward}
              android_ripple={{ color: "#3A739D" }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Poppins-Light",
                }}
              >
                Next
                <IonIcons name="arrow-forward" style={{ fontSize: 20 }} />
              </Text>
            </Pressable>
          </View>

          <View>
            <View>
              <Text
                style={{
                  color: "white",
                  padding: 6,
                  textAlign: "center",
                  fontSize: 20,
                  fontFamily: "Poppins-Light",
                }}
              >
                More Details about the Travel:
              </Text>
              <Text style={{ color: "white", fontFamily: "Poppins-Black" }}>
                Travel Place:
              </Text>

              {countryPlace && (
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    padding: 5,
                    fontFamily: "Poppins-Light",
                  }}
                >
                  {countryPlace.traveledCity}, {countryPlace.countryName}
                </Text>
              )}

              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 5,
                  fontFamily: "Poppins-Light",
                }}
              >
                Date of start:{" "}
                {new Date(selectedItem.travelStart).toLocaleDateString()}
              </Text>

              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 5,
                  fontFamily: "Poppins-Light",
                }}
              >
                Date of end:{" "}
                {new Date(selectedItem.travelEnd).toLocaleDateString()}
              </Text>

              <View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontFamily: "Poppins-Black",
                  }}
                >
                  Description:
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    padding: 5,
                    fontFamily: "Poppins-Light",
                  }}
                >
                  {selectedItem.description}
                </Text>
              </View>
            </View>

            <Text
              style={{
                padding: 5,
                color: "white",
                fontSize: 20,
                textAlign: "center",
                fontFamily: "Poppins-Medium",
              }}
            >
              Memorized Place:
            </Text>
            <MapView
              provider={PROVIDER_GOOGLE}
              zoomEnabled={false}
              minZoomLevel={13}
              scrollEnabled={false}
              style={{
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height / 3,
              }}
              initialRegion={selectedItem.location}
              region={selectedItem.location}
            >
              {selectedItem && <Marker coordinate={selectedItem.markedPlace} />}
            </MapView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MemorizedScreen;
