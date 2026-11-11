/**
 * api.ts
 * Centralized API Service Layer for EduMaster Tuition Management Portal
 * Supports both same-origin / relative /api calls and external VITE_API_URL endpoints.
 */

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '') + '/api';

/**
 * Retrieve active JWT token from storage
 */
export function getAuthToken(): string | null {
  try {
    const directToken = localStorage.getItem('tm_auth_token');
    if (directToken) return directToken;
    const rawUser = localStorage.getItem('tm_auth_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return parsed.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Common request wrapper
 */
async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || (typeof data === 'string' ? data : 'API Request Failed');
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (err: any) {
    // Re-throw with consistent structure
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth Endpoints
  auth: {
    teacherLogin: (credentials: { teacherEmailOrPhone: string; teacherPassword: string }) =>
      request('/auth/teacher/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: credentials.teacherEmailOrPhone,
          email: credentials.teacherEmailOrPhone,
          password: credentials.teacherPassword,
          teacherEmailOrPhone: credentials.teacherEmailOrPhone,
          teacherPassword: credentials.teacherPassword
        })
      }),

    teacherRegister: (data: {
      tuitionName: string;
      teacherName: string;
      email: string;
      phone: string;
      password: string;
      pin?: string;
    }) =>
      request('/auth/teacher/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    studentRegister: (data: {
      name: string;
      phone: string;
      email: string;
      password: string;
      confirmPassword?: string;
    }) =>
      request('/auth/register-student', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    login: (credentials: { identifier: string; password?: string; role?: string; otp?: string }) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    verifyBatchCode: (joinCode: string) =>
      request('/auth/verify-batch-code', {
        method: 'POST',
        body: JSON.stringify({ batchCode: joinCode, joinCode })
      }),

    joinBatch: (data: { joinCode: string; studentId: string; rollNo?: string }) =>
      request('/auth/join-batch', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    regenerateBatchCode: (batchId: string) =>
      request('/auth/regenerate-batch-code', {
        method: 'POST',
        body: JSON.stringify({ batchId })
      }),

    regenerateTeacherJoinCode: (teacherId: string) =>
      request('/auth/regenerate-teacher-join-code', {
        method: 'POST',
        body: JSON.stringify({ teacherId })
      }),

    forgotPassword: (identifier: string) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }),

    verifyOtp: (identifier: string, otp: string) =>
      request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp })
      })
  },

  // Payment Endpoints
  payment: {
    getTeacherUpi: (teacherId?: string) =>
      request(teacherId ? `/payment/upi-id/${teacherId}` : '/payment/upi-id'),

    updateTeacherUpi: (upiId: string) =>
      request('/payment/upi-id', {
        method: 'PUT',
        body: JSON.stringify({ upiId })
      })
  },

  // Student & Batches Endpoints
  student: {
    getReceipt: (batchId: string) => request(`/student/receipt/${batchId}`),
    createBatch: (batchData: { id?: string; name: string; subject?: string; monthlyFee?: number; schedule?: string; teacherId?: string; tuitionId?: string; joinCode?: string }) =>
      request('/student/batch', {
        method: 'POST',
        body: JSON.stringify(batchData)
      }),
    getBatches: (teacherId?: string) =>
      request(teacherId ? `/student/batches/${teacherId}` : '/student/batches'),
    recordPayment: (paymentData: { studentId: string; batchId: string; amount: number; studentName?: string; batchName?: string; paymentMethod?: string }) =>
      request('/student/payment', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      })
  },

  // Export Endpoints
  export: {
    getExportUrl: (category: string, format: string, targetTuitionId?: string) => {
      const params = new URLSearchParams({ category, format });
      if (targetTuitionId) params.append('targetTuitionId', targetTuitionId);
      return `${API_BASE_URL}/export?${params.toString()}`;
    },
    getAuditLogs: () => request('/export/audit-logs')
  }
};

export default api;
