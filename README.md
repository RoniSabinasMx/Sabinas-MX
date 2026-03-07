# SABINAS
### Bienestar · Medicina Tradicional · Bacalar

> *Un rezo a las aguas, a la memoria y a cada encuentro que hace especial nuestras vidas.*

---

## Descripción

Sitio web de **Sabinas**, espacio holístico de bienestar y medicina tradicional en Bacalar, Quintana Roo, México. Página de una sola pantalla (SPA) con búsqueda de servicios, oráculo de recomendaciones y reserva directa por WhatsApp — con un **panel de administración** visual y no-code para gestión de contenido.

---

## Stack

| Capa | Tecnología |
|---|---|
| Sitio público | HTML · CSS · JavaScript (ES Modules) |
| Panel de administración | Vue 3 · Vite · Pinia · Vue Router |
| Base de datos / Auth / Storage | Supabase (PostgreSQL + Auth + Storage) |
| i18n | Español · Inglés |

---

## Funcionalidades del sitio público

- **Header "Floating Pill" Ultra-lujo**: Cabecera centralizada con diseño *dark glassmorphism* interactivo, dotado de animación *scroll-reveal* post-Hero.
- **Interfaz 100% Responsiva (Mobile-First)**: Incluye un **Bottom Navigation Dock** inteligente que ancla de forma fija los íconos de elementos interactivos (PNG) en la parte inferior en celulares.
- Menú interactivo de Elementos (Agua, Aire, Fuego, Tierra, Éter) animados con físicas de **"Spatial Push"** (Antigravity).
- Spotlight search nativo sobre los 33 servicios disponibles con modales Fullscreen (`100vh`).
- Cuestionario / Oráculo de 5 pasos con recomendación personalizada por elemento.
- Reserva directa por WhatsApp pasando por un micro-formulario **"Bottom Sheet"** responsivo para capturar el nombre del huésped.
- Cambio de idioma (ES ↔ EN) sin recarga de página
- Calendario interactivo con fechas bloqueadas y soporte nativo para eventos presenciales con control de aforo programado
- Marquee de patrocinadores con tracking de clics desde base de datos
- Todo el contenido cargado dinámicamente desde Supabase

---

## Panel de Administración (`/admin`)

Aplicación Vue 3 visual y no-code. Diseño claro en tonos tierra/salvia, sin tablas — toda la información en tarjetas, galerías y acordeones.

### Módulos

| Módulo | Descripción |
|---|---|
| **🏠 Inicio** | Dashboard con métricas en tiempo real (mensajes nuevos, servicios activos, clics en patrocinadores) y accesos rápidos |
| **🌿 Servicios** | Galería de imágenes estilo Pinterest · Filtros por categoría (píldoras) · Wizard de 4 pasos · Imágenes desde Storage · i18n ES/EN |
| **✏️ Textos del Sitio** | 64+ strings agrupados en acordeones por sección (Hero, Oráculo, Servicios, Navegación, Footer) · Auto-guardado con debounce |
| **⭐ Patrocinadores** | Cards con logo desde Storage · Estadísticas de clics colapsables (Chart.js) |
| **⚙️ Configuración** | Número de WhatsApp · Calendario visual para bloqueo de fechas y creación de Eventos interactivo (con recurrencia y control de cupo) listado bajo demanda |
| **👥 Colaboradores (CRM)** | Kanban drag-and-drop · 3 estados · Tarjetas de contacto con acciones directas ✉️📱 · Empty states amigables |

### Seguridad

- Autenticación Supabase (RLS en todas las tablas — solo admin puede escribir)
- Credenciales en `.env` (nunca en el repositorio)
- Sanitización de inputs en todos los formularios
- Rate limiting / submit-lock para evitar doble envío
- `maxlength` en todos los campos de texto

---

## Estructura del proyecto

