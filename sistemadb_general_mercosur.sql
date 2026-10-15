--
-- PostgreSQL database dump
--

\restrict emf8byh5MzDvVJlAdWfs0MKnNOaIIWTOev7iyuKHB8ze6G5EP5ESCQRfs8me0C2

-- Dumped from database version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg24.04+2)

-- Started on 2026-10-14 18:33:47 -04

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
-- TOC entry 2 (class 3079 OID 66689)
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- TOC entry 8 (class 2615 OID 66737)
-- Name: kcs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA kcs;


ALTER SCHEMA kcs OWNER TO postgres;

--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA kcs; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA kcs IS 'Esquema del sistema de la base de datos de conocimiento';


--
-- TOC entry 9 (class 2615 OID 66738)
-- Name: rrhh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA rrhh;


ALTER SCHEMA rrhh OWNER TO postgres;

--
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 9
-- Name: SCHEMA rrhh; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA rrhh IS 'Esquema que almacena las tablas del sistema de RRHH';


--
-- TOC entry 10 (class 2615 OID 66739)
-- Name: tickets; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tickets;


ALTER SCHEMA tickets OWNER TO postgres;

--
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 10
-- Name: SCHEMA tickets; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA tickets IS 'Esquema del Sistema de Tickets para ATC.';


--
-- TOC entry 301 (class 1255 OID 66740)
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
-- TOC entry 302 (class 1255 OID 66741)
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
-- TOC entry 303 (class 1255 OID 66742)
-- Name: fn_verificar_y_actualizar_tickets_vencidos(); Type: FUNCTION; Schema: tickets; Owner: postgres
--

CREATE FUNCTION tickets.fn_verificar_y_actualizar_tickets_vencidos() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE tickets.tbl_tickets
    SET estatus_id = 37, -- ID 37 corresponde a 'Vencido' en public.cat_datos_maestros
        updated_at = CURRENT_TIMESTAMP
    WHERE dmt_fecha_vencimiento_sla < CURRENT_TIMESTAMP
      AND estatus_id NOT IN (21, 22, 23, 37) -- Excluye Resuelto, Cerrado, Cancelado y Vencido
      AND dmt_fecha_cierre IS NULL;
      
    RAISE NOTICE 'Verificación automática de tickets vencidos ejecutada a las %', CURRENT_TIMESTAMP;
END;
$$;


ALTER FUNCTION tickets.fn_verificar_y_actualizar_tickets_vencidos() OWNER TO postgres;

--
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 303
-- Name: FUNCTION fn_verificar_y_actualizar_tickets_vencidos(); Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON FUNCTION tickets.fn_verificar_y_actualizar_tickets_vencidos() IS '-- Programar la ejecución cada 1 minuto
SELECT cron.schedule(
    ''actualizar-tickets-vencidos-job'',  
    ''* * * * *'',                         -- Patrón Cron (cada 1 minuto)
    ''SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();''
);

--Ver los trabajos programados:
SELECT * FROM cron.job;

--Ver el historial de ejecuciones:
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

--Eliminar o desprogramar el trabajo si necesitas modificarlo:
SELECT cron.unschedule(''actualizar-tickets-vencidos-job'');';


--
-- TOC entry 226 (class 1259 OID 66743)
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
-- TOC entry 227 (class 1259 OID 66744)
-- Name: cat_datos_maestros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_datos_maestros (
    id integer NOT NULL,
    str_tipo character varying(50) NOT NULL,
    str_nombre character varying(50) NOT NULL,
    str_descripcion text NOT NULL,
    bol_activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cat_datos_maestros OWNER TO postgres;

--
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE cat_datos_maestros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_datos_maestros IS 'Esta tabla es el catalogo general de la base de datos con las listas mas comunes';


--
-- TOC entry 228 (class 1259 OID 66752)
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
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 228
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_datos_maestros_id_seq OWNED BY public.cat_datos_maestros.id;


--
-- TOC entry 229 (class 1259 OID 66753)
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
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE cat_departamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_departamentos IS 'Esta tabla contiene el listado de los departamentos de Mercosur';


--
-- TOC entry 230 (class 1259 OID 66758)
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
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 230
-- Name: cat_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_departamentos_id_seq OWNED BY public.cat_departamentos.id;


--
-- TOC entry 231 (class 1259 OID 66759)
-- Name: cat_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_opciones (
    id integer NOT NULL,
    str_nombre text NOT NULL,
    bol_eliminado boolean DEFAULT false NOT NULL,
    fecha_creacion time with time zone DEFAULT now() NOT NULL,
    str_ruta_opcion text,
    str_icono character varying(50),
    int_orden integer
);


ALTER TABLE public.cat_opciones OWNER TO postgres;

--
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE cat_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_opciones IS 'Esta tabla contiene las opciones de los sistemas';


--
-- TOC entry 232 (class 1259 OID 66766)
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
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE cat_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_roles IS 'Esta tabla contiene el listado de roles que puede tener un sistema (Un id de rol puede ser común para diferentes sistemas)';


--
-- TOC entry 233 (class 1259 OID 66771)
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
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE cat_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_sistemas IS 'Contiene los nombres de los Sistemas Internos.';


--
-- TOC entry 234 (class 1259 OID 66779)
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
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_auth_tokens IS 'Esta tabla contiene los tokens de sesión de los usuarios';


--
-- TOC entry 235 (class 1259 OID 66786)
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
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_auth_tokens_id_seq OWNED BY public.tbl_auth_tokens.id;


--
-- TOC entry 236 (class 1259 OID 66787)
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
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 236
-- Name: tbl_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_opciones_id_seq OWNED BY public.cat_opciones.id;


--
-- TOC entry 237 (class 1259 OID 66788)
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
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_id_seq OWNED BY public.cat_roles.id;


--
-- TOC entry 238 (class 1259 OID 66789)
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
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas IS 'Esta tabla contiene el catalogo de roles de los sistemas';


--
-- TOC entry 239 (class 1259 OID 66795)
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
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 239
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_opciones_id_seq OWNED BY public.tbl_roles_sistemas.id;


--
-- TOC entry 240 (class 1259 OID 66796)
-- Name: tbl_roles_sistemas_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles_sistemas_opciones (
    id integer NOT NULL,
    rol_sistema_id integer NOT NULL,
    opcion_id integer NOT NULL
);


ALTER TABLE public.tbl_roles_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE tbl_roles_sistemas_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas_opciones IS 'Esta tabla contiene las opciones que tiene un rol en un sistema';


--
-- TOC entry 241 (class 1259 OID 66799)
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
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_sistemas_opciones_id_seq OWNED BY public.tbl_roles_sistemas_opciones.id;


--
-- TOC entry 242 (class 1259 OID 66800)
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
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 242
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_sistemas_id_seq OWNED BY public.cat_sistemas.id;


--
-- TOC entry 243 (class 1259 OID 66801)
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
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios IS 'Esta tabla contiene el listado global de usuarios';


--
-- TOC entry 244 (class 1259 OID 66809)
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
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE tbl_usuarios_opciones_excepciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_opciones_excepciones IS 'Esta tabla es para indicar que opciones no tendrá permitido un usuario en un sistema independientemente de su rol';


--
-- TOC entry 245 (class 1259 OID 66815)
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
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 245
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq OWNED BY public.tbl_usuarios_opciones_excepciones.id;


--
-- TOC entry 246 (class 1259 OID 66816)
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
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE tbl_usuarios_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_roles_sistemas IS 'Esta tabla contiene el rol de un usuario en un sistema';


--
-- TOC entry 247 (class 1259 OID 66822)
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
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 247
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq OWNED BY public.tbl_usuarios_roles_sistemas.id;


--
-- TOC entry 248 (class 1259 OID 66823)
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
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 248
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.tbl_usuarios.id;


--
-- TOC entry 249 (class 1259 OID 66824)
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
-- TOC entry 250 (class 1259 OID 66831)
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
-- TOC entry 251 (class 1259 OID 66836)
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
-- TOC entry 252 (class 1259 OID 66841)
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
-- TOC entry 253 (class 1259 OID 66846)
-- Name: view_dashboard_ultimos_accesos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_dashboard_ultimos_accesos AS
 SELECT id,
    concat(str_nombre, ' ', str_apellido) AS usuario,
    str_email AS email,
    'Sesión activa'::text AS detalle,
    'success'::text AS tipo,
    to_char(fec_ultimo_acceso, 'DD/MM/YYYY HH24:MI'::text) AS tiempo
   FROM public.tbl_usuarios u
  WHERE ((bol_activo = true) AND (fec_ultimo_acceso IS NOT NULL))
  ORDER BY fec_ultimo_acceso DESC
 LIMIT 10;


ALTER VIEW public.view_dashboard_ultimos_accesos OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 66850)
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
-- TOC entry 255 (class 1259 OID 66855)
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
-- TOC entry 256 (class 1259 OID 66859)
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
    rso.id AS rol_sistema_opcion_id,
    o.int_orden
   FROM (((public.cat_sistemas s
     JOIN public.tbl_roles_sistemas rs ON ((s.id = rs.sistema_id)))
     JOIN public.tbl_roles_sistemas_opciones rso ON ((rs.id = rso.rol_sistema_id)))
     JOIN public.cat_opciones o ON ((rso.opcion_id = o.id)))
  WHERE ((s.bol_activo = true) AND (rs.bol_activo = true) AND (o.bol_eliminado = false))
  ORDER BY o.int_orden;


ALTER VIEW public.view_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 66864)
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
    o.int_orden,
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
  ORDER BY rs.sistema_id, o.int_orden;


ALTER VIEW public.view_usuarios_opciones_sistemas OWNER TO postgres;

--
-- TOC entry 3893 (class 0 OID 0)
-- Dependencies: 257
-- Name: VIEW view_usuarios_opciones_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.view_usuarios_opciones_sistemas IS 'Muestra que opciones tienen los usuarios en un sistema';


--
-- TOC entry 258 (class 1259 OID 66869)
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
-- TOC entry 259 (class 1259 OID 66874)
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
    urs.bol_activo AS asignacion_activa,
    u.fec_ultimo_acceso
   FROM (((((public.tbl_usuarios u
     JOIN public.cat_departamentos d ON ((u.departamento_id = d.id)))
     JOIN public.tbl_usuarios_roles_sistemas urs ON ((u.id = urs.usuario_id)))
     JOIN public.tbl_roles_sistemas rs ON ((urs.rol_sistema_id = rs.id)))
     JOIN public.cat_sistemas s ON ((rs.sistema_id = s.id)))
     JOIN public.cat_roles r ON ((rs.rol_id = r.id)))
  WHERE ((u.bol_activo = true) AND (urs.bol_activo = true));


ALTER VIEW public.view_usuarios_roles_sistemas OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 66879)
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
-- TOC entry 261 (class 1259 OID 66886)
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
-- TOC entry 3894 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_amonestaciones_id_seq OWNED BY rrhh.tbl_amonestaciones.id;


--
-- TOC entry 262 (class 1259 OID 66887)
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
-- TOC entry 263 (class 1259 OID 66892)
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
-- TOC entry 3895 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_carga_familiar_id_seq OWNED BY rrhh.tbl_carga_familiar.id;


--
-- TOC entry 264 (class 1259 OID 66893)
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
-- TOC entry 265 (class 1259 OID 66898)
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
-- TOC entry 3896 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_expediente_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_expediente_id_seq OWNED BY rrhh.tbl_expediente.id;


--
-- TOC entry 266 (class 1259 OID 66899)
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
-- TOC entry 267 (class 1259 OID 66906)
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
-- TOC entry 3897 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_permisos_id_seq OWNED BY rrhh.tbl_permisos.id;


--
-- TOC entry 268 (class 1259 OID 66907)
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
-- TOC entry 269 (class 1259 OID 66914)
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
-- TOC entry 3898 (class 0 OID 0)
-- Dependencies: 269
-- Name: tbl_reposos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_reposos_id_seq OWNED BY rrhh.tbl_reposos.id;


--
-- TOC entry 270 (class 1259 OID 66915)
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
-- TOC entry 271 (class 1259 OID 66920)
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
-- TOC entry 3899 (class 0 OID 0)
-- Dependencies: 271
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_vacaciones_id_seq OWNED BY rrhh.tbl_vacaciones.id;


--
-- TOC entry 272 (class 1259 OID 66921)
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
-- TOC entry 273 (class 1259 OID 66925)
-- Name: sla_configuracion_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.sla_configuracion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.sla_configuracion_id_seq OWNER TO postgres;

--
-- TOC entry 3900 (class 0 OID 0)
-- Dependencies: 273
-- Name: sla_configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.sla_configuracion_id_seq OWNED BY tickets.sla_configuracion.id;


--
-- TOC entry 274 (class 1259 OID 66926)
-- Name: tbl_alertas_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.tbl_alertas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.tbl_alertas_id_seq OWNER TO postgres;

--
-- TOC entry 3901 (class 0 OID 0)
-- Dependencies: 274
-- Name: tbl_alertas_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_alertas_id_seq OWNED BY tickets.tbl_alertas.id;


--
-- TOC entry 275 (class 1259 OID 66927)
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
    condicion_cliente_id integer
);


ALTER TABLE tickets.tbl_clientes OWNER TO postgres;

--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 275
-- Name: TABLE tbl_clientes; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_clientes IS 'Tabla transaccional que guarda la información de los clientes y potenciales clientes.';


--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 275
-- Name: COLUMN tbl_clientes.condicion_cliente_id; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_clientes.condicion_cliente_id IS 'Determina si es cliente o no de Mercosur. (Cliente / No Cliente)';


--
-- TOC entry 276 (class 1259 OID 66934)
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
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 276
-- Name: tbl_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_clientes_id_seq OWNED BY tickets.tbl_clientes.id;


--
-- TOC entry 277 (class 1259 OID 66935)
-- Name: tbl_secuencias_tickets; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_secuencias_tickets (
    int_anio integer NOT NULL,
    int_mes integer NOT NULL,
    int_ultimo_secuencial integer DEFAULT 0 NOT NULL
);


ALTER TABLE tickets.tbl_secuencias_tickets OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 66939)
-- Name: tbl_tickets; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_tickets (
    id integer NOT NULL,
    str_ticket character varying(30) NOT NULL,
    cliente_id integer,
    creador_agente_id integer NOT NULL,
    cierre_agente_id integer,
    departamento_id integer NOT NULL,
    categoria_id integer,
    prioridad_id integer NOT NULL,
    estatus_id integer DEFAULT 17 NOT NULL,
    canal_id integer,
    str_asunto character varying(100) NOT NULL,
    str_descripcion text NOT NULL,
    int_sla integer DEFAULT 0,
    dmt_fecha_cierre timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    str_ruta_imagen text,
    str_ruta_video text,
    str_ruta_audio text,
    usuario_asignado_id integer,
    tipo_ticket_id integer NOT NULL,
    dmt_fecha_vencimiento_sla timestamp with time zone,
    bool_cumplio_sla boolean,
    int_minutos_pausa numeric(10,2) DEFAULT 0,
    dmt_fecha_inicio_pausa timestamp without time zone
);


ALTER TABLE tickets.tbl_tickets OWNER TO postgres;

--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 278
-- Name: TABLE tbl_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets IS 'Tabla transaccional principal que maneja los tickets del sistema.';


--
-- TOC entry 279 (class 1259 OID 66949)
-- Name: tbl_tickets_bitacora; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_tickets_bitacora (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    usuario_id integer,
    str_comentario text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE tickets.tbl_tickets_bitacora OWNER TO postgres;

--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 279
-- Name: TABLE tbl_tickets_bitacora; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets_bitacora IS 'Almacena el historial de respuestas, avances y notas de los agentes sobre los tickets.';


--
-- TOC entry 280 (class 1259 OID 66955)
-- Name: tbl_tickets_bitacora_id_seq; Type: SEQUENCE; Schema: tickets; Owner: postgres
--

CREATE SEQUENCE tickets.tbl_tickets_bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tickets.tbl_tickets_bitacora_id_seq OWNER TO postgres;

--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 280
-- Name: tbl_tickets_bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_bitacora_id_seq OWNED BY tickets.tbl_tickets_bitacora.id;


--
-- TOC entry 281 (class 1259 OID 66956)
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
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 281
-- Name: tbl_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_id_seq OWNED BY tickets.tbl_tickets.id;


--
-- TOC entry 282 (class 1259 OID 66957)
-- Name: view_listar_tickets; Type: VIEW; Schema: tickets; Owner: postgres
--

CREATE VIEW tickets.view_listar_tickets AS
 SELECT t.id,
    t.str_ticket,
    t.tipo_ticket_id,
    tt.str_nombre AS tipo_ticket,
    t.cliente_id,
    c.str_nombre AS cliente_nombre,
    c.str_apellido AS cliente_apellido,
    c.str_cedula AS cliente_cedula,
    c.str_email AS cliente_correo,
    c.str_telefono AS cliente_telefono,
    t.creador_agente_id,
    u_creador.str_nombre AS creador_nombre,
    u_creador.str_apellido AS creador_apellido,
    u_creador.str_email AS creador_correo,
    t.departamento_id,
    d.str_nombre AS departamento_nombre,
    t.categoria_id,
    cat.str_nombre AS categoria_nombre,
    t.prioridad_id,
    pri.str_nombre AS prioridad_nombre,
    t.estatus_id,
    COALESCE(est.str_nombre, 'En Proceso'::character varying) AS estatus_nombre,
    t.canal_id,
    can.str_nombre AS canal_nombre,
    t.str_asunto,
    t.str_descripcion,
    t.int_sla,
    t.dmt_fecha_vencimiento_sla,
    t.dmt_fecha_cierre,
    t.bool_cumplio_sla,
    t.created_at,
    t.updated_at,
    t.usuario_asignado_id,
    u_asig.str_nombre AS asignado_nombre,
    u_asig.str_apellido AS asignado_apellido,
    u_asig.str_email AS asignado_correo,
    t.str_ruta_imagen,
    t.str_ruta_video,
    t.str_ruta_audio,
    COALESCE(t.int_minutos_pausa, (0)::numeric) AS int_minutos_pausa,
        CASE
            WHEN ((t.dmt_fecha_cierre IS NOT NULL) OR (t.estatus_id = 22)) THEN TRIM(BOTH FROM ((COALESCE((NULLIF((floor((EXTRACT(epoch FROM (COALESCE(t.dmt_fecha_cierre, t.updated_at) - t.created_at)) / (86400)::numeric)))::text, '0'::text) || 'd '::text), ''::text) || COALESCE((NULLIF((floor((mod(EXTRACT(epoch FROM (COALESCE(t.dmt_fecha_cierre, t.updated_at) - t.created_at)), (86400)::numeric) / (3600)::numeric)))::text, '0'::text) || 'h '::text), ''::text)) || COALESCE((NULLIF((floor((mod(EXTRACT(epoch FROM (COALESCE(t.dmt_fecha_cierre, t.updated_at) - t.created_at)), (3600)::numeric) / (60)::numeric)))::text, '0'::text) || 'm'::text), '0m'::text)))
            WHEN (((est.str_nombre)::text ~~* '%cancelado%'::text) OR (t.estatus_id = 37) OR ((t.dmt_fecha_vencimiento_sla < CURRENT_TIMESTAMP) AND (t.dmt_fecha_cierre IS NULL))) THEN '---'::text
            ELSE 'En curso'::text
        END AS tiempo_resolucion
   FROM (((((((((tickets.tbl_tickets t
     LEFT JOIN tickets.tbl_clientes c ON ((t.cliente_id = c.id)))
     LEFT JOIN public.tbl_usuarios u_creador ON ((t.creador_agente_id = u_creador.id)))
     LEFT JOIN public.cat_departamentos d ON ((t.departamento_id = d.id)))
     LEFT JOIN public.cat_datos_maestros tt ON (((t.tipo_ticket_id = tt.id) AND ((tt.str_tipo)::text = 'TIPO_TICKET'::text))))
     LEFT JOIN public.cat_datos_maestros cat ON ((t.categoria_id = cat.id)))
     LEFT JOIN public.cat_datos_maestros pri ON (((t.prioridad_id = pri.id) AND ((pri.str_tipo)::text = 'PRIORIDAD'::text))))
     LEFT JOIN public.cat_datos_maestros est ON (((t.estatus_id = est.id) AND ((est.str_tipo)::text = 'ESTATUSTICKET'::text))))
     LEFT JOIN public.cat_datos_maestros can ON (((t.canal_id = can.id) AND ((can.str_tipo)::text = 'CANAL'::text))))
     LEFT JOIN public.tbl_usuarios u_asig ON ((t.usuario_asignado_id = u_asig.id)))
  WHERE (1 = 1);


ALTER VIEW tickets.view_listar_tickets OWNER TO postgres;

--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 282
-- Name: VIEW view_listar_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON VIEW tickets.view_listar_tickets IS 'Muestra los tickets del sistema';


--
-- TOC entry 3484 (class 2604 OID 67171)
-- Name: cat_datos_maestros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros ALTER COLUMN id SET DEFAULT nextval('public.cat_datos_maestros_id_seq'::regclass);


--
-- TOC entry 3488 (class 2604 OID 67172)
-- Name: cat_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos ALTER COLUMN id SET DEFAULT nextval('public.cat_departamentos_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 67173)
-- Name: cat_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_opciones_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 67174)
-- Name: cat_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_id_seq'::regclass);


--
-- TOC entry 3497 (class 2604 OID 67175)
-- Name: cat_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_sistemas_id_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 67176)
-- Name: tbl_auth_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens ALTER COLUMN id SET DEFAULT nextval('public.tbl_auth_tokens_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 67177)
-- Name: tbl_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_opciones_id_seq'::regclass);


--
-- TOC entry 3508 (class 2604 OID 67178)
-- Name: tbl_roles_sistemas_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_sistemas_opciones_id_seq'::regclass);


--
-- TOC entry 3509 (class 2604 OID 67179)
-- Name: tbl_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 67180)
-- Name: tbl_usuarios_opciones_excepciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_opciones_excepciones_id_seq'::regclass);


--
-- TOC entry 3517 (class 2604 OID 67181)
-- Name: tbl_usuarios_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_roles_sistemas_id_seq'::regclass);


--
-- TOC entry 3524 (class 2604 OID 67182)
-- Name: tbl_amonestaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_amonestaciones_id_seq'::regclass);


--
-- TOC entry 3527 (class 2604 OID 67183)
-- Name: tbl_carga_familiar id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_carga_familiar_id_seq'::regclass);


--
-- TOC entry 3530 (class 2604 OID 67184)
-- Name: tbl_expediente id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_expediente_id_seq'::regclass);


--
-- TOC entry 3533 (class 2604 OID 67185)
-- Name: tbl_permisos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_permisos_id_seq'::regclass);


--
-- TOC entry 3536 (class 2604 OID 67186)
-- Name: tbl_reposos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_reposos_id_seq'::regclass);


--
-- TOC entry 3539 (class 2604 OID 67187)
-- Name: tbl_vacaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_vacaciones_id_seq'::regclass);


--
-- TOC entry 3542 (class 2604 OID 67188)
-- Name: sla_configuracion id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion ALTER COLUMN id SET DEFAULT nextval('tickets.sla_configuracion_id_seq'::regclass);


--
-- TOC entry 3521 (class 2604 OID 67189)
-- Name: tbl_alertas id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_alertas ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_alertas_id_seq'::regclass);


--
-- TOC entry 3544 (class 2604 OID 67190)
-- Name: tbl_clientes id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_clientes_id_seq'::regclass);


--
-- TOC entry 3548 (class 2604 OID 67191)
-- Name: tbl_tickets id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_id_seq'::regclass);


--
-- TOC entry 3554 (class 2604 OID 67192)
-- Name: tbl_tickets_bitacora id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_bitacora_id_seq'::regclass);


--
-- TOC entry 3473 (class 0 OID 66692)
-- Dependencies: 223
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	* * * * *	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	localhost	5432	db_general_mercosur	postgres	t	actualizar-tickets-vencidos-job
\.


