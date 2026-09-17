-- Table: onboarding.fichas

-- DROP TABLE IF EXISTS onboarding.fichas;

CREATE TABLE IF NOT EXISTS onboarding.fichas
(
    id bigint NOT NULL DEFAULT nextval('onboarding.fichas_id_seq'::regclass),
    usuario_id integer NOT NULL,
    institucion_id integer,
    pais_id integer,
    str_cedula character varying(20) COLLATE pg_catalog."default",
    str_cedula_secundaria character varying(20) COLLATE pg_catalog."default",
    sexo_id integer,
    str_primer_nombre character varying(50) COLLATE pg_catalog."default",
    str_segundo_nombre character varying(50) COLLATE pg_catalog."default",
    str_primer_apellido character varying(50) COLLATE pg_catalog."default",
    str_segundo_apellido character varying(50) COLLATE pg_catalog."default",
    str_celular character varying(15) COLLATE pg_catalog."default",
    str_celular_secundario character varying(15) COLLATE pg_catalog."default",
    str_telefono character varying(15) COLLATE pg_catalog."default",
    estado_civil_id integer,
    fecha_nacimiento timestamp with time zone,
    str_ciudad character varying(100) COLLATE pg_catalog."default",
    profesion_id integer,
    monto_ingreso_mensual numeric(15,2),
    actividad_economica_id integer,
    str_actividad_economica_descripcion text COLLATE pg_catalog."default",
    fuente_ingresos_id integer,
    personas_dependientes integer,
    pais_nacionalidad_id integer,
    estado_id integer,
    municipio_id integer,
    parroquia_id integer,
    str_direccion_residencia text COLLATE pg_catalog."default",
    str_codigo_postal character varying(5) COLLATE pg_catalog."default",
    tipo_vivienda_id integer,
    str_nombre_organizacion_pep text COLLATE pg_catalog."default",
    str_cargo_pep character varying(100) COLLATE pg_catalog."default",
    pais_pep_id integer,
    fecha_ingreso_pep timestamp with time zone,
    fecha_egreso_pep timestamp with time zone,
    str_nombre_organizacion_pep_relacionado text COLLATE pg_catalog."default",
    str_cargo_pep_relacionado character varying(100) COLLATE pg_catalog."default",
    pais_pep_relacionado_id integer,
    fecha_ingreso_relacionado_pep timestamp with time zone,
    fecha_egreso_relacionado_pep timestamp with time zone,
    sexo_pep_relacionado_id integer,
    str_primer_nombre_pep_relacionado character varying(50) COLLATE pg_catalog."default",
    str_segundo_nombre_pep_relacionado character varying(50) COLLATE pg_catalog."default",
    str_primer_apellido_pep_relacionado character varying(50) COLLATE pg_catalog."default",
    str_segundo_apellido_pep_relacionado character varying(50) COLLATE pg_catalog."default",
    str_nombre_organizacion_pep_vinculo text COLLATE pg_catalog."default",
    str_cargo_pep_vinculo character varying(100) COLLATE pg_catalog."default",
    pais_pep_vinculo_id integer,
    fecha_ingreso_vinculo_pep timestamp with time zone,
    fecha_egreso_vinculo_pep timestamp with time zone,
    str_primer_nombre_pep_vinculo character varying(50) COLLATE pg_catalog."default",
    str_segundo_nombre_pep_vinculo character varying(50) COLLATE pg_catalog."default",
    str_primer_apellido_pep_vinculo character varying(50) COLLATE pg_catalog."default",
    str_segundo_apellido_pep_vinculo character varying(50) COLLATE pg_catalog."default",
    str_objetivo_inversion text COLLATE pg_catalog."default",
    str_objetivo_inversion_descripcion_enfoque text COLLATE pg_catalog."default",
    toleracia_riesgo_id integer,
    bol_experiencia_inversion boolean DEFAULT false,
    str_experiencia_inversion_descripcion text COLLATE pg_catalog."default",
    tipo_cuenta_id integer,
    monto_promedio_compras numeric(15,2),
    monto_promedio_ventas numeric(15,2),
    monto_promedio_depositos numeric(15,2),
    usuario_verificacion_cumplimiento_id integer,
    nivel_riesgo_asignado_id integer,
    usuario_preparado_cumplimiento_id integer,
    usuario_revisado_cumplimiento_id integer,
    status_cumplimiento_id integer,
    fecha_revision_cumplimiento timestamp with time zone,
    paso_ficha_id integer,
    tipo_solicitud_id integer,
    str_lugar text COLLATE pg_catalog."default",
    bol_ficha_completa boolean DEFAULT false,
    bol_eliminado boolean DEFAULT false,
    fecha_actualizacion timestamp with time zone DEFAULT now(),
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    carga_familiar_id integer,
    dependencia_id integer,
    negocio_propio_id integer,
    pais_otra_nacionalidad_id integer,
    str_ruta_cedula text COLLATE pg_catalog."default",
    str_ruta_rif text COLLATE pg_catalog."default",
    str_email text COLLATE pg_catalog."default",
    categoria_especial_id integer,
    str_monto_promedio_mensual character varying(20) COLLATE pg_catalog."default",
    str_cantidad_operaciones character varying(15) COLLATE pg_catalog."default",
    pais_id_envia_recibe_origen integer,
    pais_id_envia_recibe_destino integer,
    uso_modeda_virtual_id integer,
    str_origen_fondos text COLLATE pg_catalog."default",
    str_destino_fondos text COLLATE pg_catalog."default",
    motivos_id integer,
    condicion_pep_id integer,
    relacionado_pep_id integer,
    nacionalidadpeprelacionado_id integer,
    tipodocrelacionadopep_id integer,
    str_cedularelacionado character varying(15) COLLATE pg_catalog."default",
    tiporelacionrelacionado_id integer,
    vinculopep_id integer,
    nacionalidadpepvinculo_id integer,
    tipodocvinculopep_id integer,
    str_cedulavinculo character varying(15) COLLATE pg_catalog."default",
    tiporelacionvinculo_id integer,
    CONSTRAINT fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_usuario_id FOREIGN KEY (usuario_id)
        REFERENCES public.usuarios (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.fichas
    OWNER to postgres;
-- Index: idx_fichas_cedula

-- DROP INDEX IF EXISTS onboarding.idx_fichas_cedula;

CREATE INDEX IF NOT EXISTS idx_fichas_cedula
    ON onboarding.fichas USING btree
    (str_cedula COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_fichas_usuario_id

-- DROP INDEX IF EXISTS onboarding.idx_fichas_usuario_id;

CREATE INDEX IF NOT EXISTS idx_fichas_usuario_id
    ON onboarding.fichas USING btree
    (usuario_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: uidx_fichas_usuario_id

-- DROP INDEX IF EXISTS onboarding.uidx_fichas_usuario_id;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_fichas_usuario_id
    ON onboarding.fichas USING btree
    (usuario_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default
    WHERE bol_eliminado IS FALSE;











    -- CONSTRAINTS DE LLAVE FORÁNEA (Ajustar nombres de tablas según tu esquema)
    --CONSTRAINT fk_institucion FOREIGN KEY (institucion_id) REFERENCES public.instituciones (id),
    --CONSTRAINT fk_pais FOREIGN KEY (pais_id) REFERENCES public.paises (id),
    --CONSTRAINT fk_estado FOREIGN KEY (estado_id) REFERENCES public.estados (id),
    --CONSTRAINT fk_municipio FOREIGN KEY (municipio_id) REFERENCES public.municipios (id),
    --CONSTRAINT fk_parroquia FOREIGN KEY (parroquia_id) REFERENCES public.parroquias (id),
    --CONSTRAINT fk_sexo FOREIGN KEY (sexo_id) REFERENCES public.sexos (id),
    --CONSTRAINT fk_estado_civil FOREIGN KEY (estado_civil_id) REFERENCES public.estados_civiles (id),
    --CONSTRAINT fk_profesion FOREIGN KEY (profesion_id) REFERENCES public.profesiones (id),
    --CONSTRAINT fk_banco FOREIGN KEY (banco_id) REFERENCES public.bancos (id),
    --CONSTRAINT fk_tipo_cuenta_bancaria FOREIGN KEY (tipo_cuenta_bancaria_id) REFERENCES public.tipos_cuentas_bancarias (id),
    --CONSTRAINT fk_status_cumplimiento FOREIGN KEY (status_cumplimiento_id) REFERENCES public.status_cumplimiento (id)    