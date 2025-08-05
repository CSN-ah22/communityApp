import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PostEditorScreen() {
  const { id } = useLocalSearchParams();
  console.log('id: ', id);
  
  return (
    <View>
      <Text>글쓰기 화면</Text>
    </View>
  )
}