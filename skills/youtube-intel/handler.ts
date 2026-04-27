import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../lib/auth';
import { validateInput } from '../../lib/validation';
import { successResponse, errorResponse } from '../../lib/response';

/**
 * youtube-intel — Pure Logic Skill
 * YouTube content intelligence and competitive monitoring.
 *
 * Two modes:
 *   - monitoring: Track specific channels, compare with history
 *   - discovery: Scan market categories for content opportunities (6-step workflow)
 *
 * Type: Pure logic processing (no external paid API dependencies)
 * Source: https://github.com/kennyzir/Claw0X_skills
 */

// ─── Types ───────────────────────────────────────────────────

type Mode = 'monitoring' | 'discovery';
type ContentType = 'review' | 'tutorial' | 'list' | 'comparison' | 'news' | 'opinion' | 'other';
type CompetitionLevel = 'red' | 'yellow' | 'green' | 'blank';

interface VideoRecord {
  title: string;
  video_id: string;
  url: string;
  channel_name: string;
  channel_handle: string;
  views: number;
  views_display: string;
  published_days_ago: number;
  published_display: string;
  duration: string;
  is_short: boolean;
  sub_category?: string;
  content_type?: ContentType;
  is_viral: boolean;
  is_emerging: boolean;
}

interface ChannelProfile {
  name: string;
  handle: string;
  videos_in_results: number;
  avg_views: number;
  max_views: number;
  latest_video_days_ago: number;
  content_type_distribution: Record<string, number>;
  is_established: boolean;
  is_emerging: boolean;
}

interface CompetitionAssessment {
  sub_category: string;
  total_videos: number;
  unique_channels: number;
  avg_views: number;
  top_video_views: number;
  established_channels: number;
  competition_level: CompetitionLevel;
  top3_traffic_share: number;
}

interface Opportunity {
  type: 'differentiation' | 'niche' | 'format' | 'timing' | 'data';
  sub_category: string;
  description: string;
  evidence: string[];
  suggested_angle: string;
  risk: string;
  priority: number;
}

interface DiscoveryInput {
  mode: 'discovery';
  query: string;
  options?: {
    subcategories?: string[];
    max_results?: number;
  };
}

interface MonitoringInput {
  mode: 'monitoring';
  query: string;
  options?: {
    history?: VideoRecord[];
  };
}

type SkillInput = DiscoveryInput | MonitoringInput;

// ─── Helpers ─────────────────────────────────────────────────

function parseViews(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/,/g, '').trim();
  const mMatch = cleaned.match(/([\d.]+)\s*[Mm]/);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1_000_000);
  const kMatch = cleaned.match(/([\d.]+)\s*[Kk]/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1_000);
  const wanMatch = cleaned.match(/([\d.]+)\s*万/);
  if (wanMatch) return Math.round(parseFloat(wanMatch[1]) * 10_000);
  const numMatch = cleaned.match(/(\d+)/);
  return numMatch ? parseInt(numMatch[1], 10) : 0;
}

function parsePublishedDays(text: string): number {
  if (!text) return 0;
  const hourMatch = text.match(/(\d+)\s*(hour|小时)/i);
  if (hourMatch) return Math.round(parseInt(hourMatch[1], 10) / 24);
  const dayMatch = text.match(/(\d+)\s*(day|天)/i);
  if (dayMatch) return parseInt(dayMatch[1], 10);
  const weekMatch = text.match(/(\d+)\s*(week|周)/i);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7;
  const monthMatch = text.match(/(\d+)\s*(month|个月)/i);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30;
  const yearMatch = text.match(/(\d+)\s*(year|年)/i);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 365;
  return 0;
}

function decomposeCategory(query: string): string[] {
  const broad: Record<string, string[]> = {
    'ai': ['AI image tools', 'AI coding tools', 'AI writing tools', 'AI video tools', 'AI audio tools', 'AI productivity tools'],
    'ai tools': ['AI image generation', 'AI coding assistants', 'AI writing tools', 'AI video generation', 'AI audio tools'],
    'content creation': ['YouTube growth', 'video editing', 'thumbnail design', 'scriptwriting', 'content strategy'],
    'ecommerce': ['dropshipping', 'Amazon FBA', 'Shopify stores', 'print on demand', 'digital products'],
    'productivity': ['note-taking apps', 'project management', 'automation tools', 'time management', 'AI productivity'],
  };
  const lower = query.toLowerCase().trim();
  return broad[lower] || [query];
}

