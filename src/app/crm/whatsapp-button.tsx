export function WhatsAppButton({
  telefono,
  mensaje,
  label = "Enviar WhatsApp",
  className = "rounded bg-navy-900 px-3 py-2 font-mono text-xs text-cream transition hover:bg-navy-700",
  onClick,
}: {
  telefono: string;
  mensaje: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}) {
  const numeroLimpio = telefono.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      {label}
    </a>
  );
}
