/**
 * Status Constants untuk mapping ID status ke nama status
 * ID ini harus sinkron dengan database backend (tabel status_pesanan)
 */

export const STATUS = {
  DRAFT: 1,
  MENUNGGU_PEMBAYARAN: 2,
  DIPROSES: 3,
  DIKEMAS: 4,
  DIKIRIM: 5,
  SELESAI: 6,
  DIBATALKAN: 7,
} as const;

export type StatusId = typeof STATUS[keyof typeof STATUS];

/**
 * Get status name from ID
 */
export const getStatusName = (id?: number | null): string => {
  switch (id) {
    case STATUS.DRAFT:
      return 'Draft';
    case STATUS.MENUNGGU_PEMBAYARAN:
      return 'Menunggu Pembayaran';
    case STATUS.DIPROSES:
      return 'Diproses';
    case STATUS.DIKEMAS:
      return 'Dikemas';
    case STATUS.DIKIRIM:
      return 'Dikirim';
    case STATUS.SELESAI:
      return 'Selesai';
    case STATUS.DIBATALKAN:
      return 'Dibatalkan';
    default:
      return 'Unknown';
  }
};

/**
 * Get status display name (shorter version for UI)
 */
export const getStatusDisplayName = (id?: number | null): string => {
  switch (id) {
    case STATUS.DRAFT:
      return 'Draft';
    case STATUS.MENUNGGU_PEMBAYARAN:
      return 'Menunggu';
    case STATUS.DIPROSES:
      return 'Diproses';
    case STATUS.DIKEMAS:
      return 'Dikemas';
    case STATUS.DIKIRIM:
      return 'Dikirim';
    case STATUS.SELESAI:
      return 'Selesai';
    case STATUS.DIBATALKAN:
      return 'Dibatalkan';
    default:
      return 'Unknown';
  }
};

/**
 * Tipe Pesanan Constants
 */
export const TIPE_PESANAN = {
  ONLINE: 1,
  OFFLINE: 2,
} as const;

export type TipePesananId = typeof TIPE_PESANAN[keyof typeof TIPE_PESANAN];

export const getTipePesananName = (id?: number | null): string => {
  switch (id) {
    case TIPE_PESANAN.ONLINE:
      return 'Online';
    case TIPE_PESANAN.OFFLINE:
      return 'Offline';
    default:
      return 'Unknown';
  }
};

/**
 * Check if status is online (requires kurir action)
 */
export const isOnlineStatus = (id?: number | null): boolean => {
  return id === STATUS.DIPROSES || id === STATUS.DIKEMAS || id === STATUS.DIKIRIM;
};

/**
 * Check if status is completed
 */
export const isCompleted = (id?: number | null): boolean => {
  return id === STATUS.SELESAI;
};

/**
 * Check if status is cancelled
 */
export const isCancelled = (id?: number | null): boolean => {
  return id === STATUS.DIBATALKAN;
};

/**
 * Check if status is pending payment
 */
export const isPendingPayment = (id?: number | null): boolean => {
  return id === STATUS.MENUNGGU_PEMBAYARAN;
};

/**
 * Get status color for UI (Tailwind classes)
 */
export const getStatusColor = (id?: number | null): string => {
  switch (id) {
    case STATUS.DRAFT:
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case STATUS.MENUNGGU_PEMBAYARAN:
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case STATUS.DIPROSES:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case STATUS.DIKEMAS:
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case STATUS.DIKIRIM:
      return 'bg-teal-100 text-teal-700 border-teal-300';
    case STATUS.SELESAI:
      return 'bg-green-100 text-green-700 border-green-300';
    case STATUS.DIBATALKAN:
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

/**
 * Get status icon for UI (emoji or icon name)
 */
export const getStatusIcon = (id?: number | null): string => {
  switch (id) {
    case STATUS.DRAFT:
      return '📝';
    case STATUS.MENUNGGU_PEMBAYARAN:
      return '⏳';
    case STATUS.DIPROSES:
      return '⚙️';
    case STATUS.DIKEMAS:
      return '📦';
    case STATUS.DIKIRIM:
      return '🚚';
    case STATUS.SELESAI:
      return '✅';
    case STATUS.DIBATALKAN:
      return '❌';
    default:
      return '❓';
  }
};

/**
 * Get all status options (for dropdown/filter)
 */
export const getAllStatuses = () => {
  return [
    { id: STATUS.DRAFT, name: 'Draft' },
    { id: STATUS.MENUNGGU_PEMBAYARAN, name: 'Menunggu Pembayaran' },
    { id: STATUS.DIPROSES, name: 'Diproses' },
    { id: STATUS.DIKEMAS, name: 'Dikemas' },
    { id: STATUS.DIKIRIM, name: 'Dikirim' },
    { id: STATUS.SELESAI, name: 'Selesai' },
    { id: STATUS.DIBATALKAN, name: 'Dibatalkan' },
  ];
};

/**
 * Get status badge class from status name (for admin dashboard which returns string)
 */
export const getBadgeClassFromName = (name?: string | null): string => {
  switch (name) {
    case 'Draft':
      return 'bg-gray-50 text-gray-600';
    case 'Menunggu Pembayaran':
      return 'bg-orange-50 text-orange-600';
    case 'Diproses':
      return 'bg-blue-50 text-blue-600';
    case 'Dikemas':
      return 'bg-purple-50 text-purple-600';
    case 'Dikirim':
      return 'bg-teal-50 text-teal-600';
    case 'Selesai':
      return 'bg-green-50 text-green-600';
    case 'Dibatalkan':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

/**
 * Get dot color class from status name
 */
export const getDotColorFromName = (name?: string | null): string => {
  switch (name) {
    case 'Draft':
      return 'bg-gray-600';
    case 'Menunggu Pembayaran':
      return 'bg-orange-600';
    case 'Diproses':
      return 'bg-blue-600';
    case 'Dikemas':
      return 'bg-purple-600';
    case 'Dikirim':
      return 'bg-teal-600';
    case 'Selesai':
      return 'bg-green-600';
    case 'Dibatalkan':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
};

/**
 * Get status badge class for TransactionTable
 */
export const getStatusBadgeClass = (id?: number | null): string => {
  switch (id) {
    case STATUS.DRAFT:
      return 'bg-gray-50 text-gray-600';
    case STATUS.MENUNGGU_PEMBAYARAN:
      return 'bg-orange-50 text-orange-600';
    case STATUS.DIPROSES:
      return 'bg-blue-50 text-blue-600';
    case STATUS.DIKEMAS:
      return 'bg-purple-50 text-purple-600';
    case STATUS.DIKIRIM:
      return 'bg-teal-50 text-teal-600';
    case STATUS.SELESAI:
      return 'bg-green-50 text-green-600';
    case STATUS.DIBATALKAN:
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};
