--
-- PostgreSQL database dump
--

\restrict EfkWpWi7HSGD6gCcL5GXsJ4XQXKd0SZHuJOoBNLoGTGwwmfZeIXQg5hdQQo62iQ

-- Dumped from database version 18.6 (Ubuntu 18.6-1.pgdg22.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg24.04+2)

-- Started on 2026-10-13 15:03:57 -04

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
-- TOC entry 2 (class 3079 OID 33883)
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- TOC entry 7 (class 2615 OID 33329)
-- Name: kcs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA kcs;


ALTER SCHEMA kcs OWNER TO postgres;

--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA kcs; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA kcs IS 'Esquema del sistema de la base de datos de conocimiento';


--
-- TOC entry 8 (class 2615 OID 33330)
-- Name: rrhh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA rrhh;


ALTER SCHEMA rrhh OWNER TO postgres;

--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA rrhh; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA rrhh IS 'Esquema que almacena las tablas del sistema de RRHH';


--
-- TOC entry 9 (class 2615 OID 33331)
-- Name: tickets; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tickets;


ALTER SCHEMA tickets OWNER TO postgres;

--
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 9
-- Name: SCHEMA tickets; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA tickets IS 'Esquema del Sistema de Tickets para ATC.';


--
-- TOC entry 284 (class 1255 OID 33332)
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
-- TOC entry 285 (class 1255 OID 33333)
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
-- TOC entry 286 (class 1255 OID 33334)
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
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 286
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
-- TOC entry 224 (class 1259 OID 33335)
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
-- TOC entry 225 (class 1259 OID 33336)
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
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE cat_datos_maestros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_datos_maestros IS 'Esta tabla es el catalogo general de la base de datos con las listas mas comunes';


--
-- TOC entry 226 (class 1259 OID 33351)
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
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_datos_maestros_id_seq OWNED BY public.cat_datos_maestros.id;


--
-- TOC entry 227 (class 1259 OID 33352)
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
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE cat_departamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_departamentos IS 'Esta tabla contiene el listado de los departamentos de Mercosur';


--
-- TOC entry 228 (class 1259 OID 33361)
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
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 228
-- Name: cat_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_departamentos_id_seq OWNED BY public.cat_departamentos.id;


--
-- TOC entry 229 (class 1259 OID 33362)
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
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE cat_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_opciones IS 'Esta tabla contiene las opciones de los sistemas';


--
-- TOC entry 230 (class 1259 OID 33373)
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
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE cat_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_roles IS 'Esta tabla contiene el listado de roles que puede tener un sistema (Un id de rol puede ser común para diferentes sistemas)';


--
-- TOC entry 231 (class 1259 OID 33382)
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
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE cat_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_sistemas IS 'Contiene los nombres de los Sistemas Internos.';


--
-- TOC entry 232 (class 1259 OID 33396)
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
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_auth_tokens IS 'Esta tabla contiene los tokens de sesión de los usuarios';


--
-- TOC entry 233 (class 1259 OID 33409)
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
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_auth_tokens_id_seq OWNED BY public.tbl_auth_tokens.id;


--
-- TOC entry 234 (class 1259 OID 33410)
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
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 234
-- Name: tbl_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_opciones_id_seq OWNED BY public.cat_opciones.id;


--
-- TOC entry 235 (class 1259 OID 33411)
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
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_id_seq OWNED BY public.cat_roles.id;


--
-- TOC entry 236 (class 1259 OID 33412)
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
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas IS 'Esta tabla contiene el catalogo de roles de los sistemas';


--
-- TOC entry 237 (class 1259 OID 33424)
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
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_opciones_id_seq OWNED BY public.tbl_roles_sistemas.id;


--
-- TOC entry 238 (class 1259 OID 33425)
-- Name: tbl_roles_sistemas_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles_sistemas_opciones (
    id integer NOT NULL,
    rol_sistema_id integer NOT NULL,
    opcion_id integer NOT NULL
);


ALTER TABLE public.tbl_roles_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE tbl_roles_sistemas_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas_opciones IS 'Esta tabla contiene las opciones que tiene un rol en un sistema';


--
-- TOC entry 239 (class 1259 OID 33431)
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
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 239
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_sistemas_opciones_id_seq OWNED BY public.tbl_roles_sistemas_opciones.id;


--
-- TOC entry 240 (class 1259 OID 33432)
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
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 240
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_sistemas_id_seq OWNED BY public.cat_sistemas.id;


--
-- TOC entry 241 (class 1259 OID 33433)
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
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios IS 'Esta tabla contiene el listado global de usuarios';


--
-- TOC entry 242 (class 1259 OID 33451)
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
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE tbl_usuarios_opciones_excepciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_opciones_excepciones IS 'Esta tabla es para indicar que opciones no tendrá permitido un usuario en un sistema independientemente de su rol';


--
-- TOC entry 243 (class 1259 OID 33463)
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
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq OWNED BY public.tbl_usuarios_opciones_excepciones.id;


--
-- TOC entry 244 (class 1259 OID 33464)
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
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE tbl_usuarios_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_roles_sistemas IS 'Esta tabla contiene el rol de un usuario en un sistema';


--
-- TOC entry 245 (class 1259 OID 33476)
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
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 245
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq OWNED BY public.tbl_usuarios_roles_sistemas.id;


--
-- TOC entry 246 (class 1259 OID 33477)
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
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 246
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.tbl_usuarios.id;


--
-- TOC entry 247 (class 1259 OID 33478)
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
-- TOC entry 248 (class 1259 OID 33492)
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
-- TOC entry 249 (class 1259 OID 33497)
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
-- TOC entry 250 (class 1259 OID 33502)
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
-- TOC entry 251 (class 1259 OID 33507)
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
-- TOC entry 252 (class 1259 OID 33512)
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
-- TOC entry 253 (class 1259 OID 33517)
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
-- TOC entry 254 (class 1259 OID 33521)
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
-- TOC entry 255 (class 1259 OID 33526)
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
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 255
-- Name: VIEW view_usuarios_opciones_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.view_usuarios_opciones_sistemas IS 'Muestra que opciones tienen los usuarios en un sistema';


