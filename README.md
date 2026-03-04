# SABINAS — Bienestar · Medicina Tradicional · Bacalar

> *Un rezo a las aguas, a la memoria y a cada encuentro que hace especial nuestras vidas.*

![SABINAS](assets/images/hero.png)

## ¿Qué es SABINAS?

Single Page Application (SPA) para **Sabinas**, espacio holístico de bienestar y medicina tradicional ubicado en Bacalar, Quintana Roo, México. Diseño terrenal, minimalista y fluido — sin esoterismos saturados.

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | Vanilla HTML · CSS · JavaScript (ES Modules) |
| Base de datos | [Supabase](https://supabase.com) (PostgreSQL) |
| Hosting | Estático — cualquier servidor HTTP |
| i18n | Español 🇲🇽 · Inglés 🇬🇧 (desde Supabase) |

---

## Funcionalidades

- **Oráculo de Servicios** — Spotlight search + cuestionario de 5 pasos con recomendación personalizada
- **33 servicios** categorizados (cuerpo / espíritu / mente) con reserva directa por WhatsApp
- **i18n reactivo** — cambio de idioma instantáneo sin recarga
- **Calendario interactivo** — mini-cal en footer + modal expandido con fechas bloqueadas desde DB
- **Scroll fluido** con parallax y efectos magnéticos
- **Sponsors dinámicos** desde base de datos (marquee infinito)
- **Modal/Iframe global** — preparado para inyectar URLs de contenido externo

---

## Estructura del Proyecto

```
Sabinas/
├── index.html              # Única página (SPA)
├── config/
│   ├── config.example.js   # ⬅ Plantilla (copiar → config.js)
│   └── config.js           # 🔐 GITIGNOREADO — claves reales
├── js/
│   ├── app.js              # Bootstrap: carga datos de Supabase
│   ├── supabase.js         # Cliente Supabase + helpers
│   ├── i18n.js             # Internacionalización (desde DB)
│   ├── oracle.js           # Oráculo: spotlight + cuestionario
│   ├── calendar.js         # Calendario interactivo
│   ├── scroll.js           # Scroll suave + parallax
│   └── magnetic.js         # Efectos magnéticos en botones
├── css/
│   ├── tokens.css          # Variables de diseño (colores, tipografía)
│   ├── main.css            # Estilos principales
│   ├── components.css      # Componentes: oracle, calendar, modal
│   └── animations.css      # Keyframes y transiciones
├── locales/
│   ├── es.json             # Fallback español (si Supabase no responde)
│   └── en.json             # Fallback inglés
├── assets/
│   └── images/             # hero.png, logo.png, roni.png
└── DOCS/
    └── supabase_migration.sql  # Migración completa de BD
```

---

## Setup Local

### 1. Clonar el repo

```bash
git clone https://github.com/RoniSabinasMx/Sabinas-MX.git
cd Sabinas-MX
```

### 2. Configurar credenciales Supabase

```bash
cp config/config.example.js config/config.js
```

Edita `config/config.js`:

```js
window.SABINAS_CONFIG = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseKey: 'TU_PUBLISHABLE_KEY'
};
```

### 3. Levantar servidor local

```bash
python -m http.server 8000
# → http://127.0.0.1:8000
```

> ⚠️ **Abrir siempre desde el servidor HTTP**, nunca con doble clic en `index.html` — los archivos JSON y ES Modules requieren `http://` por seguridad del navegador (CORS).

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Contenido |
|---|---|
| `services` | 33 servicios (nombre ES/EN, categoría, WA, duración...) |
| `locale_strings` | Todos los textos del sitio en ES + EN |
| `sponsors` | Patrocinadores del marquee |
| `settings` | Número de WhatsApp, fechas bloqueadas |

### Migración inicial

Si necesitas reconstruir la BD desde cero:

```
Supabase Dashboard → SQL Editor → Pega el contenido de DOCS/supabase_migration.sql → Run
```

### RLS (Row Level Security)

Todas las tablas tienen RLS habilitado con política de **solo lectura pública**. No es posible escribir desde el frontend con la clave anon/publishable.

---

## Internacionalización (i18n)

El sitio carga los textos en el orden siguiente:

1. **Supabase** `locale_strings` (fuente principal)
2. **Fallback** `locales/es.json` / `locales/en.json` (si Supabase no responde)

Para editar textos → modifica directamente en [Supabase Table Editor](https://supabase.com/dashboard/project/ejtxpkmrsqcdekyckked/editor).

---

## Agregar / Editar Servicios

Desde el [Table Editor de Supabase](https://supabase.com/dashboard/project/ejtxpkmrsqcdekyckked/editor) → tabla `services`:

| Campo | Descripción |
|---|---|
| `id` | Slug único (ej. `nuevo-servicio`) |
| `name_es` / `name_en` | Nombre en cada idioma |
| `category` | `cuerpo`, `espiritu` o `mente` |
| `modality` | Array: `{indiv}`, `{pareja}`, `{grupal}` |
| `intensity` | `suave`, `medio` o `total` |
| `element` | `agua`, `aire`, `fuego`, `tierra` o `eter` |
| `duration` | Texto libre (ej. `90 min`) |
| `wa_es` / `wa_en` | Mensaje WhatsApp pre-redactado |
| `sort_order` | Orden en el oráculo |

---

## Seguridad

- `config/config.js` está en `.gitignore` — **nunca se sube al repo**
- La `publishable key` de Supabase es segura en el navegador gracias a RLS
- No existe ninguna `service_role key` en el frontend

---

## Contacto

**Roni Sabinas** · Bacalar, Quintana Roo, México  
📞 +52 984 180 2741 · 📧 hola@sabinas.mx  
🌐 [sabinas.mx](https://sabinas.mx) *(próximamente)*

---

*Hecho con 🌿 amor a las raíces.*
