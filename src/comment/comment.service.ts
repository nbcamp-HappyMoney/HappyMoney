// comment.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Post } from "src/post/entities/post.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  async create(userId: number, postId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    // 게시글 존재 여부 확인
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      commentUser: { id: userId },
      post: { id: postId }
    });
    return this.commentRepository.save(comment);
  }

  async findCommentsByPost(postId: number): Promise<any[]> {
    const comments = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.commentUser", "commentUser")
      .where("comment.post = :postId", { postId })
      .select(["comment.id", "comment.content", "comment.createdAt", "comment.updatedAt", "commentUser.nickName"])
      .orderBy("comment.createdAt", "DESC")
      .getMany();

    return comments;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    await this.commentRepository.update(id, updateCommentDto);
    return this.commentRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}