-- Table: onboarding.bancos_fichas
    
-- DROP TABLE IF EXISTS onboarding.bancos_fichas;

CREATE TABLE IF NOT EXISTS onboarding.bancos_fichas
(
    id bigint NOT NULL DEFAULT nextval('onboarding.bancos_fichas_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    bancos_id integer NOT NULL,
    str_cuenta character varying(50) COLLATE pg_catalog."default" NOT NULL,
    tipo_cuenta_id integer NOT NULL,
    monto_ingreso_mensual numeric(15,2) NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    bol_eliminado boolean NOT NULL DEFAULT false,

    CONSTRAINT bancos_fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.bancos_fichas
    OWNER to postgres;