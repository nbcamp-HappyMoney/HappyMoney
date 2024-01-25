import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
// import { JwtAuthGuard } from "./jwt.auth.guard";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { JwtKakaoStrategy } from "./social-kakao-strategy";
import { JwtGoogleStrategy } from "./social-google.strategy";
import { AuthController } from "./auth.controller";
import { JwtNaverStrategy } from "./social-naver.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" }
      })
    }),
    ConfigModule.forRoot({
      isGlobal: true // Make the ConfigModule global
    })
  ],
  controllers: [
    AuthController //컨트롤러 주입,
  ],

  providers: [
    JwtGoogleStrategy, //google소셜로그인
    JwtNaverStrategy, //naver소셜로그인
    JwtKakaoStrategy, //kakao소셜로그인
    AuthService, //service 주입
    UserService //user폴더의 service 주입
  ]
})
export class AuthModule {}
