import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPasaporte(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="12" y="5" width="24" height="38" rx="3" />
      <circle cx="24" cy="18" r="6.5" />
      <path d="M20.5 18a3.5 4.5 0 1 0 7 0 3.5 4.5 0 1 0 -7 0" opacity="0.6" />
      <line x1="17" y1="31" x2="31" y2="31" />
      <line x1="17" y1="36" x2="31" y2="36" />
    </svg>
  );
}

export function IconVisa(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="8" width="27" height="33" rx="2.5" />
      <line x1="11" y1="16" x2="26" y2="16" />
      <line x1="11" y1="21" x2="22" y2="21" />
      <line x1="11" y1="26" x2="24" y2="26" />
      <circle cx="33" cy="33" r="9" />
      <path d="M28.8 33 l3 3.2 l7-7.4" />
    </svg>
  );
}

export function IconSentri(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 29 l3-8a3 3 0 0 1 2.8-2h16.4a3 3 0 0 1 2.8 2l3 8" />
      <path d="M6 29h36v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2H12v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <circle cx="14" cy="29" r="2.6" />
      <circle cx="34" cy="29" r="2.6" />
      <line x1="4" y1="14" x2="12" y2="14" />
      <line x1="2" y1="19" x2="10" y2="19" />
      <line x1="4" y1="24" x2="9" y2="24" />
    </svg>
  );
}

export function IconPaquete(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="15" y="9" width="21" height="30" rx="2.5" />
      <line x1="19.5" y1="16" x2="31.5" y2="16" />
      <line x1="19.5" y1="21" x2="31.5" y2="21" />
      <rect x="7" y="15" width="18" height="26" rx="2.5" fill="var(--color-paper, #f7f1e3)" />
      <circle cx="16" cy="24" r="5" />
      <line x1="10.5" y1="34" x2="21.5" y2="34" />
    </svg>
  );
}

export function IconDocumento(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M13 5h15l7 7v29a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M28 5v7h7" />
      <line x1="15.5" y1="21" x2="30.5" y2="21" />
      <line x1="15.5" y1="26" x2="30.5" y2="26" />
      <circle cx="19" cy="35.5" r="4.2" />
      <path d="M16.3 38.8 L14.5 43.5 L19 41.3 L23.5 43.5 L21.7 38.8" />
    </svg>
  );
}

export const TRAMITE_ICONOS = {
  pasaporte: IconPasaporte,
  visa: IconVisa,
  sentri: IconSentri,
  paquete: IconPaquete,
  documento: IconDocumento,
} as const;

export type TramiteIconKey = keyof typeof TRAMITE_ICONOS;

export const TRAMITE_ICONO_OPCIONES: { value: TramiteIconKey; label: string }[] = [
  { value: "pasaporte", label: "Pasaporte" },
  { value: "visa", label: "Visa" },
  { value: "sentri", label: "SENTRI" },
  { value: "paquete", label: "Paquete / combo" },
  { value: "documento", label: "Documento genérico" },
];

export function TramiteIcon({
  icono,
  ...props
}: { icono: string } & SVGProps<SVGSVGElement>) {
  const Icon = TRAMITE_ICONOS[icono as TramiteIconKey] ?? IconDocumento;
  return <Icon {...props} />;
}
