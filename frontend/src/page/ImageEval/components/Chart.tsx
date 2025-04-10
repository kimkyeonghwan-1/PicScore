import React from "react";
import { AnalysisScoreType } from "../../../types/evalTypes";

// 포인트 좌표에 대한 타입 정의
interface Point {
  x: number;
  y: number;
}

// 레이블 포인트에 대한 타입 정의
interface LabelPoint extends Point {
  angle: number;
}

function Chart({ analysisScore }: { analysisScore: AnalysisScoreType }) {
  // 차트의 설정값
  const data = analysisScore;
  const centerX: number = 150;
  const centerY: number = 150;
  const maxRadius: number = 100;

  // 점수에 따른 각 축의 좌표 계산
  const calculatePoint = (
    value: number,
    index: number,
    total: number
  ): Point => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // 차트 축 라벨의 좌표 계산
  const calculateLabelPoint = (index: number, total: number): LabelPoint => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = maxRadius + 20;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle * (180 / Math.PI),
    };
  };

  // 데이터에서 사용 가능한 키 확인 (각 대체 카테고리 중 어느 것이 있는지 확인)
  const getCategory = (options: string[]): string => {
    for (const option of options) {
      if (option in data) {
        return option;
      }
    }
    return options[0]; // 기본값 반환
  };

  // 카테고리 결정 (데이터에 있는 키를 기준으로)
  const categories: string[] = [
    "구도", // 항상 동일
    getCategory(["주제", "노이즈"]), // 주제 또는 노이즈
    "노출", // 항상 동일
    getCategory(["미적감각", "다이나믹 레인지"]), // 미적감각 또는 다이나믹 레인지
    "선명도", // 항상 동일
    getCategory(["색감", "화이트밸런스"]), // 색감 또는 화이트밸런스
  ];

  const total: number = categories.length;

  // 데이터 포인트 계산
  const points: Point[] = categories.map((category, i) => {
    const value = data[category as keyof AnalysisScoreType] ?? 0; // undefined인 경우 0으로 대체
    return calculatePoint(value, i, total);
  });

  // 레이블 포인트 계산
  const labelPoints: LabelPoint[] = categories.map((_, i) =>
    calculateLabelPoint(i, total)
  );

  // 다각형 경로 생성
  const polygonPoints: string = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  // 그리드 레벨 (배경 헥사곤들)
  const gridLevels: number[] = [20, 40, 60, 80, 100];

  return (
    <div className="flex justify-center items-center w-full h-full">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 배경 그리드 헥사곤들 */}
        {gridLevels.map((level, i) => {
          const gridPoints: Point[] = categories.map((_, idx) =>
            calculatePoint(level, idx, total)
          );
          const gridPolygon: string = gridPoints
            .map((point) => `${point.x},${point.y}`)
            .join(" ");

          return (
            <polygon
              key={`grid-${i}`}
              points={gridPolygon}
              fill="none"
              stroke="#ddd"
              strokeWidth="1"
            />
          );
        })}

        {/* 축 선 */}
        {categories.map((_, i) => {
          const point: Point = calculatePoint(100, i, total);
          return (
            <line
              key={`axis-${i}`}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="#ddd"
              strokeWidth="1"
            />
          );
        })}

        {/* 데이터 다각형 */}
        <polygon
          points={polygonPoints}
          fill="rgba(59, 130, 246, 0.5)"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* 데이터 포인트 */}
        {points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
          />
        ))}

        {/* 카테고리 레이블 */}
        {categories.map((category, i) => {
          const labelPoint: LabelPoint = labelPoints[i];

          // 카테고리별 위치 조정 (타이틀용)
          let titleAnchor: string = "middle";
          let titleDx: number = 0;
          let titleDy: number = 0;

          // 카테고리별 위치 조정 (점수용)
          let scoreDx: number = 0;
          let scoreDy: number = 0;
          let scoreAnchor: string = "middle";

          // 6개 항목에 맞게 위치 조정
          if (i === 0) {
            // 구도 (상단)
            titleAnchor = "middle";
            titleDx = 0;
            titleDy = -5;
            scoreAnchor = "middle";
            scoreDx = 0;
            scoreDy = 12;
          } else if (i === 1) {
            // 주제 또는 노이즈 (우상단)
            titleAnchor = "start";
            titleDx = 5;
            titleDy = 0;
            scoreAnchor = "start";
            scoreDx = 5;
            scoreDy = 15;
          } else if (i === 2) {
            // 노출 (우하단)
            titleAnchor = "start";
            titleDx = 8;
            titleDy = 0;
            scoreAnchor = "start";
            scoreDx = 5;
            scoreDy = 15;
          } else if (i === 3) {
            // 미적감각 또는 다이나믹 레인지 (하단)
            titleAnchor = "middle";
            titleDx = 0;
            titleDy = -3;
            scoreAnchor = "middle";
            scoreDx = 0;
            scoreDy = 10;
          } else if (i === 4) {
            // 선명도 (좌하단)
            titleAnchor = "end";
            titleDx = -5;
            titleDy = 0;
            scoreAnchor = "end";
            scoreDx = -5;
            scoreDy = 15;
          } else if (i === 5) {
            // 색감 또는 화이트밸런스 (좌상단)
            titleAnchor = "end";
            titleDx = 0;
            titleDy = 0;
            scoreAnchor = "end";
            scoreDx = -2;
            scoreDy = 15;
          }

          // 긴 텍스트의 경우 줄바꿈 처리
          let displayText = category;
          if (category === "다이나믹 레인지") {
            displayText = "다이나믹\n레인지";
          }

          const lines = displayText.split("\n");

          // 점수 값 가져오기
          const scoreValue = data[category as keyof AnalysisScoreType] ?? 0; // undefined인 경우 0으로 대체

          return (
            <g key={`label-${i}`}>
              {lines.map((line, lineIndex) => (
                <text
                  key={`title-${i}-${lineIndex}`}
                  x={labelPoint.x}
                  y={labelPoint.y + lineIndex * 12}
                  dx={titleDx}
                  dy={titleDy}
                  textAnchor={titleAnchor}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#4b5563"
                >
                  {line}
                </text>
              ))}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                dx={scoreDx}
                dy={scoreDy + (lines.length > 1 ? lines.length * 10 : 0)}
                textAnchor={scoreAnchor}
                fontSize="12"
                fontWeight="bold"
                fill="#4b5563"
              >
                ({scoreValue})
              </text>
            </g>
          );
        })}

        {/* 중앙 점 */}
        <circle cx={centerX} cy={centerY} r="2" fill="#6b7280" />
      </svg>
    </div>
  );
}

export default Chart;
