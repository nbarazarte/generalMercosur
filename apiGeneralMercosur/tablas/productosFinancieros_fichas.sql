-- Table: onboarding.productosFinancieros_fichas
    
-- DROP TABLE IF EXISTS onboarding.productosFinancieros_fichas;

CREATE TABLE IF NOT EXISTS onboarding.productosFinancieros_fichas
(
    id bigint NOT NULL DEFAULT nextval('onboarding.productosFinancieros_fichas_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    productoFinanciero_id integer NOT NULL,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT productosFinancieros_fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES public.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.productosFinancieros_fichas
    OWNER to postgres;