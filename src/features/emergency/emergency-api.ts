import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  IEmergencyCapabilities,
  IEmergencyInfo,
  UpdateEmergencyInfoDto,
  IEmergencyContact,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
  IEmergencyQR,
  IPublicEmergencyInfo,
  TriggerSOSDto,
  TriggerSOSResponseDto,
  ShareEmergencyPayloadDto,
} from "./emergency-types";

export const emergencyApi = {
  /**
   * Get real-time emergency service capabilities & helpline status
   * GET /api/v1/emergency/capabilities
   */
  getCapabilities: async (): Promise<ApiResponse<IEmergencyCapabilities>> => {
    return http.get<ApiResponse<IEmergencyCapabilities>>("/emergency/capabilities");
  },

  /**
   * Get current user's emergency medical profile
   * GET /api/v1/emergency/profile
   */
  getEmergencyProfile: async (): Promise<
    ApiResponse<{ emergencyInfo: IEmergencyInfo }>
  > => {
    return http.get<ApiResponse<{ emergencyInfo: IEmergencyInfo }>>("/emergency/profile");
  },

  /**
   * Update emergency medical profile (blood group, allergies, conditions, notes)
   * PUT /api/v1/emergency/profile
   */
  updateEmergencyProfile: async (
    dto: UpdateEmergencyInfoDto
  ): Promise<ApiResponse<{ emergencyInfo: IEmergencyInfo }>> => {
    return http.put<ApiResponse<{ emergencyInfo: IEmergencyInfo }>>(
      "/emergency/profile",
      dto
    );
  },

  /**
   * Get emergency contacts list
   * GET /api/v1/emergency/contacts
   */
  getContacts: async (): Promise<
    ApiResponse<{ contacts: IEmergencyContact[] }>
  > => {
    return http.get<ApiResponse<{ contacts: IEmergencyContact[] }>>(
      "/emergency/contacts"
    );
  },

  /**
   * Add a new emergency contact
   * POST /api/v1/emergency/contacts
   */
  createContact: async (
    dto: CreateEmergencyContactDto
  ): Promise<ApiResponse<{ contact: IEmergencyContact }>> => {
    return http.post<ApiResponse<{ contact: IEmergencyContact }>>(
      "/emergency/contacts",
      dto
    );
  },

  /**
   * Update an existing emergency contact
   * PUT /api/v1/emergency/contacts/:id
   */
  updateContact: async (
    contactId: string,
    dto: UpdateEmergencyContactDto
  ): Promise<ApiResponse<{ contact: IEmergencyContact }>> => {
    return http.put<ApiResponse<{ contact: IEmergencyContact }>>(
      `/emergency/contacts/${encodeURIComponent(contactId)}`,
      dto
    );
  },

  /**
   * Delete an emergency contact
   * DELETE /api/v1/emergency/contacts/:id
   */
  deleteContact: async (contactId: string): Promise<ApiResponse<null>> => {
    return http.delete<ApiResponse<null>>(
      `/emergency/contacts/${encodeURIComponent(contactId)}`
    );
  },

  /**
   * Get current user's Emergency QR
   * GET /api/v1/emergency/qr
   */
  getEmergencyQR: async (): Promise<ApiResponse<{ qr: IEmergencyQR }>> => {
    return http.get<ApiResponse<{ qr: IEmergencyQR }>>("/emergency/qr");
  },

  /**
   * Rotate and invalidate previous Emergency QR token
   * POST /api/v1/emergency/qr/rotate
   */
  rotateEmergencyQR: async (): Promise<ApiResponse<{ qr: IEmergencyQR }>> => {
    return http.post<ApiResponse<{ qr: IEmergencyQR }>>("/emergency/qr/rotate", {});
  },

  /**
   * Public lookup for First Responders via QR token (Unauthenticated)
   * GET /api/v1/emergency/info/:token
   */
  getPublicEmergencyInfo: async (
    token: string
  ): Promise<ApiResponse<{ emergencyInfo: IPublicEmergencyInfo }>> => {
    return http.get<ApiResponse<{ emergencyInfo: IPublicEmergencyInfo }>>(
      `/emergency/info/${encodeURIComponent(token)}`
    );
  },

  /**
   * Trigger SOS safety log record
   * POST /api/v1/emergency/sos
   */
  triggerSOS: async (
    dto: TriggerSOSDto
  ): Promise<ApiResponse<TriggerSOSResponseDto>> => {
    return http.post<ApiResponse<TriggerSOSResponseDto>>("/emergency/sos", dto);
  },

  /**
   * Share emergency summary with recipient email/phone
   * POST /api/v1/emergency/share
   */
  shareEmergencyInfo: async (
    dto: ShareEmergencyPayloadDto
  ): Promise<
    ApiResponse<{
      success: boolean;
      recipient: string;
      sharedAt: Date;
      summary: Record<string, unknown>;
    }>
  > => {
    return http.post("/emergency/share", dto);
  },
};
