-- Table: onboarding.enviaRecibe_fichas
    
-- DROP TABLE IF EXISTS onboarding.enviaRecibe_fichas;

CREATE TABLE IF NOT EXISTS onboarding.enviaRecibe_fichas
(
    id bigint NOT NULL DEFAULT nextval('onboarding.enviaRecibe_fichas_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    enviaRecibe_id integer NOT NULL,
    pais_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    moneda_id integer NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    bol_eliminado boolean NOT NULL DEFAULT false,

    CONSTRAINT enviaRecibe_fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.enviaRecibe_fichas
    OWNER to postgres;