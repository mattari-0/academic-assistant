-- OFFICIAL SESSIONS COMMIT SCRIPT
DO $$
DECLARE
    v_version_id UUID;
    v_module_id UUID;
    v_prof_id UUID;
    v_room_id UUID;
BEGIN
    INSERT INTO public.timetable_versions (academic_term, academic_year, status, source_file_name)
    VALUES ('Semestre 3 (S3)', '2026-2027', 'active', 'EDT 2EME ANNEE 2026 PROVISOIRE.xlsx')
    RETURNING id INTO v_version_id;

    -- Session #1: Commerce et logistique \n (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Commerce et log%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MOUBARIK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '13:00:00', '14:30:00', 'S3', 'cours');
    END IF;
    -- Session #2: Commerce et logistique \n (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Commerce et log%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MOUBARIK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '14:30:00', '16:00:00', 'S2', 'cours');
    END IF;
    -- Session #3: Commerce et logistique \n (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Commerce et log%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MOUBARIK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '16:00:00', '17:30:00', 'S1', 'cours');
    END IF;
    -- Session #4: Economie internationale \n (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Economie intern%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr BENSALEK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '14:30:00', '16:00:00', 'S3', 'cours');
    END IF;
    -- Session #5: Economie internationale \n (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Economie intern%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr BENSALEK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '16:00:00', '17:30:00', 'S1', 'cours');
    END IF;
    -- Session #6: Economie internationale \n (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Economie intern%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr BENSALEK%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '17:30:00', '19:00:00', 'S2', 'cours');
    END IF;
    -- Session #7: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '08:30:00', '10:00:00', 'S2', 'cours');
    END IF;
    -- Session #8: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '10:00:00', '11:30:00', 'S3', 'cours');
    END IF;
    -- Session #9: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '11:30:00', '13:00:00', 'S1', 'cours');
    END IF;
    -- Session #10: Droit des affaires (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Droit des affai%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '14:00:00', '15:30:00', 'S3', 'cours');
    END IF;
    -- Session #11: Droit des affaires (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Droit des affai%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '15:30:00', '17:00:00', 'S1', 'cours');
    END IF;
    -- Session #12: Droit des affaires (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Droit des affai%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 2%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '17:00:00', '18:30:00', 'S2', 'cours');
    END IF;
    -- Session #13: Anglais \n (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Anglais \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MAID%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '13:00:00', '14:30:00', 'S3', 'cours');
    END IF;
    -- Session #14: Anglais \n (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Anglais \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MAID%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '14:30:00', '16:00:00', 'S1', 'cours');
    END IF;
    -- Session #15: Anglais \n (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Anglais \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr MAID%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '16:00:00', '17:30:00', 'S2', 'cours');
    END IF;
    -- Session #16: Comptabilité de gestion \n (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr BERRADA%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '08:30:00', '10:00:00', 'S1', 'cours');
    END IF;
    -- Session #17: Comptabilité de gestion \n (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr ELKARTIT%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '10:00:00', '11:30:00', 'S2', 'cours');
    END IF;
    -- Session #18: Comptabilité de gestion \n (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr ELKARTIT%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle 3%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '11:30:00', '13:00:00', 'S3', 'cours');
    END IF;
    -- Session #19: Digital’s skills \nRAHIL (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Digital’s skill%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '13:00:00', '14:30:00', 'S2', 'cours');
    END IF;
    -- Session #20: Digital’s skills \nRAHIL (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Digital’s skill%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '14:30:00', '16:00:00', 'S1', 'cours');
    END IF;
    -- Session #21: Digital’s skills \nRAHIL (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Digital’s skill%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 1, '16:00:00', '17:30:00', 'S3', 'cours');
    END IF;
    -- Session #22: TEC Français \n (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%TEC Français \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr ARAZZAKOU%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '13:00:00', '14:30:00', 'S1', 'cours');
    END IF;
    -- Session #23: TEC Français \n (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%TEC Français \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr ARAZZAKOU%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '14:30:00', '16:00:00', 'S2', 'cours');
    END IF;
    -- Session #24: TEC Français \n (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%TEC Français \n%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Pr ARAZZAKOU%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 2, '16:00:00', '17:30:00', 'S3', 'cours');
    END IF;
    -- Session #25: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '08:30:00', '10:00:00', 'S3', 'td');
    END IF;
    -- Session #26: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '10:00:00', '11:30:00', 'S1', 'td');
    END IF;
    -- Session #27: Mathématiques financières (MathFin) et décisions investissement et de financement (DIF) (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Mathématiques f%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 3, '11:30:00', '13:00:00', 'S2', 'td');
    END IF;
    -- Session #28: Comptabilité de gestion (S2)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '14:00:00', '15:30:00', 'S2', 'td');
    END IF;
    -- Session #29: Comptabilité de gestion (S3)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '15:30:00', '17:00:00', 'S3', 'td');
    END IF;
    -- Session #30: Comptabilité de gestion (S1)
    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%Comptabilité de%' LIMIT 1;
    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%Non spécifié%' LIMIT 1;
    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%Salle de conférences%' LIMIT 1;
    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN
        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)
        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, 5, '17:00:00', '18:30:00', 'S1', 'td');
    END IF;
END $$;