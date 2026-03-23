export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            jobs: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    company: string
                    location: string | null
                    description: string
                    job_type: string
                    apply_url: string
                    expires_at: string | null
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    company: string
                    location?: string | null
                    description: string
                    job_type: string
                    apply_url: string
                    expires_at?: string | null
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    company?: string
                    location?: string | null
                    description?: string
                    job_type?: string
                    apply_url?: string
                    expires_at?: string | null
                    is_active?: boolean
                }
            }
            resumes: {
                Row: {
                    id: string
                    user_id: string
                    file_path: string
                    file_size: number
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    file_path: string
                    file_size: number
                    uploaded_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    file_path?: string
                    file_size?: number
                    uploaded_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    full_name: string | null
                    phone: string | null
                    college: string | null
                    degree: string | null
                    graduation_year: number | null
                    bio: string | null
                    role: string
                }
                Insert: {
                    id: string
                    created_at?: string
                    full_name?: string | null
                    phone?: string | null
                    college?: string | null
                    degree?: string | null
                    graduation_year?: number | null
                    bio?: string | null
                    role?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    full_name?: string | null
                    phone?: string | null
                    college?: string | null
                    degree?: string | null
                    graduation_year?: number | null
                    bio?: string | null
                    role?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
