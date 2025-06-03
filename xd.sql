--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-01 22:53:05

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
-- TOC entry 2 (class 3079 OID 58393)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 58436)
-- Name: adicionales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adicionales (
    id bigint NOT NULL,
    nombre text NOT NULL,
    precio numeric(10,2) NOT NULL
);


ALTER TABLE public.adicionales OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 58521)
-- Name: adicionales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adicionales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adicionales_id_seq OWNER TO postgres;

--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 236
-- Name: adicionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adicionales_id_seq OWNED BY public.adicionales.id;


--
-- TOC entry 229 (class 1259 OID 58489)
-- Name: caja_perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_perfiles (
    usuario_id bigint NOT NULL,
    ubicacion text NOT NULL
);


ALTER TABLE public.caja_perfiles OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 58441)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id bigint NOT NULL,
    nombre text NOT NULL,
    email character varying(320),
    telefono character varying(10) NOT NULL,
    creado_en timestamp with time zone DEFAULT now(),
    modificado_en timestamp with time zone DEFAULT now(),
    CONSTRAINT clientes_telefono_check CHECK ((char_length((telefono)::text) = 10))
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 58522)
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 237
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- TOC entry 230 (class 1259 OID 58494)
-- Name: cocina_perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cocina_perfiles (
    usuario_id bigint NOT NULL,
    estacion text NOT NULL
);


ALTER TABLE public.cocina_perfiles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 58449)
-- Name: disponibilidadplatos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disponibilidadplatos (
    id bigint NOT NULL,
    plato_id bigint NOT NULL,
    fecha date NOT NULL,
    stock integer NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.disponibilidadplatos OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 58523)
-- Name: disponibilidadplatos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disponibilidadplatos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.disponibilidadplatos_id_seq OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 238
-- Name: disponibilidadplatos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disponibilidadplatos_id_seq OWNED BY public.disponibilidadplatos.id;


--
-- TOC entry 218 (class 1259 OID 58430)
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id bigint NOT NULL,
    pedido_id bigint NOT NULL,
    total numeric(10,2) NOT NULL,
    impuestos numeric(5,2) DEFAULT 12.00 NOT NULL,
    descuentos numeric(5,2) DEFAULT 0.00 NOT NULL,
    creado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 58520)
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_seq OWNER TO postgres;

--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 235
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- TOC entry 231 (class 1259 OID 58499)
-- Name: gerencia_perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gerencia_perfiles (
    usuario_id bigint NOT NULL,
    email character varying(320) NOT NULL
);


ALTER TABLE public.gerencia_perfiles OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 58502)
-- Name: mesero_perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesero_perfiles (
    usuario_id bigint NOT NULL,
    nombre text NOT NULL,
    turno text NOT NULL
);


ALTER TABLE public.mesero_perfiles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 58459)
-- Name: order_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status (
    id integer NOT NULL,
    code text NOT NULL,
    label text NOT NULL
);


ALTER TABLE public.order_status OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 58525)
-- Name: order_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_id_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 240
-- Name: order_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_id_seq OWNED BY public.order_status.id;


--
-- TOC entry 224 (class 1259 OID 58464)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 58526)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO postgres;

--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 241
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 225 (class 1259 OID 58469)
-- Name: pedido_adicionales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_adicionales (
    pedido_id bigint NOT NULL,
    adicional_id bigint NOT NULL,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    CONSTRAINT pedido_adicionales_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.pedido_adicionales OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 58473)
-- Name: pedido_platos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_platos (
    pedido_id bigint NOT NULL,
    plato_id bigint NOT NULL,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    CONSTRAINT pedido_platos_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.pedido_platos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 58477)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id bigint NOT NULL,
    mesero_id bigint,
    cliente_id bigint,
    hora_pedido timestamp with time zone DEFAULT now(),
    status_id integer NOT NULL,
    payment_method integer,
    total numeric(10,2),
    creado_en timestamp with time zone DEFAULT now(),
    modificado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 58527)
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 242
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- TOC entry 222 (class 1259 OID 58453)
-- Name: platos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platos (
    id bigint NOT NULL,
    nombre text NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock_disponible integer NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.platos OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 58524)
-- Name: platos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platos_id_seq OWNER TO postgres;

--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 239
-- Name: platos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platos_id_seq OWNED BY public.platos.id;


