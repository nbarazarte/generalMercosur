--
-- PostgreSQL database dump
--

\restrict eptE7ZADTqGQglkpZvdU6LPQjmtzQEfYzYB9eOCynbdhDb7lQrFpYfI7E7ID0RT

-- Dumped from database version 18.6 (Ubuntu 18.6-1.pgdg22.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg24.04+2)

-- Started on 2026-10-01 16:42:17 -04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 32186)
-- Name: kcs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA kcs;


ALTER SCHEMA kcs OWNER TO postgres;

--
-- TOC entry 3800 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA kcs; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA kcs IS 'Esquema del sistema de la base de datos de conocimiento';


--
-- TOC entry 7 (class 2615 OID 32187)
-- Name: rrhh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA rrhh;


ALTER SCHEMA rrhh OWNER TO postgres;

--
-- TOC entry 3801 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA rrhh; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA rrhh IS 'Esquema que almacena las tablas del sistema de RRHH';


--
-- TOC entry 8 (class 2615 OID 32188)
-- Name: tickets; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tickets;


ALTER SCHEMA tickets OWNER TO postgres;

--
-- TOC entry 3802 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA tickets; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA tickets IS 'Esquema del Sistema de Tickets para ATC.';


--
-- TOC entry 276 (class 1255 OID 32189)
-- Name: crear_datos_tablas_public(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_datos_tablas_public() RETURNS void
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- 1. Departamento
    INSERT INTO cat_departamentos (id, str_nombre, str_descripcion, created_at, updated_at) 
    VALUES (1, 'Tecnología', 'Departamento de Tecnología y Sistemas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 2. Opciones
    INSERT INTO cat_opciones (id, str_nombre, bol_eliminado, fecha_creacion) 
    VALUES 
    (1, 'Usuarios y Accesos', FALSE, '11:15:58.109215-04'),
    (2, 'Sistemas', FALSE, '13:31:51.405615-04');

    -- 3. Roles
    INSERT INTO cat_roles (id, str_nombre, str_descripcion, created_at, updated_at) 
    VALUES 
    (1, 'Administrador', 'Administrador general de los sistemas', '2026-09-09 11:28:55.692406-04', '2026-09-09 11:28:55.692406-04');

    -- 4. Sistemas
    INSERT INTO cat_sistemas (id, str_sistema, str_descripcion, bol_activo, created_at, updated_at, str_ruta_sistema) 
    VALUES 
    (1, 'Administración General', 'Gestiona la configuración del sistema.', FALSE, '2026-09-09 11:32:38.520464-04', '2026-09-09 11:32:38.520464-04','/admin');

    -- 5. Usuario Administrador
    INSERT INTO tbl_usuarios (
        id, departamento_id, str_cedula, str_nombre, str_apellido,
        str_email, str_password, bol_activo, created_at, updated_at, str_usuario
    ) VALUES (
        1, 1, 'V-00000000', 'Admin', 'Mercosur',
        'sistemasmcdb@mercosur.com.ve', '$2a$10$0N9CZGs3cq1pMUMt/vOa7e0/TdWyd1ziWgs3zMQC4BvC4PykCLoDW',
        TRUE, '2026-09-10 13:13:24.007018-04', '2026-09-10 13:13:24.007018-04', 'admin'
    );

    -- 6. Rol-Sistema
    INSERT INTO tbl_roles_sistemas (id, rol_id, sistema_id, bol_activo, created_at, updated_at)
    VALUES (1, 1, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 7. Usuario-Rol-Sistema
    INSERT INTO tbl_usuarios_roles_sistemas (id, usuario_id, rol_sistema_id, bol_activo, created_at, updated_at)
    VALUES (1, 1, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 8. Asignar Opciones al Rol-Sistema
    INSERT INTO tbl_roles_sistemas_opciones (id, roles_sistemas_id, opcion_id)
    VALUES 
    (1, 1, 1),
    (2, 1, 2);

    -- 9. Actualizar secuencias autoincrementales
    PERFORM setval(pg_get_serial_sequence('cat_departamentos', 'id'), COALESCE(MAX(id), 1)) FROM cat_departamentos;
    PERFORM setval(pg_get_serial_sequence('cat_opciones', 'id'), COALESCE(MAX(id), 1)) FROM cat_opciones;
    PERFORM setval(pg_get_serial_sequence('cat_roles', 'id'), COALESCE(MAX(id), 1)) FROM cat_roles;
    PERFORM setval(pg_get_serial_sequence('cat_sistemas', 'id'), COALESCE(MAX(id), 1)) FROM cat_sistemas;
    PERFORM setval(pg_get_serial_sequence('tbl_usuarios', 'id'), COALESCE(MAX(id), 1)) FROM tbl_usuarios;
    PERFORM setval(pg_get_serial_sequence('tbl_roles_sistemas', 'id'), COALESCE(MAX(id), 1)) FROM tbl_roles_sistemas;
    PERFORM setval(pg_get_serial_sequence('tbl_usuarios_roles_sistemas', 'id'), COALESCE(MAX(id), 1)) FROM tbl_usuarios_roles_sistemas;
    PERFORM setval(pg_get_serial_sequence('tbl_roles_sistemas_opciones', 'id'), COALESCE(MAX(id), 1)) FROM tbl_roles_sistemas_opciones;

END;
$_$;


ALTER FUNCTION public.crear_datos_tablas_public() OWNER TO postgres;

--
-- TOC entry 277 (class 1255 OID 32190)
-- Name: limpiar_tablas_public(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limpiar_tablas_public() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    TRUNCATE TABLE 
        public.tbl_usuarios_opciones_excepciones,
        public.tbl_usuarios_roles_sistemas,
        public.tbl_roles_sistemas_opciones,
        public.tbl_auth_tokens,
        public.tbl_roles_sistemas,
        public.tbl_usuarios,
        public.cat_opciones,
        public.cat_roles,
        public.cat_sistemas,
        public.cat_departamentos,
        public.cat_datos_maestros
    RESTART IDENTITY CASCADE;

    RAISE NOTICE 'Se han vaciado las tablas y reiniciado sus contadores correctamente.';
END;
$$;


ALTER FUNCTION public.limpiar_tablas_public() OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 32191)
-- Name: tbl_kcs_articulos_id_seq; Type: SEQUENCE; Schema: kcs; Owner: postgres
--

CREATE SEQUENCE kcs.tbl_kcs_articulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE kcs.tbl_kcs_articulos_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 32192)
-- Name: cat_datos_maestros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_datos_maestros (
    id integer NOT NULL,
    str_tipo character varying(50) NOT NULL,
    str_nombre character varying(50) NOT NULL,
    str_descripcion text NOT NULL,
    bol_activo boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cat_datos_maestros OWNER TO postgres;

--
-- TOC entry 3803 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE cat_datos_maestros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_datos_maestros IS 'Esta tabla es el catalogo general de la base de datos con las listas mas comunes';


--
-- TOC entry 224 (class 1259 OID 32207)
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cat_datos_maestros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cat_datos_maestros_id_seq OWNER TO postgres;

--
-- TOC entry 3804 (class 0 OID 0)
-- Dependencies: 224
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_datos_maestros_id_seq OWNED BY public.cat_datos_maestros.id;


--
-- TOC entry 225 (class 1259 OID 32208)
-- Name: cat_departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_departamentos (
    id integer NOT NULL,
    str_nombre character varying(100) NOT NULL,
    str_descripcion character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cat_departamentos OWNER TO postgres;

--
-- TOC entry 3805 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE cat_departamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_departamentos IS 'Esta tabla contiene el listado de los departamentos de Mercosur';


--
-- TOC entry 226 (class 1259 OID 32217)
-- Name: cat_departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cat_departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cat_departamentos_id_seq OWNER TO postgres;

--
-- TOC entry 3806 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_departamentos_id_seq OWNED BY public.cat_departamentos.id;


--
-- TOC entry 227 (class 1259 OID 32218)
-- Name: cat_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_opciones (
    id integer NOT NULL,
    str_nombre text NOT NULL,
    bol_eliminado boolean DEFAULT false NOT NULL,
    fecha_creacion time with time zone DEFAULT now() NOT NULL,
    str_ruta_opcion text,
    str_icono character varying(50)
);


ALTER TABLE public.cat_opciones OWNER TO postgres;

--
-- TOC entry 3807 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE cat_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_opciones IS 'Esta tabla contiene las opciones de los sistemas';


--
-- TOC entry 228 (class 1259 OID 32229)
-- Name: cat_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_roles (
    id integer NOT NULL,
    str_nombre character varying(50) NOT NULL,
    str_descripcion character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cat_roles OWNER TO postgres;

--
-- TOC entry 3808 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE cat_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_roles IS 'Esta tabla contiene el listado de roles que puede tener un sistema (Un id de rol puede ser común para diferentes sistemas)';


--
-- TOC entry 229 (class 1259 OID 32238)
-- Name: cat_sistemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_sistemas (
    id integer NOT NULL,
    str_sistema character varying(50) NOT NULL,
    str_descripcion text,
    bol_activo boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    str_ruta_sistema character varying(50) NOT NULL,
    str_icono character varying(50),
    str_color character varying(30)
);


ALTER TABLE public.cat_sistemas OWNER TO postgres;

--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE cat_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_sistemas IS 'Contiene los nombres de los Sistemas Internos.';


--
-- TOC entry 230 (class 1259 OID 32252)
-- Name: tbl_auth_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_auth_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    str_device_id character varying(255),
    str_device_name character varying(255)
);


ALTER TABLE public.tbl_auth_tokens OWNER TO postgres;

--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_auth_tokens IS 'Esta tabla contiene los tokens de sesión de los usuarios';


--
-- TOC entry 231 (class 1259 OID 32265)
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_auth_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_auth_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 231
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_auth_tokens_id_seq OWNED BY public.tbl_auth_tokens.id;


--
-- TOC entry 232 (class 1259 OID 32266)
-- Name: tbl_opciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_opciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_opciones_id_seq OWNER TO postgres;

--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 232
-- Name: tbl_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_opciones_id_seq OWNED BY public.cat_opciones.id;


--
-- TOC entry 233 (class 1259 OID 32267)
-- Name: tbl_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_roles_id_seq OWNER TO postgres;

--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_id_seq OWNED BY public.cat_roles.id;


--
-- TOC entry 234 (class 1259 OID 32268)
-- Name: tbl_roles_sistemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles_sistemas (
    id integer NOT NULL,
    rol_id integer NOT NULL,
    sistema_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_DATE NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_DATE NOT NULL,
    bol_activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tbl_roles_sistemas OWNER TO postgres;

--
-- TOC entry 3814 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas IS 'Esta tabla contiene el catalogo de roles de los sistemas';


--
-- TOC entry 235 (class 1259 OID 32280)
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_roles_opciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_roles_opciones_id_seq OWNER TO postgres;

--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_opciones_id_seq OWNED BY public.tbl_roles_sistemas.id;


--
-- TOC entry 236 (class 1259 OID 32281)
-- Name: tbl_roles_sistemas_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles_sistemas_opciones (
    id integer NOT NULL,
    rol_sistema_id integer CONSTRAINT tbl_roles_sistemas_opciones_roles_sistemas_id_not_null NOT NULL,
    opcion_id integer NOT NULL
);


ALTER TABLE public.tbl_roles_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE tbl_roles_sistemas_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas_opciones IS 'Esta tabla contiene las opciones que tiene un rol en un sistema';


--
-- TOC entry 237 (class 1259 OID 32287)
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_roles_sistemas_opciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_roles_sistemas_opciones_id_seq OWNER TO postgres;

--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_sistemas_opciones_id_seq OWNED BY public.tbl_roles_sistemas_opciones.id;


--
-- TOC entry 238 (class 1259 OID 32288)
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_sistemas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_sistemas_id_seq OWNER TO postgres;

--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 238
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_sistemas_id_seq OWNED BY public.cat_sistemas.id;


--
-- TOC entry 239 (class 1259 OID 32289)
-- Name: tbl_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_usuarios (
    id integer NOT NULL,
    departamento_id integer NOT NULL,
    str_cedula character varying(14) NOT NULL,
    str_nombre character varying(50) NOT NULL,
    str_apellido character varying(50) NOT NULL,
    str_email character varying(100) NOT NULL,
    str_password character varying(255) NOT NULL,
    bol_activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dmt_fecha_nacimiento date,
    str_direccion text,
    str_usuario character varying(20),
    str_telefono character varying(13),
    str_contacto_emergencia character varying(13),
    fec_ultimo_acceso timestamp without time zone
);


ALTER TABLE public.tbl_usuarios OWNER TO postgres;

--
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios IS 'Esta tabla contiene el listado global de usuarios';


--
-- TOC entry 240 (class 1259 OID 32307)
-- Name: tbl_usuarios_opciones_excepciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_usuarios_opciones_excepciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    opcion_id integer NOT NULL,
    bol_permitido boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at time without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tbl_usuarios_opciones_excepciones OWNER TO postgres;

--
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE tbl_usuarios_opciones_excepciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_opciones_excepciones IS 'Esta tabla es para indicar que opciones no tendrá permitido un usuario en un sistema independientemente de su rol';


--
-- TOC entry 241 (class 1259 OID 32319)
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq OWNER TO postgres;

--
-- TOC entry 3821 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq OWNED BY public.tbl_usuarios_opciones_excepciones.id;


--
-- TOC entry 242 (class 1259 OID 32320)
-- Name: tbl_usuarios_roles_sistemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_usuarios_roles_sistemas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    rol_sistema_id integer NOT NULL,
    bol_activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_DATE NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.tbl_usuarios_roles_sistemas OWNER TO postgres;

--
-- TOC entry 3822 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE tbl_usuarios_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_roles_sistemas IS 'Esta tabla contiene el rol de un usuario en un sistema';


--
-- TOC entry 243 (class 1259 OID 32332)
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq OWNER TO postgres;

--
-- TOC entry 3823 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq OWNED BY public.tbl_usuarios_roles_sistemas.id;


--
-- TOC entry 244 (class 1259 OID 32333)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 3824 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.tbl_usuarios.id;


--
-- TOC entry 264 (class 1259 OID 32444)
-- Name: tbl_alertas; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_alertas (
    id integer NOT NULL,
    caso_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    str_tipo_alerta character varying(50) NOT NULL,
    str_mensaje text NOT NULL,
    bol_leido boolean DEFAULT false NOT NULL,
    fecha_generacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_lectura timestamp with time zone
);


ALTER TABLE tickets.tbl_alertas OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 32721)
-- Name: view_dashboard_alertas_seguridad; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_alertas_seguridad AS
 SELECT (u.id + 10000) AS id,
    'Usuario inactivo con accesos'::character varying AS titulo,
    concat(u.str_nombre, ' ', u.str_apellido) AS usuario,
    'Cuenta inactiva conserva roles asignados en el sistema'::text AS detalle,
    'danger'::text AS tipo,
    'Crítico'::text AS tiempo
   FROM (public.tbl_usuarios u
     JOIN public.tbl_usuarios_roles_sistemas urs ON (((u.id = urs.usuario_id) AND (urs.bol_activo = true))))
  WHERE (u.bol_activo = false)
UNION ALL
 SELECT a.id,
    COALESCE(a.str_tipo_alerta, 'Alerta del Sistema'::character varying) AS titulo,
    COALESCE(u.str_usuario, 'Sistema'::character varying) AS usuario,
    a.str_mensaje AS detalle,
        CASE
            WHEN (((a.str_tipo_alerta)::text ~~* '%WARNING%'::text) OR ((a.str_tipo_alerta)::text ~~* '%ERROR%'::text)) THEN 'warning'::text
            ELSE 'info'::text
        END AS tipo,
    to_char(a.fecha_generacion, 'DD/MM/YYYY HH24:MI'::text) AS tiempo
   FROM (tickets.tbl_alertas a
     LEFT JOIN public.tbl_usuarios u ON ((a.usuario_id = u.id)))
  WHERE (a.bol_leido = false);


ALTER VIEW public.view_dashboard_alertas_seguridad OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 32716)
-- Name: view_dashboard_distribucion_roles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_distribucion_roles AS
 SELECT r.id AS rol_id,
    r.str_nombre AS nombre,
    count(urs.id) AS total_asignaciones
   FROM (((public.cat_roles r
     JOIN public.tbl_roles_sistemas rs ON (((r.id = rs.rol_id) AND (rs.bol_activo = true))))
     JOIN public.tbl_usuarios_roles_sistemas urs ON (((rs.id = urs.rol_sistema_id) AND (urs.bol_activo = true))))
     JOIN public.tbl_usuarios u ON (((urs.usuario_id = u.id) AND (u.bol_activo = true))))
  GROUP BY r.id, r.str_nombre
  ORDER BY (count(urs.id)) DESC;


ALTER VIEW public.view_dashboard_distribucion_roles OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 32706)
-- Name: view_dashboard_kpis; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_kpis AS
 SELECT ( SELECT count(*) AS count
           FROM public.cat_sistemas
          WHERE (cat_sistemas.bol_activo = true)) AS total_sistemas,
    ( SELECT count(*) AS count
           FROM public.cat_opciones
          WHERE (cat_opciones.bol_eliminado = false)) AS total_opciones,
    ( SELECT count(*) AS count
           FROM public.tbl_usuarios) AS total_usuarios,
    ( SELECT count(*) AS count
           FROM public.tbl_usuarios
          WHERE (tbl_usuarios.bol_activo = true)) AS total_usuarios_activos,
    ( SELECT count(*) AS count
           FROM public.tbl_usuarios
          WHERE (tbl_usuarios.bol_activo = false)) AS total_usuarios_inactivos,
    ( SELECT count(*) AS count
           FROM public.cat_roles) AS total_roles;


ALTER VIEW public.view_dashboard_kpis OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 32726)
-- Name: view_dashboard_ultimos_accesos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_ultimos_accesos AS
 SELECT id,
    concat(str_nombre, ' ', str_apellido) AS usuario,
    str_email AS email,
    'Sesión activa'::text AS detalle,
    'success'::text AS tipo,
    COALESCE(to_char(fec_ultimo_acceso, 'DD/MM/YYYY HH24:MI'::text), to_char(updated_at, 'DD/MM/YYYY HH24:MI'::text), 'Reciente'::text) AS tiempo
   FROM public.tbl_usuarios u
  WHERE (bol_activo = true)
  ORDER BY COALESCE((fec_ultimo_acceso)::timestamp with time zone, updated_at) DESC
 LIMIT 10;


ALTER VIEW public.view_dashboard_ultimos_accesos OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 32711)
-- Name: view_dashboard_usuarios_por_sistema; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_usuarios_por_sistema AS
 SELECT s.id AS sistema_id,
    s.str_sistema AS nombre,
    COALESCE(s.str_color, '#2f6fed'::character varying) AS color,
    count(DISTINCT urs.usuario_id) AS total_usuarios
   FROM (((public.cat_sistemas s
     LEFT JOIN public.tbl_roles_sistemas rs ON (((s.id = rs.sistema_id) AND (rs.bol_activo = true))))
     LEFT JOIN public.tbl_usuarios_roles_sistemas urs ON (((rs.id = urs.rol_sistema_id) AND (urs.bol_activo = true))))
     LEFT JOIN public.tbl_usuarios u ON (((urs.usuario_id = u.id) AND (u.bol_activo = true))))
  WHERE (s.bol_activo = true)
  GROUP BY s.id, s.str_sistema, s.str_color
  ORDER BY (count(DISTINCT urs.usuario_id)) DESC;


ALTER VIEW public.view_dashboard_usuarios_por_sistema OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 32334)
-- Name: view_matriz_roles_opciones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_matriz_roles_opciones AS
SELECT
    NULL::integer AS rol_sistema_id,
    NULL::integer AS sistema_id,
    NULL::character varying(50) AS str_sistema,
    NULL::text AS str_descripcion,
    NULL::character varying(50) AS str_icono,
    NULL::character varying(30) AS str_color,
    NULL::integer AS rol_id,
    NULL::character varying(50) AS rol,
    NULL::text AS opciones_asignadas;


