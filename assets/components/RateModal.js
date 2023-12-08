import React from 'react';

import * as Linking from 'expo-linking';
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons
  from 'react-native-vector-icons/MaterialCommunityIcons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const RateModal = ({ isVisible, onClose }) => {
  const moveToRate = async () => {
    Linking.openURL(
      `https://play.google.com/store/apps/details?id=com.luftjunkie_19.travelary&showAllReviews=true`
    );
    await AsyncStorage.setItem("hasRated", JSON.stringify(true));
    AsyncStorage.setItem("lastNotificationTime", JSON.stringify(Date.now()));
    onClose();
  };

  const onAskLater = async () => {
    const nextNotificationTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await AsyncStorage.setItem(
      "nextNotificationTime",
      JSON.stringify(nextNotificationTime)
    );
    await AsyncStorage.setItem("hasRated", JSON.stringify(false));
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      style={{ position: "relative", top: 0, left: 0 }}
    >
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: Dimensions.get("window").height / 3.5,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          padding: 5,
          borderTopRightRadius: 7,
          borderTopLeftRadius: 7,
        }}
      >
        <Text style={{ textAlign: "center" }}>
          <MaterialCommunityIcons name="star" size={30} color="yellow" />
        </Text>

        <Text
          style={{
            textAlign: "center",
            fontSize: 24,
            lineHeight: 30,
            fontWeight: "700",
            padding: 10,
            color: "white",
          }}
        >
          Are you enjoying the app?
        </Text>

        <Text style={{ color: "white", marginBottom: 30, textAlign: "center" }}>
          In case you do please rate us on Google Store.
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <Pressable
            style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}
            android_ripple={{ color: "navy" }}
            onPress={onAskLater}
          >
            <Text style={{ color: "white" }}>Ask me later</Text>
          </Pressable>
          <Pressable
            style={{ backgroundColor: "orange", padding: 10, borderRadius: 5 }}
            android_ripple={{ color: "rgba(253, 92, 0, 1)" }}
            onPress={moveToRate}
          >
            <Text style={{ color: "white" }}>Rate now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default RateModal;
