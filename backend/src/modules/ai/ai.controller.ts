import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateContentDto, GenerateSeoDto, GenerateImageDto } from './dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
    constructor(private aiService: AiService) { }

    @Post('generate')
    @ApiOperation({ summary: 'Generate rewritten content' })
    async generate(@Body() dto: GenerateContentDto) {
        // TODO: Get userId from session
        const userId = 'temp-user-id'; // Temporary for testing
        return this.aiService.generateContent(userId, dto);
    }

    @Post('generate-seo')
    @ApiOperation({ summary: 'Generate SEO metadata' })
    async generateSeo(@Body() dto: GenerateSeoDto) {
        const userId = 'temp-user-id';
        return this.aiService.generateSeo(userId, dto);
    }

    @Post('generate-image')
    @ApiOperation({ summary: 'Generate featured image with DALL-E' })
    async generateImage(@Body() dto: GenerateImageDto) {
        const userId = 'temp-user-id';
        return this.aiService.generateImage(userId, dto);
    }
}
