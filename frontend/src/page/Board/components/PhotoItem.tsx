import { useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import defaultImage from "../../../assets/Board/default-image.webp";
interface PhotoItemProps {
  photo: {
    id: number;
    imageUrl: string;
    // 필요한 다른 photo 속성들도 여기에 추가하세요
  };
  index: number;
  onClick: () => void;
  priority?: boolean;
}
function PhotoItem({ photo, index, onClick }: PhotoItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const fullImageLoaded = useRef(false);

  return (
    <div
      className={`w-1/3 aspect-square ${
        index === 2 ? "mt-0.5" : "mr-0.5 mt-0.5"
      } relative`} // relative 추가
      onClick={onClick}
    >
      {/* 항상 고정된 크기의 placeholder 유지 */}
      <div
        className="w-full h-full absolute top-0 left-0 bg-gray-200 animate-pulse"
        style={{ visibility: isLoaded ? "hidden" : "visible" }}
      />

      <img
        src={`${photo.imageUrl}`}
        alt="이미지 입니다."
        className={`h-full w-full object-cover absolute top-0 left-0 ${
          !isLoaded ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        // fetchpriority 대신 속성 속성 사용
        onLoad={() => {
          setIsLoaded(true);
          fullImageLoaded.current = true;
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultImage;
          setIsLoaded(true);
        }}
      />
    </div>
  );
}

export default PhotoItem;
