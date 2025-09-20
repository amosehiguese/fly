"use client";

import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  className?: string;
}

const AnimatedDiv: React.FC<AnimatedDivProps> = ({ children, ...props }) => {
  return <motion.div {...props}>{children}</motion.div>;
};

export default AnimatedDiv;
