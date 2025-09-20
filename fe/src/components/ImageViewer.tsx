"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";

interface ImageViewerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageViewer({
  src,
  alt,
  width = 300,
  height = 300,
  className = "",
}: ImageViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
      />

      <Lightbox open={open} close={() => setOpen(false)} slides={[{ src }]} />
    </>
  );
}
