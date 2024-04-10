CREATE TABLE node_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_node_id UUID REFERENCES nodes(id),
  target_node_id UUID REFERENCES nodes(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
