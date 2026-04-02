import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { SaveProgressDto } from './progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post()
  save(@Body() dto: SaveProgressDto) {
    return this.progressService.saveSession(dto);
  }

  @Get(':childId')
  getForChild(@Param('childId') childId: string) {
    return this.progressService.getSessionsForChild(childId);
  }
}