ALTER VIEW public.view_matriz_roles_opciones OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 32338)
-- Name: view_sistemas_opciones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_sistemas_opciones AS
 SELECT s.id AS sistema_id,
    s.str_sistema,
    s.str_descripcion,
    s.str_ruta_sistema,
    s.str_icono,
    s.str_color,
    rs.rol_id,
    o.id AS opcion_id,
    o.str_nombre AS opcion_nombre,
    o.str_icono AS opcion_icono,
    o.str_ruta_opcion,
    rso.id AS rol_sistema_opcion_id
   FROM (((public.cat_sistemas s
     JOIN public.tbl_roles_sistemas rs ON ((s.id = rs.sistema_id)))
     JOIN public.tbl_roles_sistemas_opciones rso ON ((rs.id = rso.rol_sistema_id)))
     JOIN public.cat_opciones o ON ((rso.opcion_id = o.id)))
  WHERE ((s.bol_activo = true) AND (rs.bol_activo = true) AND (o.bol_eliminado = false));


ALTER VIEW public.view_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 32343)
-- Name: view_usuarios_opciones_sistemas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_usuarios_opciones_sistemas AS
 SELECT u.id AS usuario_id,
    u.str_nombre AS usuario,
    rs.rol_id,
    r.str_nombre AS rol,
    rs.sistema_id,
    s.str_sistema AS sistema,
    s.str_icono AS icono,
    s.str_color AS color,
    s.str_descripcion AS descripcion,
    s.str_ruta_sistema AS ruta_sistema,
    o.id AS opcion_id,
    o.str_nombre AS opcion,
    o.str_icono AS opcion_icono,
    o.str_ruta_opcion AS ruta_opcion,
        CASE
            WHEN (exc.bol_permitido IS NOT NULL) THEN exc.bol_permitido
            WHEN (rso.id IS NOT NULL) THEN true
            ELSE false
        END AS tiene_permiso
   FROM (((((((public.tbl_usuarios u
     JOIN public.tbl_usuarios_roles_sistemas urs ON (((u.id = urs.usuario_id) AND (urs.bol_activo = true))))
     JOIN public.tbl_roles_sistemas rs ON (((urs.rol_sistema_id = rs.id) AND (rs.bol_activo = true))))
     JOIN public.tbl_roles_sistemas_opciones rso ON ((rs.id = rso.rol_sistema_id)))
     JOIN public.cat_opciones o ON (((rso.opcion_id = o.id) AND (o.bol_eliminado = false))))
     JOIN public.cat_sistemas s ON ((rs.sistema_id = s.id)))
     JOIN public.cat_roles r ON ((rs.rol_id = r.id)))
     LEFT JOIN public.tbl_usuarios_opciones_excepciones exc ON (((exc.usuario_id = u.id) AND (exc.opcion_id = o.id))))
  ORDER BY rs.rol_id, o.id;


