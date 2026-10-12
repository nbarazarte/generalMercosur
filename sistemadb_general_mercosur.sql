--
-- PostgreSQL database dump
--

\restrict tG2fRP3pCggUs0Kaby3zOZ1ucCY1P7Gur0XLvOe1cDZgCJSvX48cJbyM6EAJciO

-- Dumped from database version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg24.04+2)

-- Started on 2026-10-12 15:49:37 -04

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
-- TOC entry 2 (class 3079 OID 66074)
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- TOC entry 7 (class 2615 OID 65536)
-- Name: kcs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA kcs;


ALTER SCHEMA kcs OWNER TO postgres;

--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA kcs; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA kcs IS 'Esquema del sistema de la base de datos de conocimiento';


--
-- TOC entry 8 (class 2615 OID 65537)
-- Name: rrhh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA rrhh;


ALTER SCHEMA rrhh OWNER TO postgres;

--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA rrhh; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA rrhh IS 'Esquema que almacena las tablas del sistema de RRHH';


--
-- TOC entry 9 (class 2615 OID 65538)
-- Name: tickets; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tickets;


ALTER SCHEMA tickets OWNER TO postgres;

--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 9
-- Name: SCHEMA tickets; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA tickets IS 'Esquema del Sistema de Tickets para ATC.';


--
-- TOC entry 280 (class 1255 OID 65539)
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
-- TOC entry 281 (class 1255 OID 65540)
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
-- TOC entry 284 (class 1255 OID 66072)
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
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 284
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
-- TOC entry 222 (class 1259 OID 65541)
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
-- TOC entry 223 (class 1259 OID 65542)
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
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE cat_datos_maestros; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_datos_maestros IS 'Esta tabla es el catalogo general de la base de datos con las listas mas comunes';


--
-- TOC entry 224 (class 1259 OID 65550)
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
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 224
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_datos_maestros_id_seq OWNED BY public.cat_datos_maestros.id;


--
-- TOC entry 225 (class 1259 OID 65551)
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
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE cat_departamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_departamentos IS 'Esta tabla contiene el listado de los departamentos de Mercosur';


--
-- TOC entry 226 (class 1259 OID 65556)
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
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_departamentos_id_seq OWNED BY public.cat_departamentos.id;


--
-- TOC entry 227 (class 1259 OID 65557)
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
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE cat_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_opciones IS 'Esta tabla contiene las opciones de los sistemas';


--
-- TOC entry 228 (class 1259 OID 65564)
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
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE cat_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_roles IS 'Esta tabla contiene el listado de roles que puede tener un sistema (Un id de rol puede ser común para diferentes sistemas)';


--
-- TOC entry 229 (class 1259 OID 65569)
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
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE cat_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cat_sistemas IS 'Contiene los nombres de los Sistemas Internos.';


--
-- TOC entry 230 (class 1259 OID 65577)
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
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_auth_tokens IS 'Esta tabla contiene los tokens de sesión de los usuarios';


--
-- TOC entry 231 (class 1259 OID 65584)
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
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 231
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_auth_tokens_id_seq OWNED BY public.tbl_auth_tokens.id;


--
-- TOC entry 232 (class 1259 OID 65585)
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
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 232
-- Name: tbl_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_opciones_id_seq OWNED BY public.cat_opciones.id;


--
-- TOC entry 233 (class 1259 OID 65586)
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
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_id_seq OWNED BY public.cat_roles.id;


--
-- TOC entry 234 (class 1259 OID 65587)
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
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas IS 'Esta tabla contiene el catalogo de roles de los sistemas';


--
-- TOC entry 235 (class 1259 OID 65593)
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
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_opciones_id_seq OWNED BY public.tbl_roles_sistemas.id;


--
-- TOC entry 236 (class 1259 OID 65594)
-- Name: tbl_roles_sistemas_opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbl_roles_sistemas_opciones (
    id integer NOT NULL,
    rol_sistema_id integer NOT NULL,
    opcion_id integer NOT NULL
);


ALTER TABLE public.tbl_roles_sistemas_opciones OWNER TO postgres;

--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE tbl_roles_sistemas_opciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_roles_sistemas_opciones IS 'Esta tabla contiene las opciones que tiene un rol en un sistema';


--
-- TOC entry 237 (class 1259 OID 65597)
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
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_roles_sistemas_opciones_id_seq OWNED BY public.tbl_roles_sistemas_opciones.id;


--
-- TOC entry 238 (class 1259 OID 65598)
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
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 238
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_sistemas_id_seq OWNED BY public.cat_sistemas.id;


--
-- TOC entry 239 (class 1259 OID 65599)
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
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios IS 'Esta tabla contiene el listado global de usuarios';


--
-- TOC entry 240 (class 1259 OID 65607)
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
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE tbl_usuarios_opciones_excepciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_opciones_excepciones IS 'Esta tabla es para indicar que opciones no tendrá permitido un usuario en un sistema independientemente de su rol';


--
-- TOC entry 241 (class 1259 OID 65613)
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
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_opciones_excepciones_id_seq OWNED BY public.tbl_usuarios_opciones_excepciones.id;


--
-- TOC entry 242 (class 1259 OID 65614)
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
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE tbl_usuarios_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tbl_usuarios_roles_sistemas IS 'Esta tabla contiene el rol de un usuario en un sistema';


--
-- TOC entry 243 (class 1259 OID 65620)
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
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tbl_usuarios_roles_sistemas_id_seq OWNED BY public.tbl_usuarios_roles_sistemas.id;


--
-- TOC entry 244 (class 1259 OID 65621)
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
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.tbl_usuarios.id;


--
-- TOC entry 245 (class 1259 OID 65622)
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
-- TOC entry 246 (class 1259 OID 65629)
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
-- TOC entry 247 (class 1259 OID 65634)
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
-- TOC entry 248 (class 1259 OID 65639)
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
-- TOC entry 249 (class 1259 OID 65644)
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
-- TOC entry 250 (class 1259 OID 65648)
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
-- TOC entry 251 (class 1259 OID 65653)
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
-- TOC entry 252 (class 1259 OID 65657)
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
-- TOC entry 253 (class 1259 OID 65662)
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
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 253
-- Name: VIEW view_usuarios_opciones_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.view_usuarios_opciones_sistemas IS 'Muestra que opciones tienen los usuarios en un sistema';


--
-- TOC entry 254 (class 1259 OID 65667)
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
-- TOC entry 255 (class 1259 OID 65672)
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
-- TOC entry 256 (class 1259 OID 65677)
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
-- TOC entry 257 (class 1259 OID 65684)
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
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 257
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_amonestaciones_id_seq OWNED BY rrhh.tbl_amonestaciones.id;


--
-- TOC entry 258 (class 1259 OID 65685)
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
-- TOC entry 259 (class 1259 OID 65690)
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
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_carga_familiar_id_seq OWNED BY rrhh.tbl_carga_familiar.id;


--
-- TOC entry 260 (class 1259 OID 65691)
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
-- TOC entry 261 (class 1259 OID 65696)
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
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_expediente_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_expediente_id_seq OWNED BY rrhh.tbl_expediente.id;


--
-- TOC entry 262 (class 1259 OID 65697)
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
-- TOC entry 263 (class 1259 OID 65704)
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
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_permisos_id_seq OWNED BY rrhh.tbl_permisos.id;


--
-- TOC entry 264 (class 1259 OID 65705)
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
-- TOC entry 265 (class 1259 OID 65712)
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
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_reposos_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_reposos_id_seq OWNED BY rrhh.tbl_reposos.id;


--
-- TOC entry 266 (class 1259 OID 65713)
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
-- TOC entry 267 (class 1259 OID 65718)
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
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: rrhh; Owner: postgres
--

ALTER SEQUENCE rrhh.tbl_vacaciones_id_seq OWNED BY rrhh.tbl_vacaciones.id;


--
-- TOC entry 268 (class 1259 OID 65719)
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
-- TOC entry 274 (class 1259 OID 66044)
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
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 274
-- Name: sla_configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.sla_configuracion_id_seq OWNED BY tickets.sla_configuracion.id;


--
-- TOC entry 269 (class 1259 OID 65731)
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
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE tbl_clientes; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_clientes IS 'Tabla transaccional que guarda la información de los clientes y potenciales clientes.';


--
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 269
-- Name: COLUMN tbl_clientes.condicion_cliente_id; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_clientes.condicion_cliente_id IS 'Determina si es cliente o no de Mercosur. (Cliente / No Cliente)';


--
-- TOC entry 270 (class 1259 OID 65738)
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
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 270
-- Name: tbl_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_clientes_id_seq OWNED BY tickets.tbl_clientes.id;


--
-- TOC entry 273 (class 1259 OID 65971)
-- Name: tbl_secuencias_tickets; Type: TABLE; Schema: tickets; Owner: postgres
--

CREATE TABLE tickets.tbl_secuencias_tickets (
    int_anio integer NOT NULL,
    int_mes integer NOT NULL,
    int_ultimo_secuencial integer DEFAULT 0 NOT NULL
);


