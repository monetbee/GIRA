"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ImagePlus, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { getVirtualTryOnAssets } from "@/lib/virtual-try-on-products";

type PreviewView = "model" | "upload";
type Point = { x: number; y: number };
type Detector = { detect: (source: HTMLCanvasElement) => { faceLandmarks?: Point[][] } };

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const pixel = (point: Point, width: number, height: number) => ({ x: point.x > 1 ? point.x : point.x * width, y: point.y > 1 ? point.y : point.y * height });

export function VirtualTryOnModal({ product }: { product: ShopifyProduct }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const detectorRef = useRef<Detector | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "detecting" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const assets = useMemo(() => getVirtualTryOnAssets(product), [product]);
  const [activeView, setActiveView] = useState<PreviewView>(() => assets.modelImage ? "model" : "upload");

  const clearPhoto = useCallback(() => {
    setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return null; });
    if (inputRef.current) inputRef.current.value = "";
    setStatus("idle"); setErrorMessage("");
  }, []);
  const close = useCallback(() => { clearPhoto(); setIsOpen(false); }, [clearPhoto]);
  const open = () => { setActiveView(assets.modelImage ? "model" : "upload"); setIsOpen(true); };

  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = overflow; };
  }, [isOpen, assets.modelImage, close]);
  useEffect(() => clearPhoto, [clearPhoto]);

  const getDetector = useCallback(async () => {
    if (detectorRef.current) return detectorRef.current;
    setIsLoading(true);
    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const detector = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL_URL }, runningMode: "IMAGE", numFaces: 1 });
      detectorRef.current = detector as unknown as Detector;
      return detectorRef.current;
    } catch {
      setStatus("error"); setErrorMessage("Face detection could not be loaded. Please try again."); return null;
    } finally { setIsLoading(false); }
  }, []);

  const renderTryOn = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setStatus("error"); setErrorMessage("Please upload a valid image."); return; }
    const objectUrl = URL.createObjectURL(file);
    setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return objectUrl; });
    setStatus("detecting"); setErrorMessage("");
    try {
      if (!assets.glassesAsset) throw new Error("A try-on asset is not configured for this product yet.");
      const detector = await getDetector(); if (!detector) return;
      const image = new Image(); image.decoding = "async"; image.src = objectUrl;
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; });
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale)); const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(image, 0, 0, width, height);
      const landmarks = detector.detect(canvas).faceLandmarks?.[0];
      if (!landmarks) throw new Error("No face detected. Please use a clear, front-facing photo.");
      const center = (indexes: number[]) => indexes.map((i) => pixel(landmarks[i], width, height)).reduce((a, p) => ({ x: a.x + p.x / indexes.length, y: a.y + p.y / indexes.length }), { x: 0, y: 0 });
      const left = center([33, 133, 159, 145]); const right = center([362, 263, 387, 373]);
      const frame = new Image(); frame.crossOrigin = "anonymous"; frame.src = assets.glassesAsset;
      await new Promise<void>((resolve, reject) => { frame.onload = () => resolve(); frame.onerror = reject; });
      const frameWidth = Math.min(width * 0.9, Math.max(120, Math.hypot(right.x - left.x, right.y - left.y) * 2));
      const frameHeight = frameWidth * (frame.naturalHeight / frame.naturalWidth);
      context.save(); context.translate((left.x + right.x) / 2, (left.y + right.y) / 2); context.rotate(Math.atan2(right.y - left.y, right.x - left.x));
      context.drawImage(frame, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight); context.restore();
      const output = canvas.toDataURL("image/png");
      setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return output; }); setStatus("ready");
    } catch (error) { setStatus("error"); setErrorMessage(error instanceof Error ? error.message : "Virtual try-on failed."); }
  }, [assets.glassesAsset, getDetector]);

  return <>
    <Button type="button" variant="secondary" className="gira-product-secondary-button gira-tryon-launch-button" onClick={open}><span>SEE IT ON YOU</span><ArrowRight className="h-4 w-4" /></Button>
    {isOpen ? <div className="gira-tryon-backdrop" role="dialog" aria-modal="true" aria-label="GIRA Virtual Mirror" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="gira-tryon-modal">
        <div className="gira-tryon-header"><p className="gira-tryon-kicker">GIRA / VIRTUAL MIRROR</p><button type="button" className="gira-tryon-close" aria-label="Close virtual mirror" onClick={close}><X className="h-4 w-4" /></button></div>
        <div className="gira-tryon-body">
          <div className="gira-tryon-stage">
            {/* Dynamic Shopify and in-memory blob/data URLs are intentionally not routed through an image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {activeView === "model" && assets.modelImage ? <img src={assets.modelImage} alt={`${product.title} model preview`} className="gira-tryon-photo gira-tryon-model-photo" /> : null}
            {activeView === "upload" && !photoSrc ? <div className="gira-tryon-empty-state"><Sparkles className="h-7 w-7" /><p>Upload a front-facing photo.</p><span>Your photo stays on your device.</span></div> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {activeView === "upload" && photoSrc ? <img src={photoSrc} alt="Your photo with the selected GIRA frame" className="gira-tryon-photo" /> : null}
            {activeView === "upload" && (status === "detecting" || isLoading) ? <div className="gira-tryon-progress"><LoaderCircle className="h-5 w-5 animate-spin" /><span>Checking your face…</span></div> : null}
          </div>
          <div className="gira-tryon-tabs" role="tablist" aria-label="Preview source"><button type="button" role="tab" aria-selected={activeView === "model"} disabled={!assets.modelImage} onClick={() => setActiveView("model")}>MODEL</button><button type="button" role="tab" aria-selected={activeView === "upload"} onClick={() => setActiveView("upload")}>YOUR PHOTO</button></div>
          {activeView === "upload" && status === "error" ? <div className="gira-tryon-error"><p>{errorMessage}</p></div> : null}
          <div className="gira-tryon-actions">
            <Button type="button" variant="primary" className="gira-tryon-upload-button" onClick={() => { setActiveView("upload"); inputRef.current?.click(); }}><ImagePlus className="h-4 w-4" /><span>{activeView === "model" ? "USE YOUR PHOTO" : photoSrc ? "CHANGE PHOTO" : "UPLOAD PHOTO"}</span></Button>
            <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; e.currentTarget.value = ""; if (file) void renderTryOn(file); }} />
            <div className="gira-tryon-privacy"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><div><strong>Your photo stays private.</strong><p>Your photo is processed temporarily in your browser and is never uploaded to GIRA, stored on our servers, or shared with third parties. It is discarded when you close or leave this page.</p><strong lang="ja">写真はお客様の端末内でのみ使用されます。</strong><p lang="ja">アップロードされた写真がGIRAへ送信・保存されることはありません。ブラウザ上で一時的に処理され、ページを閉じる、または離れると破棄されます。</p></div></div>
            <div className="gira-tryon-inline-actions"><button type="button" className="gira-tryon-ghost-button" onClick={close}>CLOSE</button></div>
          </div>
        </div>
      </div>
    </div> : null}
  </>;
}
