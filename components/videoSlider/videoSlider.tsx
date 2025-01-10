import React, { useCallback } from "react";
import { Dimensions, View } from "react-native";
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get("window");

interface SliderComponentProps {
  translateXValue: number;
  setTranslateXValue: React.Dispatch<React.SetStateAction<number>>;
  onSliderChange: (newTranslateX: number) => void;
  videoDuration: number;
}

const SliderComponent: React.FC<SliderComponentProps> = ({ translateXValue, setTranslateXValue, onSliderChange, videoDuration }) => {
  const translateX = useSharedValue(translateXValue);
  const initialTranslation = useSharedValue(0);
  const debounceTimeout = useSharedValue<NodeJS.Timeout | null>(null);

  const maxTranslateX = width * 0.70 - width * 0.15;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(translateX.value, { duration: 10 }) }],
    };
  });

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    let newTranslateX = initialTranslation.value + translationX;

    if (newTranslateX >= 0 && newTranslateX <= maxTranslateX) {
      translateX.value = newTranslateX;
    }
  };

  const onGestureEnd = () => {
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }

    debounceTimeout.value = setTimeout(() => {
      setTranslateXValue(translateX.value);
      initialTranslation.value = translateX.value;
      onSliderChange(translateX.value);
    }, 1000);
  };

  return (
    <View
      style={{
        width: width * 0.70,
        height: 100,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        borderRadius: 10,
      }}
    >
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onGestureEnd}>
        <Animated.View
          style={[
            {
              width: width * 0.15,
              height: '80%',
              backgroundColor: 'darkgray',
              borderRadius: 5,
            },
            animatedStyle,
          ]}
        />
      </PanGestureHandler>
    </View>
  );
};

export default SliderComponent;
