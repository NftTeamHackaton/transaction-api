import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController { 
  @Get()
  async getHello() {
    return {version: '1.0'}
  }
}
