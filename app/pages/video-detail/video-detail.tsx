import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Video } from "expo-av";
import * as SQLite from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import PrimaryButton from "@/components/primaryButton/primaryButton";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePopupStore } from "@/store/popupStore";

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Başlık gereklidir")
    .min(3, "Başlık en az 3 karakter olmalı"),
  description: Yup.string()
    .required("Açıklama gereklidir")
    .min(10, "Açıklama en az 10 karakter olmalı"),
});

export default function VideoDetailPage() {
  const {
    videoUri,
    title: initialTitle,
    description: initialDescription,
    id,
  } = useLocalSearchParams();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const [tempDescription, setTempDescription] = useState(initialDescription);
  const [modalVisible, setModalVisible] = useState(false);
  const { showPopup } = usePopupStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
    },
  });

  const updateVideoDetails = async (data: any) => {
    const db = await SQLite.openDatabaseAsync("videos.db");
    try {
      const result = await db.runAsync(
        "UPDATE videos SET title = ?, description = ? WHERE id = ?",
        [data.title, data.description, id]
      );
      if (result.changes > 0) {
        setTitle(data.title);
        setDescription(data.description);
        setModalVisible(false);
      } else {
        console.log("No rows affected. Something went wrong.");
        showPopup({
          title: "Birşeyler yanlış gitti.",
          buttonText: "Tamam",
          redirectTo: "",
          isRedirectButtonVisible: false,
          isCloseButtonVisible: true,
        });
      }
    } catch (error) {
      showPopup({
        title: "Video güncellenirken bir sorun oluştu.",
        buttonText: "Tamam",
        redirectTo: "",
        isRedirectButtonVisible: false,
        isCloseButtonVisible: true,
      });
    }
  };

  return (
    <View className="flex-1 px-4 pt-5">
      <Video
        source={{ uri: videoUri }}
        rate={1.0}
        isLooping
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        className="w-full h-72"
        useNativeControls
      />
  
      <View className="flex-row justify-between items-center h-12">
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
        <TouchableOpacity
          className="bg-transparent"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-lg text-gray-800">Düzenle</Text>
        </TouchableOpacity>
      </View>
  
      <Text className="text-base text-gray-500 mt-2 px-5">{description}</Text>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center">
          <View className="w-72 bg-white p-5 rounded-lg">
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`h-10 border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } mb-4 px-2`}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Yeni başlık"
                />
              )}
              name="title"
            />
            {errors.title && (
              <Text className="text-red-500 text-xs mb-2">
                {errors.title.message}
              </Text>
            )}
  
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`h-10 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } mb-4 px-2`}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Yeni açıklama"
                />
              )}
              name="description"
            />
            {errors.description && (
              <Text className="text-red-500 text-xs mb-2">
                {errors.description.message}
              </Text>
            )}
  
            <PrimaryButton
              title="Kaydet"
              onPress={handleSubmit(updateVideoDetails)}
            />
            <TouchableOpacity
              className="mt-2 bg-red-500 py-2 rounded-md items-center"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-lg">İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};