"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Calendar } from "./ui/calendar"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import {
  CalendarIcon,
  TrendingUp,
  Users,
  AlertCircle,
  Clock,
  Thermometer,
  Snowflake,
  Flame,
  X,
  Filter,
  Loader2,
  IndianRupee,
  RefreshCw,
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
  DollarSign,
  Target,
} from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"

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
  conversion_probability: number
  follow_up_date: string
  last_activity_date: string
  budget: string
  timeline: string
  notes: string
  created_at: string
  updated_at: string
}

interface LeadStatus {
  id: string
  lead_id: string
  status: string
  follow_up_date: string
  expected_amount: number
  notes: string
  changed_by: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  phone: string
  first_name: string
  last_name: string
  role_id: string
  created_at: string
}

interface PaymentLink {
  id: string
  user_id: string
  lead_id: string
  payment_link: string
  payment_link_id: string
  amount: number
  currency: string
  description: string
  type: string
  expires_at: string
  status: string
  created_at: string
  updated_at: string
  payment_id: string
  is_manual: boolean
  payment_method: string
  transaction_id: string
  payment_date: string
  plan_expiry: string
}

interface ManualPayment {
  id: string
  user_id: string
  lead_id: string
  amount: number
  currency: string
  description: string
  payment_method: string
  status: string
  transaction_id: string
  payment_date: string
  created_at: string
  updated_at: string
  plan_expiry: string
  plan: string
}

interface StatusCard {
  status: string
  count: number
  expectedAmount?: number
  color: string
  textColor: string
  icon: any
  block: number
}
const STATUS_BLOCKS = {
    1: ['Total Leads'],
    2: ['New', 'In Follow Up', 'Not Responding', 'Yet To Talk'],
    3: ['Booked', 'Hot', 'Warm', 'App. Failed', 'Converted', 'Expected Amount', 'Trial Booked', 'Successful Trial'],
    4: ['Cold(Joined Other)', 'Cold(Price Issue)', 'Lost (Wrong Info)', 'Lost(Irrelevant)'],
    5: ['Gross Conversion', 'Net Conversion'],
    6: ['BDE Booking Rate'],
    7: ['Successful Appointments']
  }

const REGION_MAPPING: Record<string, string> = {
  // North Region
  'punjab': 'North',
  'jammu': 'North',
  'kashmir': 'North',
  'himachal pradesh': 'North',
  'himachal': 'North',
  'chandigarh': 'North',
  'delhi': 'North',
  'new delhi': 'North',
  'haryana': 'North',
  'uttarakhand': 'North',
  'uttar pradesh': 'North',
  
  // South Region
  'tamil nadu': 'South',
  'chennai': 'South',
  'karnataka': 'South',
  'bangalore': 'South',
  'bengaluru': 'South',
  'kerala': 'South',
  'andhra pradesh': 'South',
  'telangana': 'South',
  'hyderabad': 'South',
  'puducherry': 'South',
  
  // East Region
  'west bengal': 'East',
  'kolkata': 'East',
  'odisha': 'East',
  'bihar': 'East',
  'jharkhand': 'East',
  'assam': 'East',
  'meghalaya': 'East',
  'manipur': 'East',
  'mizoram': 'East',
  'nagaland': 'East',
  'tripura': 'East',
  'arunachal pradesh': 'East',
  'sikkim': 'East',
  
  // West Region
  'maharashtra': 'West',
  'mumbai': 'West',
  'pune': 'West',
  'gujarat': 'West',
  'ahmedabad': 'West',
  'rajasthan': 'West',
  'jaipur': 'West',
  'goa': 'West',
  
  // Central Region
  'madhya pradesh': 'Central',
  'chhattisgarh': 'Central',
  
  // International (you can add more countries as needed)
  'usa': 'International - USA',
  'united states': 'International - USA',
  'uk': 'International - UK',
  'united kingdom': 'International - UK',
  'canada': 'International - Canada',
  'australia': 'International - Australia',
  'uae': 'International - UAE',
  'dubai': 'International - UAE',
  'singapore': 'International - Singapore',
}

const getRegionFromCity = (city: string): string => {
  if (!city) return 'Unknown'
  const normalized = city.toLowerCase().trim()
  return REGION_MAPPING[normalized] || 'Other'
}


