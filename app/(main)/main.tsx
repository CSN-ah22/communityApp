import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, doc, increment, onSnapshot, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

export default function MainScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() =>{
    // 게시글 목록 불러오기
    fetchPosts(); 
  }, []);
  

  // 로그아웃 동작
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공");
      router.replace("/"); // 로그인 화면으로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const fetchPosts = async () =>{
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList: any[] = [];
      snapshot.forEach((doc) => postList.push({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });
    return () => unsubscribe();
  };

  const handlePress = async (item: any) => {
    try {
      // 조회수 1 증가
      const postRef = doc(db, "posts", item.id);
      await updateDoc(postRef, {
        viewCount: increment(1),
      });
      
      console.log(`조회수 증가: ${item.title}`);
      // 상세 페이지 이동 (navigation을 사용하거나 router.push)
      // router.push("/(main)/detail");      
    } catch (error) {
      console.error("조회수 증가 실패:", error);
    }
  };

  return(
    <View style={{ flex: 1, marginTop: "20%", justifyContent: "center", alignItems: "center", backgroundColor: "#fff"}}>
      <Text>메인화면</Text>
      <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.meta}>
                {item.postType} · 댓글 {item.commentCount}개 · 조회수 {item.viewCount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "red",
          borderRadius: 5,
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#888",
  },
});