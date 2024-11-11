-- Enable RLS on all relevant tables
alter table "public"."calendar_nodes" enable row level security;
alter table "public"."canvases" enable row level security;
alter table "public"."draw_nodes" enable row level security;
alter table "public"."edges" enable row level security;
alter table "public"."feedback" enable row level security;
alter table "public"."insights" enable row level security;
alter table "public"."node_attachments" enable row level security;
alter table "public"."node_canvas_link" enable row level security;
alter table "public"."node_history" enable row level security;
alter table "public"."node_tags" enable row level security;
alter table "public"."nodes" enable row level security;
alter table "public"."note_nodes" enable row level security;
alter table "public"."profiles" enable row level security;
alter table "public"."projects" enable row level security;
alter table "public"."table_nodes" enable row level security;
alter table "public"."task_nodes" enable row level security;
alter table "public"."workspace_members" enable row level security;
alter table "public"."workspaces" enable row level security;

-- Canvas policies (core functionality)
create policy "Users can view own canvases"
on "public"."canvases"
as permissive
for select
to public
using (auth.uid() = user_id);

create policy "Users can insert own canvases"
on "public"."canvases"
as permissive
for insert
to public
with check (auth.uid() = user_id);

create policy "Users can update own canvases"
on "public"."canvases"
as permissive
for update
to public
using (auth.uid() = user_id);

create policy "Users can delete own canvases"
on "public"."canvases"
as permissive
for delete
to public
using (auth.uid() = user_id);

-- Node and edge policies (relationships between objects)
create policy "Users can access nodes through canvas ownership"
on "public"."nodes"
as permissive
for all
to public
using (EXISTS (
    SELECT 1 
    FROM node_canvas_link ncl
    JOIN canvases c ON c.id = ncl.canvas_id
    WHERE ncl.node_id = nodes.id
    AND c.user_id = auth.uid()
));

create policy "Users can access edges through canvas ownership"
on "public"."edges"
as permissive
for all
to public
using (EXISTS (
    SELECT 1 
    FROM canvases c
    WHERE c.id = edges.canvas_id
    AND c.user_id = auth.uid()
));

create policy "Users can access node_canvas_link through canvas ownership"
on "public"."node_canvas_link"
as permissive
for all
to public
using (EXISTS (
    SELECT 1 
    FROM canvases c
    WHERE c.id = node_canvas_link.canvas_id
    AND c.user_id = auth.uid()
));

-- Specific node type policies
create policy "Users can access specific nodes through canvas ownership"
on "public"."calendar_nodes"
as permissive
for all
to public
using (EXISTS (
    SELECT 1 
    FROM node_canvas_link ncl
    JOIN canvases c ON c.id = ncl.canvas_id
    WHERE ncl.node_id = calendar_nodes.node_id
    AND c.user_id = auth.uid()
));

create policy "Users can access specific nodes through canvas ownership"
on "public"."draw_nodes"
as permissive
for all
to public
using (EXISTS (
    SELECT 1 
    FROM node_canvas_link ncl
    JOIN canvases c ON c.id = ncl.canvas_id
    WHERE ncl.node_id = draw_nodes.node_id
    AND c.user_id = auth.uid()
));

-- Workspace related policies
create policy "Users can access their workspaces"
on "public"."workspaces"
as permissive
for all
to public
using (
    auth.uid() = owner_id OR 
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
);

create policy "Users can access workspace memberships"
on "public"."workspace_members"
as permissive
for all
to public
using (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
        AND workspaces.owner_id = auth.uid()
    )
);

-- Project policies
create policy "Users can access their own projects"
on "public"."projects"
as permissive
for all
to public
using (user_id = auth.uid());

-- Profile policies
create policy "Users can view all profiles"
on "public"."profiles"
as permissive
for select
to public
using (true);

create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using (auth.uid() = user_id);

-- Feedback policies
create policy "Users can submit feedback"
on "public"."feedback"
as permissive
for insert
to public
with check (auth.uid() = user_id OR is_anonymous = true);

create policy "Users can view own feedback"
on "public"."feedback"
as permissive
for select
to public
using (auth.uid() = user_id OR is_anonymous = true);
