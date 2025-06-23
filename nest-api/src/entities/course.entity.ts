import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('courses')
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @OneToMany(() => Event, (event) => event.course)
  events: Event[];
}
