import {
  Center,
  CenterFilterFacets,
  DashboardDataSource,
  DashboardDigitalAccess,
  DashboardLocationKind,
  DashboardOfferType,
  HandicapType,
  Review,
  ReviewAccessibilityItem,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  timeoutMs?: number;
}

const DEFAULT_API_TIMEOUT_MS = 15000;

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, timeoutMs = DEFAULT_API_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
    signal: controller.signal,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La requête a pris trop de temps. Réessayez dans quelques secondes.");
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(error.error || "Une erreur est survenue");
  }

  return response.json();
}

// Auth API
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    handicapType?: string;
  }) => api<{
    message: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      handicapType: string | null;
    };
    session?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  }>("/api/auth/signup", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    api<{
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        handicapType: string | null;
      };
      session: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      };
    }>("/api/auth/login", { method: "POST", body: data }),

  logout: (token: string) =>
    api<{ message: string }>("/api/auth/logout", { method: "POST", token }),

  me: (token: string) =>
    api<{
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      handicapType: string | null;
      createdAt: string;
    }>("/api/auth/me", { token }),

  updateProfile: (
    token: string,
    data: {
      firstName?: string;
      lastName?: string;
      handicapType?: string;
      phone?: string;
    }
  ) => api<unknown>("/api/auth/me", { method: "PUT", body: data, token }),

  refresh: (refreshToken: string) =>
    api<{
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    }>("/api/auth/refresh", { method: "POST", body: { refreshToken } }),
};

// Centers API
export const centersApi = {
  list: (params?: {
    search?: string;
    limit?: number;
    offset?: number;
    offerType?: DashboardOfferType;
    dataSource?: DashboardDataSource;
    digitalAccess?: DashboardDigitalAccess;
    locationKind?: DashboardLocationKind;
    profession?: string;
    handicapTypes?: HandicapType[];
    handicapMinScore?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.offerType && params.offerType !== "all") searchParams.set("offerType", params.offerType);
    if (params?.dataSource && params.dataSource !== "all") {
      searchParams.set("dataSource", params.dataSource);
    }
    if (params?.digitalAccess && params.digitalAccess !== "all") {
      searchParams.set("digitalAccess", params.digitalAccess);
    }
    if (params?.locationKind && params.locationKind !== "all") {
      searchParams.set("locationKind", params.locationKind);
    }
    if (params?.profession && params.profession !== "all") {
      searchParams.set("profession", params.profession);
    }
    if (params?.handicapTypes?.length) {
      searchParams.set("handicapTypes", params.handicapTypes.join(","));
    }
    if (params?.handicapMinScore !== undefined) {
      searchParams.set("handicapMinScore", params.handicapMinScore.toString());
    }
    
    const query = searchParams.toString();
    return api<Center[]>(`/api/centers${query ? `?${query}` : ""}`);
  },

  facets: (params?: {
    search?: string;
    dataSource?: DashboardDataSource;
    digitalAccess?: DashboardDigitalAccess;
    locationKind?: DashboardLocationKind;
    profession?: string;
    handicapTypes?: HandicapType[];
    handicapMinScore?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.dataSource && params.dataSource !== "all") {
      searchParams.set("dataSource", params.dataSource);
    }
    if (params?.digitalAccess && params.digitalAccess !== "all") {
      searchParams.set("digitalAccess", params.digitalAccess);
    }
    if (params?.locationKind && params.locationKind !== "all") {
      searchParams.set("locationKind", params.locationKind);
    }
    if (params?.profession && params.profession !== "all") {
      searchParams.set("profession", params.profession);
    }
    if (params?.handicapTypes?.length) {
      searchParams.set("handicapTypes", params.handicapTypes.join(","));
    }
    if (params?.handicapMinScore !== undefined) {
      searchParams.set("handicapMinScore", params.handicapMinScore.toString());
    }

    const query = searchParams.toString();
    return api<CenterFilterFacets>(`/api/centers/facets${query ? `?${query}` : ""}`);
  },

  get: (id: string) => api<Center>(`/api/centers/${id}`),

  addReview: (
    id: string,
    data: {
      comment: string;
      rating?: number;
      criteria?: ReviewAccessibilityItem[];
      customItems?: {
        label: string;
        handicapTypes: HandicapType[];
        comment?: string;
      }[];
    },
    token: string
  ) =>
    api<Review>(`/api/centers/${id}/reviews`, { method: "POST", body: data, token }),

  updateReview: (
    id: string,
    reviewId: string,
    data: {
      comment: string;
      rating?: number;
      criteria?: ReviewAccessibilityItem[];
      customItems?: {
        label: string;
        handicapTypes: HandicapType[];
        comment?: string;
      }[];
    },
    token: string
  ) =>
    api<Review>(`/api/centers/${id}/reviews/${reviewId}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteReview: (id: string, reviewId: string, token: string) =>
    api<{ deleted: boolean; id: string }>(`/api/centers/${id}/reviews/${reviewId}`, {
      method: "DELETE",
      token,
    }),
};
