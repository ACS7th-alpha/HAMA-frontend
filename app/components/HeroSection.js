'use client';
import { useState, useEffect } from 'react';
import Firstpage from './Firstpage';
import UserDashboard from './UserDashboard';

export default function HeroSection() {
  console.log('=== HeroSection Component Render Start ===');

  const [userInfo, setUserInfo] = useState(null);
  const [childAge, setChildAge] = useState(null);

  useEffect(() => {
    console.log('=== useEffect Triggered ===');
    // 로컬 스토리지에서 사용자 정보 가져오기
    const userData = localStorage.getItem('user');
    console.log('Raw userData from localStorage:', userData);

    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('==== User Data Debug ====');
      console.log('Full userInfo object:', parsedUser);
      console.log('Profile image property:', {
        photo: parsedUser.photo,
        picture: parsedUser.picture,
        photoURL: parsedUser.photoURL,
        profileImage: parsedUser.profileImage,
      });
      setUserInfo(parsedUser);

      // 아기의 개월 수 계산
      if (parsedUser.children && parsedUser.children[0]) {
        console.log('Child Data:', parsedUser.children[0]);
        const birthDate = new Date(parsedUser.children[0].birthdate);
        const today = new Date();
        const monthDiff =
          (today.getFullYear() - birthDate.getFullYear()) * 12 +
          (today.getMonth() - birthDate.getMonth());
        console.log('Calculated Child Age:', monthDiff);
        setChildAge(monthDiff);
      } else {
        console.log('No child data found');
      }
    } else {
      console.log('No user data in localStorage');
    }
  }, []);

  console.log('Current State:', { userInfo, childAge });

  return (
    <>
      {userInfo ? (
        <UserDashboard userInfo={userInfo} childAge={childAge} />
      ) : (
        <Firstpage />
      )}
    </>
  );
}