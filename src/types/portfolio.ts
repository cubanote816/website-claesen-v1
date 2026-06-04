export interface LocalizedContent {
    en: string
    nl: string
    fr?: string
}

export interface GalleryImage {
    id: number
    url: string     // Full unified image URL
    thumb: string   // Thumbnail URL
    alt?: string    // Optional alt text
    caption?: string // Optional caption text
}

export interface Project {
    id: number
    slug: string
    title: LocalizedContent | string
    description: LocalizedContent | string // Contains HTML!
    location: LocalizedContent | string
    client: LocalizedContent | string
    year: number
    category: 'sport' | 'industrial' | 'public'
    featured_image_url: string // Main cover image
    gallery: GalleryImage[] // Array of gallery images associated with the project
    gallery_images: GalleryImage[] // Mapped for frontend compatibility
    featured: boolean | number | string
    published: boolean | number | string
    created_at?: string
    updated_at?: string
    // Work-details fields (website-work-details API, may contain HTML)
    work_story?: LocalizedContent | string | null
    challenge?: LocalizedContent | string | null
    solution?: LocalizedContent | string | null
    result?: LocalizedContent | string | null
    detail_gallery?: GalleryImage[] // Secondary execution gallery, always array
}

export interface PortfolioFilters {
    category?: string
    year?: number
    featured?: boolean
    published?: boolean
}

export interface CreateProjectData {
    title: Record<string, string>
    category: string | Record<string, string>
    location: string
    year: number
    client: string
    description: Record<string, string>
    published: boolean
    featured: boolean
    featured_image?: File
    images?: File[]
}

export interface PortfolioDashboard {
    totalProjects: number
    featuredProjects: number
    publishedProjects: number
    unpublishedProjects: number
    recentProjects: Project[]
    projectsByCategory: Record<string, number>
    projectsByYear: Record<number, number>
}

export interface ProjectsResponse {
    projects: Project[]
    filters: {
        categories: Record<string, string[]>
        years: number[]
    }
}

export interface ImageUploadResponse {
    uploaded_images: {
        id: number
        name: string
        file_name: string
        url: string
        thumb_url: string
    }[]
    failed_images: {
        name: string
        error: string
    }[]
}

export interface ImageMetadata {
    alt_text?: string
    caption?: string
    order?: number
}

export interface ReorderRequest {
    image_ids: number[]
}

export interface ReorderProjectsRequest {
    project_ids: number[]
}
