import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailCheck, setEmailCheck] = useState<string>(''); // 이메일 형식 검사
  const [password, setPassword] = useState("");
  const [passWordCheck, setPassWordCheck] = useState<string>(''); // 비밀번호 길이 검사
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSignup = async () => {
    try {
      if(emailCheck.trim()){
        alert("이메일 형식을 확인해주세요.")
        return
      }

      if(passWordCheck.trim()){
        alert("비밀번호 형식을 확인해주세요.")
        return
      }


      // 로딩 시작
      setIsLoading(true);
      setError("");

      // 1. Firebase Auth에 회원가입 요청
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Firestore users 컬렉션에 사용자 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      console.log("회원가입 성공:", user.uid);      
      router.push("/Main"); // 회원가입 후 로그인 화면 또는 메인 화면으로 이동
    } catch (e: any) {
      console.error("회원가입 에러:", e.message);
      setError("회원 가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      // 로딩 종료
      setIsLoading(false);
    }
  };

  // 이메일 유효성 검사 함수
  const validateEmail = (inputEmail: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(inputEmail)) {
      setEmailCheck("올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailCheck(""); // 이메일 형식이 맞으면 오류 메시지 지우기
    }
  };

  // 이메일 입력 시 유효성 검사와 상태 업데이트
  const handleEmailChange = (inputEmail: string) => {
    setEmail(inputEmail); // 이메일 상태 업데이트
    validateEmail(inputEmail); // 이메일 유효성 검사
  };

  const validatePassword = (pwd: string) =>{
    const size = 8;
    if (pwd.length < 8) {
      setPassWordCheck("비밀번호의 길이가 너무 짧습니다. 8자리 이상으로 입력해주세요.")
    } else {
      setPassWordCheck(""); // 이메일 형식이 맞으면 오류 메시지 지우기
    }
  }
  const handlePasswordChange = (inputPassword: string) =>{
    setPassword(inputPassword);
    validatePassword(inputPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar/>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>회원가입</Text>
              <Text style={styles.headerSubtitle}>새로운 계정을 만들어보세요</Text>
            </View>

            {/* 회원가입 폼 */}
            <View style={styles.formContainer}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* 이름 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.input}
                  placeholder="이름을 입력해주세요"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>

              {/* 이메일 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={styles.input}
                  placeholder="이메일을 입력해주세요"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailCheck ? <Text style={styles.errorText}>{emailCheck}</Text> : null}
              </View>

              {/* 비밀번호 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  autoCapitalize="none"                  
                  onFocus={() => {
                    // 비밀번호 포커스가 되면 하단으로 자동 스크롤
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                />
                {passWordCheck ? <Text style={styles.errorText}>{passWordCheck}</Text> : null}
              </View>

              {/* 회원가입 버튼 */}
              <TouchableOpacity 
                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.signupButtonText}>가입 중...</Text>
                  </View>
                ) : (
                  <Text style={styles.signupButtonText}>회원가입</Text>
                )}
              </TouchableOpacity>

              {/* 뒤로가기 버튼 */}
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>뒤로가기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginTop: 40,
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  signupButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
});
