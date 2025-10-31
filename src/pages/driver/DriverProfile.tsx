/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Car,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Star,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetDriverProfileQuery,
  useUpdateDriverOnlineStatusMutation,
  useUpdateDriverProfileMutation,
} from "@/redux/features/driver/driverApi";

export default function DriverProfile(): JSX.Element {
  const { data, isLoading, isError, error } = useGetDriverProfileQuery(undefined);
  const [toggleOnline, { isLoading: toggling }] =
    useUpdateDriverOnlineStatusMutation();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateDriverProfileMutation();

  // backend shape may be { success..., data: { driver: {...} } } or driver object directly
  const raw = data ?? null;
  const driver = (raw && (raw.data?.driver ?? raw.driver ?? raw)) ?? null;

  // edit state & form
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vehicleInfo: {},
  });

  useEffect(() => {
    if (!driver) return;
    const u = driver.userId ?? {
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
    };
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      vehicleInfo: driver.vehicleInfo ?? driver.vehicle ?? {},
    });
  }, [driver]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium text-gray-700">
        <Loader2 className="animate-spin mr-2" /> Loading driver profile...
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-semibold">
        ❌ {(error as any)?.data?.message ?? "Failed to load profile"}
      </div>
    );

  if (!driver)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        No driver data available.
      </div>
    );

  const u = driver.userId ?? {
    firstName: driver.firstName,
    lastName: driver.lastName,
    email: driver.email,
    phone: driver.phone,
    profilePicture: driver.profileImage,
    fullName: `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim(),
  };
  const v = driver.vehicleInfo ?? driver.vehicle;

  const handleToggleOnline = async () => {
    try {
      await toggleOnline(!Boolean(driver.isOnline)).unwrap();
    } catch {
      // ignore — UI will reflect via RTK cache or show toast elsewhere
    }
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    // revert form to current driver values
    setForm((f: any) => ({
      ...f,
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      vehicleInfo: v ?? {},
    }));
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        // backend may accept nested user fields or top-level fields; send the most common fields
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        vehicleInfo: form.vehicleInfo,
      };
      // include id if backend expects it
      if (driver.id ?? driver._id) payload.id = driver.id ?? driver._id;

      await updateProfile(payload).unwrap();
      // success: RTK Query invalidation refreshes profile; turn off edit mode
      setIsEditing(false);
    } catch (err) {
      // keep editing, show console error — you may integrate toast here
      // console.error('updateProfile failed', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-700 shadow">
            {u?.firstName?.[0] ?? u?.fullName?.[0] ?? "D"}
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    className="px-3 py-2 border rounded w-40"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                  />
                  <input
                    className="px-3 py-2 border rounded w-40"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
                <input
                  className="px-3 py-2 border rounded w-full"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />{" "}
                  <input
                    className="px-2 py-1 border rounded"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {u?.fullName ?? `${u?.firstName ?? ""} ${u?.lastName ?? ""}`}
                </h1>
                <p className="text-sm text-gray-500">{u?.email ?? "—"}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {u?.phone ?? "—"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm text-gray-500">Joined</span>
            <span className="font-medium text-gray-700">
              {driver.joinedAt
                ? new Date(driver.joinedAt).toLocaleDateString()
                : driver.createdAt
                ? new Date(driver.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={driver.approvalStatus === "approved" ? "default" : "secondary"}
              className="capitalize"
            >
              {driver.approvalStatus ?? "pending"}
            </Badge>

            <button
              onClick={handleToggleOnline}
              disabled={toggling}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm hover:shadow-md"
              title="Toggle online"
            >
              {driver.isOnline ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">{driver.isOnline ? "Online" : "Offline"}</span>
            </button>

            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updatingProfile}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />{" "}
                  <span className="text-sm">{updatingProfile ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <XCircle className="w-4 h-4" /> <span className="text-sm">Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                title="Edit profile"
              >
                <Edit2 className="w-4 h-4" /> <span className="text-sm">Edit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2 shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal & Account
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Core account and verification details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full name</p>
              <p className="font-medium text-gray-800">{u?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> {u?.email ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> {u?.phone ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Approval notes</p>
              <p className="font-medium text-gray-800">{driver.approvalNotes ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold text-gray-800">
                  {driver.rating?.average ?? driver.rating ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  {driver.rating?.count ?? 0} reviews
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Earnings</div>
                <div className="text-lg font-medium text-gray-800">
                  ${driver.earnings?.total ?? driver.totalEarnings ?? 0}
                </div>
                <div className="text-xs text-gray-400">This month: ${driver.earnings?.thisMonth ?? 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Total rides</div>
              <div className="font-medium text-gray-800">{driver.totalRides ?? 0}</div>
              <div className="text-sm text-gray-500">Active</div>
              <div className="font-medium text-gray-800">{driver.isOnline ? "Yes" : "No"}</div>
              <div className="text-sm text-gray-500">Joined</div>
              <div className="font-medium text-gray-800">
                {driver.joinedAt ? new Date(driver.joinedAt).toLocaleDateString() : "—"}
              </div>
              <div className="text-sm text-gray-500">Verified</div>
              <div className="font-medium text-gray-800 capitalize">{driver.approvalStatus ?? "—"}</div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="shadow border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-4 h-4 text-green-600" /> Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-500">Make / Model</div>
            <div className="font-medium text-gray-800">{v?.make ?? "—"} {v?.model ? ` / ${v.model}` : ""}</div>

            <div className="text-sm text-gray-500">Year</div>
            <div className="font-medium text-gray-800">{v?.year ?? "—"}</div>

            <div className="text-sm text-gray-500">Color</div>
            <div className="font-medium text-gray-800">{v?.color ?? "—"}</div>

            <div className="text-sm text-gray-500">Plate</div>
            <div className="font-medium text-gray-800">{v?.plateNumber ?? v?.licensePlate ?? "—"}</div>
          </CardContent>
        </Card>

        <Card className="shadow border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" /> Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">Type</div>
            <div className="font-medium text-gray-800">{driver.currentLocation?.type ?? "Point"}</div>

            <div className="text-sm text-gray-500 mt-2">Coordinates</div>
            <div className="font-medium text-gray-800">
              {driver.currentLocation?.coordinates
                ? driver.currentLocation.coordinates.join(", ")
                : driver.currentLocation?.latitude
                ? `${driver.currentLocation.latitude}, ${driver.currentLocation.longitude}`
                : "—"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                {driver.documents?.license || driver.documentsUploaded?.license ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">License</span>
              </li>
              <li className="flex items-center gap-2">
                {driver.documents?.vehicleRegistration || driver.documentsUploaded?.vehicleRegistration ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">Registration</span>
              </li>
              <li className="flex items-center gap-2">
                {driver.documents?.insurance || driver.documentsUploaded?.insurance ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">Insurance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
