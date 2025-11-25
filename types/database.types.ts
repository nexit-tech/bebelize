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
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          role: 'consultora' | 'atelier' | 'admin'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          role: 'consultora' | 'atelier' | 'admin'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          role?: 'consultora' | 'atelier' | 'admin'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          theme: string
          description: string
          image_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          theme: string
          description: string
          image_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          theme?: string
          description?: string
          image_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          collection_id: string
          name: string
          description: string
          code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          name: string
          description: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          name?: string
          description?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          client_name: string
          client_phone: string | null
          client_email: string | null
          consultant_id: string
          collection_id: string
          status: 'rascunho' | 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado'
          priority: 'normal' | 'urgente'
          delivery_date: string | null
          production_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client_name: string
          client_phone?: string | null
          client_email?: string | null
          consultant_id: string
          collection_id: string
          status?: 'rascunho' | 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado'
          priority?: 'normal' | 'urgente'
          delivery_date?: string | null
          production_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client_name?: string
          client_phone?: string | null
          client_email?: string | null
          consultant_id?: string
          collection_id?: string
          status?: 'rascunho' | 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado'
          priority?: 'normal' | 'urgente'
          delivery_date?: string | null
          production_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_customizations: {
        Row: {
          id: string
          project_id: string
          fabric: string
          fabric_name: string
          primary_color: string
          secondary_color: string
          embroidery_name: string | null
          embroidery_style: string | null
          embroidery_style_name: string | null
          observations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          fabric: string
          fabric_name: string
          primary_color: string
          secondary_color: string
          embroidery_name?: string | null
          embroidery_style?: string | null
          embroidery_style_name?: string | null
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          fabric?: string
          fabric_name?: string
          primary_color?: string
          secondary_color?: string
          embroidery_name?: string | null
          embroidery_style?: string | null
          embroidery_style_name?: string | null
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_items: {
        Row: {
          id: string
          project_id: string
          item_id: string
          fabric_id: string | null
          primary_color_id: string | null
          secondary_color_id: string | null
          embroidery_name: string | null
          embroidery_style: string | null
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          item_id: string
          fabric_id?: string | null
          primary_color_id?: string | null
          secondary_color_id?: string | null
          embroidery_name?: string | null
          embroidery_style?: string | null
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          item_id?: string
          fabric_id?: string | null
          primary_color_id?: string | null
          secondary_color_id?: string | null
          embroidery_name?: string | null
          embroidery_style?: string | null
          quantity?: number
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
      [_ in never]: never
    }
  }
}