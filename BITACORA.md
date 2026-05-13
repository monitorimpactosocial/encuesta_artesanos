# Bitacora operativa - Encuesta Artesanos Isla Hermosa

## 2026-05-13 - Correccion de encabezados invisibles y solapamientos en boleta OCR

### Problema reportado
- En la boleta OCR algunos encabezados no salian o no se veian.
- En particular, la tabla `H01 Integrantes del hogar` mostraba la franja de encabezados sin textos visibles.
- Algunas preguntas quedaban muy cerca del bloque siguiente, con riesgo de solapamiento visual.

### Causa identificada
- En `tools/generate_ocr_form.py`, la tabla de integrantes pintaba el fondo gris del encabezado y luego dibujaba los textos sin restaurar el color negro; por eso los encabezados quedaban casi invisibles.
- El bloque de hogar era demasiado bajo para incluir tabla, leyenda, H02, H03, H04 y H05 con aire suficiente.
- El bloque de mapa ocupaba demasiado alto respecto del cierre del bloque de vivienda.

### Cambios aplicados
- Se restauro el color de texto `TEXT` antes de dibujar encabezados de tabla y leyendas.
- Se aumento la altura del bloque `2. Integrantes del hogar`.
- Se bajo el inicio del bloque `3. Vivienda, servicios y proteccion` para respetar el nuevo alto de hogar.
- Se compacto el panel de mapa territorial para evitar que tape o invada preguntas de vivienda.

### Verificacion
- Se regenero `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`.
- Se verifico con `PyPDF2`:
  - paginas: `2`;
  - pagina 1: `612.0 x 1008.0`;
  - pagina 2: `612.0 x 1008.0`.
- Se renderizaron vistas previas y se confirmo visualmente:
  - encabezados visibles en la tabla de integrantes;
  - H02, H03, H04 y H05 dentro del bloque de hogar;
  - vivienda sin invadir el mapa;
  - pagina 2 sin solapamientos visibles.

## 2026-05-13 - Boleta OCR con cuadritos alineados y mapa territorial impreso

### Pedido recibido
- Los cuadritos seguian desordenados.
- Se solicito usar letras mas chicas para agregar mas texto y dejar mas evidentes pedidos, notas y codigos.
- Se pidio reemplazar el croquis por un mapa de cuadras, manzanas y calles de Isla Hermosa.

### Cambios aplicados
- `tools/generate_ocr_form.py`:
  - Se achico la tipografia de etiquetas, codigos y opciones.
  - Se cambio la ubicacion de opciones a una grilla de columnas fijas, evitando que las casillas queden en posiciones irregulares segun el largo de cada texto.
  - Se redujo el tamano de casillas y se estabilizo el espaciado entre filas.
  - Se agregaron mas textos operativos dentro del PDF sin aumentar paginas.
- `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`:
  - Mantiene 2 paginas oficio/legal.
  - La pagina 1 incluye un mapa operativo impreso de Isla Hermosa / Isla Tuyu:
    - limite territorial desde `MapData.gs`;
    - 69 viviendas mapeadas desde `MapData.gs`;
    - caminos/calles obtenidos desde OpenStreetMap Overpass;
    - malla de referencia M1-M16 para manzanas/sectores operativos en papel;
    - notas para ubicar vivienda, calle o manzana.
  - Se reemplazo el area de croquis por el mapa territorial y un panel de control en campo.
- `FORMULARIO_OCR_ISLA_HERMOSA_ROADS_CACHE.json`:
  - Cache local de caminos/calles de OpenStreetMap para que el generador pueda funcionar sin depender siempre de internet.

### Verificacion
- Se regenero el PDF y se verifico con `PyPDF2`:
  - paginas: `2`;
  - pagina 1: `612.0 x 1008.0`;
  - pagina 2: `612.0 x 1008.0`;
  - tamano final aproximado: `34268` bytes.
- Se renderizo vista previa de ambas paginas.
- Se confirmo visualmente:
  - casillas mas alineadas;
  - textos y codigos mas pequenos pero legibles;
  - mapa territorial incorporado en pagina 1;
  - bloque de vivienda visible antes del mapa.

## 2026-05-13 - Redisenho visual de boleta OCR para impresion

### Pedido recibido
- El PDF OCR se veia desordenado y desalineado.
- Se pidio mejorar el diseno usando cuadros, bloques de preguntas, colores o escalas de grises considerando que sera impreso en papel.

### Cambios aplicados
- Se reconstruyo `tools/generate_ocr_form.py` con una composicion fija por bloques, en lugar de un flujo automatico de texto por columnas.
- `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf` mantiene 2 paginas oficio/legal, pero ahora usa:
  - bloques con borde fino y esquinas suaves;
  - encabezados en gris claro;
  - fondos muy suaves para separar secciones sin gastar tinta en exceso;
  - grilla de dos columnas alineadas;
  - casillas OMR mas regulares;
  - tablas y campos con espaciado mas estable;
  - paneles inferiores amplios para control territorial y control de calidad OCR.
- Se redistribuyo la pagina 2 para evitar que Produccion/Ventas se pise con Formalizacion/Ambiente.
- Se verifico que el bloque de Produccion incluya `P12 Otros canales venta` y `P13 Barreras comercializacion` dentro del bloque correspondiente.

### Verificacion
- Se regenero el PDF con `python tools\generate_ocr_form.py`.
- Se verifico con `PyPDF2`:
  - paginas: `2`;
  - pagina 1: `612.0 x 1008.0`;
  - pagina 2: `612.0 x 1008.0`.
- Se renderizaron vistas previas PNG de ambas paginas y se reviso visualmente:
  - pagina 1 con bloques claros para control, identificacion, hogar, vivienda y control territorial;
  - pagina 2 con bloques claros para actividad artesanal, produccion/ventas, formalizacion/ambiente, Paracel y control OCR.

## 2026-05-13 - Boleta OCR/OMR oficio para respaldo en papel

### Reconstruccion solicitada
- Se pidio usar dos paginas enteras tamano oficio y reconstruir el formulario para aprovechar mejor el espacio.
- Se rehizo la distribucion del PDF para que ya no quede como una boleta de una pagina demasiado comprimida.

### Cambios aplicados en la version de dos paginas
- `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf` ahora se genera en exactamente 2 paginas oficio/legal.
- Pagina 1:
  - Control, consentimiento, identificacion y ubicacion fija.
  - Integrantes del hogar con tabla ampliada hasta 10 filas.
  - Vivienda, servicios y proteccion.
  - Panel amplio de control territorial para vincular papel, mapa y app:
    - ID vivienda/punto mapa,
    - viviendas nuevas o duplicadas,
    - acceso/camino,
    - fotos de respaldo,
    - notas/croquis para digitacion.
- Pagina 2:
  - Actividad artesanal o potencial.
  - Produccion, ventas e ingresos.
  - Formalizacion, credito y ambiente.
  - Paracel, expectativas y cierre.
  - Panel amplio de control de calidad OCR/OMR antes de entregar:
    - consentimiento,
    - detalles de opciones `OT`,
    - importes,
    - separacion ingreso artesanal vs ingreso total,
    - formato/idioma Paracel,
    - revision por encuestador, supervisor y digitacion OCR.
- Se agrandaron casillas, lineas, encabezados y tabla de integrantes para mejorar lectura en campo y reconocimiento posterior.
- Se actualizo `FORMULARIO_OCR_OFICIO_ARTESANOS_DICCIONARIO.md` para documentar la version de dos paginas completas.

### Verificacion de la reconstruccion
- Se regenero el PDF con `tools/generate_ocr_form.py`.
- Se verifico con `PyPDF2`:
  - paginas: `2`;
  - pagina 1: `612.0 x 1008.0`;
  - pagina 2: `612.0 x 1008.0`.
- Se renderizaron vistas previas de ambas paginas y se confirmo visualmente que el espacio inferior se usa con paneles operativos utiles.

### Pedido recibido
- Evaluar y producir un documento PDF de una pagina tamano oficio, con maximo dos paginas si fuese necesario.
- Comprimir todas las preguntas y opciones de respuesta de forma inteligente para permitir OCR/OMR y digitalizacion rapida de encuestas en papel.

### Criterio aplicado
- Se diseno una boleta de respaldo en papel, no un reemplazo de la app web.
- La boleta prioriza lectura OMR para opciones cerradas mediante casillas y codigos cortos.
- Los campos abiertos quedan reducidos a lineas OCR solo cuando son inevitables: nombres, referencias, detalles de "Otro", observaciones y ubicaciones.
- Se preservan los cambios recientes del instrumento:
  - consentimiento informado bloqueante: si no acepta, fin de encuesta;
  - departamento fijo en Concepcion;
  - barrio/localidad operativo Isla Hermosa / Isla Tuyu;
  - fecha de nacimiento antes que edad, con marca de no recuerda/no declara;
  - roster del hogar para evitar repetir conteos por sexo y edad;
  - discapacidad con tipo especifico;
  - separacion entre ingreso solo por artesania e ingreso total del hogar;
  - personas que dependen del ingreso del hogar;
  - tiempo de extraccion o traslado de materia prima;
  - formato e idioma preferido para recibir informacion sobre Paracel;
  - flujo alternativo para hogares sin artesanos, relevando interes o potencial artesanal.

### Artefactos generados
- `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`
  - Formato: oficio/legal vertical.
  - Extension verificada: 1 pagina.
  - Tamano de pagina verificado: 612 x 1008 puntos, equivalente a 8.5 x 14 pulgadas.
  - Contiene control, consentimiento, identificacion, hogar, vivienda, actividad artesanal/potencial, ventas, ingresos, formalizacion, ambiente, Paracel y cierre.
- `FORMULARIO_OCR_OFICIO_ARTESANOS_DICCIONARIO.md`
  - Reglas de captura OCR/OMR.
  - Campos criticos para vincular papel con la app y el mapa territorial.
  - Codigos transversales para parentesco, discapacidad y opciones comunes.
  - Flujo sugerido de digitalizacion por lote.
- `tools/generate_ocr_form.py`
  - Generador reproducible del PDF y del diccionario.
  - Permite regenerar el formulario luego de cambios en el cuestionario.