```
Sabinas/
├── index.html
├── config/
│   ├── config.example.js   ← Copiar a config.js y completar
│   └── config.js           ← GITIGNOREADO (credenciales locales)
├── js/
│   ├── app.js              ← Bootstrap principal
│   ├── supabase.js         ← Cliente Supabase
│   ├── i18n.js             ← Internacionalización
│   ├── oracle.js           ← Oráculo y spotlight
│   ├── calendar.js         ← Calendario y Eventos
│   ├── element.js          ← Renderizado por componente DOM inyectado para las agrupaciones por elementos
│   ├── scroll.js           ← Scroll y parallax
│   └── magnetic.js         ← Efectos de botones
├── css/
│   ├── tokens.css
│   ├── main.css
│   ├── components.css
│   └── animations.css
├── locales/
│   ├── es.json             ← Fallback español
│   └── en.json             ← Fallback inglés
├── assets/images/
├── admin/                  ← Panel de administración (Vue 3 + Vite)
│   ├── src/
│   │   ├── views/          ← HomeView, Services, LocaleStrings, Sponsors, Settings, CRM
│   │   ├── components/     ← ServiceModal, StorageImagePicker, Sidebar, LocaleRow, Toast
│   │   ├── stores/         ← auth.js, toast.js (Pinia)
│   │   ├── utils/          ← sanitize.js, rateLimit.js
│   │   └── lib/supabase.js
│   ├── .env                ← GITIGNOREADO (credenciales)
│   └── .env.example        ← Plantilla de credenciales
└── DOCS/
    ├── supabase_migration.sql
    └── admin_migration.sql
```

---

## Setup local

### Sitio público

**1. Clonar**
```bash
git clone https://github.com/RoniSabinasMx/Sabinas-MX.git
cd Sabinas-MX
```

**2. Configurar credenciales**
```bash
cp config/config.example.js config/config.js
```
Editar `config/config.js`:
```js
window.SABINAS_CONFIG = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseKey: 'TU_PUBLISHABLE_KEY'
};
```

**3. Levantar servidor**
```bash
npx http-server . -p 3000 --cors
```
Abrir → `http://localhost:3000`

> Abrir siempre desde el servidor HTTP, nunca con doble clic en `index.html`.

---

### Panel de administración

**1. Instalar dependencias**
```bash
cd admin
npm install
```

**2. Configurar credenciales**
```bash
cp .env.example .env
```
Editar `admin/.env`:
```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

**3. Levantar servidor de desarrollo**
```bash
npm run dev -- --host
```
Abrir → `http://localhost:5173`

**Credenciales de acceso:**
- Email: `admin@sabinas.mx`
- Password: configurada en Supabase Auth

---

## Base de datos (Supabase)

| Tabla | Contenido |
|---|---|
| `services` | 33 servicios (nombre ES/EN, descripción ES/EN, categoría, elemento, intensidad, modalidad, duración, slug, imagen, WhatsApp ES/EN) |
| `events` | Eventos del calendario (título, descripción, fecha, hora, elemento, cupo total, cupo reservado, imagen recurrencia) |
| `locale_strings` | Todos los textos del sitio en ES y EN |
| `sponsors` | Patrocinadores (nombre, URL, logo, descripción, clics) |
| `settings` | Número WhatsApp, fechas bloqueadas |
| `colaboradores_leads` | CRM de colaboradores (nombre, email, teléfono, mensaje, estado) |
| `products` | Productos y artesanías pre-configurados para futura integración E-commerce/MercadoLibre (precio, stock, estatus sinc.) |

**RLS:** Todas las tablas tienen lectura pública y escritura solo para usuarios autenticados.

Para reconstruir la BD desde cero, ejecutar en orden:
1. `DOCS/supabase_migration.sql` — tablas principales
2. `DOCS/admin_migration.sql` — tabla CRM + función RPC de clics

**Storage:** Bucket `sponsor-logos` para logos e imágenes (max 45 MB por archivo).

---

## Gestión de contenido

Todo el contenido se gestiona desde el **Panel de Administración** (`/admin`). No se requiere acceso directo a Supabase ni conocimientos técnicos.

---

## Contacto

Bacalar, Quintana Roo, México  
+52 984 180 2741 · hola@sabinas.mx
