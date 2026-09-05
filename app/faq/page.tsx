"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

const faqs = [
  {
    question: "SHIPPING",
    answer: "Shipping timelines vary by destination and order volume. We recommend checking your order confirmation for the most current delivery estimate before purchase.",
  },
  {
    question: "RETURNS",
    answer: "Return eligibility depends on product condition and the specific order details. Please review the terms provided at checkout or reach out to support for the latest policy.",
  },
  {
    question: "PRODUCT",
    answer: "Each GIRA frame is designed as a statement object, balancing material quality, silhouette, and everyday wearability. Product details and finish information are listed on each item page.",
  },
  {
    question: "LENSES / UV",
    answer: "Lens specifications vary by style and collection. For exact lens details, refer to the product page and available product attributes at the time of purchase.",
  },
  {
    question: "ORDERS",
    answer: "Order confirmations and shipping updates are sent by email when available. If you have a question about an order, contact support with your order number for the fastest assistance.",
  },
  {
    question: "PAYMENT",
    answer: "Payments are processed securely through the checkout flow. Accepted methods and payment details are shown during the final purchase step before completion.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="gira-faq-page">
      <Container className="gira-faq-container">
        <header className="gira-faq-header">
          <p className="gira-kicker gira-faq-kicker">FAQ</p>
          <h1>EVERYTHING<br />YOU MIGHT ASK.</h1>
        </header>

        <div className="gira-faq-list" aria-label="Frequently asked questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className={`gira-faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="gira-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="gira-faq-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="gira-faq-question">{faq.question}</span>
                  <span className="gira-faq-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen ? (
                  <div id={`faq-answer-${index}`} className="gira-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