--
-- TOC entry 256 (class 1259 OID 33531)
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
-- TOC entry 257 (class 1259 OID 33536)
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
-- TOC entry 258 (class 1259 OID 33541)
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
-- TOC entry 259 (class 1259 OID 33551)
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
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_amonestaciones_id_seq OWNED BY rrhh.tbl_amonestaciones.id;


--
-- TOC entry 260 (class 1259 OID 33552)
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
-- TOC entry 261 (class 1259 OID 33563)
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
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_carga_familiar_id_seq OWNED BY rrhh.tbl_carga_familiar.id;


--
-- TOC entry 262 (class 1259 OID 33564)
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
-- TOC entry 263 (class 1259 OID 33572)
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
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_expediente_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_expediente_id_seq OWNED BY rrhh.tbl_expediente.id;


--
-- TOC entry 264 (class 1259 OID 33573)
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
-- TOC entry 265 (class 1259 OID 33583)
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
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_permisos_id_seq OWNED BY rrhh.tbl_permisos.id;


--
-- TOC entry 266 (class 1259 OID 33584)
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
-- TOC entry 267 (class 1259 OID 33594)
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
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_reposos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_reposos_id_seq OWNED BY rrhh.tbl_reposos.id;


--
-- TOC entry 268 (class 1259 OID 33595)
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
-- TOC entry 269 (class 1259 OID 33603)
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
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 269
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_vacaciones_id_seq OWNED BY rrhh.tbl_vacaciones.id;


--
-- TOC entry 270 (class 1259 OID 33604)
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
-- TOC entry 271 (class 1259 OID 33613)
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
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 271
-- Name: sla_configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.sla_configuracion_id_seq OWNED BY tickets.sla_configuracion.id;


--
-- TOC entry 272 (class 1259 OID 33614)
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
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE tbl_clientes; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_clientes IS 'Tabla transaccional que guarda la información de los clientes y potenciales clientes.';


--
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 272
-- Name: COLUMN tbl_clientes.condicion_cliente_id; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_clientes.condicion_cliente_id IS 'Determina si es cliente o no de Mercosur. (Cliente / No Cliente)';


--
-- TOC entry 273 (class 1259 OID 33629)
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
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 273
-- Name: tbl_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_clientes_id_seq OWNED BY tickets.tbl_clientes.id;


--
-- TOC entry 274 (class 1259 OID 33630)
-- Name: tbl_secuencias_tickets; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_secuencias_tickets (
    int_anio integer NOT NULL,
    int_mes integer NOT NULL,
    int_ultimo_secuencial integer DEFAULT 0 NOT NULL
);


ALTER TABLE tickets.tbl_secuencias_tickets OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 33637)
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
    int_minutos_pausa integer DEFAULT 0
);


ALTER TABLE tickets.tbl_tickets OWNER TO postgres;

--
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 275
-- Name: TABLE tbl_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets IS 'Tabla transaccional principal que maneja los tickets del sistema.';


--
-- TOC entry 276 (class 1259 OID 33658)
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
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE tbl_tickets_bitacora; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets_bitacora IS 'Almacena el historial de respuestas, avances y notas de los agentes sobre los tickets.';


--
-- TOC entry 277 (class 1259 OID 33668)
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
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 277
-- Name: tbl_tickets_bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_bitacora_id_seq OWNED BY tickets.tbl_tickets_bitacora.id;


--
-- TOC entry 278 (class 1259 OID 33669)
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
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 278
-- Name: tbl_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_id_seq OWNED BY tickets.tbl_tickets.id;


--
-- TOC entry 283 (class 1259 OID 33940)
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
-- TOC entry 3893 (class 0 OID 0)
-- Dependencies: 283
-- Name: VIEW view_listar_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON VIEW tickets.view_listar_tickets IS 'Muestra los tickets del sistema';


--
-- TOC entry 3462 (class 2604 OID 33675)
-- Name: cat_datos_maestros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros ALTER COLUMN id SET DEFAULT nextval('public.cat_datos_maestros_id_seq'::regclass);


--
-- TOC entry 3466 (class 2604 OID 33676)
-- Name: cat_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos ALTER COLUMN id SET DEFAULT nextval('public.cat_departamentos_id_seq'::regclass);


--
-- TOC entry 3469 (class 2604 OID 33677)
-- Name: cat_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_opciones_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 33678)
-- Name: cat_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 33679)
-- Name: cat_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_sistemas_id_seq'::regclass);


--
-- TOC entry 3479 (class 2604 OID 33680)
-- Name: tbl_auth_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens ALTER COLUMN id SET DEFAULT nextval('public.tbl_auth_tokens_id_seq'::regclass);


--
-- TOC entry 3482 (class 2604 OID 33681)
-- Name: tbl_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_opciones_id_seq'::regclass);


--
-- TOC entry 3486 (class 2604 OID 33682)
-- Name: tbl_roles_sistemas_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_sistemas_opciones_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 33683)
-- Name: tbl_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 33684)
-- Name: tbl_usuarios_opciones_excepciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_opciones_excepciones_id_seq'::regclass);


--
-- TOC entry 3495 (class 2604 OID 33685)
-- Name: tbl_usuarios_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_roles_sistemas_id_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 33686)
-- Name: tbl_amonestaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_amonestaciones_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 33687)
-- Name: tbl_carga_familiar id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_carga_familiar_id_seq'::regclass);


