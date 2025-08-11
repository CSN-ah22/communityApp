import uploadImageAsync from '@/utils/uploadImage';
import { Picker } from "@react-native-picker/picker";
import { useIsFocused } from "@react-navigation/native";
import { router } from 'expo-router';
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { ImagePickerButton, ImagePickerButtonRef } from "../../../components/ImagePickerButton";
import { auth, db } from '../../../firebase';
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
  const user = auth.currentUser;
  const userEmail = user?.email ?? ""; // 현재 로그인된 사용자의 email
  const imagePickerRef = useRef<ImagePickerButtonRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const initialPost: Post = {
    title: "",
    content: "",
    email: userEmail,
    postType: "공지사항",
    createdAt: "",
    updatedAt: "",
    viewCount: 0,
    commentCount: 0,
    isDelete: false,
    thumbnailUrl: "",
  };

  const [post, setPost] = useState<Post>(initialPost);
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();
  
  useEffect(() => {
    setPost(initialPost); // Input 초기화
    imagePickerRef.current?.clear(); // 이미지 초기화 호출
    
    // 화면이 포커스될 때 스크롤 위치를 상단으로 초기화
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  },[isFocused])
  

  // Input 상태 관리
  const handleChange = (field: keyof Post, value: string) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };


  // **********************************************************************************************
  // 게시물 등록 요청
  // **********************************************************************************************
  const handleSubmit = async() => {        
    // console.log("폼 데이터:", post);
    // console.log("이미지 uri: ", post.thumbnailUrl);

    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    if (!post.title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    } else if (!post.content.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    // 로딩 시작
    setIsLoading(true);

    try {
      // 1) 로컬 이미지 => blob로 변환하여 업로드
      let thumbnailUrl = post.thumbnailUrl;
      const looksLikeLocal = /^file:|^content:/.test(thumbnailUrl || "");
      if (thumbnailUrl && looksLikeLocal) {
        thumbnailUrl = await uploadImageAsync(thumbnailUrl, "posts");
      }

      // 2) Firestore에 저장
      const payload = {
        ...post,
        email: userEmail, // 현재 로그인된 사용자 이메일
        thumbnailUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "posts"), payload);

      // 3) 초기화
      setPost({ ...initialPost, email: userEmail });
      imagePickerRef.current?.clear();
      Alert.alert(
        "게시글 등록 완료",
        "게시시글이 성공적으로 등록되었습니다.",
        [
          {
            text: "확인", 
            onPress: () => {
              // Alert에서 "확인"을 누르면 홈 화면(목록 화면)으로 이동
              router.push('/Main');  // React Navigation에서 Main 화면으로 이동
            }
          }
        ]
      );
    } catch (error:any) {
      console.log("code:", error?.code);
      console.log("message:", error?.message);
      console.log("serverResponse:", error?.customData?.serverResponse);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      // 로딩 종료
      setIsLoading(false);
    }
  };
  // **********************************************************************************************


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 40}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>게시글 작성</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.container} 
          showsVerticalScrollIndicator={false}          
        >
          {/* 제목 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력해주세요"
              placeholderTextColor="#999"
              value={post.title}
              onChangeText={(text) => handleChange("title", text)}
            />
          </View>

          {/* 게시물 유형 선택 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>게시물 유형</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={post.postType}
                onValueChange={(itemValue) => handleChange("postType", itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="공지사항" value="공지사항" />
                <Picker.Item label="자유글" value="자유글" />
                <Picker.Item label="Q&A" value="Q&A" />
              </Picker>
            </View>
          </View>

          {/* 내용 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력해주세요"
              placeholderTextColor="#999"
              value={post.content}
              onChangeText={(text) => handleChange("content", text)}
              multiline
              textAlignVertical="top"
              onFocus={() => {
                // 내용 입력 필드에 포커스될 때 적절한 위치로 스크롤
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 150, // 헤더 높이 + 여유 공간
                    animated: true
                  });
                }, 300);
              }}
            />
          </View>

          {/* 이미지 선택 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>이미지 첨부</Text>
            <View style={styles.imagePickerContainer}>
              <ImagePickerButton 
                ref={imagePickerRef} 
                onPicked={(uri) => handleChange("thumbnailUrl", uri)} 
              />
            </View>
          </View>

          {/* 등록 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>등록 중...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>게시글 등록</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
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
  picker: {
    width: "100%",
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  contentInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    textAlignVertical: "top",
    height: 150,
  },
  imagePickerContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputSection: {
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 100, // 탭바 높이 + 추가 여백
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
