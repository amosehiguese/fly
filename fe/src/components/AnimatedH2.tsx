"use client";

import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

interface AnimatedH2Props extends HTMLMotionProps<"div"> {
  className?: string;
}

const AnimatedH2: React.FC<AnimatedH2Props> = ({ children, ...props }) => {
  return <motion.div {...props}>{children}</motion.div>;
};

export default AnimatedH2;
