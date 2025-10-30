/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  CreditCard,
  Star,
  MessageSquare,
  Calendar,
  Loader2,
  Hash,
} from 'lucide-react';
import { useGetRideDetailsQuery } from '@/redux/features/rider/riderApi';

// Helper functions
const formatDate = (iso?: string | null): string => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const formatShortDate = (iso?: string | null): string => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const safeString = (v: unknown, fallback = 'N/A'): string => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v || fallback;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return fallback;
  }
};

const safeNumber = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && !isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }
  return null;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accepted: 'bg-blue-100 text-blue-800 border-blue-300',
    picked_up: 'bg-purple-100 text-purple-800 border-purple-300',
    ongoing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    in_transit: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    requested: 'Requested',
    accepted: 'Accepted',
    picked_up: 'Picked Up',
    ongoing: 'In Progress',
    in_transit: 'In Transit',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[(status || '').toLowerCase()] || (status || 'N/A');
};

export default function RideDetails() {
  const params = useParams<{ rideId?: string; id?: string }>();
  const rideId = params.rideId ?? params.id;
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, isError, error, refetch } = useGetRideDetailsQuery(
    rideId ?? '',
    { skip: !rideId }
  );

  // Normalize possible API response shapes into a ride object
  const ride: any = React.useMemo(() => {
    if (!apiResponse) return null;
    const resp: any = apiResponse;
    const body = resp?.data ?? resp;

    if (!body) return null;
    if (body.ride) return body.ride;
    if (body._id || body.id) return body;
    if (body.data && (body.data._id || body.data.id)) return body.data;

    // Look inside body.data for possible nested ride object
    if (body.data && typeof body.data === 'object') {
      for (const k of Object.keys(body.data)) {
        const candidate = body.data[k];
        if (candidate && (candidate._id || candidate.id || candidate.pickupLocation)) return candidate;
      }
    }

    // As a last resort, try to find a nested object that looks like a ride
    if (typeof body === 'object') {
      for (const k of Object.keys(body)) {
        const v = body[k];
        if (v && typeof v === 'object' && (v._id || v.id || v.pickupLocation || v.destination)) return v;
      }
    }

    return null;
  }, [apiResponse]);

  // Debug logs
  React.useEffect(() => {
    try {
      console.groupCollapsed('RideDetails debug');
      console.log('route rideId:', rideId);
      console.log('raw apiResponse type:', apiResponse && typeof apiResponse);
      if (apiResponse && typeof apiResponse === 'object') {
        try { console.log('apiResponse keys:', Object.keys(apiResponse)); } catch {}
      }
      console.log('apiResponse:', apiResponse);
      console.log('normalized ride:', ride);
      if (isError) console.log('hook error:', error);
      console.groupEnd();
    } catch (e) {
      console.error('RideDetails debug error', e);
    }
  }, [apiResponse, ride, isError, error, rideId]);

  if (!rideId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              No Ride Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please provide a valid ride ID to view details.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600 font-medium">Loading ride details...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !ride) {
    const errMsg = (error && (error as any).data?.message) || (error && (error as any).message) || 'No ride found';
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle>Failed to Load Ride Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Unable to fetch ride details: {safeString(errMsg)}</p>
            <div className="flex gap-3">
              <Button onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data safely
  const pickup = ride.pickupLocation ?? ride.pickup ?? {};
  const destination = ride.destination ?? ride.dropoff ?? {};
  const fare = ride.fare ?? {};
  const distance = ride.distance ?? {};
  const duration = ride.duration ?? {};
  const timeline = ride.timeline ?? {};
  const rating = ride.rating ?? {};
  const feedback = ride.feedback ?? {};
  const riderInfo = ride.riderId ?? ride.rider ?? {};
  const driverInfo = ride.driverId ?? ride.driver ?? {};

  // Format values
  const rideIdDisplay = safeString(ride._id ?? ride.id ?? rideId);
  const statusDisplay = safeString(ride.status ?? 'N/A').toLowerCase();
  const rideTypeDisplay = safeString(ride.rideType ?? 'N/A');
  const paymentMethodDisplay = safeString(ride.paymentMethod ?? 'N/A');
  const paymentStatusDisplay = safeString(ride.paymentStatus ?? 'N/A').toLowerCase();

  // Locations & coords
  const pickupAddress = safeString(pickup.address ?? pickup.name ?? pickup.label ?? null);
  const pickupCoords = Array.isArray(pickup?.coordinates?.coordinates) ? pickup.coordinates.coordinates : null;
  const pickupLat = pickupCoords ? safeNumber(pickupCoords[1]) : null;
  const pickupLng = pickupCoords ? safeNumber(pickupCoords[0]) : null;

  const destAddress = safeString(destination.address ?? destination.name ?? destination.label ?? null);
  const destCoords = Array.isArray(destination?.coordinates?.coordinates) ? destination.coordinates.coordinates : null;
  const destLat = destCoords ? safeNumber(destCoords[1]) : null;
  const destLng = destCoords ? safeNumber(destCoords[0]) : null;

  // Metrics
  const fareValue = safeNumber(fare.actual ?? fare.estimated);
  const fareDisplay = fareValue !== null ? `৳${fareValue.toFixed(2)}` : 'N/A';
  const fareLabel = fare.actual ? 'Actual Fare' : 'Estimated Fare';

  const distanceValue = safeNumber(distance.actual ?? distance.estimated);
  const distanceDisplay = distanceValue !== null ? `${distanceValue.toFixed(2)} km` : 'N/A';

  const durationValue = safeNumber(duration.actual ?? duration.estimated);
  const durationDisplay = durationValue !== null ? `${Math.round(durationValue)} min` : 'N/A';

  // User info
  const riderName =
    safeString(riderInfo.fullName, '') ||
    `${safeString(riderInfo.firstName, '')} ${safeString(riderInfo.lastName, '')}`.trim() ||
    'N/A';
  const riderEmail = safeString(riderInfo.email);
  const riderPhone = safeString(riderInfo.phone);

  const driverName =
    safeString(driverInfo.fullName, '') ||
    `${safeString(driverInfo.firstName, '')} ${safeString(driverInfo.lastName, '')}`.trim() ||
    'N/A';
  const driverEmail = safeString(driverInfo.email);
  const driverPhone = safeString(driverInfo.phone);

  // Ratings & feedback
  const riderRating = safeNumber(rating.riderRating);
  const driverRating = safeNumber(rating.driverRating);
  const riderComment = safeString(feedback.riderComment, '');
  const driverComment = safeString(feedback.driverComment, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ride Details
            </h1>
            <p className="text-gray-500 mt-1 text-sm">ID: {rideIdDisplay}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getStatusColor(statusDisplay)} border px-4 py-2 text-sm font-semibold`}>
                  {getStatusLabel(statusDisplay)}
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-semibold capitalize">
                  {rideTypeDisplay}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-medium">Requested: </span>
                  {formatShortDate(timeline.requested ?? ride.createdAt)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route */}
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  Trip Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Pickup Location</div>
                    <div className="font-semibold text-gray-900 text-base">{pickupAddress}</div>
                    {pickupLat !== null && pickupLng !== null && (
                      <div className="text-xs text-gray-500 mt-2 font-mono">📍 {pickupLat.toFixed(6)}, {pickupLng.toFixed(6)}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-r-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Destination</div>
                    <div className="font-semibold text-gray-900 text-base">{destAddress}</div>
                    {destLat !== null && destLng !== null && (
                      <div className="text-xs text-gray-500 mt-2 font-mono">📍 {destLat.toFixed(6)}, {destLng.toFixed(6)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Metrics */}
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Trip Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-xs text-gray-600 uppercase font-semibold mb-1">{fareLabel}</div>
                    <div className="text-3xl font-bold text-gray-900">{fareDisplay}</div>
                  </div>

                  <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm">
                    <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Navigation className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Distance</div>
                    <div className="text-3xl font-bold text-gray-900">{distanceDisplay}</div>
                  </div>

                  <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Duration</div>
                    <div className="text-3xl font-bold text-gray-900">{durationDisplay}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Ride Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.requested && <TimelineItem color="yellow" label="Requested" time={formatDate(timeline.requested)} />}
                  {timeline.accepted && <TimelineItem color="blue" label="Accepted" time={formatDate(timeline.accepted)} />}
                  {timeline.pickedUp && <TimelineItem color="purple" label="Picked Up" time={formatDate(timeline.pickedUp)} />}
                  {timeline.inTransit && <TimelineItem color="indigo" label="In Transit" time={formatDate(timeline.inTransit)} />}
                  {timeline.completed && <TimelineItem color="green" label="Completed" time={formatDate(timeline.completed)} />}
                  {timeline.cancelled && <TimelineItem color="red" label="Cancelled" time={formatDate(timeline.cancelled)} />}
                </div>
              </CardContent>
            </Card>

            {/* Ratings & Feedback */}
            {(riderRating !== null || driverRating !== null || riderComment || driverComment) && (
              <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Ratings & Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {riderRating !== null && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Rider Rating</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < (riderRating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-2 text-lg font-bold text-gray-900">{(riderRating ?? 0)}/5</span>
                        </div>
                      </div>
                      {riderComment && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700 italic">"{riderComment}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {driverRating !== null && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Driver Rating</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < (driverRating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-2 text-lg font-bold text-gray-900">{(driverRating ?? 0)}/5</span>
                        </div>
                      </div>
                      {driverComment && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700 italic">"{driverComment}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Rider Info */}
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Rider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Name</div>
                  <div className="font-semibold text-gray-900 text-lg">{riderName}</div>
                </div>
                {riderEmail !== 'N/A' && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Email</div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="break-all">{riderEmail}</span>
                    </div>
                  </div>
                )}
                {riderPhone !== 'N/A' && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Phone</div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {riderPhone}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Info */}
            {driverName !== 'N/A' && (
              <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Name</div>
                    <div className="font-semibold text-gray-900 text-lg">{driverName}</div>
                  </div>
                  {driverEmail !== 'N/A' && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Email</div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="break-all">{driverEmail}</span>
                      </div>
                    </div>
                  )}
                  {driverPhone !== 'N/A' && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Phone</div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {driverPhone}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Payment Method</div>
                  <div className="font-semibold text-gray-900 text-base capitalize">{paymentMethodDisplay}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Payment Status</div>
                  <Badge className={`${paymentStatusDisplay === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'} border px-3 py-1 capitalize`}>
                    {paymentStatusDisplay}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ color, label, time }: { color: string; label: string; time: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`w-4 h-4 ${colorClasses[color]} rounded-full mt-1 flex-shrink-0 shadow-md`}></div>
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{label}</div>
        <div className="text-sm text-gray-500 mt-0.5">{time}</div>
      </div>
    </div>
  );
}