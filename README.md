# SABINAS
### Bienestar · Medicina Tradicional · Bacalar

> *Un rezo a las aguas, a la memoria y a cada encuentro que hace especial nuestras vidas.*

---

## Descripción

Sitio web de **Sabinas**, espacio holístico de bienestar y medicina tradicional en Bacalar, Quintana Roo, México. Página de una sola pantalla (SPA) con búsqueda de servicios, oráculo de recomendaciones y reserva directa por WhatsApp.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML · CSS · JavaScript (ES Modules) |
| Base de datos | Supabase (PostgreSQL) |
| i18n | Español · Inglés |

---

## Funcionalidades

- Spotlight search sobre los 33 servicios disponibles
- Cuestionario de 5 pasos con recomendación personalizada
- Reserva directa por WhatsApp con mensaje pre-redactado
- Cambio de idioma (ES ↔ EN) sin recarga
- Calendario interactivo con fechas gestionadas desde base de datos
- Marquee de patrocinadores desde base de datos

---

## Estructura

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
│   ├── calendar.js         ← Calendario
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
└── DOCS/
    └── supabase_migration.sql
```

---

## Setup local

**1. Clonar**
```bash
git clone https://github.com/RoniSabinasMx/Sabinas-MX.git
cd Sabinas-MX
```

**2. Configurar credenciales**
```bash
cp config/config.example.js config/config.js
```
Editar `config/config.js` con los valores de Supabase:
```js
window.SABINAS_CONFIG = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseKey: 'TU_PUBLISHABLE_KEY'
};
```

**3. Levantar servidor**
```bash
python -m http.server 8000
```
Abrir → `http://127.0.0.1:8000`

> Abrir siempre desde el servidor HTTP, nunca con doble clic en `index.html`.

---

## Base de datos (Supabase)

| Tabla | Contenido |
|---|---|
| `services` | 33 servicios (ES + EN, categoría, WhatsApp, duración) |
| `locale_strings` | Textos del sitio en ES y EN |
| `sponsors` | Patrocinadores |
| `settings` | Número WhatsApp, fechas bloqueadas |

Para reconstruir la BD desde cero, ejecutar `DOCS/supabase_migration.sql` en el SQL Editor de Supabase.

Todas las tablas tienen **RLS habilitado** — solo lectura pública.

---

## Gestión de contenido

Los textos, servicios y sponsors se gestionan directamente desde el **Supabase Table Editor**, sin tocar código.

---

## Contacto

Bacalar, Quintana Roo, México  
+52 984 180 2741 · hola@sabinas.mx
