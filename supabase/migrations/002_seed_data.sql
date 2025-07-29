-- Seed initial data for IGCSE subjects and courses

-- Insert IGCSE courses
INSERT INTO public.courses (code, name, exam_board, level, description) VALUES
('igcse', 'IGCSE', 'Cambridge', 'IGCSE', 'Cambridge International General Certificate of Secondary Education'),
('as-level', 'AS Level', 'Cambridge', 'AS', 'Cambridge Advanced Subsidiary Level'),
('a-level', 'A Level', 'Cambridge', 'A2', 'Cambridge Advanced Level');

-- Insert IGCSE subjects
INSERT INTO public.subjects (code, name, description, icon, color) VALUES
('0470', 'History', 'IGCSE History', '📚', '#8B4513'),
('0450', 'Business Studies', 'IGCSE Business Studies', '💼', '#4169E1'),
('0455', 'Economics', 'IGCSE Economics', '📊', '#228B22'),
('0460', 'Geography', 'IGCSE Geography', '🌍', '#20B2AA'),
('0620', 'Chemistry', 'IGCSE Chemistry', '⚗️', '#FF6347'),
('0625', 'Physics', 'IGCSE Physics', '⚛️', '#4682B4'),
('0610', 'Biology', 'IGCSE Biology', '🧬', '#32CD32'),
('0580', 'Mathematics', 'IGCSE Mathematics', '🔢', '#FFD700'),
('0606', 'Mathematics - Additional', 'IGCSE Additional Mathematics', '📐', '#FF8C00'),
('0500', 'English - First Language', 'IGCSE English First Language', '📝', '#800080'),
('0510', 'English - Second Language', 'IGCSE English Second Language', '✍️', '#9370DB'),
('0520', 'French - Foreign Language', 'IGCSE French', '🇫🇷', '#002FA7'),
('0530', 'Spanish - Foreign Language', 'IGCSE Spanish', '🇪🇸', '#C60B1E'),
('0525', 'German - Foreign Language', 'IGCSE German', '🇩🇪', '#000000'),
('0478', 'Computer Science', 'IGCSE Computer Science', '💻', '#00CED1'),
('0417', 'Information and Communication Technology', 'IGCSE ICT', '🖥️', '#483D8B');

-- Insert sample papers for Mathematics
INSERT INTO public.papers (subject_id, course_id, paper_code, paper_name, duration_minutes, total_marks, exam_session, variant)
SELECT 
    s.id, 
    c.id, 
    '0580/21', 
    'Paper 2 (Extended)', 
    90, 
    70, 
    'May/June 2023', 
    '21'
FROM public.subjects s, public.courses c
WHERE s.code = '0580' AND c.code = 'igcse';

INSERT INTO public.papers (subject_id, course_id, paper_code, paper_name, duration_minutes, total_marks, exam_session, variant)
SELECT 
    s.id, 
    c.id, 
    '0580/41', 
    'Paper 4 (Extended)', 
    150, 
    130, 
    'May/June 2023', 
    '41'
FROM public.subjects s, public.courses c
WHERE s.code = '0580' AND c.code = 'igcse';

-- Insert sample papers for Physics
INSERT INTO public.papers (subject_id, course_id, paper_code, paper_name, duration_minutes, total_marks, exam_session, variant)
SELECT 
    s.id, 
    c.id, 
    '0625/21', 
    'Paper 2 (Multiple Choice Extended)', 
    45, 
    40, 
    'May/June 2023', 
    '21'
FROM public.subjects s, public.courses c
WHERE s.code = '0625' AND c.code = 'igcse';

INSERT INTO public.papers (subject_id, course_id, paper_code, paper_name, duration_minutes, total_marks, exam_session, variant)
SELECT 
    s.id, 
    c.id, 
    '0625/41', 
    'Paper 4 (Theory Extended)', 
    75, 
    80, 
    'May/June 2023', 
    '41'
FROM public.subjects s, public.courses c
WHERE s.code = '0625' AND c.code = 'igcse';