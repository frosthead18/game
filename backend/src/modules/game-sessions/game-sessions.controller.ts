import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@common/decorators/auth-user.decorator';
import { AuthenticatedUser } from '@common/types';
import { WithIdParamDto } from '@common/dto';
import { GameSessionsService } from './game-sessions.service';
import { CreateSessionDto, GameSessionDto, JoinSessionDto } from './game-sessions.dto';

@ApiTags('Game Sessions')
@ApiBearerAuth()
@Controller('game-sessions')
export class GameSessionsController {
  constructor(private readonly sessionsService: GameSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all open game sessions' })
  @ApiResponse({ status: 200, type: [GameSessionDto] })
  listSessions(): Promise<GameSessionDto[]> {
    return this.sessionsService.listSessions();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game session' })
  @ApiResponse({ status: 201, type: GameSessionDto })
  createSession(
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: CreateSessionDto,
  ): Promise<GameSessionDto> {
    return this.sessionsService.createSession(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiResponse({ status: 200, type: GameSessionDto })
  getSession(@Param() { id }: WithIdParamDto): Promise<GameSessionDto> {
    return this.sessionsService.getSession(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a game session' })
  @ApiResponse({ status: 201, type: GameSessionDto })
  joinSession(
    @Param() { id }: WithIdParamDto,
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: JoinSessionDto,
  ): Promise<GameSessionDto> {
    return this.sessionsService.joinSession(id, user.id, dto);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a game session' })
  @ApiResponse({ status: 204, description: 'Left session' })
  leaveSession(
    @Param() { id }: WithIdParamDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.sessionsService.leaveSession(id, user.id);
  }
}
