import React, { useEffect, useState } from "react";

import * as Linking from "expo-linking";
import * as Updates from "expo-updates";
import { Text } from "react-native";
import { Portal, Snackbar } from "react-native-paper";

import { useIsFocused } from "@react-navigation/native";

const UpdateNotification = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const isFocused = useIsFocused();

  const checkForUpdates = async () => {
    const update = await Updates.checkForUpdateAsync();

    if (!update.isAvailable) {
      setIsUpdateAvailable(false);
      return;
    }

    const result = await Updates.fetchUpdateAsync();

    if (!result.isNew) {
      setIsUpdateAvailable(false);
      return;
    }
  };

  useEffect(() => {
    checkForUpdates()
      .then(() => {
        isFocused && setIsUpdateAvailable(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Portal>
      <Snackbar
        visible={isUpdateAvailable}
        onDismiss={() => {}}
        wrapperStyle={{ top: "80%" }}
        style={{ backgroundColor: "black" }}
        action={{
          labelStyle: { color: "green" },
          label: "Update",
          onPress: () => {
            Updates.reloadAsync();
            Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.luftjunkie_19.travelary&showAllReviews=true"
            );
            setIsUpdateAvailable(false);
          },
        }}
      >
        <Text style={{ color: "white" }}>New Update is available 🥳</Text>
      </Snackbar>
    </Portal>
  );
};

export default UpdateNotification;
