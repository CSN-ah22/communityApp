import { useLocalSearchParams, useRouter } from 'expo-router';
import { FirestoreDataConverter, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebase';

interface Post {
  title: string;
  content: string;
  email : string;
  postType : string;
  createdAt : string;
  updatedAt : string;
  viewCount : number;
  commentCount: number;
  isDelete: boolean;
  thumbnailUrl : string;
}

export default function PostEditorScreen() {
  const { id } = useLocalSearchParams();
  // id가 string 또는 string[] 일 수 있으니 string으로 변환 필요
  const postId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] =  useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  
  const user = auth.currentUser;
  const userEmail = user?.email ?? ""; // 현재 로그인된 사용자의 email

  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const postConverter: FirestoreDataConverter<Post> = {
        toFirestore(post: Post) {
          return post;
        },
        fromFirestore(snapshot, options) {
          const data = snapshot.data(options)!;
          return {
            title: data.title,
            content: data.content,
            email: data.email,
            postType: data.postType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            viewCount: data.viewCount,
            commentCount: data.commentCount,
            isDelete: data.isDelete,
            thumbnailUrl: data.thumbnailUrl,
          } as Post;
        },
      };

      const docRef = doc(db, 'posts', postId).withConverter(postConverter);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost(docSnap.data());
      }else {
          console.log('해당 게시물이 존재하지 않음');
        }
      } catch (error) {
        console.error('게시물 가져오기 오류: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);


  // 게시물 삭제(작성자만 허용)
  const removePost = async() =>{
    if (!postId) return;

    // 작성자 확인
    if (userEmail !== post?.email) {
      alert("삭제 권한이 없습니다.");
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", postId));
      alert("게시물이 삭제되었습니다.");
      router.push("/Main"); // 목록 페이지로 이동
    } catch (error) {
      console.error("게시물 삭제 오류:", error);
      alert("삭제에 실패했습니다.");
    }
  }

  if (loading) return <ActivityIndicator />;
  if (!post) return <Text>게시물을 찾을 수 없습니다.</Text>;  

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"}}>
      <Text>상세 화면</Text>
      <Text>작성자 : {post.email}</Text>
      <Text>카테고리 : {post.postType}</Text>
      <Text>제목 : {post.title}</Text>
      <Text>내용 : {post.content}</Text>     
      <Text>조회수 : {post.viewCount}</Text>     
      <Text>댓글수 : {post.commentCount}</Text>     
      {userEmail == post.email ? 
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "red",
            borderRadius: 5,
          }}
          onPress={removePost}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>삭제하기</Text>
        </TouchableOpacity>
      :<></>}
    </View>
  );
}
