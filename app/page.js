'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import Loading from './components/Loading';
import HeroSection from './components/HeroSection';
import ConsumptionAnalysis from './components/ConsumptionAnalysis';
import Footer from './components/Footer';
import ProductList from './product/page';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [childAge, setChildAge] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(0);

  useEffect(() => {
    setLoading(false);
    // URL에서 회원가입 완료 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const signupComplete = urlParams.get('signupComplete');
    const token = urlParams.get('token');

    if (signupComplete && token) {
      // 토큰 저장 및 자동 로그인 처리
      localStorage.setItem('access_token', token);
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, '/');
    }

    const fetchData = async () => {
      const userData = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      if (userData && accessToken) {
        const parsedUser = JSON.parse(userData);
        setUserInfo(parsedUser);

        // 아기의 개월 수 계산
        if (parsedUser.children && parsedUser.children[0]) {
          const birthDate = new Date(parsedUser.children[0].birthdate);
          const today = new Date();
          const monthDiff =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
          setChildAge(monthDiff);
        }

        // 지출 내역 조회 및 현재 월 지출액 계산
        try {
          const response = await fetch(
            `${process.env.BACKEND_BUDGET_URL}/budget/spending`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const spendingData = await response.json();

            // 현재 년월 구하기
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // 현재 월의 지출액만 필터링하여 합산
            let currentMonthTotal = 0;
            spendingData.spending.forEach((category) => {
              if (category.details && Array.isArray(category.details)) {
                category.details.forEach((detail) => {
                  const spendingDate = new Date(detail.date);
                  if (
                    spendingDate.getFullYear() === currentYear &&
                    spendingDate.getMonth() === currentMonth
                  ) {
                    currentMonthTotal += detail.amount;
                  }
                });
              }
            });

            setMonthlySpending(currentMonthTotal);
          } else {
            console.warn('지출 내역을 가져오는데 실패했습니다.');
            setMonthlySpending(0);
          }
        } catch (error) {
          console.error('Error fetching spending:', error);
          setMonthlySpending(0);
        }
      }
    };

    fetchData();
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('1. Google 로그인 응답:', credentialResponse);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('2. 디코드된 Google 정보:', decoded);

      const response = await fetch(
        `${process.env.BACKEND_AUTH_URL}/auth/google/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: decoded.sub,
          }),
        }
      );

      const data = await response.json();
      console.log('3. 백엔드 로그인 응답:', data);

      if (response.ok) {
        // 1. 토큰 및 사용자 정보 저장
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('spendingData');
        localStorage.removeItem('budget');
        // 2. 예산 데이터 가져오기
        try {
          const budgetResponse = await fetch(
            `${process.env.BACKEND_BUDGET_URL}/budget`,
            {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            }
          );

          if (budgetResponse.ok) {
            const budgetData = await budgetResponse.json();
            localStorage.setItem('budget', JSON.stringify(budgetData));
          }
        } catch (error) {
          console.error('예산 데이터 가져오기 실패:', error);
        }

        window.location.reload(); // 페이지 새로고침
      } else {
        const userData = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
        router.push(
          `/signup?userData=${encodeURIComponent(JSON.stringify(userData))}`
        );
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
    }
  };

  const handleGoToStatistics = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${process.env.BACKEND_BUDGET_URL}/budget/spending`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // 데이터를 로컬 스토리지에 저장
        localStorage.setItem('spendingData', JSON.stringify(data));
        // 통계 페이지로 이동
        router.push('/statistics');
      } else {
        console.error('Failed to fetch spending data');
      }
    } catch (error) {
      console.error('Error fetching spending data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLogin={handleGoogleSuccess} />
      <HeroSection
        userInfo={userInfo}
        childAge={childAge}
        monthlySpending={monthlySpending}
      />
      <ConsumptionAnalysis />
      <ProductList />
      <Footer />
    </div>
  );
}
