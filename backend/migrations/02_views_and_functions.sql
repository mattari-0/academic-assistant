CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, student_section)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        CASE 
            WHEN lower(new.email) = 'benchanb.othman.2008@gmail.com' THEN 'admin'
            ELSE COALESCE(new.raw_user_meta_data->>'role', 'student')
        END,
        COALESCE(new.raw_user_meta_data->>'student_section', 'S1')
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Modules viewable" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professors viewable" ON public.professors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Rooms viewable" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Versions viewable" ON public.timetable_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sessions viewable" ON public.sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Exceptions viewable" ON public.schedule_exceptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Exams viewable" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assignments viewable" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Announcements viewable" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Notifications viewable" ON public.notifications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins modify modules" ON public.modules FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify professors" ON public.professors FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify rooms" ON public.rooms FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify versions" ON public.timetable_versions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify sessions" ON public.sessions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify exceptions" ON public.schedule_exceptions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify exams" ON public.exams FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify assignments" ON public.assignments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins modify announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE VIEW public.v_student_effective_schedule AS
SELECT 
    s.id AS session_id,
    s.timetable_version_id,
    s.day_of_week,
    s.start_time AS scheduled_start_time,
    s.end_time AS scheduled_end_time,
    s.section,
    s.session_type,
    m.code AS module_code,
    m.title AS module_title,
    p.full_name AS professor_name,
    orig_r.room_number AS original_room,
    COALESCE(rep_r.room_number, orig_r.room_number) AS effective_room,
    e.id AS active_exception_id,
    e.exception_type,
    e.reason AS exception_reason,
    (e.id IS NOT NULL AND e.is_active = TRUE) AS has_active_override,
    (e.exception_type = 'cancellation' AND e.is_active = TRUE) AS is_cancelled
FROM public.sessions s
JOIN public.modules m ON s.module_id = m.id
JOIN public.professors p ON s.professor_id = p.id
JOIN public.rooms orig_r ON s.room_id = orig_r.id
LEFT JOIN public.schedule_exceptions e 
    ON s.id = e.session_id 
    AND e.is_active = TRUE 
    AND e.valid_until > NOW()
LEFT JOIN public.rooms rep_r ON e.replacement_room_id = rep_r.id;
