import {
  HeartIcon as HeartOutline,
  ShareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

import {
  useDeletePhoto,
  useGetPhoto,
  useToggleLike,
  useTogglePhotoVisibility,
} from "../../hooks/useBoard";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "../Error/ErrorPage";
import { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import ImageEvalDetail from "../ImageEval/ImageEvalDetail";
import Modal from "../../components/Modal";
import ContentNavBar from "../../components/NavBar/ContentNavBar";
import { useAuthStore } from "../../store";
import { useMutation } from "@tanstack/react-query";
import { boardApi } from "../../api/boardApi";

function PhotoPost() {
  const { number } = useParams();
  const photoId = number ? parseInt(number) : -1;
  const { isError, isLoading, data } = useGetPhoto(photoId);
  const navigate = useNavigate();
  const [isOpenShareModal, setIsOpenShareModal] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showPhotoEvalModal, setPhotoEvalModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const deletePhotoMutation = useDeletePhoto(photoId);
  const toggleVisibilityMutation = useTogglePhotoVisibility(photoId);
  const myId = useAuthStore((state) => state.userId);
  const likeToggleMutation = useToggleLike();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <FadeLoader color="#a4e857" height={12} radius={8} />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorPage />;
  }

  const closeShareModal = () => {
    setIsOpenShareModal(false);
  };
  const openShareModal = () => {
    setIsOpenShareModal(true);
  };
  const closePhotoEval = () => {
    setPhotoEvalModal(false);
  };
  const openPhotoEval = () => {
    setPhotoEvalModal(true);
  };
  const closeOptionModal = () => {
    setShowOptionModal(false);
  };

  const openOptionModal = () => {
    setShowOptionModal(true);
  };

  const handleCopy = async (location: string) => {
    try {
      await navigator.clipboard.writeText(location);

      setShowCopyMessage(true);

      setTimeout(() => {
        setShowCopyMessage(false);
      }, 2000);
    } catch (error) {
      console.error("복사 실패", error);
    }
  };
  const handleDeletePhoto = () => {
    deletePhotoMutation.mutate();
    closeOptionModal();
    navigate(-1);
  };

  const handleToggleVisibility = () => {
    toggleVisibilityMutation.mutate();
    closeOptionModal();
  };

  const navigateProfile = (id: number) => {
    navigate(`/user/profile/${id}`);
  };
  const navigateMyProfile = () => {
    navigate("/mypage");
  };
  const handleToggleLike = () => {
    likeToggleMutation.mutate(photoId);
  };

  const {
    isLike,
    analysisChart,
    analysisText,
    hashTag,
    imageUrl,
    likeCnt,
    nickName,
    profileImage,
    score,
    userId,
  } = data;
  const nowPhotoLocation = window.location.href;
  const isMyPhoto = userId === myId;

  return (
    <div className="w-full flex flex-col ">
      {isOpenShareModal && (
        <div
          className=" bottom-0 top-0 fixed  max-w-md w-full bg-black/40 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeShareModal();
          }}
        >
          <div className="rounded-xl w-70 h-35 bg-white flex flex-col justify-center items-center ">
            <div className="text-xl font-bold mb-4">공유하기</div>
            <div className="flex justify-center items-center">
              <input
                type="text"
                readOnly
                className="w-[60%] rounded-l-lg h-10 px-2 border-gray-300 border focus:outline-none"
                value={nowPhotoLocation}
              />
              <button
                onClick={() => handleCopy(nowPhotoLocation)}
                className="w-[30%] h-10 text-sm border-gray-300 border border-l-0 bg-pic-primary text-white rounded-r-lg"
              >
                URL 복사
              </button>
            </div>
            {showCopyMessage && (
              <div className="text-gray-800 text-sm">복사되었습니다</div>
            )}
          </div>
        </div>
      )}
      {showPhotoEvalModal && (
        <ImageEvalDetail
          isModalOpen={showPhotoEvalModal}
          closeDetail={closePhotoEval}
          score={score}
          analysisScore={analysisChart}
          analysisFeedback={analysisText}
        />
      )}
      <Modal
        isOpen={showOptionModal}
        onClose={closeOptionModal}
        buttons={[
          {
            label: "공개 / 비공개",
            textColor: "black",
            onClick: handleToggleVisibility,
          },
          {
            label: "삭제하기",
            textColor: "red",
            onClick: handleDeletePhoto,
          },
        ]}
      />

      <ContentNavBar content={nickName} />
      <div className=" h-16 w-full flex items-center">
        <div className="w-8/10 pl-2 flex items-center ">
          <img
            className="w-11 h-11  rounded-full cursor-pointer "
            src={profileImage}
            alt=""
            onClick={() => {
              isMyPhoto ? navigateMyProfile() : navigateProfile(userId);
            }}
          />
          <div
            className="ml-3 cursor-pointer font-semibold "
            onClick={() => {
              isMyPhoto ? navigateMyProfile() : navigateProfile(userId);
            }}
          >
            {nickName}
          </div>
        </div>
        {isMyPhoto && (
          <div
            className="w-2/10 flex justify-center "
            onClick={openOptionModal}
          >
            <EllipsisHorizontalIcon className="cursor-pointer" width={30} />
          </div>
        )}
      </div>
      <div className="max-h-[894px]">
        <img
          className="w-full h-auto border-b-1 border-gray-300"
          src={imageUrl}
          alt=""
        />
      </div>
      <div className=" h-50 mx-3 my-1.5 ">
        <div className="flex items-center justify-between">
          <div className="flex">
            {isLike ? (
              <HeartSolid
                className="w-7 cursor-pointer"
                onClick={handleToggleLike}
              />
            ) : (
              <HeartOutline
                className="w-7 cursor-pointer"
                onClick={handleToggleLike}
              />
            )}
            <ShareIcon
              className="w-6 m-2 cursor-pointer"
              onClick={openShareModal}
            />
          </div>

          <div className="mr-1 cursor-pointer" onClick={openPhotoEval}>
            <span className="text-pic-primary">PIC</span>
            <span>SCORE</span>
            <span className="ml-0.5"> {score}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="inline-block mb-1 font-semibold text-sm">
            좋아요 {likeCnt}
            <span className="px-0.5">개</span>
          </div>
          <div>
            {hashTag.map((tag, index) => {
              return (
                <span
                  className="bg-pic-primary py-0.5 px-2  text-sm rounded-xl border text-white"
                  key={index}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        </div>
        <div
          onClick={openPhotoEval}
          className="cursor-pointer inline-block text-gray-500"
        >
          ... 자세히 보기
        </div>
      </div>
    </div>
  );
}

export default PhotoPost;
