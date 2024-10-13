import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, Index } from "typeorm";
import { User } from "./User.entity";
import { Post } from "./Post.entity";

@Entity("comments")
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    content: string;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => Post, (post) => post.comments)
    @JoinColumn({ name: 'postId' })
    post: Post;
  
    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: 'userId' })
    user: User;
}
