import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExercisesService } from './exercises.service';

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get('levels')
  getLevels() {
    return this.exercisesService.getAllLevels();
  }

  @Get(':level')
  getByLevel(@Param('level', ParseIntPipe) level: number) {
    return this.exercisesService.getByLevel(level);
  }
}