ALTER VIEW public.view_usuarios_opciones_sistemas OWNER TO postgres;

--
-- TOC entry 3825 (class 0 OID 0)
-- Dependencies: 247
-- Name: VIEW view_usuarios_opciones_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.view_usuarios_opciones_sistemas IS 'Muestra que opciones tienen los usuarios en un sistema';


--
-- TOC entry 248 (class 1259 OID 32348)
-- Name: view_usuarios_permisos_detallados; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_usuarios_permisos_detallados AS
 SELECT u.id AS usuario_id,
    u.str_email,
    s.id AS sistema_id,
    s.str_sistema,
    r.id AS rol_id,
    r.str_nombre AS rol,
    o.id AS opcion_id,
    o.str_nombre AS opcion_permitida
   FROM ((((((public.tbl_usuarios u
     JOIN public.tbl_usuarios_roles_sistemas urs ON ((u.id = urs.usuario_id)))
     JOIN public.tbl_roles_sistemas rs ON ((urs.rol_sistema_id = rs.id)))
     JOIN public.cat_sistemas s ON ((rs.sistema_id = s.id)))
     JOIN public.cat_roles r ON ((rs.rol_id = r.id)))
     JOIN public.tbl_roles_sistemas_opciones rso ON ((rs.id = rso.rol_sistema_id)))
     JOIN public.cat_opciones o ON ((rso.opcion_id = o.id)))
  WHERE ((u.bol_activo = true) AND (urs.bol_activo = true) AND (rs.bol_activo = true) AND (o.bol_eliminado = false));


ALTER VIEW public.view_usuarios_permisos_detallados OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 32353)
-- Name: view_usuarios_roles_sistemas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_usuarios_roles_sistemas AS
 SELECT u.id AS usuario_id,
    u.str_usuario AS usuario,
    u.str_cedula AS cedula,
    concat(u.str_nombre, ' ', u.str_apellido) AS nombre,
    u.str_email AS correo,
    d.id AS departamento_id,
    d.str_nombre AS departamento,
    s.id AS sistema_id,
    s.str_sistema,
    r.id AS rol_id,
    r.str_nombre AS rol,
    urs.bol_activo AS asignacion_activa
   FROM (((((public.tbl_usuarios u
     JOIN public.cat_departamentos d ON ((u.departamento_id = d.id)))
     JOIN public.tbl_usuarios_roles_sistemas urs ON ((u.id = urs.usuario_id)))
     JOIN public.tbl_roles_sistemas rs ON ((urs.rol_sistema_id = rs.id)))
     JOIN public.cat_sistemas s ON ((rs.sistema_id = s.id)))
     JOIN public.cat_roles r ON ((rs.rol_id = r.id)))
  WHERE ((u.bol_activo = true) AND (urs.bol_activo = true));


ALTER VIEW public.view_usuarios_roles_sistemas OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 32358)
-- Name: tbl_amonestaciones; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_amonestaciones (
    id integer NOT NULL,
    usuario_id integer,
    motivo_id integer,
    str_motivo_descripcion text,
    dmt_fecha date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_amonestaciones OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 32368)
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_amonestaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_amonestaciones_id_seq OWNER TO postgres;

--
-- TOC entry 3826 (class 0 OID 0)
-- Dependencies: 251
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_amonestaciones_id_seq OWNED BY rrhh.tbl_amonestaciones.id;


--
-- TOC entry 252 (class 1259 OID 32369)
-- Name: tbl_carga_familiar; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_carga_familiar (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    parentesco_id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    fecha_nacimiento date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_carga_familiar OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 32380)
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_carga_familiar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_carga_familiar_id_seq OWNER TO postgres;

--
-- TOC entry 3827 (class 0 OID 0)
-- Dependencies: 253
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_carga_familiar_id_seq OWNED BY rrhh.tbl_carga_familiar.id;


--
-- TOC entry 254 (class 1259 OID 32381)
-- Name: tbl_expediente; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_expediente (
    id integer NOT NULL,
    str_num_expediente integer,
    usuario_id integer,
    dmt_fecha_exp date,
    bol_cv boolean,
    bol_foto boolean,
    bol_referencias boolean,
    bol_cert_est boolean,
    bol_cert_cap boolean,
    bol_compr_dom boolean,
    bol_acdo_conf boolean,
    bol_cap_gen boolean,
    bol_cap_area boolean,
    otros_cursos integer,
    cap_cumpl integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_expediente OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 32389)
-- Name: tbl_expediente_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_expediente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_expediente_id_seq OWNER TO postgres;

