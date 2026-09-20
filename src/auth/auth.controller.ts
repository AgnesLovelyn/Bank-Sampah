import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('nasabah/register')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
      namaNasabah: { type: 'string' },
      alamat: { type: 'string' },
      telp: { type: 'string' },
      foto: { type: 'string', format: 'binary' },
    },
  },
  })
  @UseInterceptors(FileInterceptor('foto'))
  registerNasabah(
    @Body() dto: RegisterNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.registerNasabah(dto, file);
  }

  @Post('admin/register')
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }
}