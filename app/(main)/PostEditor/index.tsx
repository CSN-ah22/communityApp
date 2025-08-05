import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface Post {
  title: string;
  content: string;
  email: string;
  postType: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount: number;
  isDelete: boolean;
  thumbnailUrl: string;
}

export default function PostEditorScreen() {
  const [postType, setPostType] = useState("공지사항"); // 초기값
  const [post, setPost] = useState<Post>({
    title: "",
    content: "",
    email: "",
    postType: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
    commentCount: 0,
    isDelete: false,
    thumbnailUrl: "",
  });

  const handleChange = (field: keyof Post, value: string) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("폼 데이터:", post);
    // Firestore 저장 로직 예정
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        placeholder="제목 입력"
        value={post.title}
        onChangeText={(text) => handleChange("title", text)}
      />

      <Text style={styles.label}>게시물 유형</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={postType}
          onValueChange={(itemValue) => setPostType(itemValue)}
        >
          <Picker.Item label="공지사항" value="공지사항" />
          <Picker.Item label="일반글" value="일반글" />
          <Picker.Item label="Q&A" value="Q&A" />
        </Picker>
      </View>

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="내용 입력"
        value={post.content}
        onChangeText={(text) => handleChange("content", text)}
        multiline
      />

      {/* <Text style={styles.label}>썸네일 URL</Text>
      <TextInput
        style={styles.input}
        placeholder="이미지 URL 입력"
        value={post.thumbnailUrl}
        onChangeText={(text) => handleChange("thumbnailUrl", text)}
      /> */}

      <Button title="게시글 등록" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
});
