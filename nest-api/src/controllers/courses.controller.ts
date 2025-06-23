// src/controllers/courses.controller.ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Event } from '../entities/event.entity';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    private dataSource: DataSource,
  ) {}

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');

    const result = await this.dataSource
      .getRepository(Event)
      .createQueryBuilder('event')
      .leftJoin('event.lesson', 'lesson')
      .where('event.course_id = :id', { id })
      .select('COUNT(*)', 'total_events')
      .addSelect('AVG(event.duration_minutes)', 'average_lesson_duration')
      .getRawOne();

    return {
      course_id: course.id,
      course_title: course.title,
      total_events: parseInt(result.total_events, 10),
      average_lesson_duration: result.average_lesson_duration
        ? parseFloat(parseFloat(result.average_lesson_duration).toFixed(2))
        : null,
    };
  }
}
