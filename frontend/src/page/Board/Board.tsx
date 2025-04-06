import { useEffect, useState } from "react";
import { useGetPhotos } from "../../hooks/useBoard";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import SearchBar from "./components/SearchBar";
import BoardPhotoGrid from "./components/BoardPhotoGrid";
import PhotoItem from "./components/PhotoItem";

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
  const photos = data?.pages.flatMap((page) => page.photos) || [];
  const totalPage = data?.pages[0].totalPages || 0;

  if (error) {
    console.log(error);
    <div>에러 났어요</div>;
  }

  const { ref, inView } = useInView({
    rootMargin: "0px 0px 400px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  const navigatePhotoDetail = (photoId: number) => {
    navigate(`/photo/${photoId}`);
  };

  const initialVisibleImages = 12;
  return (
    <div className="w-full h-screen flex flex-col">
      <SearchBar />

      {/* <BoardPhotoGrid /> */}
      <div className="overflow-y-auto flex-1 mb-16 ">
        {isLoading && (
          <div className="grid grid-cols-3 gap-0.5 w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        )}
        {Array.from({ length: totalPage * 8 }, (_, rowIndex) => (
          <div key={rowIndex} className="flex w-full">
            {photos
              .slice(rowIndex * 3, rowIndex * 3 + 3)
              .map((photo, index) => {
                return (
                  <PhotoItem
                    key={index}
                    photo={photo}
                    index={index}
                    onClick={() => navigatePhotoDetail(photo.id)}
                  />
                );
              })}
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
