import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterParentDto, ParentLoginDto, ChildLoginDto, CreateChildDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 10 registration attempts per IP per minute
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('parent/register')
  registerParent(@Body() dto: RegisterParentDto) {
    return this.authService.registerParent(dto.email, dto.password);
  }

  // 10 login attempts per IP per minute
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('parent/login')
  loginParent(@Body() dto: ParentLoginDto) {
    return this.authService.loginParent(dto);
  }

  // 5 PIN attempts per IP per minute — strictest: protects child accounts
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('child/login')
  loginChild(@Body() dto: ChildLoginDto) {
    return this.authService.loginChild(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('child')
  createChild(@Request() req: any, @Body() dto: CreateChildDto) {
    return this.authService.createChild(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('children')
  getChildren(@Request() req: any) {
    return this.authService.getChildren(req.user.sub);
  }
}
