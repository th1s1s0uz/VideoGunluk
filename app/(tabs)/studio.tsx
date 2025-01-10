import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  Button,
  View,
  Dimensions,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SliderComponent from "@/components/videoSlider/videoSlider";
import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";
import { router, usePathname } from "expo-router";
import PrimaryButton from "@/components/primaryButton/primaryButton";
import { useVideoStore } from "@/store/videoStore";

const { width } = Dimensions.get("window");

export default function StudioScreen() {
  const videoUri = useVideoStore((state) => state.videoUri);
  const setVideoUri = useVideoStore((state) => state.setVideoUri);  
  const [videoDuration, setVideoDuration] = useState(0);
  const [translateXValue, setTranslateXValue] = useState(0);
  const [isDurationLogged, setIsDurationLogged] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);

  const videoRef = useRef<Video>(null);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/studio") {
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.stopAsync();
      }
    }
  }, [pathname]);

  console.log(videoUri)

  const pickVideo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.isLoaded && status.durationMillis) {
        const durationInSeconds = status.durationMillis / 1000;
        if (!isDurationLogged) {
          setVideoDuration(durationInSeconds);
          setIsDurationLogged(true);
        }
      }
  
      if (status.positionMillis >= endTime * 1000) {
        if (videoRef.current) {
          videoRef.current.setPositionAsync(startTime * 1000);
          videoRef.current.playFromPositionAsync(startTime * 1000);
        }
      }
    },
    [isDurationLogged, startTime, endTime]
  );

  const onSliderChange = (newTranslateX: number) => {
    const duration = videoDuration;

    let newStartTime = (newTranslateX / (width * 0.85)) * duration;

    if (newStartTime > duration - 5) {
      newStartTime = duration - 5;
    }

    const newEndTime = newStartTime + 5;

    setStartTime(newStartTime);
    setEndTime(newEndTime);
    if (videoRef.current) {
      videoRef.current.setPositionAsync(newStartTime * 1000);
    }

    setTranslateXValue(newTranslateX);
  };

  const trimVideo = async () => {
    if (!videoUri) {
      alert("Please select a video first.");
      return;
    }

    const start = startTime;
    const end = endTime;

    const timestamp = new Date().getTime();
    const outputUri = `${FileSystem.documentDirectory}trimmed_video_${timestamp}.mp4`;

    const ffmpegCommand = `-i ${videoUri} -ss ${start} -to ${end} -c:v mpeg4 -c:a aac ${outputUri}`;

    FFmpegKit.execute(ffmpegCommand).then(async (session) => {
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        router.push({
          pathname: "/pages/video-save/video-save",
          params: { videoUri: outputUri },
        });
      } else if (ReturnCode.isCancel(returnCode)) {
        console.log("FFmpeg kırpmayı iptal ettii");
      } else {
        console.error("kırpılırken hata oluştu");
      }
    });
  };
  
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        {!videoUri && (
          <View>
            <Text className="text-center text-lg font-bold mb-5">
              Bir Video Seç
            </Text>
            <Button
              title={videoUri ? "Başka Bir Video Seç" : "Video Seç"}
              onPress={pickVideo}
            />
          </View>
        )}
        {videoUri && (
          <>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              shouldPlay={true}
              isLooping
              resizeMode={ResizeMode.CONTAIN}
              className="w-full h-2/5"
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
            <PrimaryButton title="BAŞKA BİR VİDEO SEÇ" onPress={pickVideo} />

            {videoDuration > 0 && (
              <>
                <Text className="text-center text-base mb-2">
                </Text>
              </>
            )}

            <SliderComponent
              translateXValue={translateXValue}
              setTranslateXValue={setTranslateXValue}
              onSliderChange={onSliderChange}
              videoDuration={videoDuration}
            />
            <PrimaryButton title="KIRP" onPress={trimVideo} />
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
