drop policy "Users can access specific nodes through canvas ownership" on "public"."calendar_nodes";

drop policy "Allow authenticated access" on "public"."draw_nodes";

drop policy "Users can access specific nodes through canvas ownership" on "public"."draw_nodes";

drop policy "Users can access edges through canvas ownership" on "public"."edges";

drop policy "Users can submit feedback" on "public"."feedback";

drop policy "Users can view own feedback" on "public"."feedback";

drop policy "Allow authenticated access" on "public"."node_attachments";

drop policy "Users can access node_canvas_link through canvas ownership" on "public"."node_canvas_link";

drop policy "Users can access nodes through canvas ownership" on "public"."nodes";

drop policy "Allow public read-only access." on "public"."prices";

drop policy "Allow public read-only access." on "public"."products";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can view all profiles" on "public"."profiles";

drop policy "Users can access their own projects" on "public"."projects";

drop policy "Can only view own subs data." on "public"."subscriptions";

drop policy "Can update own user data." on "public"."users";

drop policy "Can view own user data." on "public"."users";

drop policy "Users can access workspace memberships" on "public"."workspace_members";

drop policy "Users can access their workspaces" on "public"."workspaces";

create policy "Enable calendar_nodes operations"
on "public"."calendar_nodes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable draw_nodes operations"
on "public"."draw_nodes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable edges operations"
on "public"."edges"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable insights operations"
on "public"."insights"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable node_attachments operations"
on "public"."node_attachments"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable node_canvas_link operations"
on "public"."node_canvas_link"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable node_history operations"
on "public"."node_history"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable node_tags operations"
on "public"."node_tags"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable node operations"
on "public"."nodes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable note_nodes operations"
on "public"."note_nodes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable profiles operations"
on "public"."profiles"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable table_nodes operations"
on "public"."table_nodes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable task_nodes operations"
on "public"."task_nodes"
as permissive
for all
to authenticated
using (true)
with check (true);