--
-- TOC entry 3507 (class 2604 OID 33688)
-- Name: tbl_expediente id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_expediente_id_seq'::regclass);


--
-- TOC entry 3510 (class 2604 OID 33689)
-- Name: tbl_permisos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_permisos_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 33690)
-- Name: tbl_reposos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_reposos_id_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 33691)
-- Name: tbl_vacaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_vacaciones_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 33692)
-- Name: sla_configuracion id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion ALTER COLUMN id SET DEFAULT nextval('tickets.sla_configuracion_id_seq'::regclass);


--
-- TOC entry 3521 (class 2604 OID 33693)
-- Name: tbl_clientes id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_clientes_id_seq'::regclass);


--
-- TOC entry 3525 (class 2604 OID 33694)
-- Name: tbl_tickets id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_id_seq'::regclass);


--
-- TOC entry 3531 (class 2604 OID 33695)
-- Name: tbl_tickets_bitacora id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_bitacora_id_seq'::regclass);


--
-- TOC entry 3458 (class 0 OID 33886)
-- Dependencies: 280
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	* * * * *	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	localhost	5432	db_general_mercosur	postgres	t	actualizar-tickets-vencidos-job
\.


--
-- TOC entry 3460 (class 0 OID 33913)
-- Dependencies: 282
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
\.


--
-- TOC entry 3802 (class 0 OID 33336)
-- Dependencies: 225
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
18	ESTATUSTICKET	Pendiente de Usuario	El trabajo activo está pausado porque se requiere información, pruebas o confirmación del usuario.	f	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
21	ESTATUSTICKET	Resuelto	La solución fue aplicada y está a la espera de confirmación por parte del usuario o del periodo de gracia.	f	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
17	ESTATUSTICKET	En Proceso	El ticket fue asignado y se está trabajando en él.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
22	ESTATUSTICKET	Cerrado	El ticket fue solucionado.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
23	ESTATUSTICKET	Cancelado	El ticket fue ingresado por error o el usuario retiró la solicitud.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
19	ESTATUSTICKET	Pendiente de Terceros	El trabajo depende de el proveedor externo.	t	2026-10-09 21:01:40.476086-04	2026-10-09 21:01:40.476086-04
9	CATEGORIA_EXTERNA	Web App	Categoría Web App	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
11	CATEGORIA_EXTERNA	Onboarding	Ficha KYC	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
\.


--
-- TOC entry 3804 (class 0 OID 33352)
-- Dependencies: 227
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
-- TOC entry 3806 (class 0 OID 33362)
-- Dependencies: 229
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
-- TOC entry 3807 (class 0 OID 33373)
-- Dependencies: 230
-- Data for Name: cat_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_roles (id, str_nombre, str_descripcion, created_at, updated_at) FROM stdin;
1	administrador	Administrador general de los sistemas	2026-09-09 11:28:55.692406-04	2026-09-09 11:28:55.692406-04
18	técnico 1	\N	2026-10-01 13:19:56.909464-04	2026-10-01 13:19:56.909464-04
19	usuario	\N	2026-10-01 13:22:25.912871-04	2026-10-01 13:22:25.912871-04
17	operador atc	\N	2026-10-01 10:28:35.429321-04	2026-10-09 21:10:26.056285-04
\.


--
-- TOC entry 3808 (class 0 OID 33382)
-- Dependencies: 231
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
-- TOC entry 3809 (class 0 OID 33396)
-- Dependencies: 232
-- Data for Name: tbl_auth_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_auth_tokens (id, user_id, token, created_at, expires_at, used, str_device_id, str_device_name) FROM stdin;
410	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJuYmFyYXphcnRlIiwiaWF0IjoxNzkxOTE4MTMyLCJleHAiOjE3OTE5MjE3MzJ9.4D-SBwcTb31ssVM04Eqj27rnS5XHlejP-b7ZG1bnXtY	2026-10-13 14:59:03.098405-04	2026-10-13 16:02:12.410611-04	f	6dc81e9b-470f-4f82-8aa0-c3b203e8627e	Chrome en Linux PC
\.