ALTER TABLE tickets.tbl_secuencias_tickets OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 65739)
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
    int_minutos_pausa integer DEFAULT 0,
    str_cedula_cliente character varying(14),
    str_correo_cliente character varying(100)
);


ALTER TABLE tickets.tbl_tickets OWNER TO postgres;

--
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE tbl_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON TABLE tickets.tbl_tickets IS 'Tabla transaccional principal que maneja los tickets del sistema.';


--
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 271
-- Name: COLUMN tbl_tickets.str_cedula_cliente; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_tickets.str_cedula_cliente IS 'Cédula del cliente para tickets externos (Obligatorio en externo)';


--
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 271
-- Name: COLUMN tbl_tickets.str_correo_cliente; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON COLUMN tickets.tbl_tickets.str_correo_cliente IS 'Correo electrónico del cliente para tickets externos (Opcional)';


--
-- TOC entry 272 (class 1259 OID 65747)
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
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 272
-- Name: tbl_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: tickets; Owner: postgres
--

ALTER SEQUENCE tickets.tbl_tickets_id_seq OWNED BY tickets.tbl_tickets.id;


--
-- TOC entry 279 (class 1259 OID 66132)
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
    t.str_cedula_cliente,
    t.str_correo_cliente,
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
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 279
-- Name: VIEW view_listar_tickets; Type: COMMENT; Schema: tickets; Owner: postgres
--

COMMENT ON VIEW tickets.view_listar_tickets IS 'Muestra los tickets del sistema';


--
-- TOC entry 3471 (class 2604 OID 65754)
-- Name: cat_datos_maestros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros ALTER COLUMN id SET DEFAULT nextval('public.cat_datos_maestros_id_seq'::regclass);


--
-- TOC entry 3475 (class 2604 OID 65755)
-- Name: cat_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos ALTER COLUMN id SET DEFAULT nextval('public.cat_departamentos_id_seq'::regclass);


--
-- TOC entry 3478 (class 2604 OID 65756)
-- Name: cat_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_opciones_id_seq'::regclass);


--
-- TOC entry 3481 (class 2604 OID 65757)
-- Name: cat_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_id_seq'::regclass);


--
-- TOC entry 3484 (class 2604 OID 65758)
-- Name: cat_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_sistemas_id_seq'::regclass);


--
-- TOC entry 3488 (class 2604 OID 65759)
-- Name: tbl_auth_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens ALTER COLUMN id SET DEFAULT nextval('public.tbl_auth_tokens_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 65760)
-- Name: tbl_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_opciones_id_seq'::regclass);


--
-- TOC entry 3495 (class 2604 OID 65761)
-- Name: tbl_roles_sistemas_opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_roles_sistemas_opciones_id_seq'::regclass);


--
-- TOC entry 3496 (class 2604 OID 65762)
-- Name: tbl_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3500 (class 2604 OID 65763)
-- Name: tbl_usuarios_opciones_excepciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_opciones_excepciones_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 65764)
-- Name: tbl_usuarios_roles_sistemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas ALTER COLUMN id SET DEFAULT nextval('public.tbl_usuarios_roles_sistemas_id_seq'::regclass);


--
-- TOC entry 3510 (class 2604 OID 65765)
-- Name: tbl_amonestaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_amonestaciones_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 65766)
-- Name: tbl_carga_familiar id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_carga_familiar_id_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 65767)
-- Name: tbl_expediente id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_expediente_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 65768)
-- Name: tbl_permisos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_permisos_id_seq'::regclass);


--
-- TOC entry 3522 (class 2604 OID 65769)
-- Name: tbl_reposos id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_reposos_id_seq'::regclass);


--
-- TOC entry 3525 (class 2604 OID 65770)
-- Name: tbl_vacaciones id; Type: DEFAULT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones ALTER COLUMN id SET DEFAULT nextval('rrhh.tbl_vacaciones_id_seq'::regclass);


--
-- TOC entry 3528 (class 2604 OID 66057)
-- Name: sla_configuracion id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion ALTER COLUMN id SET DEFAULT nextval('tickets.sla_configuracion_id_seq'::regclass);


--
-- TOC entry 3530 (class 2604 OID 65771)
-- Name: tbl_clientes id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_clientes_id_seq'::regclass);


--
-- TOC entry 3533 (class 2604 OID 65772)
-- Name: tbl_tickets id; Type: DEFAULT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets ALTER COLUMN id SET DEFAULT nextval('tickets.tbl_tickets_id_seq'::regclass);


--
-- TOC entry 3467 (class 0 OID 66077)
-- Dependencies: 276
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
2	* * * * *	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	localhost	5432	db_general_mercosur	postgres	t	actualizar-tickets-vencidos-job
\.


