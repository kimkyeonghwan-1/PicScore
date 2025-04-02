import processEval from "../../assets/ImageEval/process-upload.svg";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { CameraIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardApi } from "../../api/boardApi";
import { evalApi } from "../../api/evalApi";
import {
  useEvalImage,
  usePostTempImage,
  useUploadImage,
} from "../../hooks/useEvalImage";
import Loading from "../../components/Loading";
import { ImageEvalResponse } from "../../types/evalTypes";

function ImageUpload() {
  const [modalState, setModalState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File>(); // 원본 파일 (서버 전송용)
  const [imagePreview, setImagePreview] = useState<string>(""); // 미리보기용 URL
  const [tempImage, setTempImage] = useState("");
  const [tempImageName, setTempImageName] = useState("");
  // const [imageEvalData, setImageEvalData] = useState<ImageEvalResponse>();
  const cameraRef = useRef<HTMLInputElement>(null);
  const tempImageMutation = usePostTempImage();
  const imageEval = useEvalImage(tempImage);
  const navigate = useNavigate();
  const modalOpen = () => {
    setModalState(true);
  };
  const modalClose = () => {
    if (modalState === true) {
      setModalState(false);
    }
  };

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const inputBtnClick = (event: React.MouseEvent) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraCapture = () => {
    if (cameraRef.current) {
      console.log("카메라 클릭");
      cameraRef.current.click();
    }
  };

  const getImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const imageFile = event.target.files[0];
    if (imageFile) {
      setImageFile(imageFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("FileReader onload 후 반환 값", e);
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
          setModalState(false);
        }
      };
      reader.readAsDataURL(imageFile); //base64로 전환
    }
  };

  // 분석 시작
  //이미지 임시저장 하고 -> 분석 하고 -> result page로 넘긴다음 그 데이터 써서 업로드
  // 1. 이미지 임시 저장
  const handleTempImagePost = () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      tempImageMutation.mutate(formData, {
        onSuccess: (data) => {
          console.log("이미지 임시저장 성공", data?.data.data);
          setTempImageName(data?.data.data.imageName);
          setTempImage(data?.data.data.imageUrl); //임시저장 성공후 set 하면 바로 분석 시작 분석 시작 후
        },
        onError: (error) => {
          console.log("이미지 임시저장 오류 ", error);
        },
      });
    }
  };

  // 2. 이미지 분석
  useEffect(() => {
    if (imageEval.data && imageFile) {
      const updatedEvalData = {
        ...imageEval.data,
        imageName: tempImageName,
        isPublic: true,
        photoType: "article",
        hashTag: imageEval.data.hashTag, // hashtag에서 hashTags로 키 이름 변경
      };

      console.log("이미지 분석 완료:", updatedEvalData);
      navigate("/image-result", {
        state: { evalData: updatedEvalData, imageUrl: tempImage },
      });
    }
  }, [imageEval.data]);

  // 3. 이미지 영구 저장 , response에 photo id 추가 요청

  return (
    <div
      className="flex flex-col w-full items-center justify-center"
      onClick={modalClose}
    >
      {imageEval.isLoading && <Loading />}
      {tempImageMutation.isPending && <Loading />}
      {/* 사진 촬영 / 업로드 모달창 */}
      {modalState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            onClick={handleModalClick}
            style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)" }}
            className="bg-gray-50 mt-10 flex justify-around text-xl rounded-2xl px-8 py-5 w-80 "
          >
            <div
              className="flex flex-col justify-center items-center"
              onClick={handleCameraCapture}
            >
              <CameraIcon className="text-pic-primary w-16" />
              <input
                type="file"
                hidden
                ref={cameraRef}
                onChange={getImageFile}
                accept="image/*"
                capture="environment"
              />
              <div className="text-[#3c3c3c] text-sm">사진 촬영</div>
            </div>
            <div className="border-l border-gray-300"></div>
            <div
              className="flex flex-col justify-center items-center"
              onClick={inputBtnClick}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={getImageFile}
                className="h-full w-full"
              />
              <ArrowUpTrayIcon className="text-pic-primary w-16" />
              <div className="text-[#3c3c3c] text-sm">사진 업로드</div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-13">
        <img src={processEval} alt="" />
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold mb-1">사진을 올려주세요!</div>
        <div className="mb-5">직접 사진을 찍고 점수 확인해 보세요!</div>
      </div>
      <div
        className="w-[85%] max-w-xs sm:max-w-sm md:max-w-md aspect-square rounded-md border border-black flex flex-col items-center justify-center gap-6 sm:gap-10 mb-8 sm:mb-12"
        style={{ borderStyle: "dashed", borderSpacing: "40px" }}
        onClick={modalOpen}
      >
        {/* 이미지 미리보기 화면 */}
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="업로드 이미지"
            className="h-full w-full rounded-md"
          />
        ) : (
          <>
            <div className="bg-white w-20 h-20 rounded-full flex justify-center ">
              <ArrowUpTrayIcon className="text-pic-primary w-10 " />
            </div>
            <div className="text-lg font-bold text-[#000000b9]">
              사진을 촬영 또는 업로드 해주세요
            </div>
          </>
        )}
      </div>
      <Button
        color={imageFile ? "green" : "gray"}
        width={32}
        height={12}
        textSize="lg"
        onClick={handleTempImagePost}
      >
        확인
      </Button>
    </div>
  );
}

export default ImageUpload;
