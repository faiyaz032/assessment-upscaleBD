import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from 'src/controllers/courses.controller';
import { LessonsController } from 'src/controllers/lessons.controller';
import { UsersController } from 'src/controllers/users.controller';
import { Course } from 'src/entities/course.entity';
import { Event } from 'src/entities/event.entity';
import { Lesson } from 'src/entities/lesson.entity';
import { User } from 'src/entities/user.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'etl_user'),
        password: configService.get<string>('DB_PASS', 'etl_password'),
        database: configService.get<string>('DB_NAME', 'upscaleBD_assessment'),
        entities: [User, Lesson, Course, Event],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Event, Lesson, Course]),
  ],
  controllers: [
    AppController,
    UsersController,
    LessonsController,
    CoursesController,
  ],
  providers: [],
})
export class AppModule {}
