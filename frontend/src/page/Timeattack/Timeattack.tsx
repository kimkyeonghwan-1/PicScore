// page/Timeattack/Timeattack.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeAttackStore } from "../../store/timeAttackStore";
import imageCompression from "browser-image-compression";

// 컴포넌트 임포트
import Container from "./components/Container";
import ExplanationStep from "./components/ExplanationStep";
import PreparationStep from "./components/PreparationStep";
import PhotoUploadStep from "./components/PhotoUploadStep";
import Modal from "../../components/Modal";
import { timeAttackApi } from "../../api/timeAttackApi";

// 타임어택 주제 목록 (실제 환경에서는 서버에서 가져올 수 있음)
const INDOOR_TOPICS = [
  "book",
  "cup",
  "chair",
  "clock",
  "computer",
  "food",
  "table",
  "shoes",
  "mouse",
  "door",
  "window",
  "extinguisher",
  "clothes",
  "bag",
  "phone",
  "keyboard",
  "Screen",
];

const OUTDOOR_TOPICS = [
  "dog",
  "cat",
  "flower",
  "car",
  "tree",
  "mountain",
  "sky",
  "building",
  "pavement",
  "plant",
];

// 주제 영어-한글 매핑
const TOPIC_TRANSLATIONS: Record<string, string> = {
  dog: "강아지",
  cat: "고양이",
  flower: "꽃",
  car: "자동차",
  tree: "나무",
  food: "음식",
  mountain: "산",
  sky: "하늘",
  book: "책",
  cup: "컵",
  chair: "의자",
  clock: "시계",
  computer: "컴퓨터",
  plant: "식물",
  table: "테이블",
  building: "건물",
  shoes: "신발",
  pavement: "포장도로",
  mouse: "마우스",
  door: "문",
  window: "창문",
  extinguisher: "소화기",
  clothes: "옷",
  bag: "가방",
  phone: "전화기",
  keyboard: "키보드",
  Screen: "스크린",
};

const translateTopic = (englishTopic: string): string => {
  return TOPIC_TRANSLATIONS[englishTopic] || englishTopic; // 매핑이 없으면 원래 값 반환
};

/**
 * browser-image-compression 라이브러리를 사용하여 이미지 압축
 * @param file 압축할 이미지 파일
 * @param maxSizeMB 최대 파일 크기 (MB)
 * @returns 압축된 파일
 */
const compressImage = async (
  file: File,
  maxSizeMB: number = 0.8
): Promise<File> => {
  try {
    // 압축 옵션 설정
    const options = {
      maxSizeMB: maxSizeMB, // 최대 파일 크기 (MB)
      maxWidthOrHeight: 1200, // 최대 너비/높이 (픽셀)
      useWebWorker: true, // WebWorker 사용 (성능 향상)
      initialQuality: 0.7, // 초기 품질
      alwaysKeepResolution: false, // 해상도 유지 여부
    };

    console.log(
      `압축 시작: 원본 크기 ${(file.size / 1024 / 1024).toFixed(2)}MB`
    );

    // 이미지 압축 실행
    const compressedFile = await imageCompression(file, options);

    console.log(
      `압축 완료: ${(compressedFile.size / 1024 / 1024).toFixed(
        2
      )}MB (${Math.round((compressedFile.size / file.size) * 100)}% 크기)`
    );

    return compressedFile;
  } catch (error) {
    console.error("이미지 압축 실패:", error);
    throw new Error("이미지 압축에 실패했습니다.");
  }
};