--
-- TOC entry 3813 (class 0 OID 33412)
-- Dependencies: 236
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
-- TOC entry 3815 (class 0 OID 33425)
-- Dependencies: 238
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
-- TOC entry 3818 (class 0 OID 33433)
-- Dependencies: 241
-- Data for Name: tbl_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios (id, departamento_id, str_cedula, str_nombre, str_apellido, str_email, str_password, bol_activo, created_at, updated_at, dmt_fecha_nacimiento, str_direccion, str_usuario, str_telefono, str_contacto_emergencia, fec_ultimo_acceso) FROM stdin;
3	1	28099437	Miguel	Millan	mmillan@mercosur.com.ve	$2a$10$iXqiwUiySZ7RuxepUe8w7usu8g6aBanMda0JWO/7julEILXGyG1Ey	t	2026-10-01 13:14:55.835451-04	2026-10-01 13:14:55.835451-04	\N	\N	mmillan	\N	\N	\N
58	3	18935045	Felneyry Coromoto	Barreto Bastidas	fbarrteto@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 16:41:00.998101-04	\N	\N	fbarrteto	\N	\N	\N
78	8	32740636	Dayana Isabel	Ibañez Carracedo	dibañez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:37:49.925881-04	\N	\N	dibañez	\N	\N	\N
81	5	29637599	Dayerlin Joeli	Manrique Arraiz	dmanrique@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:38:04.117313-04	\N	\N	dmanrique	\N	\N	\N
57	1	30646620	Cesar Augusto	Acosta Guerrero	cacosta@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:38:28.852709-04	\N	\N	cacosta	\N	\N	\N
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
2	1	27474427	Yineska	Jaramillo	yjaramillo@mercosur.com.ve	$2a$10$/OxSASWaPZv6sRZCBxG3Yee0bvIn9pGMnGMcsX3ffVmtL1i4USOu.	t	2026-10-01 11:51:44.544172-04	2026-10-10 21:15:44.108154-04	\N	\N	yjaramillo	\N	\N	2026-10-10 21:17:26.028812
95	6	25327464	Samuel Josue	Tapias Ramirez	stapias@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:02.176906-04	\N	\N	stapias	\N	\N	\N
96	8	6249886	Jose Vicente	Toro Dias	jtoro@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:13.553797-04	\N	\N	jtoro	\N	\N	\N
97	5	32695846	Maria Jose	Urbina Patiño	murbina@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:26.650035-04	\N	\N	murbina	\N	\N	\N
98	9	22504244	Cynthia Deysi	Valdospin Yontomo	cvaldospin@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:40.857542-04	\N	\N	cvaldospin	\N	\N	\N
99	7	27793131	Gabriela Alexandra	Valera Gamboa	gvalera@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:50:56.289728-04	\N	\N	gvalera	\N	\N	\N
100	9	32227070	Willianyelis Sarait	Vasquez Villamizar	wvasquez@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:51:10.842593-04	\N	\N	wvasquez	\N	\N	\N
101	3	21436685	Zaidi Raida	Zambrano Aranguren	zzambrano@mercosur.com.ve	$2a$10$ksR7l7eI8403dxy/HxQ4MOq7w960LDJJajdFJR8pgaC5JxshI237C	t	2026-10-01 16:41:00.998101-04	2026-10-01 18:51:27.482944-04	\N	\N	zzambrano	\N	\N	\N
102	5	32061634	Cladimar Oriana	Zambrano Baez	czambrano@mercosur.com.ve	$2a$10$sQ5c5XbrSp9hNeHoIXORzu0A1harKHXU6OsNYyHEJ9x7XkXNaZpH.	t	2026-10-01 16:41:00.998101-04	2026-10-11 16:00:09.841711-04	\N	\N	czambrano	\N	\N	2026-10-11 16:00:31.476333
1	1	00000000	Admin	Mercosur	sistemasmcdb@mercosur.com.ve	$2a$10$sQJ1WZfXydLA91xjFb59AeyIMxmQ7xa66uPnYq8FtBjQIFUM3zbZK	t	2026-09-10 13:13:24.007018-04	2026-10-01 11:49:40.344834-04	\N	\N	admin	\N	\N	2026-10-13 10:14:08.937814
64	5	32560280	Yarbelis Carolina	Cervantes Herrera	ycervantes@mercosur.com.ve	$2a$10$J7CUsv2bsMGkjSrM3hS/puqHuIv/D7UJ1UeCENPvOMFfBctHZgdXm	t	2026-10-01 16:41:00.998101-04	2026-10-09 21:11:34.545712-04	\N	\N	ycervantes	\N	\N	2026-10-13 13:12:40.328404
4	1	16379712	Neel Ezequiel	Barazarte Aché	nbarazarte@mercosur.com.ve	$2a$10$XmwnY2gfUArfm7Gtl2B5R.Dxl9JNK2SECdsZaconwOTK6x7Da5ayK	t	2026-10-01 14:51:25.418478-04	2026-10-09 21:12:50.402422-04	\N	\N	nbarazarte	\N	\N	2026-10-13 14:59:03.138169
\.


--
-- TOC entry 3819 (class 0 OID 33451)
-- Dependencies: 242
-- Data for Name: tbl_usuarios_opciones_excepciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_opciones_excepciones (id, usuario_id, opcion_id, bol_permitido, created_at, update_at) FROM stdin;
\.


--
-- TOC entry 3821 (class 0 OID 33464)
-- Dependencies: 244
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
\.


