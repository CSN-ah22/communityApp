import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, doc, increment, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  // 게시글 목록 불러오기
  const fetchPosts = async () =>{
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList: any[] = [];
      snapshot.forEach((doc) => postList.push({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });
    return () => unsubscribe();
  };

  const viewPost = async (item: any) => {
    try {
      // 조회수 증가 저장
      const postRef = doc(db, "posts", item.id);
      await updateDoc(postRef, {
        viewCount: increment(1),
      });      
      // console.log(`조회수 증가: ${item.title}`);

      // 게시물 상세 페이지로 이동
      router.push({
        pathname: "/(main)/PostEditor/[id]",
        params: { id: item.id },             
      });
    } catch (error) {
      console.error("조회수 증가 실패:", error);
    }
  };

  return(
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 게시글 목록 */}
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.postCard} onPress={() => viewPost(item)}>
              <View style={styles.postHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.postType}</Text>
                </View>
                <Text style={styles.postDate}>
                  {item.createdAt ? item.createdAt.split('T')[0] : ''}
                </Text>
              </View>
              
              <Text style={styles.postTitle} numberOfLines={2}>
                {item.title}
              </Text>
              
              <Text style={styles.postContent} numberOfLines={3}>
                {item.content}
              </Text>
              
              <View style={styles.postFooter}>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorText}>{item.email}</Text>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💬</Text>
                    <Text style={styles.statText}>{item.commentCount || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>👁️</Text>
                    <Text style={styles.statText}>{item.viewCount || 0}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>게시글이 없습니다</Text>
              <Text style={styles.emptyText}>첫 번째 게시글을 작성해보세요!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20, // FlatList 아래 여백
  },
  postCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
  },
  postDate: {
    fontSize: 12,
    color: "#888",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  postContent: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorText: {
    fontSize: 12,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  statText: {
    fontSize: 14,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});