--
-- TOC entry 228 (class 1259 OID 58483)
-- Name: reportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes (
    id bigint NOT NULL,
    nombre text NOT NULL,
    contenido jsonb,
    generado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reportes OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 58528)
-- Name: reportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reportes_id_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 243
-- Name: reportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_id_seq OWNED BY public.reportes.id;


--
-- TOC entry 233 (class 1259 OID 58507)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre text NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 58529)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 244
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 234 (class 1259 OID 58512)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    role_id integer NOT NULL,
    creado_en timestamp with time zone DEFAULT now(),
    modificado_en timestamp with time zone DEFAULT now(),
    correo character varying(255),
    CONSTRAINT chk_correo_valido CHECK (((correo)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 58530)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 245
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 246 (class 1259 OID 58666)
-- Name: usuarios_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.usuarios_view AS
 SELECT id,
    username,
    password_hash,
    role_id,
    creado_en,
    modificado_en,
    correo AS email
   FROM public.usuarios;


ALTER VIEW public.usuarios_view OWNER TO postgres;

--
-- TOC entry 4861 (class 2604 OID 58532)
-- Name: adicionales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adicionales ALTER COLUMN id SET DEFAULT nextval('public.adicionales_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 58533)
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 58534)
-- Name: disponibilidadplatos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidadplatos ALTER COLUMN id SET DEFAULT nextval('public.disponibilidadplatos_id_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 58531)
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 58536)
-- Name: order_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status ALTER COLUMN id SET DEFAULT nextval('public.order_status_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 58537)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 58538)
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 58535)
-- Name: platos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platos ALTER COLUMN id SET DEFAULT nextval('public.platos_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 58539)
-- Name: reportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes ALTER COLUMN id SET DEFAULT nextval('public.reportes_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 58540)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 58541)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5096 (class 0 OID 58436)
-- Dependencies: 219
-- Data for Name: adicionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adicionales (id, nombre, precio) FROM stdin;
1	Mayonesa	0.25
\.


--
-- TOC entry 5106 (class 0 OID 58489)
-- Dependencies: 229
-- Data for Name: caja_perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_perfiles (usuario_id, ubicacion) FROM stdin;
4	Caja Principal
\.


--
-- TOC entry 5097 (class 0 OID 58441)
-- Dependencies: 220
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, email, telefono, creado_en, modificado_en) FROM stdin;
1	Cliente Uno	cliente1@example.com	0999999999	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05
\.


--
-- TOC entry 5107 (class 0 OID 58494)
-- Dependencies: 230
-- Data for Name: cocina_perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cocina_perfiles (usuario_id, estacion) FROM stdin;
3	Estación 1
\.


--
-- TOC entry 5098 (class 0 OID 58449)
-- Dependencies: 221
-- Data for Name: disponibilidadplatos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disponibilidadplatos (id, plato_id, fecha, stock, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5095 (class 0 OID 58430)
-- Dependencies: 218
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id, pedido_id, total, impuestos, descuentos, creado_en) FROM stdin;
1	1	5.00	12.00	0.00	2025-05-20 22:39:09.760283-05
\.


--
-- TOC entry 5108 (class 0 OID 58499)
-- Dependencies: 231
-- Data for Name: gerencia_perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gerencia_perfiles (usuario_id, email) FROM stdin;
1	gerente@example.com
\.


--
-- TOC entry 5109 (class 0 OID 58502)
-- Dependencies: 232
-- Data for Name: mesero_perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesero_perfiles (usuario_id, nombre, turno) FROM stdin;
2	Carlos Mesero	mañana
\.


--
-- TOC entry 5100 (class 0 OID 58459)
-- Dependencies: 223
-- Data for Name: order_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status (id, code, label) FROM stdin;
1	PENDIENTE	Pendiente
\.


--
-- TOC entry 5101 (class 0 OID 58464)
-- Dependencies: 224
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, nombre) FROM stdin;
1	Efectivo
\.


--
-- TOC entry 5102 (class 0 OID 58469)
-- Dependencies: 225
-- Data for Name: pedido_adicionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_adicionales (pedido_id, adicional_id, cantidad, precio) FROM stdin;
1	1	1	0.50
\.


--
-- TOC entry 5103 (class 0 OID 58473)
-- Dependencies: 226
-- Data for Name: pedido_platos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_platos (pedido_id, plato_id, cantidad, precio) FROM stdin;
\.


--
-- TOC entry 5104 (class 0 OID 58477)
-- Dependencies: 227
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, mesero_id, cliente_id, hora_pedido, status_id, payment_method, total, creado_en, modificado_en) FROM stdin;
1	2	1	2025-05-20 22:39:09.760283-05	1	1	5.00	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05
\.


