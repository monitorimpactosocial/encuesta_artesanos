# Diccionario de captura - Boleta OCR/OMR Artesanos Isla Hermosa

Archivo PDF: `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`

## Proposito

Boleta de respaldo en papel, tamano oficio/legal y dos paginas completas, pensada para escaneo a 300 dpi y lectura OCR/OMR. La app web sigue siendo el canal principal; esta boleta sirve cuando se necesite operar sin tablet, hacer contingencia offline o digitar rapidamente desde formularios escaneados.

## Reglas de captura

- Las casillas se leen como OMR: una marca clara dentro del cuadrado.
- Los campos con linea se leen por OCR, pero deben validarse manualmente si son nombres, referencias o textos largos.
- Los importes y cantidades usan casillas numericas para reducir errores.
- Si la opcion es `OT`, siempre debe completarse el campo de detalle correspondiente.
- `C08=No` significa fin de encuesta: no se debe cargar informacion posterior como entrevista valida.
- `C09=No` no termina la encuesta: se releva potencial o interes artesanal del hogar mediante `A00/A00D`.
- `P04/P05` son ingresos solo por artesania. `P06/P07` son ingresos totales del hogar, incluyendo todas las fuentes.
- `R05/R06` registran formato e idioma preferido para recibir informacion sobre Paracel.

## Campos criticos para cruce con la app

| Campo | Uso |
|---|---|
| C01 | ID unico de boleta papel. |
| C02 | ID de vivienda/punto del mapa territorial. Permite vincular la encuesta con la vivienda asignada. |
| C04 | Encuestador/a responsable. |
| C06-C07 | Coordenadas de respaldo si fueron capturadas manualmente. |
| C08 | Consentimiento. Si es No, termina la entrevista. |
| C09 | Determina si se aplican preguntas artesanales completas o modulo de potencial. |
| H01 | Roster del hogar. Evita repetir conteos por sexo/edad porque se calculan desde integrantes. |
| P04-P09 | Variables principales para ingreso, dependencia y vulnerabilidad economica. |
| R04-R06 | Preferencias de comunicacion sobre Paracel. |
| Panel territorial | Controla duplicados, viviendas nuevas, acceso, fotos y referencia para mapa. |
| Panel OCR | Control de calidad antes de digitalizar o importar. |

## Codigos transversales

`S` Si, `N` No, `NS` No sabe / No responde, `OT` Otro, `NI` No informa.

Parentesco: `JH` jefe/a, `CO` conyuge, `HI` hijo/a, `PA` padre/madre, `HE` hermano/a, `NI` nieto/a, `AB` abuelo/a, `OP` otro pariente, `NP` no pariente, `OT` otro.

Discapacidad: `FIS` fisica/motriz, `VIS` visual, `AUD` auditiva, `INT` intelectual, `PSI` psicosocial/mental, `HAB` habla/comunicacion, `MUL` multiple, `OT` otra.

## Flujo sugerido de digitalizacion

1. Escanear lote por encuestador y ruta.
2. Nombrar archivo como `OCR_ARTESANOS_<fecha>_<encuestador>_<lote>.pdf`.
3. Extraer marcas OMR por coordenadas fijas del PDF.
4. Pasar OCR solo a campos de linea.
5. Validar manualmente los campos criticos: `C02`, `C08`, `C09`, `I01`, `H01`, importes y campos `OT`.
6. Importar a una hoja temporal y luego transformar a la estructura usada por la app.

## Nota de diseno

La boleta comprime el instrumento en codigos para que sea operativa en campo. Para capacitacion del equipo se recomienda entregar una hoja separada con el significado completo de codigos largos si el equipo no esta familiarizado con ellos.
