import { useEffect, useState } from "react";
import { useGetPhotos } from "../../hooks/useBoard";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";

function Board() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPhotos();

  const photos = data?.pages.flatMap((page) => page.data.data.photos) || [];
  const totalPage = data?.pages[0].data.data.totalPages || 0;

  if (isLoading && !data) {
    <FadeLoader color="#a4e857" height={12} radius={8} />;
  }
  if (error) {
    console.log(error);
    <div>에러 났어요</div>;
  }

  const { ref, inView } = useInView({
    rootMargin: "0px 0px 400px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log(data?.pages[0].data.data);

      fetchNextPage();
    }
  }, [inView]);

  const navigatePhotoDetail = (photoId: number) => {
    navigate(`/photo/${photoId}`);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="sticky border-2 w-full h-15">
        <input className="w-[95%] border m-3" />
      </div>
      <div className="overflow-y-auto flex-1 mb-16">
        {Array.from({ length: totalPage * 8 }, (_, rowIndex) => (
          <div key={rowIndex} className="flex w-full ">
            {photos
              .slice(rowIndex * 3, rowIndex * 3 + 3)
              .map((photo, index) => (
                <div
                  key={index}
                  className={`w-1/3 aspect-square ${
                    index === 2 ? "mt-0.5" : "mr-0.5 mt-0.5"
                  }`}
                  onClick={() => navigatePhotoDetail(photo.id)}
                >
                  <img
                    src={photo.imageUrl}
                    alt="이미지 입니다."
                    className="h-full w-full"
                  />
                </div>
              ))}
          </div>
        ))}
        <div ref={ref} className="w-full h-20 flex items-center justify-center">
          {isFetchingNextPage ? (
            <FadeLoader color="#a4e857" height={12} radius={8} />
          ) : hasNextPage ? (
            <div className="opacity-0">더 불러오는 중</div>
          ) : photos.length > 0 ? (
            <div className="text-gray-500">모든 사진을 불러왔습니다</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Board;
