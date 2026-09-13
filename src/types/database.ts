// Auto-generated types for Supabase database
// Re-run: supabase gen types typescript --project-id YOUR_PROJECT_ID

export type DocumentStatus =
  | 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'converted'
  | 'paid' | 'partially_paid' | 'unpaid' | 'overdue' | 'cancelled'

export type MemberRole = 'owner' | 'admin' | 'accountant' | 'employee' | 'viewer'
export type PaymentMethod = 'cash' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'check' | 'card' | 'other'
export type ProductType = 'product' | 'service'
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'business'

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: OrganizationInsert; Update: OrganizationUpdate }
      user_profiles: { Row: UserProfile; Insert: UserProfileInsert; Update: UserProfileUpdate }
      organization_members: { Row: OrganizationMember; Insert: OrganizationMemberInsert; Update: Partial<OrganizationMember> }
      clients: { Row: Client; Insert: ClientInsert; Update: ClientUpdate }
      client_contacts: { Row: ClientContact; Insert: ClientContactInsert; Update: Partial<ClientContact> }
      products: { Row: Product; Insert: ProductInsert; Update: ProductUpdate }
      product_categories: { Row: ProductCategory; Insert: ProductCategoryInsert; Update: Partial<ProductCategory> }
      taxes: { Row: Tax; Insert: TaxInsert; Update: Partial<Tax> }
      quotes: { Row: Quote; Insert: QuoteInsert; Update: QuoteUpdate }
      quote_items: { Row: QuoteItem; Insert: QuoteItemInsert; Update: Partial<QuoteItem> }
      invoices: { Row: Invoice; Insert: InvoiceInsert; Update: InvoiceUpdate }
      invoice_items: { Row: InvoiceItem; Insert: InvoiceItemInsert; Update: Partial<InvoiceItem> }
      payments: { Row: Payment; Insert: PaymentInsert; Update: Partial<Payment> }
      receipts: { Row: Receipt; Insert: ReceiptInsert; Update: Partial<Receipt> }
      purchase_orders: { Row: PurchaseOrder; Insert: PurchaseOrderInsert; Update: PurchaseOrderUpdate }
      purchase_order_items: { Row: PurchaseOrderItem; Insert: PurchaseOrderItemInsert; Update: Partial<PurchaseOrderItem> }
      document_sequences: { Row: DocumentSequence; Insert: DocumentSequenceInsert; Update: Partial<DocumentSequence> }
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> }
      subscription_plans: { Row: SubscriptionPlanRow; Insert: never; Update: never }
      notifications: { Row: Notification; Insert: NotificationInsert; Update: Partial<Notification> }
      audit_logs: { Row: AuditLog; Insert: AuditLogInsert; Update: never }
    }
    Functions: {
      next_document_number: { Args: { p_org_id: string; p_type: string }; Returns: string }
      create_organization_onboarding: {
        Args: {
          p_name: string; p_address?: string | null; p_city?: string | null; p_country?: string | null
          p_phone?: string | null; p_email?: string | null; p_website?: string | null; p_nif?: string | null
          p_tax_regime?: string | null; p_currency?: string | null; p_default_vat?: number
          p_invoice_prefix?: string; p_quote_prefix?: string; p_receipt_prefix?: string; p_po_prefix?: string
        }
        Returns: Organization
      }
      user_org_ids: { Args: Record<never, never>; Returns: string[] }
    }
  }
}

export interface Organization {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  address: string | null
  city: string | null
  country: string
  phone: string | null
  email: string | null
  website: string | null
  nif: string | null
  tax_regime: string | null
  currency: string
  default_vat: number
  bank_name: string | null
  bank_account: string | null
  bank_iban: string | null
  bank_swift: string | null
  payment_terms: string
  invoice_notes: string | null
  invoice_footer: string | null
  primary_color: string
  secondary_color: string
  default_template: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}
export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'>
export type OrganizationUpdate = Partial<OrganizationInsert>

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  locale: string
  theme: string
  created_at: string
  updated_at: string
}
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at'>
export type UserProfileUpdate = Partial<UserProfileInsert>

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: MemberRole
  invited_email: string | null
  accepted: boolean
  created_at: string
}
export type OrganizationMemberInsert = Omit<OrganizationMember, 'id' | 'created_at'>

