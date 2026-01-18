'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Rss,
    Loader2,
    Sparkles,
    Image as ImageIcon,
    Send,
    RotateCcw,
    Copy,
    Check,
    Settings2,
    Calendar,
    Clock,
    ExternalLink,
    FileText,
    Globe
} from 'lucide-react'


import { WordPressSite, getSites } from '@/lib/sites-store'
import { RssFeed, getFeeds, addFeed, removeFeed } from '@/lib/feeds-store'
import { Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ... (other imports)

export default function ContentLabPage() {
    const [selectedFeed, setSelectedFeed] = useState('')
    const [selectedArticle, setSelectedArticle] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [sourceContent, setSourceContent] = useState('')
    const [generatedContent, setGeneratedContent] = useState('')
    const [generatedTitle, setGeneratedTitle] = useState('')
    // Scraper state
    const [scrapeUrl, setScrapeUrl] = useState('')
    const [isScraping, setIsScraping] = useState(false)
    const [tone, setTone] = useState('professional')
    const [generateImage, setGenerateImage] = useState(true)
    const [copied, setCopied] = useState(false)

    // Publishing state
    const [isPublishing, setIsPublishing] = useState(false)
    const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; link?: string } | null>(null)

    // Scheduling state
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduleTime, setScheduleTime] = useState('')
    const [selectedSite, setSelectedSite] = useState('')
    const [postStatus, setPostStatus] = useState('draft')

    // Sites state
    const [sites, setSites] = useState<WordPressSite[]>([])

    // RSS Feeds state
    const [feeds, setFeeds] = useState<RssFeed[]>([])
    const [articles, setArticles] = useState<any[]>([])
    const [isFetchingRSS, setIsFetchingRSS] = useState(false)
    const [isAddFeedOpen, setIsAddFeedOpen] = useState(false)
    const [newFeedUrl, setNewFeedUrl] = useState('')
    const [newFeedName, setNewFeedName] = useState('')

    useEffect(() => {
        setSites(getSites())
        setFeeds(getFeeds())
    }, [])


    // Derived credentials from selected site
    const getSelectedSiteCredentials = () => {
        // Use selected site or fallback to first available site
        const siteId = selectedSite || sites[0]?.id
        const site = sites.find(s => s.id === siteId)

        if (!site) return null

        return {
            wpUrl: site.url,
            username: site.username,
            appPassword: site.appPassword
        }
    }

    // Fetch content from RSS
    const handleFetchArticles = async (feedId: string) => {
        const feed = feeds.find(f => f.id === feedId)
        if (!feed) return

        setIsFetchingRSS(true)
        setArticles([])
        setSelectedArticle(null)
        setSourceContent('')

        try {
            const response = await fetch('/api/rss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: feed.url }),
            })

            const data = await response.json()
            if (data.success) {
                setArticles(data.items)
            } else {
                console.error('Failed to fetch RSS:', data.error)
                // Fallback or error notification
            }
        } catch (error) {
            console.error('RSS Error:', error)
        } finally {
            setIsFetchingRSS(false)
        }
    }

    const handleAddFeed = () => {
        if (!newFeedName || !newFeedUrl) return

        const newFeed: RssFeed = {
            id: Math.random().toString(36).substring(7),
            name: newFeedName,
            url: newFeedUrl,
            status: 'active',
            lastSynced: new Date().toISOString()
        }

        const updatedFeeds = addFeed(newFeed)
        setFeeds(updatedFeeds)
        setNewFeedName('')
        setNewFeedUrl('')
        setIsAddFeedOpen(false)

        // Auto select and fetch
        setSelectedFeed(newFeed.id)
        handleFetchArticles(newFeed.id)
    }

    const handleRemoveFeed = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        const updatedFeeds = removeFeed(id)
        setFeeds(updatedFeeds)
        if (selectedFeed === id) {
            setSelectedFeed('')
            setArticles([])
        }
    }

    // Effect to fetch when selectedFeed changes
    useEffect(() => {
        if (selectedFeed) {
            handleFetchArticles(selectedFeed)
        }
    }, [selectedFeed])

    const handleSelectArticle = (article: any) => {
        setSelectedArticle(article)
        setIsScanning(true)
        // Simulate scraping the selected article (or use full content if available)
        setTimeout(() => {
            setSourceContent(`# ${article.title}

${article.excerpt || article.description || ''}

Source: ${article.url}

${article.content || ''}`)
            setIsScanning(false)
        }, 1000)
    }

    const handleGenerate = async () => {
        if (!sourceContent) return
        setIsGenerating(true)
        setPublishResult(null)
        // Simulate AI generation
        setTimeout(() => {
            const title = 'Transform Your Workflow: A Complete Guide'
            setGeneratedTitle(title)
            setGeneratedContent(`# ${title}

Discover how modern approaches are revolutionizing the way professionals work. This comprehensive guide explores cutting-edge strategies that deliver measurable results.

## Why This Matters

In today's fast-paced environment, staying ahead requires embracing innovation. Here's what you need to know:

- **Efficiency gains** of up to 85% reported by early adopters
- **Seamless integration** with existing workflows
- **Scalable solutions** that grow with your needs

## The Complete Breakdown

Understanding the fundamentals is crucial for success. Let's dive into the core concepts that drive these improvements.

### Getting Started

Begin by assessing your current processes. Identify bottlenecks and areas where automation could make the biggest impact.

### Implementation Best Practices

Follow these proven strategies:
1. Start small and iterate
2. Measure results consistently
3. Scale what works

## Key Takeaways

- Embrace change as an opportunity
- Focus on measurable outcomes
- Invest in the right tools

Ready to transform your workflow? Start implementing these strategies today.`)
            setIsGenerating(false)
        }, 3000)
    }

    const handleScrape = async () => {
        if (!scrapeUrl) return
        setIsScraping(true)
        setSourceContent('')
        setSelectedArticle(null)
        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: scrapeUrl })
            })
            const result = await response.json()
            if (result.success) {
                const content = result.data.content || result.data.excerpt || ''
                setSourceContent(content)
                setSelectedArticle({
                    id: 'scraped-' + Date.now(),
                    title: result.data.title,
                    url: result.data.url,
                    excerpt: result.data.excerpt || content.substring(0, 150) + '...',
                    publishedAt: result.data.publishedAt
                })
                setGeneratedTitle(result.data.title)
            } else {
                console.error("Scrape failed:", result.error)
            }
        } catch (error) {
            console.error("Scrape error:", error)
        } finally {
            setIsScraping(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Publish to WordPress
    const handlePublishNow = async (status: 'draft' | 'publish') => {
        if (!generatedContent || !generatedTitle) return

        const credentials = getSelectedSiteCredentials()
        if (!credentials) {
            setPublishResult({
                success: false,
                message: 'Silakan hubungkan akun WordPress di halaman Integrations terlebih dahulu.',
            })
            return
        }

        setIsPublishing(true)
        setPublishResult(null)

        try {
            const response = await fetch('/api/wordpress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...credentials,
                    title: generatedTitle,
                    content: generatedContent,
                    status,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setPublishResult({
                    success: true,
                    message: status === 'publish' ? 'Artikel berhasil dipublish!' : 'Draft berhasil disimpan!',
                    link: data.post.link,
                })
            } else {
                setPublishResult({
                    success: false,
                    message: data.error || 'Gagal mempublish artikel',
                })
            }
        } catch (error: any) {
            setPublishResult({
                success: false,
                message: error.message || 'Terjadi kesalahan',
            })
        } finally {
            setIsPublishing(false)
        }
    }

    // Schedule publish
    const handleSchedulePublish = async () => {
        if (!generatedContent || !generatedTitle || !scheduleDate || !scheduleTime) return

        const credentials = getSelectedSiteCredentials()
        if (!credentials) {
            setPublishResult({
                success: false,
                message: 'Silakan pilih situs WordPress.',
            })
            return
        }

        setIsPublishing(true)

        try {
            // Combine date and time for scheduled post
            const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`)

            const response = await fetch('/api/wordpress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...credentials,
                    title: generatedTitle,
                    content: generatedContent,
                    status: 'future',
                    date: scheduledDateTime.toISOString(),
                }),
            })

            const data = await response.json()

            if (data.success) {
                setPublishResult({
                    success: true,
                    message: `Artikel dijadwalkan untuk ${scheduleDate} ${scheduleTime}`,
                    link: data.post.link,
                })
                setIsScheduleOpen(false)
            } else {
                setPublishResult({
                    success: false,
                    message: data.error || 'Gagal menjadwalkan artikel',
                })
            }
        } catch (error: any) {
            setPublishResult({
                success: false,
                message: error.message || 'Terjadi kesalahan',
            })
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Content Lab</h1>
                <p className="text-muted-foreground">
                    Transform RSS feed articles or any web content into unique, SEO-optimized articles.
                </p>
            </div>

            {/* Source Selection Card */}
            <Card className="border-violet-100 dark:border-violet-900 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                            1
                        </span>
                        Choose Source
                    </CardTitle>
                    <CardDescription>
                        Select content to transform from RSS feeds or direct URL
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="rss" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="rss" className="flex items-center gap-2">
                                <Rss className="h-4 w-4" />
                                RSS Feed
                            </TabsTrigger>
                            <TabsTrigger value="url" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Direct URL
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="rss" className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Select RSS Feed Source</Label>
                                        <Dialog open={isAddFeedOpen} onOpenChange={setIsAddFeedOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-violet-600 h-6 px-2 hover:bg-violet-50">
                                                    <Plus className="h-4 w-4 mr-1" /> Add Feed
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add New RSS Feed</DialogTitle>
                                                    <DialogDescription>
                                                        Enter the URL of the RSS feed you want to follow.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Feed Name</Label>
                                                        <Input
                                                            placeholder="e.g. TechCrunch"
                                                            value={newFeedName}
                                                            onChange={(e) => setNewFeedName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Feed URL</Label>
                                                        <Input
                                                            placeholder="https://example.com/feed"
                                                            value={newFeedUrl}
                                                            onChange={(e) => setNewFeedUrl(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAddFeedOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleAddFeed} disabled={!newFeedName || !newFeedUrl}>Add Feed</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Select value={selectedFeed || ''} onValueChange={(val) => {
                                        setSelectedFeed(val)
                                        setSelectedArticle(null)
                                        setSourceContent('')
                                    }}>
                                        <SelectTrigger className="border-violet-200 focus:ring-violet-500">
                                            <SelectValue placeholder="Select a feed..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {feeds.map((feed) => (
                                                <SelectItem key={feed.id} value={feed.id}>
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-medium">{feed.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{feed.url}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {feeds.length === 0 && (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No feeds added</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Article</Label>
                                    <Select value={selectedArticle?.id || ''} onValueChange={(val) => {
                                        const article = articles.find(a => a.id === val)
                                        if (article) handleSelectArticle(article)
                                    }}>
                                        <SelectTrigger disabled={!selectedFeed || isFetchingRSS}>
                                            <SelectValue placeholder={isFetchingRSS ? "Fetching..." : "Choose an article..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {articles.map((article) => (
                                                <SelectItem key={article.id} value={article.id}>
                                                    <span className="truncate block max-w-[400px]">{article.title}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Enter Article URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com/some-article"
                                        value={scrapeUrl}
                                        onChange={(e) => setScrapeUrl(e.target.value)}
                                        className="border-violet-200"
                                    />
                                    <Button
                                        onClick={handleScrape}
                                        disabled={!scrapeUrl || isScraping}
                                        className="bg-violet-600 hover:bg-violet-700"
                                    >
                                        {isScraping ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Fetch'
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    We'll extract the title and content automatically.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Split Screen Editor */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Source Content */}
                <Card className="min-h-[500px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Original Content</CardTitle>
                                <CardDescription>
                                    {selectedArticle ? selectedArticle.title : 'Select a source above'}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">Read-only</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-auto">
                            {isScanning || isScraping ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" />
                                        <p className="mt-2 text-sm text-muted-foreground">Fetching content...</p>
                                    </div>
                                </div>
                            ) : sourceContent ? (
                                <pre className="whitespace-pre-wrap text-sm font-mono">{sourceContent}</pre>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="text-center">
                                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Content will appear here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Generated Content */}
                <Card className="min-h-[500px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">AI Generated</CardTitle>
                                <CardDescription>Unique, rewritten content</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    disabled={!generatedContent}
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={!sourceContent || isGenerating}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={generatedContent}
                            onChange={(e) => setGeneratedContent(e.target.value)}
                            placeholder="AI-generated content will appear here..."
                            className="min-h-[400px] max-h-[600px] resize-none font-mono text-sm"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Configuration & Actions */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Settings */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings2 className="h-5 w-5" />
                            Generation Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="conversational">Conversational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Keywords</Label>
                            <Input placeholder="SEO, content, automation" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Generate AI Image</Label>
                                <p className="text-xs text-muted-foreground">Uses 2 tokens</p>
                            </div>
                            <Button
                                variant={generateImage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setGenerateImage(!generateImage)}
                            >
                                <ImageIcon className="h-4 w-4 mr-1" />
                                {generateImage ? 'On' : 'Off'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Preview */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">SEO Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input defaultValue={generatedTitle || "Article Title"} />
                            <p className="text-xs text-muted-foreground">Characters: {(generatedTitle || "Article Title").length}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea
                                defaultValue="AI generated description..."
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                            onClick={handleGenerate}
                            disabled={!sourceContent || isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Content (1 Token)
                                </>
                            )}
                        </Button>

                        <div className="space-y-2">
                            <Label>Publish Destination</Label>
                            <Select value={selectedSite} onValueChange={setSelectedSite}>
                                <SelectTrigger>
                                    <SelectValue placeholder={sites.length > 0 ? "Select site" : "No sites"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.length > 0 ? (
                                        sites.map(site => (
                                            <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-center text-sm text-muted-foreground">No sites</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {publishResult && (
                            <div className={`p-3 rounded-md text-sm ${publishResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    {publishResult.success ? <Check className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin hidden" />}
                                    <p>{publishResult.message}</p>
                                </div>
                                {publishResult.link && (
                                    <a href={publishResult.link} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 block hover:text-green-800">
                                        View Post
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handlePublishNow('draft')}
                                disabled={!generatedContent || isPublishing}
                            >
                                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
                            </Button>
                            <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                                onClick={() => handlePublishNow('publish')}
                                disabled={!generatedContent || isPublishing}
                            >
                                {isPublishing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Publish
                            </Button>
                        </div>

                        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={!generatedContent || isPublishing}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Post
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Schedule Post</DialogTitle>
                                    <DialogDescription>
                                        Choose when to publish this article to your WordPress site.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>WordPress Site</Label>
                                        <Select value={selectedSite} onValueChange={setSelectedSite}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={sites.length > 0 ? "Select destination site" : "No sites connected"} />
                                            </SelectTrigger>
                                            <SelectContent position="popper" side="bottom" sideOffset={4}>
                                                {sites.length > 0 ? (
                                                    sites.map(site => (
                                                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                                        <p className="mb-2">No connected sites</p>
                                                        <a href="/integrations" className="text-violet-600 hover:underline block">Go to Integrations</a>
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {sites.length === 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                You need to connect a site in the <a href="/integrations" className="underline hover:text-foreground">Integrations page</a> first.
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    className="pl-10"
                                                    value={scheduleDate}
                                                    onChange={(e) => setScheduleDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="time"
                                                    className="pl-10"
                                                    value={scheduleTime}
                                                    onChange={(e) => setScheduleTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Post Status</Label>
                                        <Select defaultValue="publish">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent position="popper" side="bottom" sideOffset={4}>
                                                <SelectItem value="publish">Published</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600"
                                        onClick={handleSchedulePublish}
                                        disabled={!selectedSite || !scheduleDate || !scheduleTime || isPublishing}
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Separator />
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Token Cost: <span className="font-medium text-foreground">{generateImage ? 3 : 1}</span></p>
                            <p>Balance: <span className="font-medium text-amber-600">50 tokens</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
