import { http, HttpResponse } from "msw";
import { Photo, PhotoResponse } from "../../api/boardApi";
import { photos } from "../models/photos";

type PhotosKey = keyof typeof photos;

export const boardHandlers = [
  // 개별 사진 조회 핸들러
  http.get("https://j12b104.p.ssafy.io/api/v1/photo/:id", ({ params }) => {
    const { id } = params;
    const idNumber = Number(id);
    console.log(`사진 ID ${id} 요청이 MSW에 도착했습니다!`);

    // 모든 페이지의 사진 데이터에서 해당 ID의 사진 찾기
    let foundPhoto = null;

    // 모든 페이지를 순회하면서 사진 찾기
    for (const pageKey in photos) {
      const pageKeyAsNumber = Number(pageKey);

      if (
        pageKeyAsNumber === 1 ||
        pageKeyAsNumber === 2 ||
        pageKeyAsNumber === 3 ||
        pageKeyAsNumber === 4 ||
        pageKeyAsNumber === 5
      ) {
        const page = photos[pageKeyAsNumber as PhotosKey];
        const photoFound = page.data.photos.find(
          (photo: Photo) => photo.id === idNumber
        );

        if (photoFound) {
          foundPhoto = photoFound;
          break;
        }
      } // 이 닫는 중괄호가 누락되었습니다
    }

    if (foundPhoto) {
      // 찾은 사진 정보 반환
      return HttpResponse.json(
        {
          timeStamp: new Date().toISOString(),
          message: "사진 조회 성공",
          data: {
            ...foundPhoto,
            title: `사진 ${foundPhoto.id}`,
            description: "이것은 MSW에서 제공하는 샘플 사진입니다.",
            createdAt: new Date().toISOString(),
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            tags: ["sample", "msw", "test"],
          },
        },
        { status: 200 }
      );
    } else {
      // 사진을 찾지 못한 경우
      return HttpResponse.json(
        {
          timeStamp: new Date().toISOString(),
          message: "해당 ID의 사진을 찾을 수 없습니다",
          data: null,
        },
        { status: 404 }
      );
    }
  }),

  // 페이지별 사진 목록 조회
  http.get(
    "https://j12b104.p.ssafy.io/api/v1/photos/:pageParam",
    ({ params }) => {
      const { pageParam } = params;
      const page = Number(pageParam) || 1;

      console.log(`페이지 ${pageParam} 요청이 MSW에 도착했습니다!`);

      // 타입 안전성을 확보하기 위한 검사
      if (
        page >= 1 &&
        page <= 5 &&
        Object.keys(photos).includes(String(page))
      ) {
        // 키가 있다고 확인된 경우에만 안전하게 접근
        console.log(`페이지 ${page}에 대한 데이터 반환 중...`);
        return HttpResponse.json(photos[page as PhotosKey], { status: 200 });
      }

      // 존재하지 않는 페이지에 대한 기본 응답
      console.log(`페이지 ${page}에 대한 데이터가 없습니다.`);
      return HttpResponse.json(
        {
          timeStamp: new Date().toISOString(),
          message: "해당 페이지의 사진이 없습니다",
          data: {
            currentPage: page,
            totalPages: Object.keys(photos).length,
            photos: [],
          },
        },
        { status: 200 }
      );
    }
  ),
];

// 참고: 기존의 http.all("*", ...) 핸들러는 제거했습니다.
// 이 부분은 모든 요청을 가로채 오류를 반환하고 있었습니다.
