import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';
import { BillingService } from '../billing/billing.service';
import { GenerateContentDto, GenerateSeoDto, GenerateImageDto } from './dto';
import { ArticlesService } from '../articles/articles.service';

import { WordpressService } from '../wordpress/wordpress.service';

@Injectable()
export class AiService {
    constructor(
        private openAiService: OpenAiService,
        private billingService: BillingService,
        private articlesService: ArticlesService,
        private wordpressService: WordpressService,
    ) { }

    async generateContent(userId: string, dto: GenerateContentDto) {
        // TEMP: Skip billing check for testing without auth
        if (userId !== 'temp-user-id') {
            // Check token balance
            const hasBalance = await this.billingService.checkBalance(userId, 1);
            if (!hasBalance) {
                throw new BadRequestException('Insufficient token balance');
            }
        }

        // Generate content
        let content = await this.openAiService.generateContent(
            dto.originalContent,
            {
                ...dto.options,
                mode: dto.mode,
            } as any,
        );

        // Fetch and inject "Baca Juga" links if we have a site and category
        try {
            console.log(`[AiService] Attempting to inject links for user: ${userId}, category: ${dto.categoryId}`);
            const userIdToUse = userId === 'temp-user-id' ? 'temp-user-id' : userId;
            const sites = await this.wordpressService.getSites(userIdToUse);

            console.log(`[AiService] Found ${sites?.length || 0} sites`);
            if (sites && sites.length > 0) {
                const recentPosts = await this.wordpressService.getRecentPosts(sites[0].id, dto.categoryId);
                console.log(`[AiService] Fetched ${recentPosts?.length || 0} recent posts for category ${dto.categoryId}`);

                if (recentPosts && recentPosts.length > 0) {
                    content = this.injectInternalLinks(content, recentPosts);
                    console.log(`[AiService] Successfully injected ${recentPosts.length} links`);
                } else {
                    console.warn(`[AiService] No recent posts found for category ${dto.categoryId}`);
                }
            }
        } catch (linkError) {
            console.error('[AiService] Failed to inject internal links:', linkError);
        }

        // Deduct tokens (skip for temp user)
        if (userId !== 'temp-user-id') {
            await this.billingService.deductTokens(userId, 1, 'Article generation');
        }

        // Save generated content as a draft article
        let articleId = null;
        try {
            const savedArticle = await this.articlesService.create(userId, {
                title: dto.title || 'AI Generated Article',
                generatedContent: content,
                originalContent: dto.originalContent,
                sourceUrl: dto.sourceUrl || '',
                status: 'DRAFT',
                // Only pass feedItemId if it's a valid UUID
                feedItemId: (dto.feedItemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.feedItemId))
                    ? dto.feedItemId
                    : undefined,
                tokensUsed: 1,
            });
            articleId = savedArticle.id;
        } catch (error) {
            console.error('Failed to auto-save generated article:', error);
            // Don't fail the request if auto-save fails
        }

        return {
            content,
            tokensUsed: 1,
            wordCount: content.split(/\s+/).length,
            articleId,
        };
    }

    private injectInternalLinks(content: string, links: { title: string; link: string }[]): string {
        // Detect content format
        const isHtml = content.includes('</p>') || content.includes('</div>') || content.includes('<br');
        const delimiter = isHtml ? '</p>' : '\n\n';
        const paragraphs = content.split(delimiter);

        console.log(`[AiService] Injecting into ${isHtml ? 'HTML' : 'Markdown/Text'} content with ${paragraphs.length} paragraphs`);

        if (paragraphs.length < 2) {
            // Fallback: just append if too short or not splittable
            const linkList = links.map(l => isHtml
                ? `<p><strong>Baca juga: <a href="${l.link}">${l.title}</a></strong></p>`
                : `\n\n**Baca juga: [${l.title}](${l.link})**\n`).join('');
            return content + linkList;
        }

        const createLinkHtml = (item: { title: string; link: string }) =>
            isHtml
                ? `<p><strong>Baca juga: <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></strong></p>`
                : `\n\n**Baca juga: [${item.title}](${item.link})**\n\n`;

        let newContent = '';
        const totalParas = paragraphs.filter(p => p.trim().length > 0).length;
        const middleIndex = Math.floor(totalParas / 2);
        const lastIndex = totalParas - 1;

        let activeIndex = 0;
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const trimmedP = p.trim();
            const hasContent = trimmedP.length > 0;

            // Link 1: Before first paragraph
            if (hasContent && activeIndex === 0 && links[0]) {
                newContent += createLinkHtml(links[0]);
            }

            newContent += p + (isHtml && hasContent ? '</p>' : (hasContent && i < paragraphs.length - 1 ? '\n\n' : ''));

            if (hasContent) {
                // Link 2: Middle of article
                if (activeIndex === middleIndex && links[1]) {
                    newContent += createLinkHtml(links[1]);
                }

                // Link 3: Before last paragraph
                if (activeIndex === lastIndex - 1 && links[2] && totalParas >= 3) {
                    newContent += createLinkHtml(links[2]);
                }

                activeIndex++;
            }
        }

        return newContent;
    }

    async generateSeo(userId: string, dto: GenerateSeoDto) {
        // SEO generation is included with article generation, no extra token cost
        const seoData = await this.openAiService.generateSeoMetadata(
            dto.title,
            dto.content,
            dto.keywords,
        );

        return seoData;
    }

    async generateImage(userId: string, dto: GenerateImageDto) {
        // Check token balance (image costs 2 tokens)
        const hasBalance = await this.billingService.checkBalance(userId, 2);
        if (!hasBalance) {
            throw new BadRequestException('Insufficient token balance');
        }

        // Generate image
        const imageUrl = await this.openAiService.generateImage(dto.prompt);

        // Deduct tokens
        await this.billingService.deductTokens(userId, 2, 'Image generation');

        return {
            imageUrl,
            tokensUsed: 2,
        };
    }
}