--
-- TOC entry 3475 (class 0 OID 66711)
-- Dependencies: 225
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
1	22	624218	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:17:00.026068-04	2026-10-13 10:17:00.03345-04
1	36	624356	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:31:00.025073-04	2026-10-13 10:31:00.03257-04
1	1	623911	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 09:56:00.054065-04	2026-10-13 09:56:00.061777-04
1	10	624074	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:05:00.025277-04	2026-10-13 10:05:00.033169-04
1	17	624162	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:12:00.026134-04	2026-10-13 10:12:00.034028-04
1	2	623938	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 09:57:00.025926-04	2026-10-13 09:57:00.033581-04
1	30	624296	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:25:00.025975-04	2026-10-13 10:25:00.033912-04
1	11	624085	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:06:00.024971-04	2026-10-13 10:06:00.032776-04
1	3	623944	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 09:58:00.027351-04	2026-10-13 09:58:00.03523-04
1	23	624227	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:18:00.024441-04	2026-10-13 10:18:00.032035-04
1	4	623952	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 09:59:00.027619-04	2026-10-13 09:59:00.033893-04
1	18	624168	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:13:00.024315-04	2026-10-13 10:13:00.032002-04
1	12	624113	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:07:00.024269-04	2026-10-13 10:07:00.031681-04
1	5	623961	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:00:00.026762-04	2026-10-13 10:00:00.033257-04
1	27	624270	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:22:00.026108-04	2026-10-13 10:22:00.034335-04
1	6	624033	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:01:00.028515-04	2026-10-13 10:01:00.036211-04
1	13	624120	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:08:00.024864-04	2026-10-13 10:08:00.032471-04
1	7	624055	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:02:00.024678-04	2026-10-13 10:02:00.032168-04
1	19	624175	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:14:00.024802-04	2026-10-13 10:14:00.032433-04
1	14	624128	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:09:00.025785-04	2026-10-13 10:09:00.033091-04
1	8	624061	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:03:00.024667-04	2026-10-13 10:03:00.032234-04
1	24	624234	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:19:00.027195-04	2026-10-13 10:19:00.034981-04
1	9	624067	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:04:00.028247-04	2026-10-13 10:04:00.036171-04
1	15	624136	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:10:00.024755-04	2026-10-13 10:10:00.032122-04
1	20	624185	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:15:00.025706-04	2026-10-13 10:15:00.03324-04
1	40	624404	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:35:00.024394-04	2026-10-13 10:35:00.032246-04
1	16	624142	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:11:00.024308-04	2026-10-13 10:11:00.031855-04
1	33	624331	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:28:00.025282-04	2026-10-13 10:28:00.032946-04
1	28	624276	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:23:00.025339-04	2026-10-13 10:23:00.032806-04
1	21	624198	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:16:00.024892-04	2026-10-13 10:16:00.032408-04
1	25	624242	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:20:00.025012-04	2026-10-13 10:20:00.03248-04
1	31	624305	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:26:00.025315-04	2026-10-13 10:26:00.032765-04
1	26	624250	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:21:00.025797-04	2026-10-13 10:21:00.033406-04
1	29	624283	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:24:00.027771-04	2026-10-13 10:24:00.034019-04
1	35	624347	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:30:00.025661-04	2026-10-13 10:30:00.033846-04
1	32	624325	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:27:00.025454-04	2026-10-13 10:27:00.03313-04
1	34	624338	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:29:00.026398-04	2026-10-13 10:29:00.034453-04
1	38	624382	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:33:00.02529-04	2026-10-13 10:33:00.033016-04
1	37	624376	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:32:00.024427-04	2026-10-13 10:32:00.032333-04
1	39	624396	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:34:00.024704-04	2026-10-13 10:34:00.032347-04
1	41	624417	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:36:00.024325-04	2026-10-13 10:36:00.031972-04
1	42	624437	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:37:00.024395-04	2026-10-13 10:37:00.031818-04
1	43	624443	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:38:00.025157-04	2026-10-13 10:38:00.033311-04
1	44	624452	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:39:00.026914-04	2026-10-13 10:39:00.034429-04
1	45	624460	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:40:00.025949-04	2026-10-13 10:40:00.033574-04
1	67	624735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:02:00.026247-04	2026-10-13 11:02:00.034068-04
1	81	624878	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:16:00.024765-04	2026-10-13 11:16:00.032179-04
1	46	624466	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:41:00.026441-04	2026-10-13 10:41:00.034062-04
1	55	624567	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:50:00.024964-04	2026-10-13 10:50:00.032395-04
1	62	624643	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:57:00.026082-04	2026-10-13 10:57:00.03363-04
1	47	624492	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:42:00.029602-04	2026-10-13 10:42:00.034486-04
1	75	624820	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:10:00.024848-04	2026-10-13 11:10:00.032223-04
1	56	624574	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:51:00.025107-04	2026-10-13 10:51:00.032815-04
1	48	624498	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:43:00.02497-04	2026-10-13 10:43:00.032642-04
1	68	624747	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:03:00.028583-04	2026-10-13 11:03:00.033813-04
1	49	624506	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:44:00.024364-04	2026-10-13 10:44:00.031743-04
1	63	624649	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:58:00.025379-04	2026-10-13 10:58:00.032852-04
1	57	624594	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:52:00.026408-04	2026-10-13 10:52:00.034244-04
1	50	624513	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:45:00.024474-04	2026-10-13 10:45:00.032005-04
1	72	624799	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:07:00.024966-04	2026-10-13 11:07:00.032617-04
1	51	624522	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:46:00.024585-04	2026-10-13 10:46:00.032224-04
1	58	624600	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:53:00.024733-04	2026-10-13 10:53:00.032199-04
1	52	624542	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:47:00.025303-04	2026-10-13 10:47:00.033063-04
1	64	624656	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:59:00.025367-04	2026-10-13 10:59:00.032694-04
1	59	624607	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:54:00.027342-04	2026-10-13 10:54:00.035014-04
1	53	624548	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:48:00.026202-04	2026-10-13 10:48:00.033718-04
1	69	624754	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:04:00.025476-04	2026-10-13 11:04:00.033755-04
1	54	624555	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:49:00.025797-04	2026-10-13 10:49:00.033433-04
1	60	624614	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:55:00.024762-04	2026-10-13 10:55:00.032444-04
1	65	624664	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:00:00.025391-04	2026-10-13 11:00:00.032784-04
1	85	624922	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:20:00.02587-04	2026-10-13 11:20:00.033535-04
1	61	624623	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 10:56:00.026149-04	2026-10-13 10:56:00.03388-04
1	78	624853	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:13:00.028682-04	2026-10-13 11:13:00.034999-04
1	73	624805	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:08:00.024374-04	2026-10-13 11:08:00.031812-04
1	66	624714	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:01:00.025204-04	2026-10-13 11:01:00.032572-04
1	70	624761	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:05:00.025272-04	2026-10-13 11:05:00.03343-04
1	76	624826	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:11:00.025228-04	2026-10-13 11:11:00.032771-04
1	71	624772	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:06:00.026221-04	2026-10-13 11:06:00.034315-04
1	74	624812	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:09:00.025897-04	2026-10-13 11:09:00.033973-04
1	80	624869	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:15:00.028791-04	2026-10-13 11:15:00.033596-04
1	77	624847	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:12:00.026813-04	2026-10-13 11:12:00.034577-04
1	79	624861	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:14:00.025692-04	2026-10-13 11:14:00.033623-04
1	83	624907	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:18:00.02552-04	2026-10-13 11:18:00.032914-04
1	82	624898	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:17:00.025611-04	2026-10-13 11:17:00.033233-04
1	84	624914	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:19:00.025314-04	2026-10-13 11:19:00.032906-04
1	86	624930	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:21:00.025084-04	2026-10-13 11:21:00.032767-04
1	87	624950	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:22:00.025387-04	2026-10-13 11:22:00.032739-04
1	88	624956	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:23:00.025359-04	2026-10-13 11:23:00.033071-04
1	89	624963	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:24:00.025824-04	2026-10-13 11:24:00.033394-04
1	90	624970	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:25:00.02418-04	2026-10-13 11:25:00.031618-04
1	112	625205	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:47:00.026171-04	2026-10-13 11:47:00.03375-04
1	126	625409	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:01:00.025988-04	2026-10-13 12:01:00.035158-04
1	91	624980	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:26:00.025863-04	2026-10-13 11:26:00.033866-04
1	100	625073	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:35:00.025408-04	2026-10-13 11:35:00.033116-04
1	107	625154	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:42:00.026812-04	2026-10-13 11:42:00.033372-04
1	92	625000	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:27:00.02639-04	2026-10-13 11:27:00.033935-04
1	120	625277	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:55:00.02606-04	2026-10-13 11:55:00.033828-04
1	101	625085	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:36:00.025583-04	2026-10-13 11:36:00.033272-04
1	93	625006	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:28:00.025133-04	2026-10-13 11:28:00.032894-04
1	113	625211	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:48:00.024975-04	2026-10-13 11:48:00.032735-04
1	94	625013	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:29:00.025521-04	2026-10-13 11:29:00.032962-04
1	108	625160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:43:00.026796-04	2026-10-13 11:43:00.033948-04
1	102	625106	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:37:00.025139-04	2026-10-13 11:37:00.032783-04
1	95	625021	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:30:00.024893-04	2026-10-13 11:30:00.032323-04
1	117	625254	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:52:00.025341-04	2026-10-13 11:52:00.032983-04
1	96	625031	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:31:00.024848-04	2026-10-13 11:31:00.032407-04
1	103	625112	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:38:00.024407-04	2026-10-13 11:38:00.031787-04
1	97	625051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:32:00.023489-04	2026-10-13 11:32:00.030495-04
1	109	625167	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:44:00.024844-04	2026-10-13 11:44:00.032316-04
1	104	625119	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:39:00.025054-04	2026-10-13 11:39:00.032516-04
1	98	625059	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:33:00.024667-04	2026-10-13 11:33:00.032209-04
1	114	625219	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:49:00.026479-04	2026-10-13 11:49:00.034101-04
1	99	625066	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:34:00.026913-04	2026-10-13 11:34:00.034316-04
1	105	625127	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:40:00.025591-04	2026-10-13 11:40:00.033219-04
1	110	625174	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:45:00.025756-04	2026-10-13 11:45:00.033468-04
1	130	625456	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:05:00.024661-04	2026-10-13 12:05:00.032486-04
1	106	625134	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:41:00.025896-04	2026-10-13 11:41:00.0335-04
1	123	625321	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:58:00.025247-04	2026-10-13 11:58:00.032786-04
1	118	625263	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:53:00.025751-04	2026-10-13 11:53:00.033029-04
1	111	625183	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:46:00.025906-04	2026-10-13 11:46:00.033462-04
1	115	625227	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:50:00.021997-04	2026-10-13 11:50:00.029369-04
1	121	625294	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:56:00.024957-04	2026-10-13 11:56:00.03306-04
1	116	625234	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:51:00.024846-04	2026-10-13 11:51:00.032395-04
1	119	625270	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:54:00.028628-04	2026-10-13 11:54:00.036407-04
1	125	625336	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:00:00.025947-04	2026-10-13 12:00:00.03376-04
1	122	625314	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:57:00.026715-04	2026-10-13 11:57:00.034519-04
1	124	625328	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 11:59:00.024764-04	2026-10-13 11:59:00.032436-04
1	128	625442	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:03:00.02479-04	2026-10-13 12:03:00.032218-04
1	127	625432	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:02:00.026402-04	2026-10-13 12:02:00.034043-04
1	129	625449	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:04:00.02576-04	2026-10-13 12:04:00.033283-04
1	131	625468	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:06:00.025639-04	2026-10-13 12:06:00.033477-04
1	132	625492	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:07:00.025755-04	2026-10-13 12:07:00.033851-04
1	133	625498	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:08:00.025213-04	2026-10-13 12:08:00.032814-04
1	134	625508	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:09:00.023739-04	2026-10-13 12:09:00.030736-04
1	135	625518	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:10:00.025946-04	2026-10-13 12:10:00.033407-04
1	157	625772	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:32:00.025248-04	2026-10-13 12:32:00.032938-04
1	171	625917	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:46:00.026637-04	2026-10-13 12:46:00.034378-04
1	136	625524	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:11:00.025847-04	2026-10-13 12:11:00.033608-04
1	145	625625	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:20:00.024464-04	2026-10-13 12:20:00.032615-04
1	152	625710	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:27:00.025767-04	2026-10-13 12:27:00.033289-04
1	137	625544	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:12:00.025773-04	2026-10-13 12:12:00.033663-04
1	165	625861	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:40:00.025144-04	2026-10-13 12:40:00.032538-04
1	146	625638	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:21:00.025193-04	2026-10-13 12:21:00.03337-04
1	138	625550	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:13:00.025642-04	2026-10-13 12:13:00.033495-04
1	158	625778	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:33:00.026434-04	2026-10-13 12:33:00.034351-04
1	139	625557	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:14:00.026204-04	2026-10-13 12:14:00.033811-04
1	153	625716	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:28:00.025668-04	2026-10-13 12:28:00.033408-04
1	147	625658	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:22:00.026106-04	2026-10-13 12:22:00.034108-04
1	140	625564	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:15:00.025188-04	2026-10-13 12:15:00.032756-04
1	162	625833	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:37:00.025569-04	2026-10-13 12:37:00.033153-04
1	141	625573	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:16:00.025164-04	2026-10-13 12:16:00.032513-04
1	148	625664	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:23:00.02471-04	2026-10-13 12:23:00.032068-04
1	142	625598	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:17:00.026225-04	2026-10-13 12:17:00.034021-04
1	154	625726	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:29:00.02559-04	2026-10-13 12:29:00.03309-04
1	149	625671	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:24:00.025189-04	2026-10-13 12:24:00.032904-04
1	143	625609	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:18:00.025417-04	2026-10-13 12:18:00.032863-04
1	159	625785	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:34:00.026433-04	2026-10-13 12:34:00.034004-04
1	144	625617	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:19:00.026856-04	2026-10-13 12:19:00.034418-04
1	150	625680	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:25:00.024839-04	2026-10-13 12:25:00.032191-04
1	155	625735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:30:00.026131-04	2026-10-13 12:30:00.033936-04
1	175	625959	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:50:00.024894-04	2026-10-13 12:50:00.032506-04
1	151	625689	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:26:00.024744-04	2026-10-13 12:26:00.032294-04
1	168	625894	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:43:00.024958-04	2026-10-13 12:43:00.032874-04
1	163	625839	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:38:00.024893-04	2026-10-13 12:38:00.032394-04
1	156	625748	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:31:00.025057-04	2026-10-13 12:31:00.032853-04
1	160	625794	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:35:00.026798-04	2026-10-13 12:35:00.034632-04
1	166	625868	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:41:00.025218-04	2026-10-13 12:41:00.032735-04
1	161	625810	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:36:00.025405-04	2026-10-13 12:36:00.032983-04
1	164	625846	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:39:00.024964-04	2026-10-13 12:39:00.03277-04
1	170	625908	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:45:00.024874-04	2026-10-13 12:45:00.032411-04
1	167	625888	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:42:00.026039-04	2026-10-13 12:42:00.033875-04
1	169	625901	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:44:00.02476-04	2026-10-13 12:44:00.032385-04
1	173	625944	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:48:00.023674-04	2026-10-13 12:48:00.030665-04
1	172	625937	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:47:00.025315-04	2026-10-13 12:47:00.033138-04
1	174	625951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:49:00.025155-04	2026-10-13 12:49:00.032707-04
1	176	625973	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:51:00.024699-04	2026-10-13 12:51:00.032139-04
1	177	625997	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:52:00.025749-04	2026-10-13 12:52:00.033498-04
1	178	626003	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:53:00.025241-04	2026-10-13 12:53:00.032761-04
1	179	626010	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:54:00.025535-04	2026-10-13 12:54:00.033315-04
1	180	626017	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:55:00.025116-04	2026-10-13 12:55:00.032982-04
1	202	626371	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:17:00.023437-04	2026-10-13 13:17:00.030685-04
1	216	626528	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:31:00.026208-04	2026-10-13 13:31:00.03392-04
1	181	626032	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:56:00.025345-04	2026-10-13 12:56:00.032908-04
1	190	626212	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:05:00.026646-04	2026-10-13 13:05:00.034305-04
1	197	626300	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:12:00.023791-04	2026-10-13 13:12:00.031008-04
1	182	626052	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:57:00.024863-04	2026-10-13 12:57:00.03236-04
1	210	626457	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:25:00.025385-04	2026-10-13 13:25:00.034713-04
1	191	626225	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:06:00.027057-04	2026-10-13 13:06:00.034423-04
1	183	626069	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:58:00.024305-04	2026-10-13 12:58:00.031777-04
1	203	626382	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:18:00.025345-04	2026-10-13 13:18:00.033768-04
1	184	626082	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 12:59:00.025364-04	2026-10-13 12:59:00.03297-04
1	198	626321	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:13:00.026687-04	2026-10-13 13:13:00.034239-04
1	192	626247	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:07:00.027775-04	2026-10-13 13:07:00.034307-04
1	185	626095	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:00:00.024477-04	2026-10-13 13:00:00.032261-04
1	207	626431	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:22:00.025112-04	2026-10-13 13:22:00.032769-04
1	186	626172	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:01:00.025346-04	2026-10-13 13:01:00.032891-04
1	193	626256	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:08:00.023664-04	2026-10-13 13:08:00.031141-04
1	187	626192	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:02:00.027786-04	2026-10-13 13:02:00.036677-04
1	199	626329	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:14:00.025876-04	2026-10-13 13:14:00.033463-04
1	194	626263	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:09:00.024228-04	2026-10-13 13:09:00.032476-04
1	188	626198	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:03:00.026757-04	2026-10-13 13:03:00.033148-04
1	204	626389	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:19:00.025662-04	2026-10-13 13:19:00.034133-04
1	189	626205	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:04:00.02643-04	2026-10-13 13:04:00.034571-04
1	195	626272	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:10:00.022478-04	2026-10-13 13:10:00.029834-04
1	200	626336	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:15:00.027348-04	2026-10-13 13:15:00.035119-04
1	220	626582	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:35:00.024938-04	2026-10-13 13:35:00.03285-04
1	196	626278	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:11:00.025268-04	2026-10-13 13:11:00.032458-04
1	213	626503	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:28:00.02743-04	2026-10-13 13:28:00.035369-04
1	208	626441	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:23:00.024623-04	2026-10-13 13:23:00.031972-04
1	201	626345	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:16:00.025167-04	2026-10-13 13:16:00.032799-04
1	205	626397	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:20:00.023942-04	2026-10-13 13:20:00.031631-04
1	211	626466	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:26:00.026124-04	2026-10-13 13:26:00.033861-04
1	206	626404	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:21:00.025376-04	2026-10-13 13:21:00.03305-04
1	209	626449	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:24:00.026865-04	2026-10-13 13:24:00.034503-04
1	215	626518	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:30:00.025236-04	2026-10-13 13:30:00.032887-04
1	212	626490	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:27:00.032822-04	2026-10-13 13:27:00.043788-04
1	214	626510	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:29:00.028647-04	2026-10-13 13:29:00.036892-04
1	218	626561	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:33:00.025292-04	2026-10-13 13:33:00.033071-04
1	217	626555	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:32:00.025345-04	2026-10-13 13:32:00.033154-04
1	219	626569	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:34:00.026313-04	2026-10-13 13:34:00.033935-04
1	221	626592	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:36:00.024205-04	2026-10-13 13:36:00.032017-04
1	222	626612	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:37:00.027135-04	2026-10-13 13:37:00.035127-04
1	223	626618	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:38:00.026105-04	2026-10-13 13:38:00.0343-04
1	224	626632	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:39:00.02768-04	2026-10-13 13:39:00.034713-04
1	225	626646	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:40:00.024173-04	2026-10-13 13:40:00.032528-04
1	247	626967	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:02:00.024766-04	2026-10-13 14:02:00.032369-04
1	261	627128	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:16:00.025422-04	2026-10-13 14:16:00.033237-04
1	226	626653	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:41:00.026386-04	2026-10-13 13:41:00.035247-04
1	235	626749	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:50:00.024188-04	2026-10-13 13:50:00.03217-04
1	242	626850	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:57:00.024737-04	2026-10-13 13:57:00.032574-04
1	227	626673	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:42:00.024836-04	2026-10-13 13:42:00.032898-04
1	255	627071	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:10:00.024223-04	2026-10-13 14:10:00.032067-04
1	236	626757	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:51:00.026083-04	2026-10-13 13:51:00.034164-04
1	228	626679	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:43:00.025413-04	2026-10-13 13:43:00.033608-04
1	248	626985	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:03:00.026641-04	2026-10-13 14:03:00.034411-04
1	229	626686	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:44:00.025792-04	2026-10-13 13:44:00.033535-04
1	243	626856	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:58:00.023582-04	2026-10-13 13:58:00.03078-04
1	237	626777	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:52:00.026641-04	2026-10-13 13:52:00.034994-04
1	230	626693	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:45:00.025038-04	2026-10-13 13:45:00.033194-04
1	252	627046	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:07:00.023792-04	2026-10-13 14:07:00.031027-04
1	231	626702	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:46:00.02451-04	2026-10-13 13:46:00.032282-04
1	238	626789	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:53:00.025036-04	2026-10-13 13:53:00.033095-04
1	232	626722	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:47:00.025308-04	2026-10-13 13:47:00.033061-04
1	244	626863	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:59:00.025837-04	2026-10-13 13:59:00.03364-04
1	239	626802	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:54:00.027579-04	2026-10-13 13:54:00.035465-04
1	233	626728	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:48:00.024777-04	2026-10-13 13:48:00.032579-04
1	249	627001	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:04:00.013286-04	2026-10-13 14:04:00.031969-04
1	234	626735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:49:00.024775-04	2026-10-13 13:49:00.032684-04
1	240	626818	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:55:00.025479-04	2026-10-13 13:55:00.033737-04
1	245	626872	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:00:00.025109-04	2026-10-13 14:00:00.033005-04
1	265	627173	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:20:00.025804-04	2026-10-13 14:20:00.03282-04
1	241	626827	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 13:56:00.024017-04	2026-10-13 13:56:00.031616-04
1	258	627105	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:13:00.026812-04	2026-10-13 14:13:00.03488-04
1	253	627054	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:08:00.025329-04	2026-10-13 14:08:00.033007-04
1	246	626947	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:01:00.025758-04	2026-10-13 14:01:00.033615-04
1	250	627008	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:05:00.012171-04	2026-10-13 14:05:00.015621-04
1	256	627078	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:11:00.025383-04	2026-10-13 14:11:00.032907-04
1	251	627025	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:06:00.013754-04	2026-10-13 14:06:00.017552-04
1	254	627062	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:09:00.025496-04	2026-10-13 14:09:00.033057-04
1	260	627119	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:15:00.025086-04	2026-10-13 14:15:00.032783-04
1	257	627099	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:12:00.024605-04	2026-10-13 14:12:00.032228-04
1	259	627112	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:14:00.025864-04	2026-10-13 14:14:00.033643-04
1	263	627158	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:18:00.026201-04	2026-10-13 14:18:00.033826-04
1	262	627148	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:17:00.025714-04	2026-10-13 14:17:00.033293-04
1	264	627165	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:19:00.025322-04	2026-10-13 14:19:00.032993-04
1	266	627180	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:21:00.025898-04	2026-10-13 14:21:00.033955-04
1	267	627200	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:22:00.025255-04	2026-10-13 14:22:00.033246-04
1	268	627206	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:23:00.025242-04	2026-10-13 14:23:00.033061-04
1	269	627213	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:24:00.025872-04	2026-10-13 14:24:00.033488-04
1	270	627220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:25:00.025343-04	2026-10-13 14:25:00.033591-04
1	292	627459	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:47:00.025005-04	2026-10-13 14:47:00.03276-04
1	306	627710	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:01:00.024505-04	2026-10-13 15:01:00.032315-04
1	271	627229	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:26:00.025386-04	2026-10-13 14:26:00.032986-04
1	280	627323	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:35:00.024877-04	2026-10-13 14:35:00.032776-04
1	287	627405	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:42:00.027746-04	2026-10-13 14:42:00.037049-04
1	272	627250	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:27:00.024562-04	2026-10-13 14:27:00.032809-04
1	300	627567	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:55:00.026003-04	2026-10-13 14:55:00.034345-04
1	281	627333	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:36:00.025876-04	2026-10-13 14:36:00.033901-04
1	273	627256	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:28:00.024245-04	2026-10-13 14:28:00.032079-04
1	293	627475	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:48:00.025155-04	2026-10-13 14:48:00.033072-04
1	274	627263	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:29:00.026065-04	2026-10-13 14:29:00.033963-04
1	288	627416	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:43:00.027053-04	2026-10-13 14:43:00.034643-04
1	282	627353	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:37:00.027402-04	2026-10-13 14:37:00.035019-04
1	275	627271	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:30:00.025225-04	2026-10-13 14:30:00.032831-04
1	297	627547	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:52:00.026889-04	2026-10-13 14:52:00.034685-04
1	276	627282	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:31:00.024426-04	2026-10-13 14:31:00.032159-04
1	283	627359	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:38:00.025594-04	2026-10-13 14:38:00.033324-04
1	277	627302	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:32:00.024254-04	2026-10-13 14:32:00.032202-04
1	289	627423	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:44:00.026302-04	2026-10-13 14:44:00.034042-04
1	284	627367	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:39:00.028085-04	2026-10-13 14:39:00.036496-04
1	278	627308	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:33:00.025141-04	2026-10-13 14:33:00.032639-04
1	294	627482	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:49:00.025242-04	2026-10-13 14:49:00.033156-04
1	279	627316	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:34:00.025502-04	2026-10-13 14:34:00.033177-04
1	285	627378	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:40:00.0249-04	2026-10-13 14:40:00.032612-04
1	290	627430	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:45:00.025454-04	2026-10-13 14:45:00.033089-04
1	310	627764	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:05:00.024837-04	2026-10-13 15:05:00.032312-04
1	286	627385	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:41:00.025799-04	2026-10-13 14:41:00.033362-04
1	303	627608	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:58:00.025344-04	2026-10-13 14:58:00.033033-04
1	298	627553	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:53:00.026566-04	2026-10-13 14:53:00.034286-04
1	291	627439	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:46:00.025414-04	2026-10-13 14:46:00.033213-04
1	295	627510	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:50:00.025788-04	2026-10-13 14:50:00.033269-04
1	301	627576	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:56:00.024586-04	2026-10-13 14:56:00.033012-04
1	296	627527	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:51:00.014796-04	2026-10-13 14:51:00.01832-04
1	299	627560	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:54:00.0258-04	2026-10-13 14:54:00.034031-04
1	305	627636	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:00:00.024885-04	2026-10-13 15:00:00.032532-04
1	302	627596	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:57:00.024727-04	2026-10-13 14:57:00.033082-04
1	304	627618	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 14:59:00.025016-04	2026-10-13 14:59:00.032519-04
1	308	627745	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:03:00.02453-04	2026-10-13 15:03:00.032242-04
1	307	627735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:02:00.025423-04	2026-10-13 15:02:00.033304-04
1	309	627754	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:04:00.025408-04	2026-10-13 15:04:00.032936-04
1	311	627781	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:06:00.024533-04	2026-10-13 15:06:00.032475-04
1	312	627804	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:07:00.02358-04	2026-10-13 15:07:00.030831-04
1	313	627810	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:08:00.024596-04	2026-10-13 15:08:00.031942-04
1	314	627817	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:09:00.026458-04	2026-10-13 15:09:00.034447-04
1	315	627825	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:10:00.023048-04	2026-10-13 15:10:00.030091-04
1	337	628080	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:32:00.024864-04	2026-10-13 15:32:00.032331-04
1	351	628236	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:46:00.024254-04	2026-10-13 15:46:00.031766-04
1	316	627831	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:11:00.026972-04	2026-10-13 15:11:00.03543-04
1	325	627925	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:20:00.023755-04	2026-10-13 15:20:00.030915-04
1	332	628022	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:27:00.024329-04	2026-10-13 15:27:00.031942-04
1	317	627851	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:12:00.027186-04	2026-10-13 15:12:00.034694-04
1	345	628177	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:40:00.024692-04	2026-10-13 15:40:00.03232-04
1	326	627932	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:21:00.024434-04	2026-10-13 15:21:00.032025-04
1	318	627857	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:13:00.026103-04	2026-10-13 15:13:00.034105-04
1	338	628086	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:33:00.02496-04	2026-10-13 15:33:00.032813-04
1	319	627864	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:14:00.024519-04	2026-10-13 15:14:00.031848-04
1	333	628029	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:28:00.024465-04	2026-10-13 15:28:00.032268-04
1	327	627952	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:22:00.026516-04	2026-10-13 15:22:00.034018-04
1	320	627871	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:15:00.026199-04	2026-10-13 15:15:00.03508-04
1	342	628146	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:37:00.026886-04	2026-10-13 15:37:00.034766-04
1	321	627881	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:16:00.027757-04	2026-10-13 15:16:00.033809-04
1	328	627959	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:23:00.023177-04	2026-10-13 15:23:00.030396-04
1	322	627901	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:17:00.024687-04	2026-10-13 15:17:00.03111-04
1	334	628042	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:29:00.024594-04	2026-10-13 15:29:00.032034-04
1	329	627966	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:24:00.025794-04	2026-10-13 15:24:00.033473-04
1	323	627910	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:18:00.026157-04	2026-10-13 15:18:00.033944-04
1	339	628095	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:34:00.025483-04	2026-10-13 15:34:00.033073-04
1	324	627917	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:19:00.026237-04	2026-10-13 15:19:00.033868-04
1	330	627980	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:25:00.023596-04	2026-10-13 15:25:00.030536-04
1	335	628051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:30:00.024899-04	2026-10-13 15:30:00.032428-04
1	355	628289	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:50:00.024644-04	2026-10-13 15:50:00.032364-04
1	331	627996	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:26:00.027585-04	2026-10-13 15:26:00.035289-04
1	348	628212	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:43:00.02441-04	2026-10-13 15:43:00.031758-04
1	343	628153	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:38:00.023655-04	2026-10-13 15:38:00.030967-04
1	336	628060	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:31:00.027345-04	2026-10-13 15:31:00.036576-04
1	340	628106	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:35:00.025482-04	2026-10-13 15:35:00.033355-04
1	346	628186	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:41:00.033508-04	2026-10-13 15:41:00.041707-04
1	341	628117	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:36:00.02484-04	2026-10-13 15:36:00.032347-04
1	344	628160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:39:00.025636-04	2026-10-13 15:39:00.033097-04
1	350	628227	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:45:00.0244-04	2026-10-13 15:45:00.031887-04
1	347	628206	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:42:00.023854-04	2026-10-13 15:42:00.031235-04
1	349	628219	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:44:00.026333-04	2026-10-13 15:44:00.034225-04
1	353	628262	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:48:00.02911-04	2026-10-13 15:48:00.036567-04
1	352	628256	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:47:00.026365-04	2026-10-13 15:47:00.034206-04
1	354	628275	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:49:00.02582-04	2026-10-13 15:49:00.033346-04
1	356	628296	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:51:00.025268-04	2026-10-13 15:51:00.033145-04
1	357	628317	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:52:00.024686-04	2026-10-13 15:52:00.032215-04
1	358	628330	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:53:00.024412-04	2026-10-13 15:53:00.031982-04
1	359	628343	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:54:00.026023-04	2026-10-13 15:54:00.033755-04
1	360	628357	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:55:00.025686-04	2026-10-13 15:55:00.033453-04
1	382	628701	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:17:00.025485-04	2026-10-13 16:17:00.033409-04
1	396	628851	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:31:00.024895-04	2026-10-13 16:31:00.0329-04
1	361	628368	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:56:00.027991-04	2026-10-13 15:56:00.035703-04
1	370	628534	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:05:00.026755-04	2026-10-13 16:05:00.034233-04
1	377	628633	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:12:00.024174-04	2026-10-13 16:12:00.032159-04
1	362	628395	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:57:00.027106-04	2026-10-13 15:57:00.034729-04
1	390	628784	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:25:00.024579-04	2026-10-13 16:25:00.032581-04
1	371	628545	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:06:00.02848-04	2026-10-13 16:06:00.036297-04
1	363	628401	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:58:00.025534-04	2026-10-13 15:58:00.033149-04
1	383	628711	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:18:00.023401-04	2026-10-13 16:18:00.031187-04
1	364	628410	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 15:59:00.02578-04	2026-10-13 15:59:00.033378-04
1	378	628641	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:13:00.025168-04	2026-10-13 16:13:00.033819-04
1	372	628565	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:07:00.026835-04	2026-10-13 16:07:00.034475-04
1	365	628421	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:00:00.027529-04	2026-10-13 16:00:00.035383-04
1	387	628755	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:22:00.025766-04	2026-10-13 16:22:00.032992-04
1	366	628495	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:01:00.05989-04	2026-10-13 16:01:00.067798-04
1	373	628572	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:08:00.024201-04	2026-10-13 16:08:00.031624-04
1	367	628515	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:02:00.027731-04	2026-10-13 16:02:00.033456-04
1	379	628656	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:14:00.026266-04	2026-10-13 16:14:00.035054-04
1	374	628582	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:09:00.023831-04	2026-10-13 16:09:00.032147-04
1	368	628520	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:03:00.030585-04	2026-10-13 16:03:00.035759-04
1	384	628718	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:19:00.027789-04	2026-10-13 16:19:00.03602-04
1	369	628527	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:04:00.026466-04	2026-10-13 16:04:00.034251-04
1	375	628593	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:10:00.020058-04	2026-10-13 16:10:00.026249-04
1	380	628663	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:15:00.026147-04	2026-10-13 16:15:00.034599-04
1	400	628893	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:35:00.026277-04	2026-10-13 16:35:00.034702-04
1	376	628607	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:11:00.023478-04	2026-10-13 16:11:00.031522-04
1	393	628820	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:28:00.026736-04	2026-10-13 16:28:00.034695-04
1	388	628761	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:23:00.025778-04	2026-10-13 16:23:00.033108-04
1	381	628672	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:16:00.024779-04	2026-10-13 16:16:00.033085-04
1	385	628727	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:20:00.025161-04	2026-10-13 16:20:00.033298-04
1	391	628794	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:26:00.02614-04	2026-10-13 16:26:00.03458-04
1	386	628735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:21:00.027386-04	2026-10-13 16:21:00.037526-04
1	389	628774	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:24:00.025312-04	2026-10-13 16:24:00.034124-04
1	395	628842	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:30:00.028599-04	2026-10-13 16:30:00.033866-04
1	392	628814	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:27:00.025347-04	2026-10-13 16:27:00.033261-04
1	394	628834	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:29:00.034405-04	2026-10-13 16:29:00.042833-04
1	398	628877	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:33:00.029609-04	2026-10-13 16:33:00.035356-04
1	397	628871	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:32:00.025051-04	2026-10-13 16:32:00.033498-04
1	399	628886	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:34:00.026468-04	2026-10-13 16:34:00.034388-04
1	401	628903	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:36:00.025637-04	2026-10-13 16:36:00.033764-04
1	402	628923	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:37:00.026807-04	2026-10-13 16:37:00.0343-04
1	403	628929	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:38:00.024403-04	2026-10-13 16:38:00.032766-04
1	404	628936	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:39:00.025222-04	2026-10-13 16:39:00.033327-04
1	405	628944	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:40:00.025798-04	2026-10-13 16:40:00.034021-04
1	406	628951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:41:00.027664-04	2026-10-13 16:41:00.034994-04
1	415	629045	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:50:00.024875-04	2026-10-13 16:50:00.0332-04
1	407	628971	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:42:00.025761-04	2026-10-13 16:42:00.034486-04
1	416	629052	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:51:00.030764-04	2026-10-13 16:51:00.042617-04
1	408	628977	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:43:00.025204-04	2026-10-13 16:43:00.033265-04
1	409	628984	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:44:00.024654-04	2026-10-13 16:44:00.03266-04
1	417	629072	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:52:00.026083-04	2026-10-13 16:52:00.034607-04
1	410	628990	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:45:00.025069-04	2026-10-13 16:45:00.033094-04
1	411	628999	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:46:00.024571-04	2026-10-13 16:46:00.032689-04
1	418	629131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:53:00.025433-04	2026-10-13 16:53:00.033506-04
1	412	629020	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:47:00.024366-04	2026-10-13 16:47:00.032185-04
1	419	629141	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:54:00.025529-04	2026-10-13 16:54:00.033438-04
1	413	629027	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:48:00.026022-04	2026-10-13 16:48:00.034133-04
1	414	629034	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:49:00.025094-04	2026-10-13 16:49:00.03309-04
1	420	629149	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 16:55:00.024213-04	2026-10-13 16:55:00.032189-04
1	442	30371	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:18:00.01039-04	2026-10-13 19:18:00.011903-04
1	456	38714	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:32:00.00971-04	2026-10-13 19:32:00.01077-04
1	421	12051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 18:57:00.012231-04	2026-10-13 18:57:00.01345-04
1	430	21432	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:06:00.008889-04	2026-10-13 19:06:00.00997-04
1	437	25910	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:13:00.008078-04	2026-10-13 19:13:00.009227-04
1	422	12862	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 18:58:00.060266-04	2026-10-13 18:58:00.061703-04
1	450	35143	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:26:00.009756-04	2026-10-13 19:26:00.010851-04
1	431	22077	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:07:00.007889-04	2026-10-13 19:07:00.009052-04
1	423	15809	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 18:59:00.008458-04	2026-10-13 18:59:00.009665-04
1	443	30980	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:19:00.009682-04	2026-10-13 19:19:00.010896-04
1	424	17033	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:00:00.008199-04	2026-10-13 19:00:00.009336-04
1	438	26501	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:14:00.007928-04	2026-10-13 19:14:00.009094-04
1	432	22824	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:08:00.010142-04	2026-10-13 19:08:00.011475-04
1	425	17650	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:01:00.008619-04	2026-10-13 19:01:00.009657-04
1	447	33350	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:23:00.008582-04	2026-10-13 19:23:00.010062-04
1	426	18239	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:02:00.008646-04	2026-10-13 19:02:00.009743-04
1	433	23394	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:09:00.009595-04	2026-10-13 19:09:00.011289-04
1	427	18823	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:03:00.008488-04	2026-10-13 19:03:00.009645-04
1	439	27804	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:15:00.007593-04	2026-10-13 19:15:00.008799-04
1	434	24048	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:10:00.010602-04	2026-10-13 19:10:00.012163-04
1	428	19591	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:04:00.008855-04	2026-10-13 19:04:00.01031-04
1	444	31582	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:20:00.007616-04	2026-10-13 19:20:00.008755-04
1	429	20654	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:05:00.008086-04	2026-10-13 19:05:00.009196-04
1	435	24625	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:11:00.011064-04	2026-10-13 19:11:00.012572-04
1	440	29072	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:16:00.010176-04	2026-10-13 19:16:00.011495-04
1	460	41191	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:36:00.010659-04	2026-10-13 19:36:00.01215-04
1	436	25251	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:12:00.01077-04	2026-10-13 19:12:00.011932-04
1	453	36927	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:29:00.008117-04	2026-10-13 19:29:00.009168-04
1	448	33950	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:24:00.010092-04	2026-10-13 19:24:00.011568-04
1	441	29764	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:17:00.008582-04	2026-10-13 19:17:00.009742-04
1	445	32178	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:21:00.008826-04	2026-10-13 19:21:00.009888-04
1	451	35739	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:27:00.007854-04	2026-10-13 19:27:00.008948-04
1	446	32773	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:22:00.008519-04	2026-10-13 19:22:00.009685-04
1	449	34562	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:25:00.009951-04	2026-10-13 19:25:00.011224-04
1	455	38127	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:31:00.010404-04	2026-10-13 19:31:00.011506-04
1	452	36332	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:28:00.009053-04	2026-10-13 19:28:00.010241-04
1	454	37526	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:30:00.008516-04	2026-10-13 19:30:00.009573-04
1	458	39890	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:34:00.00939-04	2026-10-13 19:34:00.010473-04
1	457	39293	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:33:00.009336-04	2026-10-13 19:33:00.010483-04
1	459	40585	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:35:00.011428-04	2026-10-13 19:35:00.012894-04
1	461	42074	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:37:00.010638-04	2026-10-13 19:37:00.012427-04
1	462	42684	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:38:00.009294-04	2026-10-13 19:38:00.010785-04
1	463	43460	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:39:00.009985-04	2026-10-13 19:39:00.011117-04
1	464	44243	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:40:00.008003-04	2026-10-13 19:40:00.009159-04
1	465	45232	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:41:00.011796-04	2026-10-13 19:41:00.01347-04
1	487	59474	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:03:00.01014-04	2026-10-13 20:03:00.011766-04
1	501	68687	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:17:00.00902-04	2026-10-13 20:17:00.010142-04
1	466	45845	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:42:00.009224-04	2026-10-13 19:42:00.010304-04
1	475	51419	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:51:00.009644-04	2026-10-13 19:51:00.010805-04
1	482	55550	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:58:00.008659-04	2026-10-13 19:58:00.009838-04
1	467	46516	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:43:00.008532-04	2026-10-13 19:43:00.009645-04
1	495	65068	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:11:00.010531-04	2026-10-13 20:11:00.012061-04
1	476	52011	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:52:00.008528-04	2026-10-13 19:52:00.009661-04
1	468	47135	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:44:00.009171-04	2026-10-13 19:44:00.010355-04
1	488	60225	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:04:00.009534-04	2026-10-13 20:04:00.011334-04
1	469	47761	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:45:00.008023-04	2026-10-13 19:45:00.009548-04
1	483	56146	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:59:00.007422-04	2026-10-13 19:59:00.008504-04
1	477	52603	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:53:00.007885-04	2026-10-13 19:53:00.00914-04
1	470	48375	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:46:00.009224-04	2026-10-13 19:46:00.010322-04
1	492	63132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:08:00.010653-04	2026-10-13 20:08:00.011873-04
1	471	48974	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:47:00.008915-04	2026-10-13 19:47:00.010056-04
1	478	53161	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:54:00.009618-04	2026-10-13 19:54:00.011241-04
1	472	49547	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:48:00.007636-04	2026-10-13 19:48:00.008804-04
1	484	57007	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:00:00.008827-04	2026-10-13 20:00:00.010128-04
1	479	53772	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:55:00.008864-04	2026-10-13 19:55:00.010358-04
1	473	50154	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:49:00.030939-04	2026-10-13 19:49:00.032593-04
1	489	60978	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:05:00.01155-04	2026-10-13 20:05:00.012789-04
1	474	50799	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:50:00.009244-04	2026-10-13 19:50:00.010789-04
1	480	54364	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:56:00.011086-04	2026-10-13 19:56:00.01261-04
1	485	58041	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:01:00.007816-04	2026-10-13 20:01:00.009262-04
1	505	71206	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:21:00.01027-04	2026-10-13 20:21:00.011435-04
1	481	54951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 19:57:00.011194-04	2026-10-13 19:57:00.012682-04
1	498	66893	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:14:00.009283-04	2026-10-13 20:14:00.010555-04
1	493	63709	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:09:00.008599-04	2026-10-13 20:09:00.009815-04
1	486	58696	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:02:00.009383-04	2026-10-13 20:02:00.010506-04
1	490	61669	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:06:00.0113-04	2026-10-13 20:06:00.012977-04
1	496	65661	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:12:00.009942-04	2026-10-13 20:12:00.011409-04
1	491	62483	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:07:00.010696-04	2026-10-13 20:07:00.013206-04
1	494	64455	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:10:00.010247-04	2026-10-13 20:10:00.011693-04
1	500	68114	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:16:00.008832-04	2026-10-13 20:16:00.010041-04
1	497	66270	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:13:00.007936-04	2026-10-13 20:13:00.009059-04
1	499	67508	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:15:00.00859-04	2026-10-13 20:15:00.009725-04
1	503	69919	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:19:00.011211-04	2026-10-13 20:19:00.012422-04
1	502	69295	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:18:00.007629-04	2026-10-13 20:18:00.008662-04
1	504	70542	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:20:00.01029-04	2026-10-13 20:20:00.01135-04
1	506	72376	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:22:00.008424-04	2026-10-13 20:22:00.009553-04
1	507	72978	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:23:00.010708-04	2026-10-13 20:23:00.011899-04
1	508	73593	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:24:00.00797-04	2026-10-13 20:24:00.009153-04
1	509	74389	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:25:00.010239-04	2026-10-13 20:25:00.011738-04
1	510	75059	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:26:00.011894-04	2026-10-13 20:26:00.013579-04
1	532	90080	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:48:00.008818-04	2026-10-13 20:48:00.010005-04
1	546	99388	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:02:00.010724-04	2026-10-13 21:02:00.012529-04
1	511	75758	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:27:00.011021-04	2026-10-13 20:27:00.012211-04
1	520	81612	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:36:00.011863-04	2026-10-13 20:36:00.013046-04
1	527	86145	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:43:00.009104-04	2026-10-13 20:43:00.010262-04
1	512	76335	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:28:00.007885-04	2026-10-13 20:28:00.009204-04
1	540	95658	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:56:00.064721-04	2026-10-13 20:56:00.066293-04
1	521	82194	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:37:00.008182-04	2026-10-13 20:37:00.009249-04
1	513	77112	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:29:00.010891-04	2026-10-13 20:29:00.012073-04
1	533	90676	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:49:00.007487-04	2026-10-13 20:49:00.008712-04
1	514	77731	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:30:00.007175-04	2026-10-13 20:30:00.008208-04
1	528	87091	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:44:00.010325-04	2026-10-13 20:44:00.012325-04
1	522	82794	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:38:00.008674-04	2026-10-13 20:38:00.009741-04
1	515	78327	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:31:00.008948-04	2026-10-13 20:31:00.010054-04
1	537	93339	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:53:00.009834-04	2026-10-13 20:53:00.010987-04
1	516	79220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:32:00.00762-04	2026-10-13 20:32:00.008919-04
1	523	83395	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:39:00.00946-04	2026-10-13 20:39:00.010618-04
1	517	79838	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:33:00.007759-04	2026-10-13 20:33:00.00877-04
1	529	87959	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:45:00.010034-04	2026-10-13 20:45:00.011633-04
1	524	84057	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:40:00.007644-04	2026-10-13 20:40:00.008896-04
1	518	80409	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:34:00.011219-04	2026-10-13 20:34:00.012777-04
1	534	91317	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:50:00.009805-04	2026-10-13 20:50:00.01131-04
1	519	81022	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:35:00.009407-04	2026-10-13 20:35:00.010635-04
1	525	84731	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:41:00.008684-04	2026-10-13 20:41:00.009825-04
1	530	88610	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:46:00.009604-04	2026-10-13 20:46:00.010915-04
1	550	101609	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:06:00.059937-04	2026-10-13 21:06:00.061025-04
1	526	85384	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:42:00.008076-04	2026-10-13 20:42:00.009519-04
1	543	97598	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:59:00.008922-04	2026-10-13 20:59:00.010407-04
1	538	94295	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:54:00.010021-04	2026-10-13 20:54:00.011349-04
1	531	89275	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:47:00.008924-04	2026-10-13 20:47:00.010065-04
1	535	92069	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:51:00.011631-04	2026-10-13 20:51:00.013375-04
1	541	96398	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:57:00.061846-04	2026-10-13 20:57:00.063348-04
1	536	92752	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:52:00.010591-04	2026-10-13 20:52:00.01214-04
1	539	94928	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:55:00.060996-04	2026-10-13 20:55:00.062688-04
1	545	98824	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:01:00.010981-04	2026-10-13 21:01:00.012214-04
1	542	97028	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 20:58:00.057979-04	2026-10-13 20:58:00.059288-04
1	544	98186	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:00:00.010568-04	2026-10-13 21:00:00.012226-04
1	548	100482	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:04:00.059223-04	2026-10-13 21:04:00.060493-04
1	547	99928	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:03:00.01098-04	2026-10-13 21:03:00.012171-04
1	549	101061	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:05:00.066316-04	2026-10-13 21:05:00.067509-04
1	551	102181	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:07:00.010642-04	2026-10-13 21:07:00.012038-04
1	552	102741	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:08:00.059819-04	2026-10-13 21:08:00.061022-04
1	553	103296	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:09:00.008805-04	2026-10-13 21:09:00.009885-04
1	554	103929	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:10:00.061823-04	2026-10-13 21:10:00.063261-04
1	555	104505	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:11:00.01224-04	2026-10-13 21:11:00.01387-04
1	577	117148	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:33:00.010154-04	2026-10-13 21:33:00.011457-04
1	591	142172	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:47:00.059054-04	2026-10-13 21:47:00.060243-04
1	556	105048	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:12:00.059672-04	2026-10-13 21:12:00.060896-04
1	565	110112	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:21:00.011476-04	2026-10-13 21:21:00.012921-04
1	572	114063	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:28:00.065372-04	2026-10-13 21:28:00.06664-04
1	557	105612	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:13:00.059294-04	2026-10-13 21:13:00.06065-04
1	585	138653	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:41:00.011891-04	2026-10-13 21:41:00.013675-04
1	566	110678	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:22:00.010068-04	2026-10-13 21:22:00.011633-04
1	558	106169	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:14:00.01146-04	2026-10-13 21:14:00.013128-04
1	578	118676	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:34:00.011727-04	2026-10-13 21:34:00.013923-04
1	559	106738	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:15:00.064162-04	2026-10-13 21:15:00.065791-04
1	573	114621	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:29:00.060806-04	2026-10-13 21:29:00.06253-04
1	567	111245	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:23:00.059362-04	2026-10-13 21:23:00.060627-04
1	560	107298	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:16:00.009835-04	2026-10-13 21:16:00.011401-04
1	582	128512	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:38:00.013332-04	2026-10-13 21:38:00.014437-04
1	561	107864	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:17:00.060998-04	2026-10-13 21:17:00.062513-04
1	568	111800	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:24:00.059715-04	2026-10-13 21:24:00.060963-04
1	562	108415	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:18:00.064487-04	2026-10-13 21:18:00.065673-04
1	574	115194	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:30:00.059872-04	2026-10-13 21:30:00.061118-04
1	569	112393	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:25:00.06332-04	2026-10-13 21:25:00.064551-04
1	563	108979	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:19:00.065125-04	2026-10-13 21:19:00.066299-04
1	579	125041	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:35:00.007904-04	2026-10-13 21:35:00.009323-04
1	564	109548	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:20:00.010529-04	2026-10-13 21:20:00.012235-04
1	570	112950	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:26:00.062367-04	2026-10-13 21:26:00.063456-04
1	575	115769	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:31:00.008537-04	2026-10-13 21:31:00.009913-04
1	595	144433	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:51:00.010967-04	2026-10-13 21:51:00.012098-04
1	571	113504	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:27:00.061123-04	2026-10-13 21:27:00.06233-04
1	588	140509	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:44:00.00858-04	2026-10-13 21:44:00.009719-04
1	583	129709	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:39:00.013374-04	2026-10-13 21:39:00.015651-04
1	576	116537	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:32:00.011302-04	2026-10-13 21:32:00.012993-04
1	580	127065	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:36:00.010789-04	2026-10-13 21:36:00.012406-04
1	586	139270	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:42:00.00878-04	2026-10-13 21:42:00.010213-04
1	581	127926	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:37:00.011111-04	2026-10-13 21:37:00.012928-04
1	584	133784	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:40:00.068859-04	2026-10-13 21:40:00.070027-04
1	590	141613	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:46:00.00976-04	2026-10-13 21:46:00.011052-04
1	587	139951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:43:00.00835-04	2026-10-13 21:43:00.009578-04
1	589	141076	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:45:00.06475-04	2026-10-13 21:45:00.065982-04
1	593	143280	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:49:00.065912-04	2026-10-13 21:49:00.067472-04
1	592	142734	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:48:00.008508-04	2026-10-13 21:48:00.010043-04
1	594	143860	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:50:00.009344-04	2026-10-13 21:50:00.010537-04
1	596	144975	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:52:00.059023-04	2026-10-13 21:52:00.060262-04
1	597	145538	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:53:00.06424-04	2026-10-13 21:53:00.065409-04
1	598	146094	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:54:00.065462-04	2026-10-13 21:54:00.066631-04
1	599	146661	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:55:00.01013-04	2026-10-13 21:55:00.011282-04
1	600	147229	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:56:00.060956-04	2026-10-13 21:56:00.062214-04
1	622	159647	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:18:00.00783-04	2026-10-13 22:18:00.009068-04
1	636	167615	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:32:00.066078-04	2026-10-13 22:32:00.067719-04
1	601	147793	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:57:00.008834-04	2026-10-13 21:57:00.010076-04
1	610	152826	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:06:00.060653-04	2026-10-13 22:06:00.061892-04
1	617	156765	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:13:00.064924-04	2026-10-13 22:13:00.066146-04
1	602	148337	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:58:00.009783-04	2026-10-13 21:58:00.011421-04
1	630	164280	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:26:00.009238-04	2026-10-13 22:26:00.010295-04
1	611	153379	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:07:00.060072-04	2026-10-13 22:07:00.061226-04
1	603	148895	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 21:59:00.009826-04	2026-10-13 21:59:00.010973-04
1	623	160218	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:19:00.065093-04	2026-10-13 22:19:00.066734-04
1	604	149471	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:00:00.065701-04	2026-10-13 22:00:00.066871-04
1	618	157318	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:14:00.008738-04	2026-10-13 22:14:00.009905-04
1	612	153931	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:08:00.059706-04	2026-10-13 22:08:00.060968-04
1	605	150022	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:01:00.05973-04	2026-10-13 22:01:00.061039-04
1	627	162485	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:23:00.070457-04	2026-10-13 22:23:00.071614-04
1	606	150575	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:02:00.064586-04	2026-10-13 22:02:00.065742-04
1	613	154490	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:09:00.010995-04	2026-10-13 22:09:00.012564-04
1	607	151131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:03:00.009835-04	2026-10-13 22:03:00.011102-04
1	619	157889	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:15:00.009034-04	2026-10-13 22:15:00.010273-04
1	614	155098	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:10:00.009886-04	2026-10-13 22:10:00.011154-04
1	608	151676	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:04:00.008768-04	2026-10-13 22:04:00.009945-04
1	624	160786	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:20:00.061009-04	2026-10-13 22:20:00.062553-04
1	609	152255	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:05:00.00975-04	2026-10-13 22:05:00.010857-04
1	615	155666	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:11:00.009838-04	2026-10-13 22:11:00.010967-04
1	620	158445	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:16:00.011677-04	2026-10-13 22:16:00.012859-04
1	640	169902	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:36:00.060007-04	2026-10-13 22:36:00.06112-04
1	616	156220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:12:00.008352-04	2026-10-13 22:12:00.009729-04
1	633	165941	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:29:00.058609-04	2026-10-13 22:29:00.059659-04
1	628	163042	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:24:00.007776-04	2026-10-13 22:24:00.009038-04
1	621	159036	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:17:00.008003-04	2026-10-13 22:17:00.009247-04
1	625	161354	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:21:00.012022-04	2026-10-13 22:21:00.013709-04
1	631	164830	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:27:00.06456-04	2026-10-13 22:27:00.065655-04
1	626	161931	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:22:00.063253-04	2026-10-13 22:22:00.064459-04
1	629	163667	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:25:00.008014-04	2026-10-13 22:25:00.00908-04
1	635	167069	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:31:00.009762-04	2026-10-13 22:31:00.010829-04
1	632	165393	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:28:00.058658-04	2026-10-13 22:28:00.059862-04
1	634	166508	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:30:00.062862-04	2026-10-13 22:30:00.06401-04
1	638	168779	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:34:00.058865-04	2026-10-13 22:34:00.060002-04
1	637	168179	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:33:00.008443-04	2026-10-13 22:33:00.00959-04
1	639	169345	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:35:00.007927-04	2026-10-13 22:35:00.009088-04
1	641	170446	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:37:00.071477-04	2026-10-13 22:37:00.072592-04
1	642	170977	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:38:00.058623-04	2026-10-13 22:38:00.059846-04
1	643	171532	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:39:00.007507-04	2026-10-13 22:39:00.008641-04
1	644	172217	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:40:00.007798-04	2026-10-13 22:40:00.009043-04
1	645	172783	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:41:00.009884-04	2026-10-13 22:41:00.011006-04
1	667	185170	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:03:00.007967-04	2026-10-13 23:03:00.009021-04
1	681	193084	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:17:00.008432-04	2026-10-13 23:17:00.009561-04
1	646	173350	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:42:00.008381-04	2026-10-13 22:42:00.009493-04
1	655	178400	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:51:00.009888-04	2026-10-13 22:51:00.010949-04
1	662	182340	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:58:00.008147-04	2026-10-13 22:58:00.009218-04
1	647	173910	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:43:00.063132-04	2026-10-13 22:43:00.064235-04
1	675	189728	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:11:00.009551-04	2026-10-13 23:11:00.010676-04
1	656	178966	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:52:00.058313-04	2026-10-13 22:52:00.059441-04
1	648	174473	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:44:00.058542-04	2026-10-13 22:44:00.059667-04
1	668	185719	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:04:00.008823-04	2026-10-13 23:04:00.009949-04
1	649	175033	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:45:00.058781-04	2026-10-13 22:45:00.059834-04
1	663	182903	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:59:00.007961-04	2026-10-13 22:59:00.009031-04
1	657	179529	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:53:00.059154-04	2026-10-13 22:53:00.06041-04
1	650	175603	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:46:00.009037-04	2026-10-13 22:46:00.010106-04
1	672	187984	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:08:00.008301-04	2026-10-13 23:08:00.009556-04
1	651	176155	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:47:00.058172-04	2026-10-13 22:47:00.059232-04
1	658	180089	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:54:00.007834-04	2026-10-13 22:54:00.009071-04
1	652	176709	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:48:00.059125-04	2026-10-13 22:48:00.060198-04
1	664	183475	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:00:00.059282-04	2026-10-13 23:00:00.060563-04
1	659	180666	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:55:00.008289-04	2026-10-13 22:55:00.009426-04
1	653	177259	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:49:00.059151-04	2026-10-13 22:49:00.060382-04
1	669	186300	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:05:00.008613-04	2026-10-13 23:05:00.009752-04
1	654	177842	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:50:00.008042-04	2026-10-13 22:50:00.009081-04
1	660	181236	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:56:00.011186-04	2026-10-13 22:56:00.012692-04
1	665	184043	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:01:00.009344-04	2026-10-13 23:01:00.010403-04
1	685	195329	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:21:00.009488-04	2026-10-13 23:21:00.010519-04
1	661	181796	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 22:57:00.008042-04	2026-10-13 22:57:00.009199-04
1	678	191396	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:14:00.008247-04	2026-10-13 23:14:00.009295-04
1	673	188550	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:09:00.008435-04	2026-10-13 23:09:00.009561-04
1	666	184610	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:02:00.008145-04	2026-10-13 23:02:00.009307-04
1	670	186869	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:06:00.009593-04	2026-10-13 23:06:00.010783-04
1	676	190296	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:12:00.008023-04	2026-10-13 23:12:00.009088-04
1	671	187423	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:07:00.00811-04	2026-10-13 23:07:00.009209-04
1	674	189162	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:10:00.008042-04	2026-10-13 23:10:00.00909-04
1	680	192537	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:16:00.009798-04	2026-10-13 23:16:00.01106-04
1	677	190856	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:13:00.007973-04	2026-10-13 23:13:00.00924-04
1	679	191969	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:15:00.009972-04	2026-10-13 23:15:00.01106-04
1	683	194206	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:19:00.008065-04	2026-10-13 23:19:00.00911-04
1	682	193647	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:18:00.007111-04	2026-10-13 23:18:00.008183-04
1	684	194771	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:20:00.008029-04	2026-10-13 23:20:00.009156-04
1	686	195889	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:22:00.008575-04	2026-10-13 23:22:00.009717-04
1	687	196437	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:23:00.008569-04	2026-10-13 23:23:00.009753-04
1	688	196987	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:24:00.008043-04	2026-10-13 23:24:00.009556-04
1	689	197554	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:25:00.011831-04	2026-10-13 23:25:00.013605-04
1	690	198110	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:26:00.008879-04	2026-10-13 23:26:00.009941-04
1	712	210450	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:48:00.008116-04	2026-10-13 23:48:00.009183-04
1	726	218447	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:02:00.008125-04	2026-10-14 00:02:00.009756-04
1	691	198649	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:27:00.008678-04	2026-10-13 23:27:00.009792-04
1	700	203735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:36:00.010025-04	2026-10-13 23:36:00.011086-04
1	707	207662	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:43:00.008588-04	2026-10-13 23:43:00.009651-04
1	692	199214	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:28:00.008059-04	2026-10-13 23:28:00.009129-04
1	720	214899	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:56:00.009089-04	2026-10-13 23:56:00.010327-04
1	701	204286	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:37:00.008293-04	2026-10-13 23:37:00.009355-04
1	693	199776	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:29:00.007989-04	2026-10-13 23:29:00.009021-04
1	713	210999	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:49:00.008483-04	2026-10-13 23:49:00.009581-04
1	694	200344	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:30:00.064317-04	2026-10-13 23:30:00.065463-04
1	708	208230	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:44:00.008293-04	2026-10-13 23:44:00.009446-04
1	702	204835	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:38:00.008629-04	2026-10-13 23:38:00.009881-04
1	695	200912	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:31:00.009742-04	2026-10-13 23:31:00.01098-04
1	717	213228	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:53:00.008334-04	2026-10-13 23:53:00.009481-04
1	696	201469	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:32:00.06431-04	2026-10-13 23:32:00.065367-04
1	703	205371	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:39:00.008451-04	2026-10-13 23:39:00.009569-04
1	697	202014	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:33:00.008526-04	2026-10-13 23:33:00.00966-04
1	709	208799	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:45:00.008299-04	2026-10-13 23:45:00.009421-04
1	704	206000	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:40:00.008321-04	2026-10-13 23:40:00.00956-04
1	698	202610	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:34:00.00937-04	2026-10-13 23:34:00.010864-04
1	714	211574	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:50:00.008713-04	2026-10-13 23:50:00.00984-04
1	699	203179	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:35:00.008729-04	2026-10-13 23:35:00.010242-04
1	705	206559	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:41:00.009067-04	2026-10-13 23:41:00.011282-04
1	710	209337	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:46:00.065582-04	2026-10-13 23:46:00.066687-04
1	730	220672	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:06:00.00936-04	2026-10-14 00:06:00.010603-04
1	706	207123	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:42:00.008553-04	2026-10-13 23:42:00.00975-04
1	723	216560	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:59:00.010535-04	2026-10-13 23:59:00.012052-04
1	718	213770	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:54:00.008108-04	2026-10-13 23:54:00.009235-04
1	711	209902	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:47:00.007765-04	2026-10-13 23:47:00.009056-04
1	715	212126	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:51:00.010587-04	2026-10-13 23:51:00.011844-04
1	721	215450	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:57:00.008839-04	2026-10-13 23:57:00.010039-04
1	716	212668	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:52:00.008312-04	2026-10-13 23:52:00.009494-04
1	719	214332	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:55:00.007789-04	2026-10-13 23:55:00.009025-04
1	725	217892	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:01:00.010274-04	2026-10-14 00:01:00.011343-04
1	722	215997	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-13 23:58:00.00777-04	2026-10-13 23:58:00.008871-04
1	724	217133	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:00:00.009555-04	2026-10-14 00:00:00.010676-04
1	728	219559	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:04:00.010747-04	2026-10-14 00:04:00.012349-04
1	727	219007	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:03:00.009605-04	2026-10-14 00:03:00.011121-04
1	729	220114	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:05:00.009193-04	2026-10-14 00:05:00.010271-04
1	731	221233	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:07:00.058585-04	2026-10-14 00:07:00.05977-04
1	732	221785	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:08:00.009061-04	2026-10-14 00:08:00.010138-04
1	733	222330	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:09:00.064765-04	2026-10-14 00:09:00.065914-04
1	734	222950	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:10:00.007532-04	2026-10-14 00:10:00.008757-04
1	735	223507	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:11:01.010159-04	2026-10-14 00:11:01.011419-04
1	757	235675	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:33:00.008702-04	2026-10-14 00:33:00.009959-04
1	771	243518	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:47:00.008114-04	2026-10-14 00:47:00.009143-04
1	736	224032	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:12:00.012675-04	2026-10-14 00:12:00.014304-04
1	745	229020	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:21:00.00941-04	2026-10-14 00:21:00.010534-04
1	752	232881	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:28:00.064293-04	2026-10-14 00:28:00.065356-04
1	737	224588	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:13:00.06336-04	2026-10-14 00:13:00.064485-04
1	765	240180	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:41:00.009502-04	2026-10-14 00:41:00.010573-04
1	746	229575	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:22:00.008304-04	2026-10-14 00:22:00.009418-04
1	738	225132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:14:00.058994-04	2026-10-14 00:14:00.060288-04
1	758	236224	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:34:00.063725-04	2026-10-14 00:34:00.064787-04
1	739	225700	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:15:00.009143-04	2026-10-14 00:15:00.010142-04
1	753	233443	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:29:00.008342-04	2026-10-14 00:29:00.009409-04
1	747	230122	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:23:00.009311-04	2026-10-14 00:23:00.010417-04
1	740	226258	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:16:00.059697-04	2026-10-14 00:16:00.060828-04
1	762	238455	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:38:00.010528-04	2026-10-14 00:38:00.012191-04
1	741	226798	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:17:00.064911-04	2026-10-14 00:17:00.066132-04
1	748	230657	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:24:00.01121-04	2026-10-14 00:24:00.012712-04
1	742	227357	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:18:00.064311-04	2026-10-14 00:18:00.065427-04
1	754	234005	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:30:00.009621-04	2026-10-14 00:30:00.010686-04
1	749	231229	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:25:00.009576-04	2026-10-14 00:25:00.011227-04
1	743	227914	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:19:00.031501-04	2026-10-14 00:19:00.03255-04
1	759	236787	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:35:00.06372-04	2026-10-14 00:35:00.065142-04
1	744	228484	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:20:00.069143-04	2026-10-14 00:20:00.070118-04
1	750	231784	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:26:00.01138-04	2026-10-14 00:26:00.012973-04
1	755	234567	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:31:00.009438-04	2026-10-14 00:31:00.010502-04
1	775	245761	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:51:00.008945-04	2026-10-14 00:51:00.010106-04
1	751	232323	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:27:00.060137-04	2026-10-14 00:27:00.061196-04
1	768	241838	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:44:00.072991-04	2026-10-14 00:44:00.074217-04
1	763	239002	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:39:00.064502-04	2026-10-14 00:39:00.065569-04
1	756	235117	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:32:00.063712-04	2026-10-14 00:32:00.064976-04
1	760	237346	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:36:00.059575-04	2026-10-14 00:36:00.060712-04
1	766	240740	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:42:00.062825-04	2026-10-14 00:42:00.064119-04
1	761	237898	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:37:00.059205-04	2026-10-14 00:37:00.060722-04
1	764	239613	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:40:00.009628-04	2026-10-14 00:40:00.010757-04
1	770	242965	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:46:00.009743-04	2026-10-14 00:46:00.010835-04
1	767	241282	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:43:00.010809-04	2026-10-14 00:43:00.012383-04
1	769	242401	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:45:00.064652-04	2026-10-14 00:45:00.06587-04
1	773	244624	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:49:00.063922-04	2026-10-14 00:49:00.065109-04
1	772	244079	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:48:00.00776-04	2026-10-14 00:48:00.008809-04
1	774	245196	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:50:00.065712-04	2026-10-14 00:50:00.066848-04
1	776	246314	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:52:00.058758-04	2026-10-14 00:52:00.059819-04
1	777	246866	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:53:00.009089-04	2026-10-14 00:53:00.010152-04
1	778	247429	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:54:00.063257-04	2026-10-14 00:54:00.064522-04
1	779	248005	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:55:00.00959-04	2026-10-14 00:55:00.010715-04
1	780	248544	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:56:00.07256-04	2026-10-14 00:56:00.073787-04
1	802	260804	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:18:00.009694-04	2026-10-14 01:18:00.01089-04
1	816	268579	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:32:00.008034-04	2026-10-14 01:32:00.009046-04
1	781	249104	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:57:00.010029-04	2026-10-14 00:57:00.011128-04
1	790	254100	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:06:00.009791-04	2026-10-14 01:06:00.010898-04
1	797	258033	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:13:00.009357-04	2026-10-14 01:13:00.010596-04
1	782	249661	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:58:00.010038-04	2026-10-14 00:58:00.0111-04
1	810	265251	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:26:00.065281-04	2026-10-14 01:26:00.066347-04
1	791	254657	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:07:00.064492-04	2026-10-14 01:07:00.065627-04
1	783	250194	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 00:59:00.008328-04	2026-10-14 00:59:00.009379-04
1	803	261354	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:19:00.063954-04	2026-10-14 01:19:00.065188-04
1	784	250773	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:00:00.008039-04	2026-10-14 01:00:00.009122-04
1	798	258566	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:14:00.008551-04	2026-10-14 01:14:00.009724-04
1	792	255196	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:08:00.007855-04	2026-10-14 01:08:00.009125-04
1	785	251332	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:01:00.010064-04	2026-10-14 01:01:00.011132-04
1	807	263581	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:23:00.009391-04	2026-10-14 01:23:00.010527-04
1	786	251879	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:02:00.058662-04	2026-10-14 01:02:00.059921-04
1	793	255747	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:09:00.008612-04	2026-10-14 01:09:00.009703-04
1	787	252433	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:03:00.008192-04	2026-10-14 01:03:00.009267-04
1	799	259137	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:15:00.058032-04	2026-10-14 01:15:00.059151-04
1	794	256372	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:10:00.011027-04	2026-10-14 01:10:00.012564-04
1	788	252979	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:04:00.0585-04	2026-10-14 01:04:00.059597-04
1	804	261921	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:20:00.063762-04	2026-10-14 01:20:00.064724-04
1	789	253538	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:05:00.009819-04	2026-10-14 01:05:00.010945-04
1	795	256921	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:11:00.011701-04	2026-10-14 01:11:00.013224-04
1	800	259699	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:16:00.065634-04	2026-10-14 01:16:00.066794-04
1	820	270811	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:36:00.009065-04	2026-10-14 01:36:00.01011-04
1	796	257476	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:12:00.063711-04	2026-10-14 01:12:00.064828-04
1	813	266898	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:29:00.058519-04	2026-10-14 01:29:00.059611-04
1	808	264122	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:24:00.007465-04	2026-10-14 01:24:00.008591-04
1	801	260257	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:17:00.058603-04	2026-10-14 01:17:00.059769-04
1	805	262466	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:21:00.010128-04	2026-10-14 01:21:00.011182-04
1	811	265790	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:27:00.064892-04	2026-10-14 01:27:00.066016-04
1	806	263018	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:22:00.00877-04	2026-10-14 01:22:00.009902-04
1	809	264691	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:25:00.05861-04	2026-10-14 01:25:00.059721-04
1	815	268026	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:31:00.009699-04	2026-10-14 01:31:00.01103-04
1	812	266356	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:28:00.059121-04	2026-10-14 01:28:00.060174-04
1	814	267467	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:30:00.008343-04	2026-10-14 01:30:00.009456-04
1	818	269673	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:34:00.058263-04	2026-10-14 01:34:00.059304-04
1	817	269131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:33:00.06323-04	2026-10-14 01:33:00.06448-04
1	819	270249	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:35:00.059015-04	2026-10-14 01:35:00.060117-04
1	821	271345	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:37:00.007945-04	2026-10-14 01:37:00.008973-04
1	822	271899	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:38:00.058152-04	2026-10-14 01:38:00.059129-04
1	823	272448	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:39:00.028872-04	2026-10-14 01:39:00.029939-04
1	824	273051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:40:00.058445-04	2026-10-14 01:40:00.059603-04
1	825	273599	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:41:00.010963-04	2026-10-14 01:41:00.012066-04
1	847	285790	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:03:00.058556-04	2026-10-14 02:03:00.059762-04
1	861	293627	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:17:00.009309-04	2026-10-14 02:17:00.010378-04
1	826	274149	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:42:00.060355-04	2026-10-14 01:42:00.061526-04
1	835	279151	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:51:00.0098-04	2026-10-14 01:51:00.010859-04
1	842	283014	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:58:00.058915-04	2026-10-14 01:58:00.059987-04
1	827	274698	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:43:00.008663-04	2026-10-14 01:43:00.009795-04
1	855	290290	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:11:00.009716-04	2026-10-14 02:11:00.010841-04
1	836	279705	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:52:00.008151-04	2026-10-14 01:52:00.009146-04
1	828	275251	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:44:00.008833-04	2026-10-14 01:44:00.010076-04
1	848	286336	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:04:00.008291-04	2026-10-14 02:04:00.00948-04
1	829	275819	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:45:00.058534-04	2026-10-14 01:45:00.059696-04
1	843	283562	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:59:00.05933-04	2026-10-14 01:59:00.060364-04
1	837	280254	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:53:00.059062-04	2026-10-14 01:53:00.060313-04
1	830	276371	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:46:00.011109-04	2026-10-14 01:46:00.012217-04
1	852	288576	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:08:00.008943-04	2026-10-14 02:08:00.009984-04
1	831	276916	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:47:00.007818-04	2026-10-14 01:47:00.00903-04
1	838	280801	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:54:00.008869-04	2026-10-14 01:54:00.010002-04
1	832	277479	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:48:00.007787-04	2026-10-14 01:48:00.008829-04
1	844	284129	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:00:00.009195-04	2026-10-14 02:00:00.010226-04
1	839	281376	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:55:00.058361-04	2026-10-14 01:55:00.059431-04
1	833	278028	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:49:00.05878-04	2026-10-14 01:49:00.059944-04
1	849	286889	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:05:00.05848-04	2026-10-14 02:05:00.059516-04
1	834	278584	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:50:00.00894-04	2026-10-14 01:50:00.010132-04
1	840	281911	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:56:00.059688-04	2026-10-14 01:56:00.060811-04
1	845	284687	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:01:00.009334-04	2026-10-14 02:01:00.010385-04
1	865	295834	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:21:00.010117-04	2026-10-14 02:21:00.011354-04
1	841	282458	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 01:57:00.008913-04	2026-10-14 01:57:00.010053-04
1	858	291947	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:14:00.008754-04	2026-10-14 02:14:00.009827-04
1	853	289111	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:09:00.00864-04	2026-10-14 02:09:00.009792-04
1	846	285239	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:02:00.058722-04	2026-10-14 02:02:00.059945-04
1	850	287467	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:06:00.010395-04	2026-10-14 02:06:00.011634-04
1	856	290837	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:12:00.058038-04	2026-10-14 02:12:00.059151-04
1	851	288021	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:07:00.058588-04	2026-10-14 02:07:00.059709-04
1	854	289732	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:10:00.008946-04	2026-10-14 02:10:00.010049-04
1	860	293068	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:16:00.008996-04	2026-10-14 02:16:00.010046-04
1	857	291390	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:13:00.00839-04	2026-10-14 02:13:00.00942-04
1	859	292506	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:15:00.058536-04	2026-10-14 02:15:00.059733-04
1	863	294721	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:19:00.058701-04	2026-10-14 02:19:00.059863-04
1	862	294165	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:18:00.058553-04	2026-10-14 02:18:00.059669-04
1	864	295291	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:20:00.008141-04	2026-10-14 02:20:00.009169-04
1	866	296388	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:22:00.008-04	2026-10-14 02:22:00.009235-04
1	867	296942	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:23:00.058335-04	2026-10-14 02:23:00.059561-04
1	868	297481	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:24:00.008648-04	2026-10-14 02:24:00.009849-04
1	869	298043	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:25:00.064601-04	2026-10-14 02:25:00.065674-04
1	870	298599	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:26:00.009451-04	2026-10-14 02:26:00.010606-04
1	892	310880	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:48:00.008238-04	2026-10-14 02:48:00.009471-04
1	906	318745	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:02:00.008469-04	2026-10-14 03:02:00.00962-04
1	871	299142	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:27:00.008761-04	2026-10-14 02:27:00.009813-04
1	880	304160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:36:00.059291-04	2026-10-14 02:36:00.060758-04
1	887	308092	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:43:00.071725-04	2026-10-14 02:43:00.07328-04
1	872	299693	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:28:00.05835-04	2026-10-14 02:28:00.059471-04
1	900	315311	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:56:00.00946-04	2026-10-14 02:56:00.010625-04
1	881	304706	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:37:00.058272-04	2026-10-14 02:37:00.059316-04
1	873	300245	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:29:00.058893-04	2026-10-14 02:29:00.060106-04
1	893	311432	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:49:00.058659-04	2026-10-14 02:49:00.059898-04
1	874	300812	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:30:00.062885-04	2026-10-14 02:30:00.063952-04
1	888	308633	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:44:00.063785-04	2026-10-14 02:44:00.064897-04
1	882	305257	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:38:00.007776-04	2026-10-14 02:38:00.008829-04
1	875	301379	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:31:00.009818-04	2026-10-14 02:31:00.010988-04
1	897	313642	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:53:00.008354-04	2026-10-14 02:53:00.009479-04
1	876	301930	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:32:00.058504-04	2026-10-14 02:32:00.059599-04
1	883	305810	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:39:00.06362-04	2026-10-14 02:39:00.064859-04
1	877	302480	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:33:00.058805-04	2026-10-14 02:33:00.05988-04
1	889	309212	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:45:00.008134-04	2026-10-14 02:45:00.009263-04
1	884	306416	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:40:00.062763-04	2026-10-14 02:40:00.063837-04
1	878	303031	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:34:00.008263-04	2026-10-14 02:34:00.009378-04
1	894	311991	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:50:00.008148-04	2026-10-14 02:50:00.009206-04
1	879	303602	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:35:00.008219-04	2026-10-14 02:35:00.00936-04
1	885	306973	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:41:00.009304-04	2026-10-14 02:41:00.010347-04
1	890	309775	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:46:00.065482-04	2026-10-14 02:46:00.066542-04
1	910	320975	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:06:00.009961-04	2026-10-14 03:06:00.011113-04
1	886	307537	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:42:00.010997-04	2026-10-14 02:42:00.012503-04
1	903	316974	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:59:00.008138-04	2026-10-14 02:59:00.009241-04
1	898	314197	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:54:00.063988-04	2026-10-14 02:54:00.06512-04
1	891	310317	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:47:00.064252-04	2026-10-14 02:47:00.065447-04
1	895	312543	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:51:00.009585-04	2026-10-14 02:51:00.010729-04
1	901	315868	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:57:00.009638-04	2026-10-14 02:57:00.010757-04
1	896	313095	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:52:00.063528-04	2026-10-14 02:52:00.064617-04
1	899	314772	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:55:00.008366-04	2026-10-14 02:55:00.00941-04
1	905	318181	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:01:00.009432-04	2026-10-14 03:01:00.010501-04
1	902	316429	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 02:58:00.009436-04	2026-10-14 02:58:00.010515-04
1	904	317540	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:00:00.008255-04	2026-10-14 03:00:00.009339-04
1	908	319846	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:04:00.062333-04	2026-10-14 03:04:00.063435-04
1	907	319289	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:03:00.008624-04	2026-10-14 03:03:00.009809-04
1	909	320428	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:05:00.008185-04	2026-10-14 03:05:00.009284-04
1	911	321533	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:07:00.009458-04	2026-10-14 03:07:00.010592-04
1	912	322088	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:08:00.009331-04	2026-10-14 03:08:00.010382-04
1	913	322629	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:09:00.007888-04	2026-10-14 03:09:00.008989-04
1	914	323254	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:10:00.058766-04	2026-10-14 03:10:00.059922-04
1	915	323819	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:11:00.009789-04	2026-10-14 03:11:00.010861-04
1	937	336005	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:33:00.009088-04	2026-10-14 03:33:00.010137-04
1	951	343845	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:47:00.058749-04	2026-10-14 03:47:00.059827-04
1	916	324361	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:12:00.064526-04	2026-10-14 03:12:00.065585-04
1	925	329349	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:21:00.009555-04	2026-10-14 03:21:00.010703-04
1	932	333217	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:28:00.065999-04	2026-10-14 03:28:00.067541-04
1	917	324914	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:13:00.009029-04	2026-10-14 03:13:00.010057-04
1	945	340518	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:41:00.00993-04	2026-10-14 03:41:00.010992-04
1	926	329894	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:22:00.064651-04	2026-10-14 03:22:00.065905-04
1	918	325465	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:14:00.063021-04	2026-10-14 03:14:00.064139-04
1	938	336553	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:34:00.008425-04	2026-10-14 03:34:00.009592-04
1	919	326023	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:15:00.06374-04	2026-10-14 03:15:00.064942-04
1	933	333770	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:29:00.011013-04	2026-10-14 03:29:00.012552-04
1	927	330447	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:23:00.064184-04	2026-10-14 03:23:00.065447-04
1	920	326573	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:16:00.008678-04	2026-10-14 03:16:00.009827-04
1	942	338797	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:38:00.010204-04	2026-10-14 03:38:00.011392-04
1	921	327137	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:17:00.008122-04	2026-10-14 03:17:00.009165-04
1	928	330997	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:24:00.063797-04	2026-10-14 03:24:00.064831-04
1	922	327700	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:18:00.069901-04	2026-10-14 03:18:00.071041-04
1	934	334341	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:30:00.065833-04	2026-10-14 03:30:00.067376-04
1	929	331563	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:25:00.059172-04	2026-10-14 03:25:00.06041-04
1	923	328229	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:19:00.059375-04	2026-10-14 03:19:00.060493-04
1	939	337132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:35:00.063656-04	2026-10-14 03:35:00.06472-04
1	924	328794	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:20:00.05875-04	2026-10-14 03:20:00.059896-04
1	930	332122	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:26:00.061515-04	2026-10-14 03:26:00.063007-04
1	935	334895	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:31:00.009036-04	2026-10-14 03:31:00.01019-04
1	955	346090	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:51:00.008917-04	2026-10-14 03:51:00.010083-04
1	931	332673	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:27:00.009216-04	2026-10-14 03:27:00.010745-04
1	948	342161	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:44:00.058776-04	2026-10-14 03:44:00.059851-04
1	943	339357	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:39:00.058937-04	2026-10-14 03:39:00.060278-04
1	936	335444	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:32:00.059246-04	2026-10-14 03:32:00.060437-04
1	940	337694	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:36:00.009002-04	2026-10-14 03:36:00.010139-04
1	946	341070	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:42:00.06404-04	2026-10-14 03:42:00.065112-04
1	941	338244	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:37:00.064691-04	2026-10-14 03:37:00.065908-04
1	944	339975	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:40:00.059001-04	2026-10-14 03:40:00.060065-04
1	950	343296	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:46:00.059556-04	2026-10-14 03:46:00.060644-04
1	947	341622	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:43:00.059719-04	2026-10-14 03:43:00.060848-04
1	949	342731	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:45:00.059474-04	2026-10-14 03:45:00.06065-04
1	953	344961	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:49:00.058685-04	2026-10-14 03:49:00.059944-04
1	952	344400	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:48:00.007888-04	2026-10-14 03:48:00.008966-04
1	954	345527	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:50:00.058579-04	2026-10-14 03:50:00.059648-04
1	956	346650	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:52:00.059594-04	2026-10-14 03:52:00.060734-04
1	957	347196	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:53:00.008138-04	2026-10-14 03:53:00.009174-04
1	958	347741	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:54:00.008987-04	2026-10-14 03:54:00.010168-04
1	959	348312	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:55:00.008573-04	2026-10-14 03:55:00.009726-04
1	960	348856	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:56:00.06566-04	2026-10-14 03:56:00.066728-04
1	982	361821	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:18:00.009609-04	2026-10-14 04:18:00.010717-04
1	996	369616	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:32:00.058859-04	2026-10-14 04:32:00.060021-04
1	961	349409	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:57:00.059958-04	2026-10-14 03:57:00.061057-04
1	970	355073	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:06:00.008908-04	2026-10-14 04:06:00.009989-04
1	977	359025	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:13:00.008361-04	2026-10-14 04:13:00.009511-04
1	962	349969	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:58:00.059141-04	2026-10-14 03:58:00.060301-04
1	990	366291	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:26:00.059498-04	2026-10-14 04:26:00.060541-04
1	971	355635	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:07:00.008424-04	2026-10-14 04:07:00.009478-04
1	963	350511	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 03:59:00.009222-04	2026-10-14 03:59:00.010276-04
1	983	362365	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:19:00.059188-04	2026-10-14 04:19:00.060424-04
1	964	351749	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:00:00.008782-04	2026-10-14 04:00:00.009899-04
1	978	359578	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:14:00.058941-04	2026-10-14 04:14:00.060091-04
1	972	356184	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:08:00.059138-04	2026-10-14 04:08:00.06032-04
1	965	352297	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:01:00.009798-04	2026-10-14 04:01:00.010873-04
1	987	364612	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:23:00.008444-04	2026-10-14 04:23:00.009551-04
1	966	352872	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:02:00.058055-04	2026-10-14 04:02:00.059102-04
1	973	356734	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:09:00.007847-04	2026-10-14 04:09:00.008986-04
1	967	353415	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:03:00.064797-04	2026-10-14 04:03:00.065861-04
1	979	360145	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:15:00.058317-04	2026-10-14 04:15:00.059433-04
1	974	357352	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:10:00.008487-04	2026-10-14 04:10:00.009626-04
1	968	353969	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:04:00.059251-04	2026-10-14 04:04:00.060339-04
1	984	362936	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:20:00.059365-04	2026-10-14 04:20:00.06058-04
1	969	354537	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:05:00.058849-04	2026-10-14 04:05:00.060011-04
1	975	357913	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:11:00.008366-04	2026-10-14 04:11:00.009431-04
1	980	360709	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:16:00.06237-04	2026-10-14 04:16:00.063438-04
1	1000	378751	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:36:00.009907-04	2026-10-14 04:36:00.011247-04
1	976	358465	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:12:00.059203-04	2026-10-14 04:12:00.060371-04
1	993	367934	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:29:00.05937-04	2026-10-14 04:29:00.060484-04
1	988	365175	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:24:00.059468-04	2026-10-14 04:24:00.060539-04
1	981	361264	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:17:00.064303-04	2026-10-14 04:17:00.065369-04
1	985	363495	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:21:00.009349-04	2026-10-14 04:21:00.010497-04
1	991	366839	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:27:00.007609-04	2026-10-14 04:27:00.008642-04
1	986	364043	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:22:00.008234-04	2026-10-14 04:22:00.009473-04
1	989	365734	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:25:00.059063-04	2026-10-14 04:25:00.060133-04
1	995	369056	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:31:00.009842-04	2026-10-14 04:31:00.010924-04
1	992	367378	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:28:00.064116-04	2026-10-14 04:28:00.065363-04
1	994	368505	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:30:00.064563-04	2026-10-14 04:30:00.065624-04
1	998	370888	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:34:00.065122-04	2026-10-14 04:34:00.066332-04
1	997	370180	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:33:00.058515-04	2026-10-14 04:33:00.059574-04
1	999	372575	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:35:00.061959-04	2026-10-14 04:35:00.064189-04
1	1001	379324	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:37:00.00865-04	2026-10-14 04:37:00.009854-04
1	1002	379899	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:38:00.010782-04	2026-10-14 04:38:00.012355-04
1	1003	380455	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:39:00.009419-04	2026-10-14 04:39:00.010571-04
1	1004	381074	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:40:00.059239-04	2026-10-14 04:40:00.060433-04
1	1005	381665	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:41:00.008961-04	2026-10-14 04:41:00.010083-04
1	1027	394322	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:03:00.011255-04	2026-10-14 05:03:00.012431-04
1	1041	404070	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:17:00.008881-04	2026-10-14 05:17:00.009962-04
1	1006	382220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:42:00.010875-04	2026-10-14 04:42:00.012111-04
1	1015	387212	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:51:00.009768-04	2026-10-14 04:51:00.011004-04
1	1022	391412	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:58:00.05916-04	2026-10-14 04:58:00.060309-04
1	1007	382757	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:43:00.007978-04	2026-10-14 04:43:00.009546-04
1	1035	400521	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:11:00.011201-04	2026-10-14 05:11:00.012716-04
1	1016	387751	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:52:00.058995-04	2026-10-14 04:52:00.060308-04
1	1008	383319	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:44:00.058964-04	2026-10-14 04:44:00.060148-04
1	1028	394954	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:04:00.008153-04	2026-10-14 05:04:00.00934-04
1	1009	383896	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:45:00.072668-04	2026-10-14 04:45:00.073891-04
1	1023	391988	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:59:00.008357-04	2026-10-14 04:59:00.009531-04
1	1017	388304	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:53:00.008591-04	2026-10-14 04:53:00.009631-04
1	1010	384435	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:46:00.009146-04	2026-10-14 04:46:00.010465-04
1	1032	398469	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:08:00.009253-04	2026-10-14 05:08:00.010886-04
1	1011	384989	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:47:00.008194-04	2026-10-14 04:47:00.009358-04
1	1018	388862	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:54:00.008579-04	2026-10-14 04:54:00.009739-04
1	1012	385536	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:48:00.009536-04	2026-10-14 04:48:00.010713-04
1	1024	392590	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:00:00.008389-04	2026-10-14 05:00:00.009602-04
1	1019	389612	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:55:00.010332-04	2026-10-14 04:55:00.011418-04
1	1013	386084	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:49:00.010121-04	2026-10-14 04:49:00.011686-04
1	1029	395876	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:05:00.008524-04	2026-10-14 05:05:00.009564-04
1	1014	386659	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:50:00.0102-04	2026-10-14 04:50:00.011704-04
1	1020	390277	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:56:00.011286-04	2026-10-14 04:56:00.01278-04
1	1025	393143	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:01:00.009355-04	2026-10-14 05:01:00.01063-04
1	1045	406829	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:21:00.009658-04	2026-10-14 05:21:00.010798-04
1	1021	390839	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 04:57:00.007969-04	2026-10-14 04:57:00.009208-04
1	1038	402384	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:14:00.007922-04	2026-10-14 05:14:00.009065-04
1	1033	399205	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:09:00.016727-04	2026-10-14 05:09:00.020521-04
1	1026	393703	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:02:00.058737-04	2026-10-14 05:02:00.059812-04
1	1030	396737	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:06:00.008669-04	2026-10-14 05:06:00.010343-04
1	1036	401159	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:12:00.009949-04	2026-10-14 05:12:00.011486-04
1	1031	397666	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:07:00.010614-04	2026-10-14 05:07:00.012357-04
1	1034	399893	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:10:00.009077-04	2026-10-14 05:10:00.01027-04
1	1040	403507	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:16:00.00888-04	2026-10-14 05:16:00.01002-04
1	1037	401783	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:13:00.008704-04	2026-10-14 05:13:00.009872-04
1	1039	402952	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:15:00.008201-04	2026-10-14 05:15:00.009342-04
1	1043	405522	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:19:00.009526-04	2026-10-14 05:19:00.011099-04
1	1042	404833	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:18:00.010603-04	2026-10-14 05:18:00.011973-04
1	1044	406180	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:20:00.008463-04	2026-10-14 05:20:00.009748-04
1	1046	407417	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:22:00.008083-04	2026-10-14 05:22:00.009216-04
1	1047	408032	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:23:00.007515-04	2026-10-14 05:23:00.00863-04
1	1048	408657	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:24:00.009234-04	2026-10-14 05:24:00.010807-04
1	1049	409494	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:25:00.010176-04	2026-10-14 05:25:00.011735-04
1	1050	410671	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:26:00.009556-04	2026-10-14 05:26:00.010828-04
1	1072	427734	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:48:00.010106-04	2026-10-14 05:48:00.011723-04
1	1086	437082	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:02:00.008674-04	2026-10-14 06:02:00.009778-04
1	1051	411631	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:27:00.009696-04	2026-10-14 05:27:00.010911-04
1	1060	419160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:36:00.010593-04	2026-10-14 05:36:00.011696-04
1	1067	424293	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:43:00.008055-04	2026-10-14 05:43:00.009245-04
1	1052	412740	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:28:00.009628-04	2026-10-14 05:28:00.011289-04
1	1080	433031	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:56:00.009675-04	2026-10-14 05:56:00.010877-04
1	1061	419838	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:37:00.008969-04	2026-10-14 05:37:00.010334-04
1	1053	413611	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:29:00.010206-04	2026-10-14 05:29:00.011874-04
1	1073	428316	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:49:00.008696-04	2026-10-14 05:49:00.009838-04
1	1054	414283	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:30:00.010697-04	2026-10-14 05:30:00.012354-04
1	1068	424920	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:44:00.007526-04	2026-10-14 05:44:00.008705-04
1	1062	420760	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:38:00.009904-04	2026-10-14 05:38:00.011451-04
1	1055	415461	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:31:00.008926-04	2026-10-14 05:31:00.010311-04
1	1077	431178	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:53:00.008713-04	2026-10-14 05:53:00.009875-04
1	1056	416110	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:32:00.008952-04	2026-10-14 05:32:00.010231-04
1	1063	421544	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:39:00.008921-04	2026-10-14 05:39:00.010438-04
1	1057	416735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:33:00.008861-04	2026-10-14 05:33:00.010097-04
1	1069	425620	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:45:00.008268-04	2026-10-14 05:45:00.009432-04
1	1064	422372	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:40:00.009019-04	2026-10-14 05:40:00.010834-04
1	1058	417510	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:34:00.008356-04	2026-10-14 05:34:00.009704-04
1	1074	428921	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:50:00.008558-04	2026-10-14 05:50:00.009601-04
1	1059	418431	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:35:00.009156-04	2026-10-14 05:35:00.010766-04
1	1065	422994	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:41:00.011765-04	2026-10-14 05:41:00.013299-04
1	1070	426433	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:46:00.00955-04	2026-10-14 05:46:00.01062-04
1	1090	439702	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:06:00.010976-04	2026-10-14 06:06:00.012523-04
1	1066	423626	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:42:00.00921-04	2026-10-14 05:42:00.010366-04
1	1083	435098	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:59:00.009149-04	2026-10-14 05:59:00.010385-04
1	1078	431795	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:54:00.010272-04	2026-10-14 05:54:00.011721-04
1	1071	427131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:47:00.00922-04	2026-10-14 05:47:00.010416-04
1	1075	429781	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:51:00.010919-04	2026-10-14 05:51:00.012428-04
1	1081	433711	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:57:00.008478-04	2026-10-14 05:57:00.009681-04
1	1076	430559	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:52:00.00968-04	2026-10-14 05:52:00.011288-04
1	1079	432429	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:55:00.011102-04	2026-10-14 05:55:00.012247-04
1	1085	436461	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:01:00.009309-04	2026-10-14 06:01:00.010434-04
1	1082	434499	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 05:58:00.007244-04	2026-10-14 05:58:00.008369-04
1	1084	435765	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:00:00.008529-04	2026-10-14 06:00:00.009812-04
1	1088	438299	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:04:00.007915-04	2026-10-14 06:04:00.009084-04
1	1087	437679	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:03:00.008517-04	2026-10-14 06:03:00.009667-04
1	1089	439092	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:05:00.008169-04	2026-10-14 06:05:00.009243-04
1	1091	440295	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:07:00.008975-04	2026-10-14 06:07:00.010558-04
1	1092	441277	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:08:00.008644-04	2026-10-14 06:08:00.00983-04
1	1093	441923	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:09:00.008585-04	2026-10-14 06:09:00.009728-04
1	1094	442577	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:10:00.010161-04	2026-10-14 06:10:00.011726-04
1	1095	443490	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:11:00.009406-04	2026-10-14 06:11:00.010564-04
1	1096	444348	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:12:00.010112-04	2026-10-14 06:12:00.011662-04
1	1105	453707	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:21:00.00953-04	2026-10-14 06:21:00.011061-04
1	1097	446081	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:13:00.008404-04	2026-10-14 06:13:00.010232-04
1	1106	454464	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:22:00.007071-04	2026-10-14 06:22:00.008284-04
1	1098	447054	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:14:00.009066-04	2026-10-14 06:14:00.010253-04
1	1099	447768	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:15:00.011911-04	2026-10-14 06:15:00.013289-04
1	1107	455103	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:23:00.008738-04	2026-10-14 06:23:00.009982-04
1	1100	448615	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:16:00.009849-04	2026-10-14 06:16:00.011151-04
1	1101	450133	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:17:00.009845-04	2026-10-14 06:17:00.011166-04
1	1108	455902	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:24:00.011249-04	2026-10-14 06:24:00.012842-04
1	1102	451442	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:18:00.010176-04	2026-10-14 06:18:00.011811-04
1	1109	456976	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:25:00.010921-04	2026-10-14 06:25:00.012302-04
1	1103	452413	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:19:00.008663-04	2026-10-14 06:19:00.009916-04
1	1104	453073	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 06:20:00.00828-04	2026-10-14 06:20:00.009499-04
1	1122	25355	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:21:00.010641-04	2026-10-14 08:21:00.013263-04
1	1116	21541	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:15:00.012884-04	2026-10-14 08:15:00.016723-04
1	1111	16143	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:10:00.02311-04	2026-10-14 08:10:00.025539-04
1	1114	19748	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:13:00.009796-04	2026-10-14 08:13:00.012766-04
1	1118	22744	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:17:00.009912-04	2026-10-14 08:17:00.012608-04
1	1112	16591	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:11:00.010179-04	2026-10-14 08:11:00.012588-04
1	1115	20678	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:14:00.011801-04	2026-10-14 08:14:00.022102-04
1	1113	18841	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:12:00.012356-04	2026-10-14 08:12:00.015312-04
1	1117	22169	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:16:00.00977-04	2026-10-14 08:16:00.012621-04
1	1123	25872	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:22:00.007172-04	2026-10-14 08:22:00.009775-04
1	1120	24031	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:19:00.008243-04	2026-10-14 08:19:00.011378-04
1	1119	23349	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:18:00.009951-04	2026-10-14 08:18:00.012811-04
1	1121	24586	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:20:00.00975-04	2026-10-14 08:20:00.011398-04
1	1124	26432	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:23:00.011099-04	2026-10-14 08:23:00.013505-04
1	1125	27084	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:24:00.008829-04	2026-10-14 08:24:00.011445-04
1	1126	27593	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:25:00.01022-04	2026-10-14 08:25:00.012509-04
1	1127	28160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:26:00.010937-04	2026-10-14 08:26:00.013221-04
1	1128	28714	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:27:00.039997-04	2026-10-14 08:27:00.042287-04
1	1154	45836	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:53:00.009471-04	2026-10-14 08:53:00.012012-04
1	1150	43566	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:49:00.009987-04	2026-10-14 08:49:00.012454-04
1	1110	15403	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:09:00.011303-04	2026-10-14 08:09:00.013838-04
1	1129	29212	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:28:00.010771-04	2026-10-14 08:28:00.013119-04
1	1138	34429	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:37:00.01083-04	2026-10-14 08:37:00.013203-04
1	1145	39955	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:44:00.010335-04	2026-10-14 08:44:00.013409-04
1	1130	29926	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:29:00.009682-04	2026-10-14 08:29:00.012077-04
1	1139	35105	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:38:00.011057-04	2026-10-14 08:38:00.013406-04
1	1131	30473	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:30:00.009352-04	2026-10-14 08:30:00.011919-04
1	1167	53173	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:06:00.011113-04	2026-10-14 09:06:00.013686-04
1	1160	49141	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:59:00.008269-04	2026-10-14 08:59:00.010114-04
1	1132	30971	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:31:00.009746-04	2026-10-14 08:31:00.012061-04
1	1146	40807	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:45:00.039218-04	2026-10-14 08:45:00.041729-04
1	1140	35965	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:39:00.009637-04	2026-10-14 08:39:00.011495-04
1	1133	31604	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:32:00.009256-04	2026-10-14 08:32:00.011811-04
1	1151	44143	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:50:00.009903-04	2026-10-14 08:50:00.012452-04
1	1134	32226	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:33:00.010671-04	2026-10-14 08:33:00.012947-04
1	1141	36765	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:40:00.010828-04	2026-10-14 08:40:00.013226-04
1	1135	32789	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:34:00.009978-04	2026-10-14 08:34:00.012251-04
1	1147	41335	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:46:00.009914-04	2026-10-14 08:46:00.012207-04
1	1142	37546	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:41:00.01025-04	2026-10-14 08:41:00.013604-04
1	1136	33290	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:35:00.010071-04	2026-10-14 08:35:00.012421-04
1	1155	46330	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:54:00.010502-04	2026-10-14 08:54:00.012546-04
1	1137	33869	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:36:00.010441-04	2026-10-14 08:36:00.013093-04
1	1152	44805	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:51:00.010326-04	2026-10-14 08:51:00.012667-04
1	1143	38405	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:42:00.008692-04	2026-10-14 08:42:00.011314-04
1	1148	41977	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:47:00.010289-04	2026-10-14 08:47:00.013029-04
1	1144	39220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:43:00.010084-04	2026-10-14 08:43:00.013434-04
1	1158	48172	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:57:00.010643-04	2026-10-14 08:57:00.012994-04
1	1149	42854	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:48:00.009152-04	2026-10-14 08:48:00.013785-04
1	1162	50178	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:01:00.009828-04	2026-10-14 09:01:00.012261-04
1	1156	46814	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:55:00.009861-04	2026-10-14 08:55:00.012275-04
1	1153	45297	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:52:00.009958-04	2026-10-14 08:52:00.012274-04
1	1159	48650	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:58:00.010115-04	2026-10-14 08:58:00.012692-04
1	1157	47476	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 08:56:00.01049-04	2026-10-14 08:56:00.013255-04
1	1161	49611	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:00:00.009941-04	2026-10-14 09:00:00.012242-04
1	1165	51936	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:04:00.00916-04	2026-10-14 09:04:00.011652-04
1	1164	51387	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:03:00.00798-04	2026-10-14 09:03:00.009707-04
1	1163	50729	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:02:00.009947-04	2026-10-14 09:02:00.012228-04
1	1166	52574	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:05:00.009794-04	2026-10-14 09:05:00.012213-04
1	1168	53668	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:07:00.011525-04	2026-10-14 09:07:00.01386-04
1	1169	54202	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:08:00.010805-04	2026-10-14 09:08:00.013051-04
1	1170	54675	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:09:00.01073-04	2026-10-14 09:09:00.013204-04
1	1171	55161	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:10:00.01037-04	2026-10-14 09:10:00.012964-04
1	1172	55668	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:11:00.01051-04	2026-10-14 09:11:00.012829-04
1	1194	69484	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:33:00.010861-04	2026-10-14 09:33:00.013087-04
1	1208	79341	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:47:00.01045-04	2026-10-14 09:47:00.012881-04
1	1173	56134	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:12:00.011304-04	2026-10-14 09:12:00.013804-04
1	1182	61642	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:21:00.012339-04	2026-10-14 09:21:00.015286-04
1	1189	66239	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:28:00.009718-04	2026-10-14 09:28:00.012258-04
1	1174	56633	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:13:00.012933-04	2026-10-14 09:13:00.015636-04
1	1202	74812	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:41:00.009447-04	2026-10-14 09:41:00.01208-04
1	1183	62450	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:22:00.010504-04	2026-10-14 09:22:00.012401-04
1	1175	57163	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:14:00.01008-04	2026-10-14 09:14:00.012475-04
1	1195	70255	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:34:00.01838-04	2026-10-14 09:34:00.021375-04
1	1176	58047	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:15:00.010469-04	2026-10-14 09:15:00.013383-04
1	1190	66863	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:29:00.009748-04	2026-10-14 09:29:00.012287-04
1	1184	63354	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:23:00.008498-04	2026-10-14 09:23:00.010544-04
1	1177	58604	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:16:00.010132-04	2026-10-14 09:16:00.012404-04
1	1199	72998	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:38:00.01001-04	2026-10-14 09:38:00.012496-04
1	1178	59104	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:17:00.009398-04	2026-10-14 09:17:00.011631-04
1	1185	63906	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:24:00.047137-04	2026-10-14 09:24:00.050029-04
1	1179	59617	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:18:00.009912-04	2026-10-14 09:18:00.01223-04
1	1191	67541	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:30:00.010132-04	2026-10-14 09:30:00.01277-04
1	1186	64394	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:25:00.009336-04	2026-10-14 09:25:00.011964-04
1	1180	60363	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:19:00.008757-04	2026-10-14 09:19:00.010927-04
1	1196	71043	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:35:00.00915-04	2026-10-14 09:35:00.010771-04
1	1181	60931	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:20:00.010428-04	2026-10-14 09:20:00.013179-04
1	1187	65047	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:26:00.008883-04	2026-10-14 09:26:00.010759-04
1	1192	68075	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:31:00.008477-04	2026-10-14 09:31:00.010558-04
1	1212	82053	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:51:00.00851-04	2026-10-14 09:51:00.010609-04
1	1188	65621	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:27:00.010549-04	2026-10-14 09:27:00.013098-04
1	1205	77195	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:44:00.008929-04	2026-10-14 09:44:00.011716-04
1	1200	73472	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:39:00.010555-04	2026-10-14 09:39:00.012962-04
1	1193	68838	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:32:00.008382-04	2026-10-14 09:32:00.010384-04
1	1197	71638	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:36:00.008742-04	2026-10-14 09:36:00.011108-04
1	1203	75643	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:42:00.010973-04	2026-10-14 09:42:00.013308-04
1	1198	72414	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:37:00.009743-04	2026-10-14 09:37:00.011597-04
1	1201	74060	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:40:00.010246-04	2026-10-14 09:40:00.012743-04
1	1207	78505	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:46:00.011101-04	2026-10-14 09:46:00.013534-04
1	1204	76319	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:43:00.008289-04	2026-10-14 09:43:00.01013-04
1	1206	77713	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:45:00.010136-04	2026-10-14 09:45:00.012805-04
1	1210	81014	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:49:00.009429-04	2026-10-14 09:49:00.011712-04
1	1209	80155	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:48:00.010212-04	2026-10-14 09:48:00.012575-04
1	1211	81569	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:50:00.009437-04	2026-10-14 09:50:00.012869-04
1	1213	82884	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:52:00.011206-04	2026-10-14 09:52:00.013725-04
1	1214	83594	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:53:00.010189-04	2026-10-14 09:53:00.012651-04
1	1215	84292	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:54:00.010055-04	2026-10-14 09:54:00.013047-04
1	1216	84849	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:55:00.011938-04	2026-10-14 09:55:00.014245-04
1	1217	85434	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:56:00.009765-04	2026-10-14 09:56:00.01227-04
1	1239	96577	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:18:00.010032-04	2026-10-14 10:18:00.012283-04
1	1253	102956	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:32:00.009903-04	2026-10-14 10:32:00.012133-04
1	1218	86171	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:57:00.008925-04	2026-10-14 09:57:00.011817-04
1	1227	91087	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:06:00.010043-04	2026-10-14 10:06:00.012376-04
1	1234	94312	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:13:00.009854-04	2026-10-14 10:13:00.012112-04
1	1219	86654	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:58:00.009911-04	2026-10-14 09:58:00.012479-04
1	1247	100229	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:26:00.009072-04	2026-10-14 10:26:00.011357-04
1	1228	91556	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:07:00.009866-04	2026-10-14 10:07:00.0122-04
1	1220	87175	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 09:59:00.010606-04	2026-10-14 09:59:00.013158-04
1	1240	97042	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:19:00.009058-04	2026-10-14 10:19:00.011262-04
1	1221	87831	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:00:00.008322-04	2026-10-14 10:00:00.010228-04
1	1235	94754	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:14:00.010162-04	2026-10-14 10:14:00.012455-04
1	1229	92007	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:08:00.010388-04	2026-10-14 10:08:00.012652-04
1	1222	88578	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:01:00.009235-04	2026-10-14 10:01:00.011156-04
1	1244	98855	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:23:00.008421-04	2026-10-14 10:23:00.010189-04
1	1223	89100	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:02:00.009749-04	2026-10-14 10:02:00.011896-04
1	1230	92486	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:09:00.010567-04	2026-10-14 10:09:00.013262-04
1	1224	89693	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:03:00.010017-04	2026-10-14 10:03:00.012597-04
1	1236	95214	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:15:00.011209-04	2026-10-14 10:15:00.013736-04
1	1231	92934	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:10:00.01005-04	2026-10-14 10:10:00.012455-04
1	1225	90160	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:04:00.009661-04	2026-10-14 10:04:00.012186-04
1	1241	97488	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:20:00.009914-04	2026-10-14 10:20:00.012167-04
1	1226	90634	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:05:00.009825-04	2026-10-14 10:05:00.012145-04
1	1232	93401	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:11:00.010438-04	2026-10-14 10:11:00.012786-04
1	1237	95668	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:16:00.009685-04	2026-10-14 10:16:00.011994-04
1	1257	105033	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:36:00.009345-04	2026-10-14 10:36:00.011201-04
1	1233	93853	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:12:00.01043-04	2026-10-14 10:12:00.012704-04
1	1250	101580	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:29:00.009714-04	2026-10-14 10:29:00.012262-04
1	1245	99310	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:24:00.009572-04	2026-10-14 10:24:00.011918-04
1	1238	96131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:17:00.008917-04	2026-10-14 10:17:00.011174-04
1	1242	97951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:21:00.00789-04	2026-10-14 10:21:00.009508-04
1	1248	100674	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:27:00.009788-04	2026-10-14 10:27:00.01208-04
1	1243	98408	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:22:00.009857-04	2026-10-14 10:22:00.012162-04
1	1246	99771	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:25:00.009279-04	2026-10-14 10:25:00.0121-04
1	1252	102495	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:31:00.010183-04	2026-10-14 10:31:00.012556-04
1	1249	101125	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:28:00.00986-04	2026-10-14 10:28:00.012257-04
1	1251	102036	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:30:00.01048-04	2026-10-14 10:30:00.012949-04
1	1255	103847	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:34:00.009827-04	2026-10-14 10:34:00.012169-04
1	1254	103401	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:33:00.01127-04	2026-10-14 10:33:00.013523-04
1	1256	104413	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:35:00.010598-04	2026-10-14 10:35:00.012975-04
1	1258	106219	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:37:00.010506-04	2026-10-14 10:37:00.01316-04
1	1259	106961	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:38:00.00794-04	2026-10-14 10:38:00.009882-04
1	1260	107603	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:39:00.011343-04	2026-10-14 10:39:00.015428-04
1	1261	108221	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:40:00.010191-04	2026-10-14 10:40:00.012828-04
1	1262	108713	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:41:00.010679-04	2026-10-14 10:41:00.013597-04
1	1284	124504	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:03:00.010693-04	2026-10-14 11:03:00.013201-04
1	1298	131336	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:17:00.012609-04	2026-10-14 11:17:00.015211-04
1	1263	109278	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:42:00.010724-04	2026-10-14 10:42:00.01367-04
1	1272	118850	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:51:00.010923-04	2026-10-14 10:51:00.014153-04
1	1279	122155	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:58:00.010279-04	2026-10-14 10:58:00.012898-04
1	1264	109809	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:43:00.010836-04	2026-10-14 10:43:00.013189-04
1	1292	128369	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:11:00.010367-04	2026-10-14 11:11:00.012674-04
1	1273	119314	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:52:00.013075-04	2026-10-14 10:52:00.015806-04
1	1265	110311	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:44:00.009603-04	2026-10-14 10:44:00.01192-04
1	1285	124999	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:04:00.010053-04	2026-10-14 11:04:00.012674-04
1	1266	110807	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:45:00.009059-04	2026-10-14 10:45:00.01098-04
1	1280	122631	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:59:00.010168-04	2026-10-14 10:59:00.012773-04
1	1274	119778	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:53:00.011469-04	2026-10-14 10:53:00.013938-04
1	1267	111290	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:46:00.01006-04	2026-10-14 10:46:00.012513-04
1	1289	126936	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:08:00.011014-04	2026-10-14 11:08:00.013404-04
1	1268	111898	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:47:00.010534-04	2026-10-14 10:47:00.013487-04
1	1275	120257	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:54:00.01178-04	2026-10-14 10:54:00.014711-04
1	1269	112813	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:48:00.011863-04	2026-10-14 10:48:00.01445-04
1	1281	123101	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:00:00.010486-04	2026-10-14 11:00:00.013396-04
1	1276	120711	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:55:00.013463-04	2026-10-14 10:55:00.016098-04
1	1270	113511	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:49:00.010415-04	2026-10-14 10:49:00.013816-04
1	1286	125473	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:05:00.010465-04	2026-10-14 11:05:00.013032-04
1	1271	114044	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:50:00.010908-04	2026-10-14 10:50:00.013618-04
1	1277	121176	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:56:00.010809-04	2026-10-14 10:56:00.013542-04
1	1282	123569	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:01:00.010308-04	2026-10-14 11:01:00.013281-04
1	1302	133574	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:21:00.009098-04	2026-10-14 11:21:00.011364-04
1	1278	121660	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 10:57:00.010837-04	2026-10-14 10:57:00.013244-04
1	1295	129771	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:14:00.009736-04	2026-10-14 11:14:00.012181-04
1	1290	127405	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:09:00.01062-04	2026-10-14 11:09:00.013003-04
1	1283	124027	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:02:00.009368-04	2026-10-14 11:02:00.01312-04
1	1287	125978	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:06:00.009715-04	2026-10-14 11:06:00.012924-04
1	1293	128841	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:12:00.008934-04	2026-10-14 11:12:00.010742-04
1	1288	126462	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:07:00.009623-04	2026-10-14 11:07:00.011923-04
1	1291	127901	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:10:00.010293-04	2026-10-14 11:10:00.012871-04
1	1297	130740	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:16:00.009892-04	2026-10-14 11:16:00.012225-04
1	1294	129309	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:13:00.00939-04	2026-10-14 11:13:00.011729-04
1	1296	130262	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:15:00.010497-04	2026-10-14 11:15:00.012925-04
1	1300	132276	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:19:00.009037-04	2026-10-14 11:19:00.010732-04
1	1299	131811	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:18:00.011121-04	2026-10-14 11:18:00.013496-04
1	1301	132904	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:20:00.012302-04	2026-10-14 11:20:00.014667-04
1	1303	134265	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:22:00.010035-04	2026-10-14 11:22:00.012518-04
1	1304	134784	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:23:00.010412-04	2026-10-14 11:23:00.013098-04
1	1305	135263	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:24:00.009954-04	2026-10-14 11:24:00.012504-04
1	1306	135951	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:25:00.009264-04	2026-10-14 11:25:00.011868-04
1	1307	136458	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:26:00.010019-04	2026-10-14 11:26:00.012796-04
1	1329	148685	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:48:00.008604-04	2026-10-14 11:48:00.010728-04
1	1343	156766	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:02:00.010142-04	2026-10-14 12:02:00.012476-04
1	1308	136929	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:27:00.010374-04	2026-10-14 11:27:00.012668-04
1	1317	141399	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:36:00.009907-04	2026-10-14 11:36:00.012332-04
1	1324	144979	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:43:00.009682-04	2026-10-14 11:43:00.011628-04
1	1309	137383	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:28:00.01023-04	2026-10-14 11:28:00.012893-04
1	1337	153674	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:56:00.010534-04	2026-10-14 11:56:00.013112-04
1	1318	141864	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:37:00.010462-04	2026-10-14 11:37:00.012997-04
1	1310	137832	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:29:00.009974-04	2026-10-14 11:29:00.011798-04
1	1330	149380	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:49:00.009955-04	2026-10-14 11:49:00.01295-04
1	1311	138308	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:30:00.009996-04	2026-10-14 11:30:00.012412-04
1	1325	146101	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:44:00.011643-04	2026-10-14 11:44:00.015944-04
1	1319	142317	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:38:00.008593-04	2026-10-14 11:38:00.010447-04
1	1312	138782	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:31:00.010794-04	2026-10-14 11:31:00.013428-04
1	1334	152208	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:53:00.009239-04	2026-10-14 11:53:00.01105-04
1	1313	139441	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:32:00.009534-04	2026-10-14 11:32:00.011558-04
1	1320	142902	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:39:00.01079-04	2026-10-14 11:39:00.013455-04
1	1314	139947	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:33:00.010748-04	2026-10-14 11:33:00.013103-04
1	1326	146874	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:45:00.010525-04	2026-10-14 11:45:00.013148-04
1	1321	143365	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:40:00.010376-04	2026-10-14 11:40:00.012909-04
1	1315	140405	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:34:00.010773-04	2026-10-14 11:34:00.013619-04
1	1331	150328	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:50:00.011144-04	2026-10-14 11:50:00.013484-04
1	1316	140935	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:35:00.00995-04	2026-10-14 11:35:00.012245-04
1	1322	143828	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:41:00.010325-04	2026-10-14 11:41:00.012595-04
1	1327	147348	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:46:00.008713-04	2026-10-14 11:46:00.010623-04
1	1347	159709	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:06:00.010322-04	2026-10-14 12:06:00.012437-04
1	1323	144316	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:42:00.010123-04	2026-10-14 11:42:00.01186-04
1	1340	155220	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:59:00.010216-04	2026-10-14 11:59:00.012587-04
1	1335	152694	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:54:00.010565-04	2026-10-14 11:54:00.013083-04
1	1328	148090	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:47:00.010975-04	2026-10-14 11:47:00.013493-04
1	1332	151246	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:51:00.010759-04	2026-10-14 11:51:00.012916-04
1	1338	154132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:57:00.009829-04	2026-10-14 11:57:00.01246-04
1	1333	151741	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:52:00.009393-04	2026-10-14 11:52:00.011335-04
1	1336	153185	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:55:00.010197-04	2026-10-14 11:55:00.012629-04
1	1342	156274	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:01:00.010092-04	2026-10-14 12:01:00.012004-04
1	1339	154609	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 11:58:00.007764-04	2026-10-14 11:58:00.00965-04
1	1341	155712	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:00:00.009986-04	2026-10-14 12:00:00.012329-04
1	1345	158315	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:04:00.009243-04	2026-10-14 12:04:00.01188-04
1	1344	157433	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:03:00.010752-04	2026-10-14 12:03:00.013102-04
1	1346	158867	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:05:00.010608-04	2026-10-14 12:05:00.013345-04
1	1348	160561	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:07:00.010798-04	2026-10-14 12:07:00.013276-04
1	1349	161460	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:08:00.011172-04	2026-10-14 12:08:00.014174-04
1	1350	161928	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:09:00.010304-04	2026-10-14 12:09:00.012721-04
1	1351	162392	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:10:00.010148-04	2026-10-14 12:10:00.012437-04
1	1352	162890	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:11:00.008116-04	2026-10-14 12:11:00.009833-04
1	1374	177344	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:33:00.010257-04	2026-10-14 12:33:00.012991-04
1	1388	186370	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:47:00.008558-04	2026-10-14 12:47:00.010487-04
1	1353	163364	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:12:00.009897-04	2026-10-14 12:12:00.011969-04
1	1362	169766	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:21:00.009985-04	2026-10-14 12:21:00.012746-04
1	1369	174272	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:28:00.010807-04	2026-10-14 12:28:00.014177-04
1	1354	164180	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:13:00.012515-04	2026-10-14 12:13:00.01497-04
1	1382	183123	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:41:00.008144-04	2026-10-14 12:41:00.010225-04
1	1363	170291	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:22:00.011111-04	2026-10-14 12:22:00.013812-04
1	1355	164965	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:14:00.009824-04	2026-10-14 12:14:00.013018-04
1	1375	178210	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:34:00.010573-04	2026-10-14 12:34:00.013316-04
1	1356	165768	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:15:00.010127-04	2026-10-14 12:15:00.013309-04
1	1370	175003	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:29:00.010289-04	2026-10-14 12:29:00.013472-04
1	1364	170764	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:23:00.008963-04	2026-10-14 12:23:00.011135-04
1	1357	166434	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:16:00.010942-04	2026-10-14 12:16:00.013679-04
1	1379	181389	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:38:00.008169-04	2026-10-14 12:38:00.009977-04
1	1358	166908	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:17:00.008647-04	2026-10-14 12:17:00.010577-04
1	1365	171473	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:24:00.00996-04	2026-10-14 12:24:00.012519-04
1	1359	167625	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:18:00.012206-04	2026-10-14 12:18:00.01539-04
1	1371	175807	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:30:00.009826-04	2026-10-14 12:30:00.012831-04
1	1366	172287	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:25:00.009381-04	2026-10-14 12:25:00.012001-04
1	1360	168127	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:19:00.010284-04	2026-10-14 12:19:00.013007-04
1	1376	179170	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:35:00.01073-04	2026-10-14 12:35:00.014146-04
1	1361	169002	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:20:00.011685-04	2026-10-14 12:20:00.015469-04
1	1367	172799	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:26:00.014198-04	2026-10-14 12:26:00.018187-04
1	1372	176409	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:31:00.009743-04	2026-10-14 12:31:00.012533-04
1	1392	188204	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:51:00.010548-04	2026-10-14 12:51:00.013423-04
1	1368	173275	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:27:00.010281-04	2026-10-14 12:27:00.013141-04
1	1385	184503	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:44:00.009023-04	2026-10-14 12:44:00.010938-04
1	1380	181882	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:39:00.009584-04	2026-10-14 12:39:00.012646-04
1	1373	176870	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:32:00.010572-04	2026-10-14 12:32:00.013306-04
1	1377	179920	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:36:00.010289-04	2026-10-14 12:36:00.01314-04
1	1383	183571	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:42:00.013736-04	2026-10-14 12:42:00.016646-04
1	1378	180698	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:37:00.011238-04	2026-10-14 12:37:00.014142-04
1	1381	182567	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:40:00.010375-04	2026-10-14 12:40:00.013466-04
1	1387	185810	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:46:00.010234-04	2026-10-14 12:46:00.013208-04
1	1384	184008	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:43:00.00997-04	2026-10-14 12:43:00.012406-04
1	1386	184943	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:45:00.010978-04	2026-10-14 12:45:00.013416-04
1	1390	187253	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:49:00.01065-04	2026-10-14 12:49:00.013022-04
1	1389	186809	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:48:00.008387-04	2026-10-14 12:48:00.010748-04
1	1391	187726	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:50:00.011321-04	2026-10-14 12:50:00.013642-04
1	1393	188802	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:52:00.010112-04	2026-10-14 12:52:00.012215-04
1	1394	189734	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:53:00.012092-04	2026-10-14 12:53:00.014685-04
1	1395	190183	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:54:00.009549-04	2026-10-14 12:54:00.011876-04
1	1396	190654	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:55:00.010727-04	2026-10-14 12:55:00.01311-04
1	1397	191218	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:56:00.010544-04	2026-10-14 12:56:00.012883-04
1	1419	205541	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:18:00.010606-04	2026-10-14 13:18:00.01427-04
1	1433	214412	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:32:00.010044-04	2026-10-14 13:32:00.01241-04
1	1398	191660	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:57:00.010948-04	2026-10-14 12:57:00.01333-04
1	1407	198010	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:06:00.008969-04	2026-10-14 13:06:00.010738-04
1	1414	202569	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:13:00.008488-04	2026-10-14 13:13:00.010276-04
1	1399	192790	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:58:00.012948-04	2026-10-14 12:58:00.015374-04
1	1427	210098	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:26:00.010362-04	2026-10-14 13:26:00.012759-04
1	1408	198640	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:07:00.01061-04	2026-10-14 13:07:00.013069-04
1	1400	193395	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 12:59:00.009522-04	2026-10-14 12:59:00.011921-04
1	1420	206460	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:19:00.010903-04	2026-10-14 13:19:00.015237-04
1	1401	194378	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:00:00.01091-04	2026-10-14 13:00:00.013214-04
1	1415	203006	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:14:00.010824-04	2026-10-14 13:14:00.013462-04
1	1409	199092	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:08:00.010257-04	2026-10-14 13:08:00.012616-04
1	1402	194837	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:01:00.00983-04	2026-10-14 13:01:00.012118-04
1	1424	208640	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:23:00.009907-04	2026-10-14 13:23:00.012715-04
1	1403	195512	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:02:00.012898-04	2026-10-14 13:02:00.015619-04
1	1410	199690	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:09:00.007459-04	2026-10-14 13:09:00.009296-04
1	1404	196396	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:03:00.008885-04	2026-10-14 13:03:00.011201-04
1	1416	203425	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:15:00.010129-04	2026-10-14 13:15:00.012681-04
1	1411	200682	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:10:00.01055-04	2026-10-14 13:10:00.012764-04
1	1405	196975	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:04:00.009698-04	2026-10-14 13:04:00.01225-04
1	1421	207045	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:20:00.009917-04	2026-10-14 13:20:00.012668-04
1	1406	197410	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:05:00.011079-04	2026-10-14 13:05:00.013644-04
1	1412	201658	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:11:00.010516-04	2026-10-14 13:11:00.012847-04
1	1417	203880	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:16:00.009948-04	2026-10-14 13:16:00.013211-04
1	1437	216106	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:36:00.015321-04	2026-10-14 13:36:00.018279-04
1	1413	202130	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:12:00.010597-04	2026-10-14 13:12:00.013055-04
1	1430	212412	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:29:00.009341-04	2026-10-14 13:29:00.011284-04
1	1425	209103	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:24:00.009917-04	2026-10-14 13:24:00.01245-04
1	1418	204717	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:17:00.010685-04	2026-10-14 13:17:00.013496-04
1	1422	207615	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:21:00.010751-04	2026-10-14 13:21:00.013533-04
1	1428	210740	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:27:00.010721-04	2026-10-14 13:27:00.012838-04
1	1423	208149	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:22:00.008792-04	2026-10-14 13:22:00.012003-04
1	1426	209605	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:25:00.009898-04	2026-10-14 13:25:00.012315-04
1	1432	213927	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:31:00.009452-04	2026-10-14 13:31:00.011276-04
1	1429	211197	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:28:00.009774-04	2026-10-14 13:28:00.012321-04
1	1431	213020	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:30:00.016535-04	2026-10-14 13:30:00.019272-04
1	1435	215271	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:34:00.009929-04	2026-10-14 13:34:00.01257-04
1	1434	214827	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:33:00.01038-04	2026-10-14 13:33:00.013127-04
1	1436	215680	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:35:00.009392-04	2026-10-14 13:35:00.011834-04
1	1438	216654	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:37:00.010165-04	2026-10-14 13:37:00.013014-04
1	1439	217144	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:38:00.010275-04	2026-10-14 13:38:00.013037-04
1	1440	217618	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:39:00.010448-04	2026-10-14 13:39:00.012951-04
1	1441	218107	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:40:00.009333-04	2026-10-14 13:40:00.011223-04
1	1442	218585	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:41:00.00918-04	2026-10-14 13:41:00.011626-04
1	1443	219001	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:42:00.009893-04	2026-10-14 13:42:00.012244-04
1	1452	222958	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:51:00.010595-04	2026-10-14 13:51:00.013036-04
1	1459	226420	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:58:00.009957-04	2026-10-14 13:58:00.013395-04
1	1444	219440	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:43:00.010177-04	2026-10-14 13:43:00.012604-04
1	1453	223414	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:52:00.010212-04	2026-10-14 13:52:00.012722-04
1	1445	219847	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:44:00.01031-04	2026-10-14 13:44:00.012753-04
1	1446	220279	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:45:00.010153-04	2026-10-14 13:45:00.01259-04
1	1460	226847	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:59:00.010516-04	2026-10-14 13:59:00.013949-04
1	1454	224103	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:53:00.010378-04	2026-10-14 13:53:00.013168-04
1	1447	220715	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:46:00.009704-04	2026-10-14 13:46:00.012148-04
1	1448	221152	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:47:00.00979-04	2026-10-14 13:47:00.012265-04
1	1455	224675	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:54:00.011559-04	2026-10-14 13:54:00.015164-04
1	1449	221614	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:48:00.009962-04	2026-10-14 13:48:00.012402-04
1	1461	227402	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 14:00:00.007955-04	2026-10-14 14:00:00.010076-04
1	1456	225120	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:55:00.01023-04	2026-10-14 13:55:00.013349-04
1	1450	222048	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:49:00.010052-04	2026-10-14 13:49:00.01251-04
1	1451	222468	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:50:00.010096-04	2026-10-14 13:50:00.012533-04
1	1457	225552	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:56:00.009999-04	2026-10-14 13:56:00.013065-04
1	1462	227841	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 14:01:00.01071-04	2026-10-14 14:01:00.013297-04
1	1458	225986	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 13:57:00.010718-04	2026-10-14 13:57:00.01395-04
1	1463	228288	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 14:02:00.008789-04	2026-10-14 14:02:00.010511-04
1	1486	41834	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:36:00.009994-04	2026-10-14 17:36:00.011163-04
1	1489	44336	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:39:00.009059-04	2026-10-14 17:39:00.010643-04
1	1464	21411	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:14:00.014144-04	2026-10-14 17:14:00.015634-04
1	1472	30828	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:22:00.007844-04	2026-10-14 17:22:00.008987-04
1	1478	35852	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:28:00.011279-04	2026-10-14 17:28:00.012817-04
1	1465	22867	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:15:00.009614-04	2026-10-14 17:15:00.011009-04
1	1483	39337	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:33:00.080739-04	2026-10-14 17:33:00.081978-04
1	1473	31966	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:23:00.009565-04	2026-10-14 17:23:00.010695-04
1	1466	24325	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:16:00.009372-04	2026-10-14 17:16:00.010554-04
1	1467	25656	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:17:00.010554-04	2026-10-14 17:17:00.012298-04
1	1479	36426	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:29:00.008611-04	2026-10-14 17:29:00.010171-04
1	1474	32987	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:24:00.00785-04	2026-10-14 17:24:00.008957-04
1	1468	26689	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:18:00.00709-04	2026-10-14 17:18:00.008376-04
1	1493	47867	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:43:00.00885-04	2026-10-14 17:43:00.010384-04
1	1487	42504	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:37:00.008431-04	2026-10-14 17:37:00.009577-04
1	1469	27898	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:19:00.015819-04	2026-10-14 17:19:00.019926-04
1	1475	33712	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:25:00.008085-04	2026-10-14 17:25:00.009342-04
1	1484	40272	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:34:00.058365-04	2026-10-14 17:34:00.059501-04
1	1470	28927	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:20:00.060388-04	2026-10-14 17:20:00.061987-04
1	1480	37051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:30:00.008269-04	2026-10-14 17:30:00.009551-04
1	1476	34396	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:26:00.065872-04	2026-10-14 17:26:00.067467-04
1	1471	29885	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:21:00.008667-04	2026-10-14 17:21:00.009851-04
1	1477	35131	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:27:00.011957-04	2026-10-14 17:27:00.013581-04
1	1481	38099	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:31:00.061473-04	2026-10-14 17:31:00.062706-04
1	1497	51236	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:47:00.010978-04	2026-10-14 17:47:00.012138-04
1	1485	40992	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:35:00.008079-04	2026-10-14 17:35:00.00958-04
1	1482	38724	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:32:00.009725-04	2026-10-14 17:32:00.010977-04
1	1490	45301	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:40:00.008711-04	2026-10-14 17:40:00.01034-04
1	1488	43401	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:38:00.007605-04	2026-10-14 17:38:00.009548-04
1	1492	47132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:42:00.010455-04	2026-10-14 17:42:00.012226-04
1	1498	51906	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:48:00.008768-04	2026-10-14 17:48:00.010293-04
1	1491	45916	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:41:00.007212-04	2026-10-14 17:41:00.008401-04
1	1495	49560	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:45:00.008392-04	2026-10-14 17:45:00.009561-04
1	1494	48489	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:44:00.009608-04	2026-10-14 17:44:00.011229-04
1	1496	50288	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 17:46:00.009653-04	2026-10-14 17:46:00.010796-04
1	1502	90074	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:27:00.00839-04	2026-10-14 18:27:00.009532-04
1	1499	87098	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:24:00.072154-04	2026-10-14 18:24:00.073473-04
1	1500	87948	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:25:00.007936-04	2026-10-14 18:25:00.009534-04
1	1503	91366	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:28:00.008508-04	2026-10-14 18:28:00.009741-04
1	1501	89009	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:26:00.008759-04	2026-10-14 18:26:00.009966-04
1	1504	92494	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:29:00.009465-04	2026-10-14 18:29:00.010705-04
1	1505	93277	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:30:00.008927-04	2026-10-14 18:30:00.010172-04
1	1506	94240	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:31:00.009235-04	2026-10-14 18:31:00.010441-04
1	1507	95279	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:32:00.009006-04	2026-10-14 18:32:00.010485-04
1	1508	95932	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-14 18:33:00.010312-04	2026-10-14 18:33:00.011521-04
\.


