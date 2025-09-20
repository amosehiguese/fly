import Image from "next/image";

const services = [
  {
    title: "Free quotes!",
    description: "We offer free quotes in just a few minutes.",
    icon: "/log1.png", // Replace with an icon component if needed
  },
  {
    title: "Liability insurance",
    description:
      "Our insurance covers damage to your household goods for up to SEK 10 million if something goes wrong and your household goods are damaged.",
    icon: "/log2.png", // Replace with an icon component if needed
  },
  {
    title: "Traffic permit",
    description:
      "We have all agreements in place and maintain a high standard.",
    icon: "/log3.png", // Replace with an icon component if needed
  },
  {
    title: "We work weekdays and weekends",
    description:
      "Regardless of whether you are moving on a weekend or weekday, we are available.",
    icon: "/log4.png", // Replace with an icon component if needed
  },
  {
    title: "Quality guarantee",
    description:
      "We are extremely keen that our customers be satisfied with us.",
    icon: "/log5.png", // Replace with an icon component if needed
  },
  {
    title: "Square deduction",
    description:
      "Take advantage of box deductions and pay only 50 percent of the cost of the move.",
    icon: "/log6.png", // Replace with an icon component if needed
  },
];

const LogisticsSection = () => {
  return (
    <section
      className="bg-white py-12"
      // poppins
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-[36px] font-bold text-title">
          Discover a seamless logistics experience designed to cater to your
          every transportation need.
        </h2>
        <p className="mt-4 text-body">
          Every transportation need deserves a solution that is efficient,
          reliable, and stress-free. From coordination to delivery, experience a
          logistics journey crafted to simplify your workload and exceed
          expectations.
        </p>
      </div>
      <div
        className="w-screen"
        style={{
          backgroundImage: "url('/log-background.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Cards Grid */}
        <div className="grid py-8 w-[70%] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-12 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg px-6 py-8 border hover:shadow-lg transition-shadow"
            >
              <Image
                alt={service.title}
                src={service.icon}
                className="w-8 h-8"
                width={100}
                height={100}
              />
              <h3 className="text-[20px]  font-bold text-title my-2">
                {/* poppins */}
                {service.title}
              </h3>
              <p className="text-title font-medium">
                {/* poppins */}
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogisticsSection;
