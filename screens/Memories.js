import { useCallback, useEffect, useState } from "react";

import { useFonts } from "expo-font";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

import IonIcons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const Memories = ({ navigation, route }) => {
  const [stored, setStored] = useState([]);
  const [isLoading, setLoading] = useState(false);
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
    const getData = async () => {
      setLoading(true);
      const data = await AsyncStorage.getItem("memorized");
      if (data != null) {
        setStored(JSON.parse(data));
        setLoading(false);
      } else {
        setLoading(false);
        return;
      }
    };

    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  const navigateToTravel = (itemId) => {
    navigation.navigate("MemorizedScreen", {
      id: itemId,
    });
  };

  useEffect(() => {
    setLoading(true);
    if (route.params !== undefined || route.params) {
      setStored(route.params.newArray);
      setLoading(false);
    }
  }, [route.params]);

  const removeMemory = async (itemId) => {
    const storedItems = await AsyncStorage.getItem("memorized");

    let converted = JSON.parse(storedItems);

    converted = converted.filter((item) => item.id !== itemId);

    await AsyncStorage.setItem("memorized", JSON.stringify(converted));

    setStored((prev) => prev.filter((item) => item.id !== itemId));
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      return;
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      onLayout={onLayoutRootView}
      style={
        stored.length === 0 && {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }
      }
    >
      {stored.length === 0 && !isLoading && (
        <Text style={{ fontFamily: "Poppins-Black", fontSize: 20 }}>
          No memories yet 😥
        </Text>
      )}

      {isLoading && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator
            animating={true}
            color={MD2Colors.black}
            size="large"
          />
          <Text>Loading...</Text>
        </View>
      )}

      {stored.length > 0 && (
        <FlatList
          data={stored}
          style={{ padding: 4 }}
          renderItem={(memory) => (
            <Pressable
              onPress={() => {
                navigateToTravel(memory.item.id);
              }}
              android_ripple={{ color: "gray" }}
              style={{
                backgroundColor: "black",
                borderRadius: 6,
                marginTop: 5,
              }}
            >
              <View
                style={{
                  padding: 5,
                  justifyContent: "space-between",
                  position: "relative",
                  flexDirection: "row",
                  alignItems: "center",
                  top: 0,
                  left: 0,
                }}
              >
                <Image
                  style={{ width: 150, height: 150, borderRadius: 5 }}
                  source={{ uri: memory.item.pictures[0].uri }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    marginHorizontal: 2,
                    marginTop: 6,
                  }}
                >
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    {memory.item.travelTitle.trim().length > 10
                      ? `${memory.item.travelTitle.slice(0, 10)}...`
                      : memory.item.travelTitle}
                  </Text>
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    Duration:{" "}
                    {Math.floor(
                      (new Date(memory.item.travelEnd).getTime() -
                        new Date(memory.item.travelStart).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) > 0
                      ? `${Math.floor(
                          (new Date(memory.item.travelEnd).getTime() -
                            new Date(memory.item.travelStart).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days`
                      : "Less than a day"}{" "}
                  </Text>
                  <Text style={{ color: "white", fontFamily: "Poppins-Light" }}>
                    {memory.item.pictures.length} pictures
                  </Text>
                </View>

                <Pressable
                  style={{
                    backgroundColor: "red",
                    position: "absolute",
                    top: 0,
                    right: 0,
                    padding: 2,
                    marginTop: 4,
                    marginRight: 4,
                    borderRadius: 4,
                  }}
                  android_ripple={{ color: "darkred" }}
                  onPress={() => {
                    removeMemory(memory.item.id);
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Poppins-Medium",
                      padding: 2,
                    }}
                  >
                    Delete{" "}
                    <IonIcons
                      name="trash"
                      style={{ fontWeight: 500, fontSize: 16 }}
                    />
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default Memories;