### Verificacion
- Se genero el PDF localmente con `reportlab`.
- Se verifico con `PyPDF2`:
  - paginas: `1`;
  - pagina: `612.0 x 1008.0`;
  - archivo generado correctamente.
- Se renderizo una vista previa PNG para inspeccion visual; el archivo temporal quedo bloqueado por permisos de OneDrive al intentar eliminarlo, por lo que se mantiene fuera del control de versiones.

## 2026-05-12 - Mapa territorial: logistica y costeo con propuesta tecnica-economica

### Pedido recibido
- Mejorar la pestana con informacion logistica y de costeo.
- Incorporar la informacion de `Ing Cristina VillalbaPROPUESTA TECNICA ECONOMICA.PDF`.
- Permitir alterar costos por encuesta, cantidad de encuestadores, cantidad de guias locales, etc.

### Fuente revisada
- Archivo: `C:\Users\DiegoMeza\OneDrive - PARACEL S.A\MONITOREO_IMPACTO_SOCIAL_PARACEL\ENCUESTA_ARTESANOS_ISLA_HERMOSA\Ing Cristina VillalbaPROPUESTA TECNICA ECONOMICA.PDF`.
- El PDF esta escaneado; `PyPDF2` detecto 3 paginas pero sin texto extraible.
- Se renderizaron paginas a imagen para lectura visual.
- Datos economicos leidos de la propuesta:
  - Servicio encuestas: `Gs. 48.000` por ficha.
  - Movilidad: `Gs. 11.000` por ficha.
  - Viaticos: `Gs. 11.000` por ficha.
  - Total unitario: `Gs. 70.000`, IVA incluido.
  - Fecha de propuesta: Concepcion, `11/05/2026`.
- Alcance tecnico relevante:
  - recoleccion y digitacion de informacion social, economica y de percepcion;
  - fichas completas cargadas en enlace/aplicativo provisto;
  - informe final con actividades, comunidades/localidades visitadas y cantidad de viviendas/familias encuestadas;
  - equipo con experiencia territorial y disponibilidad de movilidad/equipos.

### Cambios aplicados
- `Client.html`, vista `Mapa territorial` / `Duracion estimada del relevamiento`:
  - Se agrego bloque `Costeo logistico editable`.
  - Valores base cargados desde la propuesta:
    - servicio por ficha `48000`,
    - movilidad por ficha `11000`,
    - viaticos por ficha `11000`.
  - Se permite simular:
    - encuestadores trabajando,
    - horas efectivas por dia,
    - duracion promedio de encuesta,
    - guias locales,
    - costo por guia/dia,
    - supervisores,
    - costo por supervisor/dia,
    - extra por encuestador/dia,
    - otros costos fijos.
  - Se agregaron KPIs:
    - costo unitario por ficha,
    - subtotal de fichas asignadas,
    - logistica adicional simulada,
    - costo total del escenario.
  - Se agrego tabla de rubros con formulas visibles:
    - servicio de encuestas,
    - movilidad,
    - viaticos,
    - guias locales,
    - supervision,
    - extra encuestadores,
    - otros fijos,
    - total y costo resultante por encuesta.
- `Styles.html`:
  - Estilo `inner-cost` para separar el bloque de costeo dentro del panel de tiempos/logistica.

### Verificacion local
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.
- `Styles.html` leido sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion y verificacion
- Se eliminaron las imagenes temporales generadas para leer el PDF escaneado.
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v36 - costeo logistico propuesta"`: version 36 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 36 -d "v36 - costeo logistico propuesta"`: deployment publico actualizado a `@36`.
- Verificacion viva por descarga HTML de `/exec`:
  - encontrado `Costeo logistico editable`.
  - encontrados valores base `48000` y `11000`.
  - encontrados `Guias locales`, `Servicio encuesta`, `Movilidad por ficha`, `Viaticos por ficha` y `costo total escenario`.

## 2026-05-11 - Roster de hogar: parentesco guiado, discapacidad clara y conteos derivados

### Pedido recibido
- `Parentesco` debe ser lista desplegable.
- `Disc. sí/no` no se entiende; mejorar la redaccion.
- No tiene sentido preguntar cantidad de mujeres en el hogar si antes ya se registro uno a uno a los integrantes, con sexo y edad.

### Cambios aplicados
- `Client.html`:
  - `parentesco` del roster pasa de campo libre a lista desplegable con opciones frecuentes: jefe/a de hogar, conyuge/pareja, hijo/a, padre/madre, hermano/a, nieto/a, otro pariente, no pariente, etc.
  - Botones de discapacidad del integrante cambian de `Disc. sí` / `No` a `Tiene discapacidad` / `Sin discapacidad`.
  - Se ocultan del formulario los campos redundantes `n_mujeres` y `n_hombres`, igual que ya se ocultaban los tramos de edad; siguen calculandose automaticamente desde el roster.
- `Seed.gs`:
  - `n_mujeres` y `n_hombres` quedan documentados como campos derivados automaticamente desde integrantes del hogar.

### Verificacion local
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.
- `Seed.gs`: `node --check --input-type=commonjs` sin errores.
- `Survey.gs`: `node --check --input-type=commonjs` sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion y verificacion
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v35 - roster parentesco discapacidad conteos"`: version 35 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 35 -d "v35 - roster parentesco discapacidad conteos"`: deployment publico actualizado a `@35`.
- Verificacion viva por descarga HTML de `/exec`:
  - encontrado `Tiene discapacidad`.
  - encontrado `Sin discapacidad`.
  - encontrado `Conyuge o pareja`.
  - encontrado `Jefe`.

## 2026-05-11 - Departamento fijo en Concepcion

### Pedido recibido
- El departamento no puede cambiar; debe establecerse en Concepcion.

### Cambios aplicados
- `Seed.gs`:
  - `departamento` pasa de botones a campo `locked`.
  - El catalogo `departamento` queda reducido a `Concepción`.
  - Texto de ayuda: departamento fijo del operativo, no modificar en campo.
- `Client.html`:
  - `seedDefaults_()` fuerza siempre `state.values.departamento = 'Concepción'`, incluso si venia otro valor en un borrador local.
  - `lockedDefault_()` devuelve `Concepción` para el campo bloqueado.
  - Al iniciar encuesta desde una vivienda del mapa tambien se fuerza `departamento = Concepción`.

### Verificacion local
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.
- `Seed.gs`: `node --check --input-type=commonjs` sin errores.
- `Survey.gs`: `node --check --input-type=commonjs` sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion y verificacion
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v34 - departamento fijo concepcion"`: version 34 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 34 -d "v34 - departamento fijo concepcion"`: deployment publico actualizado a `@34`.
- Verificacion viva con POST a `/exec` y `getSurveySchema`:
  - encontrado `field_name = departamento`.
  - encontrado `input_type = locked`.
  - encontrados textos `Departamento fijo`, `Concepci` y `locked` en el esquema publicado.

## 2026-05-11 - Fecha de nacimiento prioritaria y edad solo si no recuerda

### Pedido recibido
- Preguntar fecha de nacimiento.
- Si la persona no la declara o no la recuerda, entonces preguntar edad en años cumplidos.
- Registrar que la persona no recuerda/no declara su fecha de nacimiento.

### Cambios aplicados
- `Seed.gs`:
  - En identificacion, `fecha_nacimiento` pasa antes que edad.
  - Se agrega `fecha_nacimiento_no_recuerda`.
  - `edad` queda visible solo cuando `fecha_nacimiento_no_recuerda = Sí`.
  - El texto de ayuda aclara que primero se pregunta fecha y solo despues edad si no recuerda/no declara.
- `Client.html`:
  - Oculta `edad` de la persona entrevistada salvo que marque que no recuerda/no declara fecha de nacimiento.
  - La validacion exige fecha de nacimiento o marca `No recuerda/no declara`; si marca que no recuerda, exige edad en años cumplidos.
  - En integrantes del hogar se agrega boton `No recuerda fecha`; si se activa, la fecha se borra y la edad queda editable.
  - Si se informa fecha de nacimiento del integrante, la edad se calcula automaticamente y queda no editable.
- `Survey.gs`:
  - Si hay fecha de nacimiento y no hay edad manual, deriva `edad`.
  - Guarda `fecha_nacimiento_no_recuerda = SI/NO` segun corresponda.
  - `edad_grupo` se calcula con la edad derivada o declarada.

### Verificacion local
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.
- `Seed.gs`: `node --check --input-type=commonjs` sin errores.
- `Survey.gs`: `node --check --input-type=commonjs` sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion y verificacion
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v33 - fecha nacimiento prioritaria"`: version 33 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 33 -d "v33 - fecha nacimiento prioritaria"`: deployment publico actualizado a `@33`.
- Verificacion viva con POST a `/exec` y `getSurveySchema`:
  - encontrado `fecha_nacimiento_no_recuerda`.
  - encontrado `Fecha de nacimiento`.
  - encontrado `No recuerda o no declara`.
  - encontrado `edad` y ayuda `Completar solo cuando no recuerda`.

## 2026-05-11 - Consentimiento como fin obligatorio de encuesta

### Pedido recibido
- Si la persona no acepta participar de la encuesta, la encuesta debe terminar ahi y no puede continuar.

### Cambios aplicados
- `Client.html`:
  - Se agregaron `consentAccepted_()` y `consentBlocksSurvey_()`.
  - Si `consentimiento_informado` tiene cualquier valor distinto de `Sí`, el formulario:
    - muestra un bloque visible `Fin de la entrevista`,
    - oculta las preguntas posteriores al consentimiento,
    - deshabilita las secciones siguientes,
    - deshabilita el boton `Siguiente`,
    - deshabilita el boton `Enviar encuesta`,
    - muestra un modal flotante si se intenta avanzar/enviar sin consentimiento afirmativo.
  - Si hay un borrador con consentimiento no afirmativo, la vista vuelve a la seccion de control para evitar continuar desde secciones posteriores.
- `Seed.gs`:
  - Se reforzo el texto de ayuda de `consentimiento_informado`: si la respuesta no es `Sí`, la entrevista finaliza y no se continua.