--
-- TOC entry 3469 (class 0 OID 66096)
-- Dependencies: 278
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: postgres
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
1	22	495007	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:50:00.01246-04	2026-10-12 00:50:00.013739-04
1	36	534658	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:00:00.065124-04	2026-10-12 02:00:00.066175-04
1	1	420733	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:05:00.011194-04	2026-10-11 23:05:00.012936-04
1	10	451513	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:50:00.010044-04	2026-10-11 23:50:00.011931-04
1	17	476295	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:25:00.011367-04	2026-10-12 00:25:00.012821-04
1	2	423762	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:10:00.011828-04	2026-10-11 23:10:00.013221-04
1	30	522278	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:30:00.009762-04	2026-10-12 01:30:00.0109-04
1	11	455903	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:55:00.010582-04	2026-10-11 23:55:00.011806-04
1	3	426712	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:15:00.009214-04	2026-10-11 23:15:00.010404-04
1	23	498480	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:55:00.010981-04	2026-10-12 00:55:00.012478-04
1	4	430391	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:20:00.009579-04	2026-10-11 23:20:00.010888-04
1	18	480026	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:30:00.010661-04	2026-10-12 00:30:00.011767-04
1	12	459242	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:00:00.0115-04	2026-10-12 00:00:00.013132-04
1	5	433915	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:25:00.008819-04	2026-10-11 23:25:00.011038-04
1	27	512171	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:15:00.010777-04	2026-10-12 01:15:00.011961-04
1	6	437290	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:30:00.010846-04	2026-10-11 23:30:00.012363-04
1	13	462562	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:05:00.011423-04	2026-10-12 00:05:00.012627-04
1	7	440793	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:35:00.01404-04	2026-10-11 23:35:00.01554-04
1	19	483878	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:35:00.00863-04	2026-10-12 00:35:00.009777-04
1	14	465701	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:10:00.010822-04	2026-10-12 00:10:00.012322-04
1	8	444533	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:40:00.009631-04	2026-10-11 23:40:00.010869-04
1	24	501554	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:00:00.018149-04	2026-10-12 01:00:00.021064-04
1	9	448066	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-11 23:45:00.009129-04	2026-10-11 23:45:00.010403-04
1	15	469260	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:15:00.009439-04	2026-10-12 00:15:00.011024-04
1	20	487512	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:40:00.008973-04	2026-10-12 00:40:00.010046-04
1	40	538342	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:20:00.009305-04	2026-10-12 02:20:00.010359-04
1	16	472933	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:20:00.009373-04	2026-10-12 00:20:00.010469-04
1	33	531377	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:45:00.067302-04	2026-10-12 01:45:00.068728-04
1	28	515610	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:20:00.009412-04	2026-10-12 01:20:00.010754-04
1	21	491284	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 00:45:00.010348-04	2026-10-12 00:45:00.011589-04
1	25	504805	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:05:00.098487-04	2026-10-12 01:05:00.11895-04
1	31	525520	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:35:00.011403-04	2026-10-12 01:35:00.01286-04
1	26	508409	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:10:00.009463-04	2026-10-12 01:10:00.011183-04
1	29	519026	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:25:00.009518-04	2026-10-12 01:25:00.0106-04
1	35	533735	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:55:00.011103-04	2026-10-12 01:55:00.012147-04
1	32	529660	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:40:00.011041-04	2026-10-12 01:40:00.012496-04
1	34	532754	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 01:50:00.011484-04	2026-10-12 01:50:00.012916-04
1	38	536515	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:10:00.013268-04	2026-10-12 02:10:00.014359-04
1	37	535559	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:05:00.009365-04	2026-10-12 02:05:00.010495-04
1	39	537433	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:15:00.011002-04	2026-10-12 02:15:00.012033-04
1	41	539238	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:25:00.009264-04	2026-10-12 02:25:00.010383-04
1	42	540167	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:30:00.008812-04	2026-10-12 02:30:00.009925-04
1	43	541064	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:35:00.011527-04	2026-10-12 02:35:00.013035-04
1	44	542015	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:40:00.067104-04	2026-10-12 02:40:00.068153-04
1	45	542918	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:45:00.071827-04	2026-10-12 02:45:00.072949-04
1	67	48341	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:45:00.008391-04	2026-10-12 12:45:00.009752-04
2	81	74722	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:25:00.010372-04	2026-10-12 13:25:00.011947-04
1	46	543822	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:50:00.082809-04	2026-10-12 02:50:00.083841-04
1	55	12478	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:45:00.00934-04	2026-10-12 11:45:00.010495-04
1	62	33002	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:20:00.010232-04	2026-10-12 12:20:00.011462-04
1	47	544718	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 02:55:00.065501-04	2026-10-12 02:55:00.066616-04
2	75	70580	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:19:00.007861-04	2026-10-12 13:19:00.00892-04
1	56	13524	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:50:00.009-04	2026-10-12 11:50:00.010112-04
1	48	545618	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 03:00:00.009057-04	2026-10-12 03:00:00.01009-04
1	68	51510	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:50:00.010724-04	2026-10-12 12:50:00.012321-04
1	49	546601	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 03:05:00.065216-04	2026-10-12 03:05:00.066148-04
1	63	36202	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:25:00.062385-04	2026-10-12 12:25:00.064035-04
1	57	14576	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:55:00.010329-04	2026-10-12 11:55:00.011391-04
1	50	547545	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 03:10:00.066083-04	2026-10-12 03:10:00.06726-04
1	72	65072	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:10:00.011654-04	2026-10-12 13:10:00.013154-04
1	51	8079	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:25:00.011466-04	2026-10-12 11:25:00.019513-04
1	58	19860	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:00:00.011267-04	2026-10-12 12:00:00.012646-04
1	52	9204	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:30:00.010783-04	2026-10-12 11:30:00.011847-04
1	64	39051	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:30:00.009813-04	2026-10-12 12:30:00.01086-04
1	59	23216	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:05:00.010047-04	2026-10-12 12:05:00.011093-04
1	53	10379	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:35:00.009548-04	2026-10-12 11:35:00.010598-04
1	69	54607	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:55:00.010692-04	2026-10-12 12:55:00.011745-04
1	54	11457	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 11:40:00.00809-04	2026-10-12 11:40:00.009023-04
1	60	26384	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:10:00.00942-04	2026-10-12 12:10:00.010556-04
1	65	42092	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:35:00.007764-04	2026-10-12 12:35:00.009322-04
2	85	77430	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:29:00.007425-04	2026-10-12 13:29:00.008625-04
1	61	29623	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:15:00.066172-04	2026-10-12 12:15:00.067569-04
2	78	72544	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:22:00.008018-04	2026-10-12 13:22:00.009101-04
1	73	68187	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:15:00.010813-04	2026-10-12 13:15:00.012224-04
1	66	45425	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 12:40:00.008983-04	2026-10-12 12:40:00.009951-04
1	70	57968	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:00:00.009237-04	2026-10-12 13:00:00.010316-04
2	76	71204	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:20:00.011241-04	2026-10-12 13:20:00.012676-04
1	71	62017	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:05:00.011184-04	2026-10-12 13:05:00.012557-04
2	74	69978	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:18:00.009784-04	2026-10-12 13:18:00.01084-04
2	80	73742	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:24:00.009598-04	2026-10-12 13:24:00.011065-04
2	77	71865	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:21:00.009856-04	2026-10-12 13:21:00.011001-04
2	79	73132	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:23:00.008278-04	2026-10-12 13:23:00.009336-04
2	83	76225	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:27:00.011042-04	2026-10-12 13:27:00.012836-04
2	82	75598	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:26:00.011186-04	2026-10-12 13:26:00.012729-04
2	84	76861	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:28:00.010457-04	2026-10-12 13:28:00.011584-04
2	86	77998	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:30:00.010206-04	2026-10-12 13:30:00.011741-04
2	87	78573	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:31:00.011178-04	2026-10-12 13:31:00.012848-04
2	88	79140	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:32:00.009099-04	2026-10-12 13:32:00.01023-04
2	89	79715	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:33:00.009001-04	2026-10-12 13:33:00.010494-04
2	90	80498	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:34:00.007931-04	2026-10-12 13:34:00.009415-04
2	112	92993	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:56:00.011349-04	2026-10-12 13:56:00.012563-04
2	126	100926	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:10:00.011342-04	2026-10-12 14:10:00.013207-04
2	91	81065	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:35:00.008559-04	2026-10-12 13:35:00.009924-04
2	100	86192	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:44:00.008357-04	2026-10-12 13:44:00.009545-04
2	107	90172	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:51:00.011427-04	2026-10-12 13:51:00.012979-04
2	92	81647	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:36:00.008464-04	2026-10-12 13:36:00.009668-04
2	120	97490	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:04:00.008913-04	2026-10-12 14:04:00.010065-04
2	101	86753	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:45:00.007986-04	2026-10-12 13:45:00.009165-04
2	93	82215	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:37:00.007914-04	2026-10-12 13:37:00.009274-04
2	113	93553	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:57:00.011293-04	2026-10-12 13:57:00.012815-04
2	94	82782	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:38:00.008715-04	2026-10-12 13:38:00.00979-04
2	108	90746	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:52:00.00971-04	2026-10-12 13:52:00.011214-04
2	102	87338	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:46:00.008619-04	2026-10-12 13:46:00.009889-04
2	95	83345	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:39:00.009459-04	2026-10-12 13:39:00.011121-04
2	117	95798	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:01:00.009938-04	2026-10-12 14:01:00.011069-04
2	96	83941	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:40:00.010001-04	2026-10-12 13:40:00.01118-04
2	103	87910	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:47:00.007483-04	2026-10-12 13:47:00.008708-04
2	97	84516	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:41:00.009259-04	2026-10-12 13:41:00.010682-04
2	109	91291	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:53:00.009739-04	2026-10-12 13:53:00.010889-04
2	104	88458	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:48:00.008174-04	2026-10-12 13:48:00.00965-04
2	98	85081	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:42:00.00843-04	2026-10-12 13:42:00.009682-04
2	114	94112	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:58:00.007947-04	2026-10-12 13:58:00.00947-04
2	99	85635	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:43:00.00878-04	2026-10-12 13:43:00.009898-04
2	105	89026	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:49:00.009586-04	2026-10-12 13:49:00.010894-04
2	110	91849	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:54:00.009874-04	2026-10-12 13:54:00.011174-04
2	130	103186	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:14:00.010843-04	2026-10-12 14:14:00.01254-04
2	106	89591	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:50:00.009099-04	2026-10-12 13:50:00.010764-04
2	123	99192	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:07:00.010673-04	2026-10-12 14:07:00.012225-04
2	118	96365	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:02:00.010292-04	2026-10-12 14:02:00.011632-04
2	111	92404	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:55:00.008633-04	2026-10-12 13:55:00.009724-04
2	115	94675	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 13:59:00.011137-04	2026-10-12 13:59:00.012697-04
2	121	98054	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:05:00.00868-04	2026-10-12 14:05:00.009832-04
2	116	95222	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:00:00.012137-04	2026-10-12 14:00:00.013394-04
2	119	96924	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:03:00.008635-04	2026-10-12 14:03:00.009715-04
2	125	100303	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:09:00.009734-04	2026-10-12 14:09:00.011019-04
2	122	98624	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:06:00.011819-04	2026-10-12 14:06:00.013344-04
2	124	99756	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:08:00.008523-04	2026-10-12 14:08:00.009604-04
2	128	102063	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:12:00.008792-04	2026-10-12 14:12:00.009979-04
2	127	101503	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:11:00.010582-04	2026-10-12 14:11:00.012097-04
2	129	102632	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:13:00.009525-04	2026-10-12 14:13:00.010829-04
2	131	103755	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:15:00.010206-04	2026-10-12 14:15:00.012001-04
2	132	104349	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:16:00.012789-04	2026-10-12 14:16:00.014519-04
2	133	104899	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:17:00.010047-04	2026-10-12 14:17:00.011658-04
2	134	105467	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:18:00.01066-04	2026-10-12 14:18:00.011776-04
2	135	106038	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:19:00.008249-04	2026-10-12 14:19:00.009362-04
2	157	128516	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:41:00.008952-04	2026-10-12 14:41:00.010084-04
2	171	137464	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:55:00.010733-04	2026-10-12 14:55:00.012964-04
2	136	106598	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:20:00.011626-04	2026-10-12 14:20:00.012748-04
2	145	111687	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:29:00.008899-04	2026-10-12 14:29:00.010029-04
2	152	117139	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:36:00.008927-04	2026-10-12 14:36:00.010618-04
2	137	107188	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:21:00.011321-04	2026-10-12 14:21:00.012388-04
2	165	133691	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:49:00.007996-04	2026-10-12 14:49:00.009073-04
2	146	112254	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:30:00.00853-04	2026-10-12 14:30:00.009815-04
2	138	107766	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:22:00.010739-04	2026-10-12 14:22:00.012462-04
2	158	129214	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:42:00.009667-04	2026-10-12 14:42:00.011172-04
2	139	108331	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:23:00.012279-04	2026-10-12 14:23:00.01339-04
2	153	119543	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:37:00.012067-04	2026-10-12 14:37:00.014253-04
2	147	113175	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:31:00.009555-04	2026-10-12 14:31:00.010635-04
2	140	108888	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:24:00.00908-04	2026-10-12 14:24:00.010279-04
2	162	131755	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:46:00.011842-04	2026-10-12 14:46:00.01332-04
2	141	109446	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:25:00.010507-04	2026-10-12 14:25:00.01173-04
2	148	113727	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:32:00.009347-04	2026-10-12 14:32:00.010407-04
2	142	110008	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:26:00.010179-04	2026-10-12 14:26:00.011222-04
2	154	126232	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:38:00.009522-04	2026-10-12 14:38:00.010946-04
2	149	114630	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:33:00.008364-04	2026-10-12 14:33:00.009493-04
2	143	110571	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:27:00.009953-04	2026-10-12 14:27:00.011142-04
2	159	129801	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:43:00.009418-04	2026-10-12 14:43:00.010958-04
2	144	111138	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:28:00.009017-04	2026-10-12 14:28:00.010172-04
2	150	115342	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:34:00.010323-04	2026-10-12 14:34:00.012026-04
2	155	127089	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:39:00.007855-04	2026-10-12 14:39:00.009116-04
2	175	140341	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:59:00.007607-04	2026-10-12 14:59:00.008762-04
2	151	115952	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:35:00.007161-04	2026-10-12 14:35:00.008581-04
2	168	135514	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:52:00.009849-04	2026-10-12 14:52:00.011388-04
2	163	132431	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:47:00.011077-04	2026-10-12 14:47:00.01255-04
2	156	127838	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:40:00.009515-04	2026-10-12 14:40:00.010654-04
2	160	130407	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:44:00.010655-04	2026-10-12 14:44:00.01221-04
2	166	134305	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:50:00.007979-04	2026-10-12 14:50:00.009006-04
2	161	131170	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:45:00.009616-04	2026-10-12 14:45:00.010781-04
2	164	133066	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:48:00.009152-04	2026-10-12 14:48:00.010212-04
2	170	136862	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:54:00.010079-04	2026-10-12 14:54:00.01138-04
2	167	134930	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:51:00.008867-04	2026-10-12 14:51:00.010004-04
2	169	136099	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:53:00.009693-04	2026-10-12 14:53:00.011317-04
2	173	138989	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:57:00.008641-04	2026-10-12 14:57:00.010174-04
2	172	138107	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:56:00.010635-04	2026-10-12 14:56:00.012062-04
2	174	139754	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 14:58:00.008158-04	2026-10-12 14:58:00.009207-04
2	176	140947	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:00:00.00854-04	2026-10-12 15:00:00.010267-04
2	177	141629	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:01:00.008586-04	2026-10-12 15:01:00.009761-04
2	178	142258	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:02:00.009651-04	2026-10-12 15:02:00.010683-04
2	179	142881	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:03:00.007706-04	2026-10-12 15:03:00.008736-04
2	180	144031	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:04:00.008531-04	2026-10-12 15:04:00.01082-04
2	202	166222	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:26:00.009661-04	2026-10-12 15:26:00.010842-04
2	216	175723	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:40:00.011261-04	2026-10-12 15:40:00.01284-04
2	181	146020	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:05:00.011767-04	2026-10-12 15:05:00.014276-04
2	190	158651	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:14:00.009908-04	2026-10-12 15:14:00.011056-04
2	197	162894	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:21:00.010605-04	2026-10-12 15:21:00.012324-04
2	182	153067	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:06:00.008974-04	2026-10-12 15:06:00.010028-04
2	210	171512	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:34:00.008814-04	2026-10-12 15:34:00.009874-04
2	191	159237	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:15:00.007834-04	2026-10-12 15:15:00.00895-04
2	183	153932	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:07:00.008387-04	2026-10-12 15:07:00.009568-04
2	203	166848	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:27:00.009203-04	2026-10-12 15:27:00.010386-04
2	184	154591	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:08:00.008657-04	2026-10-12 15:08:00.010281-04
2	198	163500	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:22:00.0086-04	2026-10-12 15:22:00.009821-04
2	192	159854	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:16:00.009228-04	2026-10-12 15:16:00.010692-04
2	185	155185	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:09:00.010214-04	2026-10-12 15:09:00.011659-04
2	207	169634	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:31:00.008502-04	2026-10-12 15:31:00.009495-04
2	186	155932	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:10:00.009998-04	2026-10-12 15:10:00.011388-04
2	193	160466	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:17:00.008304-04	2026-10-12 15:17:00.009508-04
2	187	156608	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:11:00.01115-04	2026-10-12 15:11:00.012863-04
2	199	164154	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:23:00.010321-04	2026-10-12 15:23:00.011629-04
2	194	161056	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:18:00.01097-04	2026-10-12 15:18:00.012619-04
2	188	157276	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:12:00.008507-04	2026-10-12 15:12:00.009839-04
2	204	167438	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:28:00.010157-04	2026-10-12 15:28:00.011928-04
2	189	157972	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:13:00.007776-04	2026-10-12 15:13:00.009356-04
2	195	161646	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:19:00.008249-04	2026-10-12 15:19:00.00954-04
2	200	164746	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:24:00.009144-04	2026-10-12 15:24:00.010557-04
2	220	178388	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:44:00.008401-04	2026-10-12 15:44:00.009884-04
2	196	162258	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:20:00.007944-04	2026-10-12 15:20:00.009107-04
2	213	173657	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:37:00.008564-04	2026-10-12 15:37:00.009933-04
2	208	170255	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:32:00.009053-04	2026-10-12 15:32:00.010192-04
2	201	165601	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:25:00.009645-04	2026-10-12 15:25:00.010866-04
2	205	168081	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:29:00.009665-04	2026-10-12 15:29:00.011313-04
2	211	172148	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:35:00.008023-04	2026-10-12 15:35:00.00917-04
2	206	168845	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:30:00.007663-04	2026-10-12 15:30:00.008815-04
2	209	170853	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:33:00.008837-04	2026-10-12 15:33:00.009976-04
2	215	175010	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:39:00.010845-04	2026-10-12 15:39:00.012297-04
2	212	172899	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:36:00.009063-04	2026-10-12 15:36:00.010444-04
2	214	174278	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:38:00.008067-04	2026-10-12 15:38:00.009208-04
2	218	176978	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:42:00.009889-04	2026-10-12 15:42:00.011134-04
2	217	176353	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:41:00.010897-04	2026-10-12 15:41:00.0124-04
2	219	177747	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:43:00.007645-04	2026-10-12 15:43:00.008905-04
2	221	179022	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:45:00.009541-04	2026-10-12 15:45:00.010652-04
2	222	179743	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:46:00.011103-04	2026-10-12 15:46:00.012515-04
2	223	180547	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:47:00.008566-04	2026-10-12 15:47:00.009921-04
2	224	181197	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:48:00.009632-04	2026-10-12 15:48:00.011253-04
2	225	181960	db_general_mercosur	postgres	SELECT tickets.fn_verificar_y_actualizar_tickets_vencidos();	succeeded	1 row	2026-10-12 15:49:00.008534-04	2026-10-12 15:49:00.009591-04
\.


