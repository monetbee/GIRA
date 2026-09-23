"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, LoaderCircle, ShieldCheck, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { getArTryOnProduct } from "@/lib/ar-try-on-products";

type Landmark = { x: number; y: number; z?: number };
type FaceLandmarkerResult = { faceLandmarks: Landmark[][] };
type FaceLandmarkerInstance = {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => FaceLandmarkerResult;
  close: () => void;
};
type OverlayTransform = { x: number; y: number; width: number; rotation: number };
type CameraStatus = "idle" | "loading" | "live" | "error";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const SMOOTHING = 0.28;
const TARGET_FRAME_INTERVAL = 1000 / 30;

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const average = (points: Landmark[]) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
});

export function VirtualTryOnModal({ product }: { product: ShopifyProduct }) {
  const t = useTranslations();
  const config = getArTryOnProduct(product);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const cameraSessionRef = useRef(0);
  const transformRef = useRef<OverlayTransform | null>(null);
  const lastDetectionRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const mountedRef = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [message, setMessage] = useState("");
  const [hasFace, setHasFace] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(3 / 4);

  const cleanupCamera = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    transformRef.current = null;
    lastDetectionRef.current = 0;
    lastVideoTimeRef.current = -1;
    const video = videoRef.current;
    if (video) { video.pause(); video.srcObject = null; }
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const close = useCallback(() => {
    cameraSessionRef.current += 1;
    cleanupCamera();
    setStatus("idle");
    setMessage("");
    setHasFace(false);
    setIsOpen(false);
  }, [cleanupCamera]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; cleanupCamera(); };
  }, [cleanupCamera]);

  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = overflow; };
  }, [isOpen, close]);

  const drawFrame = useCallback((result: FaceLandmarkerResult) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayImageRef.current;
    if (!video || !canvas || !overlay || !config) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    const landmarks = result.faceLandmarks[0];
    if (!landmarks) { setHasFace(false); return; }

    const leftEye = average([landmarks[33], landmarks[133], landmarks[159], landmarks[145]]);
    const rightEye = average([landmarks[362], landmarks[263], landmarks[386], landmarks[374]]);
    const noseBridge = landmarks[168];
    const leftFace = landmarks[234];
    const rightFace = landmarks[454];
    if (!leftEye || !rightEye || !noseBridge || !leftFace || !rightFace) return;

    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const raw: OverlayTransform = {
      x: eyeMidX * canvas.width + config.offsetX,
      y: lerp(eyeMidY, noseBridge.y, 0.16) * canvas.height + config.offsetY,
      width: Math.hypot((rightFace.x - leftFace.x) * canvas.width, (rightFace.y - leftFace.y) * canvas.height) * config.scale,
      rotation: Math.atan2((rightEye.y - leftEye.y) * canvas.height, (rightEye.x - leftEye.x) * canvas.width) + config.rotationOffset * Math.PI / 180,
    };
    const previous = transformRef.current;
    const smoothed = previous ? {
      x: lerp(previous.x, raw.x, SMOOTHING),
      y: lerp(previous.y, raw.y, SMOOTHING),
      width: lerp(previous.width, raw.width, SMOOTHING),
      rotation: lerp(previous.rotation, raw.rotation, SMOOTHING),
    } : raw;
    transformRef.current = smoothed;
    const height = smoothed.width * (overlay.naturalHeight / overlay.naturalWidth);
    context.save();
    context.translate(smoothed.x, smoothed.y);
    context.rotate(smoothed.rotation);
    context.drawImage(overlay, -smoothed.width / 2, -height / 2, smoothed.width, height);
    context.restore();
    setHasFace(true);
  }, [config]);

  const startCamera = async () => {
    if (!config || status === "loading" || status === "live") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error"); setMessage(t("This browser does not support camera access.")); return;
    }
    setStatus("loading"); setMessage(""); setHasFace(false);
    const session = ++cameraSessionRef.current;
    try {
      const overlay = new Image();
      overlay.decoding = "async";
      overlay.src = config.asset;
      await new Promise<void>((resolve, reject) => { overlay.onload = () => resolve(); overlay.onerror = () => reject(new Error("ASSET_UNAVAILABLE")); });
      if (session !== cameraSessionRef.current) return;
      overlayImageRef.current = overlay;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      if (!mountedRef.current || session !== cameraSessionRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("VIDEO_UNAVAILABLE");
      video.srcObject = stream;
      await video.play();
      setAspectRatio(video.videoWidth / video.videoHeight || 3 / 4);

      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const options = { baseOptions: { modelAssetPath: MODEL_URL }, runningMode: "VIDEO" as const, numFaces: 1, minFaceDetectionConfidence: 0.55, minFacePresenceConfidence: 0.55, minTrackingConfidence: 0.55 };
      let landmarker;
      try { landmarker = await FaceLandmarker.createFromOptions(vision, { ...options, baseOptions: { ...options.baseOptions, delegate: "GPU" } }); }
      catch { landmarker = await FaceLandmarker.createFromOptions(vision, options); }
      if (session !== cameraSessionRef.current) { landmarker.close(); return; }
      landmarkerRef.current = landmarker as unknown as FaceLandmarkerInstance;
      if (!mountedRef.current) { cleanupCamera(); return; }
      setStatus("live");

      const render = (now: number) => {
        const activeVideo = videoRef.current;
        const detector = landmarkerRef.current;
        if (!activeVideo || !detector || !streamRef.current) return;
        if (now - lastDetectionRef.current >= TARGET_FRAME_INTERVAL && activeVideo.currentTime !== lastVideoTimeRef.current) {
          lastDetectionRef.current = now;
          lastVideoTimeRef.current = activeVideo.currentTime;
          drawFrame(detector.detectForVideo(activeVideo, now));
        }
        animationRef.current = requestAnimationFrame(render);
      };
      animationRef.current = requestAnimationFrame(render);
    } catch (error) {
      cleanupCamera();
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      setStatus("error");
      const assetUnavailable = error instanceof Error && error.message === "ASSET_UNAVAILABLE";
      setMessage(assetUnavailable
        ? t("Virtual Try-On is not available for this product yet.")
        : denied
          ? t("Camera permission was denied.")
          : t("Virtual Mirror could not start. Please check your camera and try again."));
    }
  };

  if (!config) return null;

  return <>
    <Button type="button" variant="secondary" className="gira-product-secondary-button gira-tryon-launch-button" onClick={() => setIsOpen(true)}><span>{t("SEE IT ON YOU")}</span><ArrowRight className="h-4 w-4" /></Button>
    {isOpen ? <div className="gira-tryon-backdrop" role="dialog" aria-modal="true" aria-label={t("GIRA Virtual Mirror")} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="gira-tryon-modal gira-ar-modal">
        <div className="gira-tryon-header"><div><span className="gira-ar-brand">GIRA</span><p className="gira-tryon-kicker">{t("VIRTUAL MIRROR")}</p></div><button type="button" className="gira-tryon-close" aria-label={t("Close virtual mirror")} onClick={close}><X className="h-4 w-4" /></button></div>
        <div className="gira-tryon-body">
          <div className="gira-ar-stage" style={{ aspectRatio }}>
            <video ref={videoRef} className="gira-ar-video" playsInline muted aria-label={t("Live camera preview")} />
            <canvas ref={canvasRef} className="gira-ar-canvas" aria-hidden="true" />
            {status !== "live" ? <div className="gira-ar-placeholder"><VideoOff className="h-7 w-7" /><span>{t("Camera starts only when you choose.")}</span></div> : null}
            {status === "live" ? <span className="gira-ar-live"><i />{t("LIVE")}</span> : null}
            {status === "live" && !hasFace ? <p className="gira-ar-face-hint">{t("Position your face in the frame.")}</p> : null}
          </div>
          {status !== "live" ? <Button type="button" variant="primary" className="gira-tryon-generate-button" disabled={status === "loading"} onClick={() => void startCamera()}>{status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}<span>{status === "loading" ? t("STARTING CAMERA…") : t("TRY WITH CAMERA")}</span></Button> : null}
          {status === "error" ? <div className="gira-tryon-error" role="alert"><p>{message}</p></div> : null}
          <div className="gira-ar-privacy"><ShieldCheck className="h-5 w-5" /><div><strong>{t("PRIVATE BY DESIGN")}</strong><p>{t("Your camera is processed directly in your browser to power the virtual try-on.")}</p><p>{t("Your camera feed is not sent to GIRA or an external AI service.")}</p></div></div>
          <div className="gira-tryon-inline-actions"><button type="button" className="gira-tryon-ghost-button" onClick={close}>{t("CLOSE")}</button></div>
        </div>
      </div>
    </div> : null}
  </>;
}