--
-- TOC entry 3816 (class 0 OID 66744)
-- Dependencies: 227
-- Data for Name: cat_datos_maestros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_datos_maestros (id, str_tipo, str_nombre, str_descripcion, bol_activo, created_at, updated_at) FROM stdin;
1	CANAL	Wasapi	Canal de recepción Wasapi	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
2	CANAL	Tickets	Canal de recepción Tickets	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
3	CANAL	Presencial	Canal de recepción Presencial	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
4	CANAL	Telefónico	Canal de recepción Telefónico	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
5	CANAL	Correo electrónico	Canal de recepción Correo electrónico	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
6	CANAL	Telegram	Canal de recepción Telegram	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
7	CANAL	Instagram	Canal de recepción Instagram	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
14	PRIORIDAD	Baja	Nivel de prioridad Baja	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
15	PRIORIDAD	Media	Nivel de prioridad Media	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
16	PRIORIDAD	Alta	Nivel de prioridad Alta	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
24	TIPO_TICKET	Interno	Tickets internos que generan los usuarios sobre la cotidianidad de la empresa	t	2026-10-10 15:09:41.228195-04	2026-10-10 15:09:41.228195-04
25	TIPO_TICKET	Externo	Tickets que tienen que ver con la App de Mercosur	t	2026-10-10 15:10:21.94035-04	2026-10-10 15:10:21.94035-04
26	CATEGORIA_INTERNA	LA Sistemas	Soporte e incidencias relacionadas con LA Sistemas.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
27	CATEGORIA_INTERNA	AgileCheck	Incidencias o consultas sobre la plataforma AgileCheck.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
28	CATEGORIA_INTERNA	Impresora	Problemas de impresión, atascos, tóner o configuración de impresoras de oficina.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
29	CATEGORIA_INTERNA	Escaner	Fallos operativos o configuración de dispositivos escáner.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
30	CATEGORIA_INTERNA	Internet	Problemas de conectividad a la red o caída del servicio de internet.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
31	CATEGORIA_INTERNA	Correo	Incidencias con el servicio de correo electrónico o bandejas.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
32	CATEGORIA_INTERNA	Carpetas Compartidas	Permisos de acceso o problemas con las carpetas compartidas en red.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
33	CATEGORIA_INTERNA	Claves de usuario	Restablecimiento, desbloqueo o gestión de contraseñas de usuario.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
34	CATEGORIA_INTERNA	Huella Control de Acceso	Problemas con el registro de huellas o accesos biométricos de oficina.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
35	CATEGORIA_INTERNA	Equipo de Escritorio	Soporte físico o de software para PCs de escritorio de los empleados.	t	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
8	CATEGORIA_EXTERNA	Firma Electrónica	Categoría Firma Electrónica	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
10	CATEGORIA_EXTERNA	Mercado de Valores	Categoría Mercado de Valores	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
12	CATEGORIA_EXTERNA	Caja Venezolana de Valores	Categoría Caja Venezolana de Valores	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
20	ESTATUSTICKET	En Aprobación	Se requiere autorización administrativa o de supervisión antes de ejecutar la solución.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
36	CATEGORIA_INTERNA	Otros	Otras solicitudes o incidencias técnicas generales de oficina.	f	2026-10-10 15:52:47.247628-04	2026-10-10 15:52:47.247628-04
13	CATEGORIA_EXTERNA	Otros	Categoría Otros	f	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
37	ESTATUSTICKET	Vencido	El ticket se venció	t	2026-10-11 22:38:50.84172-04	2026-10-11 22:38:50.84172-04
21	ESTATUSTICKET	Resuelto	La solución fue aplicada y está a la espera de confirmación por parte del usuario o del periodo de gracia.	f	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
17	ESTATUSTICKET	En Proceso	El ticket fue asignado y se está trabajando en él.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
22	ESTATUSTICKET	Cerrado	El ticket fue solucionado.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
23	ESTATUSTICKET	Cancelado	El ticket fue ingresado por error o el usuario retiró la solicitud.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
9	CATEGORIA_EXTERNA	Web App	Categoría Web App	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
11	CATEGORIA_EXTERNA	Onboarding	Ficha KYC	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
18	ESTATUSTICKET	Pendiente de Usuario	El trabajo activo está pausado porque se requiere información, pruebas o confirmación del usuario.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
19	ESTATUSTICKET	En Espera Proveedor	El trabajo depende de el proveedor externo.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
\.


