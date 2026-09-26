import re, unicodedata

DAYS = {'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5, 'samedi': 6}
REV_DAYS = {1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi'}

def clean_text(s):
    return re.sub(r'\s+', ' ', str(s or '')).strip()

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', clean_text(s)) if unicodedata.category(c) != 'Mn')

def fmt_time(t):
    clean = str(t or '').replace('h', ':').strip()
    h, _, m = clean.partition(':')
    h_val = int(h) if h.isdigit() else 0
    m_val = int(m) if m.isdigit() else 0
    return f'{h_val:02d}:{m_val:02d}:00'

def parse_session(row):
    mod = clean_text(row.get('module', ''))
    raw_p = clean_text(row.get('prof', ''))
    prof = ('Pr ' + re.sub(r'^(pr\.?|prof\.?|m\.?)\s*', '', raw_p, flags=re.I).strip()) if raw_p else 'Pr Non Specifie'
    
    r_match = re.search(r'(salle|amphi)\s*0*(\d+)', clean_text(row.get('room', '')), re.I)
    room = f"{r_match.group(1).capitalize()} {r_match.group(2)}" if r_match else (clean_text(row.get('room')) or 'Salle 1')
    
    day_str = strip_accents(row.get('day', '')).lower()
    day = 1
    for k, v in DAYS.items():
        if day_str.startswith(k[:3]):
            day = v
            break
            
    time_str = clean_text(row.get('time', ''))
    if '-' in time_str:
        start_raw, end_raw = time_str.split('-', 1)
    else:
        start_raw, end_raw = time_str, ''
        
    start_t = fmt_time(start_raw)
    end_t = fmt_time(end_raw) if end_raw else '10:00:00'
    
    s_match = re.search(r'(?:S|SECTION)\s*([1-3])', clean_text(row.get('section', '')), re.I)
    sec = f"S{s_match.group(1)}" if s_match else 'S1'
    stype = 'td' if 'td' in clean_text(row.get('type', '')).lower() else 'cours'
    
    return {
        'section': sec,
        'day': day,
        'day_name': REV_DAYS.get(day, 'Lundi'),
        'start': start_t,
        'end': end_t,
        'module': mod,
        'prof': prof,
        'room': room,
        'type': stype
    }

if __name__ == '__main__':
    samples = [
        {'day': 'Lundi', 'time': '13h00 - 14h30', 'module': 'Commerce et Logistique', 'prof': 'pr. moubarik', 'room': 'salle 02', 'section': 'Section 3'},
        {'day': 'Mardi', 'time': '14:30 - 16:00', 'module': 'Economie Internationale', 'prof': 'M. Bensalek', 'room': 'salle 2', 'section': 'S3'},
        {'day': 'Mercredi', 'time': '8h30 - 10h00', 'module': 'Fiscalite d entreprise', 'prof': '', 'room': 'Amphi 1', 'section': 'S1'}
    ]
    print('--- Test Parser ENCG ---')
    for s in samples:
        r = parse_session(s)
        print(f"[{r['section']}] {r['day_name']} {r['start'][:5]}-{r['end'][:5]} | {r['module']} | {r['prof']} | {r['room']}")
