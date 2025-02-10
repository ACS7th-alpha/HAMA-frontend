'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentSpending, setCurrentSpending] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categories, setCategories] = useState([
    { name: '기저귀/물티슈', budget: 0 },
    { name: '생활/위생용품', budget: 0 },
    { name: '수유/이유용품', budget: 0 },
    { name: '스킨케어/화장품', budget: 0 },
    { name: '식품', budget: 0 },
    { name: '완구용품', budget: 0 },
    { name: '침구류', budget: 0 },
    { name: '패션의류/잡화', budget: 0 },
    { name: '기타', budget: 0 },
  ]);

  // 임시로 사용중인 금액 데이터 (나중에 실제 데이터로 교체)
  const [categorySpending] = useState({
    '기저귀/물티슈': 0,
    '생활/위생용품': 0,
    '수유/이유용품': 0,
    '스킨케어/화장품': 0,
    식품: 0,
    완구용품: 0,
    침구류: 0,
    '패션의류/잡화': 0,
    기타: 0,
  });

  const calculatePercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return (spent / budget) * 100;
  };

  // 현재 예산 데이터 불러오기
  const fetchBudgetData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3005/budget', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 404) {
        console.warn('예산 데이터가 없습니다.'); // 404 오류 처리
        return; // 예산 데이터가 없으면 그냥 리턴
      }

      if (!response.ok) {
        throw new Error('예산 데이터를 불러오는 데 실패했습니다.');
      }

      const data = await response.json();
      console.log('받아온 예산 데이터:', data);

      // 카테고리 예산 업데이트
      const newCategories = [
        { name: '기저귀/물티슈', budget: data.diaperBudget || 0 },
        { name: '생활/위생용품', budget: data.sanitaryBudget || 0 },
        { name: '수유/이유용품', budget: data.feedingBudget || 0 },
        { name: '스킨케어/화장품', budget: data.skincareBudget || 0 },
        { name: '식품', budget: data.foodBudget || 0 },
        { name: '완구용품', budget: data.toysBudget || 0 },
        { name: '침구류', budget: data.beddingBudget || 0 },
        { name: '패션의류/잡화', budget: data.fashionBudget || 0 },
        { name: '기타', budget: data.otherBudget || 0 },
      ];
      setCategories(newCategories);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    // 사용자 정보와 당월 예산 설정
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setMonthlyBudget(user.monthlyBudget || 0);
      setCurrentSpending(5); // 임시 데이터
    }

    // 현재 예산 데이터 불러오기
    fetchBudgetData();
    setLoading(false);
  }, []); // 컴포넌트 마운트 시에만 실행

  if (loading) {
    return <div>Loading...</div>;
  }

  const remainingBudget = monthlyBudget - currentSpending;
  const spendingPercentage = (currentSpending / monthlyBudget) * 100;

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    fetchBudgetData(); // 월 변경 시 예산 데이터 다시 불러오기
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    fetchBudgetData(); // 월 변경 시 예산 데이터 다시 불러오기
  };

  const handleBudgetChange = (index, value) => {
    const newValue = value.replace(/[^0-9]/g, ''); // 숫자만 허용
    const numberValue = Number(newValue) || 0;

    // 다른 카테고리들의 현재 총 예산 계산
    const otherCategoriesTotal = categories.reduce((sum, cat, idx) => {
      return idx === index ? sum : sum + cat.budget;
    }, 0);

    // 새로운 값을 포함한 총액이 당월 예산을 초과하는지 확인
    if (otherCategoriesTotal + numberValue > monthlyBudget) {
      // 초과하는 경우, 입력 가능한 최대값으로 설정
      const maxPossible = monthlyBudget - otherCategoriesTotal;
      const newCategories = [...categories];
      newCategories[index].budget = maxPossible;
      setCategories(newCategories);

      // 선택적: 사용자에게 알림
      alert('카테고리별 예산의 총액이 당월 예산을 초과할 수 없습니다.');
    } else {
      // 초과하지 않는 경우, 입력값 적용
      const newCategories = [...categories];
      newCategories[index].budget = numberValue;
      setCategories(newCategories);
    }
  };

  // 카테고리 총 예산 계산
  const totalCategoryBudget = categories.reduce(
    (sum, category) => sum + category.budget,
    0
  );
  // 남은 배정 가능 예산
  const remainingTotalBudget = monthlyBudget - totalCategoryBudget;

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 카테고리별 예산 설정 (필요한 필드만)
      const budgetData = {
        diaperBudget:
          Number(
            categories.find((cat) => cat.name === '기저귀/물티슈')?.budget
          ) || 0,
        sanitaryBudget:
          Number(
            categories.find((cat) => cat.name === '생활/위생용품')?.budget
          ) || 0,
        feedingBudget:
          Number(
            categories.find((cat) => cat.name === '수유/이유용품')?.budget
          ) || 0,
        skincareBudget:
          Number(
            categories.find((cat) => cat.name === '스킨케어/화장품')?.budget
          ) || 0,
        foodBudget:
          Number(categories.find((cat) => cat.name === '식품')?.budget) || 0,
        toysBudget:
          Number(categories.find((cat) => cat.name === '완구용품')?.budget) ||
          0,
        beddingBudget:
          Number(categories.find((cat) => cat.name === '침구류')?.budget) || 0,
        fashionBudget:
          Number(
            categories.find((cat) => cat.name === '패션의류/잡화')?.budget
          ) || 0,
        otherBudget:
          Number(categories.find((cat) => cat.name === '기타')?.budget) || 0,
      };

      // 총 예산 계산 (프론트엔드 검증용)
      const totalBudget =
        budgetData.diaperBudget +
        budgetData.sanitaryBudget +
        budgetData.feedingBudget +
        budgetData.skincareBudget +
        budgetData.foodBudget +
        budgetData.toysBudget +
        budgetData.beddingBudget +
        budgetData.fashionBudget +
        budgetData.otherBudget;

      console.log('Monthly Budget:', monthlyBudget);
      console.log('Total Budget:', totalBudget);
      console.log('Budget Data to send:', budgetData);

      if (totalBudget > monthlyBudget) {
        alert(
          `카테고리별 예산의 총액(${totalBudget.toLocaleString()}원)이 월별 총 예산(${monthlyBudget.toLocaleString()}원)을 초과할 수 없습니다.`
        );
        return;
      }

      const response = await fetch('http://localhost:3005/budget', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'omit',
        mode: 'cors',
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData?.message || '예산 저장에 실패했습니다.');
      }

      const data = await response.json();
      console.log('Save response:', data);

      // 성공 시 카테고리 업데이트
      const newCategories = [
        { name: '기저귀/물티슈', budget: data.diaperBudget },
        { name: '생활/위생용품', budget: data.sanitaryBudget },
        { name: '수유/이유용품', budget: data.feedingBudget },
        { name: '스킨케어/화장품', budget: data.skincareBudget },
        { name: '식품', budget: data.foodBudget },
        { name: '완구용품', budget: data.toysBudget },
        { name: '침구류', budget: data.beddingBudget },
        { name: '패션의류/잡화', budget: data.fashionBudget },
        { name: '기타', budget: data.otherBudget },
      ];

      setCategories(newCategories);
      alert('예산이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Error details:', error);
      alert(`예산 저장 실패: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full relative">
          <div className="absolute top-8 right-0">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              저장
            </button>
          </div>

          <div className="flex justify-center items-center mb-8 mt-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="black"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <span className="text-xl font-semibold text-black">
                {currentDate.getFullYear()}년{' '}
                {String(currentDate.getMonth() + 1).padStart(2, '0')}월
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="black"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-4 mt-16">
            <div className="bg-white rounded-lg p-6 shadow-md w-40">
              <div className="text-gray-600 mb-1 text-center">당월 예산</div>
              <div className="font-bold text-black text-center">
                {monthlyBudget.toLocaleString()}원
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg p-6 shadow-md flex items-center">
              <div className="relative w-full">
                <div className="w-full bg-gray-100 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full ${
                      currentSpending > monthlyBudget
                        ? 'bg-red-200'
                        : 'bg-blue-200'
                    }`}
                    style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                  />
                </div>

                <div
                  className={`absolute top-0 left-4 h-8 flex items-center ${
                    currentSpending > monthlyBudget
                      ? 'text-red-600'
                      : 'text-black'
                  }`}
                >
                  {currentSpending.toLocaleString()}원
                </div>

                <div className="absolute top-0 right-4 h-8 flex items-center gap-2">
                  <span
                    className={
                      currentSpending > monthlyBudget
                        ? 'text-red-600'
                        : 'text-black'
                    }
                  >
                    {spendingPercentage.toFixed(0)}%
                  </span>
                  <span
                    className={
                      currentSpending > monthlyBudget
                        ? 'text-red-600'
                        : 'text-black'
                    }
                  >
                    +{remainingBudget.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {categories.map((category, index) => {
              const spent = categorySpending[category.name] || 0;
              const remaining = category.budget;
              const percentage = calculatePercentage(spent, category.budget);
              const isOverBudget = spent > category.budget;

              return (
                <div key={index} className="flex gap-4">
                  <div className="bg-white rounded-lg p-6 shadow-md w-40">
                    <div className="text-gray-600 mb-1 text-center">
                      {category.name}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={category.budget.toLocaleString()}
                        onChange={(e) =>
                          handleBudgetChange(
                            index,
                            e.target.value.replace(/,/g, '')
                          )
                        }
                        className="font-bold text-black w-full focus:outline-none text-center pr-6"
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-black">
                        원
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-lg p-6 shadow-md flex items-center">
                    <div className="relative w-full">
                      <div className="w-full bg-gray-100 rounded-full h-8">
                        <div
                          className={`h-8 rounded-full ${
                            isOverBudget ? 'bg-red-200' : 'bg-blue-200'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      <div
                        className={`absolute top-0 left-4 h-8 flex items-center ${
                          isOverBudget ? 'text-red-600' : 'text-black'
                        }`}
                      >
                        {spent.toLocaleString()}원
                      </div>

                      <div className="absolute top-0 right-4 h-8 flex items-center gap-2">
                        <span
                          className={
                            isOverBudget ? 'text-red-600' : 'text-black'
                          }
                        >
                          {percentage.toFixed(0)}%
                        </span>
                        <span
                          className={
                            isOverBudget ? 'text-red-600' : 'text-black'
                          }
                        >
                          +{remaining.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
