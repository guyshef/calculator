import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { CreateChildDto, ParentLoginDto, ChildLoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerParent(email: string, password: string) {
    const existing = await this.prisma.parent.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const parent = await this.prisma.parent.create({
      data: { email, password: hashed },
    });
    return this.signToken({ sub: parent.id, role: 'parent' });
  }

  async loginParent(dto: ParentLoginDto) {
    const parent = await this.prisma.parent.findUnique({ where: { email: dto.email } });
    if (!parent) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, parent.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken({ sub: parent.id, role: 'parent' });
  }

  async createChild(parentId: string, dto: CreateChildDto) {
    const hashedPin = await bcrypt.hash(dto.pin, 10);
    return this.prisma.child.create({
      data: {
        name: dto.name,
        avatar: dto.avatar,
        pin: hashedPin,
        parentId,
      },
      select: { id: true, name: true, avatar: true, coins: true, currentLevel: true },
    });
  }

  async loginChild(dto: ChildLoginDto) {
    const child = await this.prisma.child.findUnique({ where: { id: dto.childId } });
    if (!child) throw new UnauthorizedException('Child not found');

    const valid = await bcrypt.compare(dto.pin, child.pin);
    if (!valid) throw new UnauthorizedException('Invalid PIN');

    return this.signToken({ sub: child.id, role: 'child' });
  }

  async getChildren(parentId: string) {
    return this.prisma.child.findMany({
      where: { parentId },
      select: { id: true, name: true, avatar: true, coins: true, currentLevel: true },
    });
  }

  private signToken(payload: object) {
    return {
      accessToken: this.jwt.sign(payload),
      expiresIn: 7 * 24 * 60 * 60,
    };
  }
}
