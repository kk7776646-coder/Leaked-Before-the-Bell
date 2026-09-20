-- ==============================================================================
-- LeakLens Supabase PostgreSQL Production Schema
-- Project: LeakLens (wnemytwacfsekuwfqadr)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'VIEWER',
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);

-- 3. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    monitoring_active BOOLEAN DEFAULT TRUE,
    risk_threshold INTEGER DEFAULT 75,
    alert_sensitivity TEXT DEFAULT 'HIGH',
    auto_ingest_social BOOLEAN DEFAULT FALSE,
    storage_retention_days INTEGER DEFAULT 90,
    chief_examiner_email TEXT DEFAULT 'examiner.security@edu-auth.gov',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Social Sources Table
CREATE TABLE IF NOT EXISTS public.social_sources (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    enabled BOOLEAN DEFAULT FALSE,
    items_detected INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Uploads Table
CREATE TABLE IF NOT EXISTS public.uploads (
    upload_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    supabase_bucket TEXT DEFAULT 'documents',
    supabase_path TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'UPLOADED',
    error TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of TEXT,
    processing_status TEXT DEFAULT 'PENDING',
    processing_error TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Exam Metadata Table
CREATE TABLE IF NOT EXISTS public.exam_metadata (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    exam_date DATE NOT NULL,
    duration TEXT NOT NULL,
    maximum_marks INTEGER NOT NULL,
    sections INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    chief_examiner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'SYSTEM'
);

-- 7. Historical Papers Table
CREATE TABLE IF NOT EXISTS public.historical_papers (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    exam_year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Vectorized & Active',
    file_format TEXT NOT NULL DEFAULT 'PDF',
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    supabase_bucket TEXT DEFAULT 'documents',
    supabase_path TEXT,
    file_size BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    vector_embeddings_count INTEGER DEFAULT 0,
    ocr_snippet TEXT DEFAULT '',
    extracted_text TEXT DEFAULT '',
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'USER_UPLOAD'
);

-- 8. Real Papers Table
CREATE TABLE IF NOT EXISTS public.real_papers (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    supabase_bucket TEXT DEFAULT 'documents',
    supabase_path TEXT,
    file_size BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    exam TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    session TEXT NOT NULL DEFAULT 'Morning',
    exam_date DATE NOT NULL,
    duration TEXT NOT NULL,
    maximum_marks INTEGER NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    extracted_text TEXT DEFAULT '',
    structured_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'USER_UPLOAD'
);

-- 9. Detected Content / Candidates Table
CREATE TABLE IF NOT EXISTS public.detected_content (
    id TEXT PRIMARY KEY,
    upload_id TEXT,
    archive_id TEXT,
    source_document_id TEXT,
    paper_id TEXT,
    page_range JSONB,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    platform TEXT NOT NULL,
    source TEXT NOT NULL,
    external_id TEXT,
    risk TEXT NOT NULL DEFAULT 'LOW',
    risk_score INTEGER NOT NULL DEFAULT 0,
    confidence NUMERIC(5,2) DEFAULT 0,
    processing TEXT NOT NULL DEFAULT 'Completed',
    processing_error TEXT,
    review TEXT NOT NULL DEFAULT 'Needs Verification',
    detected_time TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    storage_path TEXT NOT NULL,
    supabase_bucket TEXT DEFAULT 'documents',
    supabase_path TEXT,
    extracted_text TEXT DEFAULT '',
    extracted_metadata JSONB,
    metadata_source TEXT,
    extraction_summary JSONB,
    extraction_method TEXT,
    ocr_confidence NUMERIC(5,2),
    pages_count INTEGER DEFAULT 1,
    has_associated_alert BOOLEAN DEFAULT FALSE,
    has_associated_review BOOLEAN DEFAULT FALSE,
    alert_id TEXT,
    review_id TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    forensic_results JSONB DEFAULT '[]'::jsonb,
    metadata_comparison JSONB,
    matched_reference_paper JSONB,
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'USER_UPLOAD'
);

-- 10. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    platform TEXT NOT NULL,
    source TEXT NOT NULL,
    matched_paper TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    similarity_score INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'NEW',
    candidate_id TEXT,
    investigation_notes TEXT,
    assigned_to TEXT,
    resolved_at TIMESTAMPTZ,
    resolution_reason TEXT,
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'SYSTEM'
);

-- 11. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    assigned_to TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_test_data BOOLEAN DEFAULT FALSE,
    source_type TEXT DEFAULT 'SYSTEM'
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    "user" TEXT NOT NULL,
    result TEXT NOT NULL,
    details TEXT NOT NULL
);

-- 13. AI Providers Table
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    api_style TEXT NOT NULL,
    base_url TEXT NOT NULL,
    model_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    last_tested_at TIMESTAMPTZ,
    last_error TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_detected_content_status ON public.detected_content(status);
CREATE INDEX IF NOT EXISTS idx_detected_content_risk ON public.detected_content(risk);
CREATE INDEX IF NOT EXISTS idx_detected_content_sha256 ON public.detected_content(sha256);
CREATE INDEX IF NOT EXISTS idx_historical_papers_subject ON public.historical_papers(subject_code);
CREATE INDEX IF NOT EXISTS idx_real_papers_subject ON public.real_papers(subject_code);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_candidate ON public.alerts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reviews_candidate ON public.reviews(candidate_id);

-- Add Default System Settings if missing
INSERT INTO public.system_settings (id, monitoring_active, risk_threshold, alert_sensitivity, chief_examiner_email)
VALUES ('default', TRUE, 75, 'HIGH', 'examiner.security@edu-auth.gov')
ON CONFLICT (id) DO NOTHING;
