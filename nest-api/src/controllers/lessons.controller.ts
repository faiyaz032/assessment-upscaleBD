// src/controllers/lessons.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Event } from '../entities/event.entity';

@Controller('lessons')
export class LessonsController {
  constructor(private dataSource: DataSource) {}

  @Get('popular')
  async getPopularLessons() {
    const rows = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .leftJoin('event.lesson', 'lesson')
      .where('lesson.id IS NOT NULL')
      .select('lesson.id', 'lesson_id')
      .addSelect('lesson.title', 'lesson_title')
      .addSelect('COUNT(*)', 'event_count')
      .groupBy('lesson.id')
      .addGroupBy('lesson.title')
      .orderBy('event_count', 'DESC')
      .limit(3)
      .getRawMany();

    return rows.map((row) => ({
      lesson_id: row.lesson_id,
      lesson_title: row.lesson_title,
      event_count: parseInt(row.event_count, 10),
    }));
  }
}
