import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { evalApi } from "../api/evalApi";
import { data } from "react-router-dom";
import { ImageEvalResponse } from "../types/evalTypes";

export const usePostTempImage = () => {
  return useMutation({
    mutationKey: ["post-temp-image"],
    mutationFn: async (imageFile: FormData) => {
      if (imageFile) {
        console.log("이미지 파일 출력 ", imageFile);
        const response = await evalApi.postTempImage(imageFile);
        console.log(response, "임시저장 완료");
        return response;
      }
    },
  });
};

export const useEvalImage = (tempImageUrl: string) => {
  return useQuery({
    queryKey: ["eval-image", tempImageUrl],
    queryFn: async () => {
      if (tempImageUrl) {
        console.log("이미지 분석 결과 출력");
        const response = await evalApi.evalImage(tempImageUrl);
        console.log(response.data.data);
        return response.data.data;
      }
    },
    enabled: !!tempImageUrl,
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["image-upload"],
    mutationFn: async (evalResult: ImageEvalResponse) => {
      if (evalResult) {
        const response = await evalApi.saveImage(evalResult);
        return response.data.data;
      }
    },
    onSuccess: (data) => {
      console.log("업로드에 성공했습니다", data);
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error) => {
      console.log("업로드 실패", error);
    },
  });
};
