-- Table: onboarding.conyuges

-- DROP TABLE IF EXISTS onboarding.conyuges;

CREATE TABLE IF NOT EXISTS onboarding.conyuges
(
    id bigint NOT NULL DEFAULT nextval('onboarding.conyuges_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    pais_id integer NULL,
    tipo_cedula_id integer  NULL,
    str_cedula character varying(8) COLLATE pg_catalog."default" NULL,
    str_primer_nombre character varying(50) COLLATE pg_catalog."default" NULL,
    str_segundo_nombre character varying(50) COLLATE pg_catalog."default",
    str_primer_apellido character varying(50) COLLATE pg_catalog."default"  NULL,
    str_segundo_apellido character varying(50) COLLATE pg_catalog."default",
    codigo_celular_id character varying(5) COLLATE pg_catalog."default"  NULL,
    str_celular character varying(15) COLLATE pg_catalog."default"  NULL,
    codigo_celular_secundario_id character varying(5) COLLATE pg_catalog."default",
    str_celular_secundario character varying(15) COLLATE pg_catalog."default",
    codigo_telefono_id character varying(5) COLLATE pg_catalog."default"  NULL,
    str_telefono character varying(15) COLLATE pg_catalog."default"  NULL,
    fecha_nacimiento date  NULL,
    str_ciudad_nacimiento character varying(100) COLLATE pg_catalog."default"  NULL,
    profesion_id integer  NULL,
    
    fuente_ingresos_id integer  NULL,
    
    bol_eliminado boolean NOT NULL DEFAULT false,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT conyuges_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.conyuges
    OWNER to postgres;