import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetAllRidersQuery } from "@/redux/features/driver/driverApi";
import { Mail, Phone, Search, RefreshCw, Star } from "lucide-react";
import { motion } from "framer-motion";

const RidersList = () => {
  const { data: riders, isLoading, isError, refetch } = useGetAllRidersQuery();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const normalized = Array.isArray(riders) ? riders : [];

  const filtered = normalized.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.phone || "").toLowerCase().includes(q)
    );
  });

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Riders Management
          </h1>
          <p className="text-gray-500 text-sm">
            View, search, and manage registered riders.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-72">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search riders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-white/80 shadow-sm border border-gray-200 focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-5 bg-white/70 rounded-2xl">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-red-600">Failed to Load Riders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Something went wrong. Please try refreshing.
            </p>
            <Button
              variant="destructive"
              onClick={() => refetch()}
              className="mt-3"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && !isError && (
        <>
          <div className="text-sm text-gray-600">
            Showing{" "}
            <strong className="text-gray-800">{filtered.length}</strong> of{" "}
            <strong className="text-gray-800">{normalized.length}</strong> riders
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.length === 0 && (
              <Card className="p-6 bg-white/80 rounded-2xl shadow-sm">
                <CardTitle>No Riders Found</CardTitle>
                <p className="text-gray-600 text-sm mt-2">
                  Try adjusting your search or refresh the list.
                </p>
              </Card>
            )}

            {filtered.map((r) => (
              <motion.div
                key={r.id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex items-center justify-between pb-0">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 shadow-sm ring-2 ring-indigo-100">
                        {r.profileImage ? (
                          <AvatarImage src={r.profileImage} />
                        ) : (
                          <AvatarFallback>
                            {(r.firstName || r.email || "U")
                              .toString()
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-gray-800">
                          {`${r.firstName || ""} ${r.lastName || ""}`.trim() ||
                            r.email ||
                            "Unnamed"}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Joined {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {r.rating ? r.rating.toFixed(1) : "—"}
                    </Badge>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{r.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{r.email || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {/* <span className="text-xs text-gray-500">
                        ID: <span className="font-mono">{r.id}</span>
                      </span> */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          Message
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => navigate(`/driver/riders/${r.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default RidersList;
