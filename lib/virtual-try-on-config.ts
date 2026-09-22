export type VirtualTryOnModel = { id: string; name: string; image: string };

export const virtualTryOnModels: VirtualTryOnModel[] = Array.from({ length: 11 }, (_, index) => {
  const number = index + 1;
  return { id: `model-${String(number).padStart(2, "0")}`, name: `Model ${String(number).padStart(2, "0")}`, image: `/virtual-tryon/models/model${number}.png` };
});

export const virtualTryOnPrivacy = {
  english: { title: "AI VIRTUAL TRY-ON", paragraphs: [
    "Your selected photo and the product image will be sent to an AI processing service to generate your virtual try-on.",
    "GIRA does not use your uploaded photo for purposes unrelated to the virtual try-on.",
    "The AI processing service may retain certain data for a limited period for service operation, safety, or related purposes.",
    "Please upload only photos of yourself or images you have permission to use.",
    "AI-generated results are visual simulations. Actual size, color, shape, lens tint, and fit may differ. Please refer to the original product images and information before purchase.",
  ] },
  japanese: { title: "AIバーチャル試着", paragraphs: [
    "この機能では、選択した写真と商品画像をAI処理サービスへ送信し、バーチャル試着イメージを生成します。",
    "GIRAでは、アップロードされたお客様の写真をバーチャル試着以外の目的で利用しません。",
    "AI処理サービス側では、サービス提供、安全管理その他の目的で、データが一定期間保持される場合があります。",
    "ご自身の写真、または使用する権利のある写真のみアップロードしてください。",
    "AIによる生成画像は試着イメージです。商品のサイズ、色、形状、レンズの濃さ、フィット感などは実物と完全に一致しない場合があります。購入時は実際の商品画像および商品情報をご確認ください。",
  ] },
} as const;

export const virtualTryOnInstruction = `Place only the reference sunglasses naturally on the person. Prioritize exact product fidelity: preserve the frame shape, proportions, thickness, color, lens shape, lens tint and darkness, bridge, temples, visible hardware, and overall silhouette. Preserve the person's identity, facial structure, skin tone, eyes, nose, lips, hairstyle, clothing, pose, and background. Use realistic placement and photorealistic lighting. Do not invent, redesign, or change anything except the sunglasses.`;
