import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
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
      router.push("/"); // 회원가입 후 로그인 화면 또는 메인 화면으로 이동
    } catch (e: any) {
      console.error("회원가입 에러:", e.message);
      setError(e.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"}}>
      <Text style={{ fontSize: 24 }}>회원가입 화면</Text>
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
      <TextInput
        placeholder="이름"
        value={name}
        onChangeText={setName}
        style={{ width: "80%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TouchableOpacity
        style={{
          padding: 10,
          marginTop: 20,
          backgroundColor: "blue",
          borderRadius: 5,
        }}
        onPress={() => handleSignup()}
      >
        <Text style={{ color: "#fff" }}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          padding: 10,
          marginTop: 8,
          backgroundColor: "blue",
          borderRadius: 5,
        }}
        onPress={() => router.back()}
      >
        <Text style={{ color: "#fff" }}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  );
}
