import * as ImagePicker from "expo-image-picker";
import { forwardRef, useImperativeHandle, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onPicked: (uri: string) => void; // 부모에게 선택 결과 전달
  label?: string;
};

export type ImagePickerButtonRef = {
  clear: () => void;
};

export const ImagePickerButton = forwardRef<ImagePickerButtonRef, Props>(({ onPicked }, ref) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    clear: () => setUri(null),
  }));

  const pickImage = async () => {
    // 사진 접근 권한
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return alert("사진 접근 권한이 필요합니다.");

    setLoading(true);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!res.canceled) {
        const picked = res.assets[0].uri;
        setUri(picked);
        onPicked(picked);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>이미지 첨부</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator />}

      {uri && (
        <View style={styles.previewWrap}>
          <Image source={{ uri }} style={styles.preview} />
          <Text numberOfLines={1} style={styles.previewText}>{uri}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  previewWrap: { gap: 6 },
  preview: { width: "100%", height: 160, borderRadius: 8 },
  previewText: { fontSize: 12, color: "#555" },
});