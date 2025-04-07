import { Share } from "lucide-react";
import processResult from "../../assets/ImageEval/process-result.svg";
import Button from "../../components/Button";
import testImage from "../../assets/ImageEval/test-image.jpg";
import {
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import ImageEvalDetail from "./ImageEvalDetail";
import { useAuthStore } from "../../store";
import Modal from "../../components/Modal";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageEvalResponse } from "../../types/evalTypes";
import { useUploadImage } from "../../hooks/useEvalImage";
import groupImage from "../../assets/Group 88.png"; // 이미지 import 추가

function ImageEvalResult() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { mutate, isPending } = useUploadImage();
  const location = useLocation();

  const evalData = location.state?.evalData;
  const imageUrl = location.state?.imageUrl;
  const { analysisChart, analysisText, score } = evalData;

  const openModal = () => {
    if (isLoggedIn) {
      setIsDetailOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const uploadOpenModal = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    }
  };

  const navigateLogin = () => {
    navigate("/login");
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  const handleImagePost = (evalData: ImageEvalResponse) => {
    if (!evalData) return;

    if (!isLoggedIn) {
      setIsModalOpen(true);
      return;
    }

    if (!isPending) {
      mutate(evalData, {
        onSuccess: () => {
          navigate("/board");
        },
      });
    }
  };
  return (
    <div className="flex flex-col w-full mb-16 items-center justify-center ">
      <Modal
        description={
          <div className="flex flex-col items-center">
            <img
              src={groupImage}
              alt="PICSCORE 기능"
              className="w-full max-w-[280px] mb-4" // 이미지 크기와 마진 조정
            />
            <p className="text-center">
              로그인 하시면 PICSCORE의 더 많은 서비스를 <br></br> 즐기실 수
              있습니다!
            </p>
          </div>
        }
        title="알림"
        isOpen={isModalOpen}
        onClose={closeModal}
        buttons={[
          {
            label: "로그인 하기",
            textColor: "green",
            onClick: navigateLogin,
          },
          {
            label: "취소",
            textColor: "gray",
            onClick: closeModal,
          },
        ]}
      />
      <ImageEvalDetail
        isModalOpen={isDetailOpen}
        closeDetail={closeDetail}
        score={score}
        analysisScore={analysisChart}
        analysisFeedback={analysisText}
      />

      <img src={processResult} alt="결과" className="mb-5  mt-2" />
      <div
        className="w-[80%]  shadow p-3 rounded flex flex-col items-center"
        style={{ boxShadow: "0px 0px 3px 0px rgba(0, 0, 0, 0.3)" }}
      >
        <img
          src={imageUrl}
          alt=""
          className="rounded h-full w-full aspect-square border mb-4"
          style={{ boxShadow: "0px 0px 3px 0px rgba(0, 0, 0, 0.3)" }}
        />
        <div className="font-logo text-pic-primary text-5xl mb-2">
          {score}점
        </div>

        {score < 30 ? (
          <div>PICSCORE가 필요해 보이네요...</div>
        ) : score >= 30 && score <= 70 ? (
          <div>잠재력이 보이는 사진이네요!</div>
        ) : (
          <div className="mb-1">저희팀에 영입 해도 될까요..?</div>
        )}
      </div>

      <div className="flex gap-10 mt-8 mb-5">
        <Button color="white" width={30} height={10} onClick={openModal}>
          <MagnifyingGlassIcon width={15} />
          <div className="ml-2">자세히</div>
        </Button>
        {isLoggedIn && (
          <Button
            color="green"
            width={30}
            height={10}
            onClick={() => {
              if (!isPending) {
                handleImagePost(evalData);
              }
            }}
          >
            <ArrowUpTrayIcon width={15} />
            <div className="ml-2">업로드</div>
          </Button>
        )}
      </div>
      {/* <button className="cursor-pointer flex justify-center items-center gap-1 w-30  border border-pic-primary rounded-2xl text-pic-primary mb-5">
        <ShareIcon width={15} />
        <div className="text-sm my-1">공유하기</div>
      </button> */}
    </div>
  );
}

export default ImageEvalResult;
