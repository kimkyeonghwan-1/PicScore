import {
  XMarkIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterIcon,
  PhotoIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import Chart from "./components/Chart";
import { ImageEvalDetailProps, scoreDetailItem } from "../../types/evalTypes";

function ImageEvalDetail({
  isModalOpen,
  closeDetail,
  score,
  version,
  analysisScore,
  analysisFeedback,
}: ImageEvalDetailProps) {
  let scoreDetails: scoreDetailItem[] = [];
  if (version === 1) {
    scoreDetails = [
      {
        icon: <ChatBubbleBottomCenterIcon className="text-pic-primary w-7" />,
        name: "구도",
        feedback: analysisFeedback.구도,
        score: analysisScore.구도,
      },
      {
        icon: <ChatBubbleLeftRightIcon className="text-pic-primary w-7" />,
        name: "노이즈",
        feedback: analysisFeedback.노이즈,
        score: analysisScore.노이즈,
      },
      {
        icon: <SunIcon className="text-pic-primary w-7" />,
        name: "노출",
        feedback: analysisFeedback.노출,
        score: analysisScore.노출,
      },
      {
        icon: <ClockIcon className="text-pic-primary w-7" />,
        name: "다이나믹 레인지",
        feedback: analysisFeedback["다이나믹 레인지"],
        score: analysisScore["다이나믹 레인지"],
      },
      {
        icon: <PhotoIcon className="text-pic-primary w-7" />,
        name: "선명도",
        feedback: analysisFeedback.선명도,
        score: analysisScore.선명도,
      },
      {
        icon: <PhotoIcon className="text-pic-primary w-7" />,
        name: "화이트밸런스",
        feedback: analysisFeedback.화이트밸런스,
        score: analysisScore.화이트밸런스,
      },
    ];
  } else if (version === 2) {
    scoreDetails = [
      {
        icon: <ChatBubbleBottomCenterIcon className="text-pic-primary w-7" />,
        name: "구도",
        feedback: analysisFeedback.구도,
        score: analysisScore.구도,
      },
      {
        icon: <ChatBubbleLeftRightIcon className="text-pic-primary w-7" />,
        name: "주제",
        feedback: analysisFeedback.주제,
        score: analysisScore.주제,
      },
      {
        icon: <SunIcon className="text-pic-primary w-7" />,
        name: "노출",
        feedback: analysisFeedback.노출,
        score: analysisScore.노출,
      },
      {
        icon: <ClockIcon className="text-pic-primary w-7" />,
        name: "미적감각",
        feedback: analysisFeedback["미적감각"],
        score: analysisScore["미적감각"],
      },
      {
        icon: <PhotoIcon className="text-pic-primary w-7" />,
        name: "선명도",
        feedback: analysisFeedback.선명도,
        score: analysisScore.선명도,
      },
      {
        icon: <PhotoIcon className="text-pic-primary w-7" />,
        name: "색감",
        feedback: analysisFeedback.색감,
        score: analysisScore.색감,
      },
    ];
  }

  return (
    <>
      {isModalOpen && (
        <div
          className="fixed top-0 bottom-0 max-w-md w-full bg-black/40 z-50 flex flex-col justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div className="bg-gray-100 mx-3 my-10 rounded flex flex-col max-h-[90vh]">
            {/* 헤더 */}
            <header className="bg-gray-100 flex justify-between items-center p-4 border-b border-gray-200 rounded">
              <div className="text-lg font-semibold">
                <span className="text-pic-primary">PIC</span>
                <span>SCORE</span>
              </div>
              <button
                onClick={closeDetail}
                className="hover:bg-gray-200 rounded-full p-1"
              >
                <XMarkIcon className="text-gray-700" width={30} />
              </button>
            </header>

            <div className="overflow-y-auto">
              {/* 총점 */}
              <div className="bg-pic-primary text-white py-4 pl-6">
                <div>TOTAL SCORE</div>
                <div>
                  <span className="text-6xl font-bold pr-1">{score}</span>
                  <span>/ 100</span>
                </div>
              </div>

              {/* 차트 */}
              <div className="bg-white rounded m-3 p-7">
                <div className="font-bold mb-2 text-xl">요소 분석</div>
                <Chart analysisScore={analysisScore} />
              </div>

              {/* 점수 상세 */}
              <div className="bg-white rounded m-3 p-7">
                <div className="font-bold mb-2 text-xl">점수 상세</div>
                <div className="border-y-2 border-gray-200">
                  {scoreDetails.map((detail, index) => (
                    <div key={index} className="flex items-center py-4">
                      <div className="mx-4">{detail.icon}</div>
                      <div className="flex-grow mr-2">
                        <div className="font-bold text-gray-700">
                          {detail.name}
                        </div>
                        <div className="text-xs">{detail.feedback}</div>
                      </div>
                      <div className="text-pic-primary font-bold text-right min-w-[50px] mr-3">
                        {detail.score}점
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageEvalDetail;
