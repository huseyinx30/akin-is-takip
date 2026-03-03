export type UserRole = 'admin' | 'personel' | 'ekip'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  phone?: string
  whatsapp?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  tax_number?: string
  tax_office?: string
  address?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface City {
  id: string
  name: string
  code?: string
}

export interface Project {
  id: string
  company_id: string
  city_id: string
  name: string
  description?: string
  status: 'aktif' | 'tamamlandi' | 'beklemede'
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export type ServiceType = 'kurulum' | 'montaj' | 'servis' | 'demontaj'

export interface ProjectService {
  id: string
  project_id: string
  service_type: ServiceType
  description?: string
  status: 'planlandi' | 'devam' | 'tamamlandi'
  assigned_personel_id?: string
  assigned_ekip_id?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  company_id: string
  invoice_no: string
  invoice_date: string
  total_amount: number
  currency: string
  status: 'kesildi' | 'odendi' | 'beklemede'
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProgressPayment {
  id: string
  invoice_id?: string
  project_id: string
  amount: number
  payment_date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  unit?: string
  purchase_price: number
  sale_price: number
  stock?: number
  created_at: string
  updated_at: string
}

export interface ProductPurchase {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_amount: number
  purchase_date: string
  supplier?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type ExpenseCategory = 'demirbas' | 'giyim' | 'arac_vergi' | 'yakıt' | 'yemek' | 'diger'

export interface CompanyExpense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PersonnelExpense {
  id: string
  personel_id: string
  category: string
  description: string
  amount: number
  expense_date: string
  location?: string
  city_id?: string
  status: 'beklemede' | 'onaylandi' | 'reddedildi'
  approved_by?: string
  approved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TeamExpense {
  id: string
  ekip_id: string
  category: string
  description: string
  amount: number
  expense_date: string
  location?: string
  city_id?: string
  status: 'beklemede' | 'onaylandi' | 'reddedildi'
  approved_by?: string
  approved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface WorkLog {
  id: string
  personel_id?: string
  ekip_id?: string
  project_id: string
  city_id: string
  work_date: string
  description: string
  work_type: ServiceType
  work_quantity?: number
  status: 'beklemede' | 'onaylandi' | 'reddedildi'
  hakedis_yapildi?: boolean
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}
