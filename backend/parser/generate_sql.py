import os
from timetable_parser import TimetableParser

parser = TimetableParser()
current_dir = os.path.dirname(__file__)
sample_file = os.path.join(current_dir, 'sample_edt_encg.csv')
result = parser.parse_file(sample_file)

sql_lines = [
    "-- OFFICIAL SESSIONS COMMIT SCRIPT",
    "DO $$",
    "DECLARE",
    "    v_version_id UUID;",
    "    v_module_id UUID;",
    "    v_prof_id UUID;",
    "    v_room_id UUID;",
    "BEGIN",
    "    INSERT INTO public.timetable_versions (academic_term, academic_year, status, source_file_name)",
    "    VALUES ('Semestre 3 (S3)', '2026-2027', 'active', 'EDT 2EME ANNEE 2026 PROVISOIRE.xlsx')",
    "    RETURNING id INTO v_version_id;",
    ""
]

for idx, s in enumerate(result['sessions']):
    sql_lines.append(f"    -- Session #{idx+1}: {s['module_title']} ({s['section']})")
    sql_lines.append(f"    SELECT id INTO v_module_id FROM public.modules WHERE title ILIKE '%{s['module_title'][:15]}%' LIMIT 1;")
    sql_lines.append(f"    SELECT id INTO v_prof_id FROM public.professors WHERE full_name ILIKE '%{s['professor_name']}%' LIMIT 1;")
    sql_lines.append(f"    SELECT id INTO v_room_id FROM public.rooms WHERE room_number ILIKE '%{s['room_number']}%' LIMIT 1;")
    sql_lines.append(f"    IF v_module_id IS NOT NULL AND v_room_id IS NOT NULL THEN")
    sql_lines.append(f"        INSERT INTO public.sessions (timetable_version_id, module_id, professor_id, room_id, day_of_week, start_time, end_time, section, session_type)")
    sql_lines.append(f"        VALUES (v_version_id, v_module_id, COALESCE(v_prof_id, (SELECT id FROM public.professors LIMIT 1)), v_room_id, {s['day_of_week']}, '{s['start_time']}', '{s['end_time']}', '{s['section']}', '{s['session_type']}');")
    sql_lines.append(f"    END IF;")

sql_lines.append("END $$;")

output_file = os.path.join(current_dir, 'import_sessions.sql')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines))

print(f"Generated SQL import script at: {output_file}")