export interface Client {
  id: string
  organization_id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  country: string | null
  nif: string | null
  tax_number: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<ClientInsert>

export interface ClientContact {
  id: string
  client_id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  created_at: string
}
export type ClientContactInsert = Omit<ClientContact, 'id' | 'created_at'>

export interface ProductCategory {
  id: string
  organization_id: string
  name: string
  color: string | null
  created_at: string
}
export type ProductCategoryInsert = Omit<ProductCategory, 'id' | 'created_at'>

export interface Product {
  id: string
  organization_id: string
  name: string
  description: string | null
  sku: string | null
  type: ProductType
  category_id: string | null
  unit: string
  price_ht: number
  tax_rate: number
  price_ttc: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type ProductInsert = Omit<Product, 'id' | 'price_ttc' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>

export interface Tax {
  id: string
  organization_id: string
  name: string
  rate: number
  is_default: boolean
  created_at: string
}
export type TaxInsert = Omit<Tax, 'id' | 'created_at'>

export interface DocumentSequence {
  id: string
  organization_id: string
  type: string
  prefix: string
  include_year: boolean
  include_month: boolean
  padding: number
  current_value: number
  reset_period: string
  last_reset: string
}
export type DocumentSequenceInsert = Omit<DocumentSequence, 'id'>

export interface Quote {
  id: string
  organization_id: string
  client_id: string | null
  number: string
  status: DocumentStatus
  date: string
  expiry_date: string | null
  reference: string | null
  notes: string | null
  conditions: string | null
  subtotal_ht: number
  total_discount: number
  total_tax: number
  total_ttc: number
  currency: string
  template: string
  converted_to_invoice_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
export type QuoteInsert = Omit<Quote, 'id' | 'created_at' | 'updated_at'>
export type QuoteUpdate = Partial<QuoteInsert>

export interface QuoteItem {
  id: string
  quote_id: string
  product_id: string | null
  description: string
  quantity: number
  unit: string
  unit_price: number
  discount_pct: number
  discount_amt: number
  tax_rate: number
  line_ht: number
  line_tax: number | null
  line_ttc: number | null
  position: number
}
export type QuoteItemInsert = Omit<QuoteItem, 'id' | 'line_ht'>

export interface Invoice {
  id: string
  organization_id: string
  client_id: string | null
  quote_id: string | null
  number: string
  status: DocumentStatus
  date: string
  due_date: string | null
  reference: string | null
  payment_terms: string | null
  notes: string | null
  conditions: string | null
  subtotal_ht: number
  total_discount: number
  total_tax: number
  total_ttc: number
  amount_paid: number
  amount_due: number
  currency: string
  template: string
  sent_at: string | null
  paid_at: string | null
  cancelled_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
export type InvoiceInsert = Omit<Invoice, 'id' | 'amount_due' | 'created_at' | 'updated_at'>
export type InvoiceUpdate = Partial<InvoiceInsert>

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: number
  unit: string
  unit_price: number
  discount_pct: number
  discount_amt: number
  tax_rate: number
  line_ht: number | null
  line_tax: number | null
  line_ttc: number | null
  position: number
}
export type InvoiceItemInsert = Omit<InvoiceItem, 'id'>

export interface Payment {
  id: string
  organization_id: string
  invoice_id: string
  amount: number
  method: PaymentMethod
  reference: string | null
  date: string
  notes: string | null
  created_by: string | null
  created_at: string
}
export type PaymentInsert = Omit<Payment, 'id' | 'created_at'>

export interface Receipt {
  id: string
  organization_id: string
  invoice_id: string | null
  payment_id: string | null
  client_id: string | null
  number: string
  date: string
  amount: number
  method: PaymentMethod
  reference: string | null
  notes: string | null
  currency: string
  template: string
  created_by: string | null
  created_at: string
}
export type ReceiptInsert = Omit<Receipt, 'id' | 'created_at'>

export interface PurchaseOrder {
  id: string
  organization_id: string
  client_id: string | null
  number: string
  status: DocumentStatus
  date: string
  expected_date: string | null
  reference: string | null
  notes: string | null
  subtotal_ht: number
  total_discount: number
  total_tax: number
  total_ttc: number
  currency: string
  template: string
  converted_to_invoice_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
export type PurchaseOrderInsert = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>
export type PurchaseOrderUpdate = Partial<PurchaseOrderInsert>

export interface PurchaseOrderItem {
  id: string
  po_id: string
  product_id: string | null
  description: string
  quantity: number
  unit: string
  unit_price: number
  discount_pct: number
  discount_amt: number
  tax_rate: number
  line_ht: number | null
  line_tax: number | null
  line_ttc: number | null
  position: number
}
export type PurchaseOrderItemInsert = Omit<PurchaseOrderItem, 'id'>

export interface Subscription {
  id: string
  organization_id: string
  plan: SubscriptionPlan
  status: string
  trial_ends_at: string | null
  current_period_start: string
  current_period_end: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionPlanRow {
  id: string
  name: SubscriptionPlan
  label: string
  price_monthly: number
  max_invoices: number
  max_clients: number
  max_products: number
  max_users: number
  max_templates: number
  has_statistics: boolean
  has_export: boolean
  has_custom_branding: boolean
  created_at: string
}

export interface Notification {
  id: string
  organization_id: string
  user_id: string | null
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>

export interface AuditLog {
  id: string
  organization_id: string | null
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>
