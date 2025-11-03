
import React from 'react';
// Safe imports that use fallbacks for commonly blocked icons
export { 
  SafeFingerprintIcon as Fingerprint,
  SafeShieldIcon as Shield, 
  SafeLockIcon as Lock,
  SafeUserIcon as User 
} from '../components/icons/SafeIcon';

// Re-export other commonly used icons from lucide-react with error handling
import SafeIcon from '../components/icons/SafeIcon';

// Create safe versions of commonly used icons
export const Car: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Car", ...props });

export const MapPin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "MapPin", ...props });

export const Clock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Clock", ...props });

export const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Star", ...props });

export const CreditCard: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "CreditCard", ...props });

export const Phone: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Phone", ...props });

export const Mail: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Mail", ...props });

export const Search: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Search", ...props });

export const Menu: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Menu", ...props });

export const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "X", ...props });

export const ChevronDown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "ChevronDown", ...props });

export const ChevronUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "ChevronUp", ...props });

export const ArrowRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "ArrowRight", ...props });

export const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "ArrowLeft", ...props });

export const Eye: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Eye", ...props });

export const EyeOff: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "EyeOff", ...props });

export const Loader: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Loader", ...props });

export const CheckCircle2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "CheckCircle2", ...props });

export const XCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "XCircle", ...props });

export const RefreshCw: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "RefreshCw", ...props });

export const DollarSign: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "DollarSign", ...props });

export const Users: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Users", ...props });

export const Award: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Award", ...props });

export const Heart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Heart", ...props });

export const Zap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Zap", ...props });

export const Filter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Filter", ...props });

export const MoreHorizontal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "MoreHorizontal", ...props });

export const Calendar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Calendar", ...props });

export const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Send", ...props });

export const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => 
  React.createElement(SafeIcon, { name: "Plus", ...props });

// Export the SafeIcon component for custom usage
export default SafeIcon;