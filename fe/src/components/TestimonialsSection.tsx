import React from "react";
import AnimatedImage from "./AnimatedImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const testimonials = [
  {
    id: 1,
    title: "An amazing service",
    body: "Excellent service! The process was seamless, from quick quotes to on-time delivery. Communication was clear, and everything was handled with care. Highly recommend for reliable logistics!",
    name: "James Schmicheal",
  },
  {
    id: 2,
    title: "An amazing service",
    body: "Excellent service! The process was seamless, from quick quotes to on-time delivery. Communication was clear, and everything was handled with care. Highly recommend for reliable logistics!",
    name: "James Schmicheal",
  },
];

const TestimonialsSection = () => {
  return (
    <div className="bg-[#F8F8FB] pb-8 w-screen flex flex-col items-center">
      <div className="md:w-[70%] w-[90%]">
        <h2 className="text-title font-bold text-center text-[36px]">
          What Our Clients Say
        </h2>
        <p className="text-subtitle text-center font-medium ">
          Discover the success stories shared by our clients
        </p>

        <Carousel>
          <div className="mt-4 flex justify-end space-x-2 mx-4 mb-4 ">
            <CarouselPrevious className="enabled:bg-primary relative top-4 left-5 enabled:text-white" />

            <CarouselNext className="enabled:bg-primary relative top-4 left-7 enabled:text-white" />
          </div>

          <CarouselContent>
            {testimonials.map((item) => (
              <CarouselItem key={item.id}>
                <div className="bg-white flex flex-col md:flex-row md:rounded-[24px] rounded-none">
                  <AnimatedImage
                    src="/our-clients-say.png"
                    width={1000}
                    height={1000}
                    className="lg:h-[60vh] md:w-[50%] rounded-[24px] rounded-b-none md:rounded-none"
                    alt={"testimonials"}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                  <div className="md:px-8 px-2 flex flex-col justify-center">
                    <h2 className="text-title font-bold text-[20px]">
                      {item.title}
                    </h2>
                    <p className="text-subtitle font-medium my-4">
                      {item.body}
                    </p>
                    <small className="font-semibold">{item.name}</small>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default TestimonialsSection;
