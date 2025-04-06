const generatePhotos = (startId: number, count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    imageUrl: `https://picsum.photos/seed/${startId + index}/400/300`,
  }));
};

// 페이지별 사진 데이터 (각 페이지당 24개)
export const photos = {
  1: {
    timeStamp: "2025-04-04T15:30:45.123Z",
    message: "사진을 성공적으로 불러왔습니다",
    data: {
      currentPage: 1,
      totalPages: 5,
      photos: generatePhotos(1001, 24),
    },
  },
  2: {
    timeStamp: "2025-04-04T15:35:12.456Z",
    message: "사진을 성공적으로 불러왔습니다",
    data: {
      currentPage: 2,
      totalPages: 5,
      photos: generatePhotos(1025, 24),
    },
  },
  3: {
    timeStamp: "2025-04-04T15:40:22.789Z",
    message: "사진을 성공적으로 불러왔습니다",
    data: {
      currentPage: 3,
      totalPages: 5,
      photos: generatePhotos(1049, 24),
    },
  },
  4: {
    timeStamp: "2025-04-04T15:45:33.159Z",
    message: "사진을 성공적으로 불러왔습니다",
    data: {
      currentPage: 4,
      totalPages: 5,
      photos: generatePhotos(1073, 24),
    },
  },
  5: {
    timeStamp: "2025-04-04T15:50:48.357Z",
    message: "사진을 성공적으로 불러왔습니다",
    data: {
      currentPage: 5,
      totalPages: 5,
      photos: generatePhotos(1097, 24),
    },
  },
};
