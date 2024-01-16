import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";

// 회원가입
export class CreateUserDto {
  /**
   * 이메일
   * @example "test@test.com"
   * @requires true
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  password: string;

  /**
   * 확인 비밀번호
   * @example "Abcde123!"
   * @requires true
   */
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  passwordCheck: string;

  /**
   * 이름
   * @example "김민재"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * 닉네임
   * @example "주식의왕"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  nickName: string;

  /**
   * 핸드폰 번호
   * @example "010-1111-1111"
   * @requires true
   */
  @IsString()
  @IsNotEmpty()
  phone: string;
}

// // 로그인
// export class ReqLoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}

// //  유저 정보 수정
// export class ReqUpdateUserDto extends PickType(CreateUserDto, ['name'] as const) {}