--
-- TOC entry 3802 (class 0 OID 65542)
-- Dependencies: 223
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
9	CATEGORIA_EXTERNA	Web App	Categoría Web App	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
10	CATEGORIA_EXTERNA	Mercado de Valores	Categoría Mercado de Valores	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
11	CATEGORIA_EXTERNA	Generar Certificado	Categoría Generar Certificado	t	2026-10-09 16:24:56.960588-04	2026-10-09 16:24:56.960588-04
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
\.


--
-- TOC entry 3804 (class 0 OID 65551)
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
-- TOC entry 3806 (class 0 OID 65557)
-- Dependencies: 227
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
-- TOC entry 3807 (class 0 OID 65564)
-- Dependencies: 228
-- Data for Name: cat_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_roles (id, str_nombre, str_descripcion, created_at, updated_at) FROM stdin;
1	administrador	Administrador general de los sistemas	2026-09-09 11:28:55.692406-04	2026-09-09 11:28:55.692406-04
18	técnico 1	\N	2026-10-01 13:19:56.909464-04	2026-10-01 13:19:56.909464-04
19	usuario	\N	2026-10-01 13:22:25.912871-04	2026-10-01 13:22:25.912871-04
17	operador atc	\N	2026-10-01 10:28:35.429321-04	2026-10-09 21:10:26.056285-04
\.


--
-- TOC entry 3808 (class 0 OID 65569)
-- Dependencies: 229
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
-- TOC entry 3809 (class 0 OID 65577)
-- Dependencies: 230
-- Data for Name: tbl_auth_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_auth_tokens (id, user_id, token, created_at, expires_at, used, str_device_id, str_device_name) FROM stdin;
405	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc5MTgzNDMzMiwiZXhwIjoxNzkxODM3OTMyfQ.hRPI53jBlJGIUoEAF7sptyb_ixtiAGx3N1SvNz7ceYQ	2026-10-12 14:30:21.058-04	2026-10-12 16:45:32.568675-04	f	140a233c-6959-4f5b-ad39-6fdae6540c63	Chrome en Linux PC
\.


