export default function UserDashboard({
  userInfo,
  childAge,
  monthlySpending,
  remainingBudget,
}) {
  // 프로그레스 바의 퍼센테이지 계산
  const spendingPercentage = userInfo.monthlyBudget
    ? Math.min((monthlySpending / userInfo.monthlyBudget) * 100, 100)
    : 0;

  const spendingPercentage2 = userInfo.monthlyBudget
    ? Math.floor((monthlySpending / userInfo.monthlyBudget) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-b from-pink-50 to-yellow-50 w-full">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex justify-between items-center">
            {/* 사용자 프로필 섹션 */}
            <div className="flex flex-col items-center">
              {userInfo.photo && (
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-pink-200 shadow-lg">
                  <img
                    src={userInfo.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800">
                {userInfo.nickname} <span className="ml-1"> </span>
              </h2>
              {childAge !== null && (
                <p className="text-lg mt-2 text-gray-600 bg-pink-100 px-4 py-1 rounded-full">
                  {childAge}개월
                </p>
              )}
            </div>

            {/* 예산 정보 섹션 */}
            <div className="flex-1 ml-12">
              <div className="bg-pink-10 rounded-2xl p-8 shadow-md border-2 border-blue-10">
                <div className="mb-4 text-left">
                  <p className="text-gray-800 flex items-center text-lg">
                    <span className="mr-2">💰</span> 이번 달 예산
                  </p>
                  <p className="text-3xl font-bold text-black mt-2">
                    {userInfo.monthlyBudget?.toLocaleString()}원
                  </p>
                </div>
                <div className="w-full h-5 bg-white rounded-full overflow-hidden mt-4 shadow-inner">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                    style={{ width: `${spendingPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-3 text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-1">💸</span> 사용:{' '}
                    {monthlySpending.toLocaleString()}원
                  </span>
                  <span className="flex items-center ml-4">
                    <span className="mr-1">✨</span> 사용:{' '}
                    {spendingPercentage2.toLocaleString()}%{' '}
                    <span className="text-gray-600 ml-2">
                      {remainingBudget.toLocaleString()}원
                    </span>
                  </span>
                </div>
              </div>

              {/* 새로운 귀여운 네모 칸 추가 */}
              <div className="bg-white rounded-2xl p-4 mt-6 shadow-md border-2 border-blue-10">
                <p className="text-xl font-semibold text-center">
                  <span role="img" aria-label="pig">
                    🐻
                  </span>{' '}
                  하루에{' '}
                  <span className="text-green-500 font-bold text-lg">
                    {(() => {
                      const remainingBudget =
                        userInfo.monthlyBudget - monthlySpending;
                      const remainingDays =
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth() + 1,
                          0
                        ).getDate() - new Date().getDate();
                      return remainingDays > 0
                        ? (remainingBudget / remainingDays).toLocaleString()
                        : 0;
                    })()}
                    원
                  </span>{' '}
                  이하로 써야 예산을 지킬 수 있어요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
