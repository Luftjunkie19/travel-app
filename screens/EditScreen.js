import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useFonts } from 'expo-font';
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import PagerView from 'react-native-pager-view';
import {
  ActivityIndicator,
  MD2Colors,
  TextInput,
} from 'react-native-paper';
import MaterialCommunityIcons
  from 'react-native-vector-icons/MaterialCommunityIcons';

import IonIcons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';

const EditScreen = ({ route, navigation }) => {
  const [editItem, setEditItem] = useState({
    description: null,
    id: null,
    location: null,
    pictures: [],
    markedPlace: null,
    travelEnd: null,
    travelStart: null,
    travelTitle: null,
  });
  const isFocused = useIsFocused();
  const [isOpened, setIsOpened] = useState(false);
  const [isEndOpened, setIsEndOpened] = useState(false);
  const [IsLocationLoading, setIsLocationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const ref = useRef();

  const getMemorizedItems = async () => {
    const memoriesJSONED = await AsyncStorage.getItem("memorized");
    const memories = JSON.parse(memoriesJSONED);
    const editedItem = memories.find(
      (memorie) => memorie.id === route.params.editId
    );
    setEditItem(editedItem);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {},
    });
  }, []);

  useEffect(() => {
    if (isFocused && route.params) {
      getMemorizedItems();
    }

    if (isFocused && route.params.markerCoords && route.params.mapLayout) {
      setSelectedMarker({
        location: route.params.mapLayout,
        markedPlace: route.params.markerCoords,
      });
    }
  }, [isFocused, route.params]);

  const [status, requestPermission] = useMediaLibraryPermissions();

  const openModal = () => {
    setIsOpened(true);
  };

  const endModalOpen = () => {
    setIsEndOpened(true);
  };

  const initialCoords = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      return;
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const removePicture = (id) => {
    setEditItem((item) => ({
      ...item,
      pictures: item.pictures.filter((img) => img.assetId !== id),
    }));
  };

  const getLocationPermission = async () => {
    setIsLocationLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync();
    console.log(location);

    const locationObject = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0043,
      longitudeDelta: 0.0034,
    };

    setEditItem((item) => ({
      ...item,
      markedPlace: {
        latitude: locationObject.latitude,
        longitude: locationObject.longitude,
      },
      location: locationObject,
    }));

    setIsLocationLoading(false);
  };

  const selectImages = async () => {
    if (status.granted) {
      setIsLoading(true);
      const imageLibrary = await launchImageLibraryAsync({
        allowsMultipleSelection: true,
      });

      if (imageLibrary.assets === null) {
        setIsLoading(false);
        return;
      }

      const allImages = [...editItem.pictures, ...imageLibrary.assets];

      if (allImages.length > 15) {
        Alert.alert(
          "Amount of pictures exceeded !",
          "You are able only to add 15 pictures, in order not letting the app to break up. If you'd like to change all Images, click the button and choose again."
        );

        let results = [];

        allImages.map((object) => {
          const item = {
            uri: object.uri,
            assetId: `${object.assetId}#${new Date().getTime()}@${
              Math.random() * 10000
            }`,
            imageDescription: "",
          };
          results.push(item);
        });

        setEditItem((item) => ({ ...item, pictures: allImages.slice(0, 15) }));

        setIsLoading(false);
        return;
      }

      let results = [];

      imageLibrary.assets.map((object) => {
        const item = {
          uri: object.uri,
          assetId: `${object.assetId}#${new Date().getTime()}@${
            Math.random() * 10000
          }`,
          imageDescription: "",
        };
        results.push(item);
      });

      setEditItem((item) => ({
        ...item,
        pictures: [...editItem.pictures, ...results],
      }));

      setIsLoading(false);
    } else {
      await requestPermission();
      setIsLoading(false);
    }
  };

  const selectOnMap = () => {
    navigation.navigate("EditMap", {
      coords: editItem.location,
      marker: editItem.markedPlace,
    });

    if (selectedMarker) {
      setEditItem((item) => ({
        ...item,
        location: selectedMarker.location,
        markedPlace: selectedMarker.markedPlace,
      }));
    }

    navigation.navigate("EditMap", {
      coords: selectedMarker ? selectedMarker.location : editItem.location,
      marker: selectedMarker
        ? selectedMarker.markedPlace
        : editItem.markedPlace,
      editId: editItem.id,
    });
  };

  const moveBack = async () => {
    // Save the updated editItem to AsyncStorage
    let storage = await AsyncStorage.getItem("memorized");
    const itemsConverted = JSON.parse(storage);
    const searchedItemIndex = itemsConverted.findIndex(
      (searched) => searched.id === route.params.editId
    );

    const addItem = {
      ...editItem,
      location: selectedMarker.location,
      markedPlace: selectedMarker.markedPlace,
    };

    itemsConverted.splice(searchedItemIndex, 1, addItem);

    AsyncStorage.setItem("memorized", JSON.stringify(itemsConverted));

    navigation.navigate("BottomNavigation");
  };

  return (
    <ScrollView
      style={{ backgroundColor: "whitesmoke" }}
      onLayout={onLayoutRootView}
    >
      {editItem && (
        <>
          <View style={{ padding: 6 }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontFamily: "Poppins-Black",
              }}
            >
              Prepend a new Travel story{" "}
              <IonIcons name="airplane-sharp" style={{ fontSize: 20 }} />
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Poppins-Italic",
              }}
            >
              And save the memories forever{" "}
              <IonIcons name="infinite-sharp" style={{ fontSize: 24 }} />
            </Text>
          </View>
          <View style={{ padding: 5 }}>
            <View>
              <Text style={{ fontFamily: "Poppins-Medium" }}>
                Travel's title:
              </Text>
              <TextInput
                value={editItem.travelTitle}
                onChangeText={(text) =>
                  setEditItem((item) => ({
                    ...item,
                    travelTitle: text,
                  }))
                }
                style={{
                  fontFamily: "Poppins-Light",
                  borderRadius: 5,
                  color: "white",
                  borderColor: "black",
                  borderWidth: 2,
                }}
                textColor="black"
                theme="dark"
                placeholder="Type the travel's title"
                placeholderTextColor="gray"
                label="Description"
              />
            </View>

            <View
              style={{
                gap: 6,
                marginTop: 6,
                padding: 4,
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontFamily: "Poppins-Medium" }}>
                  Travel start:{" "}
                  {new Date(editItem.travelStart).toLocaleDateString()}
                </Text>
                <Pressable
                  style={{
                    backgroundColor: "black",
                    borderRadius: 4,
                    padding: 12,
                  }}
                  android_ripple={{ color: "gray" }}
                  onPress={openModal}
                >
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    Select Start time {""}
                    <MaterialCommunityIcons
                      name="airplane-landing"
                      style={{ fontSize: 16 }}
                    />
                  </Text>
                </Pressable>
                {isOpened && (
                  <DateTimePicker
                    value={
                      editItem ? new Date(editItem.travelStart) : new Date()
                    }
                    onChange={(event) => {
                      if (event.type === "dismissed") {
                        setIsOpened(false); // Close the picker if dismissed
                      } else if (event.type === "set") {
                        setIsOpened(false); // Close the picker after setting the date
                        setEditItem((item) => ({
                          ...item,
                          travelStart: event.nativeEvent.timestamp,
                        }));
                      }
                    }}
                  />
                )}
              </View>

              <View>
                <Text style={{ fontFamily: "Poppins-Medium" }}>
                  Travel end:{" "}
                  {new Date(editItem.travelEnd).toLocaleDateString()}
                </Text>
                <Pressable
                  style={{
                    backgroundColor: "black",
                    borderRadius: 4,
                    padding: 12,
                  }}
                  android_ripple={{ color: "gray" }}
                  onPress={endModalOpen}
                >
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    Select End time{" "}
                    <MaterialCommunityIcons
                      name="airplane-takeoff"
                      style={{ fontSize: 16 }}
                    />
                  </Text>
                </Pressable>
                {isEndOpened && (
                  <DateTimePicker
                    value={editItem ? new Date(editItem.travelEnd) : new Date()}
                    onChange={(event) => {
                      if (event.type === "dismissed") {
                        setIsEndOpened(false); // Close the picker if dismissed
                      } else if (event.type === "set") {
                        setIsEndOpened(false); // Close the picker after setting the date
                        setEditItem((item) => ({
                          ...item,
                          travelEnd: event.nativeEvent.timestamp,
                        }));
                      }
                    }}
                  />
                )}
              </View>
            </View>

            <View>
              <Pressable
                style={{
                  backgroundColor: "black",
                  borderRadius: 4,
                  padding: 10,
                  marginTop: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                android_ripple={{ color: "gray" }}
                onPress={selectImages}
              >
                <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                  Select Images{" "}
                </Text>
                <MaterialCommunityIcons
                  name="camera"
                  style={{ fontSize: 24, color: "white" }}
                />
              </Pressable>
            </View>

            {editItem && editItem.pictures.length === 0 && !isLoading && (
              <Text
                style={{
                  textAlign: "center",
                  padding: 8,
                  fontFamily: "Poppins-Light",
                }}
              >
                You haven't picked any image yet 😥
              </Text>
            )}

            {isLoading && (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                  margin: 8,
                }}
              >
                <ActivityIndicator
                  animating={true}
                  color={MD2Colors.black}
                  size="large"
                  style={{ padding: 10, margin: 8 }}
                />
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    paddingTop: 8,
                    fontSize: 18,
                  }}
                >
                  Please wait, loading occurs...
                </Text>
              </View>
            )}

            {editItem && editItem.pictures.length > 0 && !isLoading && (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    fontFamily: "Poppins-Light",
                    textAlign: "center",
                    verticalAlign: "middle",
                    margin: 4,
                  }}
                >
                  You have picked already {editItem.pictures.length} pictures 😮
                </Text>

                <PagerView
                  initialPage={0}
                  ref={ref}
                  style={{
                    width: Dimensions.get("window").width / 1.5,
                    height: Dimensions.get("window").height / 3,
                  }}
                >
                  {editItem &&
                    editItem.pictures.map((image, index) => (
                      <View
                        key={index}
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          top: 0,
                          left: 0,
                        }}
                      >
                        <Pressable
                          style={{
                            position: "absolute",
                            zIndex: 100,
                            top: 0,
                            right: 0,
                            padding: 4,
                            backgroundColor: "red",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            gap: 5,
                            borderBottomLeftRadius: 5,
                          }}
                          onPress={() => {
                            removePicture(image.assetId);
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 14 }}>
                            Remove
                          </Text>
                          <IonIcons
                            name="trash"
                            style={{ color: "white", fontSize: 14 }}
                          />
                        </Pressable>

                        <Image
                          source={{ uri: image.uri }}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />

                        <TextInput
                          key={index}
                          style={{
                            fontFamily: "Poppins-Light",
                            backgroundColor: "black",
                            zIndex: 100,
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            height: 40,
                            borderTopRightRadius: 5,
                            borderTopLeftRadius: 5,
                            padding: 5,
                            fontSize: 12,
                          }}
                          textColor="white"
                          placeholderTextColor="gray"
                          placeholder="Type the description"
                          onChangeText={(text) => {
                            // Create a new array with updated descriptions
                            const updatedPictures = [...editItem.pictures];
                            updatedPictures[index] = {
                              ...image,
                              description: text,
                            };
                            setEditItem((item) => ({
                              ...item,
                              pictures: updatedPictures,
                            }));
                          }}
                          value={image.description}
                        />
                      </View>
                    ))}
                </PagerView>
              </View>
            )}

            <View>
              <Text
                style={{
                  fontFamily: "Poppins-Medium",
                  padding: 8,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Choose the place on map that you visited:
              </Text>
              <View style={{ position: "relative", top: 0, left: 0 }}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  initialRegion={initialCoords}
                  region={
                    selectedMarker ? selectedMarker.location : editItem.location
                  }
                  minZoomLevel={13}
                  style={{
                    width: "100%",
                    height: Dimensions.get("window").height / 3,
                  }}
                >
                  {editItem.markedPlace && (
                    <Marker
                      coordinate={
                        selectedMarker
                          ? selectedMarker.markedPlace
                          : editItem.markedPlace
                      }
                    />
                  )}
                </MapView>

                {IsLocationLoading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0,0,0,0.8)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator
                      animating={true}
                      size="large"
                      color={MD2Colors.white}
                    />
                    <Text
                      style={{
                        fontFamily: "Poppins-Light",
                        marginTop: 10,
                        color: "white",
                      }}
                    >
                      Searching for your location
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  gap: 6,
                }}
              >
                <Pressable
                  android_ripple={{ color: "gray" }}
                  style={{
                    padding: 5,
                    margin: 5,
                    backgroundColor: "black",
                    alignItems: "center",
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{ color: "white", fontFamily: "Poppins-Light" }}
                    onPress={getLocationPermission}
                  >
                    Share Your Location{" "}
                    <IonIcons name="location" style={{ fontSize: 16 }} />
                  </Text>
                </Pressable>

                <Pressable
                  android_ripple={{ color: "gray" }}
                  style={{
                    padding: 5,
                    margin: 5,
                    backgroundColor: "black",
                    alignItems: "center",
                    borderRadius: 5,
                  }}
                  onPress={selectOnMap}
                >
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    Select on Map{" "}
                    <IonIcons name="map" style={{ fontSize: 16 }} />
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={{ padding: 6 }}>
              <Text style={{ fontFamily: "Poppins-Medium" }}>Description:</Text>
              <TextInput
                keyboardType="email-address"
                multiline
                placeholder="Type the description"
                style={{
                  fontFamily: "Poppins-Light",
                  borderRadius: 5,
                  color: "white",
                  borderColor: "black",
                  borderWidth: 2,
                }}
                textColor="black"
                theme="dark"
                placeholderTextColor="gray"
                label="Description"
                onChangeText={(text) => {
                  setEditItem((item) => ({
                    ...item,
                    description: text,
                  }));
                }}
                value={editItem.description}
              />
            </View>

            <Pressable
              style={{
                backgroundColor: "green",
                padding: 12,
                borderRadius: 4,
                borderColor: "black",
                borderWidth: 2,
                borderStyle: "solid",
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
              android_ripple={{ color: "#84BD09", borderless: false }}
              onPress={moveBack}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Poppins-Medium",
                }}
              >
                Done{" "}
              </Text>
              <IonIcons
                name="checkmark-done-outline"
                style={{ fontSize: 20, color: "white", fontWeight: "700" }}
              />
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default EditScreen;
