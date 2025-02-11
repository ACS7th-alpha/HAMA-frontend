'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Link from 'next/link';

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [myPosts, setMyPosts] = useState([]); // 내가 쓴 글 저장할 상태
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchMyPosts();
    }
  }, [activeTab]);

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
  
    const confirmDelete = window.confirm('이 글을 정말 삭제하시겠습니까?');
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('로그인이 필요합니다.');
  
      const response = await fetch(`http://localhost:3004/reviews/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('글 삭제 실패');
  
      // 글 삭제 성공 시, 화면에서 해당 글 제거
      setMyPosts(myPosts.filter((post) => post._id !== postId));
      alert('글이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('글 삭제 중 오류가 발생했습니다.');
    }
  };
  
  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('로그인이 필요합니다.');

      const response = await fetch('http://localhost:3004/reviews/my-reviews', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('내가 쓴 글을 불러오는 데 실패했습니다.');

      const data = await response.json();
      setMyPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userInfo) return;

    const confirmDelete = window.confirm('정말 계정을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('http://localhost:3001/auth/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`, // 액세스 토큰 사용
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('계정 삭제 실패');

      // 계정 삭제 성공 시 localStorage에서 삭제 후 메인 페이지로 이동
      localStorage.removeItem('user');
      alert('계정이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-0">
      <Header />
      <div className="max-w-6xl mx-auto p-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
              <img
                src={userInfo.photo}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {userInfo.nickname} <span className="ml-2">👋</span>
              </h1>
              <p className="text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            프로필 정보
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'children'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            자녀 정보
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-yellow-300 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            내가 쓴 글
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            설정
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-3xl shadow-lg p-12">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                프로필 정보 <span className="ml-2">📝</span>
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-2">이메일</p>
                  <p className="text-lg font-semibold">{userInfo.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">닉네임</p>
                  <p className="text-lg font-semibold">{userInfo.nickname}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'children' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                자녀 정보 <span className="ml-2">👶</span>
              </h2>
              {userInfo.children && userInfo.children.length > 0 ? (
                userInfo.children.map((child, index) => (
                  <div
                    key={index}
                    className=" rounded-2xl p-6 border-2 border-blue-100"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 mb-2">이름</p>
                        <p className="text-lg font-semibold">{child.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">생년월일</p>
                        <p className="text-lg font-semibold">
                          {new Date(child.birthdate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">성별</p>
                        <p className="text-lg font-semibold">{child.gender}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">등록된 자녀 정보가 없습니다.</p>
              )}
            </div>
          )}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                내가 쓴 글 <span className="ml-2">📝</span>
              </h2>
              {loading ? (
                <p className="text-gray-600">불러오는 중...</p>
              ) : myPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {myPosts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/community/${post._id}`)}
                    >
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => handleDeletePost(e, post._id)}
                        className=" px-3 py-1.5 bg-pink-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        삭제
                      </button>
                      <div className="flex flex-col h-full">
                        {/* 이미지 섹션 */}
                        <div className="relative aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-gray-100">
                          {post.thumbnailUrls && post.thumbnailUrls.length > 0 ? (
                            <img
                              src={post.thumbnailUrls[0]}
                              alt={post.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-3 py-2 rounded-full text-m font-semibold ${
                                post.recommended
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {post.recommended ? '👶 추천템' : '😢 비추천템'}
                            </span>
                          </div>
                        </div>

                        {/* 컨텐츠 섹션 */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{post.name}</h3>
                          <p className="text-m text-gray-500 mb-2">사용 연령: {post.ageGroup}</p>  
                          <p className="text-gray-600 text-m line-clamp-2 mb-4">{post.description}</p>
                          <p className="text-m text-gray-500">
                            구매처: {post.purchaseLink || '미기재'}
                          </p>
                          <div className="flex justify-end mt-16">
                            <span className="text-xl font-bold text-pink-600">자세히 보기 →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">아직 작성한 글이 없습니다 📝</p>
                  <Link
                    href="/community"
                    className="inline-block px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    첫 글 작성하러 가기
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                설정 <span className="ml-2">⚙️</span>
              </h2>
              <div className="flex items-center justify-between p-8 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold">계정 삭제</h3>
                  <p className="text-l text-gray-600">
                    회원 탈퇴 및 데이터 삭제
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
