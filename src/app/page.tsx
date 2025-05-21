"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";

const getCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

export interface VehicleDto {
  _id: string;
  number: number;
  userId: string;
  username: string;
  vehicleNumber: number;
  __v: number;
}

export interface VehiclesResponseDto {
  message: string;
  Number: VehicleDto[];
}

export default function Home() {
  const [vehicleNumber, setVehicleNumber] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<VehiclesResponseDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const username = getCookie("username");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.post("https://secure-ride-lime.vercel.app/list", {
        username: username,
      });
      if (res.status === 200) {
        const data = res.data as VehiclesResponseDto;
        setData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load vehicles");
      setLoading(false);
    }
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
        setVehicleNumber(null);
        setPhoneNumber(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Vehicles</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new Vehicle</DialogTitle>
                  <DialogDescription className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">
                        Last 4 digits of Vehicle Number
                      </Label>
                      <Input
                        id="vehicleNumber"
                        type="number"
                        required
                        placeholder="1234"
                        maxLength={4}
                        value={vehicleNumber?.toString() || ""}
                        onChange={(e) =>
                          setVehicleNumber(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={phoneNumber?.toString() || ""}
                        onChange={(e) => setPhoneNumber(Number(e.target.value))}
                      />
                    </div>
                    <Button
                      onClick={submit}
                      className="w-full mt-4"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Add Vehicle"
                      )}
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Phone Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.Number.length ? (
                    data.Number.map((vehicle) => (
                      <TableRow key={vehicle._id}>
                        <TableCell className="font-medium">
                          {vehicle.vehicleNumber.toString().padStart(4, "0")}
                        </TableCell>
                        <TableCell>{vehicle.number}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No vehicles registered yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-primary-foreground px-4 py-2 flex items-center justify-between">
      <h1 className="text-lg font-medium text-primary">
        <Link href="/">Vehicle Management</Link>
      </h1>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          localStorage.removeItem("username");
          router.push("/login");
        }}
      >
        Logout
      </Button>
    </nav>
  );
}
