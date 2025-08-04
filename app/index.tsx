import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { db } from "../firebase";
import LoginScreen from "./(auth)/login";

export default function IndexScreen() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList: any[] = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      console.log("불러온 유저:", userList);

      setUsers(userList);
    };
    fetchUsers();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"}}>      
      <LoginScreen/> {/* 로그인 화면 */}
    </View>
  );
}
