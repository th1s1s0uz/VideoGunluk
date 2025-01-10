import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useFocusEffect, useRouter } from "expo-router";
import { useVideoStore } from "@/store/videoStore";

export default function HomeScreen() {
  const [videos, setVideos] = useState([]);
  const router = useRouter();
  const setVideoUri = useVideoStore((state) => state.setVideoUri);

  useFocusEffect(
    useCallback(() => {
      setVideoUri(null);
      fetchVideos();
    }, [setVideoUri])
  );

  const fetchVideos = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("videos.db");
      const result: any = await db.getAllAsync("SELECT * FROM videos");
      setVideos(result);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchVideos();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className="bg-gray-300 mb-2 p-4 rounded-lg"
        onPress={() => {
          router.push({
            pathname: "/pages/video-detail/video-detail",
            params: {
              videoUri: item.uri,
              title: item.title,
              description: item.description,
              id: item.id,
            },
          });
        }}
      >
        <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
        <Text className="text-sm text-gray-800 mt-1 mb-1">
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 px-5">
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
