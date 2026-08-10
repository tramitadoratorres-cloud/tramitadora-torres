-- Quita el link de pago en línea de todos los trámites: Stripe todavía no
-- está configurado en producción, así que se desactiva el botón "Pagar en
-- línea" en todo el catálogo hasta que se configure. La transferencia y el
-- depósito en OXXO (manuales) siguen disponibles.
UPDATE "TramiteCatalogo" SET "linkPago" = '';
