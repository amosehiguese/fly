"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock job data 
const JOBS = {
  "job1": {
    id: "job1",
    customerName: "Anna B.",
    pickupAddress: "Gamla Stan 123, Stockholm",
    dropoffAddress: "Norrmalm 456, Stockholm",
    distance: "5.2 km",
    date: "Today",
    time: "13:00-14:00",
    items: "2 items",
    price: "350 kr"
  },
  "job2": {
    id: "job2",
    customerName: "Martin S.",
    pickupAddress: "Södermalm 789, Stockholm",
    dropoffAddress: "Djurgården 101, Stockholm",
    distance: "3.8 km",
    date: "Tomorrow",
    time: "10:00-11:00",
    items: "1 item",
    price: "290 kr"
  },
  "job3": {
    id: "job3",
    customerName: "Emma L.",
    pickupAddress: "Kungsholmen 222, Stockholm",
    dropoffAddress: "Vasastan 333, Stockholm",
    distance: "4.5 km",
    date: "May 31",
    time: "15:30-16:30",
    items: "3 items",
    price: "420 kr"
  }
};

// Mock driver data
const DRIVERS = {
  "1": {
    id: "1",
    name: "John W.",
    image: "/avatars/john.png",
    rating: 4.2
  }
};

export default function ConfirmAssignmentPage() {
  const router = useRouter();
  const { driverId } = useParams<{ driverId: string }>();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const driver = DRIVERS[driverId as keyof typeof DRIVERS];
  const job = jobId ? JOBS[jobId as keyof typeof JOBS] : null;

  useEffect(() => {
    if (!driver || !job) {
      setError("Invalid driver or job");
      return;
    }
    
    // Simulate assignment process
    const assignJob = async () => {
      setIsAssigning(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsAssigning(false);
      setIsComplete(true);
    };
    
    assignJob();
  }, [driver, job]);

  const handleClose = () => {
    router.push("/supplier/jobs");
  };

  const handleViewJobs = () => {
    router.push("/supplier/jobs");
  };

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 py-4 flex items-center justify-between border-b">
        <button onClick={handleClose} className="p-2">
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Assign Job</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {isAssigning ? (
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="h-8 w-8 bg-green-200 rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Assigning Job...</h2>
            <p className="text-gray-500">Please wait while we process your request.</p>
          </div>
        ) : isComplete ? (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Job Assigned!</h2>
            <p className="text-gray-500 mb-2">You've successfully assigned a job to {driver?.name}.</p>
            <p className="text-sm text-gray-400 mb-8">The driver will be notified immediately.</p>
            
            <Card className="mb-8 w-full">
              <CardContent className="p-4 text-left">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{job?.customerName}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Schedule</p>
                  <p className="font-medium">{job?.date}, {job?.time}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">{job?.price}</p>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleViewJobs}
              className="w-full"
            >
              View All Jobs
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