--
-- TOC entry 3818 (class 0 OID 66753)
-- Dependencies: 229
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
-- TOC entry 3820 (class 0 OID 66759)
-- Dependencies: 231
-- Data for Name: cat_opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_opciones (id, str_nombre, bol_eliminado, fecha_creacion, str_ruta_opcion, str_icono, int_orden) FROM stdin;
4	Dashboard	f	11:32:35.611285-04	/tickets/dashboard	FiPieChart	1
5	Casos Tickets	f	11:32:35.611285-04	/tickets/casos-tickets	FiFolder	3
6	Seguimiento	f	11:32:35.611285-04	/tickets/seguimiento	FiEye	4
7	Clientes	f	11:32:35.611285-04	/tickets/clientes	FiBriefcase	5
8	Reportes Desempeño	f	11:34:06.578952-04	/tickets/reportes-desempeño	FiFileText	6
1	Dashboard	f	11:15:58.109215-04	/admin/dashboard	FiPieChart	1
2	Sistemas	f	13:31:51.405615-04	/admin/sistemas	FiMonitor	2
3	Permisos	f	17:39:32.17236-04	/admin/permisos	FiShield	3
36	Dashboard	f	11:41:47.813769-04	/rrhh/dashboard	FiPieChart	1
39	Reportes	f	16:27:48.946195-04	/rrhh/reportes	FiFileText	4
44	Mi ficha	f	16:43:39.991845-04	/rrhh/miFicha	FiUserCheck	2
45	Empleados	f	16:44:36.492609-04	/rrhh/empleados	FiUsers	3
38	Dashboard	f	11:50:56.831542-04	/kcs/dashboard	FiPieChart	1
40	Dashboard	f	11:15:30.830653-04	/inventario/dashboard	FiCheckSquare	1
41	Dashboard	f	11:18:14.266279-04	/visitantes/dashboard	FiCheckSquare	1
42	Dashboard	f	13:13:24.615383-04	/facturacion/dashboard	FiCheckSquare	1
43	carga de clientes	f	13:21:40.217601-04	/facrturacion/clientes	FiBattery	2
46	Nuevo Ticket	f	09:07:57.721577-04	/tickets/nuevo-ticket	IoTicketOutline	2
\.


--
-- TOC entry 3821 (class 0 OID 66766)
-- Dependencies: 232
-- Data for Name: cat_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_roles (id, str_nombre, str_descripcion, created_at, updated_at) FROM stdin;
1	administrador	Administrador general de los sistemas	2026-09-09 11:28:55.692406-04	2026-09-09 11:28:55.692406-04
18	técnico 1	\N	2026-10-01 13:19:56.909464-04	2026-10-01 13:19:56.909464-04
19	usuario	\N	2026-10-01 13:22:25.912871-04	2026-10-01 13:22:25.912871-04
17	operador atc	\N	2026-10-01 10:28:35.429321-04	2026-10-09 21:10:26.056285-04
\.


--
-- TOC entry 3822 (class 0 OID 66771)
-- Dependencies: 233
-- Data for Name: cat_sistemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_sistemas (id, str_sistema, str_descripcion, bol_activo, created_at, updated_at, str_ruta_sistema, str_icono, str_color) FROM stdin;
29	Mi Expediente	Portal de ficha de empleados de Mercosur	t	2026-09-29 11:41:47.813769-04	2026-09-29 11:41:47.813769-04	/rrhh	FiBookOpen	#ee176d
2	Tickets	Sistema central de tickets de Mercosur	t	2026-09-25 11:27:26.784012-04	2026-10-08 08:17:33.123132-04	/tickets	HiTicket	#d68324
31	Base de Conocimiento	Base conocimiento bursátil y financiero de Mercosur	t	2026-09-29 11:50:56.831542-04	2026-10-08 08:17:55.546637-04	/kcs	PiBrainDuotone	#6ded35
33	Control de Visitantes	Control de visitantes	t	2026-10-01 11:18:14.266279-04	2026-10-08 08:18:23.518242-04	/visitantes	FaPeopleGroup	#e193c9
32	Inventario	pruebas	t	2026-10-01 11:15:30.830653-04	2026-10-08 08:19:21.666426-04	/inventario	ImCalculator	#ea35ed
34	Facturacion	sistema de facturas	t	2026-10-01 13:13:24.615383-04	2026-10-08 08:19:38.05733-04	/facturacion	LiaFileInvoiceDollarSolid	#edbc35
1	Administración General	Administra todos los sistemas, opciones roles y usuarios de Mercosur	t	2026-09-09 11:32:38.520464-04	2026-10-08 08:39:30.636033-04	/admin	VscServerProcess	#2f6fed
\.


