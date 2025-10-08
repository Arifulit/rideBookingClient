// Admin component exports
export { SearchAndFilter } from './SearchAndFilter';
export type { SearchAndFilterProps, FilterOption } from './SearchAndFilter';

export { DataTable } from './DataTable';
export type { 
  DataTableProps, 
  Column, 
  ActionItem, 
  Pagination 
} from './DataTable';

// Common filter configurations for admin pages
export const userFilters = [
  {
    key: 'role',
    label: 'Role',
    type: 'select' as const,
    options: [
      { value: 'rider', label: 'Rider' },
      { value: 'driver', label: 'Driver' },
      { value: 'admin', label: 'Admin' }
    ],
    placeholder: 'Filter by role'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending Approval' }
    ],
    placeholder: 'Filter by status'
  },
  {
    key: 'dateRange',
    label: 'Registration Date',
    type: 'dateRange' as const,
    placeholder: 'Select date range'
  },
  {
    key: 'verified',
    label: 'Verified',
    type: 'boolean' as const
  }
];

export const rideFilters = [
  {
    key: 'status',
    label: 'Ride Status',
    type: 'select' as const,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    placeholder: 'Filter by status'
  },
  {
    key: 'paymentStatus',
    label: 'Payment Status',
    type: 'select' as const,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' }
    ],
    placeholder: 'Payment status'
  },
  {
    key: 'dateRange',
    label: 'Ride Date',
    type: 'dateRange' as const,
    placeholder: 'Select date range'
  },
  {
    key: 'hasIssues',
    label: 'Has Issues',
    type: 'boolean' as const
  }
];

// Common action configurations
export const userActions = [
  {
    key: 'view',
    label: 'View Details',
    icon: undefined, // Will use default Eye icon
    variant: 'default' as const,
    onClick: () => {} // To be overridden
  },
  {
    key: 'edit',
    label: 'Edit User',
    variant: 'default' as const,
    onClick: () => {}
  },
  {
    key: 'suspend',
    label: 'Suspend',
    variant: 'destructive' as const,
    show: (user: { status: string }) => user.status === 'active',
    onClick: () => {}
  },
  {
    key: 'activate',
    label: 'Activate',
    variant: 'default' as const,
    show: (user: { status: string }) => user.status === 'suspended',
    onClick: () => {}
  }
];

export const rideActions = [
  {
    key: 'view',
    label: 'View Details',
    variant: 'default' as const,
    onClick: () => {}
  },
  {
    key: 'cancel',
    label: 'Cancel Ride',
    variant: 'destructive' as const,
    show: (ride: { status: string }) => ['pending', 'accepted'].includes(ride.status),
    onClick: () => {}
  },
  {
    key: 'refund',
    label: 'Process Refund',
    variant: 'default' as const,
    show: (ride: { paymentStatus: string }) => ride.paymentStatus === 'completed',
    onClick: () => {}
  }
];