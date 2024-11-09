create type "public"."feedback_type" as enum ('bug', 'feature', 'other');

create table "public"."feedback" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "content" text not null,
    "type" feedback_type not null,
    "image_url" text,
    "is_anonymous" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


CREATE UNIQUE INDEX feedback_pkey ON public.feedback USING btree (id);

alter table "public"."feedback" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."feedback" add constraint "feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."feedback" validate constraint "feedback_user_id_fkey";

grant delete on table "public"."feedback" to "anon";

grant insert on table "public"."feedback" to "anon";

grant references on table "public"."feedback" to "anon";

grant select on table "public"."feedback" to "anon";

grant trigger on table "public"."feedback" to "anon";

grant truncate on table "public"."feedback" to "anon";

grant update on table "public"."feedback" to "anon";

grant delete on table "public"."feedback" to "authenticated";

grant insert on table "public"."feedback" to "authenticated";

grant references on table "public"."feedback" to "authenticated";

grant select on table "public"."feedback" to "authenticated";

grant trigger on table "public"."feedback" to "authenticated";

grant truncate on table "public"."feedback" to "authenticated";

grant update on table "public"."feedback" to "authenticated";

grant delete on table "public"."feedback" to "service_role";

grant insert on table "public"."feedback" to "service_role";

grant references on table "public"."feedback" to "service_role";

grant select on table "public"."feedback" to "service_role";

grant trigger on table "public"."feedback" to "service_role";

grant truncate on table "public"."feedback" to "service_role";

grant update on table "public"."feedback" to "service_role";


