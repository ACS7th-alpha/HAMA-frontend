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
  const [childToEdit, setChildToEdit] = useState(null);
  const [newChild, setNewChild] = useState({
    name: '',
    birthdate: '',
    gender: 'male',
  }); // 새로운 자녀 정보 상태
  const [isAddingChild, setIsAddingChild] = useState(false); // 추가 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(userInfo?.nickname || '');
  const [newBudget, setNewBudget] = useState(userInfo?.monthlyBudget || 0);

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL}/reviews/${postId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL}/reviews/my-reviews`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error('내가 쓴 글을 불러오는 데 실패했습니다.');

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
      const accessToken = localStorage.getItem('access_token');

      // 예산 삭제 요청
      const budgetResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BUDGET_URL}/budget`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (budgetResponse.status === 404) {
        console.log('예산 데이터가 없습니다.'); // 예외 처리
      } else if (!budgetResponse.ok) {
        throw new Error('예산 삭제 실패');
      } else {
        console.log('예산 삭제 성공');
      }

      // 리뷰 삭제 요청
      const reviewsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_REVIEW_URL}/reviews`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (reviewsResponse.status === 404) {
        console.log('리뷰 데이터가 없습니다.'); // 예외 처리
      } else if (!reviewsResponse.ok) {
        throw new Error('리뷰 삭제 실패');
      } else {
        console.log('리뷰 전체 삭제 성공');
      }

      // 회원 탈퇴 요청
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_AUTH_URL}/auth/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('계정 삭제 실패');

      // 계정 삭제 성공 시 로컬 저장소 데이터 삭제 후 메인 페이지로 이동
      localStorage.clear(); // 모든 로컬 저장소 데이터 삭제
      alert('계정이 삭제되었습니다.');
      router.push('/'); // 로그인 전의 메인 페이지로 이동
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteChild = async (index) => {
    const childToDelete = userInfo.children[index];
    const confirmDelete = window.confirm(
      `${childToDelete.name}의 정보를 정말 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('로그인이 필요합니다.');

      console.log(`Deleting child: ${childToDelete.name}`); // 삭제할 아기 이름 로그
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_AUTH_URL}/auth/children/${childToDelete.name}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to delete child:', response.statusText); // 실패 로그
        throw new Error('아기 정보 삭제 실패');
      }

      // 삭제 성공 시, 상태에서 해당 아기 정보 제거
      const updatedChildren = userInfo.children.filter(
        (_, idx) => idx !== index
      );
      setUserInfo((prev) => {
        const updatedUserInfo = { ...prev, children: updatedChildren };
        localStorage.setItem('user', JSON.stringify(updatedUserInfo)); // 로컬 스토리지 업데이트
        return updatedUserInfo;
      });
      alert(`${childToDelete.name}의 정보가 삭제되었습니다.`);
      console.log(`${childToDelete.name}의 정보가 성공적으로 삭제되었습니다.`); // 성공 로그
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('아기 정보 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditChild = (index, field, value) => {
    setUserInfo((prev) => {
      const updatedChildren = prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      );
      const updatedUserInfo = { ...prev, children: updatedChildren };
      localStorage.setItem('user', JSON.stringify(updatedUserInfo));
      return updatedUserInfo;
    });
  };

  const handleEditClick = (index, originalName) => {
    setChildToEdit({ index, originalName });
  };

  const handleSaveChild = async (index) => {
    const child = userInfo.children[index];
    const originalName = childToEdit.originalName; // 수정 전의 이름
    const updatedName = child.name; // 수정된 이름
    const updatedGender = child.gender; // 수정된 성별
    const updatedBirthdate = child.birthdate; // 수정된 생년월일

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    const requestBody = {
      name: updatedName,
      gender: updatedGender,
      birthdate: updatedBirthdate,
    };
    console.log(
      'Sending request body:',
      JSON.stringify(requestBody),
      originalName
    ); // 요청 본문 로그

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_AUTH_URL
        }/auth/children/${encodeURIComponent(originalName)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error(
          `아기 정보 수정 실패: ${response.status} ${response.statusText}`
        );
      }

      // 수정 성공 시, 상태에서 해당 아기 정보 업데이트
      const updatedChildren = userInfo.children.map((child, idx) =>
        idx === index
          ? {
              ...child,
              name: updatedName,
              gender: updatedGender,
              birthdate: updatedBirthdate,
            }
          : child
      );

      setUserInfo((prev) => {
        const updatedUserInfo = { ...prev, children: updatedChildren };
        localStorage.setItem('user', JSON.stringify(updatedUserInfo));
        return updatedUserInfo;
      });

      alert('아기 정보가 성공적으로 수정되었습니다.');
      setChildToEdit(null); // 수정 모드 종료
    } catch (error) {
      console.error('Error updating child:', error);
      alert('아기 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleAddChild = () => {
    setIsAddingChild(true); // 추가 모드 활성화
  };

  const handleSaveNewChild = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    const requestBody = {
      name: newChild.name,
      gender: newChild.gender,
      birthdate: newChild.birthdate,
    };

    console.log('Sending request body:', JSON.stringify(requestBody)); // 요청 본문 로그

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_AUTH_URL}/auth/children`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error(
          `아기 정보 추가 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json(); // 서버에서 응답받은 데이터

      // 새로운 사용자 정보를 userInfo에 업데이트
      setUserInfo(data.user); // 응답에서 user 정보를 사용하여 상태 업데이트

      // 입력 필드 초기화
      setNewChild({ name: '', birthdate: '', gender: 'male' });
      setIsAddingChild(false); // 추가 모드 비활성화
      alert('아기 정보가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('Error adding child:', error);
      alert('아기 정보 추가 중 오류가 발생했습니다.');
    }
  };

  const handleCancelAddChild = () => {
    setNewChild({ name: '', birthdate: '', gender: 'male' }); // 입력 필드 초기화
    setIsAddingChild(false); // 추가 모드 비활성화
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewNickname(userInfo.nickname);
    setNewBudget(userInfo.monthlyBudget);
  };

  const handleSaveProfile = async () => {
    const accessToken = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_AUTH_URL}/auth/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            nickname: newNickname,
            monthlyBudget: newBudget,
          }),
        }
      );

      const data = await response.json();
      console.log('Response from server:', data); // 서버 응답 로그

      if (response.ok) {
        // 로컬 저장소에 사용자 정보 업데이트
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserInfo(data.user);
        setIsEditing(false);
      } else {
        console.error('Error updating user:', data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewNickname(userInfo.nickname);
    setNewBudget(userInfo.monthlyBudget);
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
      <div className="max-w-4xl mx-auto p-8">
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
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            프로필 정보
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'children'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            자녀 정보
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            내가 쓴 글
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-orange-400 text-white'
                : 'bg-white text-gray-600 hover:bg-blue-50'
            }`}
          >
            설정
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="mb-36 rounded-3xl shadow-lg p-12">
          {activeTab === 'profile' && (
            <div className="space-y-6 px-8 mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-12">
                프로필 정보 <span className="ml-2">📝</span>
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 mb-2">이메일</p>
                  <p className="text-lg font-semibold">{userInfo.email}</p>
                  <div className="mt-8">
                    <p className="text-gray-600 mb-2">당월 예산</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {Number(userInfo.monthlyBudget)?.toLocaleString(
                          'ko-KR'
                        )}
                        원
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">닉네임</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{userInfo.nickname}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-600 transition-colors h-10"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors h-10"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-600 transition-colors h-10"
                  >
                    수정
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === 'children' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold px-4 text-gray-800 mb-6 flex justify-between items-center">
                자녀 정보 👶
                <button
                  onClick={handleAddChild}
                  className="px-4 py-2 bg-orange-400 text-white text-base rounded-md hover:bg-orange-600 transition-colors"
                >
                  추가
                </button>
              </h2>
              {isAddingChild && ( // 추가 모드일 때 입력 필드 표시
                <div className="rounded-2xl p-6 border-2 border-gray-200 flex justify-between items-center mb-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-gray-600 mb-2">이름</p>
                      <input
                        type="text"
                        value={newChild.name}
                        onChange={(e) =>
                          setNewChild({ ...newChild, name: e.target.value })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2 w-36 h-12"
                        required
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">생년월일</p>
                      <input
                        type="date"
                        value={newChild.birthdate}
                        onChange={(e) =>
                          setNewChild({
                            ...newChild,
                            birthdate: e.target.value,
                          })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">성별</p>
                      <select
                        value={newChild.gender}
                        onChange={(e) =>
                          setNewChild({ ...newChild, gender: e.target.value })
                        }
                        className="text-lg font-semibold border border-gray-300 rounded-md p-2 h-12"
                        required
                      >
                        <option value="male">남자</option>
                        <option value="female">여자</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleSaveNewChild}
                      className="px-4 py-2 bg-orange-200 text-gray-600 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelAddChild}
                      className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              {userInfo.children && userInfo.children.length > 0 ? (
                userInfo.children.map((child, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-6 flex justify-between items-center"
                  >
                    <div className="grid grid-cols-3 gap-16">
                      {childToEdit?.index === index ? (
                        <>
                          <div>
                            <p className="text-gray-600 mb-2">이름</p>
                            <input
                              type="text"
                              value={child.name}
                              onChange={(e) =>
                                handleEditChild(index, 'name', e.target.value)
                              }
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2 w-36 h-12"
                              required
                            />
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">생년월일</p>
                            <input
                              type="date"
                              value={child.birthdate.split('T')[0]}
                              onChange={(e) =>
                                handleEditChild(
                                  index,
                                  'birthdate',
                                  e.target.value
                                )
                              }
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2"
                              required
                            />
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">성별</p>
                            <select
                              value={child.gender}
                              onChange={(e) =>
                                handleEditChild(index, 'gender', e.target.value)
                              }
                              className="text-lg font-semibold border border-gray-300 rounded-md p-2 h-12"
                              required
                            >
                              <option value="male">남자</option>
                              <option value="female">여자</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-gray-600 mb-2">이름</p>
                            <p className="text-lg font-semibold">
                              {child.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">생년월일</p>
                            <p className="text-lg font-semibold">
                              {new Date(child.birthdate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">성별</p>
                            <p className="text-lg font-semibold">
                              {child.gender === 'male' ? '남자' : '여자'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {childToEdit?.index === index ? (
                        <>
                          <button
                            onClick={() => handleSaveChild(index)}
                            className="px-4 py-2 bg-orange-200 text-gray-600 rounded-md hover:bg-orange-200 transition-colors flex items-center justify-center whitespace-nowrap"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setChildToEdit(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 transition-colors flex items-center justify-center whitespace-nowrap"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(index, child.name)}
                            className="px-4 py-2 bg-orange-200 text-black rounded-md hover:bg-orange-400 transition-colors"
                          >
                            수정
                          </button>
                          {userInfo.children.length > 1 && (
                            <button
                              onClick={() => handleDeleteChild(index)}
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </>
                      )}
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
                          {post.thumbnailUrls &&
                          post.thumbnailUrls.length > 0 ? (
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
                              {post.recommended ? '추천템' : '😢 비추천템'}
                            </span>
                          </div>
                        </div>

                        {/* 컨텐츠 섹션 */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {post.name}
                          </h3>
                          <p className="text-m text-gray-500 mb-2">
                            사용 연령: {post.ageGroup}
                          </p>
                          <p className="text-gray-600 text-m line-clamp-2 mb-4">
                            {post.description}
                          </p>
                          <p className="text-m text-gray-500">
                            구매처: {post.purchaseLink || '미기재'}
                          </p>
                          <div className="flex justify-end mt-16">
                            <span className="text-xl font-bold text-pink-600">
                              자세히 보기 →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    아직 작성한 글이 없습니다 📝
                  </p>
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