function aggregateChannels(videos: VideoRecord[]): ChannelProfile[] {
  const map: Record<string, { videos: VideoRecord[]; views: number[] }> = {};
  for (const v of videos) {
    const key = v.channel_handle || v.channel_name;
    if (!map[key]) map[key] = { videos: [], views: [] };
    map[key].videos.push(v);
    map[key].views.push(v.views);
  }
  return Object.entries(map).map(([handle, data]) => {
    const avg = data.views.reduce((a, b) => a + b, 0) / data.views.length;
    const max = Math.max(...data.views);
    const latest = Math.min(...data.videos.map(v => v.published_days_ago));
    const typeDist: Record<string, number> = {};
    for (const v of data.videos) {
      const ct = v.content_type || 'other';
      typeDist[ct] = (typeDist[ct] || 0) + 1;
    }
    return {
      name: data.videos[0].channel_name,
      handle,
      videos_in_results: data.videos.length,
      avg_views: Math.round(avg),
      max_views: max,
      latest_video_days_ago: latest,
      content_type_distribution: typeDist,
      is_established: data.videos.length >= 3 && avg > 200_000,
      is_emerging: data.videos.length <= 2 && max > 500_000,
    };
  });
}

function assessCompetition(videos: VideoRecord[], channels: ChannelProfile[], subCategory: string): CompetitionAssessment {
  const views = videos.map(v => v.views).sort((a, b) => b - a);
  const totalViews = views.reduce((a, b) => a + b, 0);
  const avg = totalViews / (views.length || 1);
  const top = views[0] || 0;
  const top3 = views.slice(0, 3).reduce((a, b) => a + b, 0);
  const established = channels.filter(c => c.is_established).length;

  let level: CompetitionLevel = 'blank';
  if (views.length < 5) level = 'blank';
  else if (top > 1_000_000 && established > 5) level = 'red';
  else if (top > 300_000 || established >= 2) level = 'yellow';
  else level = 'green';

  return {
    sub_category: subCategory,
    total_videos: videos.length,
    unique_channels: channels.length,
    avg_views: Math.round(avg),
    top_video_views: top,
    established_channels: established,
    competition_level: level,
    top3_traffic_share: totalViews > 0 ? Math.round((top3 / totalViews) * 100) : 0,
  };
}

function findOpportunities(videos: VideoRecord[], channels: ChannelProfile[], competition: CompetitionAssessment): Opportunity[] {
  const opps: Opportunity[] = [];
  const subCat = competition.sub_category;

  // Format opportunity: check if tutorials are scarce
  const typeCounts: Record<string, number> = {};
  for (const v of videos) {
    const ct = v.content_type || 'other';
    typeCounts[ct] = (typeCounts[ct] || 0) + 1;
  }
  if ((typeCounts['tutorial'] || 0) < 3 && videos.length > 5) {
    opps.push({
      type: 'format',
      sub_category: subCat,
      description: 'Tutorial content is scarce in this subcategory',
      evidence: [`Only ${typeCounts['tutorial'] || 0} tutorial videos found out of ${videos.length}`],
      suggested_angle: 'Step-by-step tutorial or beginner guide',
      risk: 'May require more production effort',
      priority: 2,
    });
  }

  // Timing opportunity: recent emerging videos
  const emerging = videos.filter(v => v.is_emerging);
  if (emerging.length >= 3) {
    opps.push({
      type: 'timing',
      sub_category: subCat,
      description: `Market is heating up — ${emerging.length} new videos in last 30 days`,
      evidence: emerging.slice(0, 3).map(v => `"${v.title}" (${v.views} views, ${v.published_days_ago}d ago)`),
      suggested_angle: 'Ride the wave with timely content',
      risk: 'Window may close quickly',
      priority: 1,
    });
  }

  // Niche opportunity: low competition
  if (competition.competition_level === 'green') {
    opps.push({
      type: 'niche',
      sub_category: subCat,
      description: 'Low competition — opportunity to establish early presence',
      evidence: [`Top video only ${competition.top_video_views} views`, `${competition.established_channels} established channels`],
      suggested_angle: 'Comprehensive coverage to become the go-to channel',
      risk: 'Low competition may also mean low demand — validate first',
      priority: 1,
    });
  }

  // Differentiation opportunity: high competition but gaps exist
  if (competition.competition_level === 'red' && (typeCounts['comparison'] || 0) < 2) {
    opps.push({
      type: 'differentiation',
      sub_category: subCat,
      description: 'High competition but comparison/data-driven content is rare',
      evidence: [`Only ${typeCounts['comparison'] || 0} comparison videos`, `${competition.established_channels} established channels dominate`],
      suggested_angle: 'Data-driven comparison or unique vertical angle',
      risk: 'Requires strong differentiation to break through',
      priority: 3,
    });
  }

  return opps.sort((a, b) => a.priority - b.priority);
}

