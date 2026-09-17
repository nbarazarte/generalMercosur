import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  muiMode: "light",
  usuarioId: null,
  usuarioBoId: null,
  userName: "",
  userEmail: "",
  seccion1: false,
  seccion2: false,
  seccion3: false,
  seccion4: false,
  seccion5: false,
  seccion6: false,
  seccion7: false,
  seccion8: false,
  seccion9: false,
  seccion10: false,
  seccion11: false,
  seccion12: false,
  seccionCompletada: false,
  producto_id: null,
  fichaId: null,
  opcionAsistir: null,
  opcionCrearCampana: null,
};

export const plantillaSlice = createSlice({
  name: "plantilla",
  initialState,
  reducers: {
    setOpcionAsistir: (state, action) => {
      state.opcionAsistir = action.payload;
    },
    setOpcionCrearCampana: (state, action) => {
      state.opcionCrearCampana = action.payload;
    },

    setMuiMode: (state, action) => {
      state.muiMode = action.payload;
    },

    setUsuarioBoId: (state, action) => {
      state.usuarioBoId = action.payload;
    },

    setUsuarioId: (state, action) => {
      state.usuarioId = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },

    setFichaId: (state, action) => {
      state.fichaId = action.payload;
    },

    // REDUCER MASIVO (COMPLETO)
    setSeccionesMasivo: (state, action) => {
      const data = action.payload;
      if (!data) return;

      //1 Datos personales
      state.id = data.id;
      state.usuarioId = data.usuario_id;
      state.institucionId = data.institucion_id;
      state.cedula = data.str_cedula;
      state.cedulaSecundaria = data.str_cedula_secundaria;
      state.primerNombre = data.str_primer_nombre;
      state.segundoNombre = data.str_segundo_nombre;
      state.primerApellido = data.str_primer_apellido;
      state.segundoApellido = data.str_segundo_apellido;
      state.sexoId = data.sexo_id;
      state.estadoCivilId = data.estado_civil_id;
      state.fechaNacimiento = data.fecha_nacimiento;
      state.paisNacionalidadId = data.pais_nacionalidad_id;
      state.paisOtraNacionalidadId = data.pais_otra_nacionalidad_id;
      state.tipoViviendaId = data.tipo_vivienda_id;
      state.cargaFamiliarId = data.carga_familiar_id;
      state.lugar = data.str_lugar;
      state.ruta_cedula = data.str_ruta_cedula;
      state.ruta_rif = data.str_ruta_rif;
      state.ruta_pasaporte = data.str_ruta_pasaporte;
      state.ruta_partida_nacimiento = data.str_ruta_partida_nacimiento;
      state.ruta_referencia_bancaria_menor =
        data.str_ruta_referencia_bancaria_menor;
      state.ruta_constancia_trabajo_rep = data.str_ruta_constancia_trabajo_rep;
      state.ruta_carta_autorizacion = data.str_ruta_carta_autorizacion;
      //Conyuge
      state.cedulaconyugue = data.cedulaconyugue;
      state.nombreconyugue = data.nombreconyugue;
      state.nombre2conyugue = data.nombre2conyugue;
      state.apellidoconyugue = data.apellidoconyugue;
      state.apellido2conyugue = data.apellido2conyugue;
      state.ingresosconyugue = data.ingresosconyugue;
      //Representante:
      state.cedularepresentante = data.cedularepresentante;
      state.nombrerepresentante = data.nombrerepresentante;
      state.nombre2representante = data.nombre2representante;
      state.apellidorepresentante = data.apellidorepresentante;
      state.apellido2representante = data.apellido2representante;
      state.nacionalidadrepresentante = data.nacionalidadrepresentante;
      state.fechanacimientoresentante = data.fechanacimientoresentante;
      state.celularresentante = data.celularresentante;
      state.telefonoresentante = data.telefonoresentante;
      state.genero_id = data.genero_id;
      state.ruta_cedula_representante = data.ruta_cedula_representante;
      state.ruta_rif_representante = data.ruta_rif_representante;
      //2 Direccion:
      state.paisId = data.pais_id;
      state.estadoId = data.estado_id;
      state.municipioId = data.municipio_id;
      state.parroquiaId = data.parroquia_id;
      state.ciudad = data.str_ciudad;
      state.codigoPostal = data.str_codigo_postal;
      state.direccionResidencia = data.str_direccion_residencia;
      state.telefono = data.str_telefono;
      state.celular = data.str_celular;
      state.email = data.str_email;
      //PEP:
      state.condicionPepId = data.condicion_pep_id;
      state.strNombreOrganizacionPep = data.str_nombre_organizacion_pep;
      state.strCargoPep = data.str_cargo_pep;
      state.paisPepId = data.pais_pep_id;
      state.fechaIngresoPep = data.fecha_ingreso_pep;
      state.fechaEgresoPep = data.fecha_egreso_pep;
      state.relacionadoPepId = data.relacionado_pep_id;
      state.strPrimerNombrePepRelacionado =
        data.str_primer_nombre_pep_relacionado;
      state.strSegundoNombrePepRelacionado =
        data.str_segundo_nombre_pep_relacionado;
      state.strPrimerApellidoPepRelacionado =
        data.str_primer_apellido_pep_relacionado;
      state.strSegundoApellidoPepRelacionado =
        data.str_segundo_apellido_pep_relacionado;
      state.nacionalidadPepRelacionadoId = data.nacionalidadpeprelacionado_id;
      state.tipodocRelacionadoPepId = data.tipodocrelacionadopep_id;
      state.strCedulaRelacionado = data.str_cedularelacionado;
      state.strNombreOrganizacionPepRelacionado =
        data.str_nombre_organizacion_pep_relacionado;
      state.strCargoPepRelacionado = data.str_cargo_pep_relacionado;
      state.paisPepRelacionadoId = data.pais_pep_relacionado_id;
      state.fechaIngresoRelacionadoPep = data.fecha_ingreso_relacionado_pep;
      state.fechaEgresoRelacionadoPep = data.fecha_egreso_relacionado_pep;
      state.tipoRelacionRelacionadoId = data.tiporelacionrelacionado_id;
      state.vinculoPepId = data.vinculopep_id;
      state.strPrimerNombrePepVinculo = data.str_primer_nombre_pep_vinculo;
      state.strSegundoNombrePepVinculo = data.str_segundo_nombre_pep_vinculo;
      state.strPrimerApellidoPepVinculo = data.str_primer_apellido_pep_vinculo;
      state.strSegundoApellidoPepVinculo =
        data.str_segundo_apellido_pep_vinculo;
      state.nacionalidadPepVinculoId = data.nacionalidadpepvinculo_id;
      state.tipodocVinculoPepId = data.tipodocvinculopep_id;
      state.strCedulaVinculo = data.str_cedulavinculo;
      state.strNombreOrganizacionPepVinculo =
        data.str_nombre_organizacion_pep_vinculo;
      state.strCargoPepVinculo = data.str_cargo_pep_vinculo;
      state.paisPepVinculoId = data.pais_pep_vinculo_id;
      state.fechaIngresoVinculoPep = data.fecha_ingreso_vinculo_pep;
      state.fechaEgresoVinculoPep = data.fecha_egreso_vinculo_pep;
      state.tipoRelacionVinculoId = data.tiporelacionvinculo_id;
      //Referencias bancarias:
      state.banco_id = data.banco_id;
      state.str_nombre_prod_bancario = data.str_nombre_prod_bancario;
      state.str_cuenta_bancaria = data.str_cuenta_bancaria;
      state.cifras_id = data.cifras_id;
      //Referencias personales:
      state.str_nombre_apellido = data.nombre_ref_personal;
      state.cedularef = data.cedularef;
      state.telefonoref = data.telefonoref;
      state.celularref = data.celularref;
      //3 Productos o servicios
      state.producto_id = data.producto_id;
      state.tipo_producto_id = data.tipo_producto_id;
      state.str_numero_producto = data.str_numero_producto;
      state.moneda_id = data.moneda_id;
      state.ruta_referencia_bancaria = data.str_ruta_referencia_bancaria;
      state.ruta_constancia_trabajo = data.str_ruta_constancia_trabajo;
      // Informacion sobre movilizacion de fondos:
      state.str_monto_promedio_mensual = data.str_monto_promedio_mensual;
      state.str_cantidad_operaciones = data.str_cantidad_operaciones;
      // Enviar y recibir:
      state.pais_id_envia_recibe_origen = data.pais_id_envia_recibe_origen;
      state.pais_id_envia_recibe_destino = data.pais_id_envia_recibe_destino;
      state.uso_modeda_virtual_id = data.uso_modeda_virtual_id;
      state.motivos_id = data.motivos_id;
      state.str_origen_fondos = data.str_origen_fondos;
      state.str_destino_fondos = data.str_destino_fondos;
      //Otros productos
      state.producto_id = data.producto_id;
      state.str_numero_producto = data.str_numero_producto;
      state.moneda_id = data.moneda_id;
      //Medios de contacto
      state.rrss_id = data.rrss_id;
      state.moneda_id = data.moneda_id;
      state.str_otros_medios = data.str_otros_medios;
      //Actividad economica:
      //ficha
      state.profesion_id = data.profesion_id;
      state.actividad_economica_id = data.actividad_economica_id;
      state.str_actividad_economica_descripcion =
        data.str_actividad_economica_descripcion;
      state.categoria_especial_id = data.categoria_especial_id;
      state.fuente_ingresos_id = data.fuente_ingresos_id;
      state.respuestaotrasfuentes = data.respuestaotrasfuentes;
      //Relacion dependencia
      state.dependencia_id = data.dependencia_id;
      state.fecha_ingreso = data.fechaingreso_dp;
      state.str_nombre_empresa = data.empresa_dp;
      state.str_rif_empresa = data.rif_dp;
      state.str_telefono = data.telefono_dp;
      state.str_monto_ingreso_mensual = data.monto_dp;
      state.str_cargo = data.cargo_dp;
      state.str_ramo = data.ramo_dp;
      state.pais_id = data.pais_dp;
      state.estado_id = data.estado_dp;
      state.municipio_id = data.municipio_dp;
      state.parroquia_id = data.parroquia_dp;
      state.str_direccion = data.direccion_dp;
      //negocio propio:
      state.negocio_propio_id = data.negocio_propio_id;
      state.fecha_fundacion = data.str_fecha_fundacion_np;
      state.str_nombre_negocio = data.str_nombre_negocio_np;
      state.str_rif_negocio = data.str_rif_negocio_np;
      state.str_telefono_np = data.str_telefono_np;
      state.str_monto_ingreso_mensual_np = data.str_monto_ingreso_mensual_np;
      state.str_ramo_np = data.str_ramo_np;
      state.pais_id_np = data.pais_id_np;
      state.estado_id_np = data.estado_id_np;
      state.municipio_id_np = data.municipio_id_np;
      state.parroquia_id_np = data.parroquia_id_np;
      state.str_direccion_np = data.str_direccion_np;
      state.str_nombre_registro_np = data.str_nombre_registro_np;
      state.str_numero_registro_np = data.str_numero_registro_np;
      state.str_numero_folio_np = data.str_numero_folio_np;
      state.str_numero_tomo_np = data.str_numero_tomo_np;
      state.str_proveedores_np = data.str_proveedores_np;
      state.str_clientes_np = data.str_clientes_np;
      //otras fuentes:
      state.fuente_ingresos_id = data.fuente_ingresos_id;
      //perfil de inversion:
      state.perfil_riesgo = data.tipo_perfil_inversion_id;
      state.tiene_experiencia = data.tiene_experiencia_id;
      state.objetivo_inversion = data.objetivo_inversion_id;
      //secciones:
      state.seccion1 = data.bol_seccion_1;
      state.seccion2 = data.bol_seccion_2;
      state.seccion3 = data.bol_seccion_3;
      state.seccion4 = data.bol_seccion_4;
      state.seccion5 = data.bol_seccion_5;
      state.seccion6 = data.bol_seccion_6;
      state.seccion7 = data.bol_seccion_7;
      state.seccion8 = data.bol_seccion_8;
      state.seccion9 = data.bol_seccion_9;
      state.seccion10 = data.bol_seccion_10;
      state.seccion11 = data.bol_seccion_11;
      state.seccion12 = data.bol_seccion_12;
      state.seccionCompletada = data.bol_ficha_completa;
      state.bolDevuelta = data.bol_devuelta;
      state.strotromontoingresomensual = data.strotromontoingresomensual;
    },

    // Reducers individuales (se mantienen por si necesitas actualizar una sola)
    setSeccion1: (state, action) => {
      state.seccion1 = action.payload;
    },
    setSeccion2: (state, action) => {
      state.seccion2 = action.payload;
    },
    setSeccion3: (state, action) => {
      state.seccion3 = action.payload;
    },
    setSeccion4: (state, action) => {
      state.seccion4 = action.payload;
    },
    setSeccion5: (state, action) => {
      state.seccion5 = action.payload;
    },
    setSeccion6: (state, action) => {
      state.seccion6 = action.payload;
    },
    setSeccion7: (state, action) => {
      state.seccion7 = action.payload;
    },
    setSeccion8: (state, action) => {
      state.seccion8 = action.payload;
    },
    setSeccion9: (state, action) => {
      state.seccion9 = action.payload;
    },
    setSeccion10: (state, action) => {
      state.seccion10 = action.payload;
    },
    setSeccion11: (state, action) => {
      state.seccion11 = action.payload;
    },
    setSeccion12: (state, action) => {
      state.seccion12 = action.payload;
    },
    setSeccionCompleta: (state, action) => {
      state.seccionCompletada = action.payload;
    },
    setProductoId: (state, action) => {
      state.producto_id = action.payload;
    },

    setBolDevuelta: (state, action) => {
      state.bolDevuelta = action.payload;
    },

    //resetPlantilla: () => initialState,

    resetPlantilla: (state) => {
      return {
        ...initialState,
        muiMode: state.muiMode, // Opcional: si quieres mantener también el modo claro/oscuro
        usuarioBoId: state.usuarioBoId, // Mantenemos el ID del Back Office
        usuarioId: state.usuarioId, // Opcional: si quieres mantener el usuario logueado
        userName: state.userName,
        userEmail: state.userEmail,
      };
    },
  },
});

export const {
  setOpcionAsistir,
  setOpcionCrearCampana,
  setMuiMode,
  setUsuarioId, //usuario
  setUsuarioBoId, //usuario del back office
  setUserName,
  setUserEmail,
  setSeccionesMasivo, // Exportamos el nuevo reducer masivo
  setSeccion1,
  setSeccion2,
  setSeccion3,
  setSeccion4,
  setSeccion5,
  setSeccion6,
  setSeccion7,
  setSeccion8,
  setSeccion9,
  setSeccion10,
  setSeccion11,
  setSeccion12,
  resetPlantilla,
  setFichaId,
  setSeccionCompleta,
  setProductoId,
  setBolVerificacionDatos,
} = plantillaSlice.actions;

export default plantillaSlice.reducer;
