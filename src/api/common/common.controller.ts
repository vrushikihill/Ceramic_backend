import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CacheInterceptor } from 'src/@core/cache/cache.interceptor';
import { Role } from 'src/api/auth/decorator/role.decorator';
import { JwtGuard } from 'src/api/auth/guard/jwt.guard';
import { RoleGuard } from 'src/api/auth/guard/role.guard';
import { Roles } from 'src/constants/roles';
import { CommonService } from './common.service';

@Controller('common')
@UseInterceptors(CacheInterceptor)
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('upload')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/response-image',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: any) {
    return {
      message: 'File uploaded successfully',
      url: file.filename,
    };
  }

  @Post('upload-multiple')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      storage: diskStorage({
        destination: './public/response-image',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadMultiple(@UploadedFiles() files: any[]) {
    const uploadedFiles = files.map((file) => ({
      filename: file.originalname,
      url: `${process.env.PUBLIC_URL}/response-image/${file.filename}`,
      type: file.mimetype,
    }));

    return {
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    };
  }
}
