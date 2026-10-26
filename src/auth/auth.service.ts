import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateUserToken(user: User) {
    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<{
    access_token: string;
  }> {
    const { email, password } = signUpDto;
    const user = await this.usersService.findOne(email);
    if (user) {
      throw new ConflictException('邮箱已存在');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const createUser = await this.usersService.create({
      email,
      password: hashPassword,
    });
    return this.generateUserToken(createUser);
  }

  async signIn(signInDto: SignInDto): Promise<{
    access_token: string;
  }> {
    const { email, password } = signInDto;
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const compareResult = await bcrypt.compare(password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('密码错误');
    }
    return this.generateUserToken(user);
  }
}
