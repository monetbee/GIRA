"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Check, ImagePlus, LoaderCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { getTryOnAssetForProduct, tryOnAssetOrder } from "@/lib/try-on-assets";

type FaceLandmarkPoint = {
  x: number;
  y: number;
};

type FaceLandmarkerResult = {
  faceLandmarks?: FaceLandmarkPoint[][];
};

type FaceLandmarkerInstance = {
  detect: (source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) => FaceLandmarkerResult;
};

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPixelPoint(point: FaceLandmarkPoint, width: number, height: number) {
  const x = point.x > 1 ? point.x : point.x * width;
  const y = point.y > 1 ? point.y : point.y * height;
  return { x, y };
}

export function VirtualTryOnModal({ product }: { product: ShopifyProduct }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string>(getTryOnAssetForProduct(product));
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "detecting" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [faceSummary, setFaceSummary] = useState<string>("");
  const detectorRef = useRef<FaceLandmarkerInstance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const frameOptions = useMemo(() => {
    const frames = Array.from(new Set([currentFrame, ...tryOnAssetOrder]));
    return frames.filter(Boolean);
  }, [currentFrame]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (photoSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(photoSrc);
      }
    };
  }, [photoSrc]);

  const loadFaceLandmarker = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (detectorRef.current) {
      return detectorRef.current;
    }

    setIsLoadingModel(true);

    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const detector = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
        },
        runningMode: "IMAGE",
        numFaces: 1,
        outputFaceBlendshapes: false,
      });

      detectorRef.current = detector;
      return detectorRef.current;
    } catch (error) {
      console.error("FACE_LANDMARKER_LOAD_FAILED", error);
      setErrorMessage("Face detection model could not be loaded. Please try again in a moment.");
      setStatus("error");
      return null;
    } finally {
      setIsLoadingModel(false);
    }
  }, []);

  const renderTryOn = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid photo.");
      setStatus("error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPhotoSrc((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return objectUrl;
    });

    const detector = await loadFaceLandmarker();
    if (!detector) {
      return;
    }

    try {
      setStatus("detecting");
      setErrorMessage("");
      setFaceSummary("");

      const image = new window.Image();
      image.decoding = "async";
      image.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image load failed."));
      });

      const maxDimension = 1400;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
      const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
      const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable.");
      }

      context.drawImage(image, 0, 0, width, height);
      const result = detector.detect(canvas);
      const landmarkSet = result.faceLandmarks?.[0];

      if (!landmarkSet || landmarkSet.length < 50) {
        throw new Error("No face detected. Please upload a front-facing photo with your face clearly visible.");
      }

      const leftEyeIndices = [33, 133, 159, 145, 153, 144, 163, 7];
      const rightEyeIndices = [362, 263, 387, 373, 390, 374, 381, 380];
      const leftEye = leftEyeIndices.map((index) => toPixelPoint(landmarkSet[index], width, height));
      const rightEye = rightEyeIndices.map((index) => toPixelPoint(landmarkSet[index], width, height));

      const leftCenter = leftEye.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
      const rightCenter = rightEye.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });

      const leftAverage = { x: leftCenter.x / leftEye.length, y: leftCenter.y / leftEye.length };
      const rightAverage = { x: rightCenter.x / rightEye.length, y: rightCenter.y / rightEye.length };

      const eyeDistance = Math.hypot(rightAverage.x - leftAverage.x, rightAverage.y - leftAverage.y);
      const faceWidth = Math.max(
        ...landmarkSet.map((point) => toPixelPoint(point, width, height).x),
      ) - Math.min(
        ...landmarkSet.map((point) => toPixelPoint(point, width, height).x),
      );

      const frameImage = new window.Image();
      frameImage.src = currentFrame;
      await new Promise<void>((resolve, reject) => {
        frameImage.onload = () => resolve();
        frameImage.onerror = () => reject(new Error("Frame asset unavailable."));
      });

      const frameWidth = clamp(Math.max(eyeDistance * 1.95, faceWidth * 0.86), 120, width * 0.9);
      const frameHeight = frameWidth * 0.42;
      const centerX = (leftAverage.x + rightAverage.x) / 2;
      const centerY = (leftAverage.y + rightAverage.y) / 2;
      const rotation = Math.atan2(rightAverage.y - leftAverage.y, rightAverage.x - leftAverage.x);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.drawImage(frameImage, -frameWidth / 2, -frameHeight * 0.65, frameWidth, frameHeight);
      context.restore();

      const output = canvas.toDataURL("image/png");
      setPhotoSrc(output);
      setStatus("ready");
      setFaceSummary("Face detected. Adjusting frame to your eyes.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Face detection failed.";
      setErrorMessage(message);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  }, [currentFrame, loadFaceLandmarker]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";
    setIsProcessing(true);
    await renderTryOn(file);
  };

  const cycleFrame = () => {
    setCurrentFrame((previous) => {
      const currentIndex = frameOptions.indexOf(previous);
      const nextIndex = (currentIndex + 1) % frameOptions.length;
      return frameOptions[nextIndex];
    });
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="gira-product-secondary-button gira-tryon-launch-button"
        onClick={() => setIsOpen(true)}
      >
        <span>SEE IT ON YOU</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div className="gira-tryon-backdrop" role="dialog" aria-modal="true" aria-label="Virtual try on preview">
          <div className="gira-tryon-modal">
            <div className="gira-tryon-header">
              <div>
                <p className="gira-tryon-kicker">GIRA / VIRTUAL MIRROR</p>
              </div>
              <button type="button" className="gira-tryon-close" aria-label="Close virtual mirror" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="gira-tryon-body">
              <div className="gira-tryon-stage">
                {status === "idle" ? (
                  <div className="gira-tryon-empty-state">
                    <Sparkles className="h-7 w-7" />
                    <p>Upload a front-facing photo.</p>
                    <span>Your photo stays on your device.</span>
                  </div>
                ) : null}

                {photoSrc ? (
                  <img src={photoSrc} alt="User preview with frame overlay" className="gira-tryon-photo" />
                ) : null}

                {status === "detecting" || isLoadingModel || isProcessing ? (
                  <div className="gira-tryon-progress">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    <span>Checking your face…</span>
                  </div>
                ) : null}
              </div>

              {status === "error" && errorMessage ? (
                <div className="gira-tryon-error">
                  <p>{errorMessage}</p>
                </div>
              ) : null}

              {faceSummary ? <p className="gira-tryon-summary">{faceSummary}</p> : null}

              <div className="gira-tryon-actions">
                <Button type="button" variant="primary" className="gira-tryon-upload-button" onClick={triggerUpload}>
                  <ImagePlus className="h-4 w-4" />
                  <span>{photoSrc ? "CHANGE PHOTO" : "UPLOAD PHOTO"}</span>
                </Button>

                <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />

                {frameOptions.length > 1 ? (
                  <Button type="button" variant="secondary" className="gira-tryon-frame-button" onClick={cycleFrame}>
                    <Camera className="h-4 w-4" />
                    <span>TRY ANOTHER FRAME</span>
                  </Button>
                ) : null}

                <div className="gira-tryon-inline-actions">
                  <button type="button" className="gira-tryon-ghost-button" onClick={() => setIsOpen(false)}>
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
