import { apiClient } from './api'
import type {
    ConsultationForm,
    ConsultationResponse,
    ConsultationRequest,
    ConsultationFilters,
    ConsultationDashboardStats
} from '../types/consultation'

export class ConsultationService {
    // Public consultation submission
    async sendConsultation(data: any): Promise<any> {
        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            message: data.message,
            type: data.type || 'consultation',
            project_type: data.projectType,
            preferred_contact: data.preferredContact,
            source: window.location.pathname
        }

        console.log('ConsultationService: Sending payload:', payload)

        try {
            const response = await apiClient.post('/consultations', payload)
            console.log('ConsultationService: Success response:', response.data)
            return response.data.data || response.data
        } catch (error: any) {
            console.error('Consultation submission failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            })

            // If validation error, throw the errors object
            if (error.response?.status === 422 && error.response.data?.errors) {
                const validationError = new Error('Validation failed') as any
                validationError.errors = error.response.data.errors
                validationError.status = 422
                validationError.message = 'De ingevoerde gegevens zijn niet geldig.' // Generic validation message
                throw validationError
            }

            throw error
        }
    }

    // Contact form submission  
    async sendContact(data: Record<string, unknown>): Promise<Record<string, unknown>> {
        try {
            const response = await apiClient.post('/web-content/contact', data)
            return response.data.data
        } catch (error) {
            console.warn('Contact endpoint not available')
            throw error
        }
    }
}

export const consultationService = new ConsultationService()
