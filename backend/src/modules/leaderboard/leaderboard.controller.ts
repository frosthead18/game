import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@common/decorators/auth-user.decorator';
import { AuthenticatedUser } from '@common/types';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto, LeaderboardQueryDto, SubmitScoreDto } from './leaderboard.dto';

@ApiTags('Leaderboard')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get global leaderboard (optionally filtered by game type)' })
  @ApiResponse({ status: 200, type: [LeaderboardEntryDto] })
  getLeaderboard(@Query() query: LeaderboardQueryDto): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getLeaderboard(query);
  }

  @Post('scores')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Submit a score after completing a game' })
  @ApiResponse({ status: 204, description: 'Score recorded' })
  submitScore(
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: SubmitScoreDto,
  ): Promise<void> {
    return this.leaderboardService.submitScore(user.id, dto);
  }
}
