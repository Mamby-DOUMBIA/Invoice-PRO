-- Create an organization and its owner-owned defaults in one transaction.
-- This is intentionally a SECURITY DEFINER function: a new user has no member
-- record yet, so ordinary RLS rules cannot permit the first membership insert.
create or replace function create_organization_onboarding(
  p_name text,
  p_address text default null,
  p_city text default null,
  p_country text default 'ML',
  p_phone text default null,
  p_email text default null,
  p_website text default null,
  p_nif text default null,
  p_tax_regime text default null,
  p_currency text default 'XOF',
  p_default_vat numeric default 18,
  p_invoice_prefix text default 'FAC',
  p_quote_prefix text default 'DEV',
  p_receipt_prefix text default 'REC',
  p_po_prefix text default 'BC'
) returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org organizations;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to create an organization';
  end if;

  -- Make a retry after a network interruption safe: a user owns one workspace
  -- during onboarding and receives that existing workspace back.
  select o.* into v_org
  from organizations o
  join organization_members m on m.organization_id = o.id
  where m.user_id = auth.uid() and m.accepted = true
  order by m.created_at asc
  limit 1;

  if found then
    return v_org;
  end if;

  insert into organizations (
    name, address, city, country, phone, email, website, nif, tax_regime,
    currency, default_vat, onboarding_completed
  ) values (
    p_name, p_address, p_city, coalesce(p_country, 'ML'), p_phone, p_email,
    p_website, p_nif, p_tax_regime, p_currency, p_default_vat, true
  ) returning * into v_org;

  insert into organization_members (organization_id, user_id, role, accepted)
  values (v_org.id, auth.uid(), 'owner', true);

  insert into document_sequences (organization_id, type, prefix, include_year, padding, reset_period)
  values
    (v_org.id, 'invoice', p_invoice_prefix, true, 4, 'yearly'),
    (v_org.id, 'quote', p_quote_prefix, true, 4, 'yearly'),
    (v_org.id, 'receipt', p_receipt_prefix, true, 4, 'yearly'),
    (v_org.id, 'purchase_order', p_po_prefix, true, 4, 'yearly');

  if p_default_vat > 0 then
    insert into taxes (organization_id, name, rate, is_default)
    values (v_org.id, format('TVA %s%%', p_default_vat), p_default_vat, true);
  end if;

  insert into subscriptions (organization_id, plan, status)
  values (v_org.id, 'free', 'active');

  return v_org;
end;
$$;

revoke all on function create_organization_onboarding(text, text, text, text, text, text, text, text, text, text, numeric, text, text, text, text) from public, anon;
grant execute on function create_organization_onboarding(text, text, text, text, text, text, text, text, text, text, numeric, text, text, text, text) to authenticated;
