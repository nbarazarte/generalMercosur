-- Table: onboarding.relaciondependencia

-- DROP TABLE IF EXISTS onboarding.relaciondependencia;

CREATE TABLE IF NOT EXISTS onboarding.relaciondependencia
(
    id integer NOT NULL DEFAULT nextval('onboarding.relaciondependencia_id_seq'::regclass),
    ficha_id integer NOT NULL,
    usuario_id integer NOT NULL,
    str_nombre_empresa character varying(150) COLLATE pg_catalog."default",
    str_rif_empresa character varying(15) COLLATE pg_catalog."default",
    str_ramo text COLLATE pg_catalog."default",
    str_cargo character varying(100) COLLATE pg_catalog."default",
    pais_id integer,
    estado_id integer,
    municipio_id integer,
    parroquia_id integer,
    str_direccion text COLLATE pg_catalog."default",
    str_telefono character varying(15) COLLATE pg_catalog."default",
    bol_eliminado boolean DEFAULT false,
    fecha_creacion timestamp with time zone DEFAULT now(),
    str_monto_ingreso_mensual character varying(8) COLLATE pg_catalog."default",
    str_fecha_ingreso character varying(10) COLLATE pg_catalog."default",
    CONSTRAINT relaciondependencia_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES onboarding.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.relaciondependencia
    OWNER to postgres;