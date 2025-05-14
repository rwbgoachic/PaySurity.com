import { ProtectedRoute as PaysurityProtectedRoute } from '@paysurity/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return <PaysurityProtectedRoute {...props} />;
}