interface Point {
  x: number;
  y: number;
}

function calculateLinearRegression(points: Point[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  // Calculate means
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
    sumYY += point.y * point.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate slope and intercept
  const numerator = sumXY - sumX * meanY;
  const denominator = sumXX - sumX * meanX;
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  const rNumerator = n * sumXY - sumX * sumY;
  const rDenominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const r = rDenominator !== 0 ? rNumerator / rDenominator : 0;
  const r2 = r * r;

  return { slope, intercept, r2 };
}

function getLinePoints(
  regression: { slope: number; intercept: number },
  xRange: { min: number; max: number }
): Point[] {
  return [
    { x: xRange.min, y: regression.slope * xRange.min + regression.intercept },
    { x: xRange.max, y: regression.slope * xRange.max + regression.intercept },
  ];
}

export { calculateLinearRegression, getLinePoints, type Point };
