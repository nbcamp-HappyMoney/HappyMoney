import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Repository } from "typeorm";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}
  async create(userId: number, nickName: string, createPostDto: CreatePostDto) {
    const { category, title, contents } = createPostDto;
    await this.postRepository.save({
      category,
      userId,
      nickName,
      title,
      contents
    });
  }

  async findAll() {
    const data = await this.postRepository
      .createQueryBuilder("p")
      .select(["p.id", "p.category", "p.nickName", "p.title", "p.createdAt"])
      .loadRelationCountAndMap("p.commentNumbers", "p.comments")
      .orderBy("p.createdAt", "DESC")
      .getMany();

    return data;
  }

  async findOne(id: number) {
    const data = await this.postRepository.findOne({
      where: { id },
      relations: ["comments"]
    });
    return data;
  }

  async findMyPosts(userId: number) {
    console.log("userId: ", userId);
    const data: Post[] = await this.postRepository
      .createQueryBuilder("p")
      .where("p.userId=:userId", { userId })
      .select(["p.id", "p.category", "p.nickName", "p.title", "p.createdAt"])
      .loadRelationCountAndMap("p.commentNumbers", "p.comments")
      .orderBy("p.createdAt", "DESC")
      .getMany();

    return data;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const data = await this.postRepository.update({ id }, updatePostDto);
    return data.affected;
  }

  async remove(data: object) {
    await this.postRepository.softRemove(data);
  }
}
