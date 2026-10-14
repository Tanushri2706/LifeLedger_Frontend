import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  TimelineResponseData,
  TimelineSingleEventResponseData,
  GetTimelineQueryParams,
} from "./timeline-types";

export const timelineApi = {
  /**
   * Get chronological health timeline with pagination and optional filters
   */
  getTimeline: async (params?: GetTimelineQueryParams): Promise<ApiResponse<TimelineResponseData>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.eventType) query.append("eventType", params.eventType);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.search && params.search.trim()) query.append("search", params.search.trim());
    if (params?.subjectType) query.append("subjectType", params.subjectType);
    if (params?.subjectId) query.append("subjectId", params.subjectId);

    const queryString = query.toString();
    const url = queryString ? `/timeline?${queryString}` : "/timeline";
    return http.get<ApiResponse<TimelineResponseData>>(url);
  },

  /**
   * Get single timeline event by ID
   */
  getTimelineEventById: async (eventId: string): Promise<ApiResponse<TimelineSingleEventResponseData>> => {
    return http.get<ApiResponse<TimelineSingleEventResponseData>>(`/timeline/${eventId}`);
  },
};
