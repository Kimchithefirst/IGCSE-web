-- MINIMAL IGCSE MIGRATION - Copy this entire block and paste into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'essay', 'true_false');
CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- Core tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    exam_board VARCHAR(50),
    level VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status quiz_status DEFAULT 'draft',
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    duration_minutes INTEGER,
    total_marks INTEGER,
    pass_percentage INTEGER DEFAULT 50,
    instructions TEXT,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data
INSERT INTO public.courses (code, name, exam_board, level, description) VALUES
('igcse', 'IGCSE', 'Cambridge', 'IGCSE', 'Cambridge International General Certificate of Secondary Education');

INSERT INTO public.subjects (code, name, description, icon, color) VALUES
('0580', 'Mathematics', 'IGCSE Mathematics', '🔢', '#FFD700'),
('0625', 'Physics', 'IGCSE Physics', '⚛️', '#4682B4'),
('0620', 'Chemistry', 'IGCSE Chemistry', '⚗️', '#FF6347'),
('0610', 'Biology', 'IGCSE Biology', '🧬', '#32CD32'),
('0478', 'Computer Science', 'IGCSE Computer Science', '💻', '#00CED1');

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);