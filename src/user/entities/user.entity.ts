import { Account } from "src/accounts/entities/account.entity";
import { Comment } from "src/comment/entities/comment.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { Post } from "src/post/entities/post.entity";
import { Notice } from "src/notice/entities/notice.entity";
import { Twit } from "src/twit/entities/twit.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Push } from "src/push/entities/push.entity";
import { StarStock } from "src/star-stock/entities/star-stock.entity";
import { Order } from "src/order/entities/order.entity";
import { StockHolding } from "src/order/entities/stockHolding.entity";

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

  @Column({ default: false }) // default to false, assuming initially not verified
  isEmailVerified: boolean;

  @Column({ nullable: true }) // nullable because it may not be set initially
  emailVerifyToken: string;

  @Column({ type: "varchar", nullable: false, default: "local" })
  signupType: string;

  @Column({ type: "enum", nullable: false, enum: role, default: role.User })
  role: role;

  @IsNotEmpty()
  @Column({ type: "simple-json", nullable: true, default: null })
  subscription?: JSON;

  @OneToMany(() => Account, (account) => account.user, { cascade: ["soft-remove"] })
  accounts: Account[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Notice, (notice) => notice.user)
  notices: Notice[];

  @OneToMany(() => Comment, (comment) => comment.commentUser)
  comments: Comment[];

  @OneToMany(() => Twit, (twit) => twit.sender)
  sendtwits: Twit[];

  @OneToMany(() => Twit, (twit) => twit.receiver)
  receivetwits: Twit[];

  @OneToMany(() => Push, (push) => push.user, { cascade: ["soft-remove"] })
  pushNotis: Push[];

  @OneToMany(() => StarStock, (starStock) => starStock.user, { cascade: ["soft-remove"] })
  starStocks: StarStock[];

  @OneToMany(() => Order, (order) => order.user, { cascade: ["soft-remove"] })
  orders: Order[];

  @OneToMany(() => StockHolding, (stockHolding) => stockHolding.user, { cascade: ["soft-remove"] })
  stockHoldings: StockHolding[];
}
