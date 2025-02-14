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

  const [categorySpending, setCategorySpending] = useState({
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

  const [spendingDetails, setSpendingDetails] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  const calculatePercentage = (spent, budget) => {
    // 예산이 0이고 지출이 있는 경우 100% 표시
    if (budget === 0 && spent > 0) return 100;
    // 예산이 0이고 지출도 0인 경우 0% 표시
    if (budget === 0) return 0;
    // 일반적인 경우 퍼센트 계산
    return (spent / budget) * 100;
  };

  const fetchBudgetData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3005/budget', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 404 에러(데이터 없음) 처리
      if (response.status === 404) {
        console.log('No budget data found');
        // 기본 카테고리 구조로 초기화
        const defaultCategories = [
          { name: '기저귀/물티슈', budget: 0 },
          { name: '생활/위생용품', budget: 0 },
          { name: '수유/이유용품', budget: 0 },
          { name: '스킨케어/화장품', budget: 0 },
          { name: '식품', budget: 0 },
          { name: '완구용품', budget: 0 },
          { name: '침구류', budget: 0 },
          { name: '패션의류/잡화', budget: 0 },
          { name: '기타', budget: 0 },
        ];
        setCategories(defaultCategories);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const data = await response.json();

      // 선택된 월의 예산 데이터 찾기
      const selectedYear = parseInt(currentDate.getFullYear());
      const selectedMonth = parseInt(currentDate.getMonth() + 1);

      console.log('Selected Date:', selectedYear, selectedMonth);
      console.log('Available Budget Data:', data);

      const currentBudget = data.find((budget) => {
        const budgetYear = parseInt(budget.year);
        const budgetMonth = parseInt(budget.month);
        console.log(
          'Comparing:',
          budgetYear,
          budgetMonth,
          'with',
          selectedYear,
          selectedMonth
        );
        return budgetYear === selectedYear && budgetMonth === selectedMonth;
      });

      console.log('Found Budget:', currentBudget);

      // 기본 카테고리 구조 정의
      const defaultCategories = [
        { name: '기저귀/물티슈', budget: 0 },
        { name: '생활/위생용품', budget: 0 },
        { name: '수유/이유용품', budget: 0 },
        { name: '스킨케어/화장품', budget: 0 },
        { name: '식품', budget: 0 },
        { name: '완구용품', budget: 0 },
        { name: '침구류', budget: 0 },
        { name: '패션의류/잡화', budget: 0 },
        { name: '기타', budget: 0 },
      ];

      if (currentBudget && currentBudget.categories) {
        const { categories } = currentBudget;
        const newCategories = defaultCategories.map((category) => {
          const categoryMap = {
            '기저귀/물티슈': 'diaper',
            '생활/위생용품': 'sanitary',
            '수유/이유용품': 'feeding',
            '스킨케어/화장품': 'skincare',
            식품: 'food',
            완구용품: 'toys',
            침구류: 'bedding',
            '패션의류/잡화': 'fashion',
            기타: 'other',
          };
          const apiKey = categoryMap[category.name];
          return {
            ...category,
            budget: parseInt(categories[apiKey]) || 0,
          };
        });
        console.log('Setting categories:', newCategories);
        setCategories(newCategories);
      } else {
        console.log('Setting default categories');
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // 에러 발생 시에도 기본 카테고리로 초기화
      const defaultCategories = [
        { name: '기저귀/물티슈', budget: 0 },
        { name: '생활/위생용품', budget: 0 },
        { name: '수유/이유용품', budget: 0 },
        { name: '스킨케어/화장품', budget: 0 },
        { name: '식품', budget: 0 },
        { name: '완구용품', budget: 0 },
        { name: '침구류', budget: 0 },
        { name: '패션의류/잡화', budget: 0 },
        { name: '기타', budget: 0 },
      ];
      setCategories(defaultCategories);
    }
  };

  const fetchMonthlySpending = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3005/budget/spending', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // 현재 월의 총 지출액 계산
        let monthTotal = 0;
        const categorySums = {};

        data.spending.forEach((category) => {
          if (category.details && Array.isArray(category.details)) {
            category.details.forEach((detail) => {
              const spendingDate = new Date(detail.date);
              if (
                spendingDate.getFullYear() === year &&
                spendingDate.getMonth() === month
              ) {
                monthTotal += detail.amount;
                const categoryName = getCategoryName(category.category);
                categorySums[categoryName] =
                  (categorySums[categoryName] || 0) + detail.amount;
              }
            });
          }
        });

        setCurrentSpending(monthTotal);
        setCategorySpending(categorySums);
      }
    } catch (error) {
      console.error('Error fetching spending data:', error);
    }
  };

  const fetchSpendingData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3005/budget/spending', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spending data');
      }

      const data = await response.json();
      console.log('Fetched spending data:', data);

      const spendingMap = {};
      data.spending.forEach((item) => {
        spendingMap[item.category] = item.details;
      });

      setSpendingDetails(spendingMap);
      console.log('Spending details organized:', spendingMap);
    } catch (error) {
      console.error('Error fetching spending data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 사용자 정보와 당월 예산 설정
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setMonthlyBudget(user.monthlyBudget || 0);
    }

    // 현재 예산 데이터 불러오기
    fetchBudgetData();
    setLoading(false);
  }, []); // 컴포넌트 마운트 시에만 실행

  // 현재 월의 지출 데이터 계산
  useEffect(() => {
    fetchBudgetData();
    fetchMonthlySpending();
  }, [currentDate]); // currentDate가 변경될 때마다 실행

  useEffect(() => {
    fetchSpendingData();
  }, []);

  // 카테고리 이름 변환 함수
  const getCategoryName = (category) => {
    const categoryMap = {
      diaper: '기저귀/물티슈',
      sanitary: '생활/위생용품',
      feeding: '수유/이유용품',
      skincare: '스킨케어/화장품',
      food: '식품',
      toys: '완구용품',
      bedding: '침구류',
      fashion: '패션의류/잡화',
      other: '기타',
    };
    return categoryMap[category] || category;
  };

  // 카테고리 이름 변환 함수
  const getCategoryKey = (categoryName) => {
    const categoryMap = {
      '기저귀/물티슈': 'diaper',
      '생활/위생용품': 'sanitary',
      '수유/이유용품': 'feeding',
      '스킨케어/화장품': 'skincare',
      식품: 'food',
      완구용품: 'toys',
      침구류: 'bedding',
      '패션의류/잡화': 'fashion',
      기타: 'other',
    };
    return categoryMap[categoryName] || categoryName; // 기본적으로 원래 이름 반환
  };

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
    setSelectedCategory(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedCategory(null);
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

      // 카테고리별 예산을 새로운 형식으로 변환
      const categoryBudgets = {
        diaper: categories.find((c) => c.name === '기저귀/물티슈').budget,
        sanitary: categories.find((c) => c.name === '생활/위생용품').budget,
        feeding: categories.find((c) => c.name === '수유/이유용품').budget,
        skincare: categories.find((c) => c.name === '스킨케어/화장품').budget,
        food: categories.find((c) => c.name === '식품').budget,
        toys: categories.find((c) => c.name === '완구용품').budget,
        bedding: categories.find((c) => c.name === '침구류').budget,
        fashion: categories.find((c) => c.name === '패션의류/잡화').budget,
        other: categories.find((c) => c.name === '기타').budget,
      };

      const budgetData = {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        categories: categoryBudgets,
      };

      const response = await fetch('http://localhost:3005/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        throw new Error('예산 설정에 실패했습니다.');
      }

      alert('예산이 성공적으로 설정되었습니다.');
      fetchBudgetData(); // 업데이트된 예산 데이터 다시 불러오기
    } catch (error) {
      console.error('Error saving budget:', error);
      alert(error.message);
    }
  };

  const handleCategoryClick = (categoryName) => {
    console.log('Clicked category:', categoryName);
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  // 카테고리별 게이지 바 컴포넌트
  const CategoryBar = ({ category, budget, spending }) => {
    const percentage = calculatePercentage(spending, budget);
    // 예산이 0원이고 지출이 있는 경우 빨간색으로 표시
    const barColor =
      budget === 0 && spending > 0
        ? 'bg-red-500'
        : percentage > 100
        ? 'bg-red-500'
        : 'bg-blue-500';

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-black">{category}</span>
          <span className="text-black">
            {spending.toLocaleString()}원
            {budget > 0 ? ` / ${budget.toLocaleString()}원` : ''}
            {budget > 0 ? ` (${percentage.toFixed(1)}%)` : ''}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
            onClick={() => handleCategoryClick(category)}
          ></div>
        </div>
      </div>
    );
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
                      : 'text-blue-600'
                  }`}
                >
                  {currentSpending.toLocaleString()}원
                </div>

                <div className="absolute top-0 right-4 h-8 flex items-center gap-2">
                  <span
                    className={
                      currentSpending > monthlyBudget
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }
                  >
                    {spendingPercentage.toFixed(0)}%
                  </span>
                  <span
                    className={
                      currentSpending > monthlyBudget
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }
                  >
                    {remainingBudget.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {categories.map((category, index) => {
              const spent = categorySpending[category.name] || 0;
              const remaining = category.budget - spent;
              const percentage = calculatePercentage(spent, category.budget);
              const isOverBudget = spent > category.budget;

              return (
                <div key={index}>
                  <div className="flex gap-4">
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

                    <div
                      className="flex-1 bg-white rounded-lg p-6 shadow-md flex items-center cursor-pointer hover:bg-gray-50 transition-transform duration-300 transform hover:scale-105"
                      onClick={() => handleCategoryClick(category.name)}
                    >
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
                            spent > category.budget
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {spent.toLocaleString()}원
                        </div>
                        <div className="absolute top-0 right-4 h-8 flex items-center gap-2">
                          <span
                            className={
                              spent > category.budget
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }
                          >
                            {percentage.toFixed(0)}%
                          </span>
                          <span
                            className={
                              spent > category.budget
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }
                          >
                            {remaining.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCategory === category.name && (
                    <div
                      className={`mt-2 bg-white rounded-lg p-4 shadow-md flex-1 transition-transform duration-300 transform ${
                        selectedCategory ? 'translate-y-0' : '-translate-y-full'
                      } w-full`}
                    >
                      <h3 className="font-semibold mb-2">
                        {category.name} 지출 내역
                      </h3>
                      {console.log(
                        'Available spending details keys:',
                        Object.keys(spendingDetails)
                      )}
                      {spendingDetails[getCategoryKey(category.name)] ? (
                        <>
                          {console.log(
                            'Spending details for category:',
                            spendingDetails[getCategoryKey(category.name)]
                          )}
                          {spendingDetails[getCategoryKey(category.name)]
                            .length > 0 ? (
                            <ul className="space-y-2">
                              {spendingDetails[
                                getCategoryKey(category.name)
                              ].map((detail) => {
                                console.log('Spending detail:', detail);
                                return (
                                  <li
                                    key={detail._id}
                                    className="flex justify-between items-center"
                                  >
                                    <span>{detail.date}</span>
                                    <span>{detail.itemName}</span>
                                    <span>
                                      {detail.amount.toLocaleString()}원
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-gray-500">
                              지출 내역이 없습니다.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">지출 내역이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
