import React from "react";
import { StatsGridProps, StatsCardProps } from "../types";

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className={`font-bold text-xl ${color}`}>{value}</div>
    <div className="text-gray-500 text-sm">{title}</div>
  </div>
);

// Stats Grid Component
const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <div className="p-4 mt-2 bg-white rounded-lg mx-4 border border-gray-200 shadow-sm">
    <div className="grid grid-cols-2 gap-4">
      <StatsCard
        title="평균 점수"
        value={stats.averageScore.toFixed(1)}
        color="text-gray-800"
      />
      <StatsCard
        title="타임어택"
        value={`${stats.timeAttackRank}위`}
        color="text-green-500"
      />
      <div className="col-span-2">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-gray-500 text-center">
            <p className="font-bold mb-1">컨테스트 & 아레나</p>
            <p className="text-sm">추후 공개 예정</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StatsGrid;
