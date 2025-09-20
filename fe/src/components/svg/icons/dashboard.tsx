import * as React from "react";
import { SVGProps } from "react";

interface DashboardIconProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  color?: string;
}

const DashboardIcon = ({
  width = 23,
  height = 23,
  color = "#fff",
  ...props
}: DashboardIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 25"
    focusable="true"
    {...props}
  >
    <path
      fill={color}
      d="M13.5 9.913v-5H20v5h-6.5Zm-9.5 3v-8h6.5v8H4Zm9.5 8v-8H20v8h-6.5Zm-9.5 0v-5h6.5v5H4Zm1-9h4.5v-6H5v6Zm9.5 8H19v-6h-4.5v6Zm0-11H19v-3h-4.5v3Zm-9.5 11h4.5v-3H5v3Z"
    />
  </svg>
);
export default DashboardIcon;