--
-- TOC entry 3825 (class 0 OID 33541)
-- Dependencies: 258
-- Data for Name: tbl_amonestaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_amonestaciones (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3827 (class 0 OID 33552)
-- Dependencies: 260
-- Data for Name: tbl_carga_familiar; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_carga_familiar (id, usuario_id, parentesco_id, nombre_completo, fecha_nacimiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3829 (class 0 OID 33564)
-- Dependencies: 262
-- Data for Name: tbl_expediente; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_expediente (id, str_num_expediente, usuario_id, dmt_fecha_exp, bol_cv, bol_foto, bol_referencias, bol_cert_est, bol_cert_cap, bol_compr_dom, bol_acdo_conf, bol_cap_gen, bol_cap_area, otros_cursos, cap_cumpl, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3831 (class 0 OID 33573)
-- Dependencies: 264
-- Data for Name: tbl_permisos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_permisos (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3833 (class 0 OID 33584)
-- Dependencies: 266
-- Data for Name: tbl_reposos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_reposos (id, usuario_id, motivo_id, str_motivo_descripcion, tim_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3835 (class 0 OID 33595)
-- Dependencies: 268
-- Data for Name: tbl_vacaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_vacaciones (id, usuario_id, int_total_dias, dmt_fecha_desde, dmt_fecha_hasta, int_dias_disfrute, int_dias_pendiente, bol_vencidas, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3837 (class 0 OID 33604)
-- Dependencies: 270
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
-- TOC entry 3824 (class 0 OID 33478)
-- Dependencies: 247
-- Data for Name: tbl_alertas; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_alertas (id, caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido, fecha_generacion, fecha_lectura) FROM stdin;
\.


--
-- TOC entry 3839 (class 0 OID 33614)
-- Dependencies: 272
-- Data for Name: tbl_clientes; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_clientes (id, str_cedula, str_nombre, str_apellido, str_telefono, str_email, str_direccion, dtm_fecha_nacimiento, created_at, updated_at, condicion_cliente_id) FROM stdin;
2	20294775	pedro	perez	04148889977	pperez@inventado.com	\N	\N	2026-10-13 13:24:37.440081-04	2026-10-13 13:24:37.440081-04	\N
3	5143077	inventado	inventado	04127778899	otroinventado@noexiste.com	\N	\N	2026-10-13 13:31:15.701732-04	2026-10-13 13:31:15.701732-04	\N
1	14463425	liliana	torres	04123331100	ltorres@uc.edu.ve	\N	\N	2026-10-13 13:16:11.878173-04	2026-10-13 13:16:11.878173-04	\N
4	30646620	cesar	acosta	04125554433	cesaracosta@gmail.com	\N	\N	2026-10-13 14:09:28.197602-04	2026-10-13 14:09:28.197602-04	\N
5	16379712	neel	barazarte	04142101096	ezebarazarte@gmail.com	\N	\N	2026-10-13 14:57:35.055638-04	2026-10-13 14:57:35.055638-04	\N
\.


--
-- TOC entry 3841 (class 0 OID 33630)
-- Dependencies: 274
-- Data for Name: tbl_secuencias_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_secuencias_tickets (int_anio, int_mes, int_ultimo_secuencial) FROM stdin;
2026	10	6
\.


--
-- TOC entry 3842 (class 0 OID 33637)
-- Dependencies: 275
-- Data for Name: tbl_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets (id, str_ticket, cliente_id, creador_agente_id, cierre_agente_id, departamento_id, categoria_id, prioridad_id, estatus_id, canal_id, str_asunto, str_descripcion, int_sla, dmt_fecha_cierre, created_at, updated_at, str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id, tipo_ticket_id, dmt_fecha_vencimiento_sla, bool_cumplio_sla, int_minutos_pausa) FROM stdin;
1	TCK2026-10-000001	1	64	\N	1	8	16	17	1	Cambio de correo	La cliente V14463425, Liliana Torres, se comunicó vía WhatsApp para solicitar el cambio de su correo electrónico, ya que el correo actualmente registrado presenta inconvenientes al estar asociado al sistema de firma electrónica, por lo cual es necesario generar un nuevo certificado digital. El correo actual es  y el correo que se solicita agregar es .	4	\N	2026-10-13 13:16:11.878173-04	2026-10-13 13:16:11.878173-04	\N	\N	\N	57	25	2026-10-13 17:16:11.878173-04	\N	0
2	TCK2026-10-000002	2	64	\N	1	9	16	17	2	Doble registro	Cliente tiene doble registro en Admin, su cedula correcta con la que se registro en Legacy es V20294775 en Admin aparece V202947758 y V20294776 el registro con la cedula que termina en 6 se debe eliminar y el que termina en 58 se debe editar quitandole el numero 8 	4	\N	2026-10-13 13:24:37.440081-04	2026-10-13 13:24:37.440081-04	\N	\N	\N	4	25	2026-10-13 17:24:37.440081-04	\N	0
3	TCK2026-10-000003	3	64	\N	1	9	16	17	4	Problemas de la plataforma	Cliente escribió via wasapi ya que al momento de realizar el ultima paso de registro (La Selfie) la plataforma se queda guindada 	4	\N	2026-10-13 13:31:15.701732-04	2026-10-13 13:31:15.701732-04	\N	\N	\N	3	25	2026-10-13 17:31:15.701732-04	\N	0
4	TCK2026-10-000004	\N	64	\N	1	35	14	17	\N	el mouse no funciona	mouse no funciona	24	\N	2026-10-13 13:54:43.080599-04	2026-10-13 13:54:43.080599-04	\N	\N	\N	57	24	2026-10-14 13:54:43.080599-04	\N	0
6	TCK2026-10-000006	5	64	\N	1	9	16	17	2	problemas con el otp	**Ticket de Soporte: Problemas OTP**\r\n\r\n**Descripción del Problema:**\r\nEl usuario está experimentando dificultades para recibir confirmaciones de dos factores (OTP) a través de la aplicación de Mercosur Casa de Bolsa S.A. Esto está impactando en su capacidad para realizar transacciones seguras en el sistema, ya que la validación de OTP es un paso crítico en el proceso de autenticación.\r\n\r\n**Pruebas Realizadas:**\r\n1. **Verificación del OTP en Consola:** Se realizó una revisión en la consola de la aplicación para confirmar que no hubiera errores o alertas relacionados con el servicio OTP.\r\n2. **Prueba de Red de Dispositivo:** Se realizó una prueba de conexión a Internet para descartar problemas de conectividad como la causa principal del no recepción de OTP.\r\n3. **Consulta del Servicio OTP:** Se contactó al proveedor de servicios OTP para informar sobre el problema y solicitar asistencia.\r\n\r\n**Pasos para Resolución:**\r\n1. **Verificación de Configuración del Dispositivo:** Se recomendó al usuario revisar las configuraciones del dispositivo para asegurarse de que no haya restricciones en el sistema operativo o en la aplicación que puedan impedir la recepción de SMS.\r\n2. **Revisión de Servicios de SMS:** Se sugirió que el usuario revisara su cuenta de correo electrónico y otras alertas para confirmar que no haya sido bloqueado o marcado como spam por el servicio de SMS.\r\n3. **Contacto con Soporte Técnico:** Se instruyó al usuario que contactara al servicio de atención al cliente de Mercosur Casa de Bolsa S.A. para obtener asistencia adicional si la situación persiste.\r\n\r\n**Instrucciones para Validación del Usuario:**\r\nPor favor, revise la configuración de su dispositivo y su cuenta de correo electrónico para asegurarse de que no haya restricciones o bloqueos. Si aún no se resuelve el problema, por favor contacte al soporte técnico a través del número de servicio al cliente proporcionado en la aplicación y proporcione la referencia del ticket: [Insertar número del ticket aquí].	4	\N	2026-10-13 14:57:35.055638-04	2026-10-13 14:57:35.055638-04	\N	\N	\N	2	25	2026-10-13 18:57:35.055638-04	\N	0
5	TCK2026-10-000005	4	64	\N	1	9	16	17	2	Error con OTP	**Ticket de Soporte: Problemas OTP**\r\n\r\n**Descripción del Problema:**\r\nEl usuario está experimentando dificultades para recibir códigos OTP (One Time Password) a través de su dispositivo móvil, lo cual está limitando su capacidad para realizar transacciones seguras a través de la aplicación de Mercosur Casa de Bolsa S.A.\r\n\r\n**Pruebas Realizadas:**\r\n1. **Verificación de Configuración del Servicio:** Se comprobó que el usuario tiene correctamente configurado el servicio de OTP en su cuenta, incluyendo el número de teléfono verificado.\r\n2. **Verificación de la Aplicación:** Se revisó que la aplicación estuviera actualizada y no presentara errores visibles.\r\n3. **Pruebas de Red:** Se realizó un ping a los servidores de OTP para verificar la conexión y asegurar que no haya problemas de red.\r\n\r\n**Pasos a Realizar:**\r\n1. **Verificación del SMS:** Se solicitó al usuario intentar recibir un nuevo código OTP a través de SMS para descartar posibles fallas en la configuración del servicio.\r\n2. **Prueba de Recarga de Credenciales:** Se recomendaron al usuario proceder a la recarga de credenciales de seguridad en la aplicación, siguiendo el procedimiento detallado en el manual de usuario.\r\n3. **Verificación del Teléfono:** Se pidió al usuario verificar si el número de teléfono está activo y sin bloqueos.\r\n4. **Contacto con Soporte Técnico:** Si los pasos anteriores no resuelven el problema, se sugerirá que el usuario se ponga en contacto con el servicio de soporte técnico para una revisión más detallada y personalizada.\r\n\r\n**Instrucciones para la Validación:**\r\n1. **SMS:** Solicitar al usuario que intente recibir un nuevo código OTP a través de SMS y confirmar si el código se recibe correctamente.\r\n2. **Recarga de Credenciales:** Guíe al usuario por el procedimiento para recargar sus credenciales de seguridad y asegúrese de que el proceso se complete sin errores.\r\n3. **Comunicación con Soporte:** Proporcione al usuario los números de contacto de soporte técnico para que pueda ponerse en contacto en caso de que el problema persista.\r\n\r\n\r\n	4	\N	2026-10-13 14:59:45.665378-04	2026-10-13 14:59:45.665378-04	/var/www/uploads/TCK2026-10-000005-1.png	/var/www/uploads/TCK2026-10-000005-vid-1.webm	\N	2	25	2026-10-13 18:59:45.665378-04	\N	0
\.


--
-- TOC entry 3843 (class 0 OID 33658)
-- Dependencies: 276
-- Data for Name: tbl_tickets_bitacora; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets_bitacora (id, ticket_id, usuario_id, str_comentario, created_at) FROM stdin;
1	5	4	Trabajando en ello	2026-10-13 14:59:45.665378-04
\.


--
-- TOC entry 3894 (class 0 OID 0)
-- Dependencies: 279
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.jobid_seq', 1, true);


--
-- TOC entry 3895 (class 0 OID 0)
-- Dependencies: 281
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.runid_seq', 308, true);


--
-- TOC entry 3896 (class 0 OID 0)
-- Dependencies: 224
-- Name: tbl_kcs_articulos_id_seq; Type: SEQUENCE SET; Schema: kcs; Owner: postgres
--

SELECT pg_catalog.setval('kcs.tbl_kcs_articulos_id_seq', 6, true);


--
-- TOC entry 3897 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_datos_maestros_id_seq', 38, true);


--
-- TOC entry 3898 (class 0 OID 0)
-- Dependencies: 228
-- Name: cat_departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_departamentos_id_seq', 10, true);


--
-- TOC entry 3899 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_auth_tokens_id_seq', 410, true);


--
-- TOC entry 3900 (class 0 OID 0)
-- Dependencies: 234
-- Name: tbl_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_opciones_id_seq', 46, true);


--
-- TOC entry 3901 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_id_seq', 19, true);


--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_opciones_id_seq', 45, true);


--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 239
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_sistemas_opciones_id_seq', 70, true);


--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 240
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_sistemas_id_seq', 34, true);


--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_opciones_excepciones_id_seq', 1, false);


--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 245
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_roles_sistemas_id_seq', 69, true);


--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 246
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 104, true);


--
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_amonestaciones_id_seq', 1, false);


--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_carga_familiar_id_seq', 1, false);


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_expediente_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_expediente_id_seq', 1, false);


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_permisos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_permisos_id_seq', 1, false);


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_reposos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_reposos_id_seq', 1, false);


--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 269
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_vacaciones_id_seq', 1, false);


--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 271
-- Name: sla_configuracion_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.sla_configuracion_id_seq', 46, true);


--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 273
-- Name: tbl_clientes_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_clientes_id_seq', 5, true);


--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 277
-- Name: tbl_tickets_bitacora_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_bitacora_id_seq', 1, true);


--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 278
-- Name: tbl_tickets_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_id_seq', 6, true);


--
-- TOC entry 3541 (class 2606 OID 33697)
-- Name: cat_datos_maestros cat_datos_maestros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros
    ADD CONSTRAINT cat_datos_maestros_pkey PRIMARY KEY (id);


--
-- TOC entry 3543 (class 2606 OID 33699)
-- Name: cat_departamentos cat_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 3545 (class 2606 OID 33701)
-- Name: cat_departamentos cat_departamentos_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3561 (class 2606 OID 33703)
-- Name: tbl_roles_sistemas_opciones pk_roles_sistemas_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT pk_roles_sistemas_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3555 (class 2606 OID 33705)
-- Name: tbl_auth_tokens tbl_auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT tbl_auth_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3547 (class 2606 OID 33707)
-- Name: cat_opciones tbl_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones
    ADD CONSTRAINT tbl_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3549 (class 2606 OID 33709)
-- Name: cat_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3559 (class 2606 OID 33711)
-- Name: tbl_roles_sistemas tbl_roles_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT tbl_roles_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3551 (class 2606 OID 33713)
-- Name: cat_roles tbl_roles_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3553 (class 2606 OID 33715)
-- Name: cat_sistemas tbl_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas
    ADD CONSTRAINT tbl_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3571 (class 2606 OID 33717)
-- Name: tbl_usuarios_opciones_excepciones tbl_usuarios_opciones_excepciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT tbl_usuarios_opciones_excepciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3563 (class 2606 OID 33719)
-- Name: tbl_usuarios tbl_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT tbl_usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3573 (class 2606 OID 33721)
-- Name: tbl_usuarios_opciones_excepciones uk_usuario_opcion_excepcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT uk_usuario_opcion_excepcion UNIQUE (usuario_id, opcion_id);


--
-- TOC entry 3557 (class 2606 OID 33723)
-- Name: tbl_auth_tokens unique_user_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT unique_user_device UNIQUE (user_id, str_device_id);


--
-- TOC entry 3575 (class 2606 OID 33725)
-- Name: tbl_usuarios_roles_sistemas unique_usuario_rol_sistema; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT unique_usuario_rol_sistema UNIQUE (usuario_id, rol_sistema_id);


--
-- TOC entry 3565 (class 2606 OID 33727)
-- Name: tbl_usuarios usuarios_str_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3567 (class 2606 OID 33729)
-- Name: tbl_usuarios usuarios_str_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_email_key UNIQUE (str_email);


--
-- TOC entry 3579 (class 2606 OID 33731)
-- Name: tbl_amonestaciones tbl_amonestaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT tbl_amonestaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3581 (class 2606 OID 33733)
-- Name: tbl_carga_familiar tbl_carga_familiar_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT tbl_carga_familiar_pkey PRIMARY KEY (id);


--
-- TOC entry 3583 (class 2606 OID 33735)
-- Name: tbl_expediente tbl_expediente_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT tbl_expediente_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 33737)
-- Name: tbl_permisos tbl_permisos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT tbl_permisos_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 33739)
-- Name: tbl_reposos tbl_reposos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT tbl_reposos_pkey PRIMARY KEY (id);


--
-- TOC entry 3589 (class 2606 OID 33741)
-- Name: tbl_vacaciones tbl_vacaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT tbl_vacaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 33743)
-- Name: sla_configuracion sla_configuracion_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT sla_configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 3577 (class 2606 OID 33745)
-- Name: tbl_alertas tbl_alertas_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_alertas
    ADD CONSTRAINT tbl_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 33747)
-- Name: tbl_clientes tbl_clientes_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 33749)
-- Name: tbl_clientes tbl_clientes_str_cedula_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3598 (class 2606 OID 33751)
-- Name: tbl_clientes tbl_clientes_str_email_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_email_key UNIQUE (str_email);


