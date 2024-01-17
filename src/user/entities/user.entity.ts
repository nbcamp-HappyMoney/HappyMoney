import { Account } from "src/accounts/entities/account.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { Notice } from "src/notice/entities/notice.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

const role = {
  User: "user",
  Admin: "admin"
} as const;
type role = (typeof role)[keyof typeof role]; // 'user' | 'admin'

@Entity({
  name: "users"
})
export class User extends BaseEntity {
  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", select: false, nullable: false })
  password: string;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  nickName: string;

  @Column({ type: "varchar", nullable: false })
  phone: string;

  @Column({ type: "varchar", nullable: false, default: "local" })
  signupType: string;

  @Column({ type: "enum", nullable: false, enum: role, default: role.User })
  role: role;

  @OneToMany(() => Account, (account) => account.user, { cascade: ["soft-remove"] })
  accounts: Account[];

  @OneToMany(() => Notice, (notice) => notice.user)
  notices: Notice[];
}
