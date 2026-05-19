export type HandicapType = 
  | 'sensoriel' 
  | 'moteur' 
  | 'mental' 
  | 'psychique' 
  | 'cognitif';

export type CenterSource = 'healthcare';

export type OfferType = 'vaccination' | 'depistage' | 'healthcare';

export type DashboardOfferType = 'all' | OfferType;

export type DashboardDataSource =
  | 'all'
  | 'practitioners'
  | 'establishments'
  | 'mixed';

export type DashboardDigitalAccess =
  | 'all'
  | 'online_booking'
  | 'website'
  | 'doctolib';

export type LocationKind =
  | 'individual_or_small_practice'
  | 'probable_group_practice'
  | 'probable_specialist_group'
  | 'probable_health_center_or_shared_site';

export type DashboardLocationKind = 'all' | LocationKind;

export interface CenterProfession {
  label: string;
  count: number;
}

export interface FilterFacetOption<T extends string = string> {
  value: T;
  count: number;
}

export interface CenterFilterFacets {
  dataSources: FilterFacetOption<DashboardDataSource>[];
  digitalAccess: FilterFacetOption<DashboardDigitalAccess>[];
  locationKinds: FilterFacetOption<DashboardLocationKind>[];
  professions: FilterFacetOption<string>[];
}

export interface AccessibilityProfileSummary {
  relevantCount: number;
  score?: number;
}

export interface AccessibilityScore {
  physique: number; // 0-5
  numerique: number; // 0-5
  accueil: number; // 0-5
}

export type AccessibilityAuditStatus =
  | 'unknown'
  | 'audited_accessible'
  | 'audited_inaccessible';

export interface DigitalAccess {
  hasOnlineBooking: boolean;
  hasDoctolib: boolean;
  doctolibUrl: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  hasTeleconsultation: boolean;
  bookingMethods: string[];
  websiteAccessibilityStatus: AccessibilityAuditStatus;
  doctolibAccessibilityStatus: AccessibilityAuditStatus;
  confidence: number;
  source: string | null;
  checkedAt: string | null;
}

export type ReviewItemStatus =
  | 'confirmed_present'
  | 'reported_absent'
  | 'reported_present'
  | 'custom_present';

export interface AccessibilityCriterion {
  key: string;
  label: string;
  handicapTypes: HandicapType[];
  present: boolean;
}

export interface ReviewAccessibilityItem {
  criterionKey: string;
  label: string;
  status: ReviewItemStatus;
  handicapTypes: HandicapType[];
  comment?: string | null;
}

export interface AccessibilityReviewSignals {
  reviewCount: number;
  confirmedCount: number;
  positiveCount: number;
  absentCount: number;
  customCount: number;
  scoreDeltas: AccessibilityScore;
  handicapDeltas: Record<HandicapType, number>;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  hours: string;
  type: OfferType;
  source?: CenterSource;
  offerTypes?: OfferType[];
  locationKind?: LocationKind | null;
  professions?: CenterProfession[];
  accessibilityProfiles?: Record<string, AccessibilityProfileSummary>;
  accessibilityHandicapScores?: Record<HandicapType, number>;
  digitalAccess?: DigitalAccess;
  accessibilityCriteria?: AccessibilityCriterion[];
  reviewSignals?: AccessibilityReviewSignals;
  accessibilityScore: AccessibilityScore;
  globalScore: number;
  reviews: Review[];
  services: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  centerId: string;
  date: string;
  scores: AccessibilityScore;
  comment: string;
  handicapTypes: string[];
  helpfulCount: number;
  accessibilityItems?: ReviewAccessibilityItem[];
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  handicapType: string | null;
}

export interface Appointment {
  id: string;
  userId: string;
  centerId: string;
  centerName: string;
  date: string;
  time: string;
  type: 'vaccination' | 'depistage';
  status: 'upcoming' | 'past' | 'cancelled';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'appointment' | 'review' | 'system';
}