--
-- TOC entry 3828 (class 0 OID 0)
-- Dependencies: 255
-- Name: tbl_expediente_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_expediente_id_seq OWNED BY rrhh.tbl_expediente.id;


--
-- TOC entry 256 (class 1259 OID 32390)
-- Name: tbl_permisos; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_permisos (
    id integer NOT NULL,
    usuario_id integer,
    motivo_id integer,
    str_motivo_descripcion text,
    dmt_fecha date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_permisos OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 32400)
-- Name: tbl_permisos_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_permisos_id_seq OWNER TO postgres;

--
-- TOC entry 3829 (class 0 OID 0)
-- Dependencies: 257
-- Name: tbl_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_permisos_id_seq OWNED BY rrhh.tbl_permisos.id;


--
-- TOC entry 258 (class 1259 OID 32401)
-- Name: tbl_reposos; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_reposos (
    id integer NOT NULL,
    usuario_id integer,
    motivo_id integer,
    str_motivo_descripcion text,
    tim_fecha date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_reposos OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 32411)
-- Name: tbl_reposos_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_reposos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_reposos_id_seq OWNER TO postgres;

--
-- TOC entry 3830 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_reposos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_reposos_id_seq OWNED BY rrhh.tbl_reposos.id;


--
-- TOC entry 260 (class 1259 OID 32412)
-- Name: tbl_vacaciones; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tbl_vacaciones (
    id integer NOT NULL,
    usuario_id integer,
    int_total_dias integer,
    dmt_fecha_desde date,
    dmt_fecha_hasta date,
    int_dias_disfrute integer,
    int_dias_pendiente integer,
    bol_vencidas boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE rrhh.tbl_vacaciones OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 32420)
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

CREATE SEQUENCE rrhh.tbl_vacaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE rrhh.tbl_vacaciones_id_seq OWNER TO postgres;

--
-- TOC entry 3831 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_vacaciones_id_seq OWNED BY rrhh.tbl_vacaciones.id;


--
-- TOC entry 262 (class 1259 OID 32421)
-- Name: sla_configuracion; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.sla_configuracion (
    id integer NOT NULL,
    categoria_id integer NOT NULL,
    prioridad_id integer NOT NULL,
    tiempo_maximo integer NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE tickets.sla_configuracion OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 32430)
-- Name: tbl_adjuntos_caso; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_adjuntos_caso (
    id integer NOT NULL,
    caso_id bigint NOT NULL,
    str_archivo character varying(50) NOT NULL,
    str_ruta text,
    dmt_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE tickets.tbl_adjuntos_caso OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 32458)
-- Name: tbl_clientes; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_clientes (
    id integer NOT NULL,
    str_cedula character varying(14) NOT NULL,
    str_nombre character varying(50) NOT NULL,
    str_apellido character varying(50) NOT NULL,
    str_telefono character varying(12),
    str_email character varying(100) NOT NULL,
    str_direccion text,
    dtm_fecha_nacimiento date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    condicion_cliente_id integer NOT NULL
);


ALTER TABLE tickets.tbl_clientes OWNER TO postgres;

--
-- TOC entry 3832 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE tbl_clientes; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_clientes IS 'Tabla transaccional que guarda la información de los clientes y potenciales clientes.';


--
-- TOC entry 3833 (class 0 OID 0)
-- Dependencies: 265
-- Name: COLUMN tbl_clientes.condicion_cliente_id; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_clientes.condicion_cliente_id IS 'Determina si es cliente o no de Mercosur. (Cliente / No Cliente)';


--
-- TOC entry 266 (class 1259 OID 32473)
-- Name: tbl_clientes_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.tbl_clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.tbl_clientes_id_seq OWNER TO postgres;

--
-- TOC entry 3834 (class 0 OID 0)
-- Dependencies: 266
-- Name: tbl_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_clientes_id_seq OWNED BY tickets.tbl_clientes.id;


--
-- TOC entry 267 (class 1259 OID 32474)
-- Name: tbl_tickets; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_tickets (
    id integer NOT NULL,
    str_ticket character varying(30) NOT NULL,
    cliente_id integer NOT NULL,
    creador_agente_id integer NOT NULL,
    cierre_agente_id integer,
    departamento_id integer NOT NULL,
    categoria_id integer NOT NULL,
    prioridad_id integer NOT NULL,
    estatus_id integer NOT NULL,
    canal_id integer NOT NULL,
    str_asunto character varying(100) NOT NULL,
    str_descripcion text NOT NULL,
    int_sla integer DEFAULT 0,
    dmt_fecha_cierre timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE tickets.tbl_tickets OWNER TO postgres;

--
-- TOC entry 3835 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE tbl_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets IS 'Tabla transaccional principal que maneja los tickets del sistema.';


--
-- TOC entry 268 (class 1259 OID 32495)
-- Name: tbl_tickets_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.tbl_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.tbl_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 3836 (class 0 OID 0)
-- Dependencies: 268
-- Name: tbl_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_id_seq OWNED BY tickets.tbl_tickets.id;


--
-- TOC entry 269 (class 1259 OID 32496)
-- Name: tbl_tickets_kcs_articulos; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_tickets_kcs_articulos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    articulo_id integer NOT NULL,
    usuario_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE tickets.tbl_tickets_kcs_articulos OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 32507)
-- Name: tbl_tickets_kcs_articulos_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.tbl_tickets_kcs_articulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.tbl_tickets_kcs_articulos_id_seq OWNER TO postgres;

--
-- TOC entry 3837 (class 0 OID 0)
-- Dependencies: 270
-- Name: tbl_tickets_kcs_articulos_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_kcs_articulos_id_seq OWNED BY tickets.tbl_tickets_kcs_articulos.id;


--
-- TOC entry 3435 (class 2604 OID 32508)
-- Name: cat_datos_maestros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros ALTER COLUMN id SET DEFAULT nextval('public.cat_datos_maestros_id_seq'::regclass);


--
-- TOC entry 3439 (class 2604 OID 32509)
-- Name: cat_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos ALTER COLUMN id SET DEFAULT nextval('public.cat_departamentos_id_seq'::regclass);


--
-- TOC entry 3442 (class 2604 OID 32510)
-- Name: cat_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_opciones_id_seq'::regclass);


--
-- TOC entry 3445 (class 2604 OID 32511)
-- Name: cat_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_id_seq'::regclass);


--
-- TOC entry 3448 (class 2604 OID 32512)
-- Name: cat_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_sistemas_id_seq'::regclass);


--
-- TOC entry 3452 (class 2604 OID 32513)
-- Name: tbl_auth_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens ALTER COLUMN id SET DEFAULT nextval('public.tbl_auth_tokens_id_seq'::regclass);


--
-- TOC entry 3455 (class 2604 OID 32514)
-- Name: tbl_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_opciones_id_seq'::regclass);


--
-- TOC entry 3459 (class 2604 OID 32515)
-- Name: tbl_roles_sistemas_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_sistemas_opciones_id_seq'::regclass);


--
-- TOC entry 3460 (class 2604 OID 32516)
-- Name: tbl_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3464 (class 2604 OID 32517)
-- Name: tbl_usuarios_opciones_excepciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_opciones_excepciones_id_seq'::regclass);


--
-- TOC entry 3468 (class 2604 OID 32518)
-- Name: tbl_usuarios_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_roles_sistemas_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 32519)
-- Name: tbl_amonestaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_amonestaciones_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 32520)
-- Name: tbl_carga_familiar id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_carga_familiar_id_seq'::regclass);


--
-- TOC entry 3478 (class 2604 OID 32521)
-- Name: tbl_expediente id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_expediente_id_seq'::regclass);


--
-- TOC entry 3481 (class 2604 OID 32522)
-- Name: tbl_permisos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_permisos_id_seq'::regclass);


--
-- TOC entry 3484 (class 2604 OID 32523)
-- Name: tbl_reposos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_reposos_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 32524)
-- Name: tbl_vacaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_vacaciones_id_seq'::regclass);


--
-- TOC entry 3496 (class 2604 OID 32525)
-- Name: tbl_clientes id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_clientes_id_seq'::regclass);


--
-- TOC entry 3499 (class 2604 OID 32526)
-- Name: tbl_tickets id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 32527)
-- Name: tbl_tickets_kcs_articulos id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_kcs_articulos ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_kcs_articulos_id_seq'::regclass);