--
-- TOC entry 5099 (class 0 OID 58453)
-- Dependencies: 222
-- Data for Name: platos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platos (id, nombre, precio, stock_disponible, actualizado_en) FROM stdin;
2	Pincho de Carne	2.00	10	2025-05-21 10:16:45.29158-05
4	Seco de Costilla	3.50	12	2025-05-23 17:47:43.73425-05
3	Pincho de Pollo	2.00	12	2025-05-29 16:10:04.401258-05
\.


--
-- TOC entry 5105 (class 0 OID 58483)
-- Dependencies: 228
-- Data for Name: reportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reportes (id, nombre, contenido, generado_en) FROM stdin;
1	Reporte de prueba	{"ventas": [{"plato": "Arroz con pollo", "total": 4.50}]}	2025-05-20 22:39:09.760283-05
\.


--
-- TOC entry 5110 (class 0 OID 58507)
-- Dependencies: 233
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre) FROM stdin;
1	gerente
2	mesero
3	cocinero
4	caja
\.


--
-- TOC entry 5111 (class 0 OID 58512)
-- Dependencies: 234
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, password_hash, role_id, creado_en, modificado_en, correo) FROM stdin;
1	gerente01	$2a$06$5mBVf7EYhKgEfpgQHExKseydz.2FwsVy5B4euknuT0drWWAQCfx3i	1	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05	gerente@example.com
2	mesero01	$2a$06$dqiUbFToYVwjiB5m3dsM7OT0ZxYVJRJYZjev0QX6mlXsIrTyRQM5y	2	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05	mesero@example.com
3	cocinero01	$2a$06$uI9IZm4oL1IIX/9AOHRgsOg1O1Aw1QlLoEh374Y5bs5Zdb1plFmbG	3	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05	cocinero@example.com
4	caja01	$2a$06$hz4UCXVWuQ22elRn9VnoLei/wJCdlT02vyvY4KGWWF37yCN9U5V6y	4	2025-05-20 22:39:09.760283-05	2025-05-20 22:39:09.760283-05	caja@example.com
\.


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 236
-- Name: adicionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adicionales_id_seq', 1, false);


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 237
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, false);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 238
-- Name: disponibilidadplatos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disponibilidadplatos_id_seq', 1, false);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 235
-- Name: facturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_id_seq', 1, false);


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 240
-- Name: order_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_id_seq', 1, false);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 241
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 1, false);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 242
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 1, false);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 239
-- Name: platos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platos_id_seq', 4, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 243
-- Name: reportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reportes_id_seq', 1, false);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 244
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 245
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- TOC entry 4888 (class 2606 OID 58545)
-- Name: adicionales adicionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adicionales
    ADD CONSTRAINT adicionales_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 58571)
-- Name: caja_perfiles caja_perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_perfiles
    ADD CONSTRAINT caja_perfiles_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4890 (class 2606 OID 58547)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 58573)
-- Name: cocina_perfiles cocina_perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cocina_perfiles
    ADD CONSTRAINT cocina_perfiles_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4892 (class 2606 OID 58549)
-- Name: disponibilidadplatos disponibilidadplatos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidadplatos
    ADD CONSTRAINT disponibilidadplatos_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 58551)
-- Name: disponibilidadplatos disponibilidadplatos_plato_id_fecha_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidadplatos
    ADD CONSTRAINT disponibilidadplatos_plato_id_fecha_key UNIQUE (plato_id, fecha);


--
-- TOC entry 4886 (class 2606 OID 58543)
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 58577)
-- Name: gerencia_perfiles gerencia_perfiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerencia_perfiles
    ADD CONSTRAINT gerencia_perfiles_email_key UNIQUE (email);


--
-- TOC entry 4923 (class 2606 OID 58575)
-- Name: gerencia_perfiles gerencia_perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerencia_perfiles
    ADD CONSTRAINT gerencia_perfiles_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4925 (class 2606 OID 58579)
