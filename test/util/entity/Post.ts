import { Category } from './Category';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToMany,
  BaseEntity,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  categories: Category[];

  toJson() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      userId: this.userId,
      title: this.title,
    };
  }
}
