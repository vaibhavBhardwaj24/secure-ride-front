"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import {
  Car,
  Hash,
  Loader2,
  LogOut,
  Phone,
  PlusCircle,
  Sparkles,
  Clock,
  ArrowRight,
  X,
  Calendar,
  User,
} from "lucide-react";

import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export interface VehicleDto {
  _id: string;
  number: number;
  userId: string;
  username: string;
  vehicleNumber: number;
  FullVehicleNumber: string;
  __v: number;
}

export interface VehiclesResponseDto {
  message: string;
  Number: VehicleDto[];
}

export interface CallLog {
  _id: string;
  CallSid: string;
  CallFrom: string;
  CallTo: string;
  Direction: string;
  Created: string;
  DialCallDuration: number;
  StartTime: string;
  EndTime: string;
  CallType: string;
  vehicleNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CallLogsResponse {
  message: string;
  logs: CallLog[];
}

export default function Home() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<VehiclesResponseDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(
    null
  );
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const username = getCookie("username");
  const qrRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.post("https://secure-ride-lime.vercel.app/list", {
        username: username,
      });
      if (res.status === 200) {
        const data = res.data as VehiclesResponseDto;
        console.log("[LIST]", data);
        setData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load vehicles");
      setLoading(false);
    }
  };

  const fetchCallLogs = async (vehicle: VehicleDto) => {
    try {
      setLogsLoading(true);
      // Dummy API call - replace with actual endpoint
      const res = await axios.post("https://secure-ride-lime.vercel.app/logs", {
        vehicleNumber: vehicle.FullVehicleNumber,
      });


      setCallLogs(res.data.logs);
      setLogsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load call logs");
      setLogsLoading(false);
    }
  };

  const handleVehicleClick = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setLogsModalOpen(true);
    fetchCallLogs(vehicle);
  };
const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  const hours12 = hours.toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
};

  const submit = async () => {
    if (!vehicleNumber || !phoneNumber) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        "https://secure-ride-lime.vercel.app/addNumber",
        {
          username: username,
          number: phoneNumber,
          vehicleNumber: vehicleNumber,
        }
      );
      if (res.status === 200) {
        toast.success("Vehicle added successfully");
        fetchData();
        setDialogOpen(false);
        setVehicleNumber("");
        setPhoneNumber("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "vehicle-qr-code.png";
    link.click();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-50 to-yellow-100"
      style={{
        background:
          "linear-gradient(135deg, #e0f2fe 0%, #f5f3ff 50%, #fefce8 100%)",
      }}
    >
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
              <Car className="h-6 w-6 text-sky-600" />
              <span className="text-lg font-semibold text-gray-700">
                Vehicle Management
              </span>
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 via-violet-400 to-yellow-500 bg-clip-text text-transparent mb-4">
              Your Vehicle Collection
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track all your registered vehicles in one place
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-sky-500/10 via-violet-400/10 to-yellow-500/10 p-8 border-b border-sky-200/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Registered Vehicles
                  </h2>
                  <p className="text-gray-600">
                    View and manage your vehicle registrations. Click on a
                    vehicle to see call logs.
                  </p>
                </div>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-violet-400 hover:from-sky-600 hover:to-violet-500 text-white px-6 py-3 rounded-2xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add New Vehicle
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gradient-to-r from-sky-100 to-yellow-100 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-sky-50 to-yellow-50 rounded-2xl border border-sky-200/50">
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <Hash className="h-4 w-4 text-sky-500" />
                      Vehicle Number
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <Phone className="h-4 w-4 text-violet-400" />
                      Phone Number
                    </div>
                  </div>

                  {/* Table Body */}
                  {data?.Number.length ? (
                    data.Number.map((vehicle, index) => (
                      <div
                        key={vehicle._id}
                        onClick={() => handleVehicleClick(vehicle)}
                        className="grid grid-cols-2 gap-4 p-6 bg-white/70 hover:bg-white/90 rounded-2xl border border-gray-200/50 hover:border-emerald-300/50 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer group"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "slideIn 0.5s ease-out forwards",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                            <Car className="h-5 w-5 text-white hidden md:block" />
                          </div>
                          <span className="font-mono text-lg font-semibold text-gray-800">
                            {vehicle.FullVehicleNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
                              <Phone className="h-5 w-5 text-white hidden md:block" />
                            </div>
                            <span className="text-lg text-gray-700">
                              {vehicle.number}
                            </span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 rounded-2xl border-2 border-dashed border-orange-200">
                      <Car className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-500 mb-2">
                        No vehicles registered yet
                      </p>
                      <p className="text-gray-400">
                        Add your first vehicle to get started
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/10 via-red-400/10 to-yellow-500/10 p-6 border-b border-orange-200/30">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                    <Hash className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Quick Access QR Code
                  </h2>
                </div>
                <p className="text-gray-600">
                  Scan to quickly access vehicle management
                </p>
              </div>
            </div>
            <div className="p-8 text-center w-full flex justify-center items-center md:flex-row flex-col gap-4">
              <a href="tel:+918046810416">
                <div className="w-fit cursor-pointer transition-transform duration-200">
                  <QRCodeCanvas
                    value="tel:+918046810416"
                    size={260}
                    bgColor="#ffffff"
                    fgColor="#1f2937"
                    level="H"
                    ref={qrRef}
                  />
                </div>
              </a>

              <div className="mt-6 space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Scan with your mobile device
                </p>
                <p className="text-gray-500">
                  Or share this QR code with others for quick access
                </p>
                <button
                  onClick={downloadQR}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Vehicle Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-400 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Add New Vehicle</h3>
              <p className="text-orange-100">
                Register a new vehicle to your collection
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Vehicle Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:outline-none bg-orange-50/50 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-red-200 rounded-2xl focus:border-red-400 focus:outline-none bg-red-50/50 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-2xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-400 hover:from-orange-600 hover:to-red-500 text-white rounded-2xl font-medium shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Add Vehicle"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Logs Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden transform scale-100 transition-transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Call Logs</h3>
                <p className="text-blue-100">
                  Vehicle: {selectedVehicle?.FullVehicleNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  setLogsModalOpen(false);
                  setSelectedVehicle(null);
                  setCallLogs([]);
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {logsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : callLogs.length > 0 ? (
                <div className="space-y-4">
                  {callLogs.map((log, index) => (
                    <div
                      key={log._id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200 hover:shadow-md"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "slideIn 0.5s ease-out forwards",
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">From</p>
                            <p className="font-semibold text-gray-800">
                              {log.CallFrom}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">To</p>
                            <p className="font-semibold text-gray-800">
                              {log.CallTo}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {formatDate(log.Created)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500 mb-2">
                    No call logs found
                  </p>
                  <p className="text-gray-400">
                    No calls have been made to this vehicle yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function Navbar() {
  const navi = useRouter();
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-orange-200/50 px-6 py-4 sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-400 rounded-2xl flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
            Vehicle Management
          </h1>
        </div>
        <button
          onClick={() => {
            // Handle logout
            deleteCookie("username");
            navi.push("/login");
            console.log("Logout clicked");
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium shadow-md transform hover:scale-105 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
