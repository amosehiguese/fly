import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Camera, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDriverOrders } from "@/hooks/driver/useDriverOrders";
import Image from "next/image";

export default function ProofOfDeliveryDrawer({
  open,
  onOpenChange,
  orderId,
}: {
  open: boolean;
  onOpenChange: () => void;
  orderId: string;
}) {
  const t = useTranslations("driver");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [notes, setNotes] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);

  // Upload hook
  const { uploadProofOfDelivery } = useDriverOrders();

  // Handle signature drawing (simple canvas)
  const startDrawing = (e: React.MouseEvent) => {
    if (signatureSaved) return;
    setDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing || signatureSaved) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const saveSignature = () => {
    if (canvasRef.current && !signatureSaved) {
      setSignature(canvasRef.current.toDataURL("image/png"));
      setSignatureSaved(true);
    }
  };

  // Convert dataURL to File
  function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Start camera
  const startCamera = async () => {
    setShowCamera(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }
  };

  // Capture snapshot
  const capturePhoto = () => {
    if (videoRef.current && cameraCanvasRef.current) {
      const canvas = cameraCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 200, 200);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "proof.jpg", { type: "image/jpeg" });
            setImage(file);
            setImageUrl(URL.createObjectURL(blob));
            // Stop camera
            if (videoRef.current) {
              const stream = videoRef.current.srcObject as MediaStream | null;
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
              }
            }
            setShowCamera(false);
          }
        }, "image/jpeg");
      }
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !signature) return;
    uploadProofOfDelivery.mutate({
      orderId,
      deliveryImage: image,
      signatureImage: dataURLtoFile(signature, "signature.png"),
      deliveryNotes: notes,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-2xl">
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {t("proofOfDelivery")}
          </DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <div className="divide-y">
            <div className="flex items-center gap-4 p-4">
              <Camera className="w-8 h-8 text-gray-500" />
              <div className="flex-1">
                <div className="font-semibold">{t("takePicture")}</div>
                <div className="text-xs text-gray-500">
                  {t("imageSaveOnce")}
                </div>
                {imageUrl ? (
                  <Image
                    width={100}
                    height={100}
                    src={imageUrl}
                    alt="Proof"
                    className="mt-2 rounded border w-32 h-32 object-cover"
                  />
                ) : showCamera ? (
                  <div>
                    <video
                      ref={videoRef}
                      width={200}
                      height={200}
                      className="rounded"
                    />
                    <canvas
                      ref={cameraCanvasRef}
                      width={200}
                      height={200}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                      onClick={capturePhoto}
                    >
                      {t("takePicture")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                    onClick={startCamera}
                    disabled={!!image}
                  >
                    {t("takePicture")}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <Pencil className="w-8 h-8 text-gray-500" />
              <div className="flex-1">
                <div className="font-semibold">{t("signature")}</div>
                <div className="text-xs text-gray-500">
                  {t("signatureSaveOnce")}
                </div>
                {signature ? (
                  <Image
                    width={100}
                    height={100}
                    src={signature}
                    alt="Signature"
                    className="mt-2 rounded border w-32 h-16 object-contain bg-white"
                  />
                ) : (
                  <div className="mt-2">
                    <canvas
                      ref={canvasRef}
                      width={200}
                      height={60}
                      className="border rounded bg-white"
                      style={{ touchAction: "none" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                        onClick={saveSignature}
                        disabled={signatureSaved}
                      >
                        {t("signature")}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded"
                        onClick={() => {
                          if (canvasRef.current && !signatureSaved) {
                            const ctx = canvasRef.current.getContext("2d");
                            ctx?.clearRect(0, 0, 200, 60);
                          }
                        }}
                        disabled={signatureSaved}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <label className="block font-medium mb-1" htmlFor="deliveryNotes">
                {t("deliveryNotes") || "Delivery notes"}
              </label>
              <Input
                id="deliveryNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  t("deliveryNotesPlaceholder") ||
                  "Add any notes for the delivery..."
                }
                disabled={uploadProofOfDelivery.isPending}
              />
            </div>
            <div className="p-4 flex justify-end">
              <Button
                type="submit"
                disabled={
                  !image || !signature || uploadProofOfDelivery.isPending
                }
                className="w-full"
              >
                {uploadProofOfDelivery.isPending
                  ? t("submitting")
                  : t("submit")}
              </Button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
