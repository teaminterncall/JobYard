import { z } from "zod"

export const authSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
})

export const jobSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    company: z.string().min(2, "Company name is required."),
    location: z.string().optional().nullable(),
    description: z.string().min(10, "Description should be more detailed."),
    job_type: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Remote"]),
    apply_url: z.string().url("Please provide a valid application URL."),
    expires_at: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
})

export const profileSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters.").optional().nullable(),
    phone: z.string().optional().nullable(),
    college: z.string().optional().nullable(),
    degree: z.string().optional().nullable(),
    graduation_year: z.number().int().min(1950).max(2030).optional().nullable(),
    bio: z.string().optional().nullable(),
})

export const resumeSchema = z.object({
    file_path: z.string().min(1, "File path is required."),
    file_size: z.number().int().positive("File size must be positive.").max(5 * 1024 * 1024, "File size limit is 5MB."),
})

export const resourceSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().min(10, "Description should be more detailed."),
    category: z.enum(["Roadmap", "Interview Prep", "System Design", "General"]),
    link_url: z.string().url("Please provide a valid URL for the resource.").optional().nullable(),
    pdf_path: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
}).refine(data => data.link_url || data.pdf_path, {
    message: "You must provide either a link URL or upload a PDF.",
    path: ["link_url"]
})

export const weekendSessionSchema = z.object({
    name: z.string().min(2, "Session name must be at least 2 characters."),
    description: z.string().min(10, "Description should be more detailed."),
    link_url: z.string().url("Please provide a valid URL for the session."),
    is_active: z.boolean().optional(),
})

export type AuthInput = z.infer<typeof authSchema>
export type JobInput = z.infer<typeof jobSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ResumeInput = z.infer<typeof resumeSchema>
export type ResourceInput = z.infer<typeof resourceSchema>
export type WeekendSessionInput = z.infer<typeof weekendSessionSchema>