-- Name: mesero_perfiles mesero_perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesero_perfiles
    ADD CONSTRAINT mesero_perfiles_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4899 (class 2606 OID 58557)
-- Name: order_status order_status_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status
    ADD CONSTRAINT order_status_code_key UNIQUE (code);


--
-- TOC entry 4901 (class 2606 OID 58555)
-- Name: order_status order_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status
    ADD CONSTRAINT order_status_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 58561)
-- Name: payment_methods payment_methods_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_nombre_key UNIQUE (nombre);


--
-- TOC entry 4905 (class 2606 OID 58559)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 58563)
-- Name: pedido_adicionales pedido_adicionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_adicionales
    ADD CONSTRAINT pedido_adicionales_pkey PRIMARY KEY (pedido_id, adicional_id);


--
-- TOC entry 4909 (class 2606 OID 58565)
-- Name: pedido_platos pedido_platos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_platos
    ADD CONSTRAINT pedido_platos_pkey PRIMARY KEY (pedido_id, plato_id);


--
-- TOC entry 4913 (class 2606 OID 58567)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 2606 OID 58553)
-- Name: platos platos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platos
    ADD CONSTRAINT platos_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 58569)
-- Name: reportes reportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 58583)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 4929 (class 2606 OID 58581)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 58585)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 58587)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 4895 (class 1259 OID 58663)
-- Name: idx_disponibilidad_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disponibilidad_fecha ON public.disponibilidadplatos USING btree (fecha);


--
-- TOC entry 4910 (class 1259 OID 58664)
-- Name: idx_pedidos_mesero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_mesero ON public.pedidos USING btree (mesero_id);


--
-- TOC entry 4911 (class 1259 OID 58665)
-- Name: idx_pedidos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_status ON public.pedidos USING btree (status_id);


--
-- TOC entry 4944 (class 2606 OID 58638)
-- Name: caja_perfiles caja_perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_perfiles
    ADD CONSTRAINT caja_perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 58643)
-- Name: cocina_perfiles cocina_perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cocina_perfiles
    ADD CONSTRAINT cocina_perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 58593)
-- Name: disponibilidadplatos disponibilidadplatos_plato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidadplatos
    ADD CONSTRAINT disponibilidadplatos_plato_id_fkey FOREIGN KEY (plato_id) REFERENCES public.platos(id) ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 58588)
-- Name: facturas facturas_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- TOC entry 4946 (class 2606 OID 58648)
-- Name: gerencia_perfiles gerencia_perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerencia_perfiles
    ADD CONSTRAINT gerencia_perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 58653)
-- Name: mesero_perfiles mesero_perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesero_perfiles
    ADD CONSTRAINT mesero_perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 58598)
-- Name: pedido_adicionales pedido_adicionales_adicional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_adicionales
    ADD CONSTRAINT pedido_adicionales_adicional_id_fkey FOREIGN KEY (adicional_id) REFERENCES public.adicionales(id) ON DELETE RESTRICT;


--
-- TOC entry 4937 (class 2606 OID 58603)
-- Name: pedido_adicionales pedido_adicionales_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_adicionales
    ADD CONSTRAINT pedido_adicionales_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 58608)
-- Name: pedido_platos pedido_platos_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_platos
    ADD CONSTRAINT pedido_platos_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 58613)
-- Name: pedido_platos pedido_platos_plato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_platos
    ADD CONSTRAINT pedido_platos_plato_id_fkey FOREIGN KEY (plato_id) REFERENCES public.platos(id) ON DELETE RESTRICT;


--
-- TOC entry 4940 (class 2606 OID 58618)
-- Name: pedidos pedidos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- TOC entry 4941 (class 2606 OID 66288)
-- Name: pedidos pedidos_mesero_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_mesero_id_fkey FOREIGN KEY (mesero_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4942 (class 2606 OID 58628)
-- Name: pedidos pedidos_payment_method_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_payment_method_fkey FOREIGN KEY (payment_method) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- TOC entry 4943 (class 2606 OID 58633)
-- Name: pedidos pedidos_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_status(id) ON DELETE RESTRICT;


--
-- TOC entry 4948 (class 2606 OID 58658)
-- Name: usuarios usuarios_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


-- Completed on 2025-06-01 22:53:05

--
-- PostgreSQL database dump complete
--