--
-- TOC entry 3823 (class 0 OID 66779)
-- Dependencies: 234
-- Data for Name: tbl_auth_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_auth_tokens (id, user_id, token, created_at, expires_at, used, str_device_id, str_device_name) FROM stdin;
441	57	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTcsInVzZXJuYW1lIjoiY2Fjb3N0YSIsImlhdCI6MTc5MjAwMDM3NSwiZXhwIjoxNzkyMDAzOTc1fQ.8SVF7yBK4LKiKXVMpLJhham-3i6ztj-4b08kOoZEF2Q	2026-10-14 13:50:15.664115-04	2026-10-14 14:52:55.048329-04	f	37063edc-3af5-46ea-99ed-a302c032a71a	Chrome en Windows PC
439	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJtbWlsbGFuIiwiaWF0IjoxNzkxOTk5NjMwLCJleHAiOjE3OTIwMDMyMzB9.p-LpUJashoxmrv7eXoBxQu2da6-ELSCOClN60JSuIrM	2026-10-14 13:39:30.036866-04	2026-10-14 14:40:30.088229-04	f	4ac0dd12-546c-4409-b290-389d23b22a72	Chrome en Windows PC
443	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc5MjAxNjcyMCwiZXhwIjoxNzkyMDIwMzIwfQ.4qBXjoY66UarWSO4uhGejZjZel23Qn4gNFRpbukoXPU	2026-10-14 18:24:26.993332-04	2026-10-14 19:25:20.106539-04	f	3fe998c4-a4ea-4823-a31f-fe0c6c8bdbc8	Chrome en Linux PC
444	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkyMDE3MTA5LCJleHAiOjE3OTIwMjA3MDl9.G9-t686XYoUOGtH2adFO4H0s4dZlVGy68RnXOlrlVUU	2026-10-14 17:15:13.663942-04	2026-10-14 19:31:49.188926-04	f	0cbcc181-9f48-4e84-8d5b-2614def63ed1	Firefox en Linux PC
\.


