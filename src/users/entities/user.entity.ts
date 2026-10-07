import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  @Exclude()
  yandexId: string | null;

  @Column({ unique: true })
  username: string;

  @Column({ length: 200, default: 'Пока ничего не рассказал о себе' })
  about: string;

  @Column({
    default: 'https://i.pravatar.cc/300',
    length: 500,
  })
  avatar: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
