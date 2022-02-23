import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ name: 'parent_userId', nullable: true, type: 'uuid' })
  parentUserId: string;

  @ManyToOne(() => User, u => u.children)
  @JoinColumn({ name: 'parent_user_id', referencedColumnName: 'id' })
  parent: User;

  @OneToMany(() => User, aq => aq.parent)
  children: User[];

  toJson() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      userId: this.userId,
      title: this.title,
    };
  }
}
