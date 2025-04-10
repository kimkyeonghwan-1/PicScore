import { JSX } from "react";

export interface ImageEvalResponse {
  imageUrl: string;
  imageName: string;
  score: number;
  analysisChart: null;
  analysisText: null;
  isPublic: true;
  photoType: "article" | "timeattack" | "contest";
  hashTags: string[];
}

// 구도 -> 구도
// 선명도 -> 선명도
// 노이즈 -> 주제
// 노출 -> 노출
// 화이트 밸런스 -> 색감
// 다이나믹 레인지 -> 미적 감각

export interface AnalysisScoreType {
  구도: number;
  노이즈?: number;
  주제?: number;
  노출: number;
  "다이나믹 레인지"?: number;
  미적감각?: number;
  선명도: number;
  화이트밸런스?: number;
  색감?: number;
}

export interface AnalysisFeedbackType {
  구도: string;
  노이즈?: string;
  주제?: string;
  노출: string;
  "다이나믹 레인지"?: string;
  미적감각?: string;
  선명도: string;
  화이트밸런스?: string;
  색감?: string;
}

export interface ImageEvalDetailProps {
  isModalOpen: boolean;
  closeDetail: () => void;
  score: number;
  version: number;
  analysisScore: AnalysisScoreType;
  analysisFeedback: AnalysisFeedbackType;
}

export interface scoreDetailItem {
  icon: JSX.Element;
  name: string;
  feedback: string | undefined;
  score: number | undefined;
}
