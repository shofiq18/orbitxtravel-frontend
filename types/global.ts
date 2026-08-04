import * as z from "zod";

export interface Quotation {
  id: string;
  quotationNo: string;
  customer: string;
  items: number;
  status: "Submit" | "Approve" | "Cancel";
}

export const formSchema = z.object({
  quotationNo: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  mobile: z.string().min(10, "Valid mobile is required"),
  email: z.string().email(),
  billingAddress: z.string(),
  shippingAddress: z.string(),
  products: z.array(
    z.object({
      sku: z.string().min(1, "SKU required"),
      description: z.string(),
      uom: z.string(),
      quantity: z.number().min(1),
    }),
  ),
  comment: z.string().optional(),
  file: z.any().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IBaseResponse<T = void> {
  success: boolean;
  statusCode: number;
  message: string;
  IMeta?: IMeta;
  data?: T;
}

export interface ChildrenProps {
  children: React.ReactNode;
}

// How It Works Card Props === HOMEPAGE

export interface HowItWorksCardProps {
  serial: number;
  title: string;
  subtitle: string;
  titleColor?: string;
  sectionBg?: string;
}

// Icon section type
export interface iconArrType {
  id: number;
  icon: string;
  title: string;
}

// auth flow types

// Login Types
export interface ILoginPayload {
  email: string;
  password: string;
}

export type ILoginResponse = IBaseResponse<{ token: string }>;

// ===================
// Password Change Types

// Forgot types
export interface IForgotPasswordPayload {
  email: string;
}
export type IForgotPasswordResponse = IBaseResponse;

// Resend OTP
export interface IResendOTPReqBody {
  email: string;
}
// export interface IResendOTPBaseResponse {
//   success: boolean;
//   statusCode: number;
//   message: string;
// }
export type IResendOTPBaseResponse = IBaseResponse;

// Reset Password
export interface IResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

export type IResetPasswordResponse = IBaseResponse;

// Verify OTP type
export interface IVerifyOTPPayload {
  email: string;
  otp: string;
}

export type IVerifyOTPResponse = IBaseResponse<{ message: string }>;

// Profile Update Types
export interface IUpdateProfilePayload {
  name: string;
  phone: string;
  isTwoFactorEnabled: boolean;
}

export type IUpdateProfileResponse = IBaseResponse;

// User type

export interface IUserData {
  //   [x: string]: string | StaticImport;
  id: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  email: string;
  phone: string;
  location: string | null;
  expertise: string[];
  startTime: string | null;
  endTime: string | null;
  workingDays: ("M" | "T" | "W" | "TH" | "F" | "S" | "SU")[];
  isDeleted: boolean;
  notes: string | null;
  profileImage: string | null;
  profilePicture: string | null;
  password: string | null;
  resetToken: string | null;
  resetExpires: string | null;
  inviteSentAt: string | null;
  inviteCount: number;
  isPasswordChanged: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface IUserListData {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: IUserData[];
}

export type IUserResponse = IBaseResponse<IUserListData>;

export type IUserRespon = IBaseResponse<IUserData>;

//all user data

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  profileUrl: string | null;
  stripeCustomerId: string | null;
  hasActiveSubscription: boolean;
  otp: number | null;
  otpExpiresAt: string | null;
  isTwoFactorEnabled: boolean;
  password: string;
  role: "user" | "admin" | "super_admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  type: string;
}
export interface MetaData {
  page: number;
  limit: number;
  total: number;
}
export interface UsersData {
  meta: MetaData;
  data: User[];
}
export interface UsersResponse {
  success: boolean;
  message: string;
  data: UsersData;
}

//payment

// User object
export interface UserforPayment {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  profileUrl: string | null;
  stripeCustomerId: string;
  hasActiveSubscription: boolean;
  otp: string | null;
  otpExpiresAt: string | null;
  isTwoFactorEnabled: boolean;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Plan object
export interface Plan {
  id: string;
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
}

// Payment object
export interface Payment {
  id: string;
  amount: number;
  paymentMethodId: string;
  previousPlanId: string | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  endDate: string | null;
  refundedAmount: number | null;
  subscriptionId: string;
  userId: string;
  planId: string;
  stripePriceId: string;
  stripeProductId: string;
  user: UserforPayment;
  plan: Plan;
}

// Pagination meta
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Data object
export interface PaymentData {
  meta: Meta;
  data: Payment[];
}

// API response
export interface PaymentApiResponse {
  success: boolean;
  message: string;
  data: PaymentData;
}

//get all news

export interface NewsUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  profileUrl: string;
  stripeCustomerId: string | null;
  hasActiveSubscription: boolean;
  otp: number | null;
  otpExpiresAt: string | null;
  isTwoFactorEnabled: boolean;
  password: string;
  role: "user" | "super_admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  thumbUrl: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: NewsUser;
}

export interface NewsResponse {
  success: boolean;
  message: string;
  data: NewsItem[];
}

//single job type
export interface SingleJob {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  profileUrl: string;
  stripeCustomerId: string | null;
  hasActiveSubscription: boolean;
  otp: string | null;
  otpExpiresAt: string | null;
  isTwoFactorEnabled: boolean;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface news {
  id: string;
  title: string;
  thumbUrl: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: SingleJob;
}

export interface SingleJobResponse {
  success: boolean;
  message: string;
  data: news;
}

//feedback

export interface IFeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    comment: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  errorSources?: string[];
}

//get all plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  isActive: boolean;
  createdAt: string; // or Date if you convert it
  updatedAt: string; // or Date if you convert it
  features: string[];
}

export interface SubscriptionPlansResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
}