--
-- TOC entry 3813 (class 0 OID 65587)
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
-- TOC entry 3815 (class 0 OID 65594)
-- Dependencies: 236
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
-- TOC entry 3818 (class 0 OID 65599)
-- Dependencies: 239
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
4	1	16379712	Neel Ezequiel	Barazarte Aché	nbarazarte@mercosur.com.ve	$2a$10$XmwnY2gfUArfm7Gtl2B5R.Dxl9JNK2SECdsZaconwOTK6x7Da5ayK	t	2026-10-01 14:51:25.418478-04	2026-10-09 21:12:50.402422-04	\N	\N	nbarazarte	\N	\N	2026-10-10 18:55:26.651581
64	5	32560280	Yarbelis Carolina	Cervantes Herrera	ycervantes@mercosur.com.ve	$2a$10$J7CUsv2bsMGkjSrM3hS/puqHuIv/D7UJ1UeCENPvOMFfBctHZgdXm	t	2026-10-01 16:41:00.998101-04	2026-10-09 21:11:34.545712-04	\N	\N	ycervantes	\N	\N	2026-10-11 00:50:40.691646
102	5	32061634	Cladimar Oriana	Zambrano Baez	czambrano@mercosur.com.ve	$2a$10$sQ5c5XbrSp9hNeHoIXORzu0A1harKHXU6OsNYyHEJ9x7XkXNaZpH.	t	2026-10-01 16:41:00.998101-04	2026-10-11 16:00:09.841711-04	\N	\N	czambrano	\N	\N	2026-10-11 16:00:31.476333
1	1	00000000	Admin	Mercosur	sistemasmcdb@mercosur.com.ve	$2a$10$sQJ1WZfXydLA91xjFb59AeyIMxmQ7xa66uPnYq8FtBjQIFUM3zbZK	t	2026-09-10 13:13:24.007018-04	2026-10-01 11:49:40.344834-04	\N	\N	admin	\N	\N	2026-10-12 14:30:21.060726
\.


--
-- TOC entry 3819 (class 0 OID 65607)
-- Dependencies: 240
-- Data for Name: tbl_usuarios_opciones_excepciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbl_usuarios_opciones_excepciones (id, usuario_id, opcion_id, bol_permitido, created_at, update_at) FROM stdin;
\.


