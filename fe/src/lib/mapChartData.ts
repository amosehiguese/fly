import { MonthlyIncome } from "@/api/interfaces/admin/monthlyIncome";

export const mapChartData = (backendData: MonthlyIncome[]) => {
  // Define all months with default amounts set to 0
  const defaultChartData = [
    { month: "January", amount: 0 },
    { month: "February", amount: 0 },
    { month: "March", amount: 0 },
    { month: "April", amount: 0 },
    { month: "May", amount: 0 },
    { month: "June", amount: 0 },
    { month: "July", amount: 0 },
    { month: "August", amount: 0 },
    { month: "September", amount: 0 },
    { month: "October", amount: 0 },
    { month: "November", amount: 0 },
    { month: "December", amount: 0 },
  ];

  // Create a map from the backend data for quick lookup and calculate total income
  let totalIncome = 0;
  const backendDataMap = backendData.reduce<Record<string, number>>(
    (acc, item) => {
      const [, month] = item.month.split("-"); // Assuming month is in "YYYY-MM" format
      const monthIndex = parseInt(month, 10) - 1; // Convert month to zero-based index
      const monthName: string = defaultChartData[monthIndex]?.month;
      if (monthName) {
        const amount = parseFloat(item.total_price_sek); // Convert to number
        acc[monthName] = amount;
        totalIncome += amount; // Accumulate total income
      }
      return acc;
    },
    {}
  );

  // Map through defaultChartData and override with backend data if available
  const chartData = defaultChartData.map((data, index) => {
    const currentAmount = backendDataMap[data.month] || data.amount;
    const previousAmount =
      index > 0 ? backendDataMap[defaultChartData[index - 1].month] || 0 : 0;

    // Calculate percentage increase
    const percentageIncrease =
      previousAmount > 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : 0;

    return {
      month: data.month,
      amount: currentAmount,
      percentageIncrease: parseFloat(percentageIncrease.toFixed(2)), // Round to 2 decimal places
    };
  });

  // Calculate the percentage increase for the current month (last month in the chartData)
  const currentMonthPercentageIncrease =
    chartData.length > 0
      ? chartData[chartData.length - 1].percentageIncrease
      : 0;

  return { chartData, totalIncome, currentMonthPercentageIncrease }; // Return chart data, total income, and current month percentage increase
};
