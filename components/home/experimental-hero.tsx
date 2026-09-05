"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function ExperimentalHero() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div
      className="gira-hero-visual-shell"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
        setOffset({ x, y });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      <div className="gira-visual-noise" aria-hidden="true" />
      <div className="gira-hero-visual-badge">Noir / 06</div>

      <div
        className="gira-hero-object"
        style={{ transform: `translate(${offset.x * 0.9}px, ${offset.y * 0.9}px)` }}
        aria-label="GIRA sunglasses object"
      >
        <div className="gira-hero-glass gira-hero-glass-left" aria-hidden="true" />
        <div className="gira-hero-glass gira-hero-glass-right" aria-hidden="true" />
        <div className="gira-hero-bridge" aria-hidden="true" />
        <div className="gira-hero-rail gira-hero-rail-left" aria-hidden="true" />
        <div className="gira-hero-rail gira-hero-rail-right" aria-hidden="true" />
      </div>

      <div className="gira-hero-side-panel">
        <span className="gira-side-number">01</span>
        <span className="gira-side-number">04</span>
        <div className="gira-side-divider" aria-hidden="true" />
        <div className="gira-side-copy">
          <p>NO SIGNAL</p>
          <strong>¥2,980</strong>
        </div>
        <button type="button" className="gira-side-button">View product <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>

      <div className="gira-hero-floating-label gira-hero-floating-label-top">Design object</div>
      <div className="gira-hero-floating-label gira-hero-floating-label-bottom">GIRA</div>
    </div>
  );
}
