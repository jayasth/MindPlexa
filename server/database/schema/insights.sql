CREATE TABLE insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES auth.users(id), -- New column to link insights to a specific user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
