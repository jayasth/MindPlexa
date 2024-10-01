create type "public"."node_type" as enum ('note', 'task', 'table', 'calendar', 'draw', 'selection_menu');

create type "public"."price_interval" as enum ('day', 'week', 'month', 'year');

create type "public"."price_type" as enum ('one_time', 'recurring');

create sequence "public"."deleted_files_log_id_seq";

create sequence "public"."files_to_delete_id_seq";

create table "public"."calendar_nodes" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid,
    "events" jsonb,
    "default_view" character varying(10) default 'month'::character varying,
    "time_zone" character varying(50) default 'UTC'::character varying
);


create table "public"."canvases" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "content" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "user_id" uuid,
    "nodes" jsonb
);


create table "public"."deleted_files_log" (
    "id" integer not null default nextval('deleted_files_log_id_seq'::regclass),
    "file_path" text not null,
    "deleted_at" timestamp with time zone default now(),
    "is_processed" boolean default false
);


create table "public"."draw_nodes" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid,
    "drawing_file_url" text,
    "settings" jsonb,
    "current_tool" character varying(50),
    "current_color" character varying(255),
    "current_stroke_width" integer
);


create table "public"."edges" (
    "id" uuid not null default gen_random_uuid(),
    "canvas_id" uuid,
    "source_node_id" uuid,
    "target_node_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."files_to_delete" (
    "id" integer not null default nextval('files_to_delete_id_seq'::regclass),
    "bucket_name" text not null,
    "file_path" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."insights" (
    "id" uuid not null default uuid_generate_v4(),
    "title" character varying not null,
    "description" text,
    "workspace_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


create table "public"."node_attachments" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid not null,
    "type" character varying not null,
    "created_at" timestamp with time zone default now(),
    "file_name" character varying,
    "file_size" integer,
    "storage_path" text,
    "mime_type" character varying,
    "url" text,
    "is_file" boolean default true
);


create table "public"."node_canvas_link" (
    "node_id" uuid not null,
    "canvas_id" uuid not null
);


create table "public"."node_history" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid not null,
    "version" integer not null,
    "data" jsonb not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."node_tags" (
    "node_id" uuid not null,
    "tag" character varying not null
);


create table "public"."nodes" (
    "id" uuid not null default gen_random_uuid(),
    "type" node_type,
    "title" character varying(255),
    "background_color" character varying(7),
    "text_color" character varying(7),
    "is_editing" boolean,
    "position" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_temporary" boolean default false,
    "parent_node_id" uuid,
    "view_width" integer,
    "view_height" integer,
    "edit_width" integer,
    "edit_height" integer,
    "z_index" integer default 0,
    "version" integer not null default 1,
    "mobile_edit_width" integer,
    "mobile_edit_height" integer
);


create table "public"."note_nodes" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid,
    "content" text
);


create table "public"."profiles" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "full_name" text,
    "avatar_url" text,
    "bio" text,
    "website" text,
    "email" character varying,
    "phone" text,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone default CURRENT_TIMESTAMP
);


create table "public"."projects" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying not null,
    "description" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "slug" character varying(255),
    "user_id" uuid,
    "status" character varying(20) default 'active'::character varying,
    "due_date" date
);


create table "public"."table_nodes" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid,
    "columns" jsonb not null default '[]'::jsonb,
    "rows" jsonb not null default '[]'::jsonb,
    "default_column_type" character varying(255) default 'text'::character varying,
    "date_format" character varying(20) default 'yyyy-MM-dd'::character varying,
    "settings" jsonb default '{}'::jsonb
);


