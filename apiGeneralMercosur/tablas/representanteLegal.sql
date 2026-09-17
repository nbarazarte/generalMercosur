-- Table: onboarding.representantes

-- DROP TABLE IF EXISTS onboarding.representantes;

CREATE TABLE IF NOT EXISTS onboarding.representantes
(
    id integer NOT NULL DEFAULT nextval('onboarding.representantes_id_seq'::regclass),
    ficha_id bigint NOT NULL,
    usuario_id integer NOT NULL,
    pais_id integer,
    str_cedula character varying(8) COLLATE pg_catalog."default",
    str_primer_nombre character varying(50) COLLATE pg_catalog."default",
    str_segundo_nombre character varying(50) COLLATE pg_catalog."default",
    str_primer_apellido character varying(50) COLLATE pg_catalog."default",
    str_segundo_apellido character varying(50) COLLATE pg_catalog."default",
    codigo_celular_id character varying(5) COLLATE pg_catalog."default",
    str_celular character varying(15) COLLATE pg_catalog."default",
    str_celular_secundario character varying(15) COLLATE pg_catalog."default",
    str_telefono character varying(15) COLLATE pg_catalog."default",
    fecha_nacimiento date,
    str_ciudad_nacimiento character varying(100) COLLATE pg_catalog."default",
    profesion_id integer,
    pais_direccion_id integer,
    estado_id integer,
    municipio_id integer,
    parroquia_id integer,
    str_direccion_residencia text COLLATE pg_catalog."default",
    codigo_postal_id integer,
    bol_eliminado boolean NOT NULL DEFAULT false,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    str_ruta_cedula text COLLATE pg_catalog."default",
    str_ruta_rif text COLLATE pg_catalog."default",
    CONSTRAINT representantes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ficha_id FOREIGN KEY (ficha_id)
        REFERENCES onboarding.fichas (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS onboarding.representantes
    OWNER to postgres;
-- Index: idx_representantes_ficha_id

-- DROP INDEX IF EXISTS onboarding.idx_representantes_ficha_id;

CREATE INDEX IF NOT EXISTS idx_representantes_ficha_id
    ON onboarding.representantes USING btree
    (ficha_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_representantes_geografico

-- DROP INDEX IF EXISTS onboarding.idx_representantes_geografico;

CREATE INDEX IF NOT EXISTS idx_representantes_geografico
    ON onboarding.representantes USING btree
    (estado_id ASC NULLS LAST, municipio_id ASC NULLS LAST, parroquia_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_representantes_nombres_busqueda

-- DROP INDEX IF EXISTS onboarding.idx_representantes_nombres_busqueda;

CREATE INDEX IF NOT EXISTS idx_representantes_nombres_busqueda
    ON onboarding.representantes USING btree
    (lower(str_primer_apellido::text) COLLATE pg_catalog."default" ASC NULLS LAST, lower(str_primer_nombre::text) COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_representantes_usuario_creador

-- DROP INDEX IF EXISTS onboarding.idx_representantes_usuario_creador;

CREATE INDEX IF NOT EXISTS idx_representantes_usuario_creador
    ON onboarding.representantes USING btree
    (usuario_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default
    WHERE bol_eliminado = false;