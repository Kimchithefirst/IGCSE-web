export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          exam_board: string | null
          level: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          exam_board?: string | null
          level?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          exam_board?: string | null
          level?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          subject_id: string | null
          created_by: string | null
          status: 'draft' | 'published' | 'archived'
          difficulty_level: number | null
          duration_minutes: number | null
          total_marks: number | null
          pass_percentage: number
          instructions: string | null
          is_public: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject_id?: string | null
          created_by?: string | null
          status?: 'draft' | 'published' | 'archived'
          difficulty_level?: number | null
          duration_minutes?: number | null
          total_marks?: number | null
          pass_percentage?: number
          instructions?: string | null
          is_public?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject_id?: string | null
          created_by?: string | null
          status?: 'draft' | 'published' | 'archived'
          difficulty_level?: number | null
          duration_minutes?: number | null
          total_marks?: number | null
          pass_percentage?: number
          instructions?: string | null
          is_public?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'teacher' | 'parent' | 'admin'
      question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false'
      quiz_status: 'draft' | 'published' | 'archived'
      attempt_status: 'in_progress' | 'completed' | 'abandoned'
    }
  }
}