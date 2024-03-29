import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-naver";

// 구글 소셜로그인 Usegudars("naver")
export class JwtNaverStrategy extends PassportStrategy(Strategy, "naver") {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: "/api/naver/callback"
    });
  }

  // 네이버 소셜로그인 정보
  validate(accessToken: string, refreshToken: string, profile: any) {
    const signupType = profile.provider;

    return {
      name: profile.displayName,
      email: profile._json.email,
      password: profile.id,
      signupType,
      profile
    };
  }
}