--
-- TOC entry 3821 (class 0 OID 65614)
-- Dependencies: 242
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
-- TOC entry 3825 (class 0 OID 65677)
-- Dependencies: 256
-- Data for Name: tbl_amonestaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_amonestaciones (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3827 (class 0 OID 65685)
-- Dependencies: 258
-- Data for Name: tbl_carga_familiar; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_carga_familiar (id, usuario_id, parentesco_id, nombre_completo, fecha_nacimiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3829 (class 0 OID 65691)
-- Dependencies: 260
-- Data for Name: tbl_expediente; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_expediente (id, str_num_expediente, usuario_id, dmt_fecha_exp, bol_cv, bol_foto, bol_referencias, bol_cert_est, bol_cert_cap, bol_compr_dom, bol_acdo_conf, bol_cap_gen, bol_cap_area, otros_cursos, cap_cumpl, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3831 (class 0 OID 65697)
-- Dependencies: 262
-- Data for Name: tbl_permisos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_permisos (id, usuario_id, motivo_id, str_motivo_descripcion, dmt_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3833 (class 0 OID 65705)
-- Dependencies: 264
-- Data for Name: tbl_reposos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_reposos (id, usuario_id, motivo_id, str_motivo_descripcion, tim_fecha, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3835 (class 0 OID 65713)
-- Dependencies: 266
-- Data for Name: tbl_vacaciones; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.tbl_vacaciones (id, usuario_id, int_total_dias, dmt_fecha_desde, dmt_fecha_hasta, int_dias_disfrute, int_dias_pendiente, bol_vencidas, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3837 (class 0 OID 65719)
-- Dependencies: 268
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
-- TOC entry 3824 (class 0 OID 65622)
-- Dependencies: 245
-- Data for Name: tbl_alertas; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_alertas (id, caso_id, usuario_id, str_tipo_alerta, str_mensaje, bol_leido, fecha_generacion, fecha_lectura) FROM stdin;
\.


--
-- TOC entry 3838 (class 0 OID 65731)
-- Dependencies: 269
-- Data for Name: tbl_clientes; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_clientes (id, str_cedula, str_nombre, str_apellido, str_telefono, str_email, str_direccion, dtm_fecha_nacimiento, created_at, updated_at, condicion_cliente_id) FROM stdin;
\.


--
-- TOC entry 3842 (class 0 OID 65971)
-- Dependencies: 273
-- Data for Name: tbl_secuencias_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_secuencias_tickets (int_anio, int_mes, int_ultimo_secuencial) FROM stdin;
2026	10	14
\.


--
-- TOC entry 3840 (class 0 OID 65739)
-- Dependencies: 271
-- Data for Name: tbl_tickets; Type: TABLE DATA; Schema: tickets; Owner: postgres
--

COPY tickets.tbl_tickets (id, str_ticket, cliente_id, creador_agente_id, cierre_agente_id, departamento_id, categoria_id, prioridad_id, estatus_id, canal_id, str_asunto, str_descripcion, int_sla, dmt_fecha_cierre, created_at, updated_at, str_ruta_imagen, str_ruta_video, str_ruta_audio, usuario_asignado_id, tipo_ticket_id, dmt_fecha_vencimiento_sla, bool_cumplio_sla, int_minutos_pausa, str_cedula_cliente, str_correo_cliente) FROM stdin;
4	TCK2026-10-000004	\N	64	\N	1	32	14	22	\N	carpetas	no veo mis carpetas	24	2026-10-11 00:54:11.223906-04	2026-10-11 00:51:23.199961-04	2026-10-11 00:54:11.223906-04	\N	\N	\N	4	24	2026-10-12 00:51:23.199961-04	\N	0	\N	\N
1	TCK2026-10-000001	\N	64	\N	1	9	16	22	3	Problemas con el Facematch	El cliente no puede hacer satisfactoriamente la validación de facematch	4	2026-10-10 22:44:19.247541-04	2026-10-10 22:11:53.001248-04	2026-10-10 22:44:19.247541-04	\N	\N	\N	4	25	2026-10-11 02:11:53.001248-04	\N	0	5143077	maritzaache@gmail.com
2	TCK2026-10-000002	\N	64	\N	1	9	16	22	2	Problemas con su KYC	**Resumen de la Solicitud:**\r\nEl cliente está experimentando un error al intentar completar su KYC (Know Your Customer).\r\n\r\n**Detalle del Requerimiento o Falla:**\r\nCuando el cliente intenta finalizar el proceso de KYC, aparece un mensaje de error. El cliente ha proporcionado todos los documentos solicitados pero aún no puede avanzar en el registro.\r\n\r\n**Resultado Esperado:**\r\nSe espera que se resuelva el error para que el cliente pueda completar su proceso de KYC sin inconvenientes y acceda a las funciones del sistema correspondientes.	4	2026-10-11 00:32:12.326207-04	2026-10-10 23:22:15.244169-04	2026-10-11 00:32:12.326207-04	\N	\N	\N	57	25	2026-10-11 03:22:15.244169-04	\N	0	5143077	maritzaache@gmail.com
6	TCK2026-10-000006	\N	102	\N	1	35	15	22	\N	Problema con mi monitor	**Resumen de la Solicitud:** El usuario informa que su monitor a veces se apaga.\r\n\r\n**Detalle del Requerimiento o Falla:** A veces, el monitor de mi computadora se apaga automáticamente sin ninguna razón显而易见。 Esto ocurre de manera aleatoria y no sigue un patrón específico. \r\n\r\n**Resultado Esperado:** Que el equipo de soporte identifique la causa del problema y soluciones las interrupciones inesperadas del monitor.	16	2026-10-11 23:57:44.855572-04	2026-10-11 16:20:16.470188-04	2026-10-11 23:57:44.855572-04	\N	\N	\N	3	24	2026-10-12 08:20:16.470188-04	\N	0	\N	\N
3	TCK2026-10-000003	\N	64	\N	1	32	16	22	\N	Problemas para ver mi carpeta	Perdi ele acceso a mi carpeta	6	2026-10-11 00:43:22.39875-04	2026-10-10 23:37:36.60327-04	2026-10-11 00:43:22.39875-04	\N	\N	\N	3	24	2026-10-11 05:37:36.60327-04	\N	0	\N	\N
8	TCK2026-10-000008	\N	1	\N	1	9	16	22	2	werwe	listo	4	2026-10-12 00:17:02.266546-04	2026-10-12 00:16:49.906026-04	2026-10-12 00:17:02.266546-04	\N	\N	\N	3	25	2026-10-12 04:16:49.906026-04	\N	0	2314234	ildemar@gmail.com
5	TCK2026-10-000005	\N	102	\N	1	9	16	23	2	Cliente presenta problemas con facematch	**Ticket de Soporte: PROBLEMAS CON FACEMATCH**\r\n\r\n**Descripción del Problema:**\r\nEl cliente está experimentando problemas con la función de Facematch en nuestra aplicación de Casa de Bolsa S.A. Este error afecta negativamente su experiencia, ya que el sistema no reconoce correctamente su rostro y requiere una nueva verificación manual cada vez que intenta acceder a sus cuentas.\r\n\r\n**Pruebas Realizadas:**\r\n\r\n1. **Verificación del Estado de Cuenta:** Comprobamos el estado actual de cuenta del usuario para asegurarnos de que no haya ninguna incidencia específica asociada con Facematch.\r\n2. **Reinicio de Sesión en la Aplicación:** Solicitamos al cliente realizar un reinicio completo de sesión para verificar si el problema persiste tras un reinicio.\r\n3. **Ajustes del Sistema Operativo:** Se comprueba si hay actualizaciones disponibles para el sistema operativo y se sugiere su instalación.\r\n\r\n**Paso 1 - Verificación del Estado de Cuenta**\r\nComprueba la situación en tu cuenta e informa cualquier mensaje de error o advertencia que puedas estar recibiendo. \r\n\r\n**Paso 2 - Reinicio de Sesión en la Aplicación**\r\nRealiza un cierre completo de sesión en la aplicación y vuelve a iniciarla para ver si el problema persiste.\r\n\r\n**Paso 3 - Ajustes del Sistema Operativo**\r\nVerifica si hay actualizaciones disponibles para tu sistema operativo y realiza las instaladas, luego intenta acceder nuevamente a través de nuestra aplicación.\r\n\r\n**Paso 4 - Nueva Validación por Usuario**\r\nPor favor confirma si después de realizar los pasos anteriores el problema ha sido resuelto.	4	\N	2026-10-12 00:21:42.660966-04	2026-10-12 00:21:42.660966-04	\N	\N	\N	57	25	2026-10-12 04:21:42.660966-04	\N	0	5143077	maritzaache@gmail.com
7	TCK2026-10-000007	\N	1	\N	1	8	16	22	3	tes	**Ticket de Soporte: USUARIO NO PUEDE FIRMA SU FICHA**\r\n\r\n**Descripción del Problema:**  \r\nEl usuario reporta que no puede firmar su ficha en la aplicación de la Casa de Bolsa S.A. Este problema tiene un impacto crítico, ya que afecta directamente el proceso de finalización de su pedido y la obtención de sus aportes.\r\n\r\n**Pruebas Realizadas:**\r\n1. **Verificación de Conexión:** El usuario ha confirmado que está conectado a Internet correctamente.\r\n2. **Reinicio del Servicio de Aplicación:** Se reinició el servicio de la aplicación, pero el problema persiste.\r\n3. **Actualización de la Aplicación:** El usuario informó que ya tiene la última versión de la aplicación instalada.\r\n\r\n**Paso 1 - Verificación de Credenciales:**\r\nRevisar las credenciales del usuario para asegurarse de que no hay errores o problemas en su cuenta.\r\n\r\n**Paso 2 - Comprobación de la Base de Datos:**\r\nConsultar el sistema interno para verificar si hay algún problema con los datos asociados al usuario o su ficha específica.\r\n\r\n**Paso 3 - Aplicación del Procedimiento Secundario:**\r\nSolicitar al usuario que realice una desincronización y luego sincronización nuevamente de sus aportes y fichas en la aplicación.\r\n\r\n**Paso 4 - Validación Final:**\r\nPedir al usuario que termine el proceso de firma nuevamente y confirmar si el problema ha sido resuelto.	4	2026-10-12 00:21:32.116197-04	2026-10-12 00:21:15.576259-04	2026-10-12 00:21:32.116197-04	\N	\N	\N	4	25	2026-10-12 04:21:15.576259-04	\N	0	20299553	ildemar@gmail.com
9	TCK2026-10-000009	\N	1	\N	1	9	16	37	2	otra prueba	pruebas	4	\N	2026-10-11 00:29:32.013019-04	2026-10-12 00:34:51.812075-04	\N	\N	\N	4	25	2026-10-11 04:29:32.013019-04	\N	0	20299553	ildemar@gmail.com
10	TCK2026-10-000010	\N	1	\N	1	26	16	37	\N	Facturacion	Problemas con la facturacion	4	\N	2026-10-12 00:45:16.837174-04	2026-10-12 11:25:00.011587-04	\N	\N	\N	2	24	2026-10-12 04:45:16.837174-04	\N	0	\N	\N
11	TCK2026-10-000011	\N	1	\N	1	26	16	37	\N	No hay LA	No hay LA	4	\N	2026-10-12 01:08:12.682604-04	2026-10-12 11:25:00.011587-04	\N	\N	\N	2	24	2026-10-12 05:08:12.682604-04	\N	0	\N	\N
13	TCK2026-10-000013	\N	1	\N	1	9	16	17	1	pruebas	**Ticket de Soporte: INCAPACIDAD DE RECHARGAR SALDO EN CUENTA**\r\n\r\n**Descripción del Problema:** El cliente informa que no puede recargar saldo en su cuenta para comprar títulos. Este problema tiene un impacto crítico ya que se está obstaculizando la capacidad del usuario de realizar transacciones comerciales en la plataforma.\r\n\r\n**Pruebas Realizadas:**\r\n\r\n1. **Verificación de Conexión:** El cliente aseguró que tiene una conexión a Internet estable.\r\n2. **Revisar Estado de Cuenta:** Se verificó el estado general de la cuenta del cliente y no se identificaron errores de saldo o bloqueos.\r\n3. **Prueba de Recharge Vía Web:** Se intentó recargar saldo mediante la interfaz web del servicio, pero el proceso resultó fallido con un mensaje de error indicando que no es posible realizar operaciones en este momento.\r\n\r\n**Paso 1 - Verificación de Servicio de Recarga:**\r\n- Revisar si el servicio de rechazo está temporalmente inactivo o si hay alguna limitación conocida para las operaciones de recarga.\r\n\r\n**Paso 2 - Consulta con Centro de Operaciones:**\r\n- Contactar al Centro de Operaciones para informar del problema y solicitar una aclaración sobre la causa del fallo en el proceso de rechazo.\r\n- Pedir confirmación sobre si el cliente puede realizar la operación mediante otros métodos (por ejemplo, teléfono o aplicación móvil).\r\n\r\n**Paso 3 - Aplicar Procedimiento Alternativo:**\r\n- Proporcionar al cliente las opciones alternativas disponibles para recargar su saldo:\r\n  1. Realizar el rechazo a través del teléfono central de la compañía.\r\n  2. Utilizar la versión móvil de la aplicación en lugar de la web.\r\n  3. Revisar si hay alguna promoción o oferta que permita el rechazo sin necesidad de internet.\r\n\r\n**Paso 4 - Nueva Validación:**\r\n- Solicitar al cliente que realice una nueva prueba del proceso utilizando la opción alternativa proporcionada, por ejemplo, realizando un recarga a través del teléfono central.\r\n- Documentar los resultados y confirmar con el cliente si su problema ha sido resuelto.\r\n\r\n\r\n	4	\N	2026-10-12 14:39:07.310067-04	2026-10-12 14:39:07.310067-04	/var/www/uploads/1791830347299-casa-kame-de-dragon-ball_3840x2160_xtrafondos.com.jpg,/var/www/uploads/1791830347307-image.png	\N	\N	4	25	2026-10-12 18:39:07.310067-04	\N	0	20299553	ildemar@gmail.com
12	TCK2026-10-000012	\N	1	\N	1	33	16	37	\N	Creacion de usuarios	Creacion de un usuario nuevo	2	\N	2026-10-12 13:03:32.662631-04	2026-10-12 15:04:00.008582-04	\N	\N	\N	57	24	2026-10-12 15:03:32.662631-04	\N	0	\N	\N
14	TCK2026-10-000014	\N	1	\N	1	9	16	17	3	otra prueba	**Ticket de Soporte: KYC NO PUEDE SER COMPLETADO**\r\n\r\n**Descripción del Problema:**  \r\nEl cliente está experimentando problemas para completar el proceso de KYC (Know Your Customer) dentro de la aplicación de Mercosur Casa de Bolsa S.A. Este problema tiene un impacto directo en su capacidad para utilizar todos los servicios y funcionalidades disponibles en la plataforma, lo que implica una restricción en su acceso a las operaciones financieras necesarias.\r\n\r\n**Pruebas Realizadas:**\r\n\r\n1. **Verificación del Estado Actual:** El usuario intentó completar el KYC a través de la aplicación pero recibió un mensaje de error indicando que no puede llenar el formulario.\r\n2. **Reinicio de Sesión:** Se solicitó al usuario que reiniciara su sesión y luego intentara nuevamente completar el KYC.\r\n3. **Contacto con Soporte:** El cliente contactó directamente a nuestro servicio al cliente, pero aún no se ha podido resolver el problema.\r\n\r\n**Paso 1 - Verificación de Datos Personales:**\r\nVerifique los datos personales proporcionados por el usuario y asegúrese de que sean correctos y completos. Solicite nuevamente la documentación necesaria para el KYC.\r\n\r\n**Paso 2 - Revisión de Conexión a Internet:** Informe al cliente que verifique su conexión a internet estable y segura, ya que problemas con la conexión pueden causar errores técnicos en la aplicación.\r\n\r\n**Paso 3 - Actualización de Aplicación:** Asegúrese de que el usuario esté utilizando la versión más reciente de la aplicación. Si no es así, instale la actualización y luego intente nuevamente completar el KYC.\r\n\r\n**Paso 4 - Nueva Validación con Usuario:**\r\nSolicite al cliente que realice una nueva validación del KYC a través de la aplicación después de seguir los pasos descritos en los primeros tres pasos. Proporcione instrucciones específicas sobre cómo completar el formulario y qué documentación se requiere, así como cómo contactar nuevamente si continúa experimentando problemas.\r\n\r\n\r\n\r\n	4	\N	2026-10-12 15:06:52.832138-04	2026-10-12 15:06:52.832138-04	/var/www/uploads/TCK2026-10-000014-1.jpg,/var/www/uploads/TCK2026-10-000014-2.png	/var/www/uploads/TCK2026-10-000014-vid-1.webm	\N	57	25	2026-10-12 19:06:52.832138-04	\N	0	12333456	prueba@cliente.com
\.


--
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 275
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.jobid_seq', 2, true);


--
-- TOC entry 3893 (class 0 OID 0)
-- Dependencies: 277
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: postgres
--

SELECT pg_catalog.setval('cron.runid_seq', 225, true);


--
-- TOC entry 3894 (class 0 OID 0)
-- Dependencies: 222
-- Name: tbl_kcs_articulos_id_seq; Type: SEQUENCE SET; Schema: kcs; Owner: postgres
--

SELECT pg_catalog.setval('kcs.tbl_kcs_articulos_id_seq', 6, true);


--
-- TOC entry 3895 (class 0 OID 0)
-- Dependencies: 224
-- Name: cat_datos_maestros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_datos_maestros_id_seq', 38, true);


--
-- TOC entry 3896 (class 0 OID 0)
-- Dependencies: 226
-- Name: cat_departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_departamentos_id_seq', 10, true);


--
-- TOC entry 3897 (class 0 OID 0)
-- Dependencies: 231
-- Name: tbl_auth_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_auth_tokens_id_seq', 405, true);


--
-- TOC entry 3898 (class 0 OID 0)
-- Dependencies: 232
-- Name: tbl_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_opciones_id_seq', 46, true);


--
-- TOC entry 3899 (class 0 OID 0)
-- Dependencies: 233
-- Name: tbl_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_id_seq', 19, true);


--
-- TOC entry 3900 (class 0 OID 0)
-- Dependencies: 235
-- Name: tbl_roles_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_opciones_id_seq', 45, true);


--
-- TOC entry 3901 (class 0 OID 0)
-- Dependencies: 237
-- Name: tbl_roles_sistemas_opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_roles_sistemas_opciones_id_seq', 70, true);


--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 238
-- Name: tbl_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_sistemas_id_seq', 34, true);


--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 241
-- Name: tbl_usuarios_opciones_excepciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_opciones_excepciones_id_seq', 1, false);


--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 243
-- Name: tbl_usuarios_roles_sistemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tbl_usuarios_roles_sistemas_id_seq', 69, true);


--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 104, true);


--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 257
-- Name: tbl_amonestaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_amonestaciones_id_seq', 1, false);


--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 259
-- Name: tbl_carga_familiar_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_carga_familiar_id_seq', 1, false);


--
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 261
-- Name: tbl_expediente_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_expediente_id_seq', 1, false);


--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 263
-- Name: tbl_permisos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_permisos_id_seq', 1, false);


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 265
-- Name: tbl_reposos_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_reposos_id_seq', 1, false);


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 267
-- Name: tbl_vacaciones_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.tbl_vacaciones_id_seq', 1, false);


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 274
-- Name: sla_configuracion_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.sla_configuracion_id_seq', 46, true);


--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 270
-- Name: tbl_clientes_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_clientes_id_seq', 1, true);


--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 272
-- Name: tbl_tickets_id_seq; Type: SEQUENCE SET; Schema: tickets; Owner: postgres
--

SELECT pg_catalog.setval('tickets.tbl_tickets_id_seq', 14, true);


--
-- TOC entry 3548 (class 2606 OID 65775)
-- Name: cat_datos_maestros cat_datos_maestros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_datos_maestros
    ADD CONSTRAINT cat_datos_maestros_pkey PRIMARY KEY (id);


--
-- TOC entry 3550 (class 2606 OID 65777)
-- Name: cat_departamentos cat_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 3552 (class 2606 OID 65779)
-- Name: cat_departamentos cat_departamentos_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_departamentos
    ADD CONSTRAINT cat_departamentos_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3568 (class 2606 OID 65781)
-- Name: tbl_roles_sistemas_opciones pk_roles_sistemas_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT pk_roles_sistemas_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 65783)
-- Name: tbl_auth_tokens tbl_auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT tbl_auth_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3554 (class 2606 OID 65785)
-- Name: cat_opciones tbl_opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_opciones
    ADD CONSTRAINT tbl_opciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3556 (class 2606 OID 65787)
-- Name: cat_roles tbl_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 65789)
-- Name: tbl_roles_sistemas tbl_roles_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT tbl_roles_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 65791)
-- Name: cat_roles tbl_roles_str_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_roles
    ADD CONSTRAINT tbl_roles_str_nombre_key UNIQUE (str_nombre);


--
-- TOC entry 3560 (class 2606 OID 65793)
-- Name: cat_sistemas tbl_sistemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_sistemas
    ADD CONSTRAINT tbl_sistemas_pkey PRIMARY KEY (id);


--
-- TOC entry 3578 (class 2606 OID 65795)
-- Name: tbl_usuarios_opciones_excepciones tbl_usuarios_opciones_excepciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT tbl_usuarios_opciones_excepciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 65797)
-- Name: tbl_usuarios tbl_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT tbl_usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 65799)
-- Name: tbl_usuarios_opciones_excepciones uk_usuario_opcion_excepcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT uk_usuario_opcion_excepcion UNIQUE (usuario_id, opcion_id);


