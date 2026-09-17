-- Table: onboarding.referencias_fichas
    
-- DROP TABLE IF EXISTS onboarding.referencias_fichas;

CREATE TABLE IF NOT EXISTS onboarding.referencias_fichas
(
    id bigint NOT NULL DEFAULT nextval('onboarding.referencias_fichas_id_seq'::regclass),
    ficha_id bigint NOT NULL,    
    pais_id integer NOT NULL,
    tipo_cedula_id integer NOT NULL,    
    str_cedula character varying(8) COLLATE pg_catalog."default",
    sexo_id integer NOT NULL,
    str_primer_nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    str_segundo_nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    str_primer_apellido character varying(50) COLLATE pg_catalog."default" NOT NULL,
    str_segundo_apellido character varying(50) COLLATE pg_catalog."default" NOT NULL,
    codigo_celular_id character varying(5) COLLATE pg_catalog."default" NOT NULL,
    str_celular character varying(15) COLLATE pg_catalog."default" NOT NULL,
    codigo_celular_secundario_id character varying(5) COLLATE pg_catalog."default",
    pais_direccion_id integer NOT NULL,
    estado_id integer NOT NULL,
    municipio_id integer NOT NULL,
    parroquia_id integer NOT NULL,
    str_direccion_residencia text COLLATE pg_catalog."default" NOT NULL,
    codigo_postal_id integer NOT NULL,
    bol_eliminado boolean NOT NULL DEFAULT false,

    CONSTRAINT referencias_fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.referencias_fichas
    OWNER to postgres;