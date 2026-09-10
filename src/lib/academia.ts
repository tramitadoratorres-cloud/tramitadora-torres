/** Un trámite "de visa" desbloquea Torres Academy para ese expediente. */
export function esTramiteVisa(nombreTramite?: string | null): boolean {
  if (!nombreTramite) return false;
  return /visa/i.test(nombreTramite);
}