--
-- TOC entry 3600 (class 2606 OID 33753)
-- Name: tbl_secuencias_tickets tbl_secuencias_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_secuencias_tickets
    ADD CONSTRAINT tbl_secuencias_tickets_pkey PRIMARY KEY (int_anio, int_mes);


--
-- TOC entry 3614 (class 2606 OID 33755)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_pkey PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 33757)
-- Name: tbl_tickets tbl_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 33759)
-- Name: tbl_tickets tbl_tickets_str_ticket_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_str_ticket_key UNIQUE (str_ticket);


--
-- TOC entry 3568 (class 1259 OID 33760)
-- Name: idx_excepciones_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_opcion ON public.tbl_usuarios_opciones_excepciones USING btree (opcion_id);


--
-- TOC entry 3569 (class 1259 OID 33761)
-- Name: idx_excepciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_usuario ON public.tbl_usuarios_opciones_excepciones USING btree (usuario_id);


--
-- TOC entry 3590 (class 1259 OID 33762)
-- Name: idx_sla_config_cat_prio; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_sla_config_cat_prio ON tickets.sla_configuracion USING btree (categoria_id, prioridad_id);


--
-- TOC entry 3612 (class 1259 OID 33763)
-- Name: idx_tickets_bitacora_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_bitacora_ticket_id ON tickets.tbl_tickets_bitacora USING btree (ticket_id);


