import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { JwtKakaoStrategy } from "./social-kakao-strategy";
import { JwtGoogleStrategy } from "./social-google.strategy";
import { AuthController } from "./auth.controller";
import { JwtNaverStrategy } from "./social-naver.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { JwtStrategy } from "./jwt.strategy";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [
    PassportModule,
    EmailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" }
      })
    })
  ],

  controllers: [
    AuthController //컨트롤러 주입,
  ],

  providers: [
    JwtStrategy,
    JwtGoogleStrategy, //google소셜로그인

    JwtNaverStrategy, //naver소셜로그인
    JwtKakaoStrategy, //kakao소셜로그인

    JwtNaverStrategy, //naver소셜로그인
    JwtKakaoStrategy, //kakao소셜로그인
    AuthService, //service 주입
    UserService //user폴더의 service 주입
  ]
})
export class AuthModule {}
