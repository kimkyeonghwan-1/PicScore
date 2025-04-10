import processEval from "../../assets/ImageEval/process-upload.webp";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { CameraIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

import { useEvalImage, usePostTempImage } from "../../hooks/useEvalImage";
import Loading from "../../components/Loading";

/**
 * 이미지 압축 함수
 * 5MB 이상인 파일만 4MB로 압축, 그 이하는 그대로 반환
 * @param file 압축할 이미지 파일
 * @returns 압축된 파일 또는 원본 파일
 */
const compressImageIfNeeded = async (file: File): Promise<File> => {
  // 파일 크기가 5MB 미만이면 압축하지 않음
  const FILE_SIZE_LIMIT = 5; // 5MB
  const TARGET_SIZE = 4; // 4MB
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB < FILE_SIZE_LIMIT) {
    console.log(`압축 불필요: 파일 크기 ${fileSizeMB.toFixed(2)}MB (5MB 미만)`);
    return file;
  }

  try {
    // 압축 옵션 설정
    const options = {
      maxSizeMB: TARGET_SIZE, // 최대 파일 크기 (MB)
      maxWidthOrHeight: 1920, // 최대 너비/높이 (픽셀) - 고해상도 유지
      useWebWorker: true, // WebWorker 사용 (성능 향상)
      initialQuality: 0.8, // 초기 품질 - 평가 이미지는 품질을 좀 더 높게 유지
      alwaysKeepResolution: true, // 해상도 유지
    };

    console.log(`압축 시작: 원본 크기 ${fileSizeMB.toFixed(2)}MB (5MB 이상)`);

    // 이미지 압축 실행
    const compressedFile = await imageCompression(file, options);
    const compressedSizeMB = compressedFile.size / (1024 * 1024);

    console.log(
      `압축 완료: ${compressedSizeMB.toFixed(2)}MB (${Math.round(
        (compressedFile.size / file.size) * 100
      )}% 크기)`
    );

    return compressedFile;
  } catch (error) {
    console.error("이미지 압축 실패:", error);
    // 압축 실패 시 원본 파일 반환
    return file;
  }
};

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
  const [isCompressing, setIsCompressing] = useState(false); // 이미지 압축 상태
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
    const originalFile = event.target.files[0];
    if (originalFile) {
      // 파일 크기 확인 (100MB 제한)
      const fileSizeMB = originalFile.size / (1024 * 1024);
      const MAX_FILE_SIZE = 100; // 100MB 제한

      if (fileSizeMB > MAX_FILE_SIZE) {
        alert(
          `파일 크기가 너무 큽니다. (${fileSizeMB.toFixed(
            1
          )}MB)\n\n최대 ${MAX_FILE_SIZE}MB 크기의 이미지만 업로드 가능합니다.`
        );
        // 파일 선택 초기화
        if (event.target) event.target.value = "";
        return;
      }

      // 원본 이미지 미리보기 설정 (압축 전)
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
          setModalState(false);
        }
      };
      reader.readAsDataURL(originalFile); //base64로 전환

      // 원본 파일 저장 (나중에 압축)
      setImageFile(originalFile);
      console.log(`원본 이미지 크기: ${fileSizeMB.toFixed(2)}MB`);
    }
  };

  // 분석 시작
  //이미지 임시저장 하고 -> 분석 하고 -> result page로 넘긴다음 그 데이터 써서 업로드
  // 1. 이미지 임시 저장
  const handleTempImagePost = async () => {
    if (imageFile) {
      try {
        // 압축 시작 상태 설정
        setIsCompressing(true);

        // 이미지 크기 확인 및 필요시 압축 (5MB 이상일 경우만)
        const processedFile = await compressImageIfNeeded(imageFile);

        // 압축 완료 상태 설정
        setIsCompressing(false);

        // 압축 완료 후 formData 생성 및 업로드
        const formData = new FormData();
        formData.append("file", processedFile);

        // 로딩 상태 설정 추가 (옵션)
        tempImageMutation.mutate(formData, {
          onSuccess: (data) => {
            console.log("이미지 임시저장 성공", data?.data.data);
            setTempImageName(data?.data.data.imageName);
            setTempImage(data?.data.data.imageUrl); //임시저장 성공후 set 하면 바로 분석 시작
          },
          onError: (error) => {
            console.log("이미지 임시저장 오류 ", error);
          },
        });
      } catch (error) {
        console.error("이미지 처리 중 오류:", error);
        // 오류 발생 시 압축 상태 초기화
        setIsCompressing(false);
      }
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

      navigate("/image-result", {
        state: {
          evalData: updatedEvalData,
          imageUrl: tempImage,
        },
      });
    }
  }, [imageEval.data]);

  // 3. 이미지 영구 저장 , response에 photo id 추가 요청

  return (
    <div
      className="flex flex-col w-full items-center justify-center"
      onClick={modalClose}
    >
      {(imageEval.isLoading ||
        tempImageMutation.isPending ||
        isCompressing) && <Loading />}
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
      <div className="mb-12">
        <img src={processEval} className="w-84" alt="" />
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
      {isCompressing && (
        <div className="mb-4 text-sm text-pic-primary">
          큰 이미지 파일 압축 중... 잠시만 기다려주세요.
        </div>
      )}
      <Button
        color={imageFile ? "green" : "gray"}
        width={32}
        height={12}
        textSize="lg"
        onClick={handleTempImagePost}
        disabled={
          isCompressing || tempImageMutation.isPending || imageEval.isLoading
        }
      >
        {isCompressing
          ? "이미지 압축 중..."
          : tempImageMutation.isPending
          ? "업로드 중..."
          : imageEval.isLoading
          ? "분석 중..."
          : "확인"}
      </Button>
    </div>
  );
}

export default ImageUpload;