--
-- TOC entry 3601 (class 1259 OID 33764)
-- Name: idx_tickets_canal_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_canal_id ON tickets.tbl_tickets USING btree (canal_id);


--
-- TOC entry 3602 (class 1259 OID 33765)
-- Name: idx_tickets_created_at; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_created_at ON tickets.tbl_tickets USING btree (created_at DESC);


--
-- TOC entry 3603 (class 1259 OID 33766)
-- Name: idx_tickets_departamento_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_departamento_id ON tickets.tbl_tickets USING btree (departamento_id);


--
-- TOC entry 3604 (class 1259 OID 33767)
-- Name: idx_tickets_estatus_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_estatus_id ON tickets.tbl_tickets USING btree (estatus_id);


--
-- TOC entry 3605 (class 1259 OID 33768)
-- Name: idx_tickets_prioridad_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_prioridad_id ON tickets.tbl_tickets USING btree (prioridad_id);


--
-- TOC entry 3606 (class 1259 OID 33769)
-- Name: idx_tickets_tipo_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_tipo_ticket_id ON tickets.tbl_tickets USING btree (tipo_ticket_id);


--
-- TOC entry 3607 (class 1259 OID 33770)
-- Name: idx_tickets_vencimiento_sla; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_vencimiento_sla ON tickets.tbl_tickets USING btree (dmt_fecha_vencimiento_sla);


