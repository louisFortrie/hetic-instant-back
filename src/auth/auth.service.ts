import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneWithEmail(email);
    if (!user) return null;
    console.log(user, 'user');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid, 'isPasswordValid');

    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User, userPassword: string = null) {
    if (userPassword) {
      user.password = userPassword;
    }
    const isUserValid = await this.validateUser(user.email, user.password);
    console.log(isUserValid, 'isUserValid');

    if (!isUserValid) {
      return new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: {
        name: user.username,
        role: user.role,
      },
    };
    const { password, ...result } = user;
    console.log(user, 'result');

    return {
      userId: isUserValid.id,
      ...result,
      accessToken: this.jwtService.sign(payload, { expiresIn: '60s' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(user: User) {
    const payload = {
      email: user.email,
      sub: {
        name: user.username,
        role: user.role,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
