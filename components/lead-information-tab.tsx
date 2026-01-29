  "use client"

  import { useState, useEffect } from "react"
  import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
  import { Button } from "./ui/button"
  import { Input } from "./ui/input"
  import { Label } from "./ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
  import { Textarea } from "./ui/textarea"
  import { Badge } from "./ui/badge"
  import { useRouter } from "next/navigation"
  import { useSearchParams } from "next/navigation"
  import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
  import {
    User,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    Clock,
    FileText,
    Target,
    DollarSign,
    MessageSquare,
    Activity,
    Filter,
    Search,
    Receipt,
    Plus,
    Download,
    Eye,
    ChevronDown,
    ChevronRight,
    Save,
    Loader2,
    CalendarDays,
    Scale,
    Heart,
    TargetIcon,
    Wallet,
    MessageCircle,
    FileEdit,
    BarChart3
  } from "lucide-react"
  import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
  import { createClient } from '@supabase/supabase-js'
  import { toast } from "sonner"

  // Types
  interface Lead {
    id: string
    name: string
    email: string
    phone_number: string
    city: string
    profession: string
    status: string
    source: string
    counselor: string
    priority: string
    lead_score: number
    conversion_probability: string
    follow_up_date: string
    last_activity_date: string
    budget: string
    timezone: string
    notes: string
    created_at: string
    updated_at: string
  }

  interface User {
    id: string
    email: string
    phone: string
    first_name: string
    last_name: string
    profile_image_url?: string
  }

  interface LeadInfo {
    id?: string
    lead_id: string
    user_id?: string
    alternate_phone?: string
    pincode?: string
    emergency_contact?: string
    preferred_language?: string
    timezone?: string
    best_time_to_connect?: string
    engagement_level?: string
    total_interactions?: number
    current_weight?: string
    target_weight?: string
    weight_to_lose?: string
    want_to_lose?: boolean
    fitness_goals?: string[]
    dietary_restrictions?: string
    medical_conditions?: string
    previous_experience?: string
    motivation_level?: string
    commitment_level?: string
    investment_confidence?: string
    budget_range?: string
    investment_amount?: string
    payment_preference?: string
    how_did_you_hear?: string
    referred_by?: string
    specific_concerns?: string
    availability_schedule?: string
    social_media_handle?: string
    interaction_history?: InteractionHistory[]
    comments?: string
    internal_notes?: string
    tags?: string[]
  }

  interface InteractionHistory {
    id?: string
    date: string
    type: string
    notes: string
  }

  interface PaymentHistory {
    id: string
    amount: number
    currency: string
    description: string
    status: string
    created_at: string
    payment_method?: string
    type: 'payment_link' | 'manual_payment'
  }

  interface Bill {
    id: string
    bill_number: string
    package_name: string
    description: string
    base_amount: number
    
    // New fields
    discount_type?: 'percentage' | 'fixed'
    discount_value?: number
    paid_amount: number
    balance: number
    
    // Existing fields
    bill_type: 'gst' | 'non-gst'
    gst_number?: string
    gst_rate?: number
    gst_amount?: number
    total_amount: number
    place_of_supply?: string
    payment_method?: string
    
    // New follow-up date
    due_date: string
    follow_up_date?: string
    
    // Status fields
    payment_status: string
    status: string
    bill_date: string
    
    // New comments field
    payment_comments?: string
    
    created_at: string
  }

  interface LeadStatus {
    id: string
    lead_id: string
    status: string
    follow_up_date?: string
    expected_amount?: number
    notes?: string
    changed_by?: string
    changed_by_name?: string
    changed_by_email?: string
    created_at: string
    updated_at: string
  }

  interface LeadNote {
    id: string
    lead_id: string
    note_type: 'internal' | 'external'
    note: string
    created_by: string
    created_by_name?: string
    created_by_email?: string
    created_at: string
  }

  export default function LeadInformationTab() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // State management
    const [leads, setLeads] = useState<Lead[]>([])
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
    const [bills, setBills] = useState<Bill[]>([])
    const [statusHistory, setStatusHistory] = useState<LeadStatus[]>([])
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState({
    status: "",
    follow_up_date: "",
    expected_amount: "",
    notes: ""
  })

    // UI State
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sourceFilter, setSourceFilter] = useState("all")

    const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: ""
  })
  const [cityFilter, setCityFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [counselorFilter, setCounselorFilter] = useState("all")

    const [showBillGenerator, setShowBillGenerator] = useState(false)
    const [showInteractionForm, setShowInteractionForm] = useState(false)
    const totalPaidAmount = bills.reduce((sum, bill) => sum + bill.paid_amount, 0);
  const totalBalance = bills.reduce((sum, bill) => sum + bill.balance, 0);
    const SUPERADMIN_ROLE    = 'b00060fe-175a-459b-8f72-957055ee8c55'
    const ADMIN_ROLE         = '46e786df-0272-4f22-aec2-56d2a517fa9d'
    const SALES_MANAGER_ROLE = '11b93954-9a56-4ea5-a02c-15b731ee9dfb'
    const EXECUTIVE_ROLE     = '1fe1759c-dc14-4933-947a-c240c046bcde'
    const [leadNotes, setLeadNotes] = useState<LeadNote[]>([])
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNote, setNewNote] = useState({
    note_type: 'external' as 'internal' | 'external',
    note: ''
  })
  const LEAD_STATUSES = [
    'New',
    'In Follow Up',
    'Expected Payment',
    'Not Responding',
    'Yet To Talk',
    'Booked',
    'Hot',
    'Warm',
    'App. Failed',
    'Converted',
    'Trial Booked',
    'Successful Trial',
    'Cold(Joined Other)',
    'Cold(Price Issue)',
    'Lost (Wrong Info)',
    'Lost(Irrelevant)'
  ]

  const STATUSES_REQUIRING_FOLLOWUP = [
  'In Follow Up',
  'Expected Payment',
  'Not Responding',
  'Booked',
  'Hot',
  'Warm',
  'App. Failed',
  'Converted',
  'Trial Booked',
  'Successful Trial',
  'Cold(Joined Other)',
 
]

    // Form states
  const [newBill, setNewBill] = useState({
    package_name: "",
    base_amount: "",
    description: "",
    
    // Discount fields
    discount_type: "percentage" as 'percentage' | 'fixed',
    discount_value: "",
    
    // Payment tracking
    paid_amount: "0",
    
    // GST and due date
    due_date: "",
    follow_up_date: "",
    payment_method: "Credit Card",
    bill_type: "non-gst" as 'gst' | 'non-gst',
    gst_number: "",
    gst_rate: "5", // Fixed to 5%
    place_of_supply: "",
    
    // Comments
    payment_comments: ""
  })
    
 const [newInteraction, setNewInteraction] = useState({
  date: new Date().toISOString(), // Store full timestamp
  type: "",
  notes: ""
})
    
    const [collapsedSections, setCollapsedSections] = useState({
      leadDetails: true,
      additionalInfo: true,
      interactionAndNotes: true,
      billing: true,
    })

    // Fetch all leads (with role‑based filter)
  const fetchLeads = async () => {
    setLoading(true)
    try {
      console.log('Fetching leads...')
      
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Auth error:', authError)
        throw authError ?? new Error('No user session')
      }

      const raw = localStorage.getItem('userProfile')
      const roleId = raw ? JSON.parse(raw).role_id : null
      console.log('User role ID:', roleId)

      // Build query
      let query = supabase.from('leads').select('*')

      if (roleId === EXECUTIVE_ROLE) {
        console.log('Filtering leads for executive')
        const { data: assignments, error: assignErr } = await supabase
          .from('lead_assignments')
          .select('lead_id')
          .eq('assigned_to', authUser.id)
        
        if (assignErr) {
          console.error('Assignment error:', assignErr)
          throw assignErr
        }

        const ids = (assignments || []).map(a => a.lead_id)
        console.log('Assigned lead IDs:', ids)
        
        if (ids.length === 0) {
          console.log('No assigned leads for executive')
          setLeads([])
          setLoading(false)
          return
        }
        query = query.in('id', ids)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error('Query error:', error)
        throw error
      }

      console.log('Fetched leads:', data?.length || 0)
      setLeads(data || [])
      
      // Check if we need to select a lead from URL
      const leadId = searchParams.get('leadId')
      const tab = searchParams.get('tab')
      
      if (tab === 'lead-information' && leadId && data && data.length > 0) {
        const leadExists = data.find(l => l.id === leadId)
        if (leadExists) {
          console.log('Loading lead from URL:', leadId)
          // Use setTimeout to avoid state update conflicts
          setTimeout(() => {
            handleLeadSelection(leadId)
          }, 100)
        }
      } else if (data && data.length > 0 && !selectedLead) {
        // Auto-select first lead
        console.log('Auto-selecting first lead')
        setTimeout(() => {
          handleLeadSelection(data[0].id)
        }, 100)
      }
      
    } catch (err: any) {
      console.error('Error fetching leads:', err)
      toast.error('Failed to fetch leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

    // Find user by lead phone/email
  const findUserByLead = async (lead: Lead) => {
    try {
      // First try by email
      if (lead.email) {
        const { data: emailData, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', lead.email)
          .single()
        
        if (!emailError && emailData) {
          return emailData
        }
      }
      
      // Then try by phone
      if (lead.phone_number) {
        const { data: phoneData, error: phoneError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', lead.phone_number)
          .single()
        
        if (!phoneError && phoneData) {
          return phoneData
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding user:', error)
      return null
    }
  }

    // Fetch lead info
    const fetchLeadInfo = async (leadId: string) => {
      try {
        const { data, error } = await supabase
          .from('lead_info')
          .select('*')
          .eq('lead_id', leadId)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data
      } catch (error) {
        console.error('Error fetching lead info:', error)
        return null
      }
    }

    // Fetch payment history
  const fetchPaymentHistory = async (userId: string) => {
    try {
      console.log('Fetching payment history for user:', userId)
      
      const [paymentLinksResult, manualPaymentsResult] = await Promise.all([
        supabase
          .from('payment_links')
          .select('id, amount, currency, description, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('manual_payment')
          .select('id, amount, currency, description, payment_method, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ])

      const paymentLinks = (paymentLinksResult.data || []).map(p => ({
        ...p,
        type: 'payment_link' as const
      }))
      
      const manualPayments = (manualPaymentsResult.data || []).map(p => ({
        ...p,
        type: 'manual_payment' as const
      }))

      console.log('Payment links:', paymentLinks.length, 'Manual payments:', manualPayments.length)
      return [...paymentLinks, ...manualPayments]
    } catch (error) { 
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  // Fetch bills
    const fetchBills = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error fetching bills:', error)
        return []
      }
    }

    // Fetch lead status history with user information
    const fetchLeadStatusHistory = async (leadId: string) => {
      try {
        const { data: statusData, error: statusError } = await supabase
          .from('lead_status')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
        
        if (statusError) throw statusError
        
        if (!statusData || statusData.length === 0) return []

        // Fetch user information for each status change
        const userIds = [...new Set(statusData.map(s => s.changed_by).filter(Boolean))]
        
        if (userIds.length === 0) return statusData

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds)
        
        if (userError) {
          console.error('Error fetching user data:', userError)
          return statusData
        }

        // Map user data to status data
        const userMap = new Map(userData?.map(u => [u.id, u]) || [])
        
  return statusData.map(status => {
    const user = status.changed_by ? userMap.get(status.changed_by) : null
    return {
      ...status,
      changed_by_name: user?.email || 'System',
      changed_by_email: user?.email || ''
    }
        })
      } catch (error) {
        console.error('Error fetching status history:', error)
        return []
      }
    }

    // Fetch lead notes with user information
  const fetchLeadNotes = async (leadId: string) => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      
      if (notesError) throw notesError
      
      if (!notesData || notesData.length === 0) return []

      // Fetch user information for each note
      const userIds = [...new Set(notesData.map(n => n.created_by).filter(Boolean))]
      
      if (userIds.length === 0) return notesData

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
      
      if (userError) {
        console.error('Error fetching user data:', userError)
        return notesData
      }

      // Map user data to notes
      const userMap = new Map(userData?.map(u => [u.id, u]) || [])
      
      return notesData.map(note => {
        const user = note.created_by ? userMap.get(note.created_by) : null
        return {
          ...note,
          created_by_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'System',
          created_by_email: user?.email || ''
        }
      })
    } catch (error) {
      console.error('Error fetching lead notes:', error)
      return []
    }
  }

  // Add new note
  const addLeadNote = async () => {
    if (!selectedLead || !newNote.note.trim()) {
      toast.error('Please enter a note')
      return
    }

    setSaving(true)
    try {
      const {
        data: { user: authUser },
        error: authErr
      } = await supabase.auth.getUser()

      if (authErr || !authUser) {
        toast.error("User session not found")
        return
      }

      const noteData = {
        lead_id: selectedLead.id,
        note_type: newNote.note_type,
        note: newNote.note.trim(),
        created_by: authUser.id
      }

      const { data, error } = await supabase
        .from('lead_notes')
        .insert([noteData])
        .select()
        .single()

      if (error) throw error

      // Fetch updated notes with user info
      const updatedNotes = await fetchLeadNotes(selectedLead.id)
      setLeadNotes(updatedNotes)
      
      // Reset form
      setNewNote({
        note_type: 'external',
        note: ''
      })
      setShowNoteForm(false)
      
      toast.success('Note added successfully')
    } catch (error: any) {
      console.error('Error adding note:', error)
      toast.error(`Failed to add note: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

    // Save lead status change
   const saveStatusChange = async () => {
  if (!selectedLead || !newStatus.status) {
    toast.error('Please select a status')
    return
  }

  // Validate follow-up date for statuses that require it
  if (STATUSES_REQUIRING_FOLLOWUP.includes(newStatus.status) && !newStatus.follow_up_date) {
    toast.error('Follow-up date is required for this status')
    return
  }

  // Validate follow-up date is not in the past
  if (newStatus.follow_up_date) {
    const followUpDate = new Date(newStatus.follow_up_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison
    
    if (followUpDate < today) {
      toast.error('Follow-up date cannot be in the past')
      return
    }
  }

  // Validate expected amount for Expected Payment status
  if (newStatus.status === 'Expected Payment') {
    if (!newStatus.expected_amount || parseFloat(newStatus.expected_amount) <= 0) {
      toast.error('Expected payment amount is required for Expected Payment status')
      return
    }
  }

  setSaving(true)
      try {
  const {
    data: { user: authUser },
    error: authErr
  } = await supabase.auth.getUser()

  if (authErr || !authUser) {
    toast.error("User session not found")
    return
  }
        const statusData = {
          lead_id: selectedLead.id,
          status: newStatus.status,
          follow_up_date: newStatus.follow_up_date || null,
          expected_amount: newStatus.expected_amount ? parseFloat(newStatus.expected_amount) : null,
          notes: newStatus.notes || null,
          changed_by: authUser?.id
        }

        const { data, error } = await supabase
          .from('lead_status')
          .insert([statusData])
          .select()
          .single()

        if (error) throw error

        // Update the lead's current status in the leads table
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            status: newStatus.status,
            follow_up_date: newStatus.follow_up_date || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedLead.id)

        if (updateError) throw updateError

        // Fetch updated status history with user info
        const updatedHistory = await fetchLeadStatusHistory(selectedLead.id)
        setStatusHistory(updatedHistory)
        
        setSelectedLead(prev => prev ? { 
          ...prev, 
          status: newStatus.status,
          follow_up_date: newStatus.follow_up_date || prev.follow_up_date 
        } : null)

        // Reset form
        setNewStatus({
          status: "",
          follow_up_date: "",
          expected_amount: "",
          notes: ""
        })
        setShowStatusDialog(false)
        
        toast.success('Status updated successfully')
      } catch (error: any) {
        console.error('Error saving status:', error)
        toast.error(`Failed to update status: ${error.message || 'Unknown error'}`)
      } finally {
        setSaving(false)
      }
    }


    // Handle lead selection
  const handleLeadSelection = async (leadId: string) => {
    console.log('handleLeadSelection called with:', leadId)
    
    if (!leadId || leadId === selectedLead?.id) {
      console.log('Same lead selected or no leadId')
      return
    }
    
    setLoading(true)
    try {
      // Update URL
      router.replace(`?tab=lead-information&leadId=${leadId}`, { scroll: false })
      
      const lead = leads.find(l => l.id === leadId)
      if (!lead) {
        console.log('Lead not found in leads array')
        toast.error('Lead not found')
        return
      }

      console.log('Setting selected lead:', lead.name)
      setSelectedLead(lead)
      
      // Reset previous data
      setUser(null)
      setPaymentHistory([])
      setBills([])
      
      // Find associated user
      const userData = await findUserByLead(lead)
      console.log('User found:', userData?.email || 'No user found')
      setUser(userData)
      
      // Fetch lead info
      let leadInfoData = await fetchLeadInfo(leadId)
      console.log('Lead info fetched:', leadInfoData ? 'Yes' : 'No')
      
      if (!leadInfoData) {
        // Create default lead info
        leadInfoData = {
          lead_id: leadId,
          user_id: userData?.id,
          interaction_history: [],
          tags: [],
          fitness_goals: [],
          total_interactions: 0
        }
      }
      
      setLeadInfo(leadInfoData)
      
      // Fetch payment history and bills if user exists
      if (userData?.id) {
        console.log('Fetching payment history and bills for user:', userData.id)
        try {
          const [paymentHistoryData, billsData] = await Promise.all([
            fetchPaymentHistory(userData.id),
            fetchBills(userData.id)
          ])
          setPaymentHistory(paymentHistoryData || [])
          setBills(billsData || [])
          console.log('Payment history:', paymentHistoryData?.length || 0, 'items')
          console.log('Bills:', billsData?.length || 0, 'items')
        } catch (error) {
          console.error('Error fetching payment data:', error)
          setPaymentHistory([])
          setBills([])
        }
      } else {
        console.log('No user ID, clearing payment data')
        setPaymentHistory([])
        setBills([])
      }
      
    } catch (error: any) {
      console.error('Error in handleLeadSelection:', error)
      toast.error(`Failed to load lead information: ${error.message || 'Unknown error'}`)
    } finally {
      // Fetch lead status history
  const statusHistoryData = await fetchLeadStatusHistory(leadId)
  setStatusHistory(statusHistoryData || [])
  console.log('Status history:', statusHistoryData?.length || 0, 'items')
      setLoading(false)
    const notesData = await fetchLeadNotes(leadId)
  setLeadNotes(notesData || [])
  console.log('Lead notes:', notesData?.length || 0, 'items')
    }
  }

    // Save lead info
    const saveLeadInfo = async () => {
      if (!leadInfo || !selectedLead) return
      
      setSaving(true)
      try {
        const dataToSave = {
          ...leadInfo,
          updated_at: new Date().toISOString()
        }

        if (leadInfo.id) {
          // Update existing
          const { error } = await supabase
            .from('lead_info')
            .update(dataToSave)
            .eq('id', leadInfo.id)
          
          if (error) throw error
        } else {
          // Insert new
          const { data, error } = await supabase
            .from('lead_info')
            .insert([dataToSave])
            .select()
            .single()
          
          if (error) throw error
          setLeadInfo({ ...leadInfo, id: data.id })
        }
        
        toast.success('Lead information saved successfully')
      } catch (error) {
        console.error('Error saving lead info:', error)
        toast.error('Failed to save lead information')
      } finally {
        setSaving(false)
      }
    }

// Add interaction
const addInteraction = async () => {
  if (!leadInfo || !newInteraction.type || !newInteraction.notes) {
    toast.error('Please fill in all interaction fields')
    return
  }

  const interactionToAdd = {
    id: Date.now().toString(),
    date: new Date().toISOString(), // Current timestamp
    type: newInteraction.type,
    notes: newInteraction.notes
  }

  const updatedHistory = [
    interactionToAdd,
    ...(leadInfo.interaction_history || [])
  ]

  const updatedLeadInfo = {
    ...leadInfo,
    interaction_history: updatedHistory,
    total_interactions: updatedHistory.length
  }

  setLeadInfo(updatedLeadInfo)
  setNewInteraction({
    date: new Date().toISOString(), // Reset to current time
    type: "",
    notes: ""
  })
  setShowInteractionForm(false)
  
  // Auto-save
  await saveLeadInfo()
}

    // Helper function to calculate total amount
  const calculateTotalAmount = (billData: typeof newBill) => {
    const baseAmount = parseFloat(billData.base_amount) || 0
    let discountedAmount = baseAmount

    // Apply discount
    if (billData.discount_value) {
      const discountValue = parseFloat(billData.discount_value)
      if (billData.discount_type === 'percentage') {
        discountedAmount = baseAmount * (1 - discountValue / 100)
      } else {
        discountedAmount = baseAmount - discountValue
      }
    }

    // Apply GST if applicable
    let totalAmount = discountedAmount
    if (billData.bill_type === 'gst') {
      const gstRate = parseFloat(billData.gst_rate) || 0
      totalAmount = discountedAmount + (discountedAmount * gstRate / 100)
    }

    return Math.max(totalAmount, 0) // Ensure non-negative
  }
  // Add this helper function before the generateBill function
  const calculateBillAmounts = (billData: typeof newBill) => {
    const baseAmount = parseFloat(billData.base_amount) || 0
    
    // Calculate discount
    let discountAmount = 0
    let amountAfterDiscount = baseAmount
    
    if (billData.discount_value) {
      const discountValue = parseFloat(billData.discount_value)
      if (billData.discount_type === 'percentage') {
        discountAmount = baseAmount * (discountValue / 100)
        amountAfterDiscount = baseAmount - discountAmount
      } else {
        discountAmount = discountValue
        amountAfterDiscount = baseAmount - discountAmount
      }
    }
    
    // Calculate GST (fixed 5%)
    const gstRate = billData.bill_type === 'gst' ? 5 : 0
    const gstAmount = billData.bill_type === 'gst' ? (amountAfterDiscount * gstRate) / 100 : 0
    const totalAmount = amountAfterDiscount + gstAmount
    
    // Calculate balance
    const paidAmount = parseFloat(billData.paid_amount) || 0
    const balance = Math.max(totalAmount - paidAmount, 0)
    
    // Determine payment status
    let paymentStatus = 'Pending'
    if (paidAmount >= totalAmount) {
      paymentStatus = 'Paid'
    } else if (paidAmount > 0) {
      paymentStatus = 'Partial'
    }
    
    return {
      baseAmount,
      discountAmount,
      amountAfterDiscount,
      gstRate,
      gstAmount,
      totalAmount,
      paidAmount,
      balance,
      paymentStatus
    }
  }

  // Updated generateBill function
  const generateBill = async () => {
    console.log('generateBill called')
    
    // Validate required fields
    if (!selectedLead) {
      toast.error('Please select a lead first')
      return
    }
    
    if (!newBill.package_name) {
      toast.error('Please select a package')
      return
    }
    
    if (!newBill.base_amount || parseFloat(newBill.base_amount) <= 0) {
      toast.error('Please enter a valid base amount')
      return
    }
    
    if (!newBill.due_date) {
      toast.error('Please select a due date')
      return
    }
    
    setSaving(true)
    try {
      const baseAmount = parseFloat(newBill.base_amount) || 0
      
      // Calculate discount
      let discountAmount = 0
      let amountAfterDiscount = baseAmount
      
      if (newBill.discount_value) {
        const discountValue = parseFloat(newBill.discount_value)
        if (newBill.discount_type === 'percentage') {
          discountAmount = baseAmount * (discountValue / 100)
          amountAfterDiscount = baseAmount - discountAmount
        } else {
          discountAmount = discountValue
          amountAfterDiscount = baseAmount - discountAmount
        }
      }
      
      // Calculate GST (fixed 5%)
      const gstRate = newBill.bill_type === 'gst' ? 5 : 0
      const gstAmount = newBill.bill_type === 'gst' ? (amountAfterDiscount * gstRate) / 100 : 0
      const totalAmount = amountAfterDiscount + gstAmount
      
      // Calculate balance
      const paidAmount = parseFloat(newBill.paid_amount) || 0
      const balance = Math.max(totalAmount - paidAmount, 0)
      
      // Determine payment status (must match table constraint)
      let paymentStatus = 'Pending'
      if (paidAmount >= totalAmount) {
        paymentStatus = 'Paid'
      } else if (paidAmount > 0) {
        // Note: 'Partial' is not allowed in your table, so we use 'Pending'
        paymentStatus = 'Pending'
      }
      
      // Generate bill number
      const billNumber = `BILL-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const billData = {
        bill_number: billNumber,
        user_id: user?.id || null,
        lead_id: selectedLead.id,
        package_name: newBill.package_name,
        description: newBill.description || `Bill for ${newBill.package_name}`,
        base_amount: baseAmount,
        
        // Discount fields
        discount_type: newBill.discount_value ? newBill.discount_type : null,
        discount_value: newBill.discount_value ? parseFloat(newBill.discount_value) : null,
        
        // Payment tracking
        paid_amount: paidAmount,
        balance: balance,
        
        // GST fields
        bill_type: newBill.bill_type,
        gst_number: newBill.bill_type === 'gst' ? (newBill.gst_number || null) : null,
        gst_rate: newBill.bill_type === 'gst' ? gstRate : null,
        gst_amount: gstAmount > 0 ? parseFloat(gstAmount.toFixed(2)) : null,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        place_of_supply: newBill.bill_type === 'gst' ? (newBill.place_of_supply || null) : null,
        payment_method: newBill.payment_method || 'Credit Card',
        
        // Dates
        due_date: newBill.due_date,
        follow_up_date: newBill.follow_up_date || null,
        
        // Status fields (must match table constraints)
        payment_status: paymentStatus,
        status: 'Generated', // Must be one of: 'Generated', 'Sent', 'Viewed', 'Paid', 'Cancelled'
        currency: 'INR',
        bill_date: new Date().toISOString().split('T')[0],
        
        // Comments
        payment_comments: newBill.payment_comments || null,
        
        // These should be null for new bills
        payment_link_id: null,
        manual_payment_id: null,
        paid_date: null
      }

      console.log('Saving bill data:', billData)

      const { data, error } = await supabase
        .from('bills')
        .insert([billData])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Bill created:', data)
      
      // Update local state
      setBills(prev => [data, ...prev])
      
      // Reset form
      setNewBill({
        package_name: "",
        base_amount: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        paid_amount: "0",
        due_date: "",
        follow_up_date: "",
        payment_method: "Credit Card",
        bill_type: "non-gst",
        gst_number: "",
        gst_rate: "5",
        place_of_supply: "",
        payment_comments: ""
      })
      
      setShowBillGenerator(false)
      toast.success('Bill generated successfully!')
      
    } catch (error: any) {
      console.error('Error generating bill:', error)
      toast.error(`Failed to generate bill: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }
    // Initialize data
    useEffect(() => {
      fetchLeads()
    }, [])

useEffect(() => {
  const leadId = searchParams.get('leadId')
  const tab = searchParams.get('tab')
  
  console.log('useEffect - leadId:', leadId, 'tab:', tab, 'selectedLead:', selectedLead?.id, 'leads count:', leads.length)
  
  // Only handle URL changes if we have leads loaded
  if (tab === 'lead-information' && leadId && leads.length > 0) {
    // Check if we need to load this lead
    if (!selectedLead || selectedLead.id !== leadId) {
      console.log('Loading lead from URL params:', leadId)
      handleLeadSelection(leadId)
    }
  }
}, [searchParams, leads]) // Add leads to dependency array

    // Utility functions
    const toggleSection = (section: string) => {
      setCollapsedSections(prev => ({
        ...prev,
        [section]: !prev[section as keyof typeof prev]
      }))
    }

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'hot': return "bg-red-100 text-red-700 border-red-200"
        case 'warm': return "bg-orange-100 text-orange-700 border-orange-200"
        case 'cold': return "bg-blue-100 text-blue-700 border-blue-200"
        case 'new': return "bg-emerald-100 text-emerald-700 border-emerald-200"
        default: return "bg-gray-100 text-gray-700 border-gray-200"
      }
    }

    const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case 'hot': return "🔥"
        case 'warm': return "🌡️"
        case 'cold': return "❄️"
        case 'new': return "✨"
        default: return "📋"
      }
    }
  // Get unique cities from leads
  const uniqueCities = Array.from(new Set(leads.map(lead => lead.city).filter(Boolean)))

  // Get unique counselors from leads
  const uniqueCounselors = Array.from(new Set(leads.map(lead => lead.counselor).filter(Boolean)))
    // Filter leads
  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone_number.includes(searchTerm)
    
    // Status filter
    const matchesStatus = statusFilter === "all" || lead.status.toLowerCase() === statusFilter
    
    // Source filter
    const matchesSource = sourceFilter === "all" || lead.source.toLowerCase().replace(" ", "") === sourceFilter
    
    // Date range filter
    const leadDate = new Date(lead.created_at)
    const matchesDateRange = 
      (!dateRangeFilter.startDate || leadDate >= new Date(dateRangeFilter.startDate)) &&
      (!dateRangeFilter.endDate || leadDate <= new Date(dateRangeFilter.endDate))
    
    // City filter
    const matchesCity = cityFilter === "all" || lead.city.toLowerCase() === cityFilter.toLowerCase()
    
    // Country filter - assuming you have a country field, if not you can remove this
    const matchesCountry = countryFilter === "all" || true // Add country field if available
    
    // Counselor filter
    const matchesCounselor = counselorFilter === "all" || lead.counselor.toLowerCase() === counselorFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesSource && matchesDateRange && matchesCity && matchesCountry && matchesCounselor
  })
    if (loading && !selectedLead) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-emerald-600">Loading leads...</span>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Lead Selection */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Filter className="h-5 w-5" />
              Lead Selection & Filters
            </CardTitle>
          </CardHeader>
        <CardContent>
    <div className="space-y-4">
      {/* First Row - Search and Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Search Leads</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-emerald-200 hover:border-emerald-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Start Date</Label>
          <Input
            type="date"
            value={dateRangeFilter.startDate}
            onChange={(e) => setDateRangeFilter({...dateRangeFilter, startDate: e.target.value})}
            className="border-emerald-200 hover:border-emerald-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">End Date</Label>
          <Input
            type="date"
            value={dateRangeFilter.endDate}
            onChange={(e) => setDateRangeFilter({...dateRangeFilter, endDate: e.target.value})}
            className="border-emerald-200 hover:border-emerald-300"
          />
        </div>
      </div>

      {/* Second Row - Status, Source, City */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in follow up">In Follow Up</SelectItem>
              <SelectItem value="expected payment">Expected Payment</SelectItem>
              <SelectItem value="not responding">Not Responding</SelectItem>
              <SelectItem value="yet to talk">Yet To Talk</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Source</Label>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="socialmedia">Social Media</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="coldcall">Cold Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">City</Label>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Third Row - Country, Counselor, Select Lead */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Country</Label>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="usa">USA</SelectItem>
              <SelectItem value="uk">UK</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Counselor</Label>
          <Select value={counselorFilter} onValueChange={setCounselorFilter}>
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder="All Counselors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counselors</SelectItem>
              {uniqueCounselors.map((counselor) => (
                <SelectItem key={counselor} value={counselor.toLowerCase()}>
                  {counselor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Select Lead</Label>
          <Select 
            value={selectedLead?.id || ""} 
            onValueChange={(value) => {
              if (value && value !== selectedLead?.id) {
                handleLeadSelection(value)
              }
            }}
            disabled={loading || leads.length === 0}
          >
            <SelectTrigger className="border-emerald-200 hover:border-emerald-300">
              <SelectValue placeholder={loading ? "Loading leads..." : leads.length === 0 ? "No leads available" : "Select a lead"} />
            </SelectTrigger>
            <SelectContent>
              {filteredLeads.length === 0 ? (
                <div className="p-2 text-sm text-slate-500">
                  {loading ? "Loading..." : "No leads found with current filters"}
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="truncate">{lead.name}</span>
                      <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Summary and Clear Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold text-emerald-600">{filteredLeads.length}</span> of <span className="font-semibold">{leads.length}</span> leads
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchTerm("")
            setStatusFilter("all")
            setSourceFilter("all")
            setDateRangeFilter({ startDate: "", endDate: "" })
            setCityFilter("all")
            setCountryFilter("all")
            setCounselorFilter("all")
          }}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  </CardContent>
        </Card>

        {selectedLead && leadInfo && (
          <>
            {/* Lead Profile Header */}
            <Card className="border-0 shadow-xl bg-gradient-to-b from-emerald-100 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-emerald-200">
                    <AvatarImage src={user?.profile_image_url} alt={selectedLead.name} />
                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      {selectedLead.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800">{selectedLead.name}</h2>
                    <p className="text-slate-600 text-lg">
                      {selectedLead.profession} • {selectedLead.city}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={`text-sm ${getStatusColor(selectedLead.status)}`}>
                        {getStatusIcon(selectedLead.status)} {selectedLead.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                        {selectedLead.source}
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        Score: {selectedLead.lead_score}/100
                      </Badge>
                      {user && (
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          User Linked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Lead Date</div>
                    <div className="font-semibold text-lg">
                      {new Date(selectedLead.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">Conversion Probability</div>
                    <div className="font-semibold text-emerald-600">
                      {selectedLead.conversion_probability}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combined Lead Details */}
            <Collapsible open={!collapsedSections.leadDetails} onOpenChange={() => toggleSection("leadDetails")}>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-emerald-50/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-emerald-700">
                      <div className="flex items-center gap-2">
                        <FileEdit className="h-5 w-5" />
                        Lead Details
                      </div>
                      {collapsedSections.leadDetails ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <User className="h-4 w-4" />
                        <h3 className="text-lg">Basic Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                          <Input 
                            value={selectedLead.name} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Email</Label>
                          <Input 
                            value={selectedLead.email} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Primary Phone</Label>
                          <Input 
                            value={selectedLead.phone_number} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Alternate Phone</Label>
                          <Input
                            value={leadInfo.alternate_phone || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, alternate_phone: e.target.value})}
                            className="border-emerald-200"
                            placeholder="Enter alternate phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">City</Label>
                          <Input 
                            value={selectedLead.city} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Pincode</Label>
                          <Input
                            value={leadInfo.pincode || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, pincode: e.target.value})}
                            className="border-emerald-200"
                            placeholder="Enter pincode"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Profession</Label>
                          <Input 
                            value={selectedLead.profession} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lead Management Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Activity className="h-4 w-4" />
                        <h3 className="text-lg">Lead Management</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700">Current Status</Label>
    <div className="flex gap-2">
      <Input 
        value={selectedLead.status} 
        readOnly 
        className="bg-slate-50 flex-1" 
      />
      <Button
        onClick={() => setShowStatusDialog(true)}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        Change Status
      </Button>
    </div>
  </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Lead Source</Label>
                          <Input 
                            value={selectedLead.source} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Assigned Counselor</Label>
                          <Input 
                            value={selectedLead.counselor} 
                            readOnly 
                            className="bg-slate-50" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Best Time to Connect</Label>
                          <Input
                            value={leadInfo.best_time_to_connect || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, best_time_to_connect: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., Evening (6-8 PM)"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
                          <div className="text-sm text-emerald-600 font-medium">Lead Score</div>
                          <div className="text-2xl font-bold text-emerald-700">
                            {selectedLead.lead_score}/100
                          </div>
                        </div> */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-blue-600 font-medium">Interactions</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {leadInfo.total_interactions || 0}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                          <div className="text-sm text-purple-600 font-medium">Priority</div>
                          <div className="text-2xl font-bold text-purple-700">
                            {selectedLead.priority}
                          </div>
                        </div>
                      </div>
                    </div>

        {/* Status Change Dialog */}
{showStatusDialog && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Lead Status</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            New Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={newStatus.status}
            onValueChange={(value) => {
              setNewStatus({ 
                ...newStatus, 
                status: value,
                // Reset follow-up date when status changes
                follow_up_date: STATUSES_REQUIRING_FOLLOWUP.includes(value) ? 
                  new Date().toISOString().split('T')[0] : ""
              })
            }}
          >
            <SelectTrigger className="border-emerald-200">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show follow-up date field for statuses that require it */}
        {STATUSES_REQUIRING_FOLLOWUP.includes(newStatus.status) && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Follow-up Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={newStatus.follow_up_date}
              onChange={(e) => setNewStatus({ ...newStatus, follow_up_date: e.target.value })}
              className="border-emerald-200"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-slate-500">
              This status requires a follow-up date
            </p>
          </div>
        )}

        {/* Show expected amount field only for Expected Payment status */}
        {newStatus.status === 'Expected Payment' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Expected Payment Amount (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={newStatus.expected_amount}
              onChange={(e) => setNewStatus({ ...newStatus, expected_amount: e.target.value })}
              className="border-emerald-200"
              placeholder="Enter expected amount"
              required
            />
          </div>
        )}

        {/* Show optional expected amount for other statuses */}
        {newStatus.status !== 'Expected Payment' && STATUSES_REQUIRING_FOLLOWUP.includes(newStatus.status) && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Expected Amount (₹) <span className="text-slate-400">Optional</span>
            </Label>
            <Input
              type="number"
              value={newStatus.expected_amount}
              onChange={(e) => setNewStatus({ ...newStatus, expected_amount: e.target.value })}
              className="border-emerald-200"
              placeholder="Enter expected amount (optional)"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Notes <span className="text-slate-400">Optional</span>
          </Label>
          <Textarea
            value={newStatus.notes}
            onChange={(e) => setNewStatus({ ...newStatus, notes: e.target.value })}
            className="border-emerald-200"
            placeholder="Add notes about this status change..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setShowStatusDialog(false)
            setNewStatus({
              status: "",
              follow_up_date: "",
              expected_amount: "",
              notes: ""
            })
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={saveStatusChange}
          disabled={saving || (STATUSES_REQUIRING_FOLLOWUP.includes(newStatus.status) && !newStatus.follow_up_date)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Update Status'
          )}
        </Button>
      </div>
    </div>
  </div>
)}
    {/* Status History */}
                    {statusHistory.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-slate-700">Status History</h3>
                          <Badge variant="outline" className="text-xs">
                            {statusHistory.length} change{statusHistory.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {statusHistory.map((status, index) => (
                            <div
                              key={status.id}
                              className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow"
                            >
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-slate-800">{status.status}</span>
                                    {index === 0 && (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(status.created_at).toLocaleString()}
                                  </span>
                                </div>
                                
                                {/* User who made the change */}
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-3 w-3 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    Changed by: <span className="font-medium">{status.changed_by_name || 'System'}</span>
                                  </span>
                                </div>

                                {/* Follow-up date */}
                                {status.follow_up_date && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                    <CalendarDays className="h-3 w-3 text-blue-500" />
                                    <span>Follow-up: {new Date(status.follow_up_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                
                                {/* Expected amount */}
                                {status.expected_amount && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                    <DollarSign className="h-3 w-3 text-green-500" />
                                    <span>Expected: ₹{status.expected_amount.toLocaleString()}</span>
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {status.notes && (
                                  <div className="mt-2 p-2 bg-white/50 rounded text-sm text-slate-600 border border-emerald-100">
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                                      <span className="break-words">{status.notes}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fitness Goals Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Scale className="h-4 w-4" />
                        <h3 className="text-lg">Fitness Goals & Health</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Current Weight</Label>
                          <Input
                            value={leadInfo.current_weight || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, current_weight: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., 75 kg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Target Weight</Label>
                          <Input
                            value={leadInfo.target_weight || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, target_weight: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., 65 kg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Weight to Lose</Label>
                          <Input
                            value={leadInfo.weight_to_lose || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, weight_to_lose: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., 10 kg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Want to Lose Weight?</Label>
                          <Select 
                            value={leadInfo.want_to_lose ? "yes" : "no"}
                            onValueChange={(value) => setLeadInfo({...leadInfo, want_to_lose: value === "yes"})}
                          >
                            <SelectTrigger className="border-emerald-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Medical Conditions</Label>
                          <Input
                            value={leadInfo.medical_conditions || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, medical_conditions: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., Diabetes, None"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Investment & Budget Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Wallet className="h-4 w-4" />
                        <h3 className="text-lg">Investment & Budget</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Budget Range</Label>
                          <Input
                            value={leadInfo.budget_range || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, budget_range: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., ₹1000-2000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Investment Amount</Label>
                          <Input
                            value={leadInfo.investment_amount || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, investment_amount: e.target.value})}
                            className="border-emerald-200"
                            placeholder="e.g., ₹1500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Referred By</Label>
                          <Input
                            value={leadInfo.referred_by || ""}
                            onChange={(e) => setLeadInfo({...leadInfo, referred_by: e.target.value})}
                            className="border-emerald-200"
                            placeholder="Name of referrer"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

          

            {/* Combined Interaction History & Notes */}
            <Collapsible open={!collapsedSections.interactionAndNotes} onOpenChange={() => toggleSection("interactionAndNotes")}>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-emerald-50/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-emerald-700">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Interaction History & Notes
                      </div>
                      {collapsedSections.interactionAndNotes ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Interaction History Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-emerald-600" />
                          <h3 className="text-lg font-semibold text-slate-800">Interaction History</h3>
                        </div>
                        <Button
                          onClick={() => setShowInteractionForm(!showInteractionForm)}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Interaction
                        </Button>
                      </div>
{showInteractionForm && (
  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200 mb-4">
    <h4 className="font-medium text-emerald-700 mb-3">Add New Interaction</h4>
    
    {/* Display current date and time */}
    <div className="mb-4 p-3 bg-white/70 rounded border border-emerald-100">
      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <CalendarDays className="h-4 w-4" />
        <span>Interaction will be recorded at: <strong>{new Date().toLocaleString()}</strong></span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Interaction Type <span className="text-red-500">*</span></Label>
        <Select
          value={newInteraction.type}
          onValueChange={(value) => setNewInteraction({...newInteraction, type: value})}
        >
          <SelectTrigger className="border-emerald-200">
            <SelectValue placeholder="Select interaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Phone Call">Phone Call</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Text Message">Text Message</SelectItem>
            <SelectItem value="Video Call">Video Call</SelectItem>
            <SelectItem value="In Person">In Person</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Notes <span className="text-red-500">*</span></Label>
        <Textarea
          value={newInteraction.notes}
          onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})}
          className="border-emerald-200"
          placeholder="Interaction details..."
          rows={3}
          required
        />
      </div>
    </div>
    
    <div className="flex justify-end gap-2 mt-3">
      <Button
        variant="outline"
        onClick={() => {
          setShowInteractionForm(false)
          setNewInteraction({
            date: new Date().toISOString(),
            type: "",
            notes: ""
          })
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={addInteraction}
        disabled={!newInteraction.type || !newInteraction.notes.trim()}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        Add Interaction
      </Button>
    </div>
  </div>
)}

          <div className="space-y-4">
  {leadInfo.interaction_history && leadInfo.interaction_history.length > 0 ? (
    // Sort by date in descending order (newest first)
    [...leadInfo.interaction_history]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((interaction, index) => (
        <div
          key={interaction.id || index}
          className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:shadow-sm transition-shadow"
        >
          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded">
                  {interaction.type === 'Phone Call' && <Phone className="h-4 w-4 text-emerald-600" />}
                  {interaction.type === 'Email' && <Mail className="h-4 w-4 text-emerald-600" />}
                  {interaction.type === 'Meeting' && <Briefcase className="h-4 w-4 text-emerald-600" />}
                  {interaction.type === 'WhatsApp' && <MessageSquare className="h-4 w-4 text-emerald-600" />}
                  {interaction.type === 'Video Call' && <Activity className="h-4 w-4 text-emerald-600" />}
                  {!['Phone Call', 'Email', 'Meeting', 'WhatsApp', 'Video Call'].includes(interaction.type) && 
                   <MessageSquare className="h-4 w-4 text-emerald-600" />}
                </div>
                <h4 className="font-medium text-slate-800 truncate">{interaction.type}</h4>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-sm text-slate-500 font-medium">
                  {new Date(interaction.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(interaction.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
            <p className="text-slate-600 whitespace-pre-wrap break-words">{interaction.notes}</p>
          </div>
        </div>
      ))
  ) : (
    <div className="text-center py-8 text-slate-500">
      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
      <p>No interactions recorded yet</p>
      <p className="text-sm mt-1">Click "Add Interaction" to record your first interaction</p>
    </div>
  )}
</div>
                    </div>

              {/* Comments & Notes Section */}
  <div className="space-y-4 pt-6 border-t border-slate-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-800">Notes & Comments</h3>
      </div>
      <Button
        onClick={() => setShowNoteForm(!showNoteForm)}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Note
      </Button>
    </div>

    {/* Add Note Form */}
    {showNoteForm && (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200 mb-4">
        <h4 className="font-medium text-emerald-700 mb-3">Add New Note</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Note Type</Label>
            <Select
              value={newNote.note_type}
              onValueChange={(value) => setNewNote({...newNote, note_type: value as 'internal' | 'external'})}
            >
              <SelectTrigger className="border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External (Visible to all)</SelectItem>
                <SelectItem value="internal">Internal (Private)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {newNote.note_type === 'external' 
                ? 'This note will be visible to all team members' 
                : 'This note is private and only visible to you and administrators'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Note</Label>
            <Textarea
              value={newNote.note}
              onChange={(e) => setNewNote({...newNote, note: e.target.value})}
              className="border-emerald-200"
              placeholder="Enter your note..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowNoteForm(false)
              setNewNote({
                note_type: 'external',
                note: ''
              })
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={addLeadNote}
            disabled={saving || !newNote.note.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Note'
            )}
          </Button>
        </div>
      </div>
    )}

    {/* Notes List */}
    <div className="space-y-3">
      {leadNotes && leadNotes.length > 0 ? (
        leadNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border ${
              note.note_type === 'internal'
                ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200'
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                note.note_type === 'internal' ? 'bg-purple-500' : 'bg-emerald-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-800">
                      {note.created_by_name || 'Unknown User'}
                    </span>
                    <Badge className={`text-xs ${
                      note.note_type === 'internal'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {note.note_type === 'internal' ? 'Internal' : 'External'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="p-3 bg-white/50 rounded text-sm text-slate-700 border border-slate-100">
                  <p className="whitespace-pre-wrap break-words">{note.note}</p>
                </div>
                
                {note.created_by_email && (
                  <div className="text-xs text-slate-500 mt-2">
                    {note.created_by_email}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-slate-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No notes added yet</p>
          <p className="text-sm mt-1">Click "Add Note" to create your first note</p>
        </div>
      )}
    </div>
  </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Billing & Invoice Management */}
            <Collapsible open={!collapsedSections.billing} onOpenChange={() => toggleSection("billing")}>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-emerald-50/50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-emerald-700">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Billing & Invoice Management
                      </div>
                      {collapsedSections.billing ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div></div>
                      <Button
                        onClick={() => setShowBillGenerator(!showBillGenerator)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Generate New Bill
                      </Button>
                    </div>

            {/* Billing Summary Section */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="text-sm text-blue-600 font-medium">Number of Bills</div>
          <div className="text-2xl font-bold text-blue-700">{bills.length}</div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Receipt className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <div className="text-sm text-purple-600 font-medium">Billing Amount</div>
          <div className="text-2xl font-bold text-purple-700">
            ₹{bills.reduce((sum, bill) => sum + bill.total_amount, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Wallet className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-sm text-emerald-600 font-medium">Paid Amount</div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{totalPaidAmount.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <DollarSign className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <div className="text-sm text-orange-600 font-medium">Balance</div>
          <div className="text-2xl font-bold text-orange-700">
            ₹{totalBalance.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  </div>

                    {/* Bill Generator */}
                    {showBillGenerator && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
    <h3 className="text-lg font-semibold text-emerald-700 mb-4">Generate New Bill</h3>

    <div className="mb-6">
      <Label className="text-sm font-medium text-slate-700 mb-3 block">Bill Type</Label>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="non-gst"
            name="billType"
            value="non-gst"
            checked={newBill.bill_type === "non-gst"}
            onChange={(e) => setNewBill({ ...newBill, bill_type: e.target.value as 'gst' | 'non-gst' })}
            className="text-emerald-600 focus:ring-emerald-500"
          />
          <Label htmlFor="non-gst" className="text-sm font-medium text-slate-700 cursor-pointer">
            Non-GST Bill
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="gst"
            name="billType"
            value="gst"
            checked={newBill.bill_type === "gst"}
            onChange={(e) => setNewBill({ ...newBill, bill_type: e.target.value as 'gst' | 'non-gst' })}
            className="text-emerald-600 focus:ring-emerald-500"
          />
          <Label htmlFor="gst" className="text-sm font-medium text-slate-700 cursor-pointer">
            GST Bill
          </Label>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Package Name */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Package/Service</Label>
        <Select
          value={newBill.package_name}
          onValueChange={(value) => setNewBill({ ...newBill, package_name: value })}
        >
          <SelectTrigger className="border-emerald-200">
            <SelectValue placeholder="Select package" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`premium-${n}`} value={`Premium Personal Training - ${n} Month${n>1?'s':''}`}>
                Premium Personal Training - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`virtual-${n}`} value={`Virtual Personal Training - ${n} Month${n>1?'s':''}`}>
                Virtual Personal Training - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`in-home-${n}`} value={`In Home Personal Training - ${n} Month${n>1?'s':''}`}>
                In Home Personal Training - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`coach-${n}`} value={`Personal Coaching Plan - ${n} Month${n>1?'s':''}`}>
                Personal Coaching Plan - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`nutri-${n}`} value={`Nutrition Plan - ${n} Month${n>1?'s':''}`}>
                Nutrition Plan - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <SelectItem key={`master-${n}`} value={`Master Plan - ${n} Month${n>1?'s':''}`}>
                Master Plan - {n} Month{n>1?'s':''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Base Amount */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Base Amount (₹)</Label>
        <Input
          value={newBill.base_amount}
          onChange={(e) => setNewBill({ ...newBill, base_amount: e.target.value })}
          placeholder="Enter base amount"
          className="border-emerald-200"
          type="number"
        />
      </div>

      {/* Discount Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Discount Type</Label>
        <Select
          value={newBill.discount_type}
          onValueChange={(value) => setNewBill({ ...newBill, discount_type: value as 'percentage' | 'fixed' })}
        >
          <SelectTrigger className="border-emerald-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discount Value */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">
          {newBill.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
        </Label>
        <Input
          value={newBill.discount_value}
          onChange={(e) => setNewBill({ ...newBill, discount_value: e.target.value })}
          placeholder={newBill.discount_type === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
          className="border-emerald-200"
          type="number"
        />
      </div>

      {/* Paid Amount */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Paid Amount (₹)</Label>
        <Input
          value={newBill.paid_amount}
          onChange={(e) => setNewBill({ ...newBill, paid_amount: e.target.value })}
          placeholder="Enter paid amount"
          className="border-emerald-200"
          type="number"
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
        <Select
          value={newBill.payment_method}
          onValueChange={(value) => setNewBill({ ...newBill, payment_method: value })}
        >
          <SelectTrigger className="border-emerald-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>

    {/* Due Date */}
<div className="space-y-2">
  <Label className="text-sm font-medium text-slate-700">Due Date <span className="text-red-500">*</span></Label>
  <Input
    type="date"
    value={newBill.due_date}
    onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
    className="border-emerald-200"
    min={new Date().toISOString().split('T')[0]}
    required
  />
</div>

{/* Follow-up Date */}
<div className="space-y-2">
  <Label className="text-sm font-medium text-slate-700">Follow-up Date</Label>
  <Input
    type="date"
    value={newBill.follow_up_date}
    onChange={(e) => setNewBill({ ...newBill, follow_up_date: e.target.value })}
    className="border-emerald-200"
    min={new Date().toISOString().split('T')[0]}
  />
</div>

      {newBill.bill_type === "gst" && (
        <>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">GST Number</Label>
            <Input
              value={newBill.gst_number}
              onChange={(e) => setNewBill({ ...newBill, gst_number: e.target.value })}
              placeholder="Enter GST number"
              className="border-emerald-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">GST Rate</Label>
            <Input
              value="5%"
              readOnly
              className="border-emerald-200 bg-slate-50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Place of Supply</Label>
            <Select
              value={newBill.place_of_supply}
              onValueChange={(value) => setNewBill({ ...newBill, place_of_supply: value })}
            >
              <SelectTrigger className="border-emerald-200">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                <SelectItem value="West Bengal">West Bengal</SelectItem>
                <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Description */}
      <div className="md:col-span-2 space-y-2">
        <Label className="text-sm font-medium text-slate-700">Description</Label>
        <Textarea
          value={newBill.description}
          onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
          placeholder="Enter bill description..."
          className="border-emerald-200"
          rows={3}
        />
      </div>

      {/* Payment Comments */}
      <div className="md:col-span-2 space-y-2">
        <Label className="text-sm font-medium text-slate-700">Payment Comments</Label>
        <Textarea
          value={newBill.payment_comments}
          onChange={(e) => setNewBill({ ...newBill, payment_comments: e.target.value })}
          placeholder="Add any comments about payment..."
          className="border-emerald-200"
          rows={3}
        />
      </div>

      {/* Calculation Preview */}
      {newBill.base_amount && (
        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-2">Bill Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Base Amount:</span>
              <span className="font-medium">₹{parseFloat(newBill.base_amount) || 0}</span>
            </div>
            
            {newBill.discount_value && (
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Discount ({newBill.discount_type === 'percentage' ? `${newBill.discount_value}%` : `₹${newBill.discount_value}`}):
                </span>
                <span className="font-medium text-red-600">
                  -₹
                  {newBill.discount_type === 'percentage'
                    ? ((parseFloat(newBill.base_amount) || 0) * (parseFloat(newBill.discount_value) || 0) / 100).toFixed(2)
                    : (parseFloat(newBill.discount_value) || 0).toFixed(2)}
                </span>
              </div>
            )}
            
            {newBill.bill_type === "gst" && (
              <div className="flex justify-between">
                <span className="text-slate-600">GST (5%):</span>
                <span className="font-medium">
                  ₹
                  {(
                    ((parseFloat(newBill.base_amount) || 0) -
                    (newBill.discount_type === 'percentage'
                      ? ((parseFloat(newBill.base_amount) || 0) * (parseFloat(newBill.discount_value) || 0) / 100)
                      : (parseFloat(newBill.discount_value) || 0))) *
                    0.05
                  ).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="font-medium text-blue-700">Total Amount:</span>
              <span className="font-bold text-blue-700">
                ₹
                {calculateTotalAmount(newBill).toFixed(2)}
              </span>
            </div>
            
            {newBill.paid_amount && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">Paid Amount:</span>
                  <span className="font-medium text-green-600">₹{parseFloat(newBill.paid_amount) || 0}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="font-medium text-orange-700">Balance:</span>
                  <span className="font-bold text-orange-700">
                    ₹{(calculateTotalAmount(newBill) - (parseFloat(newBill.paid_amount) || 0)).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    <div className="flex justify-end gap-3 mt-4">
      <Button
        variant="outline"
        onClick={() => setShowBillGenerator(false)}
        className="border-emerald-200 text-emerald-700"
      >
        Cancel
      </Button>
      <Button 
        onClick={generateBill}
        disabled={saving}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Receipt className="h-4 w-4 mr-2" />
            Generate {newBill.bill_type === "gst" ? "GST" : "Non-GST"} Bill
          </>
        )}
      </Button>
    </div>
  </div>
                    )}

                    {/* Payment History */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment History</h3>
                      <div className="space-y-3">
                        {paymentHistory.length > 0 ? (
                          paymentHistory.map((payment, index) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500">
                                  <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800">{payment.description}</div>
                                  <div className="text-sm text-slate-600">
                                    {payment.type === 'payment_link' ? 'Payment Link' : 'Manual Payment'}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(payment.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-slate-800">
                                  ₹{payment.amount} {payment.currency}
                                </div>
                                <Badge className={`text-xs ${
                                  payment.status === 'Completed' || payment.status === 'Paid' 
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : payment.status === 'Pending' 
                                      ? "bg-orange-100 text-orange-700 border-orange-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                }`}>
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <DollarSign className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>No payment history found for this lead</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bills History */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Generated Bills</h3>
                    <div className="space-y-3">
    {bills.length > 0 ? (
      bills.map((bill) => (
        <div
          key={bill.id}
          className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column - Package Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${bill.bill_type === "gst" ? "bg-blue-500" : "bg-emerald-500"}`}></div>
                <span className="font-semibold text-slate-800">{bill.package_name}</span>
              </div>
              <div className="text-sm text-slate-600">{bill.description}</div>
              {bill.bill_type === "gst" && (
                <div className="text-xs text-blue-600 mt-1">
                  GST: {bill.gst_rate}% • {bill.place_of_supply}
                </div>
              )}
            </div>

            {/* Middle Column - Payment Details */}
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="text-slate-600">Base Amount:</div>
                <div className="font-medium">₹{bill.base_amount}</div>
                
                {bill.discount_value && (
                  <>
                    <div className="text-slate-600">Discount:</div>
                    <div className="font-medium text-red-600">
                      {bill.discount_type === 'percentage' 
                        ? `${bill.discount_value}%` 
                        : `₹${bill.discount_value}`}
                    </div>
                  </>
                )}
                
                <div className="text-slate-600">GST:</div>
                <div className="font-medium">₹{bill.gst_amount || 0}</div>
                
                <div className="text-slate-600 font-medium">Total:</div>
                <div className="font-bold text-blue-700">₹{bill.total_amount}</div>
                
                <div className="text-slate-600">Paid:</div>
                <div className="font-medium text-green-600">₹{bill.paid_amount}</div>
                
                <div className="text-slate-600 font-medium">Balance:</div>
                <div className="font-bold text-orange-700">₹{bill.balance}</div>
              </div>
            </div>

            {/* Right Column - Dates & Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${
                  bill.payment_status === "Paid"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : bill.payment_status === "Partial"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"
                }`}>
                  {bill.payment_status}
                </Badge>
                <Badge className={`text-xs ${
                  bill.bill_type === "gst"
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}>
                  {bill.bill_type === "gst" ? "GST" : "Non-GST"}
                </Badge>
              </div>
              
              <div className="text-sm text-slate-600 space-y-1">
                <div>Due: {new Date(bill.due_date).toLocaleDateString()}</div>
                {bill.follow_up_date && (
                  <div>Follow-up: {new Date(bill.follow_up_date).toLocaleDateString()}</div>
                )}
                <div>Method: {bill.payment_method}</div>
              </div>
              
              {bill.payment_comments && (
                <div className="text-xs text-slate-500 mt-2">
                  <div className="font-medium">Comments:</div>
                  <div>{bill.payment_comments}</div>
                </div>
              )}
  {/*             
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                  <Download className="h-4 w-4" />
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8 text-slate-500">
        <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p>No bills generated yet for this lead</p>
      </div>
    )}
  </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Reset Changes
              </Button>
              <Button 
                onClick={saveLeadInfo}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Lead Information
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }