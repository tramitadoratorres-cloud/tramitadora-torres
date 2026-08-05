-- La cita de pasaporte del paquete "Pasaporte + visa" estaba mencionada como
-- paréntesis dentro de otra línea; se separa como opción propia, junto a
-- las citas de CAS y Consulado de la visa.
UPDATE "TramiteCatalogo"
SET "requisitos" = 'Cita de pasaporte (para tu pasaporte nuevo o renovación)
Cita en el CAS para la visa (toma de datos biométricos)
Cita en el Consulado Americano para la visa (si tu caso la requiere; en algunas renovaciones solo se necesita la cita en el CAS)'
WHERE "nombre" = 'Pasaporte + visa';
