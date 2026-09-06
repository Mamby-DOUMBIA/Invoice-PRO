-- Avoid recursive evaluation of organization_members policies.
create or replace function is_org_manager(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members
    where organization_id = p_organization_id
      and user_id = auth.uid()
      and accepted = true
      and role in ('owner', 'admin')
  );
$$;

drop policy if exists "owner_manage_members" on organization_members;

create policy "owner_manage_members" on organization_members
for all
using (is_org_manager(organization_id))
with check (is_org_manager(organization_id));