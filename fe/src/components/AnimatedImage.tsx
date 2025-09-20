"use client";

import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import Image from "next/image";

interface AnimatedImageProps extends HTMLMotionProps<"img"> {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const MotionImage = motion(Image);

const AnimatedImage: React.FC<AnimatedImageProps> = (props) => {
  return (
    <MotionImage
      {...props}
      width={Number(props.width) || 1200}
      height={Number(props.height) || 1200}
      className={props.className}
      quality={100}
      alt={props.alt || "image"}
    />
  );
};

export default AnimatedImage;
