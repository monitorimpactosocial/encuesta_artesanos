var QUESTIONNAIRE_HEADERS_ = ['section_order','section_id','section_label','question_order','field_name','label','input_type','required','options_json','visible_if','contains_pii','include_in_analytics','help_text'];
var CATALOG_HEADERS_ = ['catalogo','codigo','etiqueta','orden'];
var USER_HEADERS_ = ['username','display_name','role','password_hash','password_temporal','active','must_change_password','notes'];
var EDITION_HEADERS_ = ['edition_id','edition_name','status','start_date','end_date','notes'];
var CONFIG_HEADERS_ = ['clave','valor','descripcion'];
var PHOTO_HEADERS_ = ['foto_id','source_uuid','field_name','file_id','file_url','filename','mime_type','size_bytes','uploaded_at','uploaded_by'];
var AUDIT_HEADERS_ = ['event_ts','actor','role','action','entity','entity_id','payload_json'];
var DWELLING_ASSIGNMENT_HEADERS_ = ['vivienda_id','vivienda_n','lat','lng','assigned_to','status','priority','route_order','notes','assigned_by','assigned_at','updated_at'];

function q_(so, sid, slabel, qo, field, label, type, required, options, visibleIf, pii, analytic, help) {
  return {
    section_order: so,
    section_id: sid,
    section_label: slabel,
    question_order: qo,
    field_name: field,
    label: label,
    input_type: type || 'text',
    required: required ? 'SI' : 'NO',
    options_json: options ? JSON.stringify(options) : '',
    visible_if: visibleIf ? JSON.stringify(visibleIf) : '',
    contains_pii: pii ? 'SI' : 'NO',
    include_in_analytics: analytic === false ? 'NO' : 'SI',
    help_text: help || ''
  };
}

