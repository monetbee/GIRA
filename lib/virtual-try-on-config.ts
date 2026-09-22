export type VirtualTryOnModel = { id: string; name: string; image: string };

// Add/remove shared GIRA models here. Files live in public/virtual-tryon/models/.
export const virtualTryOnModels: VirtualTryOnModel[] = [
  { id: "model-01", name: "Model 01", image: "/virtual-tryon/models/model1.png" },
  { id: "model-02", name: "Model 02", image: "/virtual-tryon/models/model2.png" },
  { id: "model-03", name: "Model 03", image: "/virtual-tryon/models/model3.png" },
  { id: "model-04", name: "Model 04", image: "/virtual-tryon/models/model4.png" },
  { id: "model-05", name: "Model 05", image: "/virtual-tryon/models/model5.png" },
  { id: "model-06", name: "Model 06", image: "/virtual-tryon/models/model6.png" },
  { id: "model-07", name: "Model 07", image: "/virtual-tryon/models/model7.png" },
  { id: "model-08", name: "Model 08", image: "/virtual-tryon/models/model8.png" },
  { id: "model-09", name: "Model 09", image: "/virtual-tryon/models/model9.png" },
  { id: "model-10", name: "Model 10", image: "/virtual-tryon/models/model10.png" },
  { id: "model-11", name: "Model 11", image: "/virtual-tryon/models/model11.png" },
];

export const virtualTryOnPrivacy = {
  english: { title: "AI VIRTUAL TRY-ON", paragraphs: [
    "Your photo will be securely sent to our AI processing provider only to generate your virtual try-on.",
    "GIRA does not intend to permanently store your original uploaded photo. Processing and retention may also be subject to the AI provider's privacy and data retention policies.",
    "By continuing, you agree to the processing of your photo for this virtual try-on.",
  ] },
  japanese: { title: "AIバーチャル試着", paragraphs: [
    "アップロードされた写真は、バーチャル試着画像を生成するために、AI処理サービスへ安全に送信されます。",
    "GIRAでは、アップロードされた元の写真を恒久的に保存しない設計を予定しています。ただし、AI処理サービス側でのデータの取り扱いや保持期間については、利用するサービスのプライバシーポリシーが適用される場合があります。",
    "続行することで、バーチャル試着のために写真が処理されることに同意したものとみなされます。",
  ] },
} as const;

export const virtualTryOnInstruction = `Preserve the person's identity, face shape, hairstyle, skin tone, clothing, and background. Change only the sunglasses. Reproduce the reference product faithfully, including frame shape, thickness and color; lens shape, color and tint; bridge shape; temple design; proportions; and visible hardware or details. Do not invent or redesign the sunglasses.`;
