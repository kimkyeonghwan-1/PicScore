# Stage 1: React 앱 빌드
	
# Node LTS 버전 사용
FROM node:22.14-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일을 먼저 복사해서 캐시 활용
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 전체 소스 복사
COPY . .

# 환경 변수 복사
COPY .env.front .env

# React 빌드
RUN npm run build


# Stage 2: Nginx로 정적 파일 서빙

# NGINX LTS 버전 사용
FROM nginx:1.26-alpine

# Nginx 설정 복사
COPY nginx-front.conf /etc/nginx/nginx.conf

# React 빌드 산출물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# NGINX 실행
CMD ["nginx", "-g", "daemon off;"]