- `Survey.gs`:
  - Se verifico que el backend ya bloquea el guardado cuando `require_consent = SI` y el consentimiento no es afirmativo.

### Verificacion local
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.
- `Seed.gs`: `node --check --input-type=commonjs` sin errores.
- `Survey.gs`: `node --check --input-type=commonjs` sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v32 - consentimiento bloquea continuidad"`: version 32 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 32 -d "v32 - consentimiento bloquea continuidad"`: deployment publico actualizado a `@32`.
- `npx clasp deployments`: confirma Web App publica en `@32 - v32 - consentimiento bloquea continuidad`.

## 2026-05-11 - Ajustes solicitados por direccion y equipo de campo: flujo artesanal, roster, UI movil y georreferencia

### Pedido recibido
- Distrito no debe cambiar durante la carga.
- Barrio/localidad debe venir predefinido para `ISLA HERMOSA / ISLA TUYU`.
- En `Agregar integrante`, agregar fecha de nacimiento y discapacidad/tipo de discapacidad.
- Evitar repetir preguntas; las edades por tramo de integrantes ya no deben cargarse manualmente.
- Preferir botones frente a listas desplegables.
- Aclarar diferencia entre ingreso total del hogar e ingreso por artesania.
- Al inicio relevar si hay alguien que realiza artesanias; si no hay, continuar la encuesta orientada a potenciales interesados.
- Aclarar que `Canal principal de ventas` corresponde a artesanias.
- Asegurar que las opciones `Otro/Otra` permitan detalle escrito.
- Agregar tiempo de extraccion de materia prima desde el lugar de origen.
- Mejorar mensajes emergentes y confirmacion visible de envio en tablets.
- Agregar botones para actualizar la app web e instalar acceso directo.
- Guardar datos geoespaciales de vivienda mapeada para uso offline.

### Cambios aplicados
- `Seed.gs`:
  - Se agrego `hogar_tiene_artesano` al inicio del control operativo.
  - `distrito` queda como campo bloqueado con valor operativo `Paso Barreto`.
  - `barrio_localidad` pasa a botones con catalogo `barrio_operativo`: `ISLA HERMOSA / ISLA TUYU`, `ISLA HERMOSA`, `ISLA TUYU`.
  - Se agregaron preguntas de potencial artesanal cuando el hogar no tiene artesanos actuales.
  - Se agrego `tipo_discapacidad_hogar` y detalle `tipo_discapacidad_hogar_otro`.
  - Se agrego `tiempo_extraccion_materia_prima`.
  - Se aclararon textos de ingresos: ingreso SOLO por artesania versus ingreso TOTAL del hogar.
  - Se aclaro que `principal_canal_venta` se refiere a la venta de artesanias.
  - `ensureQuestionnaireSeedCurrent_()` ahora tambien actualiza metadata existente, no solo agrega preguntas faltantes.
  - Se agrego invalidacion de cache `artesanos_schema_v3`.
- `Client.html`:
  - Roster de hogar ampliado: parentesco, sexo por botones, fecha de nacimiento, edad calculada, discapacidad si/no y tipo de discapacidad.
  - Se ocultan los campos manuales de edades por tramo; quedan como derivados calculados.
  - Si `hogar_tiene_artesano = No`, se ocultan bloques productivos/formalizacion/riesgos artesanales y se muestran preguntas de potencial.
  - Las listas cortas se renderizan como botones.
  - Las opciones `Otro/Otra` generan campo de detalle escrito automaticamente.
  - Mensajes de validacion y envio pasan a modal flotante visible en tablets.
  - Toasts duran 9 segundos.
  - Se agregaron botones `Actualizar app` e `Instalar acceso directo`.
  - El mapa territorial se cachea en `localStorage`; al iniciar encuesta desde vivienda, se guardan lat/lng, geojson y origen de georreferencia en el borrador.
- `Setup.gs`:
  - `RESPUESTAS` agrega columnas `vivienda_mapeada_geojson` y `vivienda_mapeada_georef_origen`.
  - Se agregan columnas de detalle `*_otro_detalle` para campos con catalogo/opcion `Otro/Otra`.
- `Survey.gs`:
  - Cache del esquema pasa a `artesanos_schema_v3`.
  - Derivacion de edades del roster puede calcular edad desde `fecha_nacimiento`.
  - La bandera de calidad por falta de tipo de artesania no aplica cuando el hogar declara que no hay artesanos.
- `Styles.html`:
  - Estilos para campos bloqueados, roster ampliado, botones compactos, detalle de `Otro/Otra` y modal flotante.

### Verificacion local
- `Seed.gs`: `node --check --input-type=commonjs` sin errores.
- `Survey.gs`: `node --check --input-type=commonjs` sin errores.
- `Setup.gs`: `node --check --input-type=commonjs` sin errores.
- Script de `Client.html` extraido desde `<script>`: `node --check --input-type=commonjs` sin errores.

### Pendiente inmediato
- Resuelto en esta misma pasada.

### Publicacion y verificacion
- `npx clasp push -f`: exitoso, 14 archivos subidos a Apps Script.
- `npx clasp version "v31 - ajustes direccion campo roster offline"`: version 31 creada.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 31 -d "v31 - ajustes direccion campo roster offline"`: deployment publico actualizado a `@31`.
- `npx clasp deployments`: confirma Web App publica en `@31 - v31 - ajustes direccion campo roster offline`.
- Verificacion viva con POST a `/exec` y `getSurveySchema`:
  - respuesta recibida con longitud `126033` caracteres.
  - encontrados `hogar_tiene_artesano`, `tipo_discapacidad_hogar`, `tiempo_extraccion_materia_prima`.
  - encontrados `barrio_operativo`, `potenciales_interesados_artesania`, `Canal principal de venta de las artesanias`.
  - encontrados `ingreso_artesania_mes_gs`, `Ingreso mensual aproximado SOLO por artesania`, `ingreso_total_hogar_mes_gs`.

## 2026-05-05 - Revision inicial de continuidad

### Contexto revisado
- Carpeta de trabajo: `ENCUESTA_ARTESANOS_ISLA_HERMOSA/encuesta_artesanos_app`.
- Repositorio local: rama `main`, limpio, sincronizado con `origin/main`.
- Ultimo commit: `1bf1d2f feat: super version - visible_if fix, photo compression, admin setup btn, full dashboard, all input types`.
- Remoto configurado: `https://github.com/monitorimpactosocial/encuesta_artesanos.git`.
- Documentacion existente antes de esta bitacora: `README.md` y `MANUAL_OPERATIVO_ARTESANOS.md`.
- No existia una bitacora formal en el paquete; se crea este archivo para continuidad operativa.

### Estado funcional observado
- Backend Apps Script preparado con archivos `Config.gs`, `Setup.gs`, `Auth.gs`, `Survey.gs`, `Admin.gs`, `Utils.gs`, `Seed.gs`, `App.gs`, `AppIndex.html`, `Client.html` y `Styles.html`.
- `Config.gs` contiene IDs reales por defecto para Google Sheet backend y carpeta Drive de fotos.
- `Setup.gs` incluye `runSetup()`, `setupBackend()`, `fixEverything()`, `syncQuestionnaireMetadata()` y reconstruccion de bases analiticas.
- `Auth.gs` siembra y hashea usuarios iniciales: `admin/123`, `diego/456`, `user/123`; deben cambiarse tras el despliegue.
- `Survey.gs` cubre esquema por metadata, GPS, fotos, derivados, flags de calidad, directorio y envio de respuestas.
- `Admin.gs` cubre dashboard, filtros, listado de respuestas, exportacion CSV y reconstruccion de `BASE_ANALITICA` y `RESPUESTAS_LONG`.
- `index.html` es una SPA standalone para GitHub Pages con `GAS_EXEC_URL` apuntando a una Web App real:
  `https://script.google.com/macros/s/AKfycbzXOgVnbp9-9b-_gWrUOc825jnHSXHugagq74tez8IOCI0_2qmPirR0dEQIBqDnO0IP/exec`.

### Hallazgos relevantes
- La raiz `ENCUESTA_ARTESANOS_ISLA_HERMOSA` no es repo Git; el repo esta dentro de `encuesta_artesanos_app`.
- No hay `.clasp.json` local, solo `.clasp.example.json` con placeholder `PEGAR_SCRIPT_ID_DEL_PROYECTO_APPS_SCRIPT`; por tanto no se pudo confirmar desde el paquete local cual es el proyecto Apps Script vinculado.
- El ultimo commit `1bf1d2f` modifico solamente `index.html`, no `Client.html`.
- Apps Script sirve `AppIndex.html`, que a su vez incluye `Client.html`; por lo tanto las mejoras de la super version pueden estar disponibles en GitHub Pages/standalone, pero no necesariamente en la Web App nativa de Apps Script si `Client.html` no fue actualizado o desplegado con los mismos cambios.
- El panel admin de `index.html` muestra una accion de "Inicializar / Reparar sistema", pero internamente llama a `syncQuestionnaireMetadata()`, no a `runSetup()` ni `setupBackend()`. Eso sirve si las hojas base y usuarios ya existen; no reemplaza una primera inicializacion completa desde el editor Apps Script.
- Hay mojibake visible en varios textos versionados (`AplicaciÃ³n`, `ContraseÃ±a`, etc.). Debe corregirse antes de usar la interfaz en campo o compartir documentacion.

### Riesgos / pendientes de verificacion
- Confirmar si la Web App real asociada al `GAS_EXEC_URL` tiene desplegados los archivos `.gs` y `.html` actuales.
- Confirmar si `runSetup()` ya fue ejecutado contra el Sheet `1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40`.
- Probar login real con `admin/123` o `diego/456` solo en entorno controlado, y luego forzar cambio de credenciales.
- Probar envio real de una encuesta con consentimiento, GPS y una foto comprimida.
- Probar dashboard, listado de respuestas, exportacion CSV y reconstruccion analitica luego de cargar al menos una respuesta de prueba.
- Decidir si la version principal sera:
  1. GitHub Pages standalone consumiendo `doPost` por fetch a `GAS_EXEC_URL`, o
  2. Apps Script nativo con `google.script.run`.
- Si se mantiene Apps Script nativo, hay que portar la super version de `index.html` a `Client.html`/`Styles.html` o asegurar que `Client.html` tenga paridad funcional.

### Proximos pasos recomendados
1. Corregir mojibake en documentacion e interfaz (`README.md`, `MANUAL_OPERATIVO_ARTESANOS.md`, `Config.gs`, `App.gs`, `Client.html`, `index.html` y textos semilla).
2. Definir el canal operativo principal: GitHub Pages standalone o Web App nativa de Apps Script.
3. Si se usara Apps Script nativo, sincronizar `Client.html` con las mejoras ya aplicadas en `index.html`.
4. Crear `.clasp.json` con el `scriptId` real o confirmar manualmente el proyecto Apps Script abierto desde el Sheet.
5. Ejecutar `runSetup()` desde Apps Script para primera inicializacion completa, o `fixEverything()` si ya existen hojas pero se requiere reparacion.
6. Desplegar nueva version de Apps Script y registrar en esta bitacora: URL `/exec`, deployment ID, version y fecha.
7. Hacer QA end-to-end: bootstrap, login, formulario, visibilidad condicional, roster de hogar, GPS, foto, envio, auditoria, dashboard, respuestas, CSV y bases analiticas.
8. Cambiar credenciales iniciales y registrar solo el hecho del cambio, nunca las contrasenas nuevas.

### Resultado de esta pasada
- Bitacora creada.
- Estado local y repo contrastados.
- Proximos pasos documentados para retomar sin perder contexto.

## 2026-05-05 - Incidente: app web no admite login

### Reporte recibido
- El usuario informa que la app web no funciona y todavia no admite login.

### Hipotesis iniciales a verificar
- Diferencia entre `index.html` standalone y `Client.html` servido por Apps Script.
- Posible fallo de comunicacion del wrapper GitHub Pages con `doPost` de Apps Script.
- Posible backend no inicializado: hoja `USUARIOS` ausente, vacia o no hasheada.
- Posible Web App desplegada con version anterior a los cambios locales.
- Posible problema de serializacion/respuesta del login entre Apps Script y cliente.

### Diagnostico aplicado
- Se confirmo que `index.html` usa `fetch()` contra `GAS_EXEC_URL`; ese camino es fragil para login desde GitHub Pages porque depende de comunicacion cross-origin con Apps Script.
- Se confirmo que la Web App nativa de Apps Script usa `Client.html` con `google.script.run`, que es el canal mas confiable para login y sesiones.
- Se confirmo que `login()` solo ejecutaba `hashSeedUsers_()`; si la hoja `USUARIOS` estaba vacia o no inicializada, no creaba los usuarios iniciales.

### Correcciones locales realizadas
- `Auth.gs`: se agrego `ensureAuthReady_()` para asegurar cabeceras de `USUARIOS` y `AUDITORIA`, sembrar usuarios iniciales si no existen y hashear temporales antes de validar login.
- `Auth.gs`: `login()` ahora llama a `ensureAuthReady_()` antes de buscar el usuario.
- `index.html`: cuando se sirve desde GitHub Pages (`*.github.io`), ahora muestra la Web App nativa de Apps Script embebida en un iframe y ofrece boton para abrirla en pestana nueva. Esto evita depender de `fetch()` cross-origin para login.

### Verificacion local
- `index.html`: validacion sintactica del JavaScript embebido con `node --check` por stdin, sin errores.
- `Auth.gs`: validacion sintactica por stdin con `node --check`, sin errores.

### Pendiente para liberar
- Subir cambios al repositorio y desplegar/actualizar Apps Script con `Auth.gs`.
- Confirmar que la URL de Web App usada por `GAS_EXEC_URL` sigue vigente.
- Probar login real despues del deploy con usuarios seed controlados y cambiar credenciales iniciales.

## 2026-05-05 - Commit y push de correcciones; estado actual del repo

### Acciones ejecutadas
- Verificado que los archivos `.gs` y `Client.html` locales no tienen mojibake (codificacion UTF-8 correcta en los archivos actuales).
- Commiteados y pusheados a `origin/main` los tres archivos pendientes: `Auth.gs`, `index.html`, `BITACORA.md`.
  - Commit: `a8b9d5b fix: login robusto + GitHub Pages con iframe embebido`
  - Push exitoso a `https://github.com/monitorimpactosocial/encuesta_artesanos.git`

### Estado del repo tras esta sesion
- Rama `main` limpia y sincronizada con `origin/main`.
- Ultimo commit: `a8b9d5b`.

### Pendientes criticos restantes (en orden de prioridad)
1. **Deploy Apps Script** — Abrir el proyecto Apps Script vinculado al Sheet `1bNA0oHXbQEU0WkVqsa-iKefXHRdWwQNiE7MvEazPq40`, copiar el contenido actualizado de `Auth.gs` y publicar nueva version de Web App. Registrar el deployment ID y URL `/exec` aqui.
2. **Verificar GAS_EXEC_URL** — Confirmar que `https://script.google.com/macros/s/AKfycbzXOgVnbp9-9b-_gWrUOc825jnHSXHugagq74tez8IOCI0_2qmPirR0dEQIBqDnO0IP/exec` sigue activa y corresponde al proyecto correcto.
3. **Probar login** — Con `admin/123` o `diego/456` en la Web App nativa (no en GitHub Pages standalone).
4. **Cambiar credenciales** — Inmediatamente despues de confirmar el login. Registrar solo el hecho, nunca las nuevas contrasenas.
5. **Parity Client.html / index.html** — Evaluar si se requiere portar mejoras adicionales (visible_if avanzado, compresion de fotos, etc.) a `Client.html`.
6. **QA end-to-end** — Formulario completo, GPS, foto, envio, dashboard, listado, CSV y reconstruccion analitica.

## 2026-05-05 - Deploy completo del nuevo proyecto Apps Script standalone

### Acciones ejecutadas
- Diagnostico del Sheet: CONFIG/USUARIOS/CUESTIONARIO/CATALOGOS vacios; RESPUESTAS con esquema incorrecto (de encuesta colaboradores).
- `clasp` autenticado como `monitorimpactosocial@gmail.com` (token activo en `.clasprc.json`).
- Proyecto Apps Script standalone creado con `clasp create`:
  - Script ID: `13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov`
  - URL editor: `https://script.google.com/d/13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov/edit`
- `clasp push` exitoso: 13 archivos subidos (todos los `.gs`, `.html` y `appsscript.json`).
- `appsscript.json` actualizado con `webapp` (ANYONE_ANONYMOUS, USER_DEPLOYING) y `executionApi`, timezone America/Asuncion, oauthScopes correctos.
- Web App desplegada via Apps Script API:
  - Deployment ID: `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk`
  - URL `/exec`: `https://script.google.com/macros/s/AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk/exec`
  - Version activa: 3 (version de produccion sin funciones de setup expuestas)
- `index.html`: `GAS_EXEC_URL` actualizado a la nueva URL.
- `.clasp.json` creado con el script ID real (reemplaza `.clasp.example.json`).

### Bloqueante pendiente (una accion manual del usuario)
La Web App muestra "Authorization needed" porque el propietario (`monitorimpactosocial@gmail.com`) aun no ha autorizado los scopes del nuevo proyecto (Sheets, Drive). La Execution API remota fue bloqueada (403) porque el token de clasp no incluye los scopes de ejecucion del script.

**Accion requerida: ejecutar `runSetup()` desde el editor del nuevo proyecto**
1. Abrir: `https://script.google.com/d/13Ex164UGgCecVYV8CrX80-FndLRmr5jjFlulpYt__iysrSePt3qYRAov/edit`
2. Seleccionar funcion `runSetup` en el dropdown.
3. Hacer clic en "Ejecutar".
4. Autorizar los permisos solicitados (Sheets + Drive) cuando aparezca el dialogo.
5. Confirmar que el log muestra `{ ok: true, spreadsheetId: ... }`.

Esto inicializa el Sheet (CONFIG, EDICIONES, USUARIOS, CUESTIONARIO, CATALOGOS, RESPUESTAS correcto) y autoriza el proyecto para que la Web App funcione sin la pantalla de autorizacion.

### Proximos pasos tras la ejecucion de runSetup()
1. Probar login en la Web App: `admin/123` y `diego/456`.
2. Cambiar contrasenas iniciales.
3. QA end-to-end del formulario.

## 2026-05-08 — Estado actual: tablero sin funcionar / problema por resolver

### Resumen ejecutivo
Después de múltiples sesiones de corrección (2026-05-06 al 2026-05-08), la Web App GAS está en **v15** pero el tablero gerencial sigue sin cargar. El origen del problema fue una regresión introducida en v13 que rompió completamente `google.script.run`, y aunque fue corregida en v14, quedaron efectos secundarios: usuarios sin credenciales válidas y comportamiento indeterminado del tablero. Esta entrada documenta el estado exacto para retomar sin perder contexto.

---

### Cronología de cambios realizados (2026-05-06 al 2026-05-08)

#### Funcionalidades añadidas (GitHub + GAS)
| Versión GAS | Commit GitHub | Descripción |
|-------------|---------------|-------------|
| v8–v9 | `e62ebac`–`8179be8` | Modo offline PWA, mapa Leaflet, cola offline |
| v10 | `350b2fc` | Grabación de audio, columnas `audio_url` / `audio_duration_sec` en RESPUESTAS |
| v11 | `9410796` | Resiliencia, seguridad, UX |
| v11 | `c362e6d` | SW cache v2 para forzar descarga de `index.html` |
| v11 | `825ec1a` | SW cache v4 |

