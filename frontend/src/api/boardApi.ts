import { testApi } from "./api";

export interface PostRequest {
  imageUrl: string;
  score: number;
  analysisChart?: number;
  analysisText?: string;
  isPublic: boolean;
}

export interface Photo {
  id: number;
  imageUrl: string;
}

export interface PhotoResponse {
  timeStamp: string;
  message: string;
  data: {
    currentPage: number;
    totalPages: number;
    photos: Photo[];
  };
}

// export const boardApi = {
//   getPhotos: () => {
//     return api.get<{ data: Photo[] }>("/api/v1/photo");
//   },
//   postPhoto: (data: PostRequest) => {
//     api.post("/api/v1/photo", data);
//   },
//   getTopPhotos: () => {
//     api.get("/api/v1/photo/top5");
//   },
//   getPhoto: (id: number) => {
//     api.get(`/api/v1/photo/${id}`);
//   },
//   deletePhoto: (id: number) => {
//     api.delete(`/api/v1/photo/${id}`);
//   },
//   searchPhoto: (inputText: string) => {
//     api.post(`/api/v1/photo/search`, { keyword: inputText });
//   },
// };

// 테스트용 api
export const boardApi = {
  getPhotos: (pageParam: number) => {
    return testApi.get<PhotoResponse>(`/api/v1/photos/${pageParam}`);
  },
  postPhoto: (data: PostRequest) => {
    return testApi.post("/api/v1/photo", data);
  },
  getTopPhotos: () => {
    return testApi.get("/api/v1/photo/top5");
  },
  getPhoto: (id: number | undefined) => {
    return testApi.get(`/api/v1/photo/${id}`);
  },
  deletePhoto: (id: number) => {
    return testApi.delete(`/api/v1/photo/${id}`);
  },
  searchPhoto: (inputText: string) => {
    return testApi.get(`/api/v1/photo/search`, {
      params: {
        keyword: inputText,
      },
    });
  },
  likes: (photoId: number) => {
    return testApi.post(`/api/v1/photo/like/${photoId}`);
  },
  togglePhotoVisibility: (photoId: number) => {
    return testApi.patch(`/api/v1/photo/${photoId}`);
  },
};
