import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IsNull, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcrypt";
import { User } from "./entities/user.entity";
import { EmailService } from "../email/email.service";
import { v4 as uuidv4 } from "uuid";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  // 회원가입
  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, nickName, phone } = createUserDto;

    function generateToken() {
      return uuidv4();
    }

    try {
      const hashRound = this.configService.get<number>("PASSWORD_HASH_ROUNDS");
      const hashPassword = hashSync(password, hashRound);

      const emailVerifyToken = generateToken();

      const mailOptions = {
        from: this.configService.get("NODE_MAIL_ID"),
        to: email,
        subject: "[HAPPYMONEY] 회원가입 이메일 인증 메일입니다.",
        html: `
        <div class="img-wrap">
        <img src="https://cdn.discordapp.com/attachments/1201496380292726794/1201497252355645460/02.png?ex=65ca0883&is=65b79383&hm=296a93e633af34f5f453112e8e87ab08918fadfdfcd068ced4811d08b943d371&" style="width: 300px; height: 300px;" />
        </div>
        [HAPPYMONEY] 회원가입: <a href="https://happymoneynow.com/views/signin-email-verify.html?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(emailVerifyToken)}">인증하기</a>`
      };

      await this.userRepository.save({
        email,
        password: hashPassword,
        nickName,
        phone,
        name,
        isEmailVerified: false,
        emailVerifyToken
      });

      this.emailService.verifyEmail(mailOptions);
      return {
        success: true,
        message: "okay"
      };
    } catch (err: any) {
      console.error(err);
    }
  }

  // 로그인
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) throw new UnauthorizedException("이메일을 확인해주세요.");

    if (user.isEmailVerified === false) {
      throw new NotFoundException("등록된 이메일 인증을 진행해주세요.");
    }

    if (!compareSync(password, user?.password ?? "")) throw new UnauthorizedException("비밀번호를 확인해주세요.");

    const payload = { id: user.id, tokenType: "access" };

    return {
      success: true,
      message: "okay",
      accessToken: this.jwtService.sign(payload, { expiresIn: "1d" })
    };
  }

  // 유저 정보 수정
  async updateUserInfo(id: number, nickName: string, phone: string) {
    const updated = await this.userRepository.update({ id }, { nickName, phone });

    return updated;
  }

  // 유저 비밀번호 수정
  async updatePassword(id: number, password: string) {
    const updated = await this.userRepository.update({ id }, { password });

    return updated;
  }

  // 회원탈퇴 이메일
  async deleteUserSendEmail(id: number) {
    const user: User = await this.userRepository.findOne({
      where: { id }
    });

    try {
      const mailOptions = {
        to: user.email,
        subject: "[HAPPYMONEY] 회원탈퇴 이메일 인증 메일입니다.",
        html: `
        <div class="img-wrap">
        <img src="https://cdn.discordapp.com/attachments/1201496380292726794/1201497252355645460/02.png?ex=65ca0883&is=65b79383&hm=296a93e633af34f5f453112e8e87ab08918fadfdfcd068ced4811d08b943d371&" style="width: 300px; height: 300px;" />
        </div>
        [HAPPYMONEY] 회원탈퇴: <a href="https://happymoneynow.com/views/signout-email-verify.html?email=${encodeURIComponent(
          user.email
        )}&token=${encodeURIComponent(user.emailVerifyToken)}">인증하기</a>`
      };

      this.emailService.verifyEmail(mailOptions);
      return {
        success: true,
        message: "okay"
      };
    } catch (err: any) {
      console.error(err);
    }
  }

  // 회원탈퇴
  async deleteUser(id: number) {
    const user: User = await this.userRepository.findOne({
      where: { id }
    });

    await this.updateUserVerify(user.id, {
      isEmailVerified: false,
      emailVerifyToken: null
    });
    await this.userRepository.softRemove(user);
  }

  // 모든 유저 찾기
  async find() {
    return await this.userRepository.find({
      select: ["id", "email", "name", "deletedAt", "nickName"],
      withDeleted: true // soft delete된 항목도 포함
    });
  }

  // 유저 id 찾기
  async findUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  // 유저 이메일만 찾기
  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      select: ["id", "email", "password", "name", "phone", "role", "isEmailVerified", "emailVerifyToken"],
      where: [{ email }]
    });
  }

  // 유저 핸드폰 번호 찾기
  async findUserByPhone(phone: string) {
    return await this.userRepository.find({
      select: ["id", "email", "password", "name", "phone", "role", "isEmailVerified"],
      where: [{ phone }]
    });
  }

  // 유저 닉네임 찾기
  async findUserByNickName(nickName: string) {
    return await this.userRepository.findOneBy({ nickName });
  }

  // 유저 DB 정보 수정
  async updateUserVerify(userId: number, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(userId, updateData);
  }

  // 닉네임으로 해당 아이디 받아오기
  async findUserByNickname(nickname: string): Promise<User | undefined> {
    return this.userRepository.createQueryBuilder("user").where("user.nickName = :nickname", { nickname }).getOne();
  }

  // 구독
  async saveSubscription(subscription: JSON, id: number) {
    await this.userRepository.update({ id }, { subscription });
  }

  // 임시 비밀번호 이메일 발송
  async sendTemporaryPassword(email: string) {
    const user: User = await this.findUserByEmail(email);
    const temporaryPassword = Math.floor(100000 + Math.random() * 900000).toString();

    const hashRound = this.configService.get<number>("PASSWORD_HASH_ROUNDS");
    const hashPassword = hashSync(temporaryPassword, hashRound);

    if (!user) {
      throw new NotFoundException("존재하지 않는 회원이거나 정보가 일치하지 않습니다.");
    }

    try {
      await this.userRepository.update(user.id, {
        password: hashPassword
      });

      const mailOptions = {
        to: user.email,
        subject: "[HAPPYMONEY] 임시 비밀번호 ",
        html: `
        <div class="img-wrap">
        <img src="https://cdn.discordapp.com/attachments/1201496380292726794/1201497252355645460/02.png?ex=65ca0883&is=65b79383&hm=296a93e633af34f5f453112e8e87ab08918fadfdfcd068ced4811d08b943d371&" style="width: 300px; height: 300px;" />
        </div>
        [HAPPYMONEY] 임시 비밀번호: <strong>${temporaryPassword}</strong>`
      };

      this.emailService.verifyEmail(mailOptions);
    } catch (err: any) {
      console.error(err);
    }
  }
}