#### Correcciones de infraestructura (GAS solamente, no commiteadas a GitHub)
| Versión GAS | Descripción |
|-------------|-------------|
| v12 | `Client.html`: estado de error (`dashboardError`, `responsesError`) para que el tablero muestre error en lugar de spinner eterno. `callServer` original: spread operator. |
| **v13 ← REGRESIÓN CRÍTICA** | `callServer` reescrito con `.apply(null, args)` → rompe `this` binding de `google.script.run` → **todas las llamadas al servidor dejan de funcionar silenciosamente**: login, schema, dashboard, todo. |
| v14 | `callServer` corregido: `runner[fn].apply(runner, args)` preserva `this` correctamente. `render()` con try-catch alrededor de `view_()`. Dashboard pre-cargado en background durante `init()` y `doLogin_()`. |
| v15 | `Seed.gs`: usuarios Paracel (`diego.meza/123456`, `lati/123456`, `encuestador/123456`, `viewer/123456`). Login form: botón **"Restablecer usuarios"** que llama `resetUsers()` sin autenticación (para bootstrap de emergencia). |
| v15 | Leaflet SRI hash eliminado de `index.html` (hash no coincidía con contenido servido por unpkg). SW cache v5. |

---

### Estado del repositorio al 2026-05-08

| Canal | Estado |
|-------|--------|
| GitHub Pages (`index.html`) | Último commit `b78dd85`; funcional salvo que el tablero de `index.html` usa `fetch()` → GAS `doPost`, que está separado del canal GAS nativo. |
| GAS Web App | Deployment v15, ID `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk` |
| Sheet USUARIOS | Tiene usuarios `admin` y `user` con hashes de claves anteriores. Los nuevos usuarios (`diego.meza`, etc.) NO fueron escritos aún porque `resetUsers()` requiere que el usuario haga clic en el botón de la app. |
| Código GAS (`Client.html`, `Seed.gs`) | Pusheado vía clasp a v15 pero **NO commiteado a GitHub** — hay divergencia entre repo y GAS. |

---

### Problema pendiente: tablero no carga y login bloqueado

#### Síntoma observado
- En modo incógnito (sin caché): la app carga el skeleton pero el tablero queda en "Cargando dashboard..." o directamente no responde al login.
- El login parece no hacer nada o fallar silenciosamente.

#### Causa raíz confirmada (v13)
La función `callServer` en v13 usó `.apply(null, args)` como argumento de `this`, lo que rompió el proxy interno de `google.script.run`. Los métodos de ese proxy dependen de que `this` sea el objeto runner para enrutar la llamada al servidor. Con `this = null` el proxy falla silenciosamente: ni llama al success handler ni al failure handler. Resultado: cada `await callServer(...)` colgaba hasta el timeout de 60s sin dar ninguna respuesta.

#### Estado post-v14 / v15
El `callServer` está corregido con `runner[fn].apply(runner, args)`. Sin embargo, persisten dos incógnitas:

1. **Credenciales inválidas**: La hoja USUARIOS todavía tiene los hashes de `admin/paracel2026` y `user/123`. Los nuevos usuarios (`diego.meza/123456`) no existen hasta que se ejecute `resetUsers()`. Si el usuario intenta login con `diego.meza / 123456` sobre los datos actuales del sheet, fallará con "Usuario no encontrado."

2. **Posible caché GAS stale**: Múltiples deploys rápidos (v12→v13→v14→v15 en < 2 horas) pueden dejar la infraestructura de Google sirviendo una versión intermedia. El navegador del usuario podría estar cacheando una respuesta de GAS desactualizada incluso en incógnito (la caché de red de GAS es server-side, no de navegador).

3. **Posible necesidad de re-autorización**: Después de tantos push/deploy, si el token de autorización OAuth del script `monitorimpactosocial@gmail.com` expiró o fue revocado, la Web App mostraría una pantalla de autorización antes de cargar el HTML. El usuario podría estar viendo esa pantalla en vez de la app.

---

### Plan de diagnóstico y corrección

#### Paso 1 — Verificar que la Web App carga correctamente
Abrir en incógnito: `https://script.google.com/macros/s/AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk/exec`

- **Si aparece pantalla "Se necesita autorización"**: El propietario (`monitorimpactosocial@gmail.com`) debe abrir el editor GAS y ejecutar cualquier función para re-autorizar.
- **Si aparece skeleton "Cargando aplicativo..."** y luego error: el `init()` falló; ver mensaje de error en pantalla.
- **Si carga correctamente con sidebar y home page**: ir al Paso 2.

#### Paso 2 — Resetear usuarios
En el formulario de login, hacer clic en **"Restablecer usuarios"** (botón agregado en v15) y confirmar el diálogo. Debe aparecer toast: *"Usuarios restablecidos (4 usuarios). Ingrese con diego.meza / 123456"*.

Si ese botón no aparece o el toast no llega, hay un problema con `callServer` aún activo → revisar consola del navegador.

#### Paso 3 — Login
Ingresar `diego.meza` / `123456`. Tras login exitoso, el dashboard se pre-carga automáticamente en background.

#### Paso 4 — Si el tablero sigue sin cargar
Abrir consola del navegador (F12 → Console) y reportar cualquier error JavaScript. Los errores más probables serían:
- `TypeError: runner[fn] is not a function` → función no existe en GAS
- `Error: Sin respuesta del servidor (getDashboardSummary)` → timeout de 60s agotado, posiblemente la función tarda demasiado o GAS está bloqueado

#### Paso 5 — Sincronizar código con GitHub
Los archivos `Client.html` y `Seed.gs` tienen cambios de v12–v15 que no fueron commiteados. Una vez confirmado que v15 funciona, commitear y pushear para mantener paridad repo ↔ GAS.

---

### Deuda técnica identificada en esta sesión

| # | Descripción | Riesgo |
|---|-------------|--------|
| 1 | `Client.html` / `Seed.gs` no commiteados a GitHub desde v11 | Alto: divergencia silenciosa |
| 2 | `asNumber_()` en `Utils.gs` elimina el punto (separador de miles) pero rompe decimales reales (ej: `6.7` → `67`). Afecta cálculo de duración promedio en dashboard. | Bajo (solo KPI cosmético) |
| 3 | No hay flujo de "cambiar contraseña" en `Client.html` | Medio: usuarios no pueden rotar su clave desde la UI |
| 4 | `resetUsers()` es llamable sin autenticación desde `google.script.run` | Bajo: solo posible si alguien conoce la URL del script |
| 5 | `SESSION_HOURS: 12` en `Config.gs` — sesiones expiran a las 12hs; al recargar la página hay que loguearse de nuevo aunque el día de trabajo no terminó | Bajo: molestia operativa |

---

## 2026-05-05 - Correcciones de formulario + Deploy v4

### Problemas reportados y corregidos
1. **Oficio o especialidad principal** — cambiado de `text` a `select` con catalogo `oficio_artesanal` (16 especialidades + Otro). Se agrego campo `oficio_principal_otro` visible solo cuando se selecciona "Otro".
2. **Materia prima principal → Otro** — agregado campo `materia_prima_principal_otro` visible solo cuando `materia_prima_principal = Otro`.
3. **GPS no funciona** — el iframe de GitHub Pages no tenia el atributo `allow="geolocation"`. Corregido en `index.html`.
4. **No se puede enviar sin GPS** — `gps_encuesta` tenia `required:true`. Cambiado a `required:false` con texto de ayuda explicativo.

### Archivos modificados
- `Seed.gs`: catalogo `oficio_artesanal` agregado, campos nuevos `oficio_principal_otro` y `materia_prima_principal_otro`, `gps_encuesta` no requerido.
- `index.html`: iframe con `allow="geolocation"`.

### Deploy
- clasp push: 13 archivos, exitoso.
- Version Apps Script: **v4** (creada `2026-05-05T14:22:31Z`).
- Deployment actualizado: mismo ID y URL `/exec` de siempre.
- Commit GitHub: `5e5f408 feat: oficio dropdown con Otro, materia prima otro, GPS iframe + deploy v4`.

### Accion requerida por el usuario
Despues de hacer login en la Web App, ir al panel Admin y ejecutar **"Sincronizar cuestionario"** (llama a `syncQuestionnaireMetadata()`). Esto re-siembra las hojas CUESTIONARIO y CATALOGOS con los nuevos campos y el catalogo `oficio_artesanal`.

### Pendientes
- Ejecutar `runSetup()` desde el editor Apps Script si aun no se hizo (autoriza OAuth).
- Probar login, luego sincronizar cuestionario, luego QA del formulario completo.
- Cambiar credenciales iniciales.

## 2026-05-08 - Login bloqueado: solucion sin depender del boton reset

### Diagnostico retomado
- Se estudio la bitacora vigente y se confirmo que el problema mas probable es la hoja `USUARIOS` con usuarios antiguos (`admin`/`user`) y sin los usuarios Paracel agregados en `Seed.gs`.
- El deployment publico vigente sigue siendo `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @15 - v15 - usuarios Paracel (diego.meza/123456), boton resetear en login`.
- `Client.html` local contiene la correccion de `callServer`: `runner[fn].apply(runner, args)`, por lo que el bug de v13 (`apply(null, args)`) no esta presente en el codigo versionado actual.
- `Client.html` local contiene el boton `Restablecer usuarios`, y `Seed.gs` contiene `resetUsers()` con los cuatro usuarios Paracel: `diego.meza`, `lati`, `encuestador`, `viewer`.

### Verificacion ejecutada
- `npx clasp deployments` confirmo 2 deployments: `@HEAD` y el deployment publico `@15`.
- Se intento ejecutar `npx clasp run resetUsers` para reparar directamente la hoja, pero Google respondio: `Unable to run script function. Please make sure you have permission to run the script function.`
- Por lo tanto no fue posible actualizar la hoja `USUARIOS` desde la terminal en esta pasada.

### Correccion aplicada localmente
- `Seed.gs`: se agrego `ensureDefaultUsers_()`.
  - Asegura cabeceras de `USUARIOS`.
  - Lee los usuarios existentes.
  - Agrega solamente los usuarios Paracel faltantes.
  - No borra ni sobreescribe usuarios existentes.
  - Hashea las contrasenas temporales agregadas.
- `Auth.gs`: `ensureAuthReady_()` ahora llama a `ensureDefaultUsers_()` cuando la hoja ya tiene usuarios. Esto corrige el caso donde `USUARIOS` no esta vacia, pero le faltan los usuarios nuevos.

