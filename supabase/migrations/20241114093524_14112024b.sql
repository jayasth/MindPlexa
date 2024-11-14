drop policy "Prevent deactivated users from modifying data" on "public"."canvases";

drop policy "Users can delete own canvases" on "public"."canvases";

drop policy "Users can insert own canvases" on "public"."canvases";

drop policy "Users can update own canvases" on "public"."canvases";

drop policy "Users can view own canvases" on "public"."canvases";

create policy "Users can delete own canvases"
on "public"."canvases"
as permissive
for delete
to authenticated
using ((user_id = auth.uid()));


create policy "Users can insert own canvases"
on "public"."canvases"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Users can update own canvases"
on "public"."canvases"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "Users can view own canvases"
on "public"."canvases"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));



