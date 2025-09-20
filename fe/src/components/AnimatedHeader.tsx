"use client";

import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

interface AnimatedHeaderProps extends HTMLMotionProps<"header"> {
  className?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  children,
  ...props
}) => {
  return <motion.header {...props}>{children}</motion.header>;
};

export default AnimatedHeader;