### Resultado esperado
- Tras desplegar esta correccion en GAS, el primer intento de login o bootstrap de autenticacion debe agregar automaticamente `diego.meza / 123456` si falta en `USUARIOS`.
- El boton `Restablecer usuarios` queda como plan B, ya no como requisito principal.

### Validacion local
- `Auth.gs` y `Seed.gs` fueron validados sintacticamente con `node --check` por stdin, sin errores.

### Pendiente inmediato
1. Ejecutar `npx clasp push -f`.
2. Crear nueva version GAS y actualizar el deployment publico.
3. Probar `/exec` en incognito.
4. Ingresar con `diego.meza / 123456`.
5. Si aun no responde, abrir consola del navegador y distinguir entre cache stale de GAS, pantalla OAuth o timeout de servidor.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 13 archivos subidos a Apps Script.
- `npx clasp version "v16 - autoagregar usuarios Paracel faltantes en login"`: creada version 16.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 16`: deployment publico actualizado a `@16`.
- `npx clasp deployments`: confirma deployment publico `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @16 - v16 - autoagregar usuarios Paracel faltantes en login`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publica ya sirve una version que no depende de que la hoja `USUARIOS` este vacia ni del boton `Restablecer usuarios`.
- En el primer flujo de autenticacion, si faltan los usuarios Paracel, el backend debe agregarlos automaticamente y hashear sus claves temporales.
- Siguiente prueba funcional recomendada: abrir `/exec` en incognito e ingresar `diego.meza / 123456`. Si no entra, revisar consola F12 y capturar el error exacto.

## 2026-05-08 - Correccion foco tablero: carga de datos y serializacion GAS

### Reporte recibido
- El problema no es el logueo sino la carga de datos al tablero.
- La consola del navegador muestra principalmente advertencias del contenedor Google (`Unrecognized feature`, favicon 404, password fuera de `form`) y cambios de estado `warden` BUSY/IDLE, sin un error JavaScript claro de la app.

### Diagnostico aplicado
- Se reviso `Client.html`: el tablero llama `getDashboardSummary(sessionToken, filters)` y queda mostrando `Cargando dashboard...` si no recibe una respuesta util.
- Se reviso `Admin.gs`: `getDashboardSummary()` leia toda la hoja `RESPUESTAS` con `getRowsAsObjects_()` y devolvia `rowsPreview` con valores crudos de Sheets.
- Riesgo probable identificado: si `fecha_encuesta`, `submission_ts` u otros campos llegan como objetos `Date`, `google.script.run` puede fallar al serializar la respuesta aunque la funcion haya calculado los KPIs. Esto afecta especialmente a `rowsPreview` y `listResponses()`.
- Riesgo adicional: lectura completa de `RESPUESTAS` puede ser lenta o inestable si la hoja conserva muchas filas/columnas.

### Correcciones locales aplicadas
- `Utils.gs`:
  - Agregado `getRowsAsObjectsLimited_(sheetName, maxRows)` para leer solo una ventana controlada de filas recientes.
  - Agregado `clientValue_(value)` para convertir `Date` a ISO string y objetos a JSON antes de devolverlos al cliente.
  - Corregido `asNumber_()` para no transformar decimales con punto (`6.7`) en `67`.
- `Admin.gs`:
  - `getDashboardSummary()` ahora usa `dashboard_row_limit` con tope duro de 20.000 filas.
  - `rowsPreview` pasa por `clientValue_()` campo por campo.
  - La respuesta incluye `meta.loadedRows`, `meta.rowLimit` y `meta.limited`.
  - `listResponses()` tambien usa lectura limitada y sanitizacion de filas publicas.
- `Client.html`:
  - El tablero muestra una nota si la vista esta limitada por rendimiento.
  - `loadDashboard_()` fuerza render de estado de carga cuando el usuario entra al tablero.

### Validacion local
- `Admin.gs`, `Utils.gs` y el script embebido en `Client.html` pasaron `node --check` por stdin sin errores.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS con descripcion de fix de tablero.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200 y confirmar `npx clasp deployments`.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 13 archivos subidos.
- `npx clasp version "v18 - corregir carga tablero y serializacion de fechas"`: creada version 18.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 18`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @18 - v18 - corregir carga tablero y serializacion de fechas`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- El tablero ya no devuelve fechas/objetos crudos desde `rowsPreview`, reduciendo el riesgo de falla de serializacion en `google.script.run`.
- La lectura del tablero queda limitada por `dashboard_row_limit` para evitar esperas largas por hojas grandes.
- Si el tablero aun no carga en navegador, el siguiente dato necesario es el mensaje visible dentro de la tarjeta `Error al cargar el dashboard` o el error exacto tras esperar el timeout de la llamada.

## 2026-05-08 - Nueva vista: mapa territorial Isla Hermosa / Isla Tuyu

### Pedido recibido
- Crear una vista de mapa preciso del lugar `Isla Hermosa`, antes `Isla Tuyu`, para planificar la encuesta con una idea previa de viviendas existentes, distancias, caminos, cantidad de viviendas y personas.
- Fuentes locales indicadas:
  - `G:\Mi unidad\MAPEO_COMUNIDADES_INDIGENAS`
  - `G:\Mi unidad\CONCEPCION_AMAMBAY_GEODEMOGSOCIAL`

### Exploracion de fuentes
- En `CONCEPCION_AMAMBAY_GEODEMOGSOCIAL\concepcion_amambay_geodemogsocial\public\concepcion_amambay_barrios.geojson` se encontro `ISLA TUYU`, distrito `PASO BARRETO`, departamento `CONCEPCION`, `BAR_LOC=420`.
- En `CONCEPCION_AMAMBAY_GEODEMOGSOCIAL\concepcion_amambay_geodemogsocial\public\viviendas_concepcion.geojson` se encontraron 69 puntos de vivienda para `ISLA TUYU / PASO BARRETO`.
- No se encontraron manzanas asociadas a `ISLA TUYU` en `concepcion_amambay_manzanas.geojson`.
- Tambien aparece `ASENT. BARRIO HERMOSA` en Sargento Jose Felix Lopez, pero para este pedido se priorizo `ISLA TUYU` porque el usuario indico que Isla Hermosa era antes Isla Tuyu.

### Implementacion local
- `MapData.gs`: nuevo archivo con el recorte liviano de datos territoriales:
  - Limite operativo de `ISLA TUYU` como poligono Leaflet.
  - 69 viviendas INE georreferenciadas, numeradas de norte a sur / oeste a este.
  - Metadata de fuente, centro y bounds.
  - Funcion `getFieldMapData(sessionToken)` protegida para roles `admin`, `editor`, `viewer`.
- `AppIndex.html`: se agrego Leaflet CSS/JS para la Web App nativa GAS.
- `Client.html`: nueva vista autenticada `Mapa territorial` en la navegacion.
  - Mapa Leaflet con base OpenStreetMap.
  - Capa de limite de Isla Tuyu.
  - Capa de viviendas numeradas.
  - Controles para activar/desactivar limite, viviendas y etiquetas.
  - KPIs operativos: viviendas INE, area aproximada, distancia maxima entre viviendas y distancia promedio al vecino mas cercano.
- `Styles.html`: estilos para el mapa full-height, panel lateral, marcadores numerados y modo responsive.

### Validacion local
- `MapData.gs` paso `node --check` por stdin.
- El script embebido en `Client.html` paso `node --check` por stdin.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS para el mapa territorial.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Probar la nueva vista `Mapa territorial` con sesion iniciada.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos incluyendo `MapData.gs`.
- `npx clasp version "v19 - vista mapa territorial Isla Tuyu"`: creada version 19.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 19`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @19 - v19 - vista mapa territorial Isla Tuyu`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publicada ya incluye la vista `Mapa territorial` para usuarios autenticados.
- La vista parte de datos reales INE: 69 viviendas georreferenciadas y limite de barrio/localidad `ISLA TUYU`.
- Pendiente de mejora futura: incorporar caminos/hidrografia como capas vectoriales propias, y cruzar con respuestas de encuesta para mostrar viviendas visitadas, pendientes y cantidad real de personas por hogar.

## 2026-05-08 - Mapa como bandeja territorial: asignacion de viviendas a encuestadores

### Idea implementada
- Convertir la vista `Mapa territorial` en una bandeja operativa:
  - El admin selecciona viviendas directamente en el mapa.
  - Elige un encuestador, prioridad, orden inicial de ruta y nota.
  - Guarda la tanda en una hoja operativa.
  - Cada encuestador ve sus viviendas asignadas resaltadas al iniciar sesion.
  - Desde el popup de una vivienda propia puede iniciar la encuesta ya vinculada a ese punto.
  - Cuando se envia una encuesta con `vivienda_mapeada_id`, el mapa la marca como `visitada`.

### Cambios de backend
- `Config.gs`: agregado `APP_CFG.SHEETS.DWELLING_ASSIGNMENTS = ASIGNACIONES_VIVIENDA`.
- `Seed.gs`: agregado `DWELLING_ASSIGNMENT_HEADERS_`.
- `Setup.gs`: `setupBackend()` y `fixEverything()` aseguran la hoja `ASIGNACIONES_VIVIENDA`.
- `Setup.gs`: `getResponseHeaders_()` agrega campos de trazabilidad territorial:
  - `vivienda_mapeada_id`
  - `vivienda_mapeada_n`
  - `vivienda_mapeada_lat`
  - `vivienda_mapeada_lng`
  - `vivienda_asignada_a`
  - `vivienda_plan_estado`
- `MapData.gs`:
  - `getFieldMapData(sessionToken)` ahora combina mapa + asignaciones + visitas registradas.
  - `saveDwellingAssignments(sessionToken, assignments)` permite al admin asignar/liberar viviendas.
  - Se agregan resumenes: total, visibles, asignadas, sin asignar, propias, pendientes propias y visitadas.
- `Survey.gs`: `submitSurvey()` guarda los campos territoriales y marca `vivienda_plan_estado=visitada` cuando corresponde.
- `App.gs`: funciones nuevas habilitadas tambien para el wrapper `doPost`.

### Cambios de frontend
- `Client.html`:
  - Panel de asignacion visible solo para admin.
  - Seleccion de viviendas por click en el mapa.
  - Botones `Asignar seleccion`, `Liberar seleccion`, `Limpiar seleccion`.
  - KPIs de cobertura: viviendas mapeadas, asignadas al usuario, pendientes propias y visitadas.
  - Marcadores por estado: sin asignar, asignada, propia y visitada.
  - Popup con encuestador asignado, orden de ruta, prioridad y boton `Iniciar encuesta aqui` para viviendas propias pendientes.
  - Al iniciar encuesta desde el mapa, se cargan en borrador los campos de vivienda mapeada y localidad.
- `Styles.html`: estilos de marcadores por estado y panel de asignacion.

### Validacion local
- `Client.html`, `MapData.gs`, `Config.gs`, `Seed.gs`, `Setup.gs`, `Survey.gs` y `App.gs` pasaron `node --check` por stdin.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200 y registrar version.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v20 - asignar viviendas a encuestadores"`: creada version 20.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 20`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @20 - v20 - asignar viviendas a encuestadores`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado tras la liberacion
- La Web App publicada ya permite administrar viviendas mapeadas y asignarlas a encuestadores desde `Mapa territorial`.
- La hoja `ASIGNACIONES_VIVIENDA` se crea/asegura automaticamente al abrir el mapa o ejecutar setup/fix.
- La trazabilidad territorial queda en `RESPUESTAS` mediante `vivienda_mapeada_id` y campos relacionados.
- Pendiente de prueba funcional viva: entrar como admin, seleccionar 2-3 viviendas, asignarlas a `encuestador`, entrar con ese usuario y verificar que puede iniciar la encuesta desde el punto asignado.

