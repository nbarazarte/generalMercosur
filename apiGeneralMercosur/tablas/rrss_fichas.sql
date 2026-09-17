-- Table: onboarding.rrss_fichas

-- DROP TABLE IF EXISTS onboarding.rrss_fichas;

CREATE TABLE IF NOT EXISTS onboarding.rrss_fichas
(
    id integer NOT NULL DEFAULT nextval('onboarding.rrss_fichas_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    rrss_id integer,
    usuario_id integer NOT NULL,
    bol_eliminado boolean NOT NULL DEFAULT false,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT rrss_fichas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES onboarding.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.rrss_fichas
    OWNER to postgres;
-- Index: idx_rrss_fichas_activos

-- DROP INDEX IF EXISTS onboarding.idx_rrss_fichas_activos;

CREATE INDEX IF NOT EXISTS idx_rrss_fichas_activos
    ON onboarding.rrss_fichas USING btree
    (ficha_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default
    WHERE bol_eliminado = false;
-- Index: idx_rrss_fichas_ficha_id

-- DROP INDEX IF EXISTS onboarding.idx_rrss_fichas_ficha_id;

CREATE INDEX IF NOT EXISTS idx_rrss_fichas_ficha_id
    ON onboarding.rrss_fichas USING btree
    (ficha_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_rrss_fichas_rrss_id

-- DROP INDEX IF EXISTS onboarding.idx_rrss_fichas_rrss_id;

CREATE INDEX IF NOT EXISTS idx_rrss_fichas_rrss_id
    ON onboarding.rrss_fichas USING btree
    (rrss_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_rrss_fichas_rrss_id_fk

-- DROP INDEX IF EXISTS onboarding.idx_rrss_fichas_rrss_id_fk;

CREATE INDEX IF NOT EXISTS idx_rrss_fichas_rrss_id_fk
    ON onboarding.rrss_fichas USING btree
    (rrss_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_rrss_fichas_usuario_id

-- DROP INDEX IF EXISTS onboarding.idx_rrss_fichas_usuario_id;

CREATE INDEX IF NOT EXISTS idx_rrss_fichas_usuario_id
    ON onboarding.rrss_fichas USING btree
    (usuario_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;