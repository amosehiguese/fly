import * as React from "react";
import { SVGProps } from "react";

interface RobotIconProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  color?: string;
}

const RobotIcon = ({
  width = 25,
  height = 25,
  color = "#fff",
  ...props
}: RobotIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
    focusable="true"
    {...props}
  >
    <rect x="4" y="8" width="16" height="10" rx="2" ry="2" fill={color} />
    <circle cx="8" cy="12" r="1.5" fill="#000" />
    <circle cx="16" cy="12" r="1.5" fill="#000" />
    <rect x="10" y="14" width="4" height="2" fill="#000" />
  </svg>
);

export default RobotIcon;
