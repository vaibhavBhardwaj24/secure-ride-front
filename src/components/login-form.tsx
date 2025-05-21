"use client";
import { setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface UserDTO {
  _id: string;
  username: string;
  password: string;
  __v: number;
}

export interface LoginResponseDTO {
  message: string;
  user: UserDTO;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navi = useRouter();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // const formData = new FormData(event.currentTarget);
    // const username = formData.get("username") as string;
    // const password = formData.get("password") as string;

    try {
      setLoading(true);
      const response = await axios.post(
        "https://secure-ride-lime.vercel.app/login",
        { username, password }
      );
      if (response.status === 200) {
        // login successful
        toast("Login successful");
        console.log("Login successful");
        const data = response.data as LoginResponseDTO;
        setCookie("username", `${data.user.username}`, {
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        });

        navi.push("/");
      } else if (response.status == 401) {
        toast("Wrong username or password");
      } else {
        setError("Wrong username or password");
      }
    } catch (error) {
      toast("Something went wrong");
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="m@example"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