const getIcon = (status: string) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('new')) return <Users className="h-4 w-4" />
  if (statusLower.includes('follow')) return <Clock className="h-4 w-4" />
  if (statusLower.includes('not responding')) return <MessageCircle className="h-4 w-4" />
  if (statusLower.includes('yet to talk')) return <Phone className="h-4 w-4" />
  if (statusLower.includes('booked')) return <CheckCircle className="h-4 w-4" />
  if (statusLower.includes('hot')) return <Flame className="h-4 w-4" />
  if (statusLower.includes('warm')) return <Thermometer className="h-4 w-4" />
  if (statusLower.includes('failed')) return <XCircle className="h-4 w-4" />
  if (statusLower.includes('converted')) return <TrendingUp className="h-4 w-4" />
  if (statusLower.includes('expected')) return <DollarSign className="h-4 w-4" />
  if (statusLower.includes('trial')) return <CheckCircle className="h-4 w-4" />
  if (statusLower.includes('cold')) return <Snowflake className="h-4 w-4" />
  if (statusLower.includes('lost')) return <XCircle className="h-4 w-4" />
  return <Users className="h-4 w-4" />
}

const isDateInRange = (dateStr: string, dateRange?: DateRange) => {
  if (!dateStr || !dateRange?.from) return true
  try {
    const date = new Date(dateStr)
    const from = dateRange.from
    const to = dateRange.to || dateRange.from
    return date >= from && date <= to
  } catch {
    return true
  }
}

