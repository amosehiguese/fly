"use client";

import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

interface AnimatedPProps extends HTMLMotionProps<"p"> {
  className?: string;
}

const AnimatedP: React.FC<AnimatedPProps> = ({ children, ...props }) => {
  return <motion.p {...props}>{children}</motion.p>;
};

export default AnimatedP;
