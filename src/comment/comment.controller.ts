// comment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@ApiTags("Comments")
@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 댓글 작성
   * @param createCommentDto
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post(":postId")
  async create(@Param("postId") postId: number, @UserInfo() user: User, @Body() createCommentDto: CreateCommentDto) {
    const { content } = createCommentDto;
    if (content.trim() === "") {
      throw new BadRequestException({ success: false, message: "공백으로만 쓸 수 없습니다." });
    }

    await this.commentService.create(user, postId, createCommentDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 내가 작성한 댓글 조회
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Get("my")
  async getMyAllComments(@UserInfo() user: User, @Query() query: PaginatePostDto) {
    const { comments, count } = await this.commentService.getMyAllComments(user.id, query);

    return {
      success: true,
      message: "okay",
      lists: comments,
      total: count
    };
  }

  /**
   * 댓글 전체 조회
   * @returns
   */
  @Get("post/:postId")
  async findCommentsByPost(@Param("postId") postId: number) {
    const comments = await this.commentService.findCommentsByPost(postId);
    return {
      success: true,
      message: "okay",
      data: comments
    };
  }

  /**
   * 댓글 수정
   * @param user
   * @param commentId
   * @param updateCommentDto
   * @returns
   */
  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async update(@UserInfo() user, @Param("id") commentId: number, @Body() updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;
    if (content.trim() === "") {
      throw new BadRequestException({ success: false, message: "공백으로만 쓸 수 없습니다." });
    }

    const updateComment = await this.commentService.update(user.id, commentId, updateCommentDto);
    return {
      success: true,
      message: "okay",
      data: updateComment
    };
  }

  /**
   * 댓글 삭제
   * @param id
   * @returns
   */
  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async remove(@UserInfo() user: User, @Param("id") commentId: number) {
    await this.commentService.remove(user.id, commentId);
    return {
      success: true,
      message: "okay"
    };
  }
}
