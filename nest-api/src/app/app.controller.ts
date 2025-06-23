import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth(): { message: string } {
    return { message: 'Server is alive' };
  }
}