--
-- TOC entry 3564 (class 2606 OID 65801)
-- Name: tbl_auth_tokens unique_user_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT unique_user_device UNIQUE (user_id, str_device_id);


--
-- TOC entry 3582 (class 2606 OID 65803)
-- Name: tbl_usuarios_roles_sistemas unique_usuario_rol_sistema; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT unique_usuario_rol_sistema UNIQUE (usuario_id, rol_sistema_id);


--
-- TOC entry 3572 (class 2606 OID 65805)
-- Name: tbl_usuarios usuarios_str_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3574 (class 2606 OID 65807)
-- Name: tbl_usuarios usuarios_str_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT usuarios_str_email_key UNIQUE (str_email);


--
-- TOC entry 3586 (class 2606 OID 65809)
-- Name: tbl_amonestaciones tbl_amonestaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT tbl_amonestaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3588 (class 2606 OID 65811)
-- Name: tbl_carga_familiar tbl_carga_familiar_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT tbl_carga_familiar_pkey PRIMARY KEY (id);


--
-- TOC entry 3590 (class 2606 OID 65813)
-- Name: tbl_expediente tbl_expediente_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT tbl_expediente_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 65815)
-- Name: tbl_permisos tbl_permisos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT tbl_permisos_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 65817)
-- Name: tbl_reposos tbl_reposos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT tbl_reposos_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 65819)
-- Name: tbl_vacaciones tbl_vacaciones_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT tbl_vacaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 65821)
-- Name: sla_configuracion sla_configuracion_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT sla_configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 3584 (class 2606 OID 65825)
-- Name: tbl_alertas tbl_alertas_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_alertas
    ADD CONSTRAINT tbl_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 3601 (class 2606 OID 65827)
-- Name: tbl_clientes tbl_clientes_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 65829)
-- Name: tbl_clientes tbl_clientes_str_cedula_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_cedula_key UNIQUE (str_cedula);


--
-- TOC entry 3605 (class 2606 OID 65831)
-- Name: tbl_clientes tbl_clientes_str_email_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_clientes
    ADD CONSTRAINT tbl_clientes_str_email_key UNIQUE (str_email);


--
-- TOC entry 3618 (class 2606 OID 65976)
-- Name: tbl_secuencias_tickets tbl_secuencias_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_secuencias_tickets
    ADD CONSTRAINT tbl_secuencias_tickets_pkey PRIMARY KEY (int_anio, int_mes);


--
-- TOC entry 3614 (class 2606 OID 65835)
-- Name: tbl_tickets tbl_tickets_pkey; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 65837)
-- Name: tbl_tickets tbl_tickets_str_ticket_key; Type: CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_str_ticket_key UNIQUE (str_ticket);