--
-- TOC entry 3752 (class 0 OID 32192)
-- Dependencies: 223
-- Data for Name: cat_datos_maestros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_datos_maestros (id, str_tipo, str_nombre, str_descripcion, bol_activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3754 (class 0 OID 32208)
-- Dependencies: 225
-- Data for Name: cat_departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_departamentos (id, str_nombre, str_descripcion, created_at, updated_at) FROM stdin;
1	Tecnología	Departamento de Tecnología y Sistemas	2026-09-23 16:23:47.947669-04	2026-09-23 16:23:47.947669-04
2	Contabilidad	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
3	Administración	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
4	Negocios	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
5	Atención al cliente	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
6	Finanzas Corporativas	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
7	Cumplimiento	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
8	Recursos Humanos	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
9	Operaciones	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
10	Presidencia	\N	2026-10-01 16:33:00.227706-04	2026-10-01 16:33:00.227706-04
\.


--
-- TOC entry 3756 (class 0 OID 32218)
-- Dependencies: 227
-- Data for Name: cat_opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_opciones (id, str_nombre, bol_eliminado, fecha_creacion, str_ruta_opcion, str_icono) FROM stdin;
6	Seguimiento	f	11:32:35.611285-04	/tickets/seguimiento	FiEye
8	Reportes Desempeño	f	11:34:06.578952-04	/tickets/reportes-desempeño	FiFileText
5	Casos Tickets	f	11:32:35.611285-04	/tickets/casos-tickets	FiFolder
1	Dashboard	f	11:15:58.109215-04	/admin/dashboard	FiPieChart
2	Sistemas	f	13:31:51.405615-04	/admin/sistemas	FiMonitor
4	Dashboard	f	11:32:35.611285-04	/tickets/dashboard	FiPieChart
7	Clientes	f	11:32:35.611285-04	/tickets/clientes	FiBriefcase
36	Dashboard	f	11:41:47.813769-04	/rrhh/dashboard	FiPieChart
38	Dashboard	f	11:50:56.831542-04	/kcs/dashboard	FiPieChart
39	Reportes	f	16:27:48.946195-04	/rrhh/reportes	FiFileText
3	Permisos	f	17:39:32.17236-04	/admin/permisos	FiShield
40	Dashboard	f	11:15:30.830653-04	/inventario/dashboard	FiCheckSquare
41	Dashboard	f	11:18:14.266279-04	/visitantes/dashboard	FiCheckSquare
42	Dashboard	f	13:13:24.615383-04	/facturacion/dashboard	FiCheckSquare
43	carga de clientes	f	13:21:40.217601-04	/facrturacion/clientes	FiBattery
\.


--
-- TOC entry 3757 (class 0 OID 32229)
-- Dependencies: 228
-- Data for Name: cat_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_roles (id, str_nombre, str_descripcion, created_at, updated_at) FROM stdin;
1	administrador	Administrador general de los sistemas	2026-09-09 11:28:55.692406-04	2026-09-09 11:28:55.692406-04
17	analista rrhh	\N	2026-10-01 10:28:35.429321-04	2026-10-01 13:17:58.988979-04
18	técnico 1	\N	2026-10-01 13:19:56.909464-04	2026-10-01 13:19:56.909464-04
19	usuario	\N	2026-10-01 13:22:25.912871-04	2026-10-01 13:22:25.912871-04
\.


--
-- TOC entry 3758 (class 0 OID 32238)
-- Dependencies: 229
-- Data for Name: cat_sistemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_sistemas (id, str_sistema, str_descripcion, bol_activo, created_at, updated_at, str_ruta_sistema, str_icono, str_color) FROM stdin;
1	Administración General	Administra todos los sistemas, opciones roles y usuarios de Mercosur	t	2026-09-09 11:32:38.520464-04	2026-09-29 09:39:00.838242-04	/admin	FiServer	#2f6fed
29	Mi Expediente	Portal de ficha de empleados de Mercosur	t	2026-09-29 11:41:47.813769-04	2026-09-29 11:41:47.813769-04	/rrhh	FiBookOpen	#ee176d
31	Base de Conocimiento	Base conocimiento bursátil y financiero de Mercosur	t	2026-09-29 11:50:56.831542-04	2026-09-29 12:07:44.22176-04	/kcs	FiCloud	#6ded35
2	Tickets	Sistema central de tickets de Mercosur	t	2026-09-25 11:27:26.784012-04	2026-09-29 12:08:04.581739-04	/tickets	FiAperture	#d68324
32	Inventario	pruebas	t	2026-10-01 11:15:30.830653-04	2026-10-01 12:45:09.14238-04	/inventario	FiShoppingBag	#ea35ed
33	Control de Visitantes	Control de visitantes	t	2026-10-01 11:18:14.266279-04	2026-10-01 12:45:36.484746-04	/visitantes	FiGift	#e193c9
34	Facturacion	sistema de facturas	t	2026-10-01 13:13:24.615383-04	2026-10-01 13:13:24.615383-04	/facturacion	FiArchive	#edbc35
\.


--
-- TOC entry 3759 (class 0 OID 32252)
-- Dependencies: 230
-- Data for Name: tbl_auth_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_auth_tokens (id, user_id, token, created_at, expires_at, used, str_device_id, str_device_name) FROM stdin;
234	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkwODgxNDczLCJleHAiOjE3OTA4ODUwNzN9.Vy7-uNbTKaO-Vg9AV5qhRDh1-4ItmQ36qykRTSUt30g	2026-10-01 15:04:33.60211-04	2026-10-01 16:04:33.60211-04	f	03694813-c751-4e5b-a9ed-e286fb235813	Chrome en Linux PC
235	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ5amFyYW1pbGxvIiwiaWF0IjoxNzkwODgzMTgyLCJleHAiOjE3OTA4ODY3ODJ9.pPYJ3nhGf83PKRetr24piJGL4xGugCTNcEu3wU_S6dI	2026-10-01 15:33:02.174791-04	2026-10-01 16:33:02.174791-04	f	ff340399-0599-427c-ae05-e46e599c5214	Firefox en Linux PC
236	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkwODgzMjA2LCJleHAiOjE3OTA4ODY4MDZ9.MSPVofS0zuFxoVTkdvWzkcnm-VI6DDlTcE1ffLQ28LM	2026-10-01 15:33:26.973413-04	2026-10-01 16:33:26.973413-04	f	3973f424-8b4e-4bda-94d5-e9abd301e73f	Firefox en Linux PC
237	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkwODg0NzYyLCJleHAiOjE3OTA4ODgzNjJ9.-tFg4owRgySgaChjdKpm9OMIzBe_lv_TS03wdW_M3Pk	2026-10-01 15:59:22.407733-04	2026-10-01 16:59:22.407733-04	f	eca34a7d-e631-4aa8-a88d-1a66a8fcfcf2	Chrome en Linux PC
238	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc5MDg4NDgwMywiZXhwIjoxNzkwODg4NDAzfQ.hjX62KDxtgVy03mK20840ATl4sWjl-CyykfslLsDx38	2026-10-01 16:00:03.106882-04	2026-10-01 17:00:03.106882-04	f	cbb690b0-2d3c-48d2-b949-0ba85e855c4e	Chrome en Linux PC
239	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ5amFyYW1pbGxvIiwiaWF0IjoxNzkwODg0ODE1LCJleHAiOjE3OTA4ODg0MTV9.75SaXU44Z8_ZuQmef4FCFtQrhz2HFllfseqC8B2u1bI	2026-10-01 16:00:15.450007-04	2026-10-01 17:00:15.450007-04	f	b4c9632b-3428-4dcd-859e-3eac579e800f	Firefox en Linux PC
240	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkwODg0ODI2LCJleHAiOjE3OTA4ODg0MjZ9.rTqv1ttHMP9HV3RV_AFGqmBZSiXrgBqeoTbWtEUKs3s	2026-10-01 16:00:26.873533-04	2026-10-01 17:00:26.873533-04	f	61ea450f-6922-49b5-abab-679cdaffa9a5	Firefox en Linux PC
241	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkwODg1MDU2LCJleHAiOjE3OTA4ODg2NTZ9.nbdvyYaT_CsLv_4w5FUrPmFnl8sGg_5JAbtXzMgSBY8	2026-10-01 16:04:16.452866-04	2026-10-01 17:04:16.452866-04	f	695656f1-ae97-4a78-a156-7b111f002080	Firefox en Linux PC
\.


--
-- TOC entry 3763 (class 0 OID 32268)
-- Dependencies: 234
-- Data for Name: tbl_roles_sistemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_roles_sistemas (id, rol_id, sistema_id, created_at, updated_at, bol_activo) FROM stdin;
1	1	1	2026-09-23 16:23:47.947669-04	2026-09-23 16:23:47.947669-04	t
2	1	2	2026-09-25 00:00:00-04	2026-09-25 00:00:00-04	t
29	1	29	2026-09-29 11:41:47.813769-04	2026-09-29 11:41:47.813769-04	t
31	1	31	2026-09-29 11:50:56.831542-04	2026-09-29 11:50:56.831542-04	t
40	17	2	2026-10-01 10:28:41.801946-04	2026-10-01 10:28:41.801946-04	t
41	1	32	2026-10-01 11:15:30.830653-04	2026-10-01 11:15:30.830653-04	t
42	1	33	2026-10-01 11:18:14.266279-04	2026-10-01 11:18:14.266279-04	t
43	1	34	2026-10-01 13:13:24.615383-04	2026-10-01 13:13:24.615383-04	t
44	18	34	2026-10-01 13:20:08.158603-04	2026-10-01 13:20:08.158603-04	t
45	19	29	2026-10-01 13:22:32.398527-04	2026-10-01 13:22:32.398527-04	t
\.


--
-- TOC entry 3765 (class 0 OID 32281)
-- Dependencies: 236
-- Data for Name: tbl_roles_sistemas_opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_roles_sistemas_opciones (id, rol_sistema_id, opcion_id) FROM stdin;
1	1	1
2	1	2
3	1	3
4	2	4
5	2	5
6	2	6
7	2	7
8	2	8
36	29	36
38	31	38
39	29	39
41	40	8
42	40	5
43	41	40
44	42	41
45	43	42
47	43	43
48	44	42
49	44	43
50	45	36
51	45	39
\.


--
-- TOC entry 3768 (class 0 OID 32289)
-- Dependencies: 239
-- Data for Name: tbl_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios (id, departamento_id, str_cedula, str_nombre, str_apellido, str_email, str_password, bol_activo, created_at, updated_at, dmt_fecha_nacimiento, str_direccion, str_usuario, str_telefono, str_contacto_emergencia, fec_ultimo_acceso) FROM stdin;
3	1	28099437	Miguel	Millan	mmillan@mercosur.com.ve	$2a$10$iXqiwUiySZ7RuxepUe8w7usu8g6aBanMda0JWO/7julEILXGyG1Ey	t	2026-10-01 13:14:55.835451-04	2026-10-01 13:14:55.835451-04	\N	\N	mmillan	\N	\N	\N
1	1	00000000	Admin	Mercosur	sistemasmcdb@mercosur.com.ve	$2a$10$sQJ1WZfXydLA91xjFb59AeyIMxmQ7xa66uPnYq8FtBjQIFUM3zbZK	t	2026-09-10 13:13:24.007018-04	2026-10-01 11:49:40.344834-04	\N	\N	admin	\N	\N	2026-10-01 14:18:06.708129
2	1	27474427	Yinesca	Jaramillo	yjaramillo@mercosur.com.ve	$2a$10$H49UmWzM8wPVL2DFBA93bONndQZC3Xu7DPzOXe0YlWfce2EubYc7e	t	2026-10-01 11:51:44.544172-04	2026-10-01 14:41:30.840338-04	\N	\N	yjaramillo	\N	\N	2026-10-01 14:13:42.603616
4	1	16379712	Neel	Barazarte	nbarazarte@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 14:51:25.418478-04	2026-10-01 14:51:25.418478-04	\N	\N	nbarazarte	\N	\N	2026-10-01 16:04:16.500591
57	10	30646620	Cesar Augusto	Acosta Guerrero	cacosta@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	cacosta	\N	\N	\N
58	3	18935045	Felneyry Coromoto	Barreto Bastidas	fbarrteto@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	fbarrteto	\N	\N	\N
59	1	13894108	Mario Fernando	Bedoya Ringuinson	mbedoya@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	mbedoya	\N	\N	\N
60	6	26078018	Genesis Vanessa	Bencomo Briceño	gbencomo@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	gbencomo	\N	\N	\N
61	2	13409801	Helianta Del Valle	Blanco Di Cristofaro	hblanco@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	hblanco	\N	\N	\N
62	2	29571871	Alber David	Campos Curvelo	acampos@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	acampos	\N	\N	\N
63	5	20674807	Luis Enrique	Castillo Marquez	lcastillo@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	lcastillo	\N	\N	\N
64	2	32560280	Yarbelis Carolina	Cervantes Herrera	ycervantes@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	ycervantes	\N	\N	\N
65	2	31758735	Moises Oreste	Chacon Sojo	mchacon@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	mchacon	\N	\N	\N
66	4	16086597	Sindy Karina	Cordero Herrera	scordero@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	scordero	\N	\N	\N
67	5	29596432	Daniel Alejandro	De luca Davila	hde@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	hde	\N	\N	\N
68	3	30180999	Mariangel Fara	Delgado Salazar	mdelgado@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	mdelgado	\N	\N	\N
69	5	27653272	Georgia Nazareth	Dominguez Hernandez	gdominguez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	gdominguez	\N	\N	\N
70	4	21070944	Elvis Alexis	Duran Kroger	eduran@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	eduran	\N	\N	\N
71	2	32784457	Andrea Valentina	Fernandez Palomo	afernandez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	afernandez	\N	\N	\N
72	2	31269090	Yetsimar Nazareth	Ferrer Ramirez	yferrer@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	yferrer	\N	\N	\N
73	1	82223552	Catherine Angelica	Galvez Jimenez	cgalvez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	cgalvez	\N	\N	\N
74	2	32227026	Elelany Camila	Gil Fernandez	egil@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	egil	\N	\N	\N
75	9	32896936	Brenda Noemi	Gonzalez Hurtado	bgonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	bgonzalez	\N	\N	\N
76	4	15482814	Enyi Mileidy	Gonzalez Rodriguez	egonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	egonzalez	\N	\N	\N
77	3	17962449	Adys Maria	Gonzalez Velasquez	agonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	agonzalez	\N	\N	\N
78	9	32740636	Dayana Isabel	Ibañez Carracedo	dibañez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	dibañez	\N	\N	\N
79	5	27796460	Carlos Enrique	Level Duran	clevel@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	clevel	\N	\N	\N
80	2	27661857	Zulmar Sarai	Linares Huise	zlinares@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	zlinares	\N	\N	\N
81	2	29637599	Dayerlin Joeli	Manrique Arraiz	dmanrique@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	dmanrique	\N	\N	\N
82	5	30330499	Angel Daniel	Marchan Granda	amarchan@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	amarchan	\N	\N	\N
83	9	15327214	Yuhaney Del Carmen	Marin Santana	hmarin@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	hmarin	\N	\N	\N
84	4	31082497	Deikerlyn Paola	Mendez Guevara	dmendez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	dmendez	\N	\N	\N
85	1	24896125	Cindy Kisbel	Millan Canache	cmillan@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	cmillan	\N	\N	\N
86	6	27451524	Neileska Maile	Mora Valera	nmora@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	nmora	\N	\N	\N
87	7	23681821	Krisbell Andreina	Mujica Sandia	kmujica@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	kmujica	\N	\N	\N
88	2	28441002	Vanessa Chinquinquira	Niño Ortega	vniño@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	vniño	\N	\N	\N
89	4	29518389	Andrea Darisbel	Nuñez Marquez	anuñez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	anuñez	\N	\N	\N
90	9	31539979	Mitsel Paola	Palencia Perez	mpalencia@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	mpalencia	\N	\N	\N
91	9	13124921	Jackelin Coromoto	Palma Serrano	jpalma@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	jpalma	\N	\N	\N
92	9	16575563	Rosalia	Roa Marquez	rroa@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	rroa	\N	\N	\N
93	8	17286981	Maria Emperatriz	Salazar Di Cristofaro	hsalazar@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	hsalazar	\N	\N	\N
94	10	17369732	Ivan Enrique	Tarazona Caceres	itarazona@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	itarazona	\N	\N	\N
95	5	25327464	Samuel Josue	Tapias Ramirez	stapias@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	stapias	\N	\N	\N
96	9	6249886	Jose Vicente	Toro Dias	jtoro@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	jtoro	\N	\N	\N
97	2	32695846	Maria Jose	Urbina Patiño	murbina@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	murbina	\N	\N	\N
98	7	22504244	Cynthia Deysi	Valdospin Yontomo	cvaldospin@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	cvaldospin	\N	\N	\N
99	4	27793131	Gabriela Alexandra	Valera Gamboa	gvalera@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	gvalera	\N	\N	\N
100	7	32227070	Willianyelis Sarait	Vasquez Villamizar	wvasquez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	wvasquez	\N	\N	\N
101	1	21436685	Zaidi Raida	Zambrano Aranguren	zzambrano@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	zzambrano	\N	\N	\N
102	2	32061634	Cladimar Oriana	Zambrano Baez	czambrano@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	czambrano	\N	\N	\N
\.


--
-- TOC entry 3769 (class 0 OID 32307)
-- Dependencies: 240
-- Data for Name: tbl_usuarios_opciones_excepciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_opciones_excepciones (id, usuario_id, opcion_id, bol_permitido, created_at, update_at) FROM stdin;
\.


--
-- TOC entry 3771 (class 0 OID 32320)
-- Dependencies: 242
-- Data for Name: tbl_usuarios_roles_sistemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_roles_sistemas (id, usuario_id, rol_sistema_id, bol_activo, created_at, updated_at) FROM stdin;
1	1	1	t	2026-09-23 16:23:47.947669-04	2026-09-29 00:00:00-04
35	1	29	t	2026-09-29 00:00:00-04	2026-09-29 00:00:00-04
37	1	31	t	2026-09-29 00:00:00-04	2026-09-29 00:00:00-04
2	1	2	t	2026-09-25 00:00:00-04	2026-09-29 00:00:00-04
42	1	41	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
43	1	42	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
47	2	40	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
48	1	43	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
50	3	44	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
51	3	45	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
53	4	1	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
54	4	2	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
55	4	29	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
56	4	31	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
57	4	41	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
58	4	42	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
59	4	43	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
\.


--
-- TOC entry 3774 (class 0 OID 32358)
-- Dependencies: 250
-- Data for Name: tbl_amonestaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_amonestaciones (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3776 (class 0 OID 32369)
-- Dependencies: 252
-- Data for Name: tbl_carga_familiar; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_carga_familiar (id, usuario_id, parentesco_id, nombre_completo, fecha_nacimiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3778 (class 0 OID 32381)
-- Dependencies: 254
-- Data for Name: tbl_expediente; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_expediente (id, str_num_expediente, usuario_id, dmt_fecha_exp, bol_cv, bol_foto, bol_referencias, bol_cert_est, bol_cert_cap, bol_compr_dom, bol_acdo_conf, bol_cap_gen, bol_cap_area, otros_cursos, cap_cumpl, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3780 (class 0 OID 32390)
-- Dependencies: 256
-- Data for Name: tbl_permisos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_permisos (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3782 (class 0 OID 32401)
-- Dependencies: 258
-- Data for Name: tbl_reposos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_reposos (id, usuario_id, motivo_id, str_motivo_descripcion, tim_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3784 (class 0 OID 32412)
-- Dependencies: 260
-- Data for Name: tbl_vacaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_vacaciones (id, usuario_id, int_total_dias, dmt_fecha_desde, dmt_fecha_hasta, int_dias_disfrute, int_dias_pendiente, bol_vencidas, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3786 (class 0 OID 32421)
-- Dependencies: 262
-- Data for Name: sla_configuracion; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.sla_configuracion (id, categoria_id, prioridad_id, tiempo_maximo, activo) FROM stdin;
1	9	3	4	t
2	10	1	24	t
\.


--
-- TOC entry 3787 (class 0 OID 32430)
-- Dependencies: 263
-- Data for Name: tbl_adjuntos_caso; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_adjuntos_caso (id, caso_id, str_archivo, str_ruta, dmt_fecha, created_at, updated_at) FROM stdin;
1	1	error_pago.png	/uploads/tickets/2026/09/error_pago.png	2026-09-07 14:13:27.966616-04	2026-09-07 14:13:27.966616-04	2026-09-07 14:13:27.966616-04
\.


--
-- TOC entry 3788 (class 0 OID 32444)
-- Dependencies: 264
-- Data for Name: tbl_alertas; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_alertas (id, caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido, fecha_generacion, fecha_lectura) FROM stdin;
1	1	2	SLA_WARNING	El ticket TCK-2026-0001 está próximo a vencer su tiempo de atención.	f	2026-09-07 14:13:27.966616-04	\N
\.


--
-- TOC entry 3789 (class 0 OID 32458)
-- Dependencies: 265
-- Data for Name: tbl_clientes; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_clientes (id, str_cedula, str_nombre, str_apellido, str_telefono, str_email, str_direccion, dtm_fecha_nacimiento, created_at, updated_at, condicion_cliente_id) FROM stdin;
1	V-11223344	Juan	Pérez	04141234567	juan.perez@cliente.com	Av. Principal #45, Caracas	\N	2026-09-07 14:13:27.966616-04	2026-09-07 14:13:27.966616-04	11
\.


--
-- TOC entry 3791 (class 0 OID 32474)
-- Dependencies: 267
-- Data for Name: tbl_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets (id, str_ticket, cliente_id, creador_agente_id, cierre_agente_id, departamento_id, categoria_id, prioridad_id, estatus_id, canal_id, str_asunto, str_descripcion, int_sla, dmt_fecha_cierre, created_at, updated_at) FROM stdin;
1	TCK-2026-0001	1	1	\N	1	1	1	1	1	No puedo ingresar al sistema	El usuario reporta que al colocar su clave le dice que la contraseña es errónea y no lo deja ingresar.	4	\N	2026-09-07 14:13:27.966616-04	2026-09-07 14:13:27.966616-04
2	TCK-2026-0002	1	1	\N	1	1	2	1	1	Fallo de conexión a la red VPN	El usuario indica que FortiClient se desconecta a los pocos minutos de iniciar sesión y muestra un error de tiempo de espera.	0	\N	2026-09-10 13:15:23.71535-04	2026-09-10 13:15:23.71535-04
3	TCK-2026-0003	1	1	\N	1	2	3	1	1	Solicitud de mapeo de impresora departamental	Se requiere configurar la nueva impresora de red del área comercial en la estación de trabajo del usuario.	0	\N	2026-09-10 13:15:23.71535-04	2026-09-10 13:15:23.71535-04
5	TCK-2026-0004	1	1	\N	1	1	1	1	1	dudas bancaribe	cuanto cobrare por dividendos tengo tres acciones	0	\N	2026-09-15 16:04:57.662818-04	2026-09-15 16:04:57.662818-04
\.


--
-- TOC entry 3793 (class 0 OID 32496)
-- Dependencies: 269
-- Data for Name: tbl_tickets_kcs_articulos; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets_kcs_articulos (id, ticket_id, articulo_id, usuario_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3838 (class 0 OID 0)
-- Dependencies: 222
-- Name: tbl_kcs_articulos_id_seq; Type: SEQUENCE SET; Schema: kcs; Owner: postgres
--

SELECT pg_catalog.setval('kcs.tbl_kcs_articulos_id_seq', 6, true);


--
-- TOC entry 3839 (class 0 OID 0)
-- Dependencies: 224
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_datos_maestros_id_seq', 1, false);


--
-- TOC entry 3840 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_departamentos_id_seq', 10, true);


--
-- TOC entry 3841 (class 0 OID 0)
-- Dependencies: 231
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_auth_tokens_id_seq', 241, true);


--
-- TOC entry 3842 (class 0 OID 0)
-- Dependencies: 232
-- Name: tbl_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_opciones_id_seq', 43, true);


--
-- TOC entry 3843 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_id_seq', 19, true);


--
-- TOC entry 3844 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_opciones_id_seq', 45, true);


--
-- TOC entry 3845 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_sistemas_opciones_id_seq', 51, true);


--
-- TOC entry 3846 (class 0 OID 0)
-- Dependencies: 238
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_sistemas_id_seq', 34, true);


--
-- TOC entry 3847 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_opciones_excepciones_id_seq', 1, false);


--
-- TOC entry 3848 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_roles_sistemas_id_seq', 59, true);


--
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 102, true);


--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 251
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_amonestaciones_id_seq', 1, false);


--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 253
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_carga_familiar_id_seq', 1, false);


--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 255
-- Name: tbl_expediente_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_expediente_id_seq', 1, false);


--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 257
-- Name: tbl_permisos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_permisos_id_seq', 1, false);


--
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_reposos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_reposos_id_seq', 1, false);


--
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_vacaciones_id_seq', 1, false);


--
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 266
-- Name: tbl_clientes_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_clientes_id_seq', 1, true);


--
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 268
-- Name: tbl_tickets_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_id_seq', 5, true);


--
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 270
-- Name: tbl_tickets_kcs_articulos_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_kcs_articulos_id_seq', 1, false);


--
-- TOC entry 3507 (class 2606 OID 32529)
-- Name: cat_datos_maestros cat_datos_maestros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros
    ADD CONSTRAINT cat_datos_maestros_pkey PRIMARY KEY (id);


--
-- TOC entry 3509 (class 2606 OID 32531)
-- Name: cat_departamentos cat_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 3511 (class 2606 OID 32533)
-- Name: cat_departamentos cat_departamentos_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3527 (class 2606 OID 32535)
-- Name: tbl_roles_sistemas_opciones pk_roles_sistemas_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT pk_roles_sistemas_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3521 (class 2606 OID 32537)
-- Name: tbl_auth_tokens tbl_auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT tbl_auth_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3513 (class 2606 OID 32539)
-- Name: cat_opciones tbl_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones
    ADD CONSTRAINT tbl_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3515 (class 2606 OID 32541)
-- Name: cat_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3525 (class 2606 OID 32543)
-- Name: tbl_roles_sistemas tbl_roles_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT tbl_roles_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3517 (class 2606 OID 32545)
-- Name: cat_roles tbl_roles_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3519 (class 2606 OID 32547)
-- Name: cat_sistemas tbl_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas
    ADD CONSTRAINT tbl_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3537 (class 2606 OID 32549)
-- Name: tbl_usuarios_opciones_excepciones tbl_usuarios_opciones_excepciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT tbl_usuarios_opciones_excepciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3529 (class 2606 OID 32551)
-- Name: tbl_usuarios tbl_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT tbl_usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3539 (class 2606 OID 32553)
-- Name: tbl_usuarios_opciones_excepciones uk_usuario_opcion_excepcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT uk_usuario_opcion_excepcion UNIQUE (usuario_id, opcion_id);


--
-- TOC entry 3523 (class 2606 OID 32555)
-- Name: tbl_auth_tokens unique_user_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT unique_user_device UNIQUE (user_id, str_device_id);


--
-- TOC entry 3541 (class 2606 OID 32557)
-- Name: tbl_usuarios_roles_sistemas unique_usuario_rol_sistema; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT unique_usuario_rol_sistema UNIQUE (usuario_id, rol_sistema_id);


--
-- TOC entry 3531 (class 2606 OID 32559)
-- Name: tbl_usuarios usuarios_str_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3533 (class 2606 OID 32561)
-- Name: tbl_usuarios usuarios_str_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_email_key UNIQUE (str_email);


--
-- TOC entry 3543 (class 2606 OID 32563)
-- Name: tbl_amonestaciones tbl_amonestaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT tbl_amonestaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3545 (class 2606 OID 32565)
-- Name: tbl_carga_familiar tbl_carga_familiar_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT tbl_carga_familiar_pkey PRIMARY KEY (id);


--
-- TOC entry 3547 (class 2606 OID 32567)
-- Name: tbl_expediente tbl_expediente_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT tbl_expediente_pkey PRIMARY KEY (id);


--
-- TOC entry 3549 (class 2606 OID 32569)
-- Name: tbl_permisos tbl_permisos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT tbl_permisos_pkey PRIMARY KEY (id);


--
-- TOC entry 3551 (class 2606 OID 32571)
-- Name: tbl_reposos tbl_reposos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT tbl_reposos_pkey PRIMARY KEY (id);


--
-- TOC entry 3553 (class 2606 OID 32573)
-- Name: tbl_vacaciones tbl_vacaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT tbl_vacaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3555 (class 2606 OID 32575)
-- Name: sla_configuracion sla_configuracion_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT sla_configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 3557 (class 2606 OID 32577)
-- Name: tbl_adjuntos_caso tbl_adjuntos_caso_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_adjuntos_caso
    ADD CONSTRAINT tbl_adjuntos_caso_pkey PRIMARY KEY (id);


--
-- TOC entry 3559 (class 2606 OID 32579)
-- Name: tbl_alertas tbl_alertas_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_alertas
    ADD CONSTRAINT tbl_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 3561 (class 2606 OID 32581)
-- Name: tbl_clientes tbl_clientes_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3563 (class 2606 OID 32583)
-- Name: tbl_clientes tbl_clientes_str_cedula_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3565 (class 2606 OID 32585)
-- Name: tbl_clientes tbl_clientes_str_email_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_email_key UNIQUE (str_email);


--
-- TOC entry 3573 (class 2606 OID 32587)
-- Name: tbl_tickets_kcs_articulos tbl_tickets_kcs_articulos_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_kcs_articulos
    ADD CONSTRAINT tbl_tickets_kcs_articulos_pkey PRIMARY KEY (id);


--
-- TOC entry 3567 (class 2606 OID 32589)
-- Name: tbl_tickets tbl_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3569 (class 2606 OID 32591)
-- Name: tbl_tickets tbl_tickets_str_ticket_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_str_ticket_key UNIQUE (str_ticket);


--
-- TOC entry 3575 (class 2606 OID 32593)
-- Name: tbl_tickets_kcs_articulos uq_ticket_articulo; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_kcs_articulos
    ADD CONSTRAINT uq_ticket_articulo UNIQUE (ticket_id, articulo_id);


--
-- TOC entry 3534 (class 1259 OID 32594)
-- Name: idx_excepciones_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_opcion ON public.tbl_usuarios_opciones_excepciones USING btree (opcion_id);


--
-- TOC entry 3535 (class 1259 OID 32595)
-- Name: idx_excepciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_usuario ON public.tbl_usuarios_opciones_excepciones USING btree (usuario_id);


--
-- TOC entry 3570 (class 1259 OID 32596)
-- Name: idx_tbl_tickets_kcs_articulo_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tbl_tickets_kcs_articulo_id ON tickets.tbl_tickets_kcs_articulos USING btree (articulo_id);


--
-- TOC entry 3571 (class 1259 OID 32597)
-- Name: idx_tbl_tickets_kcs_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tbl_tickets_kcs_ticket_id ON tickets.tbl_tickets_kcs_articulos USING btree (ticket_id);


--
-- TOC entry 3741 (class 2618 OID 32337)
-- Name: view_matriz_roles_opciones _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.view_matriz_roles_opciones AS
 SELECT rs.id AS rol_sistema_id,
    s.id AS sistema_id,
    s.str_sistema,
    s.str_descripcion,
    s.str_icono,
    s.str_color,
    r.id AS rol_id,
    r.str_nombre AS rol,
    string_agg(o.str_nombre, ', '::text) AS opciones_asignadas
   FROM ((((public.tbl_roles_sistemas rs
     JOIN public.cat_sistemas s ON ((rs.sistema_id = s.id)))
     JOIN public.cat_roles r ON ((rs.rol_id = r.id)))
     LEFT JOIN public.tbl_roles_sistemas_opciones rso ON ((rs.id = rso.rol_sistema_id)))
     LEFT JOIN public.cat_opciones o ON (((rso.opcion_id = o.id) AND (o.bol_eliminado = false))))
  WHERE (rs.bol_activo = true)
  GROUP BY rs.id, s.id, s.str_sistema, r.id, r.str_nombre;


--
-- TOC entry 3582 (class 2606 OID 32599)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_opcion FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3583 (class 2606 OID 32604)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3579 (class 2606 OID 32609)
-- Name: tbl_roles_sistemas_opciones fk_opciones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_opciones FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) NOT VALID;


--
-- TOC entry 3577 (class 2606 OID 32614)
-- Name: tbl_roles_sistemas fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.cat_roles(id) NOT VALID;


--
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 3577
-- Name: CONSTRAINT fk_rol ON tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_rol ON public.tbl_roles_sistemas IS 'Relaciona la columna rol_id con el id de la tabla cat_roles';


--
-- TOC entry 3580 (class 2606 OID 32619)
-- Name: tbl_roles_sistemas_opciones fk_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3578 (class 2606 OID 32624)
-- Name: tbl_roles_sistemas fk_sistema; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_sistema FOREIGN KEY (sistema_id) REFERENCES public.cat_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3576 (class 2606 OID 32629)
-- Name: tbl_auth_tokens fk_tokens_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT fk_tokens_usuario FOREIGN KEY (user_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 3576
-- Name: CONSTRAINT fk_tokens_usuario ON tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_tokens_usuario ON public.tbl_auth_tokens IS 'Relaciona esta tabla con la tabla usuarios';


--
-- TOC entry 3584 (class 2606 OID 32634)
-- Name: tbl_usuarios_roles_sistemas fk_urs_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3585 (class 2606 OID 32639)
-- Name: tbl_usuarios_roles_sistemas fk_urs_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3581 (class 2606 OID 32644)
-- Name: tbl_usuarios fk_usuario_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT fk_usuario_departamento FOREIGN KEY (departamento_id) REFERENCES public.cat_departamentos(id) NOT VALID;


--
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 3581
-- Name: CONSTRAINT fk_usuario_departamento ON tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_usuario_departamento ON public.tbl_usuarios IS 'Relacion entre la tabla Usuario con la tabla Departamento';


--
-- TOC entry 3587 (class 2606 OID 32649)
-- Name: tbl_carga_familiar fk_CargaFamiliar; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT "fk_CargaFamiliar" FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 3587
-- Name: CONSTRAINT "fk_CargaFamiliar" ON tbl_carga_familiar; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT "fk_CargaFamiliar" ON rrhh.tbl_carga_familiar IS 'Relación entre la tabla Usuarios con la tabla Carga_Familiar';


--
-- TOC entry 3586 (class 2606 OID 32654)
-- Name: tbl_amonestaciones fk_amonestaciones; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT fk_amonestaciones FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 3586
-- Name: CONSTRAINT fk_amonestaciones ON tbl_amonestaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_amonestaciones ON rrhh.tbl_amonestaciones IS 'Relación entre la tabla Usuario con la tabla Amonestaciones.';


--
-- TOC entry 3588 (class 2606 OID 32659)
-- Name: tbl_expediente fk_expediente_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT fk_expediente_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 3588
-- Name: CONSTRAINT fk_expediente_usuario ON tbl_expediente; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_expediente_usuario ON rrhh.tbl_expediente IS 'Relación entre la tabla Usuario con la tabla Expediente.';


--
-- TOC entry 3589 (class 2606 OID 32664)
-- Name: tbl_permisos fk_permisos_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT fk_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 3589
-- Name: CONSTRAINT fk_permisos_usuario ON tbl_permisos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_permisos_usuario ON rrhh.tbl_permisos IS 'Relación entre la tabla Usuarios con la tabla Permisos.';


--
-- TOC entry 3590 (class 2606 OID 32669)
-- Name: tbl_reposos fk_reposo_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT fk_reposo_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 3590
-- Name: CONSTRAINT fk_reposo_usuario ON tbl_reposos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_reposo_usuario ON rrhh.tbl_reposos IS 'Relación entre la tabla Usuario con la tabla Reposos.';


--
-- TOC entry 3591 (class 2606 OID 32674)
-- Name: tbl_vacaciones fk_vacaciones_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT fk_vacaciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 3591
-- Name: CONSTRAINT fk_vacaciones_usuario ON tbl_vacaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_vacaciones_usuario ON rrhh.tbl_vacaciones IS 'Relación entre la tabla Usuario y la tabla Vacaciones.';


--
-- TOC entry 3592 (class 2606 OID 32679)
-- Name: tbl_tickets_kcs_articulos fk_ticket_kcs_ticket; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_kcs_articulos
    ADD CONSTRAINT fk_ticket_kcs_ticket FOREIGN KEY (ticket_id) REFERENCES tickets.tbl_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 3593 (class 2606 OID 32684)
-- Name: tbl_tickets_kcs_articulos fk_ticket_kcs_usuario; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_kcs_articulos
    ADD CONSTRAINT fk_ticket_kcs_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON DELETE RESTRICT;


-- Completed on 2026-10-01 16:42:24 -04

--
-- PostgreSQL database dump complete
--

\unrestrict eptE7ZADTqGQglkpZvdU6LPQjmtzQEfYzYB9eOCynbdhDb7lQrFpYfI7E7ID0RT

