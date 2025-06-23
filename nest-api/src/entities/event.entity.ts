import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column()
  action: string;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.events)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Lesson, (lesson) => lesson.events, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;
}
