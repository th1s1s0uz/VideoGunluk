import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { usePopupStore } from "@/store/popupStore";
import PrimaryButton from "../primaryButton/primaryButton";


const Popup = () => {
  const {
    visible,
    title,
    buttonText,
    redirectTo,
    isRedirectButtonVisible,
    isCloseButtonVisible,
    hidePopup,
  } = usePopupStore();
  const router = useRouter();

  const handleRedirect = () => {
    if (redirectTo) {
      router.push(redirectTo);
      hidePopup();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={hidePopup}
    >
      <View className="flex-1 justify-center items-center ">
        <View className="bg-white p-5 rounded-lg w-75 relative">
          <Text className="text-lg mb-4 text-center">{title}</Text>

          {isCloseButtonVisible && (
            <TouchableOpacity
              onPress={hidePopup}
              className="absolute top-2 right-2 z-10"
            >
              <Text className="text-lg text-gray-600">Close</Text>
            </TouchableOpacity>
          )}

          {isRedirectButtonVisible && (
            <PrimaryButton title={buttonText} onPress={handleRedirect} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
