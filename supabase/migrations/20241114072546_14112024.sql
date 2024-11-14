alter table "public"."users" add column "deactivated_at" timestamp with time zone;

alter table "public"."users" add column "is_deactivated" boolean default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.deactivate_user_account(should_deactivate boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    UPDATE users 
    SET 
        is_deactivated = should_deactivate,
        deactivated_at = CASE WHEN should_deactivate THEN now() ELSE NULL END
    WHERE id = v_user_id;

    RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_user_account()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get current user ID from auth context
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Delete workspace related data
    DELETE FROM workspace_members WHERE user_id = v_user_id;
    DELETE FROM workspaces WHERE owner_id = v_user_id;

    -- Delete feedback and insights
    DELETE FROM feedback WHERE user_id = v_user_id;
    DELETE FROM insights WHERE user_id = v_user_id;

    -- Delete projects
    DELETE FROM projects WHERE user_id = v_user_id;

    -- Delete subscription related data
    DELETE FROM subscriptions WHERE user_id = v_user_id;
    DELETE FROM customers WHERE id = v_user_id;

    -- Delete node-related data for all user's canvases
    DELETE FROM node_tags 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM node_history 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM node_attachments 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM calendar_nodes 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM draw_nodes 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM note_nodes 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM table_nodes 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    DELETE FROM task_nodes 
    WHERE node_id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    -- Delete edges
    DELETE FROM edges 
    WHERE canvas_id IN (
        SELECT id FROM canvases WHERE user_id = v_user_id
    );

    -- Delete node_canvas_link entries
    DELETE FROM node_canvas_link 
    WHERE canvas_id IN (
        SELECT id FROM canvases WHERE user_id = v_user_id
    );

    -- Delete nodes
    DELETE FROM nodes 
    WHERE id IN (
        SELECT node_id 
        FROM node_canvas_link 
        WHERE canvas_id IN (
            SELECT id FROM canvases WHERE user_id = v_user_id
        )
    );

    -- Delete canvases
    DELETE FROM canvases WHERE user_id = v_user_id;

    -- Delete profile
    DELETE FROM profiles WHERE id = v_user_id;

    -- Delete user
    DELETE FROM users WHERE id = v_user_id;

       -- Delete from auth.users LAST (this is the key change)
    DELETE FROM auth.users WHERE id = v_user_id;

    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in delete_user_account: %', SQLERRM;
    RAISE EXCEPTION 'Failed to delete account data: %', SQLERRM;
END;
$function$
;

create policy "Prevent deactivated users from modifying data"
on "public"."canvases"
as permissive
for all
to authenticated
using ((NOT (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.is_deactivated = true))))));



