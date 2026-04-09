# JobYard

JobYard is a comprehensive job board and application tracking platform built with Next.js and Supabase. It provides both a public-facing job board and a suite of personal tools for candidates to manage their hiring journey.

## Features

### Authentication & User Management
* **Single Sign-On (SSO):** A streamlined login page exclusively running on Google OAuth. 
* **Automated Profile Generation:** Background database triggers automatically create and link your user data (such as emails) the moment a new user logs in.
* **User Profiles:** A dashboard where users can view and update their personal details, phone numbers, college information, degree, graduation year, and a customized bio.

### Job Board & Administration
* **Public Job Board:** The main interface allowing users to view all available open roles.
* **Admin Dashboard:** An administrative control panel that allows privileged users to manage job postings:
  * Create new job postings (Company, Location, Description, Types).
  * Edit existing job listings.
  * Delete postings securely.
  * Toggle listings to inactive or set expiration dates. 

### Resume Management System
* **Resume Uploads:** Users can securely upload their resumes to their account.
* **Format & Size Protection:** Built-in safeguards ensure users only upload valid document types (PDF/DOCX) and keep them under a 5MB threshold.
* **Secure Storage:** Uses Supabase Storage to keep resumes organized and handles generating secure download URLs.

### Job Applications Tracker
* **Tracking Dashboard:** A customized tracker where users can log applications they submit externally or natively.
* **Application Metadata:** Allows tracking of specific details per application, such as Company Name, Role, Platform, Application Links, Status tracking (Applied/Interviewing/Rejected), and custom personal Notes.

## Tech Stack
* **Framework:** Next.js App Router
* **Database & File Storage:** Supabase (combining Postgres SQL, Auth, and Storage Buckets)
* **Security:** Strict user isolation and automatic cascading data cleanup via PostgreSQL foreign key constraints.


