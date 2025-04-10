package com.picscore.backend.common.jwt;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTUtil {

    private SecretKey secretKey;


    /**
     * JWTUtil 생성자. 주어진 시크릿 키로 SecretKey를 초기화합니다.
     *
     * @param secret JWT 서명에 사용할 시크릿 키
     */
    public JWTUtil(
            @Value("${jwt.secret}")String secret) {

        secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
    }


    /**
     * 토큰에서 카테고리를 추출합니다.
     *
     * @param token JWT 토큰
     * @return 토큰의 카테고리
     */
    public String getCategory(
            String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("category", String.class);
    }


    /**
     * 토큰에서 카테고리를 추출합니다.
     *
     * @param token JWT 토큰
     * @return 토큰의 소셜ID
     */
    public String getSocialId(
            String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("socialId", String.class);
    }


    /**
     * 토큰에서 닉네임을 추출합니다.
     *
     * @param token JWT 토큰
     * @return 토큰의 닉네임
     */
    public String getNickName(
            String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("nickName", String.class);
    }


    /**
     * 토큰에서 역할을 추출합니다.
     *
     * @param token JWT 토큰
     * @return 토큰의 역할
     */
    public String getRole(
            String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }


    /**
     * 토큰의 만료 여부를 확인합니다.
     *
     * @param token JWT 토큰
     * @return 토큰 만료 여부 (만료되었으면 true)
     */
    public Boolean isExpired(
            String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date());
    }


    /**
     * 새로운 JWT 토큰을 생성합니다.
     *
     * @param category 토큰 카테고리
     * @param nickName 사용자 닉네임
     * @param expiredMs 만료 시간 (밀리초)
     * @return 생성된 JWT 토큰
     */
    public String createJwt(
            String category,
            String nickName,
            Long expiredMs) {

        return Jwts.builder()
                .claim("category", category)
                .claim("nickName", nickName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}

