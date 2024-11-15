alter table "public"."nodes" add column "created_by" uuid;

alter table "public"."nodes" add constraint "nodes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."nodes" validate constraint "nodes_created_by_fkey";