--
-- TOC entry 3827 (class 0 OID 66789)
-- Dependencies: 238
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
-- TOC entry 3829 (class 0 OID 66796)
-- Dependencies: 240
-- Data for Name: tbl_roles_sistemas_opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_roles_sistemas_opciones (id, rol_sistema_id, opcion_id) FROM stdin;
1	1	1
2	1	2
3	1	3
38	31	38
43	41	40
44	42	41
45	43	42
47	43	43
48	44	42
49	44	43
54	29	36
55	29	39
56	29	44
57	29	45
58	45	44
63	2	4
64	2	5
65	2	6
66	2	7
67	2	8
68	2	46
69	40	5
70	40	46
\.


--
-- TOC entry 3832 (class 0 OID 66801)
-- Dependencies: 243
-- Data for Name: tbl_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios (id, departamento_id, str_cedula, str_nombre, str_apellido, str_email, str_password, bol_activo, created_at, updated_at, dmt_fecha_nacimiento, str_direccion, str_usuario, str_telefono, str_contacto_emergencia, fec_ultimo_acceso) FROM stdin;
58	3	18935045	Felneyry Coromoto	Barreto Bastidas	fbarrteto@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	fbarrteto	\N	\N	\N
78	8	32740636	Dayana Isabel	Ibañez Carracedo	dibañez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:37:49.925881-04	\N	\N	dibañez	\N	\N	\N
81	5	29637599	Dayerlin Joeli	Manrique Arraiz	dmanrique@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:38:04.117313-04	\N	\N	dmanrique	\N	\N	\N
59	3	13894108	Mario Fernando	Bedoya Ringuinson	mbedoya@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:39:42.294717-04	\N	\N	mbedoya	\N	\N	\N
60	4	26078018	Genesis Vanessa	Bencomo Briceño	gbencomo@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:39:59.287755-04	\N	\N	gbencomo	\N	\N	\N
61	5	13409801	Helianta Del Valle	Blanco Di Cristofaro	hblanco@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:40:16.704809-04	\N	\N	hblanco	\N	\N	\N
62	5	29571871	Alber David	Campos Curvelo	acampos@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:40:29.984515-04	\N	\N	acampos	\N	\N	\N
63	6	20674807	Luis Enrique	Castillo Marquez	lcastillo@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:40:48.016757-04	\N	\N	lcastillo	\N	\N	\N
65	5	31758735	Moises Oreste	Chacon Sojo	mchacon@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:41:15.840718-04	\N	\N	mchacon	\N	\N	\N
67	6	29596432	Daniel Alejandro	De luca Davila	hde@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:41:50.794967-04	\N	\N	hde	\N	\N	\N
68	2	30180999	Mariangel Fara	Delgado Salazar	mdelgado@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:42:04.049673-04	\N	\N	mdelgado	\N	\N	\N
69	6	27653272	Georgia Nazareth	Dominguez Hernandez	gdominguez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:42:20.690565-04	\N	\N	gdominguez	\N	\N	\N
70	7	21070944	Elvis Alexis	Duran Kroger	eduran@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:42:34.193966-04	\N	\N	eduran	\N	\N	\N
71	5	32784457	Andrea Valentina	Fernandez Palomo	afernandez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:42:56.155216-04	\N	\N	afernandez	\N	\N	\N
89	7	29518389	Andrea Darisbel	Nuñez Marquez	anuñez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:43:37.666961-04	\N	\N	anuñez	\N	\N	\N
72	5	31269090	Yetsimar Nazareth	Ferrer Ramirez	yferrer@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:43:50.827516-04	\N	\N	yferrer	\N	\N	\N
73	3	82223552	Catherine Angelica	Galvez Jimenez	cgalvez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:44:05.02792-04	\N	\N	cgalvez	\N	\N	\N
74	5	32227026	Elelany Camila	Gil Fernandez	egil@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:44:18.708268-04	\N	\N	egil	\N	\N	\N
75	8	32896936	Brenda Noemi	Gonzalez Hurtado	bgonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:44:34.172761-04	\N	\N	bgonzalez	\N	\N	\N
76	7	15482814	Enyi Mileidy	Gonzalez Rodriguez	egonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:44:48.453166-04	\N	\N	egonzalez	\N	\N	\N
77	2	17962449	Adys Maria	Gonzalez Velasquez	agonzalez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:45:00.829862-04	\N	\N	agonzalez	\N	\N	\N
79	6	27796460	Carlos Enrique	Level Duran	clevel@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:45:36.372544-04	\N	\N	clevel	\N	\N	\N
80	5	27661857	Zulmar Sarai	Linares Huise	zlinares@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:45:54.421852-04	\N	\N	zlinares	\N	\N	\N
82	6	30330499	Angel Daniel	Marchan Granda	amarchan@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:46:25.190987-04	\N	\N	amarchan	\N	\N	\N
83	8	15327214	Yuhaney Del Carmen	Marin Santana	hmarin@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:46:41.799327-04	\N	\N	hmarin	\N	\N	\N
84	7	31082497	Deikerlyn Paola	Mendez Guevara	dmendez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:47:00.479624-04	\N	\N	dmendez	\N	\N	\N
90	8	31539979	Mitsel Paola	Palencia Perez	mpalencia@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:47:34.639418-04	\N	\N	mpalencia	\N	\N	\N
85	3	24896125	Cindy Kisbel	Millan Canache	cmillan@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:48:09.063461-04	\N	\N	cmillan	\N	\N	\N
86	4	27451524	Neileska Maile	Mora Valera	nmora@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:48:20.583297-04	\N	\N	nmora	\N	\N	\N
87	9	23681821	Krisbell Andreina	Mujica Sandia	kmujica@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:48:36.408476-04	\N	\N	kmujica	\N	\N	\N
88	5	28441002	Vanessa Chinquinquira	Niño Ortega	vniño@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:48:51.576678-04	\N	\N	vniño	\N	\N	\N
91	8	13124921	Jackelin Coromoto	Palma Serrano	jpalma@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:49:12.000716-04	\N	\N	jpalma	\N	\N	\N
92	8	16575563	Rosalia	Roa Marquez	rroa@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:49:23.064406-04	\N	\N	rroa	\N	\N	\N
93	10	17286981	Maria Emperatriz	Salazar Di Cristofaro	hsalazar@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:49:38.041131-04	\N	\N	hsalazar	\N	\N	\N
94	1	17369732	Ivan Enrique	Tarazona Caceres	itarazona@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:49:50.657557-04	\N	\N	itarazona	\N	\N	\N
66	7	16086597	Sindy Karina	Cordero Herrera	scordero@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	f	2026-10-01 16:41:00.998101-04	2026-10-01 18:41:29.329298-04	\N	\N	scordero	\N	\N	\N
95	6	25327464	Samuel Josue	Tapias Ramirez	stapias@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:02.176906-04	\N	\N	stapias	\N	\N	\N
96	8	6249886	Jose Vicente	Toro Dias	jtoro@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:13.553797-04	\N	\N	jtoro	\N	\N	\N
57	1	30646620	Cesar Augusto	Acosta Guerrero	cacosta@mercosur.com.ve	$2a$10$yp8FL2bMk5t9oGqTh6ZjD.BGgy.vzgUy0ZBlTqbzzGGnKDHtnu8G2	t	2026-10-01 16:41:00.998101-04	2026-10-14 13:34:33.807087-04	\N	\N	cacosta	\N	\N	2026-10-14 13:50:15.667223
97	5	32695846	Maria Jose	Urbina Patiño	murbina@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:26.650035-04	\N	\N	murbina	\N	\N	\N
98	9	22504244	Cynthia Deysi	Valdospin Yontomo	cvaldospin@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:40.857542-04	\N	\N	cvaldospin	\N	\N	\N
99	7	27793131	Gabriela Alexandra	Valera Gamboa	gvalera@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:56.289728-04	\N	\N	gvalera	\N	\N	\N
100	9	32227070	Willianyelis Sarait	Vasquez Villamizar	wvasquez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:51:10.842593-04	\N	\N	wvasquez	\N	\N	\N
101	3	21436685	Zaidi Raida	Zambrano Aranguren	zzambrano@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:51:27.482944-04	\N	\N	zzambrano	\N	\N	\N
102	5	32061634	Cladimar Oriana	Zambrano Baez	czambrano@mercosur.com.ve	$2a$10$sQ5c5XbrSp9hNeHoIXORzu0A1harKHXU6OsNYyHEJ9x7XkXNaZpH.	t	2026-10-01 16:41:00.998101-04	2026-10-11 16:00:09.841711-04	\N	\N	czambrano	\N	\N	2026-10-11 16:00:31.476333
64	5	32560280	Yarbelis Carolina	Cervantes Herrera	ycervantes@mercosur.com.ve	$2a$10$J7CUsv2bsMGkjSrM3hS/puqHuIv/D7UJ1UeCENPvOMFfBctHZgdXm	t	2026-10-01 16:41:00.998101-04	2026-10-09 21:11:34.545712-04	\N	\N	ycervantes	\N	\N	2026-10-14 09:04:52.102633
2	1	27474427	Yineska	Jaramillo	yjaramillo@mercosur.com.ve	$2a$10$/OxSASWaPZv6sRZCBxG3Yee0bvIn9pGMnGMcsX3ffVmtL1i4USOu.	t	2026-10-01 11:51:44.544172-04	2026-10-10 21:15:44.108154-04	\N	\N	yjaramillo	\N	\N	2026-10-14 13:32:56.077838
3	1	28099437	Miguel	Millan	mmillan@mercosur.com.ve	$2a$10$4q8sCyu39ac7DotW79lnxOTqci5VfOjxdg77eMgZB9Wwl6744wV1S	t	2026-10-01 13:14:55.835451-04	2026-10-14 13:33:59.501217-04	\N	\N	mmillan	\N	\N	2026-10-14 13:39:30.039973
4	1	16379712	Neel Ezequiel	Barazarte Aché	nbarazarte@mercosur.com.ve	$2a$10$XmwnY2gfUArfm7Gtl2B5R.Dxl9JNK2SECdsZaconwOTK6x7Da5ayK	t	2026-10-01 14:51:25.418478-04	2026-10-09 21:12:50.402422-04	\N	\N	nbarazarte	\N	\N	2026-10-14 17:15:13.666566
1	1	00000000	Admin	Mercosur	sistemasmcdb@mercosur.com.ve	$2a$10$sQJ1WZfXydLA91xjFb59AeyIMxmQ7xa66uPnYq8FtBjQIFUM3zbZK	t	2026-09-10 13:13:24.007018-04	2026-10-01 11:49:40.344834-04	\N	\N	admin	\N	\N	2026-10-14 18:24:26.995652
\.


--
-- TOC entry 3833 (class 0 OID 66809)
-- Dependencies: 244
-- Data for Name: tbl_usuarios_opciones_excepciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_opciones_excepciones (id, usuario_id, opcion_id, bol_permitido, created_at, update_at) FROM stdin;
\.


--
-- TOC entry 3835 (class 0 OID 66816)
-- Dependencies: 246
-- Data for Name: tbl_usuarios_roles_sistemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_roles_sistemas (id, usuario_id, rol_sistema_id, bol_activo, created_at, updated_at) FROM stdin;
35	1	29	t	2026-09-29 00:00:00-04	2026-09-29 00:00:00-04
50	3	44	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
51	3	45	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
53	4	1	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
54	4	2	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
56	4	31	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
57	4	41	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
58	4	42	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
59	4	43	t	2026-10-01 00:00:00-04	2026-10-01 00:00:00-04
60	4	45	t	2026-10-07 00:00:00-04	2026-10-07 00:00:00-04
2	1	2	t	2026-09-25 00:00:00-04	2026-10-08 00:00:00-04
37	1	31	t	2026-09-29 00:00:00-04	2026-10-08 00:00:00-04
43	1	42	t	2026-10-01 00:00:00-04	2026-10-08 00:00:00-04
42	1	41	t	2026-10-01 00:00:00-04	2026-10-08 00:00:00-04
48	1	43	t	2026-10-01 00:00:00-04	2026-10-08 00:00:00-04
1	1	1	t	2026-09-23 16:23:47.947669-04	2026-10-08 00:00:00-04
67	64	40	t	2026-10-09 00:00:00-04	2026-10-09 00:00:00-04
68	2	2	t	2026-10-10 00:00:00-04	2026-10-10 00:00:00-04
69	102	40	t	2026-10-11 00:00:00-04	2026-10-11 00:00:00-04
70	3	2	t	2026-10-14 00:00:00-04	2026-10-14 00:00:00-04
71	57	2	t	2026-10-14 00:00:00-04	2026-10-14 00:00:00-04
\.


