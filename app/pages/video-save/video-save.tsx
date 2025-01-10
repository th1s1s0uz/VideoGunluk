import { Video } from "expo-av";
import { useLocalSearchParams, usePathname } from "expo-router";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as SQLite from "expo-sqlite";
import PrimaryButton from "@/components/primaryButton/primaryButton";
import { usePopupStore } from "@/store/popupStore";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = Yup.object().shape({
  title: Yup.string()
    .required("Başlık zorunlu")
    .min(3, "Başlık en az 3 karakter olmalıdır."),
  description: Yup.string()
    .required("Açıklama zorunlu")
    .min(10, "Açıklama en az 10 karakter olmalıdır."),
});

const VideoSave = () => {
  const { videoUri } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showPopup } = usePopupStore();
  const videoRef = useRef<Video>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/pages/video-save/video-save") {
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.stopAsync();
      }
    }
  }, [pathname]);

  console.log(pathname);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const setupDatabase = async () => {
      const db = await SQLite.openDatabaseAsync("videos.db");
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          uri TEXT NOT NULL, 
          title TEXT, 
          description TEXT
        );
      `);
    };

    setupDatabase();
  }, []);

  const saveToDatabase = async (data: {
    title: string;
    description: string;
  }) => {
    if (!videoUri || !data.title || !data.description) {
      alert("Please fill all fields");
      return;
    }

    const db = await SQLite.openDatabaseAsync("videos.db");

    try {
      const result = await db.runAsync(
        "INSERT INTO videos (uri, title, description) VALUES (?, ?, ?)",
        videoUri,
        data.title,
        data.description
      );
      if (result.lastInsertRowId) {
        showPopup({
          title: "Video başarıyla kaydedildi.",
          buttonText: "Tamam",
          redirectTo: "/",
          isRedirectButtonVisible: true,
          isCloseButtonVisible: false,
        });
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!videoUri) {
    return <Text>Video yolu alınamadı!</Text>;
  }

  const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-5">
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            rate={1.0}
            isLooping
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={false}
            className="w-full h-72"
            useNativeControls
          />

          <Text className="text-base font-bold my-2">Başlık</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  className="h-10 border border-gray-400 rounded px-2"
                  placeholder="Bir başlık girin."
                />
                {errors.title && (
                  <Text className="text-red-500 text-xs mb-2">
                    {errors.title.message}
                  </Text>
                )}
              </>
            )}
          />

          <Text className="text-base font-bold my-2">Açıklama</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  className="h-32 border border-gray-400 rounded px-3 py-2 text-base"
                  placeholder="Bir açıklama girin."
                  multiline
                  textAlignVertical="top"
                />
                {errors.description && (
                  <Text className="text-red-500 text-xs mb-2">
                    {errors.description.message}
                  </Text>
                )}
              </>
            )}
          />
          <View className="mt-5">
            <PrimaryButton
              title="KAYDET"
              onPress={handleSubmit(saveToDatabase)}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VideoSave;