function getQuestionnaireSeed_() {
  var Q = [];
  var s;

  s = ['0','control','Control operativo y georreferenciación'];
  Q.push(q_(0,s[1],s[2],1,'gps_encuesta','GPS de la entrevista','geolocation',false,null,null,false,true,'Capturar al iniciar la entrevista. Opcional si el dispositivo no tiene señal.'));
  Q.push(q_(0,s[1],s[2],2,'foto_general','Foto general del entorno o referencia autorizada','photo',false,null,null,false,true,'No fotografiar rostros sin consentimiento.'));
  Q.push(q_(0,s[1],s[2],3,'fecha_encuesta','Fecha de la entrevista','date',true,null,null,false,true,''));
  Q.push(q_(0,s[1],s[2],4,'encuestador','Encuestador/a','text',true,null,null,false,true,''));
  Q.push(q_(0,s[1],s[2],5,'supervisor','Supervisor/a','text',false,null,null,false,true,''));
  Q.push(q_(0,s[1],s[2],6,'comunidad','Comunidad / localidad','buttons',true,{catalog:'comunidad'},null,false,true,''));
  Q.push(q_(0,s[1],s[2],7,'segmento_operativo','Segmento operativo / recorrido','text',false,null,null,false,true,''));
  Q.push(q_(0,s[1],s[2],8,'tipo_informante','Tipo de informante','buttons',true,{catalog:'tipo_informante'},null,false,true,''));
  Q.push(q_(0,s[1],s[2],9,'consentimiento_informado','¿Acepta participar voluntariamente?','buttons',true,{catalog:'si_no'},null,false,true,'Debe leerse el consentimiento antes de continuar.'));

  s = ['1','identificacion','Identificación de la persona artesana'];
  Q.push(q_(1,s[1],s[2],1,'nombre_completo_raw','Nombre y apellido declarado','text',true,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],2,'cedula_raw','Cédula de identidad declarada','text',false,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],3,'sexo','Sexo','buttons',true,{catalog:'sexo'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],4,'edad','Edad en años cumplidos','number',true,null,null,false,true,''));
  Q.push(q_(1,s[1],s[2],5,'fecha_nacimiento','Fecha de nacimiento','date',false,null,null,false,false,''));
  Q.push(q_(1,s[1],s[2],6,'telefono','Teléfono / WhatsApp','text',false,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],7,'correo','Correo electrónico','text',false,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],8,'departamento','Departamento','select',true,{catalog:'departamento'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],9,'distrito','Distrito','select',true,{catalog:'distrito'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],10,'barrio_localidad','Barrio / compañía / localidad','text',true,null,null,false,true,''));
  Q.push(q_(1,s[1],s[2],11,'direccion_referencia','Referencia de ubicación de la vivienda o taller','textarea',false,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],12,'nro_casa','Número de casa o lote','text',false,null,null,true,false,''));
  Q.push(q_(1,s[1],s[2],13,'jefatura_hogar','¿Es jefe/a de hogar?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],14,'estado_civil','Estado civil','select',false,{catalog:'estado_civil'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],15,'nacionalidad','Nacionalidad','select',false,{catalog:'nacionalidad'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],16,'idioma_principal','Idioma usado con mayor frecuencia','select',false,{catalog:'idioma'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],17,'pertenece_comunidad_indigena','¿Pertenece a pueblo o comunidad indígena?','buttons',true,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(1,s[1],s[2],18,'etnia','Pueblo / etnia','select',false,{catalog:'etnia'},{field:'pertenece_comunidad_indigena',equals:'Sí'},false,true,''));
  Q.push(q_(1,s[1],s[2],19,'observaciones_identificacion','Observaciones de identificación','textarea',false,null,null,true,false,''));

  s = ['2','hogar_vivienda','Composición del hogar, vivienda y servicios'];
  Q.push(q_(2,s[1],s[2],1,'miembros_hogar_json','Integrantes del hogar','roster',false,null,null,false,false,'Registrar sexo, edad y parentesco de cada integrante.'));
  Q.push(q_(2,s[1],s[2],2,'total_miembros','Total de integrantes del hogar','number',false,null,null,false,true,'Se calcula automáticamente si se usa el roster.'));
  Q.push(q_(2,s[1],s[2],3,'n_mujeres','Cantidad de mujeres en el hogar','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],4,'n_hombres','Cantidad de hombres en el hogar','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],5,'ninos_0_14','Personas de 0 a 14 años','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],6,'jovenes_15_29','Personas de 15 a 29 años','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],7,'adultos_30_64','Personas de 30 a 64 años','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],8,'adultos_mayores_65mas','Personas de 65 años y más','number',false,null,null,false,true,''));
  Q.push(q_(2,s[1],s[2],9,'tipo_vivienda','Tipo de vivienda','select',false,{catalog:'tipo_vivienda'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],10,'tenencia_vivienda','Tenencia de la vivienda','select',false,{catalog:'tenencia_vivienda'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],11,'material_paredes','Material predominante de paredes','select',false,{catalog:'material_paredes'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],12,'material_piso','Material predominante del piso','select',false,{catalog:'material_piso'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],13,'material_techo','Material predominante del techo','select',false,{catalog:'material_techo'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],14,'fuente_agua_principal','Fuente principal de agua','select',false,{catalog:'fuente_agua'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],15,'luz_electrica','¿Cuenta con energía eléctrica?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],16,'tiene_bano','¿Cuenta con baño?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],17,'desague_sanitario','Sistema de desagüe sanitario','select',false,{catalog:'desague'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],18,'combustible_cocinar','Principal combustible para cocinar','select',false,{catalog:'combustible'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],19,'tiene_internet','¿Cuenta con acceso a internet?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],20,'equipamiento_hogar','Equipamientos disponibles en el hogar','checkbox_group',false,{catalog:'equipamiento'},null,false,true,''));
  Q.push(q_(2,s[1],s[2],21,'foto_vivienda','Foto de referencia de vivienda autorizada','photo',false,null,null,false,true,''));

  s = ['3','educacion_salud','Educación, salud y protección social'];
  Q.push(q_(3,s[1],s[2],1,'nivel_educativo','Máximo nivel educativo alcanzado','select',false,{catalog:'nivel_educativo'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],2,'sabe_leer_escribir','¿Sabe leer y escribir?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],3,'asiste_estudia_actualmente','¿Asiste actualmente a una institución educativa o curso?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],4,'discapacidad_hogar','¿Hay personas con discapacidad en el hogar?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],5,'seguro_medico','Cobertura de salud principal','select',false,{catalog:'seguro_medico'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],6,'acceso_salud','Lugar habitual de atención en salud','select',false,{catalog:'acceso_salud'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],7,'dificultad_atencion_salud','Principal dificultad para atención de salud','select',false,{catalog:'dificultad_salud'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],8,'recibe_subsidio','¿Recibe algún subsidio o transferencia social del Estado?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(3,s[1],s[2],9,'tipo_subsidio','Programa(s) de subsidio o transferencia que recibe','checkbox_group',false,{catalog:'subsidio_estado'},{field:'recibe_subsidio',equals:'Sí'},false,true,'Puede marcar más de uno.'));

  s = ['4','actividad_artesanal','Actividad artesanal y capacidades productivas'];
  Q.push(q_(4,s[1],s[2],1,'tipo_artesania_principal','Tipo principal de artesanía','select',true,{catalog:'tipo_artesania'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],2,'oficio_principal','Oficio o especialidad principal','select',false,{catalog:'oficio_artesanal'},null,false,true,'Si su especialidad no aparece en la lista, seleccione Otro y especifique abajo.'));
  Q.push(q_(4,s[1],s[2],2.5,'oficio_principal_otro','Especificar oficio o especialidad','text',false,null,{field:'oficio_principal',equals:'Otro'},false,true,''));
  Q.push(q_(4,s[1],s[2],3,'productos_principales','Productos principales elaborados','textarea',true,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],4,'materia_prima_principal','Materia prima principal','select',true,{catalog:'materia_prima'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],4.5,'materia_prima_principal_otro','Descripción de otra materia prima principal','text',false,null,{field:'materia_prima_principal',equals:'Otro'},false,true,''));
  Q.push(q_(4,s[1],s[2],5,'materias_primas_otras','Otras materias primas utilizadas','checkbox_group',false,{catalog:'materia_prima'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],6,'origen_materia_prima','Origen principal de materia prima','select',false,{catalog:'origen_materia_prima'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],6.5,'origen_materia_prima_lugar','¿En qué lugar específico consigue la materia prima?','text',false,null,null,false,true,'Indique localidad, mercado, proveedor, campo, monte, etc.'));
  Q.push(q_(4,s[1],s[2],7,'dificultad_materia_prima','Dificultad principal para conseguir materia prima','select',false,{catalog:'dificultad_materia_prima'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],8,'anos_experiencia','Años de experiencia artesanal','number',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],9,'aprendio_oficio','¿Cómo aprendió el oficio?','select',false,{catalog:'aprendizaje'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],10,'dedicacion_artesania','Dedicación a la artesanía','buttons',true,{catalog:'dedicacion'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],11,'dias_semana_artesania','Días por semana dedicados a artesanía','number',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],12,'horas_dia_artesania','Horas promedio por día','number',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],13,'lugar_trabajo','Lugar donde produce principalmente','select',false,{catalog:'lugar_trabajo'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],14,'gps_taller','GPS del taller o lugar de producción','geolocation',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],15,'foto_taller','Foto del taller o área de trabajo autorizada','photo',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],16,'herramientas_disponibles','Herramientas/equipos disponibles','checkbox_group',false,{catalog:'herramientas'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],16.5,'herramientas_otro','Especificar otra herramienta o equipo que utiliza','text',false,null,{field:'herramientas_disponibles',contains:'Otro'},false,true,''));
  Q.push(q_(4,s[1],s[2],17,'necesita_herramientas','Herramientas o equipos que necesita','textarea',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],18,'capacitacion_recibida','¿Recibió capacitación artesanal o comercial en los últimos 2 años?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],19,'temas_capacitacion_recibida','Temas de capacitación recibida','checkbox_group',false,{catalog:'temas_capacitacion'},{field:'capacitacion_recibida',equals:'Sí'},false,true,''));
  Q.push(q_(4,s[1],s[2],20,'necesita_capacitacion','¿Necesita capacitación adicional?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],21,'temas_capacitacion_necesaria','Temas prioritarios de capacitación','checkbox_group',false,{catalog:'temas_capacitacion'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],22,'trabaja_solo_o_grupo','Forma habitual de trabajo','buttons',false,{catalog:'trabajo_grupo'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],23,'personas_apoyan_produccion','Cantidad de personas que apoyan la producción','number',false,null,null,false,true,''));
  Q.push(q_(4,s[1],s[2],24,'nombre_asociacion_artesanal','Nombre de la asociación de artesanos/as a la que pertenece','text',false,null,null,false,true,'Si no integra ninguna, dejar en blanco.'));
  Q.push(q_(4,s[1],s[2],25,'registro_ipa','¿Cuenta con carnet de artesano/a del IPA (Instituto Paraguayo de Artesanía)?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(4,s[1],s[2],25.5,'numero_registro_ipa','Número de registro / carnet IPA','text',false,null,{field:'registro_ipa',equals:'Sí'},false,true,''));

  s = ['5','produccion_ventas','Producción, ventas e ingresos'];
  Q.push(q_(5,s[1],s[2],1,'produccion_unidades_semana','Unidades producidas por semana aproximada','number',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],2,'produccion_unidades_mes','Unidades producidas por mes aproximada','number',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],3,'precio_promedio_producto_gs','Precio promedio del producto principal (Gs.)','number',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],4,'costo_promedio_producto_gs','Costo promedio estimado por producto (Gs.)','number',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],5,'ingreso_artesania_mes_gs','Ingreso mensual aproximado por artesanía (Gs.)','number',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],6,'ingreso_artesania_banda','Banda de ingreso mensual por artesanía','select',false,{catalog:'banda_ingreso'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],7,'ingreso_total_hogar_banda','Banda de ingreso mensual total del hogar','select',false,{catalog:'banda_ingreso'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],8,'principal_fuente_ingreso','Principal fuente de ingreso del hogar','select',false,{catalog:'fuente_ingreso'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],8.5,'principal_fuente_ingreso_otro','Especificar otra fuente de ingreso principal','text',false,null,{field:'principal_fuente_ingreso',equals:'Otra'},false,true,''));
  Q.push(q_(5,s[1],s[2],9,'principal_canal_venta','Canal principal de venta','select',false,{catalog:'canal_venta'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],9.5,'principal_canal_venta_otro','Especificar otro canal principal de venta','text',false,null,{field:'principal_canal_venta',equals:'Otro'},false,true,''));
  Q.push(q_(5,s[1],s[2],10,'otros_canales_venta','Otros canales de venta utilizados','checkbox_group',false,{catalog:'canal_venta'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],10.5,'otros_canales_venta_otro','Especificar otro canal de venta','text',false,null,{field:'otros_canales_venta',contains:'Otro'},false,true,''));
  Q.push(q_(5,s[1],s[2],11,'vende_por_redes','¿Vende o promociona por redes sociales/WhatsApp?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],12,'redes_utilizadas','Redes o medios digitales utilizados','checkbox_group',false,{catalog:'redes_digitales'},{field:'vende_por_redes',equals:'Sí'},false,true,''));
  Q.push(q_(5,s[1],s[2],13,'participa_ferias','¿Participa en ferias o exposiciones?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],14,'frecuencia_ferias','Frecuencia de participación en ferias','select',false,{catalog:'frecuencia_ferias'},{field:'participa_ferias',equals:'Sí'},false,true,''));
  Q.push(q_(5,s[1],s[2],15,'clientes_principales','Clientes principales','checkbox_group',false,{catalog:'clientes'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],15.5,'clientes_principales_otro','Especificar otros clientes','text',false,null,{field:'clientes_principales',contains:'Otro'},false,true,''));
  Q.push(q_(5,s[1],s[2],16,'meses_mayor_venta','Meses o temporadas de mayor venta','textarea',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],17,'barreras_comercializacion','Principales barreras para vender más','checkbox_group',false,{catalog:'barreras_comercializacion'},null,false,true,''));
  Q.push(q_(5,s[1],s[2],17.5,'barreras_comercializacion_otro','Especificar otra barrera para vender','text',false,null,{field:'barreras_comercializacion',contains:'Otro'},false,true,''));
  Q.push(q_(5,s[1],s[2],18,'foto_producto_principal','Foto del producto principal autorizada','photo',false,null,null,false,true,''));
  Q.push(q_(5,s[1],s[2],19,'foto_producto_secundario','Foto de otro producto autorizado','photo',false,null,null,false,true,''));

  s = ['6','organizacion_formalizacion','Organización, formalización y financiamiento'];
  Q.push(q_(6,s[1],s[2],1,'participa_asociacion','¿Integra asociación, comité o grupo de artesanos?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],2,'asociacion_nombre','Nombre de asociación/comité/grupo','text',false,null,{field:'participa_asociacion',equals:'Sí'},false,true,''));
  Q.push(q_(6,s[1],s[2],3,'rol_asociacion','Rol dentro de la organización','select',false,{catalog:'rol_asociacion'},{field:'participa_asociacion',equals:'Sí'},false,true,''));
  Q.push(q_(6,s[1],s[2],4,'ruc_o_registro','¿Cuenta con RUC, registro comercial o similar?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],5,'registro_marca','¿Cuenta con marca, etiqueta o identidad comercial?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],6,'emite_comprobante','¿Puede emitir comprobante/factura?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],7,'acceso_credito','¿Accedió a crédito o capital de trabajo en los últimos 12 meses?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],8,'fuente_credito','Fuente principal del crédito','select',false,{catalog:'fuente_credito'},{field:'acceso_credito',equals:'Sí'},false,true,''));
  Q.push(q_(6,s[1],s[2],8.5,'dificultades_credito','Principales dificultades para acceder al crédito o capital de trabajo','checkbox_group',false,{catalog:'dificultades_credito'},null,false,true,'Puede marcar más de una.'));
  Q.push(q_(6,s[1],s[2],9,'necesita_financiamiento','¿Necesita financiamiento para mejorar o ampliar la producción?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(6,s[1],s[2],10,'monto_financiamiento_estimado_gs','Monto estimado requerido (Gs.)','number',false,null,{field:'necesita_financiamiento',equals:'Sí'},false,true,''));
  Q.push(q_(6,s[1],s[2],11,'uso_financiamiento','Uso prioritario del financiamiento','checkbox_group',false,{catalog:'uso_financiamiento'},{field:'necesita_financiamiento',equals:'Sí'},false,true,''));
  Q.push(q_(6,s[1],s[2],12,'foto_documento','Foto de documento productivo o comprobante autorizado','photo',false,null,null,false,true,''));

  s = ['7','condiciones_ambientales','Condiciones de trabajo, ambiente y riesgos'];
  Q.push(q_(7,s[1],s[2],1,'riesgos_trabajo','Riesgos presentes en la actividad artesanal','checkbox_group',false,{catalog:'riesgos_trabajo'},null,false,true,''));
  Q.push(q_(7,s[1],s[2],2,'usa_epp','¿Utiliza elementos de protección personal cuando corresponde?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(7,s[1],s[2],3,'accidente_ultimo_ano','¿Tuvo accidente o lesión relacionada al trabajo en el último año?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(7,s[1],s[2],4,'manejo_residuos','Destino principal de residuos de producción','select',false,{catalog:'manejo_residuos'},null,false,true,''));
  Q.push(q_(7,s[1],s[2],4.5,'manejo_residuos_otro','Especificar otro destino de residuos','text',false,null,{field:'manejo_residuos',equals:'Otro'},false,true,''));
  Q.push(q_(7,s[1],s[2],5,'usa_material_reciclado','¿Usa materiales reciclados o reutilizados?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(7,s[1],s[2],5.5,'material_reciclado_detalle','¿Qué materiales reciclados o reutilizados usa?','text',false,null,{field:'usa_material_reciclado',equals:'Sí'},false,true,'Especifique tipo y procedencia del material.'));
  Q.push(q_(7,s[1],s[2],6,'restriccion_ambiental','Restricción ambiental o climática que afecta la producción','textarea',false,null,null,false,true,''));

  s = ['8','paracel_expectativas','Vinculación, expectativas y cierre'];
  Q.push(q_(8,s[1],s[2],1,'conoce_paracel','¿Conoce a Paracel o sus programas sociales?','buttons',false,{catalog:'si_no_parcial'},null,false,true,''));
  Q.push(q_(8,s[1],s[2],2,'participacion_programa_previo','¿Participó antes en actividades, capacitaciones o programas vinculados a Paracel?','buttons',false,{catalog:'si_no'},null,false,true,''));
  Q.push(q_(8,s[1],s[2],3,'interes_programa_paracel','Si en algún momento se ofrecieran programas de apoyo artesanal en la zona, ¿estaría dispuesto/a a participar?','buttons',false,{catalog:'si_no'},null,false,true,'Esta pregunta es solo informativa. No implica compromiso ni promesa de ningún programa concreto.'));
  Q.push(q_(8,s[1],s[2],4,'prioridad_apoyo','Apoyo que considera más prioritario para su actividad artesanal','select',false,{catalog:'prioridad_apoyo'},null,false,true,''));
  Q.push(q_(8,s[1],s[2],4.5,'prioridad_apoyo_otro','Especificar otro apoyo prioritario','text',false,null,{field:'prioridad_apoyo',equals:'Otro'},false,true,''));
  Q.push(q_(8,s[1],s[2],5,'otras_necesidades','Otras necesidades o sugerencias','textarea',false,null,null,false,true,''));
  Q.push(q_(8,s[1],s[2],6,'foto_otros','Foto adicional autorizada','photo',false,null,null,false,true,''));
  Q.push(q_(8,s[1],s[2],7,'obs','Observaciones finales del encuestador/a','textarea',false,null,null,false,true,''));

  return Q;
}

function getCatalogSeed_() {
  var C = [];
  function add(cat, code, label, order) { C.push({ catalogo: cat, codigo: code, etiqueta: label, orden: order || C.length + 1 }); }
  [['si_no','Sí'],['si_no','No'],['si_no','No sabe / No responde']].forEach(function(x,i){ add(x[0], normalizeKey_(x[1]), x[1], i+1); });
  [['si_no_parcial','Sí'],['si_no_parcial','No'],['si_no_parcial','Parcialmente'],['si_no_parcial','No sabe / No responde']].forEach(function(x,i){ add(x[0], normalizeKey_(x[1]), x[1], i+1); });
  ['Femenino','Masculino','Otro / prefiere no responder'].forEach(function(x,i){ add('sexo', normalizeKey_(x), x, i+1); });
  ['Isla Hermosa','Paso Horqueta','Yby Yaú','Concepción','Otra localidad'].forEach(function(x,i){ add('comunidad', normalizeKey_(x), x, i+1); });
  ['Persona artesana','Familiar informante','Referente comunitario','Otro informante'].forEach(function(x,i){ add('tipo_informante', normalizeKey_(x), x, i+1); });
  ['Concepción','Amambay','San Pedro','Otro'].forEach(function(x,i){ add('departamento', normalizeKey_(x), x, i+1); });
  ['Concepción','Yby Yaú','Horqueta','Paso Barreto','Sgto. José Félix López','Pedro Juan Caballero','Otro'].forEach(function(x,i){ add('distrito', normalizeKey_(x), x, i+1); });
  ['Soltero/a','Casado/a','Unión libre','Separado/a o divorciado/a','Viudo/a','No responde'].forEach(function(x,i){ add('estado_civil', normalizeKey_(x), x, i+1); });
  ['Paraguaya','Brasileña','Argentina','Otra'].forEach(function(x,i){ add('nacionalidad', normalizeKey_(x), x, i+1); });
  ['Guaraní','Castellano','Guaraní y castellano','Portugués','Otro'].forEach(function(x,i){ add('idioma', normalizeKey_(x), x, i+1); });
  ['Paĩ Tavyterã','Mbya Guaraní','Ava Guaraní','Enlhet Norte','Sanapaná','No especifica','Otro'].forEach(function(x,i){ add('etnia', normalizeKey_(x), x, i+1); });
  ['Casa','Rancho','Pieza en inquilinato','Vivienda improvisada','Otra'].forEach(function(x,i){ add('tipo_vivienda', normalizeKey_(x), x, i+1); });
  ['Propia','Alquilada','Cedida','En proceso de regularización','Otra'].forEach(function(x,i){ add('tenencia_vivienda', normalizeKey_(x), x, i+1); });
  ['Ladrillo / bloque','Madera','Adobe / estaqueo','Chapa','Material reciclado','Otro'].forEach(function(x,i){ add('material_paredes', normalizeKey_(x), x, i+1); });
  ['Baldosa / cerámica','Cemento','Tierra','Madera','Otro'].forEach(function(x,i){ add('material_piso', normalizeKey_(x), x, i+1); });
  ['Teja','Chapa','Fibrocemento','Paja / palma','Otro'].forEach(function(x,i){ add('material_techo', normalizeKey_(x), x, i+1); });
  ['ESSAP / SENASA / Junta de saneamiento','Pozo con bomba','Pozo sin bomba','Manantial / arroyo / río','Aguatero','Otro'].forEach(function(x,i){ add('fuente_agua', normalizeKey_(x), x, i+1); });
  ['Red cloacal','Pozo ciego','Cámara séptica','Letrina','No tiene','Otro'].forEach(function(x,i){ add('desague', normalizeKey_(x), x, i+1); });
  ['Gas','Leña','Carbón','Electricidad','Otro'].forEach(function(x,i){ add('combustible', normalizeKey_(x), x, i+1); });
  ['Celular','Smartphone','Computadora','Heladera','Televisor','Motocicleta','Máquina de coser','Herramientas eléctricas','Otro'].forEach(function(x,i){ add('equipamiento', normalizeKey_(x), x, i+1); });
  ['Sin instrucción','Primaria incompleta','Primaria completa','Secundaria incompleta','Secundaria completa','Técnica / formación profesional','Superior no universitaria','Universitaria','No responde'].forEach(function(x,i){ add('nivel_educativo', normalizeKey_(x), x, i+1); });
  ['IPS','Ministerio de Salud','Privado','Sanidad militar/policial','Ninguno','Otro'].forEach(function(x,i){ add('seguro_medico', normalizeKey_(x), x, i+1); });
  ['USF / Puesto de salud','Centro de salud','Hospital distrital/departamental','Clínica privada','Farmacia','No consulta','Otro'].forEach(function(x,i){ add('acceso_salud', normalizeKey_(x), x, i+1); });
  ['Distancia','Costo de traslado','Falta de medicamentos','Tiempo de espera','Horarios','No tiene dificultad','Otro'].forEach(function(x,i){ add('dificultad_salud', normalizeKey_(x), x, i+1); });
  ['Textil / tejido / bordado','Cestería / fibras vegetales','Madera / tallado','Cuero','Cerámica / arcilla','Bijouterie / accesorios','Reciclado / reutilizado','Alimentos artesanales','Artesanía mixta','Otra'].forEach(function(x,i){ add('tipo_artesania', normalizeKey_(x), x, i+1); });
  ['Tejido','Bordado','Crochet / tejido a ganchillo','Cestería','Tallado en madera','Carpintería artesanal','Cerámica / alfarería','Cuero / marroquinería','Bijouterie / accesorios','Costura / confección','Arte en semillas y fibras naturales','Pintura artesanal','Trabajo en bambú / tacuarilla','Elaboración de alimentos artesanales','Artesanía mixta','Otro'].forEach(function(x,i){ add('oficio_artesanal', normalizeKey_(x), x, i+1); });
  ['Madera','Bambú / tacuarilla','Karanda’y / palma / fibras vegetales','Algodón / hilo / lana','Cuero','Arcilla','Semillas','Metal','Plástico reciclado','Papel / cartón','Tela reciclada','Otro'].forEach(function(x,i){ add('materia_prima', normalizeKey_(x), x, i+1); });
  ['Recolectada localmente','Comprada localmente','Comprada fuera de la comunidad','Proveída por intermediario','Donada','Reciclada/reutilizada','Otro'].forEach(function(x,i){ add('origen_materia_prima', normalizeKey_(x), x, i+1); });
  ['Precio alto','Escasez','Distancia para conseguir','Falta de transporte','Restricción ambiental o climática','Calidad irregular','No tiene dificultad','Otro'].forEach(function(x,i){ add('dificultad_materia_prima', normalizeKey_(x), x, i+1); });
  ['Tradición familiar','Capacitación institucional','Aprendizaje comunitario','Autodidacta','Aprendió en asociación/comité','Otro'].forEach(function(x,i){ add('aprendizaje', normalizeKey_(x), x, i+1); });
  ['Principal actividad económica','Actividad secundaria','Actividad ocasional / por pedido','Actividad cultural sin venta regular'].forEach(function(x,i){ add('dedicacion', normalizeKey_(x), x, i+1); });
  ['Vivienda propia','Taller propio','Taller compartido','Local comunitario','Al aire libre','Otro'].forEach(function(x,i){ add('lugar_trabajo', normalizeKey_(x), x, i+1); });
  ['Solo/a','Con familiares','Con otros artesanos','En asociación/comité','Con empleados o ayudantes'].forEach(function(x,i){ add('trabajo_grupo', normalizeKey_(x), x, i+1); });
  ['Herramientas manuales','Herramientas eléctricas','Máquina de coser','Mesa/banco de trabajo','Horno','Moldes','Tintes/pinturas','Equipo de seguridad','Teléfono para ventas','Otro'].forEach(function(x,i){ add('herramientas', normalizeKey_(x), x, i+1); });
  ['Diseño y terminación','Costeo y precios','Administración básica','Marketing y redes sociales','Fotografía de productos','Calidad y empaque','Formalización/RUC','Acceso a crédito','Asociatividad','Seguridad laboral','Sostenibilidad ambiental','Otro'].forEach(function(x,i){ add('temas_capacitacion', normalizeKey_(x), x, i+1); });
  ['Menos de ₲ 500.000','₲ 500.000 a ₲ 1.000.000','₲ 1.000.001 a ₲ 2.000.000','₲ 2.000.001 a ₲ 3.000.000','₲ 3.000.001 a ₲ 5.000.000','Más de ₲ 5.000.000','No informa'].forEach(function(x,i){ add('banda_ingreso', normalizeKey_(x), x, i+1); });
  ['Artesanía','Agricultura','Ganadería','Pesca','Trabajo asalariado','Comercio','Remesas/ayuda familiar','Programas sociales','Otra'].forEach(function(x,i){ add('fuente_ingreso', normalizeKey_(x), x, i+1); });
  ['Venta directa en la comunidad','Feria local','Feria regional/nacional','Intermediario/revendedor','Pedido personalizado','Tienda/local comercial','WhatsApp','Facebook/Instagram','Otro'].forEach(function(x,i){ add('canal_venta', normalizeKey_(x), x, i+1); });
  ['WhatsApp','Facebook','Instagram','TikTok','Marketplace','Catálogo digital','No usa'].forEach(function(x,i){ add('redes_digitales', normalizeKey_(x), x, i+1); });
  ['Semanal','Mensual','Algunas veces al año','Solo cuando se invita','Nunca'].forEach(function(x,i){ add('frecuencia_ferias', normalizeKey_(x), x, i+1); });
  ['Vecinos/comunidad','Turistas/visitantes','Empresas','Instituciones públicas','Intermediarios','Compradores por redes','Otro'].forEach(function(x,i){ add('clientes', normalizeKey_(x), x, i+1); });
  ['Falta de clientes','Bajo precio de venta','Dificultad de transporte','Falta de capital','Falta de herramientas','Falta de diseño/terminación','Poca promoción','Competencia','Materia prima escasa/cara','No tiene barreras importantes','Otro'].forEach(function(x,i){ add('barreras_comercializacion', normalizeKey_(x), x, i+1); });
  ['Presidenta/e','Secretaría/o','Tesorería/o','Miembro','No tiene rol formal','Otro'].forEach(function(x,i){ add('rol_asociacion', normalizeKey_(x), x, i+1); });
  ['Banco','Financiera','Cooperativa','Crédito informal','Proveedor/intermediario','Programa público','Familiares/amigos','Otro'].forEach(function(x,i){ add('fuente_credito', normalizeKey_(x), x, i+1); });
  ['Compra de materia prima','Compra de herramientas/equipos','Mejora del taller','Transporte/logística','Diseño y empaque','Formalización','Capital de trabajo','Otro'].forEach(function(x,i){ add('uso_financiamiento', normalizeKey_(x), x, i+1); });
  ['Cortes/pinchazos','Polvo/humo','Ruido','Posturas forzadas','Uso de químicos/pinturas','Quemaduras/calor','Carga pesada','Iluminación insuficiente','Ninguno relevante','Otro'].forEach(function(x,i){ add('riesgos_trabajo', normalizeKey_(x), x, i+1); });
  ['Se reutilizan','Se venden/entregan para reciclaje','Se queman','Se tiran con basura común','Se entierran','No genera residuos relevantes','Otro'].forEach(function(x,i){ add('manejo_residuos', normalizeKey_(x), x, i+1); });
  ['Herramientas/equipos','Materia prima','Capacitación técnica','Diseño, calidad y empaque','Comercialización y ferias','Redes sociales/ventas digitales','Formalización','Financiamiento','Organización/asociatividad','Otro'].forEach(function(x,i){ add('prioridad_apoyo', normalizeKey_(x), x, i+1); });
  ['Tekoporã','Adultos Mayores','Abrazo','Sembrando Oportunidades','Pensión alimentaria adulto mayor','Otro programa / subsidio'].forEach(function(x,i){ add('subsidio_estado', normalizeKey_(x), x, i+1); });
  ['Falta de garantías o avales','Altas tasas de interés','Trámites y requisitos complejos','Falta de información sobre opciones','Historial crediticio negativo','Falta de documentación (cédula, RUC)','Monto ofrecido insuficiente','Distancia a entidades financieras','No necesita crédito actualmente','Otro'].forEach(function(x,i){ add('dificultades_credito', normalizeKey_(x), x, i+1); });
  return C;
}

function seedQuestionnaire() {
  var rows = getQuestionnaireSeed_();
  var data = rows.map(function(r) { return QUESTIONNAIRE_HEADERS_.map(function(h) { return r[h] || ''; }); });
  replaceSheetData_(APP_CFG.SHEETS.QUESTIONNAIRE, QUESTIONNAIRE_HEADERS_, data);
  try { CacheService.getScriptCache().remove('artesanos_schema_v1'); } catch(e) {}
  return { ok: true, rows: rows.length };
}

function seedCatalogs() {
  var rows = getCatalogSeed_();
  var data = rows.map(function(r) { return CATALOG_HEADERS_.map(function(h) { return r[h] || ''; }); });
  replaceSheetData_(APP_CFG.SHEETS.CATALOGS, CATALOG_HEADERS_, data);
  try { CacheService.getScriptCache().remove('artesanos_schema_v1'); } catch(e) {}
  return { ok: true, rows: rows.length };
}

function seedEditions_() {
  var rows = [
    ['2026','Encuesta a Artesanos de Isla Hermosa 2026','activa','2026-01-01','2026-12-31','Instrumento base para relevamiento socioeconómico, productivo y comercial.']
  ];
  replaceSheetData_(APP_CFG.SHEETS.EDITIONS, EDITION_HEADERS_, rows);
}

function seedConfig_() {
  var rows = [
    ['active_edition','2026','Edición activa utilizada por defecto.'],
    ['allow_public_survey','SI','Permite cargar entrevistas sin iniciar sesión.'],
    ['require_consent','SI','Bloquea el envío si el consentimiento informado no es Sí.'],
    ['photo_max_width','1600','Ancho máximo recomendado para fotos comprimidas en el cliente.'],
    ['dashboard_row_limit','5000','Cantidad máxima de filas para vistas administrativas.']
  ];
  replaceSheetData_(APP_CFG.SHEETS.CONFIG, CONFIG_HEADERS_, rows);
}

function defaultUsers_() {
  return [
    ['diego.meza',  'Diego Meza',       'admin',  '', '123456', 'SI', 'NO', 'Administrador Paracel.'],
    ['lati',        'Lati',             'admin',  '', '123456', 'SI', 'NO', 'Administrador Paracel.'],
    ['encuestador', 'Encuestador',      'editor', '', '123456', 'SI', 'NO', 'Encuestador de campo.'],
    ['viewer',      'Visualizador',     'viewer', '', '123456', 'SI', 'NO', 'Solo lectura.']
  ];
}

function seedUsers_() {
  var existing = getRowsAsObjects_(APP_CFG.SHEETS.USERS);
  if (existing.length) return;
  replaceSheetData_(APP_CFG.SHEETS.USERS, USER_HEADERS_, defaultUsers_());
  hashSeedUsers_();
}

function ensureDefaultUsers_() {
  ensureHeaders_(APP_CFG.SHEETS.USERS, USER_HEADERS_);
  var existing = getRowsAsObjects_(APP_CFG.SHEETS.USERS);
  var present = {};
  existing.forEach(function(u) {
    var username = normalizeText_(u.username).toLowerCase();
    if (username) present[username] = true;
  });
  var added = 0;
  defaultUsers_().forEach(function(row) {
    var username = normalizeText_(row[0]).toLowerCase();
    if (!username || present[username]) return;
    var obj = {};
    USER_HEADERS_.forEach(function(h, i) { obj[h] = row[i] || ''; });
    appendObject_(APP_CFG.SHEETS.USERS, obj, USER_HEADERS_);
    present[username] = true;
    added++;
  });
  if (added) hashSeedUsers_();
  return { ok: true, added: added };
}

function resetUsers() {
  replaceSheetData_(APP_CFG.SHEETS.USERS, USER_HEADERS_, defaultUsers_());
  hashSeedUsers_();
  return { ok: true, users: defaultUsers_().length };
}

function seedAll() {
  seedConfig_();
  seedEditions_();
  seedUsers_();
  seedCatalogs();
  seedQuestionnaire();
  return { ok: true };
}