--
-- TOC entry 3575 (class 1259 OID 65840)
-- Name: idx_excepciones_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_opcion ON public.tbl_usuarios_opciones_excepciones USING btree (opcion_id);


--
-- TOC entry 3576 (class 1259 OID 65841)
-- Name: idx_excepciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_excepciones_usuario ON public.tbl_usuarios_opciones_excepciones USING btree (usuario_id);


--
-- TOC entry 3597 (class 1259 OID 66144)
-- Name: idx_sla_config_cat_prio; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_sla_config_cat_prio ON tickets.sla_configuracion USING btree (categoria_id, prioridad_id);


--
-- TOC entry 3606 (class 1259 OID 66141)
-- Name: idx_tickets_canal_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_canal_id ON tickets.tbl_tickets USING btree (canal_id);


--
-- TOC entry 3607 (class 1259 OID 66143)
-- Name: idx_tickets_created_at; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_created_at ON tickets.tbl_tickets USING btree (created_at DESC);


--
-- TOC entry 3608 (class 1259 OID 66140)
-- Name: idx_tickets_departamento_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_departamento_id ON tickets.tbl_tickets USING btree (departamento_id);


--
-- TOC entry 3609 (class 1259 OID 66138)
-- Name: idx_tickets_estatus_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_estatus_id ON tickets.tbl_tickets USING btree (estatus_id);


--
-- TOC entry 3610 (class 1259 OID 66142)
-- Name: idx_tickets_prioridad_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_prioridad_id ON tickets.tbl_tickets USING btree (prioridad_id);


--
-- TOC entry 3611 (class 1259 OID 66139)
-- Name: idx_tickets_tipo_ticket_id; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_tipo_ticket_id ON tickets.tbl_tickets USING btree (tipo_ticket_id);


--
-- TOC entry 3612 (class 1259 OID 65995)
-- Name: idx_tickets_vencimiento_sla; Type: INDEX; Schema: tickets; Owner: postgres
--

CREATE INDEX idx_tickets_vencimiento_sla ON tickets.tbl_tickets USING btree (dmt_fecha_vencimiento_sla);


--
-- TOC entry 3795 (class 2618 OID 65656)
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
-- TOC entry 3631 (class 2606 OID 65845)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_opcion FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3632 (class 2606 OID 65850)
-- Name: tbl_usuarios_opciones_excepciones fk_excepciones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_opciones_excepciones
    ADD CONSTRAINT fk_excepciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3628 (class 2606 OID 65855)
-- Name: tbl_roles_sistemas_opciones fk_opciones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_opciones FOREIGN KEY (opcion_id) REFERENCES public.cat_opciones(id) NOT VALID;


--
-- TOC entry 3626 (class 2606 OID 65860)
-- Name: tbl_roles_sistemas fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.cat_roles(id) NOT VALID;


--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 3626
-- Name: CONSTRAINT fk_rol ON tbl_roles_sistemas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_rol ON public.tbl_roles_sistemas IS 'Relaciona la columna rol_id con el id de la tabla cat_roles';


--
-- TOC entry 3629 (class 2606 OID 65865)
-- Name: tbl_roles_sistemas_opciones fk_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas_opciones
    ADD CONSTRAINT fk_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3627 (class 2606 OID 65870)
-- Name: tbl_roles_sistemas fk_sistema; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_roles_sistemas
    ADD CONSTRAINT fk_sistema FOREIGN KEY (sistema_id) REFERENCES public.cat_sistemas(id) ON DELETE CASCADE;


--
-- TOC entry 3625 (class 2606 OID 65875)
-- Name: tbl_auth_tokens fk_tokens_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_auth_tokens
    ADD CONSTRAINT fk_tokens_usuario FOREIGN KEY (user_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 3625
-- Name: CONSTRAINT fk_tokens_usuario ON tbl_auth_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_tokens_usuario ON public.tbl_auth_tokens IS 'Relaciona esta tabla con la tabla usuarios';


--
-- TOC entry 3633 (class 2606 OID 65880)
-- Name: tbl_usuarios_roles_sistemas fk_urs_roles_sistemas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_roles_sistemas FOREIGN KEY (rol_sistema_id) REFERENCES public.tbl_roles_sistemas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3634 (class 2606 OID 65885)
-- Name: tbl_usuarios_roles_sistemas fk_urs_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios_roles_sistemas
    ADD CONSTRAINT fk_urs_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3630 (class 2606 OID 65890)
-- Name: tbl_usuarios fk_usuario_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbl_usuarios
    ADD CONSTRAINT fk_usuario_departamento FOREIGN KEY (departamento_id) REFERENCES public.cat_departamentos(id) NOT VALID;


--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 3630
-- Name: CONSTRAINT fk_usuario_departamento ON tbl_usuarios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_usuario_departamento ON public.tbl_usuarios IS 'Relacion entre la tabla Usuario con la tabla Departamento';


--
-- TOC entry 3636 (class 2606 OID 65895)
-- Name: tbl_carga_familiar fk_CargaFamiliar; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_carga_familiar
    ADD CONSTRAINT "fk_CargaFamiliar" FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 3636
-- Name: CONSTRAINT "fk_CargaFamiliar" ON tbl_carga_familiar; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT "fk_CargaFamiliar" ON rrhh.tbl_carga_familiar IS 'Relación entre la tabla Usuarios con la tabla Carga_Familiar';


--
-- TOC entry 3635 (class 2606 OID 65900)
-- Name: tbl_amonestaciones fk_amonestaciones; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_amonestaciones
    ADD CONSTRAINT fk_amonestaciones FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 3635
-- Name: CONSTRAINT fk_amonestaciones ON tbl_amonestaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_amonestaciones ON rrhh.tbl_amonestaciones IS 'Relación entre la tabla Usuario con la tabla Amonestaciones.';


--
-- TOC entry 3637 (class 2606 OID 65905)
-- Name: tbl_expediente fk_expediente_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_expediente
    ADD CONSTRAINT fk_expediente_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 3637
-- Name: CONSTRAINT fk_expediente_usuario ON tbl_expediente; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_expediente_usuario ON rrhh.tbl_expediente IS 'Relación entre la tabla Usuario con la tabla Expediente.';


--
-- TOC entry 3638 (class 2606 OID 65910)
-- Name: tbl_permisos fk_permisos_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_permisos
    ADD CONSTRAINT fk_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 3638
-- Name: CONSTRAINT fk_permisos_usuario ON tbl_permisos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_permisos_usuario ON rrhh.tbl_permisos IS 'Relación entre la tabla Usuarios con la tabla Permisos.';


--
-- TOC entry 3639 (class 2606 OID 65915)
-- Name: tbl_reposos fk_reposo_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_reposos
    ADD CONSTRAINT fk_reposo_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 3639
-- Name: CONSTRAINT fk_reposo_usuario ON tbl_reposos; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_reposo_usuario ON rrhh.tbl_reposos IS 'Relación entre la tabla Usuario con la tabla Reposos.';


--
-- TOC entry 3640 (class 2606 OID 65920)
-- Name: tbl_vacaciones fk_vacaciones_usuario; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tbl_vacaciones
    ADD CONSTRAINT fk_vacaciones_usuario FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(id) NOT VALID;


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 3640
-- Name: CONSTRAINT fk_vacaciones_usuario ON tbl_vacaciones; Type: COMMENT; Schema: rrhh; Owner: postgres
--

COMMENT ON CONSTRAINT fk_vacaciones_usuario ON rrhh.tbl_vacaciones IS 'Relación entre la tabla Usuario y la tabla Vacaciones.';


--
-- TOC entry 3641 (class 2606 OID 66009)
-- Name: sla_configuracion fk_sla_categoria; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_categoria FOREIGN KEY (categoria_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3642 (class 2606 OID 66014)
-- Name: sla_configuracion fk_sla_prioridad; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.sla_configuracion
    ADD CONSTRAINT fk_sla_prioridad FOREIGN KEY (prioridad_id) REFERENCES public.cat_datos_maestros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3643 (class 2606 OID 65941)
-- Name: tbl_tickets fk_tickets_usuario_asignado; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT fk_tickets_usuario_asignado FOREIGN KEY (usuario_asignado_id) REFERENCES public.tbl_usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3644 (class 2606 OID 65989)
-- Name: tbl_tickets tbl_tickets_tipo_ticket_id_fkey; Type: FK CONSTRAINT; Schema: tickets; Owner: postgres
--

ALTER TABLE ONLY tickets.tbl_tickets
    ADD CONSTRAINT tbl_tickets_tipo_ticket_id_fkey FOREIGN KEY (tipo_ticket_id) REFERENCES public.cat_datos_maestros(id);


-- Completed on 2026-10-12 15:49:37 -04

--
-- PostgreSQL database dump complete
--

\unrestrict tG2fRP3pCggUs0Kaby3zOZ1ucCY1P7Gur0XLvOe1cDZgCJSvX48cJbyM6EAJciO