export function DashboardTab() {
  const router = useRouter()
  
  const [date, setDate] = useState<DateRange | undefined>()
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
const [regionFilter, setRegionFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [allLeadStatuses, setAllLeadStatuses] = useState<LeadStatus[]>([])
  const [filteredLeadStatuses, setFilteredLeadStatuses] = useState<LeadStatus[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [manualPayments, setManualPayment] = useState<ManualPayment[]>([])
  const [statusCards, setStatusCards] = useState<StatusCard[]>([])
  
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [collectionAnalytics, setCollectionAnalytics] = useState({
    totalCollected: 0,
    thisWeek: 0,
    lastWeek: 0,
    growthRate: 0,
    outstandingBalance: 0,
    overdue: 0,
    dueSoon: 0,
    recoveryRate: 0,
  })

  const [availableSources, setAvailableSources] = useState<string[]>([])
const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([])
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([])

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignedLeadIds, setAssignedLeadIds] = useState<string[]>([])
  const [hasFullAccess, setHasFullAccess] = useState(false)

  const FULL_ACCESS_ROLES = [
    "b00060fe-175a-459b-8f72-957055ee8c55",
    "46e786df-0272-4f22-aec2-56d2a517fa9d",
    "11b93954-9a56-4ea5-a02c-15b731ee9dfb",
  ]

  const STATUS_BLOCKS = {
    1: ['Total Leads'],
    2: ['New', 'In Follow Up', 'Not Responding', 'Yet To Talk'],
    3: ['Booked', 'Hot', 'Warm', 'App. Failed', 'Converted', 'Expected Amount', 'Trial Booked', 'Successful Trial'],
    4: ['Cold(Joined Other)', 'Cold(Price Issue)', 'Lost (Wrong Info)', 'Lost(Irrelevant)']
  }

  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        throw userError || new Error("Not signed in")
      }
      
      const currentUserId = currentUser.id
      setCurrentUserId(currentUserId)

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role_id")
        .eq("id", currentUserId)
        .single()
        
      if (profileError || !profile) {
        throw profileError || new Error("No profile row")
      }
      
      const roleId = profile.role_id
      setUserRole(roleId)

      const isFullAccess = FULL_ACCESS_ROLES.includes(roleId)
      setHasFullAccess(isFullAccess)

      let assignedIds: string[] = []
      let leadsQuery = supabase.from("leads").select("*").order("created_at", { ascending: false })

      if (!isFullAccess) {
        const { data: assignments = [], error: assignError } = await supabase
          .from("lead_assignments")
          .select("lead_id")
          .eq("assigned_to", currentUserId)
          
        if (assignError) throw assignError

        assignedIds = assignments.map((a) => a.lead_id)
        setAssignedLeadIds(assignedIds)

        if (assignedIds.length > 0) {
          leadsQuery = leadsQuery.in("id", assignedIds)
        } else {
          leadsQuery = leadsQuery.in("id", ["00000000-0000-0000-0000-000000000000"])
        }
      }

      const { data: leadsData = [], error: leadsError } = await leadsQuery
      if (leadsError) throw leadsError
      
      setAllLeads(leadsData)

      // Fetch lead statuses
      let statusQuery = supabase.from("lead_status").select("*").order("created_at", { ascending: false })
      
      if (!isFullAccess && assignedIds.length > 0) {
        statusQuery = statusQuery.in("lead_id", assignedIds)
      } else if (!isFullAccess) {
        statusQuery = statusQuery.in("lead_id", ["00000000-0000-0000-0000-000000000000"])
      }

      const { data: statusData = [], error: statusError } = await statusQuery
      if (statusError) throw statusError
      
      setAllLeadStatuses(statusData)

      const uniqueSources = [...new Set(leadsData.map(lead => lead.source).filter(Boolean))]
const uniqueRegions = [...new Set(
  leadsData
    .map(lead => getRegionFromCity(lead.city))
    .filter(region => region !== 'Unknown')
)]
setAvailableRegions(uniqueRegions.sort())
      const uniqueStatuses = [
        ...new Set(
          leadsData
            .map(lead => lead.status?.trim().toLowerCase())
            .filter(Boolean)
        ),
      ]
      const uniquePriorities = [...new Set(leadsData.map(lead => lead.priority).filter(Boolean))]

      setAvailableSources(uniqueSources)
      setAvailableCities(uniqueCities)
      setAvailableStatuses(uniqueStatuses)
      setAvailablePriorities(uniquePriorities)

      const { data: usersData = [], error: usersError } = await supabase
        .from("users")
        .select("id, email, phone, first_name, last_name, role_id, created_at")
        
      if (usersError) throw usersError
      setAllUsers(usersData)

      let paymentLinksQuery = supabase.from("payment_links").select("*").order("created_at", { ascending: false })
      let manualPaymentsQuery = supabase.from("manual_payment").select("*").order("created_at", { ascending: false })

      if (!isFullAccess && assignedIds.length > 0) {
        const leadEmailToUserMap = new Map<string, string>()
        const leadPhoneToUserMap = new Map<string, string>()

        leadsData.forEach((lead) => {
          const matchingUser = usersData.find(
            (user) => user.email && lead.email && user.email.toLowerCase() === lead.email.toLowerCase(),
          )
          if (matchingUser) {
            leadEmailToUserMap.set(lead.id, matchingUser.id)
          }

          if (!matchingUser && lead.phone_number) {
            const phoneMatchingUser = usersData.find(
              (user) => user.phone && lead.phone_number && user.phone === lead.phone_number,
            )
            if (phoneMatchingUser) {
              leadPhoneToUserMap.set(lead.id, phoneMatchingUser.id)
            }
          }
        })

        const relevantUserIds = Array.from(
          new Set([...Array.from(leadEmailToUserMap.values()), ...Array.from(leadPhoneToUserMap.values())]),
        )

        if (relevantUserIds.length > 0) {
          paymentLinksQuery = paymentLinksQuery.in("user_id", relevantUserIds)
          manualPaymentsQuery = manualPaymentsQuery.in("user_id", relevantUserIds)
        } else {
          paymentLinksQuery = paymentLinksQuery.in("user_id", ["00000000-0000-0000-0000-000000000000"])
          manualPaymentsQuery = manualPaymentsQuery.in("user_id", ["00000000-0000-0000-0000-000000000000"])
        }
      }

      const [{ data: paymentLinksData = [], error: plError }, { data: manualPaymentsData = [], error: mpError }] =
        await Promise.all([paymentLinksQuery, manualPaymentsQuery])

      if (plError) throw plError
      if (mpError) throw mpError

      setPaymentLinks(paymentLinksData)
      setManualPayment(manualPaymentsData)

      const completedLinksForLeads = paymentLinksData.filter((p) => p.status === "completed")
      const completedManualForLeads = manualPaymentsData.filter((p) => p.status === "completed")

      const totalRevenueAmount = [...completedLinksForLeads, ...completedManualForLeads].reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      )

      setTotalRevenue(totalRevenueAmount)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...allLeads]

    if (statusFilter.length > 0) {
      filtered = filtered.filter((lead) => {
        const leadStatus = lead.status?.toLowerCase()
        return statusFilter.some(status => status.toLowerCase() === leadStatus)
      })
    }

    if (sourceFilter.length > 0) {
      filtered = filtered.filter((lead) => {
        const leadSource = lead.source?.toLowerCase()
        return sourceFilter.some(source => source.toLowerCase() === leadSource)
      })
    }

  if (regionFilter.length > 0) {
  filtered = filtered.filter((lead) => {
    const leadRegion = getRegionFromCity(lead.city)
    return regionFilter.includes(leadRegion)
  })
}


    if (priorityFilter.length > 0) {
      filtered = filtered.filter((lead) => {
        const leadPriority = lead.priority?.toLowerCase()
        return priorityFilter.some(priority => priority.toLowerCase() === leadPriority)
      })
    }

    if (date?.from || date?.to) {
      filtered = filtered.filter((lead) => {
        return isDateInRange(lead.created_at, date)
      })
    }

    setFilteredLeads(filtered)
}, [allLeads, statusFilter, sourceFilter, regionFilter, priorityFilter, date])

  useEffect(() => {
    if (!filteredLeads.length) {
      setFilteredLeadStatuses([])
      return
    }

    const filteredLeadIds = filteredLeads.map(l => l.id)
    let filtered = allLeadStatuses.filter(s => filteredLeadIds.includes(s.lead_id))

    if (date?.from || date?.to) {
      filtered = filtered.filter((status) => {
        return isDateInRange(status.created_at, date)
      })
    }

    setFilteredLeadStatuses(filtered)
  }, [allLeadStatuses, filteredLeads, date])

  useEffect(() => {
    if (filteredLeadStatuses.length === 0 && filteredLeads.length === 0) {
      setStatusCards([])
      return
    }

    const statusMap = new Map<string, { count: number; expectedAmount: number }>()

    filteredLeadStatuses.forEach(status => {
      const existing = statusMap.get(status.status) || { count: 0, expectedAmount: 0 }
      statusMap.set(status.status, {
        count: existing.count + 1,
        expectedAmount: existing.expectedAmount + (status.expected_amount || 0)
      })
    })

    const cards: StatusCard[] = []

    // Block 1: Total Leads
    cards.push({
      status: 'Total Leads',
      count: filteredLeads.length,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      icon: <Users className="h-4 w-4" />,
      block: 1
    })

    // Block 2
    STATUS_BLOCKS[2].forEach(status => {
      const data = statusMap.get(status) || { count: 0, expectedAmount: 0 }
      cards.push({
        status,
        count: data.count,
        color: status === 'New' ? 'bg-emerald-500' : 
               status === 'In Follow Up' ? 'bg-blue-500' :
               status === 'Not Responding' ? 'bg-orange-500' : 'bg-yellow-500',
        textColor: status === 'New' ? 'text-emerald-600' : 
                   status === 'In Follow Up' ? 'text-blue-600' :
                   status === 'Not Responding' ? 'text-orange-600' : 'text-yellow-600',
        icon: getIcon(status),
        block: 2
      })
    })

    // Block 3
    STATUS_BLOCKS[3].forEach(status => {
      if (status === 'Expected Amount') {
        const totalExpected = Array.from(statusMap.values()).reduce((sum, data) => sum + data.expectedAmount, 0)
        cards.push({
          status,
          count: 0,
          expectedAmount: totalExpected,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-600',
          icon: <DollarSign className="h-4 w-4" />,
          block: 3
        })
      } else {
        const data = statusMap.get(status) || { count: 0, expectedAmount: 0 }
        cards.push({
          status,
          count: data.count,
          expectedAmount: data.expectedAmount,
          color: status === 'Hot' ? 'bg-red-500' :
                 status === 'Warm' ? 'bg-orange-500' :
                 status === 'Converted' ? 'bg-green-500' :
                 status === 'Booked' ? 'bg-blue-500' : 'bg-slate-500',
          textColor: status === 'Hot' ? 'text-red-600' :
                     status === 'Warm' ? 'text-orange-600' :
                     status === 'Converted' ? 'text-green-600' :
                     status === 'Booked' ? 'text-blue-600' : 'text-slate-600',
          icon: getIcon(status),
          block: 3
        })
      }
    })

    // Block 4
    STATUS_BLOCKS[4].forEach(status => {
      const data = statusMap.get(status) || { count: 0, expectedAmount: 0 }
      cards.push({
        status,
        count: data.count,
        color: 'bg-gray-500',
        textColor: 'text-gray-600',
        icon: getIcon(status),
        block: 4
      })
    })

    // Block 5: Conversion Metrics
    const totalLeads = filteredLeads.length
    const bookedCount = statusMap.get('Booked')?.count || 0
    const convertedCount = statusMap.get('Converted')?.count || 0
    const appFailedCount = statusMap.get('App. Failed')?.count || 0

    // Gross Conversion: Converted / Total Leads
    const grossConversion = totalLeads > 0 ? ((convertedCount / totalLeads) * 100) : 0

    // Net Conversion: Converted / Booked Leads
    const netConversion = bookedCount > 0 ? ((convertedCount / bookedCount) * 100) : 0

    cards.push({
      status: 'Gross Conversion',
      count: grossConversion,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      icon: <TrendingUp className="h-4 w-4" />,
      block: 5
    })

    cards.push({
      status: 'Net Conversion',
      count: netConversion,
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      textColor: 'text-amber-600',
      icon: <Target className="h-4 w-4" />,
      block: 5
    })

    // Block 6: BDE Performance - Booked / Total Leads
    const bdeBookingRate = totalLeads > 0 ? ((bookedCount / totalLeads) * 100) : 0

    cards.push({
      status: 'BDE Booking Rate',
      count: bdeBookingRate,
      color: 'bg-gradient-to-r from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
      icon: <CheckCircle className="h-4 w-4" />,
      block: 6
    })

    // Block 7: Successful Appointments
    const successfulAppointments = totalLeads > 0 ? (((totalLeads - appFailedCount) / totalLeads) * 100) : 0

    cards.push({
      status: 'Successful Appointments',
      count: successfulAppointments,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      textColor: 'text-cyan-600',
      icon: <CheckCircle className="h-4 w-4" />,
      block: 7
    })

    setStatusCards(cards)
  }, [filteredLeadStatuses, filteredLeads])

  useEffect(() => {
    if (paymentLinks.length === 0 && manualPayments.length === 0) return

    const linksInRange = paymentLinks.filter(p =>
      isDateInRange(p.payment_date || p.created_at, date)
    )
    const manualInRange = manualPayments.filter(p =>
      isDateInRange(p.payment_date || p.created_at, date)
    )

    const completed = [
      ...linksInRange.filter(p => p.status === "completed").map(p => ({ ...p, source: "link" })),
      ...manualInRange.filter(p => p.status === "completed").map(p => ({ ...p, source: "manual" })),
    ]
    const pending = [
      ...linksInRange.filter(p => p.status === "pending"),
      ...manualInRange.filter(p => p.status === "pending"),
    ]

    const totalCollected = completed.reduce((sum, p) => sum + (p.amount || 0), 0)
    const now = new Date().getTime()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000

    const thisWeek = completed
      .filter(p => new Date(p.payment_date || p.created_at).getTime() >= oneWeekAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const lastWeek = completed
      .filter(p => {
        const t = new Date(p.payment_date || p.created_at).getTime()
        return t >= twoWeeksAgo && t < oneWeekAgo
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const growthRate = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0

    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const sevenDaysAhead = now + 7 * 24 * 60 * 60 * 1000
    const overdue = pending
      .filter(p => new Date(p.created_at).getTime() < thirtyDaysAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const dueSoon = pending
      .filter(p => {
        const exp = new Date(p.expires_at || p.plan_expiry || p.created_at).getTime()
        return exp > now && exp <= sevenDaysAhead
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const outstandingBalance = pending.reduce((sum, p) => sum + (p.amount || 0), 0)
    const recoveryRate =
      totalCollected + outstandingBalance > 0
        ? (totalCollected / (totalCollected + outstandingBalance)) * 100
        : 0

    setCollectionAnalytics({
      totalCollected,
      thisWeek,
      lastWeek,
      growthRate,
      outstandingBalance,
      overdue,
      dueSoon,
      recoveryRate,
    })
  }, [paymentLinks, manualPayments, date])

  const handleCardClick = (status: string) => {
    if (status === 'Total Leads') {
      router.push("/leads")
    } else {
      router.push(`/leads?status=${encodeURIComponent(status)}`)
    }
  }

  const handleClearFilters = () => {
    setStatusFilter([])
    setSourceFilter([])
  setRegionFilter([])
    setPriorityFilter([])
    setDate(undefined)
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const toggleSourceFilter = (source: string) => {
    setSourceFilter(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

const toggleRegionFilter = (region: string) => {
  setRegionFilter(prev => 
    prev.includes(region) 
      ? prev.filter(r => r !== region)
      : [...prev, region]
  )
}

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilter(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const handleRefreshData = () => {
    fetchData(true)
  }

const hasActiveFilters = statusFilter.length > 0 || sourceFilter.length > 0 || regionFilter.length > 0 || priorityFilter.length > 0 || date?.from

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-600">Loading dashboard...</span>
      </div>
    )
  }

  const block1Cards = statusCards.filter(c => c.block === 1)
  const block2Cards = statusCards.filter(c => c.block === 2)
  const block3Cards = statusCards.filter(c => c.block === 3)
  const block4Cards = statusCards.filter(c => c.block === 4)

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
            <Button
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-emerald-200 hover:border-emerald-300 bg-transparent"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Status {statusFilter.length > 0 && `(${statusFilter.length})`}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-emerald-200 rounded-lg bg-white/50">
                {availableStatuses.map(status => (
                  <div key={status} className="flex items-center space-x-2 hover:bg-emerald-50 p-1.5 rounded transition-colors">
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={() => toggleStatusFilter(status)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Label>
                  </div>
                ))}
                {availableStatuses.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-2">No statuses available</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Source {sourceFilter.length > 0 && `(${sourceFilter.length})`}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-emerald-200 rounded-lg bg-white/50">
                {availableSources.map(source => (
                  <div key={source} className="flex items-center space-x-2 hover:bg-emerald-50 p-1.5 rounded transition-colors">
                    <Checkbox
                      id={`source-${source}`}
                      checked={sourceFilter.includes(source)}
                      onCheckedChange={() => toggleSourceFilter(source)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor={`source-${source}`} className="text-sm font-medium cursor-pointer">
                      {source}
                    </Label>
                  </div>
                ))}
                {availableSources.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-2">No sources available</p>
                )}
              </div>
            </div>

          <div className="space-y-3">
  <label className="text-sm font-semibold text-slate-700">
    Region {regionFilter.length > 0 && `(${regionFilter.length})`}
  </label>
  <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-emerald-200 rounded-lg bg-white/50">
    {availableRegions.map(region => (
      <div key={region} className="flex items-center space-x-2 hover:bg-emerald-50 p-1.5 rounded transition-colors">
        <Checkbox
          id={`region-${region}`}
          checked={regionFilter.includes(region)}
          onCheckedChange={() => toggleRegionFilter(region)}
          className="border-emerald-300 data-[state=checked]:bg-emerald-600"
        />
        <Label htmlFor={`region-${region}`} className="text-sm font-medium cursor-pointer">
          {region}
        </Label>
      </div>
    ))}
    {availableRegions.length === 0 && (
      <p className="text-sm text-slate-500 text-center py-2">No regions available</p>
    )}
  </div>
</div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Priority {priorityFilter.length > 0 && `(${priorityFilter.length})`}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-emerald-200 rounded-lg bg-white/50">
                {availablePriorities.map(priority => (
                  <div key={priority} className="flex items-center space-x-2 hover:bg-emerald-50 p-1.5 rounded transition-colors">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={priorityFilter.includes(priority)}
                      onCheckedChange={() => togglePriorityFilter(priority)}
                      className="border-emerald-300 data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor={`priority-${priority}`} className="text-sm font-medium cursor-pointer">
                      {priority}
                    </Label>
                  </div>
                ))}
                {availablePriorities.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-2">No priorities available</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700 bg-transparent"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasActiveFilters && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-emerald-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                <Filter className="h-4 w-4" />
                <span>
                  Showing {filteredLeads.length} of {allLeads.length} leads
                </span>
                {statusFilter.length > 0 && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                    Status: {statusFilter.length} selected
                  </span>
                )}
                {sourceFilter.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Source: {sourceFilter.length} selected
                  </span>
                )}
                {regionFilter.length > 0 && (
  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
    Region: {regionFilter.length} selected
  </span>
)}
                {priorityFilter.length > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    Priority: {priorityFilter.length} selected
                  </span>
                )}
                {date?.from && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                    Date Range Applied
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block 1: Total Leads */}
      {block1Cards.length > 0 && (
        <div className="grid grid-cols-1">
          {block1Cards.map((card) => (
            <Card
              key={card.status}
              onClick={() => handleCardClick(card.status)}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 cursor-pointer bg-gradient-to-br from-gray-200 via-gray-50 to-gray-200 border-2 border-transparent"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold capitalize text-slate-800">
                  {hasFullAccess ? card.status : "Assigned Leads"}
                </CardTitle>
                <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color} shadow-lg`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-800">{card.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Block 2: New, Follow Ups, Not Responding, Yet To Talk */}
      {block2Cards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Lead Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {block2Cards.map((card) => (
              <Card
                key={card.status}
                onClick={() => handleCardClick(card.status)}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 cursor-pointer bg-white/90 backdrop-blur-sm"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize text-slate-700">
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color}`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${card.textColor}`}>{card.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Block 3: Booked, Hot, Warm, etc */}
      {block3Cards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Lead Progress & Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {block3Cards.map((card) => (
              <Card
                key={card.status}
                onClick={() => card.status !== 'Expected Amount' && handleCardClick(card.status)}
                className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 ${
                  card.status === 'Expected Amount' ? 'bg-gradient-to-br from-gray-200 via-gray-50 to-gray-200 col-span-1 md:col-span-2 lg:col-span-1' : 'bg-white/90 backdrop-blur-sm cursor-pointer'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium capitalize ${card.status === 'Expected Amount' ? 'text-slate-800 font-semibold' : 'text-slate-700'}`}>
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color} ${card.status === 'Expected Amount' ? 'shadow-lg' : ''}`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  {card.status === 'Expected Amount' ? (
                    <div className="flex text-xl items-center text-slate-800 font-bold">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {(card.expectedAmount || 0).toLocaleString()}
                    </div>
                  ) : (
                    <>
                      <div className={`text-4xl font-bold ${card.textColor}`}>{card.count}</div>
                      {card.expectedAmount && card.expectedAmount > 0 && (
                        <div className="flex text-xs items-center text-slate-600 mt-2">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {card.expectedAmount.toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Block 4: Cold & Lost */}
      {block4Cards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Closed Leads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {block4Cards.map((card) => (
              <Card
                key={card.status}
                onClick={() => handleCardClick(card.status)}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 cursor-pointer bg-white/90 backdrop-blur-sm"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize text-slate-700">
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color}`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${card.textColor}`}>{card.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Block 5: Conversion Metrics */}
      {statusCards.filter(c => c.block === 5).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Conversion Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusCards.filter(c => c.block === 5).map((card) => (
              <Card
                key={card.status}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-gray-200 via-gray-50 to-gray-200"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color} shadow-lg`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-slate-800">
                    {card.count.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    {card.status === 'Gross Conversion' 
                      ? 'Converted / Total Leads' 
                      : 'Converted / Booked Leads'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Block 6: BDE Performance */}
      {statusCards.filter(c => c.block === 6).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">BDE Performance</h3>
          <div className="grid grid-cols-1">
            {statusCards.filter(c => c.block === 6).map((card) => (
              <Card
                key={card.status}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-violet-50 to-purple-50"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color} shadow-lg`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-violet-600">
                    {card.count.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Booked / Total Leads
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Block 7: Successful Appointments */}
      {statusCards.filter(c => c.block === 7).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Appointment Success Rate</h3>
          <div className="grid grid-cols-1">
            {statusCards.filter(c => c.block === 7).map((card) => (
              <Card
                key={card.status}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 bg-gradient-to-br from-cyan-50 to-blue-50"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    {card.status}
                  </CardTitle>
                  <div className={`p-2 rounded-full text-white group-hover:scale-110 transition-transform ${card.color} shadow-lg`}>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-600">
                    {card.count.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    (Total Leads - Failed) / Total Leads × 100
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Collection Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          onClick={() => router.push("/reports")}
          className="border-0 shadow-xl bg-gradient-to-br from-blue-100 to-blue-50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-bold text-black">
              <IndianRupee className="h-5 w-5" />
              Collection Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 mb-2 flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {collectionAnalytics.totalCollected.toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 mb-4">Total collected this month</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">This Week</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {collectionAnalytics.thisWeek.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Last Week</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {collectionAnalytics.lastWeek.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className={`font-bold flex items-center ${collectionAnalytics.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {collectionAnalytics.growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/reports")}
          className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertCircle className="h-5 w-5" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2 flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {collectionAnalytics.outstandingBalance.toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 mb-4">Pending payments</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Overdue (30+ days)</span>
                <span className="font-bold text-red-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {collectionAnalytics.overdue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Due Soon (7 days)</span>
                <span className="font-bold text-orange-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {collectionAnalytics.dueSoon.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Recovery Rate</span>
                <span className="font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {collectionAnalytics.recoveryRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}