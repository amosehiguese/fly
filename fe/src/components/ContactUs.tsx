import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";

const ContactUs = () => {
  return (
    <div className="bg-[#F8F8FB] w-screen flex justify-center mt-12 py-8">
      <div className="md:w-[70%] flex flex-col md:flex-row">
        <div className="md:w-[50%] px-8 md:px-0">
          <h2 className="text-[32px] px-4 md:px-0 font-bold text-title">
            Contact us for your move!
          </h2>
          <p className="font-medium px-4 md:px-0 text-subtitle ">
            Do you need help with your upcoming move? Do not hesitate to contact
            us at Flyttman for a free quote and more information about our
            services. We are here to make your moving process as simple and
            smooth as possible, regardless of where in Sweden you are.
          </p>

          <div className="flex gap-x-4 mt-4 mx-4">
            <MapPin color="red" />
            <div className="flex flex-col">
              <div className="font-semibold text-subtitle">Address</div>
              <div className="text-primary">
                Vantörsvägen 270 12957 Hägersten
              </div>
            </div>
          </div>
          <div className="flex gap-x-2 mt-4 justify-between mx-4">
            <div className="flex justify-between gap-x-4">
              <Phone color="red" />
              <div className="flex flex-col">
                <div className="font-semibold text-subtitle">Call Us</div>
                <div className="text-primary">0765260659</div>
              </div>
            </div>
            <div className="flex justify-between gap-x-4">
              <Mail color="red" />
              <div className="flex flex-col">
                <div className="font-semibold text-subtitle">Email</div>
                <div className="text-primary">support@flyttman.se</div>
              </div>
            </div>
          </div>

          {/* <div className="bg-primary flex flex-col">

          </div> */}

          <Card className="bg-[#EC1B25] mt-6">
            <CardHeader>
              {/* <CardTitle>Card Title</CardTitle> */}
              <CardDescription className="flex gap-x-4 -mb-4">
                <Image
                  width={50}
                  height={50}
                  alt="emergency"
                  src={"/emergency-icon.png"}
                  className="w-12 h-12"
                />
                <h2 className="text-white font-semibold">
                  For emergency removal? Call
                </h2>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[36px] ml-16 -mb-2 text-white">0765260659</p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-white md:px-8 px-4 py-12 ml-8">
          <h2 className="font-semibold text-[20px] mb-4 mt-12 text-title">
            Send us a message
          </h2>
          <div className="flex justify-between gap-x-2 md:gap-x-8">
            <Input
              placeholder="First Name"
              className="bg-[#F8F8FB] border-none"
            />
            <Input
              placeholder="Last Name"
              className="bg-[#F8F8FB] border-none"
            />
          </div>

          <Input
            placeholder="Email Address"
            className="bg-[#F8F8FB] border-none mt-6"
          />

          <Input
            placeholder="Phone Number"
            className="bg-[#F8F8FB] border-none mt-6"
          />

          <Textarea
            className="bg-[#F8F8FB] border-none mt-6"
            placeholder="Message"
          />

          <Button className="mt-4 rounded-[16px]">Send Message</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
