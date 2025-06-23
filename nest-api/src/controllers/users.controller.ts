// src/controllers/users.controller.ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  @Get(':id/activities')
  async getUserActivities(@Param('id') id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const rows = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.course', 'course')
      .leftJoinAndSelect('event.lesson', 'lesson')
      .where('event.user_id = :id', { id })
      .orderBy('event.timestamp', 'ASC')
      .select([
        'event.event_id',
        'event.timestamp',
        'event.action',
        'event.duration_minutes',
        'course.id',
        'course.title',
        'lesson.id',
        'lesson.title',
      ])
      .getRawMany();

    // Group by course
    const grouped: Record<string, any> = {};

    for (const row of rows) {
      const courseId = row['course_id'];
      if (!grouped[courseId]) {
        grouped[courseId] = {
          course_id: courseId,
          course_title: row['course_title'],
          events: [],
        };
      }

      grouped[courseId].events.push({
        event_id: row['event_event_id'],
        timestamp: row['event_timestamp'],
        action: row['event_action'],
        lesson_id: row['lesson_id'] || null,
        lesson_title: row['lesson_title'] || null,
        duration_minutes: row['event_duration_minutes'] || null,
      });
    }

    return {
      user_id: user.id,
      name: user.name,
      activities: Object.values(grouped),
    };
  }
}
