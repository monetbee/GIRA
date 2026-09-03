type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-xl text-center" : "max-w-xl text-left"}>
      {eyebrow ? (
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-black tracking-[-0.06em] text-[#111111] sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-[#4b5563]">{description}</p> : null}
    </div>
  );
}
