/**
 * Itemized Sub-Structure for an individual daily activity.
 */
export interface ActivityItem {
  description: string;
  cost: number;
}

/**
 * Itemized Sub-Structure for nightly lodgings.
 */
export interface AccommodationItem {
  name: string;
  cost: number;
}

/**
 * Structural roadmap cluster for a single day plan inside a trip.
 */
export interface DayPlanNode {
  day: number | string;
  title: string;
  dayTotalCost: number;
  accommodation: AccommodationItem;
  activities: ActivityItem[];
}

/**
 * Master Trip Blueprint contract interface.
 * Matches your core application state, Redis cache matrices, and UI views.
 */
export interface TripItem {
  id?: string; 
  _id?: string;                   // Optional database primary key id
  userId?: string;                // Reference pointer tracking ownership nodes
  destination: string;            // Name of target travel location (e.g. "Rishikesh, India")
  totalEstimatedCost: number;     // Grand total aggregate calculations
  daysCount?: number;             // Total longevity sequence duration
  travelStyle?: string;           // Workspace telemetry filter state (e.g. "Adventure")
  createdAt?: string | Date;      // Automated system tracking metadata timestamp
  days: DayPlanNode[];            // Explicit itinerary timeline dataset array
}