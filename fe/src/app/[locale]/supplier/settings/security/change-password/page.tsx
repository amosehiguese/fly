"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackHeader from "@/components/BackHeader";

export default function ChangePasswordPage() {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <div>
      <BackHeader title="Change Password" />
      <div className="p-6">
        <p className="text-lg mb-8">
          Secure your transaction with your 4 digits pin. Do not share this pin
          with anybody.
        </p>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type={showPasswords.current ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="****"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type={showPasswords.new ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="****"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="****"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            size="lg"
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
}
