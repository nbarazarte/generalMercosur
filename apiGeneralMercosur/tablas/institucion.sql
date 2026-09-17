-- Table: onboarding.institucion
    
-- DROP TABLE IF EXISTS onboarding.institucion;

CREATE TABLE IF NOT EXISTS onboarding.institucion
(
    id bigint NOT NULL DEFAULT nextval('onboarding.institucion_id_seq'::regclass),
    str_nombre_empresa character varying(50) COLLATE pg_catalog."default" NOT NULL,
    str_rif_empresa character varying(15) COLLATE pg_catalog."default" NOT NULL,
    str_direccion text COLLATE pg_catalog."default" NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    bol_eliminado

    CONSTRAINT institucion_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.institucion
    OWNER to postgres;