//Availablility

export interface AvailabilityState {
  id: string;
  key: "AVAILABLE" | "PARTIAL" | "FULLY_BOOKED";
  availabilityPercentage: number;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityStatesResponse {
  success: boolean;
  message: string;
  data: AvailabilityState[];
}

//Energy Level

export interface EnergyLevel {
  id: string;
  key: string;
  day: number;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyLevelsResponse {
  success: boolean;
  message: string;
  data: EnergyLevel[];
}

//Project phase
export interface ProjectPhase {
  id: string;
  key: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhasesResponse {
  success: boolean;
  message: string;
  data: ProjectPhase[];
}

//projectstatus
export interface ProjectStatus {
  id: string;
  key: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
export interface ProjectStatusResponse {
  success: boolean;
  message: string;
  data: ProjectStatus[];
}

///Project

// Root response
export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: ProjectsData;
}

// Data wrapper
export interface ProjectsData {
  meta: Meta;
  data: Project[];
}

// Pagination meta
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Project
export interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  projectType: string;
  client: string;
  location: string;
  status: Status;
  dateRange: DateRange;
  value: ProjectValue;
  phase: Phase;
  team: Team;
}

// Status
export interface Status {
  key: "SPECULATION" | string;
  color: string;
  winProbability: number;
}

// Date range
export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

// Project value
export interface ProjectValue {
  amount: number;
  currency: string;
  formatted: string;
}

// Phase
export interface Phase {
  key: "PRODUCTION" | string;
  color: string;
}

// Team
export interface Team {
  members: TeamMember[];
  extraCount: number;
}

// Team member
export interface TeamMember {
  id: string;
  name: string;
  profileImage: string | null;
}

//single project

export interface SingleProjectApiResponse {
  success: boolean;
  message: string;
  data: SingleProjectData;
}
export interface UserAllocation {
  allocation: number;
  hoursPerDay: number;
}

export interface SingleProjectData {
  project: SingleProject;
  yourAllocation: UserAllocation;
  timeline: SingleProjectTimeline[];
  teamMembers: SingleProjectTeamMember[];
}
export interface SingleProject {
  id: string;
  projectName: string;
  projectCode: string;
  projectType: string;
  customerName: string;
  location: string;
  status: SingleProjectStatus;
  estimatedValue: number;
  currency: string;
  winProbability: number;
}
export interface SingleProjectStatus {
  key: SingleProjectStatusKey;
  color: string;
}

export type SingleProjectStatusKey =
  | "SPECULATION"
  | "PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";
export interface SingleProjectTimeline {
  phaseKey: SingleProjectPhaseKey;
  startDate: string; // ISO string
  endDate: string; // ISO string
}
export type SingleProjectPhaseKey =
  | "PITCH"
  | "PRODUCTION"
  | "EVENT_DAYS"
  | "WRAP_UP";
export interface SingleProjectTeamMember {
  id: string;
  name: string;
  role: SingleProjectUserRole;
  profileImage: string | null;
  phase: SingleProjectPhaseKey;
  allocation: number; // %
  startDate: string; // ISO string
  endDate: string; // ISO string
}
export type SingleProjectUserRole = "ADMIN" | "USER" | "MANAGER";

//get myself
export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type UserProfileResponse = {
  success: boolean;
  message: string;
  data: UserProfile;
};

type SignleUserData = {
  id: string;
  name: string;
  role: "USER" | "ADMIN" | string; // adjust based on your roles
  email: string;
  phone: string;
  location: string | null;
  expertise: string[];
  startTime: string | null;
  endTime: string | null;
  workingDays: string[]; // e.g., ["M", "T", "W"]
  isDeleted: boolean;
  notes: string | null;
  profileImage: string | null;
  password: string | null;
  resetToken: string;
  resetExpires: string;
  inviteSentAt: string;
  inviteCount: number;
  isPasswordChanged: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetSingleUserResponse = {
  success: boolean;
  message: string;
  data: SignleUserData;
};

// Admin Homepgae All Types START

// Project Timeline API Types

// export interface ProjectTimelineResponse {
//   success: boolean;
//   message: string;
//   data: {
//     meta: {
//       page: number;
//       limit: number;
//       totalProjects: number;
//       totalPages: number;
//       view: "daily" | "weekly" | "monthly";
//       range: string;
//       startDate: string;
//       endDate: string;
//     };
//     data: TimelineProject[];
//   };
// }

//single profile

export interface UserProfiles {
  id: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER"; // you can extend if more roles exist
  email: string;
  phone: string;
  location: string | null;
  expertise: string[];
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  workingDays: ("M" | "T" | "W" | "TH" | "F" | "SA" | "SU")[]; // add SA, SU if weekend included
  isDeleted: boolean;
  notes: string | null;
  profileImage: string | null;
  password: string | null;
  resetToken: string | null;
  resetExpires: string | null;
  inviteSentAt: string | null;
  inviteCount: number;
  isPasswordChanged: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserProfileResponses {
  success: boolean;
  message: string;
  data: UserProfiles;
}

// Project Type Types START
export interface IProjectTypePayload {
  name: string;
}

export interface IProjectType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type IProjectTypeResponse = IBaseResponse<IProjectType>;

// Get all project type
export type IGetAllProjectTypeResponse = IBaseResponse<IProjectType[]>;
// Delete response
export type IProjectTypeDeleteResponse = IBaseResponse;

// Project Type Types END

// Public Holiday Related Types - START

// "id": "69630c1d6c313d4ec8f1a065",
// "name": "International Workers' Day",
// "date": "2026-01-01T00:00:00.000Z",
// "isRecurring": true,
// "country": "BD",
// "description": "May Day",
// "status": "non-working day",
// "type": "INTERNATIONAL",
// "createdAt": "2026-01-11T02:34:05.423Z",
// "updatedAt": "2026-01-11T02:34:05.423Z"
// enum HolidayType {
//   NATIONAL
//   RELIGIOUS
//   INTERNATIONAL
//   OPTIONAL
// }
// export interface IPublicHolidayTypeEnum {
//   NATIONAL: "NATIONAL";
//   RELIGIOUS: "RELIGIOUS";
//   INTERNATIONAL: "INTERNATIONAL";
//   OPTIONAL: "OPTIONAL";
// }
export type TPublicHolidayType =
  | "NATIONAL"
  | "RELIGIOUS"
  | "INTERNATIONAL"
  | "OPTIONAL";

export interface IPublicHoliday {
  id: string;
  name: string;
  date: string;
  description: string;
  type: TPublicHolidayType;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateHolidayPayload {
  name: string;
  date: string;
  description: string;
  type: TPublicHolidayType;
  status?: string;
}

// Category Types
export interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoriesListResponse = IBaseResponse<CategoryData[]>;
// Coupon Types
export interface ICoupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: string; // From API: "Active"
}

export interface ICreateCouponPayload {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageLimit: number;
  validFrom: string;
  validTo: string;
}

export type ICouponResponse = IBaseResponse<ICoupon>;
export type IAllCouponsResponse = IBaseResponse<ICoupon[]>;
