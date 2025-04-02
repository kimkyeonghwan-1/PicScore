package com.picscore.backend.common.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.picscore.backend.common.exception.CustomException;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.common.service.CustomHttpServletRequestWrapper;
import com.picscore.backend.user.model.dto.CustomOAuth2User;
import com.picscore.backend.user.model.dto.UserDto;
import com.picscore.backend.user.service.OAuthService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final OAuthService oAuthService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return path.equals("/")
                || path.equals("/actuator/health")
                || (path.equals("/api/v1/user") && "GET".equalsIgnoreCase(method))
                || (path.equals("/api/v1/photo") && "POST".equalsIgnoreCase(method))
                || (path.equals("/api/v1/image/analyze") && "GET".equalsIgnoreCase(method))
                || (path.matches("/api/v1/user/photo/\\d+") && "GET".equalsIgnoreCase(method))
                || (path.matches("/api/v1/photo/\\d+") && "GET".equalsIgnoreCase(method));
    }


    /**
     * JWT 토큰을 검증하고 인증 처리를 수행하는 필터 메서드입니다.
     *
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param filterChain 필터 체인
     * @throws ServletException 서블릿 예외
     * @throws IOException 입출력 예외
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        HttpServletRequest requestToUse = request;
        try {
            // 쿠키에서 액세스 토큰 추출
            String accessToken = null;
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (cookie.getName().equals("access")) {
                        accessToken = cookie.getValue();
                        break;
                    }
                }
            }

            // 개발 환경 임시 방편
//            String authorizationHeader = request.getHeader("Authorization");
//            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
//                accessToken = authorizationHeader.substring(7); // "Bearer " 이후의 토큰을 추출
//            }

            // 액세스 토큰이 없으면 다음 필터로 진행
            if (accessToken == null) {
                throw new CustomException(HttpStatus.UNAUTHORIZED, "인증 토큰 없음!");
            }

            try {
                // 토큰 만료 검증
                jwtUtil.isExpired(accessToken);
            } catch (ExpiredJwtException e) {
                try {
                    // 토큰 만료 시 재발급 처리
                    String newAccessToken = oAuthService.reissue(request, response);

                    CustomHttpServletRequestWrapper updatedRequest = new CustomHttpServletRequestWrapper(request);
                    updatedRequest.addHeader("Authorization", "Bearer " + newAccessToken); // 헤더 추가
                    updatedRequest.updateCookie("access", newAccessToken); // 쿠키 업데이트
                    accessToken = newAccessToken;
                    requestToUse = updatedRequest; // 재발급된 경우 updatedRequest를 사용
                } catch (CustomException ce) {
                    // CustomException 처리
                    response.setStatus(ce.getStatus().value());
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(objectMapper.writeValueAsString(BaseResponse.error(ce.getMessage())));
                    return; // 필터 체인 종료
                }
            }

            // 토큰 카테고리 검증
            String category = jwtUtil.getCategory(accessToken);
            if (!category.equals("access")) {
                throw new CustomException(HttpStatus.UNAUTHORIZED, "유효하지 않은 액세스 토큰");
            }

            // 토큰에서 사용자 정보 추출
            String socialId = jwtUtil.getSocialId(accessToken);
            String nickName = jwtUtil.getNickName(accessToken);
            String role = jwtUtil.getRole(accessToken);

            // UserDto 생성 및 설정
            UserDto userDto = new UserDto(
                    socialId,
                    nickName,
                    role
            );

            // CustomOAuth2User 객체 생성
            CustomOAuth2User customOAuth2User = new CustomOAuth2User(userDto);

            // 인증 객체 생성 및 SecurityContext에 설정
            Authentication authToken = new UsernamePasswordAuthenticationToken(customOAuth2User, null, customOAuth2User.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (CustomException ex) {
            response.setStatus(ex.getStatus().value());
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(BaseResponse.error(ex.getMessage())));
            return;
        }

        filterChain.doFilter(requestToUse, response);
    }
}

