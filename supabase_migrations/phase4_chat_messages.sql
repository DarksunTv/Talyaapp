-- Phase 4: AI Brain & Measurements - Database Schema Updates
-- Add chat messages table for context-aware Gemini chat

-- ============================================
-- CHAT MESSAGES (AI Brain)
-- ============================================
create table if not exists crm_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  project_id uuid references crm_projects(id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  context_used jsonb,  -- What project data was included in the context
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table crm_chat_messages enable row level security;

-- RLS Policy for chat messages
create policy "crm_chat_messages_all" on crm_chat_messages for all
  using (
    company_id in (
      select company_id from crm_profiles where id = auth.uid()
    )
  );

-- Index for faster queries
create index if not exists idx_chat_messages_project on crm_chat_messages(project_id, created_at desc);
create index if not exists idx_chat_messages_company on crm_chat_messages(company_id, created_at desc);
