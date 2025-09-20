import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { RefObject } from "react";

export const exportAsPDF = async (
  componentRef: RefObject<HTMLDivElement | null>,
  fileName: string
) => {
  if (componentRef.current) {
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(fileName);
    } catch (error) {
      console.error("Error exporting as PDF:", error);
    }
  }
};
