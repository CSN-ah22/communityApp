import { useLocalSearchParams, useRouter } from 'expo-router';
import { FirestoreDataConverter, addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

interface Comments{
  id: string;
  postId: string;
  email: string;
  comment: string;
  createdAt : string;
}

export default function PostEditorScreen() {
  const { id } = useLocalSearchParams();
  // id가 string 또는 string[] 일 수 있으니 string으로 변환 필요
  const postId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] =  useState<Post | null>(null);
  const [comments, setComments] = useState<Comments[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  
  const user = auth.currentUser;
  const userEmail = user?.email ?? ""; // 현재 로그인된 사용자의 email

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // **********************************************************************************************
  // 게시물 리스트 조회
  // **********************************************************************************************
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

      const unsub = onSnapshot(doc(db, "posts", postId).withConverter(postConverter), (docSnap) => {
        if (docSnap.exists()) {
          setPost(docSnap.data());
        }else {
          console.log('해당 게시물이 존재하지 않음');
        }
      });

      setLoading(false);

      return () => unsub();
    } catch (error) {
      console.error('게시물 가져오기 오류: ', error);
    }
  };
  // **********************************************************************************************


  // **********************************************************************************************
  // 댓글 리스트 조회
  // **********************************************************************************************
  const fetchComments = async() => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('postId', '==', postId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsList: Comments[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            postId: data.postId,
            email: data.email,
            comment: data.comment,
            createdAt: data.createdAt.split('T')[0], //2025-08-10T14:44:26.212Z 'T'이전 글자만 사용
          };
        });

        // 상태 업데이트
        setComments(commentsList);
      });

      // DB 실시간 구독 취소
      return () => unsubscribe();

    } catch (error) {
      console.error('댓글 가져오기 오류:', error);
    }
  }
  // **********************************************************************************************

  useEffect(() => {
    if (!id) return;
    
    fetchPost();
    fetchComments();
  }, [id]);


  // **********************************************************************************************
  // 게시물 삭제(작성자만 허용)
  // **********************************************************************************************
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
  // **********************************************************************************************



  // **********************************************************************************************
  // 댓글 등록 요청
  // **********************************************************************************************
  const saveComment = async() =>{
    if (!comment.trim()) {
      alert("댓글을 입력해주세요.")
      return;
    }

    try {
      // 1) Firestore에 저장
      const payload = {
        postId: postId,
        email: userEmail, // 현재 로그인된 사용자 이메일
        comment: comment,
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "comments"), payload);
      updateCommentCount();

      // 2) 초기화
      setComment("");
      alert("댓글이 등록되었습니다.");
    } catch (error:any) {
      console.log("code:", error?.code);
      console.log("message:", error?.message);
      console.log("serverResponse:", error?.customData?.serverResponse);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  }
  // **********************************************************************************************


  // **********************************************************************************************
  // 댓글 개수 업데이트
  // **********************************************************************************************
  const updateCommentCount = async () => {
    try {
      // posts 컬렉션에서 해당 postId와 일치하는 문서 가져오기
      const postRef = doc(db, "posts", postId);
      const docSnap = await getDoc(postRef);
      
      // 일치하는 문서가 있는 경우에만 업데이트
      if (docSnap) {
        const postDoc = docSnap;
        
        // 기존 댓글수에서 증가후 업데이트
        const newCommentCount = (comments?.length || 0) + 1;
        await updateDoc(postDoc.ref, {
          commentCount: newCommentCount
        });

        // console.log(`commentCount 업데이트 성공! 새로운 값: ${newCommentCount}`);
      } else {
        console.log('해당 postId에 해당하는 게시물이 없습니다.');
      }
    } catch (error) {
      console.error('댓글 수 업데이트 중 오류 발생: ', error);
    }
  };
  // **********************************************************************************************


  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </View>
  );

  if (!post) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>게시물을 찾을 수 없습니다.</Text>
    </View>
  );  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            // 댓글 입력 시 자동으로 하단으로 스크롤
            if (comment.trim()) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>게시물 상세</Text>
          </View>

          {/* 게시물 내용 */}
          <View style={styles.postContainer}>
            {/* 썸네일 이미지 */}
            {post.thumbnailUrl !== "" && (
              <View style={styles.imageContainer}>
                {imageLoading && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.imageLoadingText}>이미지 로딩 중...</Text>
                  </View>
                )}
                <Image
                  source={{ uri: post.thumbnailUrl }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </View>
            )}

            {/* 게시물 정보 */}
            <View style={styles.postInfo}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.postType}</Text>
                </View>
              </View>

              <View style={styles.postMeta}>
                <Text style={styles.authorText}>작성자: {post.email}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>조회수</Text>
                    <Text style={styles.statValue}>{post.viewCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>댓글수</Text>
                    <Text style={styles.statValue}>{comments?.length || 0}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{post.content}</Text>
              </View>

              {/* 삭제 버튼 (작성자만 표시) */}
              {userEmail === post.email && (
                <TouchableOpacity style={styles.deleteButton} onPress={removePost}>
                  <Text style={styles.deleteButtonText}>삭제하기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 댓글 섹션 */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>댓글</Text>
            
            {/* 댓글 입력 */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="댓글을 입력해주세요..."
                value={comment}
                onChangeText={(text) => setComment(text)}
                multiline
                onFocus={() => {
                  // 댓글 입력 필드에 포커스될 때 자동 스크롤
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
              <TouchableOpacity style={styles.commentSubmitButton} onPress={saveComment}>
                <Text style={styles.commentSubmitText}>등록</Text>
              </TouchableOpacity>
            </View>

            {/* 댓글 목록 */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{item.email}</Text>
                    <Text style={styles.commentDate}>{item.createdAt}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.comment}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsText}>아직 댓글이 없습니다.</Text>
                </View>
              }
            />
          </View>
          
          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  postContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  imageLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  postInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorText: {
    fontSize: 16,
    color: '#555',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    marginLeft: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  contentContainer: {
    marginTop: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    marginRight: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f5f5f5',
  },
  commentSubmitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCommentsText: {
    fontSize: 16,
    color: '#888',
  },
  bottomSpacing: {
    height: 100, // 하단 여백을 위한 빈 공간
  },
});
