"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ImagePlus, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { virtualTryOnModels, virtualTryOnPrivacy } from "@/lib/virtual-try-on-config";
import { getVirtualTryOnProductImage } from "@/lib/virtual-try-on-products";
import { createModelTryOnCacheKey, generateVirtualTryOn } from "@/lib/virtual-try-on-provider";

type PreviewView = "model" | "upload";
type Status = "idle" | "generating" | "ready" | "error";
const ACCEPTED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

async function preparePhoto(file: File) {
  if (!ACCEPTED_PHOTO_TYPES.has(file.type)) throw new Error("JPEG、PNG、WEBP形式の画像を選択してください。");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("画像サイズが大きすぎます。12MB以下の画像を選択してください。");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(15, Math.round(bitmap.width * scale));
    canvas.height = Math.max(15, Math.round(bitmap.height * scale));
    if (canvas.width < 15 || canvas.height < 15) throw new Error("画像の解像度が小さすぎます。");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("画像を処理できませんでした。");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally { bitmap.close(); }
}

export function VirtualTryOnModal({ product }: { product: ShopifyProduct }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<PreviewView>("model");
  const [selectedModelId, setSelectedModelId] = useState(virtualTryOnModels[0]?.id ?? "");
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const productImage = useMemo(() => getVirtualTryOnProductImage(product), [product]);
  const selectedModel = virtualTryOnModels.find((model) => model.id === selectedModelId) ?? virtualTryOnModels[0];
  const personImage = activeView === "model" ? selectedModel?.image ?? null : photoSrc;
  const previewImage = resultSrc ?? personImage;

  const resetResult = useCallback(() => { setResultSrc(null); setStatus("idle"); setErrorMessage(""); }, []);
  const clearPhoto = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return null; });
    if (inputRef.current) inputRef.current.value = "";
    setHasConsent(false);
    resetResult();
  }, [resetResult]);
  const close = useCallback(() => { clearPhoto(); setIsOpen(false); }, [clearPhoto]);

  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = overflow; };
  }, [isOpen, close]);
  useEffect(() => clearPhoto, [clearPhoto]);

  const selectView = (view: PreviewView) => { if (status === "generating") return; setActiveView(view); resetResult(); };
  const selectPhoto = async (file: File) => {
    if (status === "generating") return;
    try {
      const prepared = await preparePhoto(file);
      setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return prepared; });
      setHasConsent(false);
      setActiveView("upload"); resetResult();
    } catch (error) {
      setStatus("error"); setErrorMessage(error instanceof Error ? error.message : "画像を処理できませんでした。");
    }
  };

  const generate = async () => {
    if (!personImage || !productImage || status === "generating") return;
    if (activeView === "upload" && !hasConsent) return;
    setStatus("generating"); setErrorMessage("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      // Ready for a future persistent MODEL result cache.
      if (activeView === "model" && selectedModel) createModelTryOnCacheKey(product.handle, selectedModel.id);
      const result = await generateVirtualTryOn({ personImage, productImage, productName: product.title, signal: controller.signal });
      setResultSrc(result.imageUrl); setStatus("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") { setStatus("idle"); return; }
      setStatus("error"); setErrorMessage("We couldn't generate your try-on. Please try again.");
    } finally { if (requestRef.current === controller) requestRef.current = null; }
  };

  return <>
    <Button type="button" variant="secondary" className="gira-product-secondary-button gira-tryon-launch-button" onClick={() => setIsOpen(true)}><span>SEE IT ON YOU</span><ArrowRight className="h-4 w-4" /></Button>
    {isOpen ? <div className="gira-tryon-backdrop" role="dialog" aria-modal="true" aria-label="GIRA Virtual Mirror" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="gira-tryon-modal">
        <div className="gira-tryon-header"><p className="gira-tryon-kicker">GIRA / VIRTUAL MIRROR</p><button type="button" className="gira-tryon-close" aria-label="Close virtual mirror" onClick={close}><X className="h-4 w-4" /></button></div>
        <div className="gira-tryon-body">
          <div className="gira-tryon-stage">
            {/* Shopify, blob, and provider URLs intentionally bypass image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previewImage ? <img src={previewImage} alt={status === "ready" ? `${product.title} virtual try-on` : "Virtual try-on person preview"} className="gira-tryon-photo gira-tryon-model-photo" /> : <div className="gira-tryon-empty-state"><Sparkles className="h-7 w-7" /><p>Upload a front-facing photo.</p><span>You choose when AI processing begins.</span></div>}
            {status === "generating" ? <div className="gira-tryon-progress"><LoaderCircle className="h-5 w-5 animate-spin" /><span>CREATING YOUR LOOK…</span><small>AI virtual try-on may take a moment.</small></div> : null}
          </div>
          <div className="gira-tryon-tabs" role="tablist" aria-label="Preview source"><button type="button" role="tab" disabled={status === "generating"} aria-selected={activeView === "model"} onClick={() => selectView("model")}>MODEL</button><button type="button" role="tab" disabled={status === "generating"} aria-selected={activeView === "upload"} onClick={() => selectView("upload")}>YOUR PHOTO</button></div>
          <p className="gira-tryon-summary">{activeView === "model" ? "No personal photo required / ご自身の写真は必要ありません" : "AI-powered personalized try-on / ご自身の写真を使用したAIバーチャル試着"}</p>
          {activeView === "model" ? <div className="gira-tryon-model-selector" aria-label="Choose a model">{virtualTryOnModels.map((model) => <button key={model.id} type="button" disabled={status === "generating"} aria-label={`Select ${model.name}`} aria-pressed={selectedModel?.id === model.id} onClick={() => { setSelectedModelId(model.id); resetResult(); }}><Image src={model.image} alt={model.name} width={108} height={108} sizes="(max-width: 420px) 92px, 108px" /><span>{model.name}</span></button>)}</div> : null}
          {status === "error" ? <div className="gira-tryon-error" role="alert"><p>{errorMessage}</p></div> : null}
          <div className="gira-tryon-actions">
            {activeView === "upload" ? <><Button type="button" variant="primary" className="gira-tryon-upload-button" disabled={status === "generating"} onClick={() => inputRef.current?.click()}><ImagePlus className="h-4 w-4" /><span>{photoSrc ? "CHANGE PHOTO" : "UPLOAD PHOTO / USE YOUR PHOTO"}</span></Button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) void selectPhoto(file); }} /><div className="gira-tryon-privacy"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><div><strong>{virtualTryOnPrivacy.english.title}</strong>{virtualTryOnPrivacy.english.paragraphs.map((text) => <p key={text}>{text}</p>)}<strong lang="ja">{virtualTryOnPrivacy.japanese.title}</strong>{virtualTryOnPrivacy.japanese.paragraphs.map((text) => <p key={text} lang="ja">{text}</p>)}</div></div><label className="gira-tryon-consent"><input type="checkbox" checked={hasConsent} disabled={status === "generating"} onChange={(event) => setHasConsent(event.target.checked)} /><span><strong>AIバーチャル試着のため、選択した写真が外部AI処理サービスへ送信されることに同意します。</strong><small>I agree that my selected photo may be sent to an external AI processing service to generate my virtual try-on.</small></span></label></> : null}
            {!productImage ? <div className="gira-tryon-error"><p>A product reference image is not available.</p></div> : null}
            <Button type="button" variant="primary" className="gira-tryon-generate-button" disabled={!personImage || !productImage || status === "generating" || (activeView === "upload" && !hasConsent)} onClick={() => void generate()}>{status === "generating" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}<span>{status === "generating" ? "CREATING VIRTUAL TRY-ON..." : status === "ready" ? "REGENERATE" : status === "error" ? "TRY AGAIN" : "GENERATE TRY-ON"}</span></Button>
            {status === "ready" ? <p className="gira-tryon-disclaimer"><strong>AI-GENERATED PREVIEW</strong><span>Actual product appearance and fit may vary.</span><strong lang="ja">AI生成による試着イメージ</strong><span lang="ja">実際の商品とは見た目やフィット感が異なる場合があります。</span></p> : null}
            <div className="gira-tryon-inline-actions"><button type="button" className="gira-tryon-ghost-button" onClick={close}>CLOSE</button></div>
          </div>
        </div>
      </div>
    </div> : null}
  </>;
}
