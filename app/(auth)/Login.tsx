import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("로그인 성공");
      router.push("/Main") // 로그인 성공 후 메인 화면 이동
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>로그인</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={{ width: "80%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ width: "80%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      {/* 로그인/회원가입 버튼 */}
      <TouchableOpacity 
        style={{
          width: "80%",
          padding: 10,
          backgroundColor: "blue",
          alignItems: "center",
          marginBottom: 10,
          borderRadius: 5,
        }}
        onPress={handleLogin}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{
          width: "80%",
          padding: 10,
          backgroundColor: "blue",
          alignItems: "center",
          marginBottom: 10,
          borderRadius: 5,
        }}
        onPress={() => router.push("/Signup")}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
