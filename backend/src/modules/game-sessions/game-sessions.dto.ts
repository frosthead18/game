import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CharacterType, GameType, PlayerSessionStatus, SessionStatus } from '@common/enums';

export class CreateSessionDto {
  @ApiProperty({ description: 'Session display name', example: 'Epic Dungeon Run' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiPropertyOptional({ description: 'Maximum players (2–8)', default: 4 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(8)
  maxPlayers?: number;
}

export class JoinSessionDto {
  @ApiPropertyOptional({ description: 'Character selection', enum: CharacterType })
  @IsOptional()
  @IsEnum(CharacterType)
  characterType?: CharacterType;
}

export class SessionPlayerDto {
  @ApiProperty() userId!: string;
  @ApiProperty() username!: string;
  @ApiProperty({ enum: CharacterType }) characterType!: CharacterType;
  @ApiProperty({ enum: PlayerSessionStatus }) status!: PlayerSessionStatus;
  @ApiProperty() score!: number;
}

export class GameSessionDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() hostUserId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: GameType }) gameType!: GameType;
  @ApiProperty({ enum: SessionStatus }) status!: SessionStatus;
  @ApiProperty() maxPlayers!: number;
  @ApiProperty() playerCount!: number;
  @ApiProperty({ type: [SessionPlayerDto] }) players!: SessionPlayerDto[];
  @ApiProperty() createdAt!: Date;
}
