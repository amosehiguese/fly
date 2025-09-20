import * as React from "react";
import { SVGProps } from "react";

interface DisbursementSvgProps extends SVGProps<SVGSVGElement> {
  color: string;
}

const DisbursementSvg: React.FC<DisbursementSvgProps> = ({
  color,
  ...props
}) => {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.0026 10.0013C12.5293 10.0013 11.3359 10.8973 11.3359 12.0013C11.3359 13.1053 12.5293 14.0013 14.0026 14.0013C15.4759 14.0013 16.6693 14.8973 16.6693 16.0013C16.6693 17.1053 15.4746 18.0013 14.0026 18.0013M14.0026 10.0013C15.1626 10.0013 16.1519 10.5573 16.5173 11.3346M14.0026 10.0013V8.66797M14.0026 18.0013C12.8426 18.0013 11.8533 17.4453 11.4879 16.668M14.0026 18.0013V19.3346"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9999 1.3347H13.9999C8.02925 1.3347 5.04259 1.3347 3.18792 3.18936C1.33325 5.04403 1.33325 8.02937 1.33325 14.0014C1.33325 19.972 1.33325 22.9574 3.18792 24.8134C5.04259 26.6667 8.02792 26.6667 13.9999 26.6667C19.9706 26.6667 22.9573 26.6667 24.8119 24.812C26.6666 22.9574 26.6666 19.9734 26.6666 14V12M19.9999 7.9987L25.5679 2.42803M26.6666 7.3027L26.5093 3.18136C26.5093 2.20936 25.9293 1.60403 24.8719 1.52803L20.7066 1.33203"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default DisbursementSvg;
