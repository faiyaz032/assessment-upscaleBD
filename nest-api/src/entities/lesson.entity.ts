import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @OneToMany(() => Event, (event) => event.lesson)
  events: Event[];
}
