import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { boardApi, Photo } from "../api/boardApi";
import { testApi } from "../api/api";
import { AnalysisFeedbackType, AnalysisScoreType } from "../types/evalTypes";
import { BoardCategory } from "../types/boardTypes";

interface PhotoResponse {
  analysisChart: AnalysisScoreType;
  analysisText: AnalysisFeedbackType;
  createdAt: Date;
  isLike: boolean;
  hashTag: [];
  imageUrl: string;
  likeCnt: number;
  nickName: string;
  photoId: number;
  profileImage: string;
  score: number;
  userId: number;
}

interface SearchPhotoResponse {
  id: number;
  imageUrl: string;
}

export const useGetPhotos = (category: BoardCategory) => {
  return useInfiniteQuery({
    queryKey: ["photos", category],
    queryFn: async ({ pageParam }) => {
      const response = await boardApi.getPhotos(pageParam, category);
      return response.data.data;
    },
    getNextPageParam: (last) => {
      console.log("다음 페이지 확인할게요", last.currentPage, last.totalPages);
      if (last.currentPage < last.totalPages) {
        return last.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetPhoto = (photoId: number | null) => {
  return useQuery<PhotoResponse>({
    queryKey: ["photo", photoId],
    queryFn: async () => {
      if (!photoId) {
        throw new Error("photo id가 필요합니다");
      }
      const response = await boardApi.getPhoto(photoId);
      return response.data.data;
    },
    enabled: !!photoId,
  });
};

export const useDeletePhoto = (photoId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["photo-delete"],
    mutationFn: async () => {
      const response = await boardApi.deletePhoto(photoId);
      return response;
    },
    onSuccess: () => {
      console.log("게시글 삭제 성공");
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error) => {
      console.log("게시글 삭제 실패", error);
    },
  });
};

export const useSearchPhotos = (inputText: string | undefined) => {
  return useQuery({
    queryKey: ["search-photos", inputText],
    queryFn: async () => {
      if (!inputText || inputText.trim() === "") {
        return [];
      }
      const response = await boardApi.searchPhoto(inputText);
      return response.data.data;
    },
    enabled: !!inputText, // inputText가 존재할 때만 쿼리 실행
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: number) => {
      const response = await boardApi.likes(photoId);
      return response;
    },
    onSuccess: (data, photoId) => {
      queryClient.setQueryData(
        ["photo", photoId],
        (oldData: PhotoResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            isLike: !oldData.isLike,
            likeCnt: oldData.isLike ? oldData.likeCnt - 1 : oldData.likeCnt + 1,
          };
        }
      );
    },
    onError: (error) => {
      console.log("좋아요 토글 실패", error);
    },
  });
};

export const useTogglePhotoVisibility = (photoId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["photo-visibility", photoId],
    mutationFn: async () => {
      const response = await boardApi.togglePhotoVisibility(photoId);
      return response.data;
    },
    onSuccess: () => {
      console.log("사진 공개 설정 변경 성공");
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["photo", photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error) => {
      console.error("사진 공개 설정 변경 실패", error);
    },
  });
};
