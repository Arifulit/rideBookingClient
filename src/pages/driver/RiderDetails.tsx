import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetAllRidersQuery } from '@/redux/features/driver/driverApi';

const RiderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: riders, isLoading, isError, refetch } = useGetAllRidersQuery();

  const rider = React.useMemo(() => {
    if (!riders || !id) return undefined;
    const findById = (r: Record<string, unknown> | undefined) => {
      if (!r) return false;
      const candidates = [r['id'], r['_id'], r['riderId'], r['userId'], r['uid']];
      return candidates.some((c) => c && String(c) === String(id));
    };
    return riders.find((r) => findById(r as unknown as Record<string, unknown>));
  }, [riders, id]);

  if (isLoading) return <Card><CardHeader><CardTitle>Loading rider…</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (isError) return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Failed to load rider. <Button variant="ghost" onClick={() => refetch()}>Retry</Button></p>
      </CardContent>
    </Card>
  );

  if (!rider) return (
    <Card>
      <CardHeader>
        <CardTitle>Rider not found</CardTitle>
      </CardHeader>
      <CardContent>
        <p>No rider matched the requested id.</p>
        <div className="mt-3">
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Rider details</h2>
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {rider.profileImage ? <AvatarImage src={rider.profileImage} /> : <AvatarFallback>{(rider.firstName || rider.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>}
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{`${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.email || 'Unnamed'}</div>
            <div className="text-sm text-gray-500">Joined: {rider.createdAt ? new Date(rider.createdAt).toLocaleString() : '—'}</div>
          </div>
        </CardHeader>
        <CardContent className="mt-4 space-y-3">
          <div><strong>Email:</strong> {rider.email || '—'}</div>
          <div><strong>Phone:</strong> {rider.phone || '—'}</div>
          <div><strong>Rating:</strong> {typeof rider.rating === 'number' ? rider.rating.toFixed(1) : '—'}</div>
          <div><strong>ID:</strong> <code>{rider.id}</code></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiderDetails;
