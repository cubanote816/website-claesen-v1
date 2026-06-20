import { apiClient, ASSET_URL } from './api'
import type {
    Project,
    PortfolioFilters,
    CreateProjectData,
    PortfolioDashboard,
    ProjectsResponse,
    ImageUploadResponse,
    ImageMetadata,
    ReorderRequest,
    ReorderProjectsRequest,
    GalleryImage
} from '../types/portfolio'

// Static fallback is active unless explicitly disabled (PUBLIC_ENABLE_STATIC_FALLBACK=false).
// It is a safety net only — the API is always attempted first.
const STATIC_FALLBACK_ENABLED =
    import.meta.env.PUBLIC_ENABLE_STATIC_FALLBACK !== 'false'

export class PortfolioService {

    // ── Public helpers (consumed by external components) ─────────────────

    getLocalizedValue(content: any, locale: string = 'nl'): string {
        if (typeof content === 'string') return content
        if (!content) return ''
        return content[locale] || content['en'] || content['nl'] || ''
    }

    formatImageUrl(path: string | null | undefined): string {
        if (!path) return ''
        if (path.startsWith('http')) return path
        if (path.startsWith('/v1-media/')) {
            const baseUrl = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL
            return `${baseUrl}${path}`
        }
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${ASSET_URL}${cleanPath}`
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private buildParams(filters?: PortfolioFilters): URLSearchParams {
        const params = new URLSearchParams()
        if (filters?.category && filters.category !== 'all')
            params.append('filter[category]', filters.category)
        if (filters?.year)
            params.append('filter[year]', filters.year.toString())
        if (filters?.featured)
            params.append('filter[featured]', '1')
        if (filters?.published)
            params.append('filter[published]', '1')
        params.append('per_page', '100')
        return params
    }

    private mapGalleryImages(raw: any): GalleryImage[] {
        const imgs = (Array.isArray(raw.gallery) && raw.gallery.length > 0)
            ? raw.gallery
            : (Array.isArray(raw.api_gallery) ? raw.api_gallery : [])
        return imgs.map((img: any) => ({
            id: img.id,
            url: this.formatImageUrl(img.url || img.original_url || img.optimized || img.original),
            thumb: this.formatImageUrl(img.thumb || img.thumb_url || img.optimized || img.url || img.original_url || img.original),
            alt: img.alt || '',
            caption: img.caption || ''
        }))
    }

    private mapDetailGallery(raw: any): GalleryImage[] {
        if (!Array.isArray(raw.detail_gallery) || raw.detail_gallery.length === 0) return []
        return raw.detail_gallery.map((img: any) => ({
            id: img.id,
            url: this.formatImageUrl(img.url || img.optimized || img.original_url || img.original || ''),
            thumb: this.formatImageUrl(img.thumb || img.thumb_url || img.optimized || img.url || img.original_url || img.original || ''),
            alt: img.alt || '',
            caption: img.caption || ''
        })).filter((img: any) => img.url)
    }

    private mapProject(raw: any): Project {
        const fi = raw.featured_image_url || raw.api_featured_image_url || raw.featured_image
        const fiStr = typeof fi === 'string' ? fi : (fi?.optimized || fi?.original || fi?.url || fi?.thumb || '')
        return {
            ...raw,
            featured_image_url: this.formatImageUrl(fiStr),
            gallery_images: this.mapGalleryImages(raw),
            detail_gallery: this.mapDetailGallery(raw),
        }
    }

    private extractRawFromApiResponse(response: any): { raw: any[], filterData: any } {
        const outer = response.data.data ?? response.data
        const raw = Array.isArray(outer?.data) ? outer.data : (Array.isArray(outer) ? outer : [])
        return { raw, filterData: Array.isArray(outer) ? null : outer }
    }

    private async loadStaticFallback(): Promise<any[]> {
        if (!STATIC_FALLBACK_ENABLED) return []
        try {
            const baseUrl = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL
            let res = await fetch(`${baseUrl}/v1-media/projects-static.json`)
            if (!res.ok) res = await fetch('/v1-media/projects-static.json')
            if (!res.ok) return []
            const data = await res.json()
            const projects = data.projects || data.data || data || []
            return Array.isArray(projects) ? projects : []
        } catch {
            return []
        }
    }

    private applyLocalFilters(projects: any[], filters?: PortfolioFilters): any[] {
        let result = projects
        if (filters?.category && filters.category !== 'all') {
            result = result.filter((p: any) =>
                (typeof p.category === 'string' ? p.category : '') === filters!.category
            )
        }
        if (filters?.year) {
            const target = filters.year
            result = result.filter((p: any) => {
                const y = p.year ?? new Date(p.created_at || '').getFullYear()
                return y === target
            })
        }
        if (filters?.featured) {
            result = result.filter((p: any) => Boolean(p.featured || p.is_featured))
        }
        return result
    }

    // ── Public methods ────────────────────────────────────────────────────

    // Not in route:list — kept for interface compatibility, fails gracefully.
    async getWebsiteInfo(): Promise<any> {
        try {
            const response = await apiClient.get('/web-content')
            return response.data.data
        } catch (error) {
            console.warn('Website info endpoint not available')
            throw error
        }
    }

    // Not in route:list — kept for interface compatibility, fails gracefully.
    async getAboutInfo(): Promise<any> {
        try {
            const response = await apiClient.get('/web-content/about')
            return response.data.data
        } catch (error) {
            console.warn('About info endpoint not available')
            throw error
        }
    }

    async getProjects(filters?: PortfolioFilters, locale: string = 'nl'): Promise<ProjectsResponse> {
        const params = this.buildParams(filters)

        // API-first — return API result even when empty; retry once on cancel/network
        for (let attempt = 0; attempt <= 1; attempt++) {
            try {
                const response = await apiClient.get(`/projects?${params}`)
                const { raw, filterData } = this.extractRawFromApiResponse(response)
                return {
                    projects: raw.map(p => this.mapProject(p)),
                    filters: {
                        categories: filterData?.filters?.categories || {},
                        years: Array.isArray(filterData?.filters?.years) ? filterData.filters.years : []
                    }
                }
            } catch (err: any) {
                // No HTTP response = canceled or network error → retry once after transition settles
                if (attempt === 0 && !err?.response) {
                    await new Promise(r => setTimeout(r, 400))
                    continue
                }
                break
            }
        }

        // Static fallback
        const cached = await this.loadStaticFallback()
        const filtered = this.applyLocalFilters(cached, filters)
        return {
            projects: filtered.map(p => this.mapProject(p)),
            filters: { categories: {}, years: [] }
        }
    }

    async getFeaturedProjects(): Promise<Project[]> {
        // API-first — return API result even when empty; only fall through on error
        try {
            const response = await apiClient.get('/projects?filter[featured]=1')
            const { raw } = this.extractRawFromApiResponse(response)
            return raw.map(p => this.mapProject(p))
        } catch {
            // fall through to static fallback
        }

        // Static fallback — filter featured locally
        const cached = await this.loadStaticFallback()
        return this.applyLocalFilters(cached, { featured: true })
            .map(p => this.mapProject(p))
    }

    async getCategories(): Promise<Record<string, string[]>> {
        // API-first — only use result if it's a plain object (not array)
        try {
            const response = await apiClient.get('/projects/categories')
            const data = response.data.data || response.data || {}
            if (!Array.isArray(data) && typeof data === 'object') return data
        } catch {
            // fall through to static fallback
        }

        // Static fallback — derive categories from project list
        const cached = await this.loadStaticFallback()
        return cached.reduce((acc: Record<string, string[]>, p: any) => {
            const cat = typeof p.category === 'string' ? p.category : null
            if (cat && !acc[cat]) acc[cat] = []
            return acc
        }, {})
    }

    async getYears(): Promise<number[]> {
        // API-first — return API result even when empty; only fall through on error
        try {
            const response = await apiClient.get('/projects/years')
            const data = response.data.data || response.data || []
            if (Array.isArray(data)) return data
        } catch {
            // fall through to static fallback
        }

        // Static fallback — derive years from project list
        const cached = await this.loadStaticFallback()
        const years = cached
            .map((p: any) => p.year ?? new Date(p.created_at || '').getFullYear())
            .filter((y: any): y is number => typeof y === 'number' && !isNaN(y))
        return [...new Set(years)].sort((a, b) => b - a)
    }

    async getProject(slug: string): Promise<Project> {
        // API-first
        try {
            const response = await apiClient.get(`/projects/${slug}`)
            const project = response.data.data || response.data
            return this.mapProject(project)
        } catch {
            // fall through to static fallback
        }

        // Static fallback — find by slug
        const cached = await this.loadStaticFallback()
        const found = cached.find((p: any) => p.slug === slug)
        if (found) return this.mapProject(found)
        throw new Error('Project not found')
    }

    // Redirected — original routes (/web-content/portfolio/...) not in route:list.
    // Delegates to getProjects() with the appropriate filter.
    async getProjectsByCategory(category: string): Promise<Project[]> {
        const result = await this.getProjects({ category })
        return result.projects
    }

    async getProjectsByYear(year: number): Promise<Project[]> {
        const result = await this.getProjects({ year })
        return result.projects
    }
}

export const portfolioService = new PortfolioService()
