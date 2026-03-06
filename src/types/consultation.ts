export interface ConsultationForm {
    name: string
    email: string
    phone?: string
    company?: string
    type: 'consultation' | 'quote' | 'project'
    projectType?: 'sport' | 'industrial' | 'public' | 'masts' | 'other'
    message: string
    preferredContact: 'email' | 'phone'
    budget?: string
    timeline?: string
}

export interface ConsultationRequest {
    id: number
    name: string
    email: string
    phone?: string
    company?: string
    type: 'consultation' | 'quote' | 'project'
    type_label?: string
    status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
    status_label?: string
    project_type?: 'sport' | 'industrial' | 'public' | 'masts' | 'other'
    project_type_label?: string
    message: string
    preferred_contact?: 'email' | 'phone'
    assigned_to?: number
    assigned_user?: any
    internal_notes?: string
    contacted_at?: string
    created_at: string
    updated_at?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    tags?: string[]
    follow_up_date?: string
    source?: string
    estimated_value?: number
    actual_value?: number
    budget?: string
    timeline?: string
}

export interface ConsultationResponse {
    id: number
    name: string
    email: string
    type: string
    status: string
    created_at: string
}

export interface ConsultationFilters {
    status?: string
    type?: string
    project_type?: string
    priority?: string
    source?: string
    assigned_to?: number
    date_from?: string
    date_to?: string
    search?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
}

export interface ConsultationDashboardStats {
    total_consultations: number
    pending_consultations: number
    in_progress_consultations: number
    completed_consultations: number
    cancelled_consultations: number
    by_type: Record<string, number>
    by_project_type: Record<string, number>
    recent_consultations: ConsultationRequest[]
    avg_response_time_hours?: number
    avg_resolution_time_hours?: number
}
