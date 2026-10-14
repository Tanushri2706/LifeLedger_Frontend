"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { timelineApi } from "./timeline-api";
import type {
  GetTimelineQueryParams,
  TimelineResponseData,
  TimelineSingleEventResponseData,
} from "./timeline-types";

export const TIMELINE_QUERY_KEY = ["timeline"] as const;

export function useTimelineQuery(params?: GetTimelineQueryParams) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<TimelineResponseData, Error>({
    queryKey: [...TIMELINE_QUERY_KEY, params],
    queryFn: async () => {
      const res = await timelineApi.getTimeline(params);
      return res.data;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

export function useInfiniteTimelineQuery(params?: Omit<GetTimelineQueryParams, "page">) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useInfiniteQuery<TimelineResponseData, Error>({
    queryKey: [...TIMELINE_QUERY_KEY, "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await timelineApi.getTimeline({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 15,
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

export function useTimelineEventDetailQuery(eventId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<TimelineSingleEventResponseData, Error>({
    queryKey: [...TIMELINE_QUERY_KEY, eventId],
    queryFn: async () => {
      const res = await timelineApi.getTimelineEventById(eventId);
      return res.data;
    },
    enabled: isAuthenticated && !isAuthLoading && !!eventId,
    staleTime: 60 * 1000,
  });
}
