-- Actualiza los requisitos de los trámites de visa para desglosar las dos
-- citas (CAS y Consulado Americano), aclarando que en algunas renovaciones
-- solo se necesita la del CAS.
UPDATE "TramiteCatalogo"
SET "requisitos" = 'Pasaporte mexicano vigente
Comprobantes de arraigo: trabajo, estudios o propiedades
Formulario DS-160 (te ayudamos a llenarlo)
Cita en el CAS (toma de datos biométricos)
Cita en el Consulado Americano (si tu caso la requiere; en algunas renovaciones solo se necesita la cita en el CAS)'
WHERE "nombre" = 'Visa de turista B1/B2';

UPDATE "TramiteCatalogo"
SET "requisitos" = 'Todo lo del pasaporte nuevo o renovación (incluye tu cita de pasaporte)
Cita en el CAS para la visa (toma de datos biométricos)
Cita en el Consulado Americano para la visa (si tu caso la requiere; en algunas renovaciones solo se necesita la cita en el CAS)'
WHERE "nombre" = 'Pasaporte + visa';
