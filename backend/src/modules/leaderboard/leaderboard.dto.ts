import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GameType } from '@common/enums';

export class SubmitScoreDto {
  @ApiProperty({ description: 'Game type', enum: GameType })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiProperty({ description: 'Score achieved', example: 1500 })
  @IsInt()
  @Min(0)
  score!: number;

  @ApiPropertyOptional({ description: 'Level reached', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ description: 'Filter by game type', enum: GameType })
  @IsOptional()
  @IsEnum(GameType)
  gameType?: GameType;

  @ApiPropertyOptional({ description: 'Number of top entries to return', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 50;
}

export class LeaderboardEntryDto {
  @ApiProperty() rank!: number;
  @ApiProperty({ format: 'uuid' }) userId!: string;
  @ApiProperty() username!: string;
  @ApiProperty() score!: number;
  @ApiProperty() level!: number;
  @ApiProperty({ enum: GameType }) gameType!: GameType;
  @ApiProperty() playedAt!: Date;
}
