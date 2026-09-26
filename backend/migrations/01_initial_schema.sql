CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'coordinator')) DEFAULT 'student',
    student_section TEXT CHECK (student_section IN ('S1', 'S2', 'S3')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    department TEXT DEFAULT 'Commerce & Gestion',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    department TEXT DEFAULT 'Commerce & Gestion',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT UNIQUE NOT NULL,
    building TEXT NOT NULL DEFAULT 'ENCG',
    capacity INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timetable_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_term TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
    source_file_name TEXT,
    created_by UUID REFERENCES public.profiles(id),
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_version_id UUID NOT NULL REFERENCES public.timetable_versions(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
    professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('S1', 'S2', 'S3', 'ALL')),
    session_type TEXT NOT NULL CHECK (session_type IN ('cours', 'td', 'tp')) DEFAULT 'cours',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    exception_type TEXT NOT NULL CHECK (exception_type IN ('room_change', 'time_shift', 'cancellation', 'extra_session')),
    replacement_room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    new_date DATE NOT NULL,
    new_start_time TIME,
    new_end_time TIME,
    reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_until TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    target_section TEXT NOT NULL CHECK (target_section IN ('S1', 'S2', 'S3', 'ALL')),
    syllabus_scope TEXT,
    required_materials TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    target_section TEXT NOT NULL CHECK (target_section IN ('S1', 'S2', 'S3', 'ALL')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_section TEXT NOT NULL CHECK (target_section IN ('S1', 'S2', 'S3', 'ALL')) DEFAULT 'ALL',
    priority TEXT CHECK (priority IN ('normal', 'urgent')) DEFAULT 'normal',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    reference_id UUID,
    target_section TEXT,
    idempotency_hash TEXT UNIQUE NOT NULL,
    is_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_state JSONB,
    new_state JSONB,
    altered_by UUID REFERENCES public.profiles(id),
    altered_at TIMESTAMPTZ DEFAULT NOW()
);