create table "public"."task_nodes" (
    "id" uuid not null default gen_random_uuid(),
    "node_id" uuid,
    "tasks" jsonb,
    "total_tasks" integer default 0,
    "completed_tasks" integer default 0,
    "sort_by" text default ''::text,
    "show_completed_tasks" boolean default true,
    "show_priority" boolean default true,
    "show_due_date" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."workspace_members" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "workspace_id" uuid,
    "role" character varying not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


create table "public"."workspaces" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying not null,
    "description" text,
    "owner_id" uuid,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter sequence "public"."deleted_files_log_id_seq" owned by "public"."deleted_files_log"."id";

alter sequence "public"."files_to_delete_id_seq" owned by "public"."files_to_delete"."id";

CREATE UNIQUE INDEX calendar_nodes_common_node_id_key ON public.calendar_nodes USING btree (node_id);

CREATE UNIQUE INDEX calendar_nodes_pkey ON public.calendar_nodes USING btree (id);

CREATE UNIQUE INDEX canvases_pkey ON public.canvases USING btree (id);

CREATE UNIQUE INDEX common_node_properties_pkey ON public.nodes USING btree (id);

CREATE UNIQUE INDEX deleted_files_log_pkey ON public.deleted_files_log USING btree (id);

CREATE UNIQUE INDEX draw_nodes_common_node_id_key ON public.draw_nodes USING btree (node_id);

CREATE UNIQUE INDEX draw_nodes_pkey ON public.draw_nodes USING btree (id);

CREATE UNIQUE INDEX edges_pkey ON public.edges USING btree (id);

CREATE UNIQUE INDEX files_to_delete_pkey ON public.files_to_delete USING btree (id);

CREATE INDEX idx_calendar_nodes_node_id ON public.calendar_nodes USING btree (node_id);

CREATE INDEX idx_draw_nodes_node_id ON public.draw_nodes USING btree (node_id);

CREATE INDEX idx_node_canvas_link_canvas_id ON public.node_canvas_link USING btree (canvas_id);

CREATE INDEX idx_node_canvas_link_node_id ON public.node_canvas_link USING btree (node_id);

CREATE INDEX idx_nodes_parent_node_id ON public.nodes USING btree (parent_node_id);

CREATE INDEX idx_nodes_type ON public.nodes USING btree (type);

CREATE INDEX idx_note_nodes_node_id ON public.note_nodes USING btree (node_id);

CREATE INDEX idx_table_nodes_node_id ON public.table_nodes USING btree (node_id);

CREATE UNIQUE INDEX insights_pkey ON public.insights USING btree (id);

CREATE UNIQUE INDEX node_attachments_pkey ON public.node_attachments USING btree (id);

CREATE UNIQUE INDEX node_canvas_link_pkey ON public.node_canvas_link USING btree (node_id, canvas_id);

CREATE UNIQUE INDEX node_canvas_link_unique ON public.node_canvas_link USING btree (node_id, canvas_id);

CREATE UNIQUE INDEX node_history_node_id_version_key ON public.node_history USING btree (node_id, version);

CREATE UNIQUE INDEX node_history_pkey ON public.node_history USING btree (id);

CREATE UNIQUE INDEX node_tags_pkey ON public.node_tags USING btree (node_id, tag);

CREATE UNIQUE INDEX node_tags_unique ON public.node_tags USING btree (node_id, tag);

CREATE UNIQUE INDEX note_nodes_common_node_id_key ON public.note_nodes USING btree (node_id);

CREATE UNIQUE INDEX note_nodes_pkey ON public.note_nodes USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX projects_slug_key ON public.projects USING btree (slug);

CREATE UNIQUE INDEX table_nodes_common_node_id_key ON public.table_nodes USING btree (node_id);

CREATE UNIQUE INDEX table_nodes_pkey ON public.table_nodes USING btree (id);

CREATE UNIQUE INDEX task_nodes_pkey ON public.task_nodes USING btree (id);

CREATE UNIQUE INDEX workspace_members_pkey ON public.workspace_members USING btree (id);

CREATE UNIQUE INDEX workspaces_pkey ON public.workspaces USING btree (id);

alter table "public"."calendar_nodes" add constraint "calendar_nodes_pkey" PRIMARY KEY using index "calendar_nodes_pkey";

alter table "public"."canvases" add constraint "canvases_pkey" PRIMARY KEY using index "canvases_pkey";

alter table "public"."deleted_files_log" add constraint "deleted_files_log_pkey" PRIMARY KEY using index "deleted_files_log_pkey";

alter table "public"."draw_nodes" add constraint "draw_nodes_pkey" PRIMARY KEY using index "draw_nodes_pkey";

alter table "public"."edges" add constraint "edges_pkey" PRIMARY KEY using index "edges_pkey";

alter table "public"."files_to_delete" add constraint "files_to_delete_pkey" PRIMARY KEY using index "files_to_delete_pkey";

alter table "public"."insights" add constraint "insights_pkey" PRIMARY KEY using index "insights_pkey";

alter table "public"."node_attachments" add constraint "node_attachments_pkey" PRIMARY KEY using index "node_attachments_pkey";

alter table "public"."node_canvas_link" add constraint "node_canvas_link_pkey" PRIMARY KEY using index "node_canvas_link_pkey";

alter table "public"."node_history" add constraint "node_history_pkey" PRIMARY KEY using index "node_history_pkey";

alter table "public"."node_tags" add constraint "node_tags_pkey" PRIMARY KEY using index "node_tags_pkey";

alter table "public"."nodes" add constraint "common_node_properties_pkey" PRIMARY KEY using index "common_node_properties_pkey";

alter table "public"."note_nodes" add constraint "note_nodes_pkey" PRIMARY KEY using index "note_nodes_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."table_nodes" add constraint "table_nodes_pkey" PRIMARY KEY using index "table_nodes_pkey";

alter table "public"."task_nodes" add constraint "task_nodes_pkey" PRIMARY KEY using index "task_nodes_pkey";

alter table "public"."workspace_members" add constraint "workspace_members_pkey" PRIMARY KEY using index "workspace_members_pkey";

alter table "public"."workspaces" add constraint "workspaces_pkey" PRIMARY KEY using index "workspaces_pkey";

alter table "public"."calendar_nodes" add constraint "calendar_nodes_common_node_id_key" UNIQUE using index "calendar_nodes_common_node_id_key";

alter table "public"."calendar_nodes" add constraint "calendar_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_nodes" validate constraint "calendar_nodes_node_id_fkey";

alter table "public"."canvases" add constraint "canvases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."canvases" validate constraint "canvases_user_id_fkey";

alter table "public"."draw_nodes" add constraint "draw_nodes_common_node_id_key" UNIQUE using index "draw_nodes_common_node_id_key";

alter table "public"."draw_nodes" add constraint "draw_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."draw_nodes" validate constraint "draw_nodes_node_id_fkey";

alter table "public"."edges" add constraint "edges_canvas_id_fkey" FOREIGN KEY (canvas_id) REFERENCES canvases(id) not valid;

alter table "public"."edges" validate constraint "edges_canvas_id_fkey";

alter table "public"."edges" add constraint "edges_source_node_id_fkey" FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."edges" validate constraint "edges_source_node_id_fkey";

alter table "public"."edges" add constraint "edges_target_node_id_fkey" FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."edges" validate constraint "edges_target_node_id_fkey";

alter table "public"."node_attachments" add constraint "node_attachments_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."node_attachments" validate constraint "node_attachments_node_id_fkey";

alter table "public"."node_attachments" add constraint "node_attachments_type_check" CHECK (((type)::text = ANY ((ARRAY['file'::character varying, 'url'::character varying])::text[]))) not valid;

alter table "public"."node_attachments" validate constraint "node_attachments_type_check";

alter table "public"."node_canvas_link" add constraint "node_canvas_link_canvas_id_fkey" FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE not valid;

alter table "public"."node_canvas_link" validate constraint "node_canvas_link_canvas_id_fkey";

alter table "public"."node_canvas_link" add constraint "node_canvas_link_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."node_canvas_link" validate constraint "node_canvas_link_node_id_fkey";

alter table "public"."node_canvas_link" add constraint "node_canvas_link_unique" UNIQUE using index "node_canvas_link_unique";

alter table "public"."node_history" add constraint "node_history_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."node_history" validate constraint "node_history_node_id_fkey";

alter table "public"."node_history" add constraint "node_history_node_id_version_key" UNIQUE using index "node_history_node_id_version_key";

alter table "public"."node_tags" add constraint "node_tags_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."node_tags" validate constraint "node_tags_node_id_fkey";

alter table "public"."node_tags" add constraint "node_tags_unique" UNIQUE using index "node_tags_unique";

alter table "public"."nodes" add constraint "nodes_parent_node_id_fkey" FOREIGN KEY (parent_node_id) REFERENCES nodes(id) not valid;

alter table "public"."nodes" validate constraint "nodes_parent_node_id_fkey";

alter table "public"."note_nodes" add constraint "note_nodes_common_node_id_key" UNIQUE using index "note_nodes_common_node_id_key";

alter table "public"."note_nodes" add constraint "note_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."note_nodes" validate constraint "note_nodes_node_id_fkey";

alter table "public"."projects" add constraint "projects_slug_key" UNIQUE using index "projects_slug_key";

alter table "public"."projects" add constraint "projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."projects" validate constraint "projects_user_id_fkey";

alter table "public"."table_nodes" add constraint "table_nodes_common_node_id_key" UNIQUE using index "table_nodes_common_node_id_key";

alter table "public"."table_nodes" add constraint "table_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."table_nodes" validate constraint "table_nodes_node_id_fkey";

alter table "public"."task_nodes" add constraint "task_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE not valid;

alter table "public"."task_nodes" validate constraint "task_nodes_node_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_drawing_from_bucket()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    file_path TEXT;
BEGIN
    -- Get the file path from draw_nodes
    SELECT drawing_file_url INTO file_path
    FROM draw_nodes
    WHERE node_id = OLD.id;

    -- If a file path was found, log it for later deletion
    IF file_path IS NOT NULL THEN
        INSERT INTO files_to_delete (bucket_name, file_path)
        VALUES ('drawings', file_path);
    END IF;

    -- Delete the corresponding record from draw_nodes
    DELETE FROM draw_nodes WHERE node_id = OLD.id;
    
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_node_attachments()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete all attachment records for the node
    DELETE FROM node_attachments WHERE node_id = OLD.id;

    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.duplicate_canvas(original_canvas_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_canvas_id UUID;
    node RECORD;
BEGIN
    -- Duplicate the canvas entry
    INSERT INTO canvases (name, description, content, created_at, updated_at, user_id)
    SELECT name, description, content, NOW(), NOW(), user_id
    FROM canvases WHERE id = original_canvas_id
    RETURNING id INTO new_canvas_id;

    -- Duplicate all base nodes associated with this canvas
    FOR node IN SELECT id FROM base_nodes WHERE canvas_id = original_canvas_id LOOP
        PERFORM duplicate_node(node.id, new_canvas_id);
    END LOOP;

    RETURN new_canvas_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_node_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.version = OLD.version + 1;
    INSERT INTO node_history (node_id, version, data)
    VALUES (OLD.id, OLD.version, row_to_json(OLD));
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."calendar_nodes" to "anon";

grant insert on table "public"."calendar_nodes" to "anon";

grant references on table "public"."calendar_nodes" to "anon";

grant select on table "public"."calendar_nodes" to "anon";

grant trigger on table "public"."calendar_nodes" to "anon";

grant truncate on table "public"."calendar_nodes" to "anon";

grant update on table "public"."calendar_nodes" to "anon";

grant delete on table "public"."calendar_nodes" to "authenticated";

grant insert on table "public"."calendar_nodes" to "authenticated";

grant references on table "public"."calendar_nodes" to "authenticated";

grant select on table "public"."calendar_nodes" to "authenticated";

grant trigger on table "public"."calendar_nodes" to "authenticated";

grant truncate on table "public"."calendar_nodes" to "authenticated";

grant update on table "public"."calendar_nodes" to "authenticated";

grant delete on table "public"."calendar_nodes" to "service_role";

grant insert on table "public"."calendar_nodes" to "service_role";

grant references on table "public"."calendar_nodes" to "service_role";

grant select on table "public"."calendar_nodes" to "service_role";

grant trigger on table "public"."calendar_nodes" to "service_role";

grant truncate on table "public"."calendar_nodes" to "service_role";

grant update on table "public"."calendar_nodes" to "service_role";

grant delete on table "public"."canvases" to "anon";

grant insert on table "public"."canvases" to "anon";

grant references on table "public"."canvases" to "anon";

grant select on table "public"."canvases" to "anon";

grant trigger on table "public"."canvases" to "anon";

grant truncate on table "public"."canvases" to "anon";

grant update on table "public"."canvases" to "anon";

grant delete on table "public"."canvases" to "authenticated";

grant insert on table "public"."canvases" to "authenticated";

grant references on table "public"."canvases" to "authenticated";

grant select on table "public"."canvases" to "authenticated";

grant trigger on table "public"."canvases" to "authenticated";

grant truncate on table "public"."canvases" to "authenticated";

grant update on table "public"."canvases" to "authenticated";

grant delete on table "public"."canvases" to "service_role";

grant insert on table "public"."canvases" to "service_role";

grant references on table "public"."canvases" to "service_role";

grant select on table "public"."canvases" to "service_role";

grant trigger on table "public"."canvases" to "service_role";

grant truncate on table "public"."canvases" to "service_role";

grant update on table "public"."canvases" to "service_role";

grant delete on table "public"."deleted_files_log" to "anon";

grant insert on table "public"."deleted_files_log" to "anon";

grant references on table "public"."deleted_files_log" to "anon";

grant select on table "public"."deleted_files_log" to "anon";

grant trigger on table "public"."deleted_files_log" to "anon";

grant truncate on table "public"."deleted_files_log" to "anon";

grant update on table "public"."deleted_files_log" to "anon";

grant delete on table "public"."deleted_files_log" to "authenticated";

grant insert on table "public"."deleted_files_log" to "authenticated";

grant references on table "public"."deleted_files_log" to "authenticated";

grant select on table "public"."deleted_files_log" to "authenticated";

grant trigger on table "public"."deleted_files_log" to "authenticated";

grant truncate on table "public"."deleted_files_log" to "authenticated";

grant update on table "public"."deleted_files_log" to "authenticated";

grant delete on table "public"."deleted_files_log" to "service_role";

grant insert on table "public"."deleted_files_log" to "service_role";

grant references on table "public"."deleted_files_log" to "service_role";

grant select on table "public"."deleted_files_log" to "service_role";

grant trigger on table "public"."deleted_files_log" to "service_role";

grant truncate on table "public"."deleted_files_log" to "service_role";

grant update on table "public"."deleted_files_log" to "service_role";

grant delete on table "public"."draw_nodes" to "anon";

grant insert on table "public"."draw_nodes" to "anon";

grant references on table "public"."draw_nodes" to "anon";

grant select on table "public"."draw_nodes" to "anon";

grant trigger on table "public"."draw_nodes" to "anon";

grant truncate on table "public"."draw_nodes" to "anon";

grant update on table "public"."draw_nodes" to "anon";

grant delete on table "public"."draw_nodes" to "authenticated";

grant insert on table "public"."draw_nodes" to "authenticated";

grant references on table "public"."draw_nodes" to "authenticated";

grant select on table "public"."draw_nodes" to "authenticated";

grant trigger on table "public"."draw_nodes" to "authenticated";

grant truncate on table "public"."draw_nodes" to "authenticated";

grant update on table "public"."draw_nodes" to "authenticated";

grant delete on table "public"."draw_nodes" to "service_role";

grant insert on table "public"."draw_nodes" to "service_role";

grant references on table "public"."draw_nodes" to "service_role";

grant select on table "public"."draw_nodes" to "service_role";

grant trigger on table "public"."draw_nodes" to "service_role";

grant truncate on table "public"."draw_nodes" to "service_role";

grant update on table "public"."draw_nodes" to "service_role";

grant delete on table "public"."edges" to "anon";

grant insert on table "public"."edges" to "anon";

grant references on table "public"."edges" to "anon";

grant select on table "public"."edges" to "anon";

grant trigger on table "public"."edges" to "anon";

grant truncate on table "public"."edges" to "anon";

grant update on table "public"."edges" to "anon";

grant delete on table "public"."edges" to "authenticated";

grant insert on table "public"."edges" to "authenticated";

grant references on table "public"."edges" to "authenticated";

grant select on table "public"."edges" to "authenticated";

grant trigger on table "public"."edges" to "authenticated";

grant truncate on table "public"."edges" to "authenticated";

grant update on table "public"."edges" to "authenticated";

grant delete on table "public"."edges" to "service_role";

grant insert on table "public"."edges" to "service_role";

grant references on table "public"."edges" to "service_role";

grant select on table "public"."edges" to "service_role";

grant trigger on table "public"."edges" to "service_role";

grant truncate on table "public"."edges" to "service_role";

grant update on table "public"."edges" to "service_role";

grant delete on table "public"."files_to_delete" to "anon";

grant insert on table "public"."files_to_delete" to "anon";

grant references on table "public"."files_to_delete" to "anon";

grant select on table "public"."files_to_delete" to "anon";

grant trigger on table "public"."files_to_delete" to "anon";

grant truncate on table "public"."files_to_delete" to "anon";

grant update on table "public"."files_to_delete" to "anon";

grant delete on table "public"."files_to_delete" to "authenticated";

grant insert on table "public"."files_to_delete" to "authenticated";

grant references on table "public"."files_to_delete" to "authenticated";

grant select on table "public"."files_to_delete" to "authenticated";

grant trigger on table "public"."files_to_delete" to "authenticated";

grant truncate on table "public"."files_to_delete" to "authenticated";

grant update on table "public"."files_to_delete" to "authenticated";

grant delete on table "public"."files_to_delete" to "service_role";

grant insert on table "public"."files_to_delete" to "service_role";

grant references on table "public"."files_to_delete" to "service_role";

grant select on table "public"."files_to_delete" to "service_role";

grant trigger on table "public"."files_to_delete" to "service_role";

grant truncate on table "public"."files_to_delete" to "service_role";

grant update on table "public"."files_to_delete" to "service_role";

grant delete on table "public"."insights" to "anon";

grant insert on table "public"."insights" to "anon";

grant references on table "public"."insights" to "anon";

grant select on table "public"."insights" to "anon";

grant trigger on table "public"."insights" to "anon";

grant truncate on table "public"."insights" to "anon";

grant update on table "public"."insights" to "anon";

grant delete on table "public"."insights" to "authenticated";

grant insert on table "public"."insights" to "authenticated";

grant references on table "public"."insights" to "authenticated";

grant select on table "public"."insights" to "authenticated";

grant trigger on table "public"."insights" to "authenticated";

grant truncate on table "public"."insights" to "authenticated";

grant update on table "public"."insights" to "authenticated";

grant delete on table "public"."insights" to "service_role";

grant insert on table "public"."insights" to "service_role";

grant references on table "public"."insights" to "service_role";

grant select on table "public"."insights" to "service_role";

grant trigger on table "public"."insights" to "service_role";

grant truncate on table "public"."insights" to "service_role";

grant update on table "public"."insights" to "service_role";

grant delete on table "public"."node_attachments" to "anon";

grant insert on table "public"."node_attachments" to "anon";

grant references on table "public"."node_attachments" to "anon";

grant select on table "public"."node_attachments" to "anon";

grant trigger on table "public"."node_attachments" to "anon";

grant truncate on table "public"."node_attachments" to "anon";

grant update on table "public"."node_attachments" to "anon";

grant delete on table "public"."node_attachments" to "authenticated";

grant insert on table "public"."node_attachments" to "authenticated";

grant references on table "public"."node_attachments" to "authenticated";

grant select on table "public"."node_attachments" to "authenticated";

grant trigger on table "public"."node_attachments" to "authenticated";

grant truncate on table "public"."node_attachments" to "authenticated";

grant update on table "public"."node_attachments" to "authenticated";

grant delete on table "public"."node_attachments" to "service_role";

grant insert on table "public"."node_attachments" to "service_role";

grant references on table "public"."node_attachments" to "service_role";

grant select on table "public"."node_attachments" to "service_role";

grant trigger on table "public"."node_attachments" to "service_role";

grant truncate on table "public"."node_attachments" to "service_role";

grant update on table "public"."node_attachments" to "service_role";

grant delete on table "public"."node_canvas_link" to "anon";

grant insert on table "public"."node_canvas_link" to "anon";

grant references on table "public"."node_canvas_link" to "anon";

grant select on table "public"."node_canvas_link" to "anon";

grant trigger on table "public"."node_canvas_link" to "anon";

grant truncate on table "public"."node_canvas_link" to "anon";

grant update on table "public"."node_canvas_link" to "anon";

grant delete on table "public"."node_canvas_link" to "authenticated";

grant insert on table "public"."node_canvas_link" to "authenticated";

grant references on table "public"."node_canvas_link" to "authenticated";

grant select on table "public"."node_canvas_link" to "authenticated";

grant trigger on table "public"."node_canvas_link" to "authenticated";

grant truncate on table "public"."node_canvas_link" to "authenticated";

grant update on table "public"."node_canvas_link" to "authenticated";

grant delete on table "public"."node_canvas_link" to "service_role";

grant insert on table "public"."node_canvas_link" to "service_role";

grant references on table "public"."node_canvas_link" to "service_role";

grant select on table "public"."node_canvas_link" to "service_role";

grant trigger on table "public"."node_canvas_link" to "service_role";

grant truncate on table "public"."node_canvas_link" to "service_role";

grant update on table "public"."node_canvas_link" to "service_role";

grant delete on table "public"."node_history" to "anon";

grant insert on table "public"."node_history" to "anon";

grant references on table "public"."node_history" to "anon";

grant select on table "public"."node_history" to "anon";

grant trigger on table "public"."node_history" to "anon";

grant truncate on table "public"."node_history" to "anon";

grant update on table "public"."node_history" to "anon";

grant delete on table "public"."node_history" to "authenticated";

grant insert on table "public"."node_history" to "authenticated";

grant references on table "public"."node_history" to "authenticated";

grant select on table "public"."node_history" to "authenticated";

grant trigger on table "public"."node_history" to "authenticated";

grant truncate on table "public"."node_history" to "authenticated";

grant update on table "public"."node_history" to "authenticated";

grant delete on table "public"."node_history" to "service_role";

grant insert on table "public"."node_history" to "service_role";

grant references on table "public"."node_history" to "service_role";

grant select on table "public"."node_history" to "service_role";

grant trigger on table "public"."node_history" to "service_role";

grant truncate on table "public"."node_history" to "service_role";

grant update on table "public"."node_history" to "service_role";

grant delete on table "public"."node_tags" to "anon";

grant insert on table "public"."node_tags" to "anon";

grant references on table "public"."node_tags" to "anon";

grant select on table "public"."node_tags" to "anon";

grant trigger on table "public"."node_tags" to "anon";

grant truncate on table "public"."node_tags" to "anon";

grant update on table "public"."node_tags" to "anon";

grant delete on table "public"."node_tags" to "authenticated";

grant insert on table "public"."node_tags" to "authenticated";

grant references on table "public"."node_tags" to "authenticated";

grant select on table "public"."node_tags" to "authenticated";

grant trigger on table "public"."node_tags" to "authenticated";

grant truncate on table "public"."node_tags" to "authenticated";

grant update on table "public"."node_tags" to "authenticated";

grant delete on table "public"."node_tags" to "service_role";

grant insert on table "public"."node_tags" to "service_role";

grant references on table "public"."node_tags" to "service_role";

grant select on table "public"."node_tags" to "service_role";

grant trigger on table "public"."node_tags" to "service_role";

grant truncate on table "public"."node_tags" to "service_role";

grant update on table "public"."node_tags" to "service_role";

grant delete on table "public"."nodes" to "anon";

grant insert on table "public"."nodes" to "anon";

grant references on table "public"."nodes" to "anon";

grant select on table "public"."nodes" to "anon";

grant trigger on table "public"."nodes" to "anon";

grant truncate on table "public"."nodes" to "anon";

grant update on table "public"."nodes" to "anon";

grant delete on table "public"."nodes" to "authenticated";

grant insert on table "public"."nodes" to "authenticated";

grant references on table "public"."nodes" to "authenticated";

grant select on table "public"."nodes" to "authenticated";

grant trigger on table "public"."nodes" to "authenticated";

grant truncate on table "public"."nodes" to "authenticated";

grant update on table "public"."nodes" to "authenticated";

grant delete on table "public"."nodes" to "service_role";

grant insert on table "public"."nodes" to "service_role";

grant references on table "public"."nodes" to "service_role";

grant select on table "public"."nodes" to "service_role";

grant trigger on table "public"."nodes" to "service_role";

grant truncate on table "public"."nodes" to "service_role";

grant update on table "public"."nodes" to "service_role";

grant delete on table "public"."note_nodes" to "anon";

grant insert on table "public"."note_nodes" to "anon";

grant references on table "public"."note_nodes" to "anon";

grant select on table "public"."note_nodes" to "anon";

grant trigger on table "public"."note_nodes" to "anon";

grant truncate on table "public"."note_nodes" to "anon";

grant update on table "public"."note_nodes" to "anon";

grant delete on table "public"."note_nodes" to "authenticated";

grant insert on table "public"."note_nodes" to "authenticated";

grant references on table "public"."note_nodes" to "authenticated";

grant select on table "public"."note_nodes" to "authenticated";

grant trigger on table "public"."note_nodes" to "authenticated";

grant truncate on table "public"."note_nodes" to "authenticated";

grant update on table "public"."note_nodes" to "authenticated";

grant delete on table "public"."note_nodes" to "service_role";

grant insert on table "public"."note_nodes" to "service_role";

grant references on table "public"."note_nodes" to "service_role";

grant select on table "public"."note_nodes" to "service_role";

grant trigger on table "public"."note_nodes" to "service_role";

grant truncate on table "public"."note_nodes" to "service_role";

grant update on table "public"."note_nodes" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."table_nodes" to "anon";

grant insert on table "public"."table_nodes" to "anon";

grant references on table "public"."table_nodes" to "anon";

grant select on table "public"."table_nodes" to "anon";

grant trigger on table "public"."table_nodes" to "anon";

grant truncate on table "public"."table_nodes" to "anon";

grant update on table "public"."table_nodes" to "anon";

grant delete on table "public"."table_nodes" to "authenticated";

grant insert on table "public"."table_nodes" to "authenticated";

grant references on table "public"."table_nodes" to "authenticated";

grant select on table "public"."table_nodes" to "authenticated";

grant trigger on table "public"."table_nodes" to "authenticated";

grant truncate on table "public"."table_nodes" to "authenticated";

grant update on table "public"."table_nodes" to "authenticated";

grant delete on table "public"."table_nodes" to "service_role";

grant insert on table "public"."table_nodes" to "service_role";

grant references on table "public"."table_nodes" to "service_role";

grant select on table "public"."table_nodes" to "service_role";

grant trigger on table "public"."table_nodes" to "service_role";

grant truncate on table "public"."table_nodes" to "service_role";

grant update on table "public"."table_nodes" to "service_role";

grant delete on table "public"."task_nodes" to "anon";

grant insert on table "public"."task_nodes" to "anon";

grant references on table "public"."task_nodes" to "anon";

grant select on table "public"."task_nodes" to "anon";

grant trigger on table "public"."task_nodes" to "anon";

grant truncate on table "public"."task_nodes" to "anon";

grant update on table "public"."task_nodes" to "anon";

grant delete on table "public"."task_nodes" to "authenticated";

grant insert on table "public"."task_nodes" to "authenticated";

grant references on table "public"."task_nodes" to "authenticated";

grant select on table "public"."task_nodes" to "authenticated";

grant trigger on table "public"."task_nodes" to "authenticated";

grant truncate on table "public"."task_nodes" to "authenticated";

grant update on table "public"."task_nodes" to "authenticated";

grant delete on table "public"."task_nodes" to "service_role";

grant insert on table "public"."task_nodes" to "service_role";

grant references on table "public"."task_nodes" to "service_role";

grant select on table "public"."task_nodes" to "service_role";

grant trigger on table "public"."task_nodes" to "service_role";

grant truncate on table "public"."task_nodes" to "service_role";

grant update on table "public"."task_nodes" to "service_role";

grant delete on table "public"."workspace_members" to "anon";

grant insert on table "public"."workspace_members" to "anon";

grant references on table "public"."workspace_members" to "anon";

grant select on table "public"."workspace_members" to "anon";

grant trigger on table "public"."workspace_members" to "anon";

grant truncate on table "public"."workspace_members" to "anon";

grant update on table "public"."workspace_members" to "anon";

grant delete on table "public"."workspace_members" to "authenticated";

grant insert on table "public"."workspace_members" to "authenticated";

grant references on table "public"."workspace_members" to "authenticated";

grant select on table "public"."workspace_members" to "authenticated";

grant trigger on table "public"."workspace_members" to "authenticated";

grant truncate on table "public"."workspace_members" to "authenticated";

grant update on table "public"."workspace_members" to "authenticated";

grant delete on table "public"."workspace_members" to "service_role";

grant insert on table "public"."workspace_members" to "service_role";

grant references on table "public"."workspace_members" to "service_role";

grant select on table "public"."workspace_members" to "service_role";

grant trigger on table "public"."workspace_members" to "service_role";

grant truncate on table "public"."workspace_members" to "service_role";

grant update on table "public"."workspace_members" to "service_role";

grant delete on table "public"."workspaces" to "anon";

grant insert on table "public"."workspaces" to "anon";

grant references on table "public"."workspaces" to "anon";

grant select on table "public"."workspaces" to "anon";

grant trigger on table "public"."workspaces" to "anon";

grant truncate on table "public"."workspaces" to "anon";

grant update on table "public"."workspaces" to "anon";

grant delete on table "public"."workspaces" to "authenticated";

grant insert on table "public"."workspaces" to "authenticated";

grant references on table "public"."workspaces" to "authenticated";

grant select on table "public"."workspaces" to "authenticated";

grant trigger on table "public"."workspaces" to "authenticated";

grant truncate on table "public"."workspaces" to "authenticated";

grant update on table "public"."workspaces" to "authenticated";

grant delete on table "public"."workspaces" to "service_role";

grant insert on table "public"."workspaces" to "service_role";

grant references on table "public"."workspaces" to "service_role";

grant select on table "public"."workspaces" to "service_role";

grant trigger on table "public"."workspaces" to "service_role";

grant truncate on table "public"."workspaces" to "service_role";

grant update on table "public"."workspaces" to "service_role";

create policy "Allow authenticated access"
on "public"."draw_nodes"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow authenticated access"
on "public"."node_attachments"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


CREATE TRIGGER delete_drawing_trigger BEFORE DELETE ON public.nodes FOR EACH ROW WHEN ((old.type = 'draw'::node_type)) EXECUTE FUNCTION delete_drawing_from_bucket();

CREATE TRIGGER delete_node_attachments_trigger BEFORE DELETE ON public.nodes FOR EACH ROW EXECUTE FUNCTION delete_node_attachments();

CREATE TRIGGER node_version_trigger BEFORE UPDATE ON public.nodes FOR EACH ROW EXECUTE FUNCTION update_node_version();


