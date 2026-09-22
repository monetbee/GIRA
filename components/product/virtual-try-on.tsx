"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ImagePlus, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";
import { virtualTryOnModels, virtualTryOnPrivacy } from "@/lib/virtual-try-on-config";
import { getVirtualTryOnProductImage } from "@/lib/virtual-try-on-products";
import { createModelTryOnCacheKey, generateVirtualTryOn } from "@/lib/virtual-try-on-provider";

type PreviewView = "model" | "upload";
type Status = "idle" | "generating" | "ready" | "error";

export function VirtualTryOnModal({ product }: { product: ShopifyProduct }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<PreviewView>("model");
  const [selectedModelId, setSelectedModelId] = useState(virtualTryOnModels[0]?.id ?? "");
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const productImage = useMemo(() => getVirtualTryOnProductImage(product), [product]);
  const selectedModel = virtualTryOnModels.find((model) => model.id === selectedModelId) ?? virtualTryOnModels[0];
  const personImage = activeView === "model" ? selectedModel?.image ?? null : photoSrc;
  const previewImage = resultSrc ?? personImage;

  const resetResult = useCallback(() => { setResultSrc(null); setStatus("idle"); setErrorMessage(""); }, []);
  const clearPhoto = useCallback(() => {
    setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return null; });
    if (inputRef.current) inputRef.current.value = "";
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

  const selectView = (view: PreviewView) => { setActiveView(view); resetResult(); };
  const selectPhoto = (file: File) => {
    if (!file.type.startsWith("image/")) { setStatus("error"); setErrorMessage("Please upload a valid image."); return; }
    const objectUrl = URL.createObjectURL(file);
    setPhotoSrc((previous) => { if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous); return objectUrl; });
    setActiveView("upload"); resetResult();
  };

  const generate = async () => {
    if (!personImage || !productImage || status === "generating") return;
    setStatus("generating"); setErrorMessage("");
    try {
      // Ready for a future persistent MODEL result cache.
      if (activeView === "model" && selectedModel) createModelTryOnCacheKey(product.handle, selectedModel.id);
      const result = await generateVirtualTryOn({ personImage, productImage, productName: product.title });
      setResultSrc(result.imageUrl); setStatus("ready");
    } catch {
      setStatus("error"); setErrorMessage("We couldn't generate your try-on. Please try again.");
    }
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
            {status === "generating" ? <div className="gira-tryon-progress"><LoaderCircle className="h-5 w-5 animate-spin" /><span>GENERATING YOUR LOOK...</span></div> : null}
          </div>
          <div className="gira-tryon-tabs" role="tablist" aria-label="Preview source"><button type="button" role="tab" aria-selected={activeView === "model"} onClick={() => selectView("model")}>MODEL</button><button type="button" role="tab" aria-selected={activeView === "upload"} onClick={() => selectView("upload")}>YOUR PHOTO</button></div>
          <p className="gira-tryon-summary">{activeView === "model" ? "No personal photo required / ご自身の写真は必要ありません" : "AI-powered personalized try-on / ご自身の写真を使用したAIバーチャル試着"}</p>
          {activeView === "model" ? <div className="gira-tryon-model-selector" aria-label="Choose a model">{virtualTryOnModels.map((model) => <button key={model.id} type="button" aria-pressed={selectedModel?.id === model.id} onClick={() => { setSelectedModelId(model.id); resetResult(); }}><img src={model.image} alt="" /><span>{model.name}</span></button>)}</div> : null}
          {status === "error" ? <div className="gira-tryon-error" role="alert"><p>{errorMessage}</p></div> : null}
          <div className="gira-tryon-actions">
            {activeView === "upload" ? <><Button type="button" variant="primary" className="gira-tryon-upload-button" onClick={() => inputRef.current?.click()}><ImagePlus className="h-4 w-4" /><span>{photoSrc ? "CHANGE PHOTO" : "UPLOAD PHOTO / USE YOUR PHOTO"}</span></Button><input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (file) selectPhoto(file); }} /><div className="gira-tryon-privacy"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><div><strong>{virtualTryOnPrivacy.english.title}</strong>{virtualTryOnPrivacy.english.paragraphs.map((text) => <p key={text}>{text}</p>)}<strong lang="ja">{virtualTryOnPrivacy.japanese.title}</strong>{virtualTryOnPrivacy.japanese.paragraphs.map((text) => <p key={text} lang="ja">{text}</p>)}</div></div></> : null}
            {!productImage ? <div className="gira-tryon-error"><p>A product reference image is not available.</p></div> : null}
            <Button type="button" variant="primary" className="gira-tryon-generate-button" disabled={!personImage || !productImage || status === "generating"} onClick={() => void generate()}>{status === "generating" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}<span>{status === "generating" ? "CREATING VIRTUAL TRY-ON..." : status === "error" ? "TRY AGAIN" : "GENERATE TRY-ON"}</span></Button>
            <div className="gira-tryon-inline-actions"><button type="button" className="gira-tryon-ghost-button" onClick={close}>CLOSE</button></div>
          </div>
        </div>
      </div>
    </div> : null}
  </>;
}
