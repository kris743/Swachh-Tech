/* ============================================
   SWACHH TECH AI — Complete Type Definitions
   ============================================ */

// ====== Enums ======

export enum UserRole {
  CITIZEN = "citizen",
  WORKER = "worker",
  DRIVER = "driver",
  GREEN_CHAMPION = "green_champion",
  RECYCLER = "recycler",
  ADMIN = "admin",
}

export enum ComplaintType {
  MISSED_COLLECTION = "missed_collection",
  OVERFLOWING_BIN = "overflowing_bin",
  ILLEGAL_DUMPING = "illegal_dumping",
  IMPROPER_SEGREGATION = "improper_segregation",
  VEHICLE_ISSUE = "vehicle_issue",
  WORKER_BEHAVIOR = "worker_behavior",
  TIMING_ISSUE = "timing_issue",
  OTHER = "other",
}

export enum ComplaintStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  CLOSED = "closed",
}

export enum WasteType {
  WET = "wet",
  DRY = "dry",
  HAZARDOUS = "hazardous",
  E_WASTE = "e_waste",
  SANITARY = "sanitary",
  BIOMEDICAL = "biomedical",
  CONSTRUCTION = "construction",
}

export enum TruckStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  EN_ROUTE = "en_route",
  IDLE = "idle",
}

export enum CollectionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  MISSED = "missed",
  SKIPPED = "skipped",
}

export enum RewardLevel {
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
}

export enum NotificationType {
  COLLECTION_REMINDER = "collection_reminder",
  COMPLAINT_UPDATE = "complaint_update",
  REWARD_EARNED = "reward_earned",
  ROUTE_ASSIGNED = "route_assigned",
  SYSTEM_ALERT = "system_alert",
  TRAINING_NEW = "training_new",
  LEVEL_UP = "level_up",
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  HALF_DAY = "half_day",
  LEAVE = "leave",
}

export enum InsightType {
  RECOMMENDATION = "recommendation",
  ALERT = "alert",
  RISK = "risk",
  OPPORTUNITY = "opportunity",
}

export enum InsightSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// ====== User Models ======

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  ward?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenProfile {
  userId: string;
  householdId: string;
  address: string;
  ward: string;
  locality: string;
  pincode: string;
  rewardPoints: number;
  rewardLevel: RewardLevel;
  totalCollections: number;
  recyclingScore: number;
  qrCodeId: string;
}

export interface WorkerProfile {
  userId: string;
  employeeId: string;
  ward: string;
  zone: string;
  routeId?: string;
  supervisorId?: string;
  totalCollections: number;
  rating: number;
  attendancePercentage: number;
  joiningDate: string;
}

export interface DriverProfile {
  userId: string;
  employeeId: string;
  licenseNumber: string;
  truckId?: string;
  routeId?: string;
  totalTrips: number;
  rating: number;
  joiningDate: string;
}

export interface GreenChampionProfile {
  userId: string;
  areaAssigned: string;
  ward: string;
  totalVerifications: number;
  totalReports: number;
  rating: number;
  joiningDate: string;
}

export interface RecyclerProfile {
  userId: string;
  businessName: string;
  licenseNumber: string;
  materialsAccepted: string[];
  operatingWards: string[];
  totalPickups: number;
  totalRevenue: number;
  rating: number;
}

// ====== Core Models ======

export interface Household {
  id: string;
  address: string;
  ward: string;
  locality: string;
  pincode: string;
  memberCount: number;
  qrCodeId: string;
  citizenId: string;
  lat?: number;
  lng?: number;
  createdAt: string;
}

export interface QRCode {
  id: string;
  code: string;
  householdId: string;
  isActive: boolean;
  generatedAt: string;
}

export interface Truck {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  currentLoad: number;
  fuelLevel: number;
  status: TruckStatus;
  driverId?: string;
  routeId?: string;
  currentLat?: number;
  currentLng?: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
}

