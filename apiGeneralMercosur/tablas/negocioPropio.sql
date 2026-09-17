-- Table: onboarding.negociopropio

-- DROP TABLE IF EXISTS onboarding.negociopropio;

CREATE TABLE IF NOT EXISTS onboarding.negociopropio
(
    id integer NOT NULL DEFAULT nextval('onboarding.negociopropio_id_seq'::regclass),
    ficha_id integer NOT NULL,
    usuario_id integer NOT NULL,
    str_nombre_negocio character varying(150) COLLATE pg_catalog."default",
    str_rif_negocio character varying(15) COLLATE pg_catalog."default",
    str_ramo text COLLATE pg_catalog."default",
    str_cargo character varying(100) COLLATE pg_catalog."default",
    pais_id integer,
    estado_id integer,
    municipio_id integer,
    parroquia_id integer,
    str_direccion text COLLATE pg_catalog."default",
    codigo_postal_id integer,
    str_telefono character varying(15) COLLATE pg_catalog."default",
    str_nombre_registro character varying(150) COLLATE pg_catalog."default",
    str_numero_registro character varying(15) COLLATE pg_catalog."default",
    str_numero_folio character varying(15) COLLATE pg_catalog."default",
    str_numero_tomo character varying(15) COLLATE pg_catalog."default",
    str_proveedores text COLLATE pg_catalog."default",
    str_clientes text COLLATE pg_catalog."default",
    bol_eliminado boolean NOT NULL DEFAULT false,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    str_fecha_fundacion character varying(10) COLLATE pg_catalog."default",
    str_monto_ingreso_mensual character varying(8) COLLATE pg_catalog."default",
    CONSTRAINT negocios_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES onboarding.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.negociopropio
    OWNER to postgres;