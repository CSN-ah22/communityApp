import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { auth, db } from "../firebase";
import LoginScreen from "./(auth)/Login";

export default function IndexScreen() {
  const [users, setUsers] = useState<any[]>([]);  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 앱 실행 시 Firebase 로그인 상태 확인
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("로그인 유지됨:", user.email);
        // 로그인 상태면 메인 화면으로 바로 이동
        router.replace("/Main");
      }
      // 로그인 상태 확인 완료
      setCheckingAuth(false);
    });

    fetchUsers();
    
    return unsubscribe; // 컴포넌트 언마운트 시 리스너 해제
  }, []);


  // 사용자 목록 불러 오기(log찍기)
  const fetchUsers = async () => {
    const q = await getDocs(collection(db, "users"));
    const userList: any[] = [];
    q.forEach((doc) => {
      userList.push({ id: doc.id, ...doc.data()});
    });
    console.log("불러온 유저 목록:", userList);

    setUsers(userList);
  };  

  // 로그인 상태 확인 중일 때 로딩 화면 표시
  if (checkingAuth) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text>로그인 상태 확인 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1,  backgroundColor: "#fff"}}>      
      <LoginScreen/>
    </View>
  );
}
