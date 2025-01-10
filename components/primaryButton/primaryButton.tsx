import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      className="py-2 px-5 my-1 bg-[#252525] rounded-lg"
      onPress={onPress}
    >
      <Text className="text-[#f5f5f5] text-xl text-center">{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