const TimeAttack: React.FC = () => {
  // Zustand store 사용
  const setGameState = useTimeAttackStore((state) => state.setGameState);
  const setResult = useTimeAttackStore((state) => state.setResult);

  // Local state 관리
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1); // 1: Explanation, 2: Preparation, 3: Photo Upload
  const [timeLeft, setTimeLeft] = useState<number>(20); // Countdown timer for photo capture
  const [captureTimeLeft, setCaptureTimeLeft] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(3); // Countdown for preparation
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [challengeTopic, setChallengeTopic] = useState<string>(""); // 실제 주제
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Handle timer countdown
  useEffect(() => {
    let timer: number | undefined;
    if (isTimerActive && timeLeft > 0) {
      timer = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        // Zustand에도 현재 시간 업데이트
        setGameState({ timeLeft: timeLeft - 1 });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [timeLeft, isTimerActive, setGameState]);

  // TimeAttack 게임 시작 시 Zustand 상태 업데이트
  useEffect(() => {
    setGameState({
      currentStep: step,
      timeLeft,
      isTimerActive,
      challengeTopic,
    });
  }, [step, timeLeft, isTimerActive, challengeTopic, setGameState]);

  const handleStartGame = (): void => {
    // 실내/실외 선택 모달 표시
    setShowLocationModal(true);
  };

  const startGameWithLocation = (isIndoor: boolean): void => {
    // 선택에 따라 주제 목록 선택
    const topicList = isIndoor ? INDOOR_TOPICS : OUTDOOR_TOPICS;

    // 랜덤 주제 선택
    const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];
    setChallengeTopic(randomTopic);

    // 모달 닫기
    setShowLocationModal(false);

    // 게임 시작
    setStep(2);
    setCountdown(3);

    // Start countdown from 3 to 1
    const countdownInterval = window.setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          // Move to step 3 (photo upload) and start the photo timer
          setTimeout(() => {
            setStep(3);
            setIsTimerActive(true);
            // Zustand 상태 업데이트
            setGameState({
              currentStep: 3,
              isTimerActive: true,
              challengeTopic: randomTopic,
            });
          }, 1000);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const handleTimeUp = (): void => {
    setIsTimerActive(false);
    setGameState({ isTimerActive: false });

    // Navigate to results page with a failure message
    navigate("/time-attack/result", {
      state: {
        result: {
          success: false,
          message: "시간 초과! 다시 도전해보세요.",
          topic: challengeTopic,
        },
      },
    });
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // 모바일 환경인지 확인
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // 모바일이 아닌 경우 경고 메시지 표시하고 함수 종료
      if (!isMobile) {
        alert(
          "타임어택 모드에서는 모바일 기기의 카메라로만 사진 촬영이 가능합니다."
        );
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedImageFile(file);
      // 사진 선택 시점의 남은 시간 기록
      setCaptureTimeLeft(timeLeft);
      // Zustand에 선택된 이미지 파일 저장
      setGameState({ selectedImageFile: file });
    }
  };

  async function handleImageSubmit(): Promise<void> {
    if (!selectedImageFile) return;

    setIsLoading(true);

    try {
      // 1. 이미지 파일 압축
      const compressedFile = await compressImage(selectedImageFile, 0.5); // 500KB로 압축

      // 2. 압축된 이미지 파일 업로드 (임시 저장)
      const uploadResponse = await timeAttackApi.uploadPhoto(compressedFile);
      const imageData = uploadResponse.data.data;
      console.log("이미지 업로드 성공:", imageData);

      // 3. 이미지 분석 - timeLeft 값을 함께 전달
      const analysisResponse = await timeAttackApi.analyzePhoto(
        compressedFile,
        challengeTopic,
        timeLeft
      );
      const analysisData = analysisResponse.data.data;
      console.log("분석 결과:", analysisData);

      // 연관도 및 점수 설정 (API 응답에서 받아옴)
      const topicAccuracy = Math.round(analysisData.confidence * 100);
      const score = Math.round(analysisData.score * 100); // API에서 반환된 점수를 직접 사용

      // 분석 결과 Zustand에 저장
      setResult({
        score,
        topicAccuracy,
        analysisData: {
          composition: 85,
          lighting: 80,
          subject: topicAccuracy,
          color: 75,
          creativity: 70,
        },
        image: imageData.imageUrl,
        topic: challengeTopic,
        ranking: 10, // 임시 값
        feedback: [
          `주제 "${translateTopic(
            challengeTopic
          )}"에 대한 연관성: ${topicAccuracy}%`,
          analysisData.name === "일치 항목 없음"
            ? "주제와 연관된 요소를 찾지 못했습니다."
            : `이미지에서 "${analysisData.name}" 항목이 식별되었습니다.`,
        ],
      });

      // 결과 페이지로 이동
      navigate("/time-attack/result", {
        state: {
          result: {
            success: true,
            score,
            topicAccuracy,
            analysisData: {
              composition: 85,
              lighting: 80,
              subject: topicAccuracy,
              color: 75,
              creativity: 70,
            },
            image: imageData.imageUrl,
            topic: challengeTopic,
            translatedTopic: translateTopic(challengeTopic),
            imageName: imageData.imageName, // 결과 페이지에서 저장 시 필요
            ranking: 10,
            xpEarned: Math.floor(score * 1.2), // XP 계산 예시
          },
        },
      });
    } catch (error) {
      console.error("사진 처리 오류:", error);
      // 오류 발생 시 실패 결과 페이지로 이동
      navigate("/time-attack/result", {
        state: {
          result: {
            success: false,
            message: "사진 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
            topic: challengeTopic,
            translatedTopic: translateTopic(challengeTopic),
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Render different steps of the Time Attack feature
  const renderStep = (): React.ReactNode => {
    switch (step) {
      case 1: // Explanation
        return <ExplanationStep onStartGame={handleStartGame} />;

      case 2: // Preparation/Countdown
        return <PreparationStep countdown={countdown} />;

      case 3: // Photo Upload
        return (
          <PhotoUploadStep
            timeLeft={timeLeft}
            challengeTopic={challengeTopic}
            translatedTopic={translateTopic(challengeTopic)}
            selectedImage={selectedImage}
            onImageUpload={handleImageUpload}
            onImageSubmit={handleImageSubmit}
            isLoading={isLoading}
          />
        );

      default:
        return <div>에러가 발생했습니다.</div>;
    }
  };

  return (
    <Container>
      <main className="flex-1 flex flex-col">{renderStep()}</main>

      {/* 실내/실외 선택 모달 */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="위치 선택"
        description={
          <div className="text-gray-600">
            <p className="mb-3">현재 촬영 가능한 환경을 선택해주세요.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startGameWithLocation(true)}
                className="bg-white border border-pic-primary text-pic-primary hover:bg-pic-primary hover:text-white py-3 px-2 rounded-lg flex flex-col items-center transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="font-medium">실내</span>
              </button>

              <button
                onClick={() => startGameWithLocation(false)}
                className="bg-white border border-pic-primary text-pic-primary hover:bg-pic-primary hover:text-white py-3 px-2 rounded-lg flex flex-col items-center transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 22v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="10" r="5"></circle>
                  <line x1="17" y1="8" x2="22" y2="8"></line>
                  <line x1="17" y1="12" x2="22" y2="12"></line>
                  <line x1="19" y1="5" x2="19" y2="15"></line>
                </svg>
                <span className="font-medium">실외</span>
              </button>
            </div>
          </div>
        }
        buttons={[
          {
            label: "취소",
            textColor: "gray",
            onClick: () => setShowLocationModal(false),
          },
        ]}
      />
    </Container>
  );
};

export default TimeAttack;