function extractViralPatterns(videos: VideoRecord[]) {
  return videos
    .filter(v => v.is_viral)
    .slice(0, 5)
    .map(v => {
      const title = v.title;
      const hasNumber = /\d/.test(title);
      const hasStrongWord = /best|top|vs|review|free|worst|honest|truth/i.test(title);
      const hasYear = /202[4-9]/.test(title);
      return {
        video_id: v.video_id,
        title: v.title,
        views: v.views,
        published_days_ago: v.published_days_ago,
        channel: v.channel_name,
        title_features: { hasNumber, hasStrongWord, hasYear, length: title.length },
        lessons: [
          hasNumber ? 'Uses numbers in title (listicle format)' : null,
          hasStrongWord ? 'Uses strong/emotional words' : null,
          hasYear ? 'Includes current year (evergreen SEO)' : null,
          title.length < 60 ? 'Concise title (under 60 chars)' : 'Long title — may get truncated',
        ].filter(Boolean),
      };
    });
}

// ─── Main Handler ────────────────────────────────────────────

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  const startTime = Date.now();

  const validation = validateInput(req.body, {
    mode: { type: 'string', required: true },
    query: { type: 'string', required: true },
  });

  if (!validation.valid) {
    return errorResponse(res, 'Invalid input', 400, validation.errors);
  }

  const { mode, query, options } = req.body as SkillInput & { options?: any };

  if (mode !== 'monitoring' && mode !== 'discovery') {
    return errorResponse(res, 'Invalid mode. Use "monitoring" or "discovery"', 400);
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return errorResponse(res, 'Missing required field: query', 400);
  }

  try {
    if (mode === 'discovery') {
      // Discovery mode: decompose category, build search strategy, analyze
      const subcategories = options?.subcategories || decomposeCategory(query);
      const allVideos: VideoRecord[] = options?.videos || [];
      const results: any[] = [];

      for (const subCat of subcategories) {
        // Filter videos for this subcategory (if provided)
        const subVideos = allVideos.filter(v => v.sub_category === subCat || !v.sub_category);
        const channels = aggregateChannels(subVideos);
        const competition = assessCompetition(subVideos, channels, subCat);
        const opportunities = findOpportunities(subVideos, channels, competition);
        const viralPatterns = extractViralPatterns(subVideos);

        results.push({
          sub_category: subCat,
          competition,
          channels: channels.slice(0, 10),
          opportunities,
          viral_patterns: viralPatterns,
          video_count: subVideos.length,
        });
      }

      const allOpportunities = results
        .flatMap(r => r.opportunities)
        .sort((a, b) => a.priority - b.priority);

      return successResponse(res, {
        mode: 'discovery',
        query,
        subcategories,
        subcategory_results: results,
        opportunities: allOpportunities,
        summary: {
          total_subcategories: subcategories.length,
          total_videos_analyzed: allVideos.length,
          competition_overview: results.map(r => ({
            sub_category: r.sub_category,
            level: r.competition.competition_level,
          })),
          top_opportunity: allOpportunities[0] || null,
        },
        _meta: {
          skill: 'youtube-intel',
          mode: 'discovery',
          latency_ms: Date.now() - startTime,
        },
      });
    } else {
      // Monitoring mode: analyze channel data
      const channelHandle = query.startsWith('@') ? query : `@${query}`;
      const history = options?.history || [];
      const currentVideos: VideoRecord[] = options?.videos || [];
      const channels = aggregateChannels(currentVideos);
      const profile = channels[0] || null;

      // Compare with history
      const newVideos = currentVideos.filter(
        v => !history.some((h: VideoRecord) => h.video_id === v.video_id)
      );

      return successResponse(res, {
        mode: 'monitoring',
        channel: channelHandle,
        profile,
        new_videos: newVideos,
        total_current: currentVideos.length,
        total_history: history.length,
        changes: {
          new_video_count: newVideos.length,
          avg_views_current: profile?.avg_views || 0,
        },
        _meta: {
          skill: 'youtube-intel',
          mode: 'monitoring',
          latency_ms: Date.now() - startTime,
        },
      });
    }
  } catch (error: any) {
    console.error('youtube-intel error:', error);
    return errorResponse(res, error.message || 'Internal processing error', 500);
  }
}

export default authMiddleware(handler);