## 2026-05-08 - Usuarios genericos y auto-planificacion de operativo

### Necesidad planteada
- Crear usuarios genericos (`encuestador1`, `encuestador2`, etc.) para luego asignarlos a personas reales.
- Permitir que el administrador vea viviendas/puntos y los asigne a cada usuario generico.
- Considerar tiempos, distancias y complejidad del instrumento para armar un plan eficiente de implementacion del relevamiento.

### Implementacion aplicada
- `Seed.gs`:
  - Agregados 8 usuarios genericos activos:
    - `encuestador1` a `encuestador8`
    - rol `editor`
    - clave temporal `123456`
    - `must_change_password=SI`
  - `ensureDefaultUsers_()` permite agregarlos sin borrar usuarios existentes.
- `MapData.gs`:
  - `fieldMapAssignableUsers_()` ahora ejecuta `ensureDefaultUsers_()` antes de listar usuarios asignables, de modo que los usuarios genericos aparezcan aunque el administrador mantenga una sesion previa.
- `Client.html`:
  - La vista `Mapa territorial` mantiene asignacion manual por seleccion de puntos.
  - Se agrego panel `Auto-planificar operativo`.
  - El panel permite definir:
    - cantidad de encuestadores a usar,
    - minutos estimados por encuesta,
    - velocidad de traslado en km/h,
    - orden inicial de ruta.
  - La app calcula una estimacion inicial de minutos por vivienda segun complejidad del cuestionario:
    - cantidad total de preguntas,
    - preguntas obligatorias,
    - campos de foto,
    - campos GPS,
    - preguntas de texto/multiseleccion/numericas.
  - La planificacion automatica:
    - toma viviendas no visitadas y sin asignacion,
    - ordena territorialmente los puntos,
    - reparte cargas entre usuarios genericos,
    - optimiza cada tanda con una ruta por vecino mas cercano,
    - calcula distancia aproximada y horas por encuestador,
    - guarda asignaciones en `ASIGNACIONES_VIVIENDA` usando `saveDwellingAssignments`.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.
- `Seed.gs`: validado con `node --check`.
- `MapData.gs`: validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v22 - usuarios visibles y clusters por encuestador"`: creada version 22.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 22`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @22 - v22 - usuarios visibles y clusters por encuestador`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- La vista `Administracion > Gestion de usuarios` ya no queda vacia: lista usuarios y permite crear/actualizar usuarios con clave temporal.
- El mapa diferencia puntos por encuestador con paleta propia.
- El estado pendiente/visitado se distingue por intensidad de color.
- La planificacion automatica ahora separa viviendas en clusters por distancia antes de asignar sectores.

## 2026-05-08 - Usuario real reclama numero operativo y ve solo su ruta

### Pedido
- Cuando un usuario real tipo `nombre.apellido` inicia sesion, debe seleccionar un numero de encuestador disponible.
- Luego debe ver solo las viviendas asignadas a ese numero operativo, su ruta y tiempos estimados por vivienda y total.
- La duracion real de entrevistas debe alimentar una reestimacion del tiempo total.
- Solo `diego.meza`, `noelia.mendoza` y `latiffi.chelala` pueden ver utilidades administrativas.

### Cambios aplicados
- `Seed.gs`:
  - Se agregaron administradoras autorizadas `noelia.mendoza` y `latiffi.chelala`.
  - El alias legado `lati` queda sin privilegios administrativos efectivos.
  - Se agrego `ENUMERATOR_SLOT_HEADERS_` para la hoja de asignacion de numeros operativos.
- `Config.gs` / `Setup.gs`:
  - Nueva hoja `ENCUESTADOR_SLOTS`.
  - `setupBackend()` y `fixEverything()` aseguran sus encabezados.
- `Auth.gs`:
  - Nueva regla `effectiveRole_()`: solo `diego.meza`, `noelia.mendoza` y `latiffi.chelala` conservan rol admin.
  - Si otro usuario figura como admin en la hoja, se degrada efectivamente a `editor` en runtime.
- `MapData.gs`:
  - `claimEnumeratorSlot(sessionToken, slot)` permite que un usuario tome `encuestador1` a `encuestador8` si esta disponible.
  - `getFieldMapData()` usa el numero operativo activo para filtrar viviendas:
    - admins ven todo,
    - usuarios no admin ven solo viviendas asignadas a su numero operativo.
  - Las visitas traen `duracion_min` real para reestimar ruta.
- `Client.html`:
  - Usuarios no admin solo ven `Inicio`, `Formulario` y `Mapa territorial`.
  - `Dashboard`, `Respuestas` y `Administracion` quedan restringidos a admin.
  - Si un usuario no admin no tiene numero operativo, el mapa muestra selector de numero disponible.
  - La vista de ruta muestra viviendas visibles, pendientes, km aproximados, duracion por vivienda y total reestimado.
  - Boton `Recalcular` recarga mapa y usa duraciones reales ya registradas.

### Validacion local
- `Client.html`, `Auth.gs`, `MapData.gs`, `Seed.gs`, `App.gs`, `Config.gs` y `Setup.gs` pasaron `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v28 - tiempo total en simultaneo"`: creada version 28.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 28`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @28 - v28 - tiempo total en simultaneo`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- El tiempo total del relevamiento ya se presenta como duracion simultanea/calendario.
- La acumulacion de tiempos individuales deja de presentarse como total del operativo.

## 2026-05-11 - Ajustes solicitados por direccion: pobreza e informacion Paracel

### Pedido
- Incorporar preguntas que ayuden a identificar nivel de pobreza:
  - ingreso general del hogar, no solo ingreso por artesania,
  - cuantas personas dependen de ese ingreso.
- Incorporar si desea recibir informacion sobre Paracel:
  - en que formato,
  - en que idioma.

### Cambios aplicados en el cuestionario
- `Seed.gs`, seccion `Produccion, ventas e ingresos`:
  - `ingreso_total_hogar_mes_gs`: ingreso mensual total aproximado del hogar, de todas las fuentes.
  - `personas_dependen_ingreso_hogar`: cantidad de personas que dependen de ese ingreso.
  - `personas_aportan_ingreso_hogar`: cantidad de personas del hogar que aportan ingresos.
  - `ingreso_alcanza_necesidades`: suficiencia del ingreso para necesidades basicas.
- `Seed.gs`, seccion `Vinculacion, expectativas y cierre`:
  - `desea_recibir_info_paracel`: preferencia para recibir informacion.
  - `formato_info_paracel`: formato preferido.
  - `idioma_info_paracel`: idioma preferido.
- `Seed.gs`, catalogos nuevos:
  - `suficiencia_ingreso`
  - `formato_info_paracel`
  - `idioma_info_paracel`

### Validacion local
- `Seed.gs` validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear version GAS.
3. Actualizar deployment publico.
4. Ejecutar `seedCatalogs`, `seedQuestionnaire` y `fixEverything` para actualizar la hoja backend y encabezados.
5. Verificar `/exec` HTTP 200.
6. Commit/push Git.

### Ajuste operativo posterior
- `npx clasp run seedCatalogs` no pudo ejecutarse desde esta sesion por permisos de Apps Script.
- Para evitar dependencia manual, se implemento sincronizacion automatica:
  - `ensureQuestionnaireSeedCurrent_()` agrega al backend solo preguntas/catalogos faltantes.
  - `getSurveySchema()` ahora usa cache `artesanos_schema_v2` y ejecuta esa verificacion antes de servir el cuestionario.
  - Si agrega preguntas nuevas, tambien sincroniza encabezados de `RESPUESTAS`.
- Validacion adicional:
  - `Seed.gs` y `Survey.gs` pasaron `node --check`.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v29 - preguntas pobreza e informacion Paracel"`: creada version 29.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 29`: deployment publico actualizado inicialmente.
- Al no poder ejecutar `clasp run seedCatalogs`, se aplico autoactualizacion y se publico version correctiva:
  - `npx clasp version "v30 - autoactualizar preguntas direccion"`: creada version 30.
  - `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 30`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @30 - v30 - autoactualizar preguntas direccion`.
- Verificacion HTTP de `/exec`: status `200`.
- Verificacion `doPost getSurveySchema`: status `200`; respuesta contiene:
  - `ingreso_total_hogar_mes_gs`
  - `personas_dependen_ingreso_hogar`
  - `formato_info_paracel`
  - `idioma_info_paracel`

### Estado operativo
- Las nuevas preguntas quedan en codigo y se agregan automaticamente al backend al cargar el esquema del cuestionario.
- Los encabezados de `RESPUESTAS` se sincronizan cuando se agregan preguntas faltantes.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v27 - aclarar tiempos de relevamiento"`: creada version 27.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 27`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @27 - v27 - aclarar tiempos de relevamiento`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- El panel de tiempos diferencia explicitamente esfuerzo total y duracion calendario.
- La duracion promedio de cada encuesta queda editable como parametro de simulacion.

