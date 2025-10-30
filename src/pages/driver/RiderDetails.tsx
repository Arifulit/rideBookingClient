/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetAllRidersQuery } from "@/redux/features/driver/driverApi";
import { Mail, Phone, Star, Calendar, MapPin, RefreshCw } from "lucide-react";

const RiderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: riders, isLoading, isError, refetch } = useGetAllRidersQuery();

  const rider = React.useMemo(() => {
    if (!riders || !id) return undefined;
    const findById = (r: Record<string, unknown> | undefined) => {
      if (!r) return false;
      const candidates = [r["id"], r["_id"], r["riderId"], r["userId"], r["uid"]];
      return candidates.some((c) => c && String(c) === String(id));
    };
    return riders.find((r) => findById(r as unknown as Record<string, unknown>));
  }, [riders, id]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 animate-pulse text-lg">Loading rider details…</p>
      </div>
    );

  if (isError)
    return (
      <Card className="max-w-lg mx-auto mt-10 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Failed to load rider</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-3">Please check your network or try again later.</p>
          <Button onClick={() => refetch()} variant="outline" className="text-red-600 border-red-300">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );

  if (!rider)
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle>Rider Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No rider matches this ID.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Back
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Rider Profile</h2>
          <Button variant="outline" onClick={() => navigate(-1)} className="hover:bg-blue-50">
            Back
          </Button>
        </div>

        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-5 text-white">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              {rider.profileImage ? (
                <AvatarImage src={rider.profileImage} />
              ) : (
                <AvatarFallback className="text-xl">
                  {(rider.firstName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">
                {`${rider.firstName || ""} ${rider.lastName || ""}`.trim() ||
                  rider.email ||
                  "Unnamed Rider"}
              </h3>
              <p className="text-sm text-blue-100">
                Joined on{" "}
                {rider.createdAt
                  ? new Date(rider.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          <CardContent className="p-6 space-y-6 bg-white">
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">
                Contact Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />{" "}
                  <span>{rider.email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />{" "}
                  <span>{rider.phone || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Rating and Activity */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">
                Performance
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>
                  Rating:{" "}
                  {typeof rider.rating === "number"
                    ? rider.rating.toFixed(1)
                    : "No rating yet"}
                </span>
              </div>
              {(rider as any).totalRides && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <MapPin className="h-4 w-4 text-purple-500" />{" "}
                  <span>Total Rides: {(rider as any).totalRides}</span>
                </div>
              )}
              {rider.completedRides && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Calendar className="h-4 w-4 text-pink-500" />{" "}
                  <span>Completed Rides: {rider.completedRides}</span>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            {(rider.vehicleModel || rider.vehicleNumber) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">
                  Vehicle Details
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  {rider.vehicleModel && (
                    <div>
                      <strong>Model:</strong> {rider.vehicleModel}
                    </div>
                  )}
                  {rider.vehicleNumber && (
                    <div>
                      <strong>Number:</strong> {rider.vehicleNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            {rider.address && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">
                  Address
                </h4>
                <p className="text-sm text-gray-600">{rider.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiderDetails;