--
-- TOC entry 3839 (class 0 OID 66879)
-- Dependencies: 260
-- Data for Name: tbl_amonestaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_amonestaciones (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3841 (class 0 OID 66887)
-- Dependencies: 262
-- Data for Name: tbl_carga_familiar; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_carga_familiar (id, usuario_id, parentesco_id, nombre_completo, fecha_nacimiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3843 (class 0 OID 66893)
-- Dependencies: 264
-- Data for Name: tbl_expediente; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_expediente (id, str_num_expediente, usuario_id, dmt_fecha_exp, bol_cv, bol_foto, bol_referencias, bol_cert_est, bol_cert_cap, bol_compr_dom, bol_acdo_conf, bol_cap_gen, bol_cap_area, otros_cursos, cap_cumpl, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3845 (class 0 OID 66899)
-- Dependencies: 266
-- Data for Name: tbl_permisos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_permisos (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3847 (class 0 OID 66907)
-- Dependencies: 268
-- Data for Name: tbl_reposos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_reposos (id, usuario_id, motivo_id, str_motivo_descripcion, tim_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3849 (class 0 OID 66915)
-- Dependencies: 270
-- Data for Name: tbl_vacaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_vacaciones (id, usuario_id, int_total_dias, dmt_fecha_desde, dmt_fecha_hasta, int_dias_disfrute, int_dias_pendiente, bol_vencidas, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3851 (class 0 OID 66921)
-- Dependencies: 272
-- Data for Name: sla_configuracion; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.sla_configuracion (id, categoria_id, prioridad_id, tiempo_maximo, activo) FROM stdin;
2	9	16	4	t
3	9	15	12	t
4	9	14	24	t
5	12	16	2	t
6	12	15	8	t
7	12	14	24	t
8	8	16	4	t
9	8	15	12	t
10	8	14	24	t
11	10	16	2	t
12	10	15	8	t
13	10	14	24	t
14	11	16	6	t
15	11	15	16	t
16	11	14	24	t
17	30	16	1	t
18	30	15	4	t
19	30	14	12	t
20	26	16	4	t
21	26	15	12	t
22	26	14	24	t
23	33	16	2	t
24	33	15	8	t
25	33	14	24	t
26	31	16	4	t
27	31	15	12	t
28	31	14	24	t
29	28	16	8	t
30	28	15	16	t
31	28	14	24	t
32	27	16	4	t
33	27	15	12	t
34	27	14	24	t
35	35	16	4	t
36	35	15	16	t
37	35	14	24	t
38	32	16	6	t
39	32	15	16	t
40	32	14	24	t
41	29	16	8	t
42	29	15	16	t
43	29	14	24	t
44	34	16	4	t
45	34	15	16	t
46	34	14	24	t
\.


--
-- TOC entry 3838 (class 0 OID 66824)
-- Dependencies: 249
-- Data for Name: tbl_alertas; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_alertas (id, caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido, fecha_generacion, fecha_lectura) FROM stdin;
1	4	4	ASIGNACION	Se te ha asignado el nuevo ticket: [TCK2026-10-000004] Pruebas	f	2026-10-14 18:31:13.580854-04	\N
\.


--
-- TOC entry 3854 (class 0 OID 66927)
-- Dependencies: 275
-- Data for Name: tbl_clientes; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_clientes (id, str_cedula, str_nombre, str_apellido, str_telefono, str_email, str_direccion, dtm_fecha_nacimiento, created_at, updated_at, condicion_cliente_id) FROM stdin;
1	20299553	ildemar	poveda	04242708087	ildemar@gmail.com	\N	\N	2026-10-13 16:13:00.059312-04	2026-10-13 16:13:00.059312-04	\N
\.


--
-- TOC entry 3856 (class 0 OID 66935)
-- Dependencies: 277
-- Data for Name: tbl_secuencias_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_secuencias_tickets (int_anio, int_mes, int_ultimo_secuencial) FROM stdin;
2026	10	5
\.


--
-- TOC entry 3857 (class 0 OID 66939)
-- Dependencies: 278
-- Data for Name: tbl_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets (id, str_ticket, cliente_id, creador_agente_id, cierre_agente_id, departamento_id, categoria_id, prioridad_id, estatus_id, canal_id, str_asunto, str_descripcion, int_sla, dmt_fecha_cierre, created_at, updated_at, str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id, tipo_ticket_id, dmt_fecha_vencimiento_sla, bool_cumplio_sla, int_minutos_pausa, dmt_fecha_inicio_pausa) FROM stdin;
1	TCK2026-10-000001	\N	1	\N	1	26	15	17	\N	Pruebas	<p>No abren los modulos de LA</p><table><colgroup><col><col><col></colgroup><tr><td colspan="1" rowspan="1"><p>q</p></td><td colspan="1" rowspan="1"><p>w</p></td><td colspan="1" rowspan="1"><p>e</p></td></tr><tr><td colspan="1" rowspan="1"><p>a</p></td><td colspan="1" rowspan="1"><p>b</p></td><td colspan="1" rowspan="1"><p>c</p></td></tr></table><img src="data:image/png;base64,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iK+//hqhoaHKonXSaDSYOXMmNmzYgOTkZEyePBl79uzBRx99BG9vb4tys2bNwubNm+Ho6IjIyEjMmDEDTk5O2L17N8LCwizWaw+2/qat+0BERER0LzQmk+nuawaIiIiI6IETPGMnAKB1ylpotVr71MARERER0f3DAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCqh0WgABjgiIiIi9WGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIiFdFoNNCYTCZBOaM+BEGA2WyGIAjVPhUVFQAAs9lcYxn5PGtl5NPE9Smn17S8teni3wBq3D6z2SxNV04jIiKihhEEAQ4ODtBoNNBqtdBoNAAg/S2frtVqodVW1jfJpyvnycsr1yH+LZZTThf/Vq63pvny6cr/tVbGHoJn7AQAeF1cV7nehgY4IiIiImpcygDHJlQiIiIilWGAIyIiIlIJsUmWAY6IiIhIZRjgiIiIiFSGAY6IiIhIZRjgiIiIiFSGAY6IiIhIRTQaDQMcERERkdowwBERERGpDAMcERERkUpwHDgiIiIilWKAIyIiIlIZBjgiIiIilWGAIyIiIlIRDiNCREREpEIMcEREREQqwadQiYiIiBqgoqJCOem+0ZhMJkE5kYiIiP78srOzkZOTg8LCQpSVlSlnUx10Oh30ej28vLzg5eWlnG1XwTN2AgB8Ln8NjUbDAEdERPQwys7Oxrlz5+Dt7Q1PT0+paY5s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" alt="image.png" data-name="image.png" data-url="data:image/png;base64,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iK+//hqhoaHKonXSaDSYOXMmNmzYgOTkZEyePBl79uzBRx99BG9vb4tys2bNwubNm+Ho6IjIyEjMmDEDTk5O2L17N8LCwizWaw+2/qat+0BERER0LzQmk+nuawaIiIiI6IETPGMnAKB1ylpotVr71MARERER0f3DAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCqh0WgABjgiIiIi9WGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIiFdFoNNCYTCZBOaM+BEGA2WyGIAjVPhUVFQAAs9lcYxn5PGtl5NPE9Smn17S8teni3wBq3D6z2SxNV04jIiKihhEEAQ4ODtBoNNBqtdBoNAAg/S2frtVqodVW1jfJpyvnycsr1yH+LZZTThf/Vq63pvny6cr/tVbGHoJn7AQAeF1cV7nehgY4IiIiImpcygDHJlQiIiIilWGAIyIiIlIJsUmWAY6IiIhIZRjgiIiIiFSGAY6IiIhIZRjgiIiIiFSGAY6IiIhIRTQaDQMcERERkdowwBERERGpDAMcERERkUpwHDgiIiIilWKAIyIiIlIZBjgiIiIilWGAIyIiIlIRDiNCREREpEIMcEREREQqwadQiYiIiBqgoqJCOem+0ZhMJkE5kYiIiP78srOzkZOTg8LCQpSVlSlnUx10Oh30ej28vLzg5eWlnG1XwTN2AgB8Ln8NjUbDAEdERPQwys7Oxrlz5+Dt7Q1PT0+paY5s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"><p>￼</p>	12	\N	2026-10-14 18:26:40.676824-04	2026-10-14 18:26:40.676824-04	/var/www/uploads/TCK2026-10-000001-1.png	\N	\N	\N	24	2026-10-15 06:26:40.676824-04	\N	0.00	\N
2	TCK2026-10-000002	\N	1	\N	1	28	15	17	\N	Problemas con la Impresora	<p>No Puedo Imprimir</p><table><colgroup><col><col><col></colgroup><tr><td colspan="1" rowspan="1"><p>Nombre</p></td><td colspan="1" rowspan="1"><p>Apellido</p></td><td colspan="1" rowspan="1"><p>Telefono</p></td></tr><tr><td colspan="1" rowspan="1"><p>Neel</p></td><td colspan="1" rowspan="1"><p>Barazarte</p></td><td colspan="1" rowspan="1"><p>04142101096</p></td></tr><tr><td colspan="1" rowspan="1"><p>Ildemar</p></td><td colspan="1" rowspan="1"><p>Poveda</p></td><td colspan="1" rowspan="1"><p>04242708087</p></td></tr></table><img src="data:image/png;base64,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iK+//hqhoaHKonXSaDSYOXMmNmzYgOTkZEyePBl79uzBRx99BG9vb4tys2bNwubNm+Ho6IjIyEjMmDEDTk5O2L17N8LCwizWaw+2/qat+0BERER0LzQmk+nuawaIiIiI6IETPGMnAKB1ylpotVr71MARERER0f3DAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCqh0WgABjgiIiIi9WGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIiFdFoNNCYTCZBOaM+BEGA2WyGIAjVPhUVFQAAs9lcYxn5PGtl5NPE9Smn17S8teni3wBq3D6z2SxNV04jIiKihhEEAQ4ODtBoNNBqtdBoNAAg/S2frtVqodVW1jfJpyvnycsr1yH+LZZTThf/Vq63pvny6cr/tVbGHoJn7AQAeF1cV7nehgY4IiIiImpcygDHJlQiIiIilWGAIyIiIlIJsUmWAY6IiIhIZRjgiIiIiFSGAY6IiIhIZRjgiIiIiFSGAY6IiIhIRTQaDQMcERERkdowwBERERGpDAMcERERkUpwHDgiIiIilWKAIyIiIlIZBjgiIiIilWGAIyIiIlIRDiNCREREpEIMcEREREQqwadQiYiIiBqgoqJCOem+0ZhMJkE5kYiIiP78srOzkZOTg8LCQpSVlSlnUx10Oh30ej28vLzg5eWlnG1XwTN2AgB8Ln8NjUbDAEdERPQwys7Oxrlz5+Dt7Q1PT0+paY5s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" alt="image.png" data-name="image.png" data-url="data:image/png;base64,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iK+//hqhoaHKonXSaDSYOXMmNmzYgOTkZEyePBl79uzBRx99BG9vb4tys2bNwubNm+Ho6IjIyEjMmDEDTk5O2L17N8LCwizWaw+2/qat+0BERER0LzQmk+nuawaIiIiI6IETPGMnAKB1ylpotVr71MARERER0f3DAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCrDAEdERESkMgxwRERERCqh0WgABjgiIiIi9WGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIilWGAIyIiIlIZBjgiIiIiFdFoNNCYTCZBOaM+BEGA2WyGIAjVPhUVFQAAs9lcYxn5PGtl5NPE9Smn17S8teni3wBq3D6z2SxNV04jIiKihhEEAQ4ODtBoNNBqtdBoNAAg/S2frtVqodVW1jfJpyvnycsr1yH+LZZTThf/Vq63pvny6cr/tVbGHoJn7AQAeF1cV7nehgY4IiIiImpcygDHJlQiIiIilWGAIyIiIlIJsUmWAY6IiIhIZRjgiIiIiFSGAY6IiIhIZRjgiIiIiFSGAY6IiIhIRTQaDQMcERERkdowwBERERGpDAMcERERkUpwHDgiIiIilWKAIyIiIlIZBjgiIiIilWGAIyIiIlIRDiNCREREpEIMcEREREQqwadQiYiIiBqgoqJCOem+0ZhMJkE5kYiIiP78srOzkZOTg8LCQpSVlSlnUx10Oh30ej28vLzg5eWlnG1XwTN2AgB8Ln8NjUbDAEdERPQwys7Oxrlz5+Dt7Q1PT0+paY5s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"><p>￼</p>	16	\N	2026-10-14 18:29:33.485663-04	2026-10-14 18:29:33.485663-04	/var/www/uploads/TCK2026-10-000002-1.png	\N	\N	\N	24	2026-10-15 10:29:33.485663-04	\N	0.00	\N
3	TCK2026-10-000003	\N	1	\N	1	29	16	17	\N	test	<p>hola</p>	8	\N	2026-10-14 18:30:08.404755-04	2026-10-14 18:30:08.404755-04	\N	\N	\N	\N	24	2026-10-15 02:30:08.404755-04	\N	0.00	\N
4	TCK2026-10-000004	1	1	\N	1	9	16	17	2	Pruebas	<p>hola</p>	4	\N	2026-10-14 18:31:13.580854-04	2026-10-14 18:31:13.580854-04	\N	\N	\N	4	25	2026-10-14 22:31:13.580854-04	\N	0.00	\N
5	TCK2026-10-000005	\N	1	\N	1	29	16	17	\N	otro Test	<p>hey</p>	8	\N	2026-10-14 18:31:46.309309-04	2026-10-14 18:31:46.309309-04	\N	\N	\N	\N	24	2026-10-15 02:31:46.309309-04	\N	0.00	\N
\.


--
-- TOC entry 3858 (class 0 OID 66949)
-- Dependencies: 279
-- Data for Name: tbl_tickets_bitacora; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets_bitacora (id, ticket_id, usuario_id, str_comentario, created_at) FROM stdin;
\.


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 222
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.jobid_seq', 1, true);


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 224
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.runid_seq', 1508, true);


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 226
-- Name: tbl_kcs_articulos_id_seq; Type: SEQUENCE SET; Schema: kcs; Owner: postgres
--

SELECT pg_catalog.setval('kcs.tbl_kcs_articulos_id_seq', 6, true);


--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 228
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_datos_maestros_id_seq', 38, true);


--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 230
-- Name: cat_departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_departamentos_id_seq', 10, true);


--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_auth_tokens_id_seq', 443, true);


--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 236
-- Name: tbl_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_opciones_id_seq', 46, true);


--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_id_seq', 19, true);


--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 239
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_opciones_id_seq', 45, true);


--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_sistemas_opciones_id_seq', 70, true);


--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 242
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_sistemas_id_seq', 34, true);


--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 245
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_opciones_excepciones_id_seq', 1, false);


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 247
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_roles_sistemas_id_seq', 71, true);


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 248
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 104, true);


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_amonestaciones_id_seq', 1, false);


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_carga_familiar_id_seq', 1, false);


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_expediente_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_expediente_id_seq', 1, false);


--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_permisos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_permisos_id_seq', 1, false);


--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 269
-- Name: tbl_reposos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_reposos_id_seq', 1, false);


--
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 271
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_vacaciones_id_seq', 1, false);


--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 273
-- Name: sla_configuracion_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.sla_configuracion_id_seq', 46, true);


--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 274
-- Name: tbl_alertas_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_alertas_id_seq', 1, true);


--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 276
-- Name: tbl_clientes_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_clientes_id_seq', 1, true);


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 280
-- Name: tbl_tickets_bitacora_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_bitacora_id_seq', 1, false);


--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 281
-- Name: tbl_tickets_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_id_seq', 5, true);


--
-- TOC entry 3563 (class 2606 OID 66985)
-- Name: cat_datos_maestros cat_datos_maestros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros
    ADD CONSTRAINT cat_datos_maestros_pkey PRIMARY KEY (id);


--
-- TOC entry 3565 (class 2606 OID 66987)
-- Name: cat_departamentos cat_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 3567 (class 2606 OID 66989)
-- Name: cat_departamentos cat_departamentos_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3583 (class 2606 OID 66991)
-- Name: tbl_roles_sistemas_opciones pk_roles_sistemas_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT pk_roles_sistemas_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3577 (class 2606 OID 66993)
-- Name: tbl_auth_tokens tbl_auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT tbl_auth_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3569 (class 2606 OID 66995)
-- Name: cat_opciones tbl_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones
    ADD CONSTRAINT tbl_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3571 (class 2606 OID 66997)
-- Name: cat_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3581 (class 2606 OID 66999)
-- Name: tbl_roles_sistemas tbl_roles_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT tbl_roles_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3573 (class 2606 OID 67001)
-- Name: cat_roles tbl_roles_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3575 (class 2606 OID 67003)
-- Name: cat_sistemas tbl_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas
    ADD CONSTRAINT tbl_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 67005)
-- Name: tbl_usuarios_opciones_excepciones tbl_usuarios_opciones_excepciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT tbl_usuarios_opciones_excepciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 67007)
-- Name: tbl_usuarios tbl_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT tbl_usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 67009)
-- Name: tbl_usuarios_opciones_excepciones uk_usuario_opcion_excepcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT uk_usuario_opcion_excepcion UNIQUE (usuario_id, opcion_id);


--
-- TOC entry 3579 (class 2606 OID 67011)
-- Name: tbl_auth_tokens unique_user_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT unique_user_device UNIQUE (user_id, str_device_id);


--
-- TOC entry 3597 (class 2606 OID 67013)
-- Name: tbl_usuarios_roles_sistemas unique_usuario_rol_sistema; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT unique_usuario_rol_sistema UNIQUE (usuario_id, rol_sistema_id);


--
-- TOC entry 3587 (class 2606 OID 67015)
-- Name: tbl_usuarios usuarios_str_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3589 (class 2606 OID 67017)
-- Name: tbl_usuarios usuarios_str_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_email_key UNIQUE (str_email);


--
-- TOC entry 3601 (class 2606 OID 67019)
-- Name: tbl_amonestaciones tbl_amonestaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT tbl_amonestaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 67021)
-- Name: tbl_carga_familiar tbl_carga_familiar_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT tbl_carga_familiar_pkey PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 67023)
-- Name: tbl_expediente tbl_expediente_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT tbl_expediente_pkey PRIMARY KEY (id);


--
-- TOC entry 3607 (class 2606 OID 67025)
-- Name: tbl_permisos tbl_permisos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT tbl_permisos_pkey PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 67027)
-- Name: tbl_reposos tbl_reposos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT tbl_reposos_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 67029)
-- Name: tbl_vacaciones tbl_vacaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT tbl_vacaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 67031)
-- Name: sla_configuracion sla_configuracion_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT sla_configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 67033)
-- Name: tbl_alertas tbl_alertas_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_alertas
    ADD CONSTRAINT tbl_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 67035)
-- Name: tbl_clientes tbl_clientes_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 67037)
-- Name: tbl_clientes tbl_clientes_str_cedula_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3620 (class 2606 OID 67039)
-- Name: tbl_clientes tbl_clientes_str_email_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_email_key UNIQUE (str_email);


--
-- TOC entry 3622 (class 2606 OID 67041)
-- Name: tbl_secuencias_tickets tbl_secuencias_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_secuencias_tickets
    ADD CONSTRAINT tbl_secuencias_tickets_pkey PRIMARY KEY (int_anio, int_mes);


--
-- TOC entry 3636 (class 2606 OID 67043)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_pkey PRIMARY KEY (id);


--
-- TOC entry 3631 (class 2606 OID 67045)
-- Name: tbl_tickets tbl_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 2606 OID 67047)
-- Name: tbl_tickets tbl_tickets_str_ticket_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_str_ticket_key UNIQUE (str_ticket);


--
-- TOC entry 3590 (class 1259 OID 67048)
-- Name: idx_excepciones_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_opcion ON public.tbl_usuarios_opciones_excepciones USING btree (opcion_id);


--
-- TOC entry 3591 (class 1259 OID 67049)
-- Name: idx_excepciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_usuario ON public.tbl_usuarios_opciones_excepciones USING btree (usuario_id);


--
-- TOC entry 3612 (class 1259 OID 67050)
-- Name: idx_sla_config_cat_prio; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_sla_config_cat_prio ON tickets.sla_configuracion USING btree (categoria_id, prioridad_id);


--
-- TOC entry 3634 (class 1259 OID 67051)
-- Name: idx_tickets_bitacora_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_bitacora_ticket_id ON tickets.tbl_tickets_bitacora USING btree (ticket_id);


--
-- TOC entry 3623 (class 1259 OID 67052)
-- Name: idx_tickets_canal_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_canal_id ON tickets.tbl_tickets USING btree (canal_id);


--
-- TOC entry 3624 (class 1259 OID 67053)
-- Name: idx_tickets_created_at; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_created_at ON tickets.tbl_tickets USING btree (created_at DESC);


--
-- TOC entry 3625 (class 1259 OID 67054)
-- Name: idx_tickets_departamento_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_departamento_id ON tickets.tbl_tickets USING btree (departamento_id);


--
-- TOC entry 3626 (class 1259 OID 67055)
-- Name: idx_tickets_estatus_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_estatus_id ON tickets.tbl_tickets USING btree (estatus_id);


--
-- TOC entry 3627 (class 1259 OID 67056)
-- Name: idx_tickets_prioridad_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_prioridad_id ON tickets.tbl_tickets USING btree (prioridad_id);


--
-- TOC entry 3628 (class 1259 OID 67057)
-- Name: idx_tickets_tipo_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_tipo_ticket_id ON tickets.tbl_tickets USING btree (tipo_ticket_id);


--
-- TOC entry 3629 (class 1259 OID 67058)
-- Name: idx_tickets_vencimiento_sla; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_vencimiento_sla ON tickets.tbl_tickets USING btree (dmt_fecha_vencimiento_sla);


--
-- TOC entry 3809 (class 2618 OID 66858)
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
-- TOC entry 3643 (class 2606 OID 67060)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_opcion FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3644 (class 2606 OID 67065)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3640 (class 2606 OID 67070)
-- Name: tbl_roles_sistemas_opciones fk_opciones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_opciones FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) NOT VALID;


--
-- TOC entry 3638 (class 2606 OID 67075)
-- Name: tbl_roles_sistemas fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.cat_roles(id) NOT VALID;


--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 3638
-- Name: CONSTRAINT fk_rol ON tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_rol ON public.tbl_roles_sistemas IS 'Relaciona la columna rol_id con el id de la tabla cat_roles';


--
-- TOC entry 3641 (class 2606 OID 67080)
-- Name: tbl_roles_sistemas_opciones fk_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3639 (class 2606 OID 67085)
-- Name: tbl_roles_sistemas fk_sistema; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_sistema FOREIGN KEY (sistema_id) REFERENCES public.cat_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3637 (class 2606 OID 67090)
-- Name: tbl_auth_tokens fk_tokens_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT fk_tokens_usuario FOREIGN KEY (user_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 3637
-- Name: CONSTRAINT fk_tokens_usuario ON tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_tokens_usuario ON public.tbl_auth_tokens IS 'Relaciona esta tabla con la tabla usuarios';


--
-- TOC entry 3645 (class 2606 OID 67095)
-- Name: tbl_usuarios_roles_sistemas fk_urs_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3646 (class 2606 OID 67100)
-- Name: tbl_usuarios_roles_sistemas fk_urs_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3642 (class 2606 OID 67105)
-- Name: tbl_usuarios fk_usuario_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT fk_usuario_departamento FOREIGN KEY (departamento_id) REFERENCES public.cat_departamentos(id) NOT VALID;


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 3642
-- Name: CONSTRAINT fk_usuario_departamento ON tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_usuario_departamento ON public.tbl_usuarios IS 'Relacion entre la tabla Usuario con la tabla Departamento';


--
-- TOC entry 3648 (class 2606 OID 67110)
-- Name: tbl_carga_familiar fk_CargaFamiliar; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT "fk_CargaFamiliar" FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 3648
-- Name: CONSTRAINT "fk_CargaFamiliar" ON tbl_carga_familiar; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT "fk_CargaFamiliar" ON rrhh.tbl_carga_familiar IS 'Relación entre la tabla Usuarios con la tabla Carga_Familiar';


--
-- TOC entry 3647 (class 2606 OID 67115)
-- Name: tbl_amonestaciones fk_amonestaciones; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT fk_amonestaciones FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 3647
-- Name: CONSTRAINT fk_amonestaciones ON tbl_amonestaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_amonestaciones ON rrhh.tbl_amonestaciones IS 'Relación entre la tabla Usuario con la tabla Amonestaciones.';


--
-- TOC entry 3649 (class 2606 OID 67120)
-- Name: tbl_expediente fk_expediente_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT fk_expediente_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 3649
-- Name: CONSTRAINT fk_expediente_usuario ON tbl_expediente; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_expediente_usuario ON rrhh.tbl_expediente IS 'Relación entre la tabla Usuario con la tabla Expediente.';


--
-- TOC entry 3650 (class 2606 OID 67125)
-- Name: tbl_permisos fk_permisos_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT fk_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 3650
-- Name: CONSTRAINT fk_permisos_usuario ON tbl_permisos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_permisos_usuario ON rrhh.tbl_permisos IS 'Relación entre la tabla Usuarios con la tabla Permisos.';


--
-- TOC entry 3651 (class 2606 OID 67130)
-- Name: tbl_reposos fk_reposo_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT fk_reposo_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 3651
-- Name: CONSTRAINT fk_reposo_usuario ON tbl_reposos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_reposo_usuario ON rrhh.tbl_reposos IS 'Relación entre la tabla Usuario con la tabla Reposos.';


--
-- TOC entry 3652 (class 2606 OID 67135)
-- Name: tbl_vacaciones fk_vacaciones_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT fk_vacaciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 3652
-- Name: CONSTRAINT fk_vacaciones_usuario ON tbl_vacaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_vacaciones_usuario ON rrhh.tbl_vacaciones IS 'Relación entre la tabla Usuario y la tabla Vacaciones.';


--
-- TOC entry 3653 (class 2606 OID 67140)
-- Name: sla_configuracion fk_sla_categoria; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_categoria FOREIGN KEY (categoria_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3654 (class 2606 OID 67145)
-- Name: sla_configuracion fk_sla_prioridad; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_prioridad FOREIGN KEY (prioridad_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3655 (class 2606 OID 67150)
-- Name: tbl_tickets fk_tickets_usuario_asignado; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT fk_tickets_usuario_asignado FOREIGN KEY (usuario_asignado_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3657 (class 2606 OID 67155)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_ticket_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES tickets.tbl_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 3658 (class 2606 OID 67160)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_usuario_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 3656 (class 2606 OID 67165)
-- Name: tbl_tickets tbl_tickets_tipo_ticket_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_tipo_ticket_id_fkey FOREIGN KEY (tipo_ticket_id) REFERENCES public.cat_datos_maestros(id);


-- Completed on 2026-10-14 18:33:47 -04

--
-- PostgreSQL database dump complete
--

\unrestrict emf8byh5MzDvVJlAdWfs0MKnNOaIIWTOev7iyuKHB8ze6G5EP5ESCQRfs8me0C2

