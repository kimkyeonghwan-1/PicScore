import {
  XMarkIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterIcon,
  PhotoIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import Chart from "./components/Chart";
import { ImageEvalDetailProps } from "../../types/evalTypes";

function ImageEvalDetail({
  isModalOpen,
  closeDetail,
  score,
  analysisScore,
  analysisFeedback,
}: ImageEvalDetailProps) {
  return (
    <>
      {isModalOpen && (
        <div
          className=" bottom-0 top-0 fixed  max-w-md w-full bg-black/40 z-50 flex flex-col justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div className="bg-gray-100 mx-3 my-10 rounded flex flex-col max-h-[90vh]">
            {/* header - 고정된 헤더 */}
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
              <div className="bg-pic-primary text-white py-4 pl-6">
                <div>TOTAL SCORE</div>
                <div>
                  <span className="text-6xl font-bold pr-1">{score}</span>
                  <span>/ 100</span>
                </div>
              </div>

              <div className=" bg-white rounded m-3 p-7 ">
                <div className="font-bold mb-2 text-xl">점수 상세</div>
                <div className="border-y-2  border-gray-200 ">
                  <div className="flex items-center my-2">
                    <ChatBubbleBottomCenterIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        구도{" "}
                        <span className="text-pic-primary">
                          {analysisScore.구도}점
                        </span>
                      </div>
                      <div className="text-sm">{analysisFeedback.구도}</div>
                    </div>
                  </div>

                  <div className="flex items-center my-2">
                    <ChatBubbleLeftRightIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        노이즈{" "}
                        <span className="text-pic-primary">
                          {analysisScore.노이즈}점
                        </span>
                      </div>
                      <div className="text-sm">{analysisFeedback.노이즈}</div>
                    </div>
                  </div>
                  <div className="flex items-center my-2">
                    <SunIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        노출{" "}
                        <span className="text-pic-primary">
                          {analysisScore.노출}점
                        </span>
                      </div>
                      <div className="text-sm">{analysisFeedback.노출}</div>
                    </div>
                  </div>
                  <div className="flex items-center my-2">
                    <ClockIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        다이나믹 레인지{" "}
                        <span className="text-pic-primary">
                          {analysisScore["다이나믹 레인지"]}점
                        </span>
                      </div>
                      <div className="text-sm">
                        {analysisFeedback["다이나믹 레인지"]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center my-2">
                    <PhotoIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        선명도{" "}
                        <span className="text-pic-primary">
                          {analysisScore.선명도}점
                        </span>
                      </div>
                      <div className="text-sm">{analysisFeedback.선명도}</div>
                    </div>
                  </div>
                  <div className="flex items-center my-2">
                    <PhotoIcon className="text-pic-primary w-7 my-2 mx-4" />
                    <div>
                      <div className="font-bold text-gray-700">
                        화이트밸런스{" "}
                        <span className="text-pic-primary">
                          {analysisScore.화이트밸런스}점
                        </span>
                      </div>
                      <div className="text-sm">
                        {analysisFeedback.화이트밸런스}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded m-3 p-7 ">
                <div className="font-bold mb-2 text-xl">요소 분석</div>
                <Chart analysisScore={analysisScore} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageEvalDetail;
