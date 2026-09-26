import re, csv, json, os

DAYS_MAP = {'LUNDI': 1, 'MARDI': 2, 'MERCREDI': 3, 'JEUDI': 4, 'VENDREDI': 5, 'SAMEDI': 6}

class TimetableParser:
    def __init__(self):
        self.days_map = DAYS_MAP

    def parse_cell(self, cell_text):
        if not cell_text or not str(cell_text).strip():
            return None
        raw = str(cell_text).strip()
        lines = [l.strip() for l in raw.split('\n') if l.strip()]
        session_type = 'td' if (' TD' in raw.upper() or 'TD ' in raw.upper() or raw.upper().endswith(' TD')) else 'cours'
        if ' TP' in raw.upper() or 'TP ' in raw.upper():
            session_type = 'tp'
        section_match = re.search(r'\bS\s*([123])\b', raw, re.IGNORECASE)
        section = f"S{section_match.group(1)}" if section_match else "ALL"
        professor = "Non spécifié"
        module_raw = lines[0] if lines else raw
        if len(lines) >= 2:
            module_raw = lines[0]
            prof_candidate = lines
            if not any(kw in prof_candidate.upper() for kw in ['DIF', 'TD', 'ENCG', 'SALLE']):
                professor = prof_candidate
        else:
            prof_match = re.search(r'(Pr\s+[A-Za-zÀ-ÿ\-]+)', module_raw)
            if prof_match:
                professor = prof_match.group(1)
        cleaned_module = module_raw
        cleaned_module = re.sub(r'\bS\s*[123]\b', '', cleaned_module, flags=re.IGNORECASE)
        cleaned_module = re.sub(r'\bTD\b', '', cleaned_module, flags=re.IGNORECASE)
        cleaned_module = re.sub(r'Pr\s+[A-Za-zÀ-ÿ\-]+', '', cleaned_module)
        cleaned_module = re.sub(r'\s+', ' ', cleaned_module).strip(' -,\n\t')
        if not cleaned_module:
            cleaned_module = module_raw
        confidence = 1.0
        warnings = []
        if section == "ALL":
            confidence -= 0.25
            warnings.append("Section non identifiée formellement")
        if professor == "Non spécifié":
            confidence -= 0.20
            warnings.append("Professeur non mentionné sur la grille")
        if len(cleaned_module) < 3:
            confidence -= 0.40
            warnings.append("Intitulé de module trop court")
        confidence = round(max(0.0, min(1.0, confidence)), 2)
        return {
            "module_title": cleaned_module,
            "section": section,
            "session_type": session_type,
            "professor_name": professor,
            "confidence": confidence,
            "is_uncertain": confidence < 0.85,
            "warnings": warnings,
            "raw_text": raw
        }

    def parse_grid(self, rows):
        day_row_idx = -1
        for idx, row in enumerate(rows):
            for cell in row:
                if 'LUNDI' in str(cell).upper():
                    day_row_idx = idx
                    break
            if day_row_idx != -1:
                break
        if day_row_idx == -1 or day_row_idx + 1 >= len(rows):
            raise ValueError("Structure non reconnue: impossible de localiser la ligne des jours")
        day_row = [str(c).strip() for c in rows[day_row_idx]]
        time_row = [str(c).strip() for c in rows[day_row_idx + 1]]
        col_map = {}
        current_day = None
        for c_idx in range(len(time_row)):
            if c_idx < len(day_row) and day_row[c_idx]:
                candidate = day_row[c_idx].upper()
                for d in self.days_map:
                    if d in candidate:
                        current_day = d
                        break
            time_slot = time_row[c_idx]
            match = re.search(r'(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})', time_slot)
            if current_day and match:
                start_t, end_t = match.group(1), match.group(2)
                if len(start_t) == 4: start_t = "0" + start_t
                if len(end_t) == 4: end_t = "0" + end_t
                col_map[c_idx] = {
                    "day_name": current_day,
                    "day_of_week": self.days_map[current_day],
                    "start_time": f"{start_t}:00",
                    "end_time": f"{end_t}:00"
                }
        sessions = []
        detected_rooms = set()
        detected_modules = set()
        detected_professors = set()
        uncertain_count = 0
        for r_idx in range(day_row_idx + 2, len(rows)):
            row = rows[r_idx]
            if not row or not any(row):
                continue
            first_cell = str(row[0]).strip()
            if not first_cell or any(k in first_cell.upper() for k in ['ANNEE', 'SALLE\n', 'SALLE ENCG', 'EMPLOI']):
                continue
            room_name = first_cell.replace('\n', ' ').strip()
            detected_rooms.add(room_name)
            for c_idx in range(1, len(row)):
                if c_idx not in col_map:
                    continue
                cell_val = row[c_idx]
                if not cell_val or not str(cell_val).strip():
                    continue
                parsed = self.parse_cell(cell_val)
                if not parsed:
                    continue
                detected_modules.add(parsed['module_title'])
                if parsed['professor_name'] != "Non spécifié":
                    detected_professors.add(parsed['professor_name'])
                if parsed['is_uncertain']:
                    uncertain_count += 1
                session = {
                    "day_of_week": col_map[c_idx]['day_of_week'],
                    "day_name": col_map[c_idx]['day_name'],
                    "start_time": col_map[c_idx]['start_time'],
                    "end_time": col_map[c_idx]['end_time'],
                    "room_number": room_name,
                    "module_title": parsed['module_title'],
                    "professor_name": parsed['professor_name'],
                    "section": parsed['section'],
                    "session_type": parsed['session_type'],
                    "confidence": parsed['confidence'],
                    "is_uncertain": parsed['is_uncertain'],
                    "warnings": parsed['warnings'],
                    "raw_text": parsed['raw_text']
                }
                sessions.append(session)
        return {
            "status": "success",
            "summary": {
                "total_sessions": len(sessions),
                "total_modules": len(detected_modules),
                "total_professors": len(detected_professors),
                "total_rooms": len(detected_rooms),
                "uncertain_entries": uncertain_count,
            },
            "entities": {
                "modules": sorted(list(detected_modules)),
                "professors": sorted(list(detected_professors)),
                "rooms": sorted(list(detected_rooms)),
            },
            "sessions": sessions
        }

    def parse_file(self, file_path):
        if file_path.endswith('.xlsx'):
            import openpyxl
            wb = openpyxl.load_workbook(file_path, data_only=True)
            sheet = wb.active
            rows = [[cell if cell is not None else "" for cell in r] for r in sheet.iter_rows(values_only=True)]
            return self.parse_grid(rows)
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                rows = list(csv.reader(f))
            return self.parse_grid(rows)

if __name__ == '__main__':
    parser = TimetableParser()
    sample_file = os.path.join(os.path.dirname(__file__), 'sample_edt_encg.csv')
    result = parser.parse_file(sample_file)
    print("\n" + "="*50)
    print("📄 TIMETABLE ANALYSIS REPORT")
    print("="*50)
    s = result['summary']
    print(f"📊 {s['total_sessions']} sessions detected")
    print(f"📚 {s['total_modules']} modules")
    print(f"👨‍🏫 {s['total_professors']} professors")
    print(f"📍 {s['total_rooms']} rooms")
    print(f"⚠️  {s['uncertain_entries']} uncertain entries (Review before activation)")
    print("="*50)
