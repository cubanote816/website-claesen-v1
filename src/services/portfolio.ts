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

export class PortfolioService {
    // Website Information
    async getWebsiteInfo(): Promise<any> {
        try {
            const response = await apiClient.get('/web-content')
            return response.data.data
        } catch (error) {
            console.warn('Website info endpoint not available')
            throw error
        }
    }

    async getAboutInfo(): Promise<any> {
        try {
            const response = await apiClient.get('/web-content/about')
            return response.data.data
        } catch (error) {
            console.warn('About info endpoint not available')
            throw error
        }
    }
    // Helper for localization
    getLocalizedValue(content: any, locale: string = 'nl'): string {
        if (typeof content === 'string') return content
        if (!content) return ''
        return content[locale] || content['en'] || content['nl'] || ''
    }

    // Helper to format image URLs
    formatImageUrl(path: string | null | undefined): string {
        if (!path) return ''
        if (path.startsWith('http')) return path
        // Remove leading slash if exists
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${ASSET_URL}${cleanPath}`
    }

    // Public routes - with fallback for missing endpoints
    async getProjects(filters?: PortfolioFilters, locale: string = 'nl'): Promise<ProjectsResponse> {
        try {
            // Static Cache Implementation
            if (import.meta.env.PUBLIC_USE_STATIC_CACHE === 'true') {
                try {
                    // @ts-ignore
                    const cachedData = await import('../data/projects-cache.json');
                    const allProjects = cachedData.default?.projects || cachedData.projects || [];

                    // Simple client-side filtering since we have all data
                    let filtered = allProjects;
                    if (filters?.category && filters.category !== 'all') {
                        filtered = filtered.filter((p: any) => {
                            const cat = typeof p.category === 'string' ? p.category : '';
                            return cat === filters.category;
                        });
                    }
                    const mappedProjects = filtered.map((project: any) => ({
                        ...project,
                        featured_image_url: this.formatImageUrl(project.featured_image_url || project.api_featured_image_url || project.featured_image),
                        gallery_images: ((Array.isArray(project.gallery) && project.gallery.length > 0) ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : [])).map((img: any) => ({
                            id: img.id,
                            url: this.formatImageUrl(img.url || img.original_url),
                            thumb: this.formatImageUrl(img.thumb || img.url || img.thumb_url || img.original_url),
                            alt: img.alt || '',
                            caption: img.caption || ''
                        })),
                    }))

                    // Start of API fallback or normal execution
                    return {
                        projects: mappedProjects,
                        filters: { categories: {}, years: [] }
                    };
                } catch (e) {
                    console.warn('⚠️ Static cache enabled but file not found. Falling back to API.');
                }
            }

            const params = new URLSearchParams()
            if (filters?.category && filters.category !== 'all') params.append('filter[category]', filters.category)
            if (filters?.year) params.append('filter[year]', filters.year.toString())
            if (filters?.featured) params.append('filter[featured]', '1')

            params.append('per_page', '12')

            console.log('portfolioService.getProjects: Making request to', `/projects?${params}`)
            const response = await apiClient.get(`/projects?${params}`)

            const data = response.data.data || response.data
            const projects = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])

            const mappedProjects = projects.map((project: any) => ({
                ...project,
                featured_image_url: this.formatImageUrl(project.featured_image_url || project.api_featured_image_url || project.featured_image),
                gallery_images: ((Array.isArray(project.gallery) && project.gallery.length > 0) ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : [])).map((img: any) => ({
                    id: img.id,
                            url: this.formatImageUrl(img.url || img.original_url),
                            thumb: this.formatImageUrl(img.thumb || img.url || img.thumb_url || img.original_url),
                    alt: img.alt || '',
                    caption: img.caption || ''
                })),
            }))

            return {
                projects: mappedProjects,
                filters: {
                    categories: data?.filters?.categories || {},
                    years: Array.isArray(data?.filters?.years) ? data.filters.years : []
                }
            }
        } catch (error) {
            console.error('Portfolio endpoint failed:', error)
            return {
                projects: [],
                filters: { categories: {}, years: [] }
            }
        }
    }

    async getFeaturedProjects(): Promise<Project[]> {
        try {
            const response = await apiClient.get('/projects?filter[featured]=1')
            const data = response.data.data || response.data
            const projects = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])

            return projects.map((project: any) => ({
                ...project,
                featured_image_url: this.formatImageUrl(project.featured_image_url || project.api_featured_image_url || project.featured_image),
                gallery_images: ((Array.isArray(project.gallery) && project.gallery.length > 0) ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : [])).map((img: any) => ({
                    id: img.id,
                    url: this.formatImageUrl(img.url || img.original_url),
                    thumb: this.formatImageUrl(img.thumb || img.url || img.thumb_url || img.original_url),
                    alt: img.alt || '',
                    caption: img.caption || ''
                })),
            }))
        } catch (error) {
            console.error('Featured projects endpoint failed:', error)
            return []
        }
    }

    async getCategories(): Promise<Record<string, string[]>> {
        try {
            const response = await apiClient.get('/projects/categories')
            return response.data.data || response.data || {}
        } catch (error) {
            console.error('Categories endpoint failed:', error)
            return {}
        }
    }

    async getYears(): Promise<number[]> {
        try {
            const response = await apiClient.get('/projects/years')
            return response.data.data || response.data || []
        } catch (error) {
            console.error('Years endpoint failed:', error)
            return []
        }
    }

    async getProjectsByCategory(category: string): Promise<Project[]> {
        try {
            const response = await apiClient.get(`/web-content/portfolio/category/${category}`)
            const data = response.data.data
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.warn('Projects by category endpoint not available')
            return []
        }
    }

    async getProjectsByYear(year: number): Promise<Project[]> {
        try {
            const response = await apiClient.get(`/web-content/portfolio/year/${year}`)
            const data = response.data.data
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.warn('Projects by year endpoint not available')
            return []
        }
    }

    async getProject(slug: string): Promise<Project> {
        const response = await apiClient.get(`/projects/${slug}`)
        const project = response.data.data || response.data

        return {
            ...project,
            featured_image_url: this.formatImageUrl(project.featured_image_url || project.api_featured_image_url || project.featured_image),
            gallery_images: ((Array.isArray(project.gallery) && project.gallery.length > 0) ? project.gallery : (Array.isArray(project.api_gallery) ? project.api_gallery : [])).map((img: any) => ({
                id: img.id,
                url: this.formatImageUrl(img.url || img.original_url),
                thumb: this.formatImageUrl(img.thumb || img.url || img.thumb_url || img.original_url),
                alt: img.alt || '',
                caption: img.caption || ''
            })),
        }
    }
}

export const portfolioService = new PortfolioService()
