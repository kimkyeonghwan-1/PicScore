import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSearchPhotos } from "../../hooks/useBoard";
import SearchBar from "./components/SearchBar";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BottomBar from "../../components/BottomBar/BottomBar";

interface PostType {
  id: string;
  imageUrl: string;
}

function SearchResult() {
  const { search } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSearchPhotos(search);
  const queryClient = useQueryClient();

  // search 파라미터가 변경될 때마다 쿼리 무효화
  useEffect(() => {
    if (search) {
      queryClient.invalidateQueries({ queryKey: ["search-photos", search] });
    }
  }, [search, queryClient]);

  if (isLoading) {
    <>로딩중 입니다.</>;
  }

  const navigatePhotoDetail = (photoId: string) => {
    navigate(`/photo/${photoId}`);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <SearchBar />

      <div className="overflow-y-auto flex-1 mb-16">
        {/* 행 수를 계산하는 방법을 변경 */}
        {data && data.length > 0 ? (
          <>
            {Array.from(
              { length: Math.ceil(data.length / 3) },
              (_, rowIndex) => (
                <div key={rowIndex} className="flex w-full">
                  {data
                    .slice(rowIndex * 3, rowIndex * 3 + 3)
                    .map((post: PostType, index: number) => (
                      <div
                        key={index}
                        className={`w-1/3 aspect-square ${
                          index === 2 ? "mt-0.5" : "mr-0.5 mt-0.5"
                        }`}
                        onClick={() => navigatePhotoDetail(post.id)}
                      >
                        <img
                          src={post.imageUrl}
                          alt="이미지 입니다."
                          className="h-full w-full"
                        />
                      </div>
                    ))}
                </div>
              )
            )}
          </>
        ) : (
          <div className="text-gray-500 w-full text-center mt-10">
            표시할 사진이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResult;
