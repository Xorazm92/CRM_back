import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GrantRoleDto {
  @ApiProperty({ description: 'User ID to grant role to' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Role name to grant' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}

export class RevokeRoleDto {
  @ApiProperty({ description: 'User ID to revoke role from' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Role name to revoke' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}
