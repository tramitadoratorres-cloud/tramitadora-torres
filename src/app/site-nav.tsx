"use client";

import { useState } from "react";
import Image from "next/image";
import { WHATSAPP_NUMERO } from "@/lib/constants";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-navy-900/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="#" className="flex items-center gap-2.5 font-serif text-xl font-bold text-cream">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-paper">
            <Image src="/assets/logo-mono.png" alt="" width={36} height={36} className="object-cover" />
          </span>
          Tramitadora Torres
        </a>
        <button
          className="text-2xl text-cream sm:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute inset-x-0 top-full flex-col gap-4 border-b border-cream/10 bg-navy-800 px-6 py-5 sm:static sm:flex sm:flex-row sm:items-center sm:gap-8 sm:border-none sm:bg-transparent sm:p-0`}
        >
          <a href="#tramites" className="text-sm text-cream-dim transition hover:text-gold-bright">
            Trámites
          </a>
          <a href="#como-funciona" className="text-sm text-cream-dim transition hover:text-gold-bright">
            Cómo funciona
          </a>
          <a href="#contacto" className="text-sm text-cream-dim transition hover:text-gold-bright">
            Contacto
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("Hola, quiero información sobre un trámite")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-gold px-5 py-2.5 font-mono text-sm font-semibold text-navy-900 transition hover:bg-gold-bright"
          >
            WhatsApp
          </a>
        </div>
      </nav>
    </header>
  );
}