## 2026-05-08 - Tiempo total siempre en simultaneo

### Problema reportado
- El operativo se realiza siempre con encuestadores trabajando en simultaneo.
- Por lo tanto, la estimacion del tiempo total del relevamiento no debe presentarse como acumulacion de tiempos individuales.

### Cambios aplicados
- `Client.html`:
  - El panel de tiempos ahora indica explicitamente que las encuestas se realizan en simultaneo.
  - El KPI principal pasa a ser `duracion total con asignacion actual`.
  - El escenario simulado se presenta como `duracion total del escenario simulado`.
  - Se elimina de los KPIs principales la idea de `esfuerzo total del relevamiento`.
  - La tabla por encuestador muestra `Duracion de su ruta`; el relevamiento completo termina cuando termina la ruta mas larga, o segun el escenario de encuestadores simultaneos ensayado.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v26 - ordenar mapa y simular tiempos"`: creada version 26.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 26`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @26 - v26 - ordenar mapa y simular tiempos`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- La vista `Mapa territorial` queda reordenada con el mapa como superficie principal y el panel lateral como flujo de decision.
- El panel de tiempos muestra minutos, horas y dias.
- Se pueden ensayar escenarios modificando encuestadores, horas de trabajo por dia y minutos por vivienda.

## 2026-05-08 - Clarificacion de tiempos de relevamiento

### Problema reportado
- El panel de tiempos no dejaba suficientemente claro si el valor mostrado era la duracion completa del relevamiento o el esfuerzo total acumulado.
- Se pidio mejorar la presentacion y permitir alterar claramente la duracion promedio de cada encuesta para simular escenarios.

### Cambios aplicados
- `Client.html`:
  - Titulo actualizado a `Duracion estimada del relevamiento`.
  - Texto explicativo nuevo:
    - `Esfuerzo total` = suma de todo el trabajo de campo.
    - `Duracion calendario` = dias estimados para terminar trabajando en paralelo.
  - Etiquetas aclaradas:
    - `duracion promedio por encuesta`,
    - `esfuerzo total del relevamiento`,
    - `duracion calendario con asignacion actual`,
    - `duracion calendario del escenario simulado`.
  - Campo de simulacion renombrado a `Duracion promedio de cada encuesta (min)`.
  - Boton renombrado a `Recalcular con datos reales`.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v25 - tiempos estimados por encuestador"`: creada version 25.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 25`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @25 - v25 - tiempos estimados por encuestador`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- El mapa territorial ya muestra tiempos estimados globales e individuales por encuestador.
- La reestimacion usa duraciones reales de encuestas cerradas y se actualiza con `Recalcular tiempos`.

## 2026-05-08 - Reordenamiento de Mapa territorial y simulador de tiempos

### Problema reportado
- La vista `Mapa territorial` tenia los elementos desordenados y mezclaba lectura, filtros, tiempos, capas y asignacion sin una jerarquia clara.
- Las estimaciones de tiempo debian verse en minutos, horas y dias.
- Se pidio ensayar alternativas aumentando o disminuyendo encuestadores y tiempos de trabajo.

### Cambios aplicados
- `Client.html`:
  - Se reordeno el panel lateral del mapa:
    1. Filtro por encuestador.
    2. Tiempos y escenarios del operativo.
    3. Plan de cobertura.
    4. Auto-planificacion.
    5. Asignacion manual.
    6. Capas.
    7. Lectura territorial.
    8. Fuente y uso.
  - Se agrego funcion `timeText_()` para mostrar todo tiempo como:
    - minutos,
    - horas,
    - dias segun horas de trabajo por dia.
  - Se agrego simulador en `Tiempos y escenarios del operativo`:
    - encuestadores simulados,
    - horas de trabajo por dia,
    - minutos por vivienda.
  - El escenario simulado no modifica asignaciones; solo permite evaluar alternativas operativas.
  - Se mantiene el recalculo con duraciones reales via `Recalcular tiempos`.
- `Styles.html`:
  - Panel lateral del mapa con separacion consistente entre tarjetas.
  - Mapa principal queda fijo mientras se recorre el panel.
  - Ancho del panel ajustado para que tablas y escenarios respiren mejor.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v24 - filtro mapa por encuestador"`: creada version 24.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 24`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @24 - v24 - filtro mapa por encuestador`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- Admin puede filtrar el mapa por cada encuestador asignado.
- El filtro se aplica tambien a rutas y leyenda, no solo a los puntos.

## 2026-05-08 - Estimacion de tiempos por vivienda y por encuestador

### Pedido
- En `Mapa territorial`, mostrar la estimacion del tiempo medio de encuesta por vivienda.
- Mostrar total estimado para todos los encuestadores y tambien individualmente.
- Recalcular luego de cada nueva encuesta usando duraciones reales.

### Cambios aplicados
- `Client.html`:
  - Se agrego panel `Tiempos estimados del operativo` para admin.
  - Para usuarios de campo, el mismo componente se muestra como `Mi ruta y tiempos`.
  - KPIs agregados:
    - viviendas asignadas,
    - viviendas pendientes,
    - minutos promedio por vivienda,
    - minutos totales acumulados,
    - minutos si los encuestadores trabajan en paralelo,
    - cantidad de encuestas reales usadas para el recalculo.
  - Tabla por encuestador:
    - viviendas asignadas,
    - pendientes,
    - media de duracion,
    - km de ruta,
    - total estimado.
  - La estimacion usa `duracion_min` real cuando existe; para viviendas pendientes sin duracion real usa la estimacion por complejidad del cuestionario.
  - Boton `Recalcular tiempos` recarga el mapa desde backend, por lo que incorpora cualquier encuesta nueva enviada.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v23 - ruta por usuario real y slots operativos"`: creada version 23.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 23`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @23 - v23 - ruta por usuario real y slots operativos`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- Publicado el flujo usuario real -> numero operativo -> mapa filtrado.
- La app ya registra duracion real por encuesta en `duracion_min` y la usa para reestimar tiempos visibles en `Mi ruta y tiempos`.
- Privilegios administrativos efectivos limitados a `diego.meza`, `noelia.mendoza` y `latiffi.chelala`.

## 2026-05-08 - Filtro de mapa por encuestador

### Pedido
- En `Mapa territorial`, permitir filtrar los puntos visibles por cada encuestador.

### Cambios aplicados
- `Client.html`:
  - Se agrego panel `Filtrar por encuestador` para usuarios admin.
  - El selector incluye `Todos los puntos` y cada encuestador con viviendas asignadas.
  - El filtro afecta:
    - marcadores de viviendas,
    - leyenda de colores,
    - rutas/caminos operativos dibujados.
  - Al cambiar filtro se limpia la seleccion activa para evitar asignaciones accidentales sobre puntos ocultos.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear nueva version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.

### Liberacion ejecutada
- `npx clasp push -f`: exitoso, 14 archivos subidos.
- `npx clasp version "v21 - usuarios genericos y auto plan operativo"`: creada version 21.
- `npx clasp deploy -i AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk -V 21`: deployment publico actualizado.
- `npx clasp deployments`: confirma `AKfycbwTpwf0GoONoPOEJnE-IxoDiYofcB54c_aQBoPlvaCrjYcJ_RNhdxqJC9dEClZH0Kk @21 - v21 - usuarios genericos y auto plan operativo`.
- Verificacion HTTP de `/exec`: status `200`.

### Estado operativo
- La app publicada ya incluye usuarios genericos `encuestador1` a `encuestador8`.
- Los usuarios se agregan sin borrar los existentes cuando se ejecuta `ensureDefaultUsers_()`; ademas, la vista de mapa fuerza esa verificacion antes de listar usuarios asignables.
- En `Mapa territorial`, el admin puede asignar puntos manualmente o usar `Auto-planificar operativo`.
- El auto-plan guarda asignaciones reales en `ASIGNACIONES_VIVIENDA`; no queda solo como simulacion visual.

## 2026-05-08 - Correccion gestion de usuarios y clusters por encuestador

### Problema reportado
- En `Administracion > Gestion de usuarios` solo aparecia texto informativo; no se mostraba ninguna lista ni formulario.
- En el mapa se pidio diferenciar visualmente puntos por encuestador:
  - color tenue para viviendas asignadas pendientes,
  - color fuerte para viviendas ya encuestadas/cerradas,
  - capas de caminos/rutas,
  - distribucion inteligente por sectores o clusters de distancia.

### Cambios aplicados
- `Auth.gs`:
  - `listUsers(sessionToken)` ejecuta `ensureDefaultUsers_()` antes de listar, para que aparezcan `encuestador1` a `encuestador8` sin depender de reset manual.
- `Client.html`:
  - Se agrego carga real de usuarios desde `listUsers`.
  - Se agrego tabla de usuarios en Administracion.
  - Se agrego formulario rapido para crear/actualizar usuarios con `saveUser`.
  - Se reemplazo la distribucion alternada de viviendas por clustering geografico:
    - agrupa viviendas pendientes por distancia,
    - asigna cada cluster a un encuestador,
    - ordena cada cluster por ruta de vecino mas cercano.
  - En el mapa, cada encuestador recibe un color propio.
  - Marcadores pendientes usan color tenue; marcadores visitados usan color fuerte.
  - Se agrego capa `Rutas y caminos operativos`, con polilineas por sector/encuestador.
  - La base OpenStreetMap queda como capa de referencia para caminos existentes del territorio.
- `Styles.html`:
  - Se agregaron estilos para leyenda de encuestadores, colores y rutas.

### Validacion local
- `Client.html`: script embebido validado con `node --check`.
- `Auth.gs`: validado con `node --check`.

### Pendiente de liberacion
1. `npx clasp push -f`.
2. Crear version GAS.
3. Actualizar deployment publico.
4. Verificar `/exec` HTTP 200.
5. Commit/push Git.