--
-- TOC entry 3795 (class 2618 OID 33520)
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
-- TOC entry 3627 (class 2606 OID 33772)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_opcion FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3628 (class 2606 OID 33777)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3624 (class 2606 OID 33782)
-- Name: tbl_roles_sistemas_opciones fk_opciones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_opciones FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) NOT VALID;


--
-- TOC entry 3622 (class 2606 OID 33787)
-- Name: tbl_roles_sistemas fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.cat_roles(id) NOT VALID;


--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 3622
-- Name: CONSTRAINT fk_rol ON tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_rol ON public.tbl_roles_sistemas IS 'Relaciona la columna rol_id con el id de la tabla cat_roles';


--
-- TOC entry 3625 (class 2606 OID 33792)
-- Name: tbl_roles_sistemas_opciones fk_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3623 (class 2606 OID 33797)
-- Name: tbl_roles_sistemas fk_sistema; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_sistema FOREIGN KEY (sistema_id) REFERENCES public.cat_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3621 (class 2606 OID 33802)
-- Name: tbl_auth_tokens fk_tokens_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT fk_tokens_usuario FOREIGN KEY (user_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 3621
-- Name: CONSTRAINT fk_tokens_usuario ON tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_tokens_usuario ON public.tbl_auth_tokens IS 'Relaciona esta tabla con la tabla usuarios';


--
-- TOC entry 3629 (class 2606 OID 33807)
-- Name: tbl_usuarios_roles_sistemas fk_urs_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3630 (class 2606 OID 33812)
-- Name: tbl_usuarios_roles_sistemas fk_urs_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3626 (class 2606 OID 33817)
-- Name: tbl_usuarios fk_usuario_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT fk_usuario_departamento FOREIGN KEY (departamento_id) REFERENCES public.cat_departamentos(id) NOT VALID;


--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 3626
-- Name: CONSTRAINT fk_usuario_departamento ON tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_usuario_departamento ON public.tbl_usuarios IS 'Relacion entre la tabla Usuario con la tabla Departamento';


--
-- TOC entry 3632 (class 2606 OID 33822)
-- Name: tbl_carga_familiar fk_CargaFamiliar; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT "fk_CargaFamiliar" FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 3632
-- Name: CONSTRAINT "fk_CargaFamiliar" ON tbl_carga_familiar; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT "fk_CargaFamiliar" ON rrhh.tbl_carga_familiar IS 'Relación entre la tabla Usuarios con la tabla Carga_Familiar';


--
-- TOC entry 3631 (class 2606 OID 33827)
-- Name: tbl_amonestaciones fk_amonestaciones; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT fk_amonestaciones FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 3631
-- Name: CONSTRAINT fk_amonestaciones ON tbl_amonestaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_amonestaciones ON rrhh.tbl_amonestaciones IS 'Relación entre la tabla Usuario con la tabla Amonestaciones.';


--
-- TOC entry 3633 (class 2606 OID 33832)
-- Name: tbl_expediente fk_expediente_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT fk_expediente_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 3633
-- Name: CONSTRAINT fk_expediente_usuario ON tbl_expediente; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_expediente_usuario ON rrhh.tbl_expediente IS 'Relación entre la tabla Usuario con la tabla Expediente.';


--
-- TOC entry 3634 (class 2606 OID 33837)
-- Name: tbl_permisos fk_permisos_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT fk_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 3634
-- Name: CONSTRAINT fk_permisos_usuario ON tbl_permisos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_permisos_usuario ON rrhh.tbl_permisos IS 'Relación entre la tabla Usuarios con la tabla Permisos.';


--
-- TOC entry 3635 (class 2606 OID 33842)
-- Name: tbl_reposos fk_reposo_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT fk_reposo_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 3635
-- Name: CONSTRAINT fk_reposo_usuario ON tbl_reposos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_reposo_usuario ON rrhh.tbl_reposos IS 'Relación entre la tabla Usuario con la tabla Reposos.';


--
-- TOC entry 3636 (class 2606 OID 33847)
-- Name: tbl_vacaciones fk_vacaciones_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT fk_vacaciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 3636
-- Name: CONSTRAINT fk_vacaciones_usuario ON tbl_vacaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_vacaciones_usuario ON rrhh.tbl_vacaciones IS 'Relación entre la tabla Usuario y la tabla Vacaciones.';


--
-- TOC entry 3637 (class 2606 OID 33852)
-- Name: sla_configuracion fk_sla_categoria; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_categoria FOREIGN KEY (categoria_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3638 (class 2606 OID 33857)
-- Name: sla_configuracion fk_sla_prioridad; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_prioridad FOREIGN KEY (prioridad_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3639 (class 2606 OID 33862)
-- Name: tbl_tickets fk_tickets_usuario_asignado; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT fk_tickets_usuario_asignado FOREIGN KEY (usuario_asignado_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3641 (class 2606 OID 33867)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_ticket_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES tickets.tbl_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 3642 (class 2606 OID 33872)
-- Name: tbl_tickets_bitacora tbl_tickets_bitacora_usuario_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets_bitacora
    ADD CONSTRAINT tbl_tickets_bitacora_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 3640 (class 2606 OID 33877)
-- Name: tbl_tickets tbl_tickets_tipo_ticket_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_tipo_ticket_id_fkey FOREIGN KEY (tipo_ticket_id) REFERENCES public.cat_datos_maestros(id);


-- Completed on 2026-10-13 15:04:01 -04

--
-- PostgreSQL database dump complete
--

\unrestrict EfkWpWi7HSGD6gCcL5GXsJ4XQXKd0SZHuJOoBNLoGTGwwmfZeIXQg5hdQQo62iQ

