import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetAllRidersQuery } from '@/redux/features/driver/driverApi';
import { Mail, Phone, Search, RefreshCw } from 'lucide-react';

const RidersList = () => {
  const { data: riders, isLoading, isError, refetch } = useGetAllRidersQuery();
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (riders) console.log('Fetched riders:', riders);
  }, [riders]);

  const normalized = Array.isArray(riders) ? riders : [];
  const filtered = normalized.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Riders</h1>
          <p className="text-sm text-gray-500">View and manage riders registered on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, email or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-[220px]"
            />
            <Button variant="ghost" onClick={() => setQuery('')}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <CardTitle>Loading…</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardHeader>
            <CardTitle>Error loading riders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">Failed to fetch riders. Try refreshing.</p>
              <Button variant="ghost" onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing <strong>{filtered.length}</strong> of <strong>{normalized.length}</strong> riders</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No riders found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Try adjusting your search or refresh the list.</p>
                </CardContent>
              </Card>
            )}

            {filtered.map((r) => (
              <Card key={r.id}>
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {r.profileImage ? (
                        <AvatarImage src={r.profileImage} />
                      ) : (
                        <AvatarFallback>{(r.firstName || r.email || 'U').toString().charAt(0).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-semibold">{`${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email || 'Unnamed'}</div>
                      <div className="text-sm text-gray-500">Joined {formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700">{r.rating ? r.rating.toFixed(1) : '—'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{r.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{r.email || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-500">ID: <span className="font-mono text-xs">{r.id}</span></div>
                      <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">Message</Button>
                      <Button size="sm" onClick={() => navigate(`/driver/riders/${r.id}`)}>View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RidersList;
