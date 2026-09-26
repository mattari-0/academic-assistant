INSERT INTO public.rooms (room_number, building, capacity) VALUES
('Salle 2', 'ENCG', 60),
('Salle 3', 'ENCG', 60),
('Salle de conférences', 'ENCG', 150)
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO public.professors (full_name, department) VALUES
('Pr MOUBARIK', 'Commerce & Logistique'),
('Pr BENSALEK', 'Économie'),
('Pr BERRADA', 'Finance & Comptabilité'),
('Pr ELKARTIT', 'Finance & Comptabilité'),
('RAHIL', 'Informatique & Digital'),
('Pr ARAZZAKOU', 'Langues & Communication'),
('Pr MAID', 'Langues & Communication')
ON CONFLICT DO NOTHING;

INSERT INTO public.modules (code, title, department) VALUES
('COMM_LOG', 'Commerce et logistique', 'Management'),
('ECO_INT', 'Economie internationale', 'Économie'),
('MATH_FIN', 'Mathématiques financières (MathFin) et DIF', 'Finance'),
('DROIT_AFF', 'Droit des affaires', 'Droit'),
('DIGITAL', 'Digital’s skills', 'Informatique'),
('TEC_FR', 'TEC Français', 'Communication'),
('COMPTA_GEST', 'Comptabilité de gestion', 'Finance'),
('ANGLAIS', 'Anglais', 'Communication')
ON CONFLICT (code) DO NOTHING;