export interface Route {
  id: string;
  name: string;
  ward: string;
  zone: string;
  totalStops: number;
  estimatedDuration: number;
  distance: number;
  isActive: boolean;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  householdId: string;
  address: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string;
  lat?: number;
  lng?: number;
}

export interface RouteAssignment {
  id: string;
  routeId: string;
  workerId: string;
  driverId: string;
  truckId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: "pending" | "active" | "completed";
  completedStops: number;
  totalStops: number;
}

// ====== Collections ======

export interface WasteCollection {
  id: string;
  householdId: string;
  workerId: string;
  routeAssignmentId: string;
  wasteType: WasteType;
  weight: number;
  status: CollectionStatus;
  segregationQuality: "good" | "average" | "poor";
  notes?: string;
  imageUrl?: string;
  collectedAt: string;
  householdAddress?: string;
  workerName?: string;
}

// ====== Complaints ======

export interface Complaint {
  id: string;
  citizenId: string;
  type: ComplaintType;
  status: ComplaintStatus;
  title: string;
  description: string;
  address: string;
  ward: string;
  lat?: number;
  lng?: number;
  assignedToId?: string;
  assignedToName?: string;
  verifiedById?: string;
  aiClassification?: string;
  aiConfidence?: number;
  priority: "low" | "medium" | "high" | "urgent";
  media: ComplaintMedia[];
  updates: ComplaintUpdate[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ComplaintMedia {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  status: ComplaintStatus;
  message: string;
  createdAt: string;
}

// ====== Rewards ======

export interface Reward {
  id: string;
  citizenId: string;
  points: number;
  level: RewardLevel;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface RewardTransaction {
  id: string;
  citizenId: string;
  type: "earned" | "redeemed";
  points: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

// ====== Training ======

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  targetRoles: UserRole[];
  duration: number;
  contentUrl: string;
  thumbnailUrl?: string;
  isRequired: boolean;
  order: number;
}

export interface TrainingProgress {
  id: string;
  userId: string;
  moduleId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
}

// ====== Notifications ======

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ====== Attendance ======

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLat?: number;
  checkInLng?: number;
}

// ====== Analytics ======

export interface AnalyticsSnapshot {
  totalCollections: number;
  totalWeight: number;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  activeWorkers: number;
  activeTrucks: number;
  activeCitizens: number;
  recyclingRate: number;
  citizenEngagement: number;
  collectionTrend: TrendData[];
  complaintsByType: ChartData[];
  wasteComposition: ChartData[];
  weeklyCollections: ChartData[];
  wardPerformance: WardPerformance[];
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface WardPerformance {
  ward: string;
  collections: number;
  complaints: number;
  recyclingRate: number;
  efficiency: number;
}

// ====== AI Insights ======

export interface AIInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  affectedWards: string[];
  dataPoints: Record<string, number>;
  createdAt: string;
  isActioned: boolean;
}

// ====== Audit Log ======

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

// ====== Recycler-specific ======

export interface PickupRequest {
  id: string;
  householdId: string;
  recyclerId: string;
  materials: string[];
  estimatedWeight: number;
  actualWeight?: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  scheduledDate: string;
  completedDate?: string;
  amount?: number;
  address: string;
}

export interface RecyclerMaterial {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  unit: string;
  isActive: boolean;
}

// ====== Fuel Log ======

export interface FuelLog {
  id: string;
  truckId: string;
  driverId: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  date: string;
}

// ====== API Response Types ======

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
  role: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  ward?: string;
  address?: string;
  employeeId?: string;
  licenseNumber?: string;
  businessName?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ====== Leaderboard ======

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  level: RewardLevel;
  collections: number;
  ward: string;
}

// ====== Report Types ======

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  format: "pdf" | "csv" | "excel";
}

export interface ReportRequest {
  templateId: string;
  startDate: string;
  endDate: string;
  wards?: string[];
  format: "pdf" | "csv" | "excel";
}
