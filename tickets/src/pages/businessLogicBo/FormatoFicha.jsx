import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";

import logoMercosur from "../../assets/images/Logo - original.png";

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 6,
    fontFamily: "Helvetica",
    lineHeight: 1.2,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#ff6600",
    paddingBottom: 5,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  logo: { width: 60, height: "auto", marginRight: 15 },
  headerText: { flex: 1 },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff6600",
    textAlign: "center",
  },
  subtitle: { fontSize: 6, color: "#666", marginTop: 2 },
  section: { marginBottom: 6 },
  sectionTitle: {
    fontSize: 7,
    fontWeight: "bold",
    backgroundColor: "#eeeeee",
    padding: 2,
    marginBottom: 3,
    borderLeftWidth: 2,
    borderLeftColor: "#ff6600",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  col: { flexDirection: "row", flex: 1 },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { fontWeight: "bold", color: "#444", marginRight: 4 },
  value: { color: "#000", flex: 1 },
  footer: { marginTop: 20 },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  signatureBox: { alignItems: "center" },
  fingerprint: {
    width: 30,
    height: 40,
    borderWidth: 0.5,
    borderColor: "#999",
    borderStyle: "solid",
    marginBottom: 2,
  },
});

const FormatoFicha = ({ datos }) => {
  const s = (v) => {
    if (!v || String(v).trim() === "" || v === false) return "NO APLICA";
    if (typeof v === "string" && v.includes("T") && v.includes("Z")) {
      const [anio, mes, dia] = v.split("T")[0].split("-");
      return `${dia}-${mes}-${anio}`;
    }
    return String(v).toUpperCase();
  };

  // Helper para valores no-fecha que requieren formato simple
  const v = (val) => (val ? String(val).toUpperCase() : "NO APLICA");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO CON LOGO */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image style={styles.logo} src={logoMercosur} />
            <View style={styles.headerText}>
              <Text style={styles.title}>
                FICHA DE IDENTIFICACIÓN DEL INVERSIONISTA PERSONA NATURAL
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN: CABECERA */}
        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>LUGAR:</Text>
              <Text style={styles.value}>{v(datos.ciudad)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>FECHA DE ELABORACIÓN:</Text>
              <Text style={styles.value}>{s(datos.fecha_actualizacion)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>
                NÚMERO O CÓDIGO DEL INVERSIONISTA:
              </Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN: DATOS DE LA EMPRESA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DE LA INSTITUCIÓN</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES DE LA INSTITUCIÓN:</Text>
              <Text style={styles.value}>MERCOSUR CASA DE BOLSA, S.A.</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>REGISTRO DE INFORMACIÓN FISCAL:</Text>
              <Text style={styles.value}>J-30455414-1</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>SUCURSAL O AGENCIA:</Text>
              <Text style={styles.value}>N/A</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 1: DATOS PERSONALES BÁSICOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. DATOS PERSONALES DEL CLIENTE
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA:</Text>
              <Text style={styles.value}>{v(datos.cedula)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES:</Text>
              <Text style={styles.value}>{v(datos.nombres)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>APELLIDOS:</Text>
              <Text style={styles.value}>{v(datos.apellidos)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FECHA DE NACIMIENTO:</Text>
              <Text style={styles.value}>{s(datos.nacimiento)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>LUGAR DE NACIMIENTO:</Text>
              <Text style={styles.value}>{v(datos.lugar_nacimiento)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>NACIONALIDAD:</Text>
              <Text style={styles.value}>{v(datos.nacionalidad)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>OTRA NACIONALIDAD:</Text>
              <Text style={styles.value}>{v(datos.otra_nacionalidad)}</Text>
            </View>{" "}
            <View style={styles.col}>
              <Text style={styles.label}>PROFESIÓN:</Text>
              <Text style={styles.value}>{v(datos.profesion)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>VIVIENDA:</Text>
              <Text style={styles.value}>{v(datos.tipo_vivienda)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CARGA FAMILIAR:</Text>
              <Text style={styles.value}>{v(datos.carga_familiar)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>GÉNERO:</Text>
              <Text style={styles.value}>{v(datos.sexo)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>ESTADO CIVIL:</Text>
              <Text style={styles.value}>{v(datos.estado_civil)}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: DATOS DEL CÓNYUGE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DATOS DEL CÓNYUGE</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES:</Text>
              <Text style={styles.value}>
                {v(datos.nombres_conyugue)} {v(datos.apellidos_conyugue)}
                {/* Escribí mal la palabra cónyuge XD */}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA:</Text>
              <Text style={styles.value}>{v(datos.cedula_conyugue)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FUENTE DE INGRESOS:</Text>
              <Text style={styles.value}>
                {v(datos.fuente_ingresos_conyugue)}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: DIRECCION DE DOMICILIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. DIRECCIÓN DE DOMICILIO</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PAÍS:</Text>
              <Text style={styles.value}>{v(datos.pais)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>ESTADO:</Text>
              <Text style={styles.value}>{v(datos.estado)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>MUNICIPIO:</Text>
              <Text style={styles.value}>{v(datos.municipio)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PARROQUIA:</Text>
              <Text style={styles.value}>{v(datos.parroquia)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CIUDAD:</Text>
              <Text style={styles.value}>{v(datos.ciudad)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CÓDIGO POSTAL:</Text>
              <Text style={styles.value}>{v(datos.codigo_postal)}</Text>
            </View>
          </View>

          <View style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.label}>DIRECCIÓN:</Text>
              <Text style={styles.value}>{v(datos.direccion)}</Text>
            </View>
          </View>

          {/* <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CORREO ELECTRÓNICO:</Text>
              <Text style={styles.value}>{v(datos.correo)}</Text>
            </View>
          </View> */}
        </View>

        {/* SECCIÓN 4: DATOS DE CONTACTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. DATOS DE CONTACTO</Text>

          <View style={styles.grid}>
            {/*  <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>{v(datos.celular)}</Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>{v(datos.telefono)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>CORREO ELECTRÓNICO:</Text>
              <Text style={styles.value}>{v(datos.correo)}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 5: PEP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. PERSONAS EXPUESTAS POLÍTICAMENTE (PEP)
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>¿ERES PEP?:</Text>
              <Text style={styles.value}>{v(datos.es_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>ENTE:</Text>
              <Text style={styles.value}>{v(datos.ente_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CARGO:</Text>
              <Text style={styles.value}>{v(datos.cargo_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PAÍS:</Text>
              <Text style={styles.value}>{v(datos.pais_pep)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CARGO:</Text>
              <Text style={styles.value}>
                {v(datos.strCargoPepRelacionado)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PAÍS:</Text>
              <Text style={styles.value}>{v(datos.pais_pep_relacionado)}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 6: PARENTESCO CON PEP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. PARENTESCO CON PEP</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>TIENE PARENTESCO PEP:</Text>
              <Text style={styles.value}>{v(datos.tiene_relacionado_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES:</Text>
              <Text style={styles.value}>
                {v(datos.nombres_relacionado_pep)} {""}
                {v(datos.apellidos_relacionado_pep)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA:</Text>
              <Text style={styles.value}>{v(datos.cedula_relacionado)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>ENTE:</Text>
              <Text style={styles.value}>{v(datos.ente_relacionado_pep)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CARGO:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PAÍS:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 7: PEP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ASOCIADO CERCANO PEP</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>TIENE VINCULO PEP:</Text>
              <Text style={styles.value}>{v(datos.tiene_vinculo_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES :</Text>
              <Text style={styles.value}>
                {v(datos.nombres_vinculo_pep)} {v(datos.apellidos_vinculo_pep)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA :</Text>
              <Text style={styles.value}>{v(datos.strCedulaRelacionado)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>ENTE :</Text>
              <Text style={styles.value}>
                {v(datos.str_nombre_organizacion_pep_relacionado)}
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CARGO:</Text>
              <Text style={styles.value}>{v(datos.cargo_relacionado_pep)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PAÍS:</Text>
              <Text style={styles.value}>{v(datos.pais_pep_relacionado)}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 8: REPRESENTANTE LEGAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. REPRESENTANTE LEGAL</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA:</Text>
              <Text style={styles.value}>{v(datos.cedula_representante)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NOMBRES:</Text>
              <Text style={styles.value}>
                {v(datos.nombres_representante)}{" "}
                {v(datos.apellidos_representante)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FECHA DE NACIMIENTO:</Text>
              <Text style={styles.value}>
                {s(datos.nacimiento_representante)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CORREO:</Text>
              <Text style={styles.value}>{v(datos.correo_representante)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>NACIONALIDAD:</Text>
              <Text style={styles.value}>
                {v(datos.nacionalidadrepresentante)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>{v(datos.celularresentante)}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 9: REFERENCIAS BANCARIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            9. REFERENCIAS BANCARIAS DEL CLIENTE
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>BANCO:</Text>
              <Text style={styles.value}>{v(datos.banco)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TIPO DE CUENTA:</Text>
              <Text style={styles.value}>
                {v(datos.nombre_producto_bancario)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NÚMERO DE CUENTA:</Text>
              <Text style={styles.value}>{v(datos.cuenta_banco)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CIFRAS:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>

        {/* 10. REFERENCIA PERSONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            10. REFERENCIAS PERSONALES DEL CLIENTE
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CÉDULA:</Text>
              <Text style={styles.value}>
                {v(datos.cedula_referencia_personal)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NOMBRE:</Text>
              <Text style={styles.value}>
                {v(datos.nombres_referencia_personal)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>
                {v(datos.celular_referencia_personal)}
              </Text>
            </View>
          </View>
        </View>

        {/* 11. INFORMACIÓN ECONÓMICA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            11. INFORMACIÓN ECONÓMICO/FINANCIERA
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>ACTIVIDAD:</Text>
              <Text style={styles.value}>{v(datos.actividad_economica)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>DESCRIPCIÓN:</Text>
              <Text style={styles.value}>
                {v(datos.actividad_economica_descripcion)}
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CATEGORÍA:</Text>
              <Text style={styles.value}>{v(datos.categoria_especial)}</Text>
            </View>
          </View>
        </View>

        {/* 12. FUENTES DE INGRESO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            12. FUENTES DE INGRESO DEL CLIENTE
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>RELACIÓN LABORAL:</Text>
              <Text style={styles.value}>{v(datos.relacion_dependencia)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>NEGOCIO PROPIO:</Text>
              <Text style={styles.value}>{v(datos.negocio_propio)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>OTRAS FUENTES:</Text>
              <Text style={styles.value}>{v(datos.otras_fuente_ingresos)}</Text>
            </View>
          </View>
        </View>

        {/* 13. RELACIÓN LABORAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. RELACIÓN LABORAL</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>EMPRESA:</Text>
              <Text style={styles.value}>{v(datos.empresa_dependencia)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>RIF:</Text>
              <Text style={styles.value}>{v(datos.rif_dependencia)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CARGO:</Text>
              <Text style={styles.value}>
                {v(datos.cargo_empresa_dependencia)}
              </Text>
            </View>

            {/* <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {v(datos.ingreso_mensual_dependencia)}
              </Text>
            </View>  */}

            {/* <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(v(datos.ingreso_mensual_dependencia)) || 0)}
              </Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {(() => {
                  // 1. Obtenemos el valor crudo de manera segura
                  const valorCrudo = datos?.ingreso_mensual_dependencia;
                  const valorTexto = String(valorCrudo || "").toLowerCase();

                  // 2. Si es un texto que contiene "desde", o si directamente no es un número válido,
                  // mostramos el valor original procesado por v() sin formatear.
                  if (
                    valorTexto.includes("desde") ||
                    isNaN(Number(valorCrudo))
                  ) {
                    return v(valorCrudo);
                  }

                  // 3. Si es un número real, aplicamos el formateador.
                  return new Intl.NumberFormat("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(v(valorCrudo)) || 0);
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>INGRESO:</Text>
              <Text style={styles.value}>
                {s(datos.ingreso_empresa_dependencia)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>
                {v(datos.telefono_empresa_dependencia)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>RAMO:</Text>
              <Text style={styles.value}>
                {v(datos.ramo_empresa_dependencia)}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.label}>DIRECCIÓN:</Text>
              <Text style={styles.value}>
                {v(datos.direccion_empresa_dependencia)}
              </Text>
            </View>
          </View>
        </View>

        {/* 14. NEGOCIO PROPIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. NEGOCIO PROPIO</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>EMPRESA:</Text>
              <Text style={styles.value}>{v(datos.empresa_negocio)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>RIF:</Text>
              <Text style={styles.value}>{v(datos.rif_negocio)}</Text>
            </View>

            {/* <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {v(datos.ingreso_mensual_negocio)}
              </Text>
            </View> */}

            {/* <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(v(datos.ingreso_mensual_negocio)) || 0)}
              </Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>REMUNERACIÓN:</Text>
              <Text style={styles.value}>
                {(() => {
                  // 1. Obtenemos el valor crudo de manera segura
                  const valorCrudo = datos?.ingreso_mensual_negocio;
                  const valorTexto = String(valorCrudo || "").toLowerCase();

                  // 2. Si es un texto que contiene "desde", o si directamente no es un número válido,
                  // mostramos el valor original procesado por v() sin formatear.
                  if (
                    valorTexto.includes("desde") ||
                    isNaN(Number(valorCrudo))
                  ) {
                    return v(valorCrudo);
                  }

                  // 3. Si es un número real, aplicamos el formateador.
                  return new Intl.NumberFormat("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(v(valorCrudo)) || 0);
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CONSTITUCIÓN:</Text>
              <Text style={styles.value}>{s(datos.fecha_fundacion)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO:</Text>
              <Text style={styles.value}>{v(datos.telefono_negocio)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>RAMO:</Text>
              <Text style={styles.value}>{v(datos.ramo_negocio)}</Text>
            </View>
          </View>

          <View style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.label}>DIRECCIÓN DE LA EMPRESA:</Text>
              <Text style={styles.value}>{v(datos.direccion_negocio)}</Text>
            </View>
          </View>
        </View>

        {/* 15. DATOS DEL REGISTRO DEL NEGOCIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            15. DATOS DEL REGISTRO DEL NEGOCIO
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>REGISTRO:</Text>
              <Text style={styles.value}>{v(datos.nombre_registro)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>NÚMERO:</Text>
              <Text style={styles.value}>{v(datos.numero_registro)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>FOLIO:</Text>
              <Text style={styles.value}>{v(datos.numero_folio)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TOMO:</Text>
              <Text style={styles.value}>{v(datos.tomo_registro)}</Text>
            </View>
          </View>
        </View>

        {/* 16. PROVEEDORES Y CLIENTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. PROVEEDORES Y CLIENTES</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PROVEEDOR:</Text>
              <Text style={styles.value}>{v(datos.proveedores)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>CONTACTO PROVEEDOR:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>UBICACIÓN PROVEEDOR:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO PROVEEDOR:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>CLIENTE:</Text>
              <Text style={styles.value}>{v(datos.clientes)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>CONTACTO CLIENTE:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>UBICACIÓN CLIENTE:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TELÉFONO CLIENTE:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>

        {/* 17. OTRAS FUENTES DE INGRESO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>17. OTRAS FUENTES DE INGRESO</Text>

          <View style={styles.grid}></View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>FUENTE DE INGRESOS:</Text>
              <Text style={styles.value}>{v(datos.fuente_ingresos)}</Text>
            </View>

            {/* <View style={styles.col}>
              <Text style={styles.label}>MONTO MENSUAL:</Text>
              <Text style={styles.value}>
                {v(datos.strotromontoingresomensual)}
              </Text>
            </View> */}

            {/* <View style={styles.col}>
              <Text style={styles.label}>MONTO MENSUAL:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(v(datos.strotromontoingresomensual)) || 0)}
              </Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>MONTO MENSUAL:</Text>
              <Text style={styles.value}>
                {(() => {
                  // 1. Obtenemos el valor crudo de manera segura
                  const valorCrudo = datos?.strotromontoingresomensual;
                  const valorTexto = String(valorCrudo || "").toLowerCase();

                  // 2. Si es un texto que contiene "desde", o si directamente no es un número válido,
                  // mostramos el valor original procesado por v() sin formatear.
                  if (
                    valorTexto.includes("desde") ||
                    isNaN(Number(valorCrudo))
                  ) {
                    return v(valorCrudo);
                  }

                  // 3. Si es un número real, aplicamos el formateador.
                  return new Intl.NumberFormat("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(v(valorCrudo)) || 0);
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* 18. PERFIL DE INVERSIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>18. PERFIL DE INVERSIÓN</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PERFIL DE RIESGO:</Text>
              <Text style={styles.value}>{v(datos.perfil_riesgo)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TIENE EXPERIENCIA:</Text>
              <Text style={styles.value}>{v(datos.tiene_experiencia)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>OBJETIVO DE INVERSIÓN:</Text>
              <Text style={styles.value}>{v(datos.objetivo_inversion)}</Text>
            </View>

            {/* <View style={styles.col}>
              <Text style={styles.label}>DESCRIPCIÓN OBJETIVO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View> */}
          </View>
        </View>

        {/* 19. INFORMACIÓN DEL PRODUCTO O SERVICIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            19. INFORMACIÓN DEL PRODUCTO O SERVICIO
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PRODUCTO:</Text>
              <Text style={styles.value}>{v(datos.producto)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TIPO:</Text>
              <Text style={styles.value}>{v(datos.tipo_producto)}</Text>
            </View>

            {/* <View style={styles.col}>
              <Text style={styles.label}>NÚMERO:</Text>
              <Text style={styles.value}>{v(datos.numero_producto)}</Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>MONEDA:</Text>
              <Text style={styles.value}>{v(datos.moneda)}</Text>
            </View>
          </View>
        </View>

        {/* 20. MOVILIZACIÓN DE FONDOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>20. MOVILIZACIÓN DE FONDOS</Text>

          <View style={styles.grid}>
            {/* <View style={styles.col}>
              <Text style={styles.label}>MONTO PROMEDIO:</Text>
              <Text style={styles.value}>
                {v(datos.monto_promedio_mensual)}
              </Text>
            </View> */}

            <View style={styles.col}>
              <Text style={styles.label}>MONTO PROMEDIO:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(v(datos.monto_promedio_mensual)) || 0)}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>CANTIDAD DE OPERACIONES:</Text>
              <Text style={styles.value}>{v(datos.cantidad_operaciones)}</Text>
            </View>
          </View>
        </View>

        {/* 21. FONDOS DEL EXTERIOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>21. FONDOS DEL EXTERIOR</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PAÍS ORÍGEN DE FONDO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>PAÍS DESTINO DE FONDO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>MONEDA VIRTUAL:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>
          </View>
        </View>

        {/* 22. MOTIVOS Y ORIGEN Y DESTINO DE LOS FONDOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            22. MOTIVOS Y ORIGEN Y DESTINO DE LOS FONDOS
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>ORIGEN DE LOS FONDOS:</Text>
              <Text style={styles.value}>{v(datos.origen_fondos)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>DESTINO DE LOS FONDOS:</Text>
              <Text style={styles.value}>{v(datos.destino_fondos)}</Text>
            </View>
          </View>
        </View>

        {/* 23. OTROS PRODUCTOS EN LA INSTITUCIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            23. OTROS PRODUCTOS EN LA INSTITUCIÓN
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PRODUCTO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>TIPO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>NÚMERO:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>MONEDA:</Text>
              <Text style={styles.value}>{v(datos.test)}</Text>
            </View>
          </View>
        </View>

        {/* 24. DECLARACIÓN JURADA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24. DECLARACIÓN JURADA</Text>

          {/* Datos del declarante en una línea continua */}
          <View
            style={{ flexDirection: "row", marginBottom: 5, flexWrap: "wrap" }}
          >
            <Text style={styles.label}>YO:</Text>
            <Text style={[styles.value, { marginRight: 10 }]}>
              {v(datos.nombres)} {v(datos.apellidos)}
            </Text>

            <Text style={styles.label}>IDENTIFICADO (A) CON C.I. Nº:</Text>
            <Text style={[styles.value, { marginRight: 10 }]}>
              {v(datos.cedula)}
            </Text>

            <Text style={styles.label}>Y CON DOMICILIO EN:</Text>
            <Text style={styles.value}>{v(datos.ciudad)}</Text>
          </View>

          {/* Texto legal en un solo bloque */}
          <View style={{ marginTop: 2 }}>
            <Text style={{ textAlign: "justify" }}>
              <Text style={styles.label}>
                DECLARO BAJO JURAMENTO LO SIGUIENTE:{" "}
              </Text>
              DECLARO BAJO JURAMENTO: 1. TODA LA INFORMACIÓN PROPORCIONADA ES
              FIDEDIGNA, LEGAL, EXACTA Y VERDADERA. 2. SOY RESPONSABLE DE LA
              VERACIDAD Y ME COMPROMETO A NOTIFICAR CUALQUIER CAMBIO. 3. ACEPTO
              EXPRESAMENTE LAS CONDICIONES DEL CONTRATO DE APERTURA DE CUENTA DE
              CORRETAJE.
            </Text>
          </View>
        </View>

        {/* SECCIÓN: FIRMAS Y HUELLA */}
        <View style={{ marginTop: 30, marginBottom: 30 }} wrap={false}>
          <View
            style={{
              //flexDirection: "row",
              //justifyContent: "space-between",
              //alignItems: "flex-end",
              alignItems: "center",
            }}
          >
            {/* Espacio para el Cliente */}
            <View style={{ width: "20%", alignItems: "center" }}>
              <View
              /* style={{
                  width: 40,
                  height: 50,
                  borderWidth: 0.5,
                  borderColor: "#666",
                  marginBottom: 5,
                  borderStyle: "dashed",
                }} */
              />
              {/* <Text style={{ fontSize: 5, color: "#666", marginBottom: 15 }}>
                HUELLA DACTILAR (IZQ/DER)
              </Text> */}

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#000",
                  width: "100%",
                  paddingTop: 3,
                  alignItems: "center",
                }}
              >
                <Text style={styles.label}>FIRMA DEL INVERSIONISTA</Text>
                <Text style={{ fontSize: 5 }}>C.I.: {v(datos.cedula)}</Text>

                <Text style={{ fontSize: 5 }}>
                  {v(datos.nombres)} {v(datos.apellidos)}
                </Text>
              </View>
            </View>

            {/* Espacio para la Institución */}
            {/* <View style={{ width: "45%", alignItems: "center" }}>
              <View style={{ height: 65 }} />
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#000",
                  width: "100%",
                  paddingTop: 3,
                  alignItems: "center",
                }}
              >
                <Text style={styles.label}>MERCOSUR CASA DE BOLSA</Text>
                <Text style={{ fontSize: 5 }}>
                  FIRMA Y SELLO DEL FUNCIONARIO RECEPTOR
                </Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* 25. NIVEL DE RIESGO LC / FT / FPADM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            25. NIVEL DE RIESGO LC / FT / FPADM{" "}
          </Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>ALTO:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>MODERADO:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>BAJO:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>

          <View style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.label}>OBSERVACIONES:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>

        {/* 26. OTROS PRODUCTOS EN LA INSTITUCIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>26. CONTROL DEL PROCESO</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>PREPARADO POR:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FECHA PREPARACIÓN:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>REVISADO POR:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FECHA REVISIÓN:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>AUTORIZADO POR:</Text>
              <Text style={styles.value}></Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>FECHA AUTORIZACIÓN:</Text>
              <Text style={styles.value}></Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FormatoFicha;
