-- ============================================================
-- SABINAS SPA — Database Schema & Seed
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id           TEXT PRIMARY KEY,
  name_es      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('cuerpo','espiritu','mente')),
  modality     TEXT[] NOT NULL DEFAULT '{}',
  intensity    TEXT NOT NULL CHECK (intensity IN ('suave','medio','total')),
  element      TEXT NOT NULL CHECK (element IN ('agua','aire','fuego','tierra','eter')),
  duration     TEXT NOT NULL,
  wa_es        TEXT NOT NULL DEFAULT '',
  wa_en        TEXT NOT NULL DEFAULT '',
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCALE STRINGS TABLE
CREATE TABLE IF NOT EXISTS public.locale_strings (
  key        TEXT NOT NULL,
  lang       TEXT NOT NULL CHECK (lang IN ('es','en')),
  value      TEXT NOT NULL,
  PRIMARY KEY (key, lang)
);

-- 3. SPONSORS TABLE
CREATE TABLE IF NOT EXISTS public.sponsors (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL DEFAULT '#',
  logo_url   TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL
);

-- ============================================================
-- ROW-LEVEL SECURITY (public read-only, no anonymous writes)
-- ============================================================
ALTER TABLE public.services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locale_strings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services"        ON public.services;
DROP POLICY IF EXISTS "public_read_locale_strings"  ON public.locale_strings;
DROP POLICY IF EXISTS "public_read_sponsors"        ON public.sponsors;
DROP POLICY IF EXISTS "public_read_settings"        ON public.settings;

CREATE POLICY "public_read_services"        ON public.services        FOR SELECT USING (true);
CREATE POLICY "public_read_locale_strings"  ON public.locale_strings  FOR SELECT USING (true);
CREATE POLICY "public_read_sponsors"        ON public.sponsors        FOR SELECT USING (true);
CREATE POLICY "public_read_settings"        ON public.settings        FOR SELECT USING (true);

-- ============================================================
-- SEED: SETTINGS
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
  ('whatsapp_number', '529841802741'),
  ('disabled_dates',  '[]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- SEED: SPONSORS
-- ============================================================
TRUNCATE public.sponsors;
INSERT INTO public.sponsors (name, url, sort_order) VALUES
  ('Laguna',  '#', 1),
  ('Amate',   '#', 2),
  ('Raíz',    '#', 3),
  ('Selva',   '#', 4),
  ('Tulum',   '#', 5),
  ('Bacalar', '#', 6);

-- ============================================================
-- SEED: SERVICES (33 services)
-- ============================================================
TRUNCATE public.services;
INSERT INTO public.services (id, name_es, name_en, category, modality, intensity, element, duration, wa_es, wa_en, sort_order) VALUES
('masaje-relajante','Masaje Relajante','Relaxing Massage','cuerpo',ARRAY['indiv'],'suave','agua','60 min','Hola Roni 🌿 Me gustaría reservar un *Masaje Relajante* (60 min). ¿Tienes disponibilidad para el día {{date}}?','Hello Roni 🌿 I''d like to book a *Relaxing Massage* (60 min). Is {{date}} available?',1),
('deep-tissue','Masaje Deep Tissue','Deep Tissue Massage','cuerpo',ARRAY['indiv'],'medio','tierra','75 min','Hola Roni 🌱 Quisiera reservar un *Masaje Deep Tissue* (75 min) para el {{date}}.','Hello Roni 🌱 I''d like to book a *Deep Tissue Massage* (75 min) on {{date}}.',2),
('masaje-holistico','Masaje Holístico Energético','Holistic Energy Massage','cuerpo',ARRAY['indiv'],'suave','eter','75 min','Hola Roni ✨ Me gustaría vivir el *Masaje Holístico Energético* el {{date}}.','Hello Roni ✨ I''d love to experience the *Holistic Energy Massage* on {{date}}.',3),
('masaje-piedra','Masaje Piedra Caliente','Hot Stone Massage','cuerpo',ARRAY['indiv'],'suave','fuego','90 min','Hola Roni 🔥 Quisiera reservar el *Masaje Piedra Caliente* (90 min) para el {{date}}.','Hello Roni 🔥 I''d like to book the *Hot Stone Massage* (90 min) on {{date}}.',4),
('masaje-mexicano','Masaje Mexicano','Mexican Massage','cuerpo',ARRAY['indiv'],'medio','tierra','75 min','Hola Roni 🌿 Me interesa el *Masaje Mexicano* para el {{date}}.','Hello Roni 🌿 I''m interested in the *Mexican Massage* on {{date}}.',5),
('masaje-thai','Masaje Thai','Thai Massage','cuerpo',ARRAY['indiv'],'medio','aire','90 min','Hola Roni 🌬️ Quisiera reservar el *Masaje Thai* para el {{date}}.','Hello Roni 🌬️ I''d like to book a *Thai Massage* on {{date}}.',6),
('masaje-espejo','Masaje Espejo 4 Manos','Mirror Massage 4 Hands','cuerpo',ARRAY['indiv','pareja'],'suave','agua','90 min','Hola Roni 🌊 Quisiera reservar el *Masaje Espejo 4 Manos* para el {{date}}.','Hello Roni 🌊 I''d like to book the *Mirror Massage 4 Hands* on {{date}}.',7),
('cacao-amor','Cacao Amor','Cacao Amor','espiritu',ARRAY['indiv','pareja'],'suave','fuego','2 hrs','Hola Roni 🍫 Me gustaría vivir la experiencia de *Cacao Amor* el {{date}}.','Hello Roni 🍫 I''d love to experience *Cacao Amor* on {{date}}.',8),
('sana-sana','Sana Sana','Sana Sana','cuerpo',ARRAY['indiv'],'suave','tierra','60 min','Hola Roni 🌿 Quisiera reservar *Sana Sana* para el {{date}}.','Hello Roni 🌿 I''d like to book *Sana Sana* on {{date}}.',9),
('exfoliacion','Exfoliación Profunda','Deep Exfoliation','cuerpo',ARRAY['indiv'],'suave','tierra','60 min','Hola Roni 🌱 Me gustaría una *Exfoliación Profunda* para el {{date}}.','Hello Roni 🌱 I''d like a *Deep Exfoliation* on {{date}}.',10),
('limpia','Limpia Tradicional','Traditional Limpia','espiritu',ARRAY['indiv','pareja','grupal'],'suave','tierra','45–90 min','Hola Roni 🌿 Quisiera una *Limpia Tradicional* para el {{date}}. (Personal / Pareja / Negocio / Proyecto)','Hello Roni 🌿 I''d like a *Traditional Limpia* on {{date}}. (Personal / Couple / Business / Project)',11),
('reiki','Reiki','Reiki','espiritu',ARRAY['indiv'],'suave','eter','60 min','Hola Roni ✨ Me gustaría una sesión de *Reiki* para el {{date}}.','Hello Roni ✨ I''d like a *Reiki* session on {{date}}.',12),
('biomagnetismo','Biomagnetismo','Biomagnetism','cuerpo',ARRAY['indiv'],'medio','tierra','75 min','Hola Roni 🌿 Quisiera reservar una sesión de *Biomagnetismo* para el {{date}}.','Hello Roni 🌿 I''d like to book a *Biomagnetism* session on {{date}}.',13),
('barra-access','Barra de Access','Access Bars','espiritu',ARRAY['indiv'],'suave','eter','60 min','Hola Roni ✨ Me gustaría reservar *Barra de Access* para el {{date}}.','Hello Roni ✨ I''d like to book *Access Bars* on {{date}}.',14),
('janzu','Janzu','Janzu','cuerpo',ARRAY['indiv'],'suave','agua','75 min','Hola Roni 🌊 Quisiera vivir la experiencia de *Janzu* el {{date}}.','Hello Roni 🌊 I''d love to experience *Janzu* on {{date}}.',15),
('ritual-metamorfosis','Ritual METAMORFÓSIS – Cierre de Ciclos','Ritual METAMORPHOSIS – Closing Cycles','espiritu',ARRAY['indiv','pareja'],'total','fuego','3 hrs','Hola Roni 🔥 Me gustaría reservar el *Ritual Metamorfósis – Cierre de Ciclos* para el {{date}}.','Hello Roni 🔥 I''d like to book the *Ritual Metamorphosis – Closing Cycles* on {{date}}.',16),
('ritual-animales','Ritual Animales de Poder','Power Animals Ritual','espiritu',ARRAY['indiv','grupal'],'medio','tierra','2 hrs','Hola Roni 🌿 Quiero participar en el *Ritual Animales de Poder* del {{date}}.','Hello Roni 🌿 I''d like to join the *Power Animals Ritual* on {{date}}.',17),
('ritual-xochiquetzal','Ritual XOCHIQUETZAL','Ritual XOCHIQUETZAL','espiritu',ARRAY['grupal'],'medio','fuego','2 hrs','Hola Roni 🌸 Quisiera asistir al *Ritual Xochiquetzal* del {{date}}.','Hello Roni 🌸 I''d like to attend the *Ritual Xochiquetzal* on {{date}}.',18),
('aquaterra','AQUATERRA','AQUATERRA','espiritu',ARRAY['indiv','pareja','grupal'],'total','agua','3 hrs','Hola Roni 🌊 Me gustaría vivir *AQUATERRA* el {{date}}.','Hello Roni 🌊 I''d love to experience *AQUATERRA* on {{date}}.',19),
('ceremonia-union','Ceremonia Unión','Union Ceremony','espiritu',ARRAY['pareja','grupal'],'total','fuego','3 hrs','Hola Roni 🌿 Quisiera reservar la *Ceremonia Unión* para el {{date}}.','Hello Roni 🌿 I''d like to book the *Union Ceremony* on {{date}}.',20),
('consagracion-cacao','Consagración de Cacao','Cacao Consecration','espiritu',ARRAY['grupal'],'medio','fuego','2 hrs','Hola Roni 🍫 Me gustaría asistir a la *Consagración de Cacao* del {{date}}.','Hello Roni 🍫 I''d like to attend the *Cacao Consecration* on {{date}}.',21),
('ceremonia-vuelta-sol','Ceremonia Vuelta al Sol','Return to the Sun Ceremony','espiritu',ARRAY['grupal'],'total','fuego','4 hrs','Hola Roni ☀️ Quiero participar en la *Ceremonia Vuelta al Sol* del {{date}}.','Hello Roni ☀️ I''d like to join the *Return to the Sun Ceremony* on {{date}}.',22),
('baby-blessingway','Baby Blessingway','Baby Blessingway','espiritu',ARRAY['grupal'],'medio','agua','3 hrs','Hola Roni 🌸 Quisiera reservar un *Baby Blessingway* para el {{date}}.','Hello Roni 🌸 I''d like to book a *Baby Blessingway* on {{date}}.',23),
('aniversario-luna-miel','Aniversario – Luna de Miel','Anniversary – Honeymoon','espiritu',ARRAY['pareja'],'total','agua','4 hrs','Hola Roni 🌹 Quisiera reservar la experiencia *Aniversario – Luna de Miel* para el {{date}}.','Hello Roni 🌹 I''d like to book the *Anniversary – Honeymoon* experience on {{date}}.',24),
('temazcalli','TEMAZCALLI','TEMAZCALLI','espiritu',ARRAY['grupal','indiv'],'total','fuego','3 hrs','Hola Roni 🔥 Quisiera reservar el *Temazcalli* para el {{date}}.','Hello Roni 🔥 I''d like to book the *Temazcalli* on {{date}}.',25),
('yoga','Clases de Yoga 60''','Yoga Class 60''','mente',ARRAY['grupal','indiv'],'suave','aire','60 min','Hola Roni 🌬️ Quisiera reservar *Clases de Yoga* para el {{date}}.','Hello Roni 🌬️ I''d like to book a *Yoga Class* on {{date}}.',26),
('soundhealing','SOUNDHEALING 60''','SOUNDHEALING 60''','mente',ARRAY['grupal','indiv'],'suave','eter','60 min','Hola Roni ✨ Me gustaría reservar la sesión de *Soundhealing* del {{date}}.','Hello Roni ✨ I''d like to attend the *Soundhealing* session on {{date}}.',27),
('breathwork','BREATHWORK ICE BATH','BREATHWORK ICE BATH','cuerpo',ARRAY['grupal','indiv'],'total','agua','2 hrs','Hola Roni 💧 Quisiera participar en *Breathwork Ice Bath* el {{date}}.','Hello Roni 💧 I''d like to join *Breathwork Ice Bath* on {{date}}.',28),
('vuelo-rebozo','El Vuelo del Rebozo','The Flight of the Rebozo','espiritu',ARRAY['indiv'],'suave','aire','60 min','Hola Roni 🌬️ Me gustaría vivir *El Vuelo del Rebozo* el {{date}}.','Hello Roni 🌬️ I''d love to experience *The Flight of the Rebozo* on {{date}}.',29),
('alinearte-tribu','Alinearte en Tribu (Círculo de Rebozo)','Align in Tribe (Rebozo Circle)','espiritu',ARRAY['grupal'],'medio','tierra','2 hrs','Hola Roni 🌿 Quisiera asistir a *Alinearte en Tribu – Círculo de Rebozo* del {{date}}.','Hello Roni 🌿 I''d like to attend *Align in Tribe – Rebozo Circle* on {{date}}.',30),
('danza-acuatica','Danza Acuática con Mandalas 90''','Aquatic Dance with Mandalas 90''','espiritu',ARRAY['grupal','indiv'],'total','agua','90 min','Hola Roni 🌊 Me encantaría reservar la *Danza Acuática con Mandalas* para el {{date}}.','Hello Roni 🌊 I''d love to book *Aquatic Dance with Mandalas* on {{date}}.',31),
('renacer-laguna','Renacer en la Laguna','Rebirth in the Lagoon','espiritu',ARRAY['indiv','pareja'],'total','agua','2 hrs','Hola Roni 🌊 Quisiera vivir *Renacer en la Laguna* el {{date}}.','Hello Roni 🌊 I''d love to experience *Rebirth in the Lagoon* on {{date}}.',32),
('meditacion-amanecer','Meditación al Amanecer con Paddle / Kayak','Sunrise Meditation with Paddle / Kayak','mente',ARRAY['grupal','indiv'],'suave','agua','90 min','Hola Roni 🌅 Quisiera reservar la *Meditación al Amanecer con Paddle/Kayak* para el {{date}}.','Hello Roni 🌅 I''d like to book *Sunrise Meditation with Paddle/Kayak* on {{date}}.',33);

-- ============================================================
-- SEED: LOCALE STRINGS — Spanish
-- ============================================================
INSERT INTO public.locale_strings (key, lang, value) VALUES
('nav.agua','es','Agua'),
('nav.aire','es','Aire'),
('nav.fuego','es','Fuego'),
('nav.tierra','es','Tierra'),
('nav.eter','es','Éter'),
('hero.scroll_invite','es','Desliza para conectar'),
('about.title','es','Sabinas'),
('about.subtitle','es','Bienestar · Medicina Tradicional · Bacalar'),
('about.description','es','Sabinas es una visión sobre el tejido y la unión de los saberes desde las raíces que guían el cauce de las aguas. Un proyecto que intenta unir los sueños que nos permitan habitar nuestra Tierra con ternura y devoción. Es un rezo a las aguas, a la memoria y a cada encuentro que hace especial nuestras vidas.'),
('about.roni_title','es','Quién es Roni'),
('about.roni_sub','es','Originaria de las montañas de Oaxaca'),
('about.roni_description','es','Aprendió de sus abuelas y de su madre el arte del rebozo, la medicina de las plantas y la fuerza del rezo. Licenciada en Trabajo Social, especialista en educación ambiental, maestra en Antropología de la Salud, con estudios en medicina tradicional mexicana, Teosofía, permacultura, Astrología, ginecología natural, masoterapia, ashtanga yoga y saberes ancestrales. Ha sostenido círculos de mujeres, creado proyectos socioambientales y colaborado en ecoaldeas en México y Brasil.'),
('oracle.title','es','El Oráculo de Servicios'),
('oracle.via_a_title','es','Ya sé lo que quiero'),
('oracle.via_a_desc','es','Busca directamente la experiencia que resuena contigo.'),
('oracle.via_b_title','es','Descubre qué se aconseja para ti'),
('oracle.via_b_desc','es','Permite que el oráculo te guíe hacia tu medicina ideal.'),
('oracle.search_placeholder','es','Busca un servicio...'),
('oracle.no_results','es','No se encontraron servicios. Intenta con otra búsqueda.'),
('oracle.q1','es','¿Cómo deseas vivir esta experiencia?'),
('oracle.q1_a','es','En completa intimidad (Solo yo)'),
('oracle.q1_b','es','Con mi compañero/a de camino (Parejas)'),
('oracle.q1_c','es','En la energía de la comunidad (Grupal)'),
('oracle.q2','es','¿Hacia dónde necesita ir tu atención hoy?'),
('oracle.q2_a','es','Al cuerpo físico — masajes y liberación'),
('oracle.q2_b','es','Al espíritu y la energía — ceremonias'),
('oracle.q2_c','es','A la mente y el aprendizaje — talleres'),
('oracle.q3','es','¿Qué nivel de inmersión buscas?'),
('oracle.q3_a','es','Una pausa suave y restauradora (1-2 hrs)'),
('oracle.q3_b','es','Un trabajo profundo y transformador (medio día)'),
('oracle.q3_c','es','Una inmersión total (retiro / día completo)'),
('oracle.q4_cuerpo','es','¿Qué textura sanará mejor tu cuerpo hoy?'),
('oracle.q4_cuerpo_a','es','La fluidez del Agua — masajes fluidos, laguna'),
('oracle.q4_cuerpo_b','es','La contención de la Tierra — arcilla, presión profunda'),
('oracle.q4_cuerpo_c','es','El calor del Fuego — piedras calientes, vapor'),
('oracle.q4_espiritu','es','¿Qué forma de contacto buscas con lo sagrado?'),
('oracle.q4_espiritu_a','es','Fuego y transformación — temazcal, rezo'),
('oracle.q4_espiritu_b','es','Agua y pureza — ceremonias en la laguna'),
('oracle.q4_espiritu_c','es','Tierra y raíces — plantas, herbolaria'),
('oracle.q4_mente','es','¿Qué tipo de sabiduría te llama?'),
('oracle.q4_mente_a','es','Astros y tiempo — astrología, calendario maya'),
('oracle.q4_mente_b','es','Tierra y plantas — permacultura, herbolaria'),
('oracle.q4_mente_c','es','Cuerpo y movimiento — yoga, meditación'),
('oracle.q5','es','En una palabra, tu intención al salir de Sabinas será...'),
('oracle.q5_a','es','Enraizar'),
('oracle.q5_b','es','Soltar'),
('oracle.q5_c','es','Comprender'),
('oracle.q5_d','es','Renacer'),
('oracle.results_title','es','Tu medicina sugerida'),
('oracle.results_sub','es','El oráculo ha hablado. Estos caminos resuenan contigo:'),
('oracle.reserve_btn','es','Reservar por WhatsApp'),
('oracle.restart','es','Explorar de nuevo'),
('oracle.close','es','Cerrar'),
('footer.sponsors_title','es','Nuestros Aliados'),
('footer.col1_title','es','Nuestros Elementos'),
('footer.col2_title','es','Información General'),
('footer.col2_phone','es','+52 984 180 2741'),
('footer.col2_email','es','hola@sabinas.mx'),
('footer.col2_location','es','Bacalar, Quintana Roo, México'),
('footer.col2_hours','es','Lun – Sáb · 8:00 – 18:00'),
('footer.col3_title','es','Agenda tu Experiencia'),
('footer.colab_link','es','Colabora con nosotros'),
('footer.experience_link','es','Conserva tu experiencia'),
('footer.rights','es','Sabinas · Todos los derechos reservados')
ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- SEED: LOCALE STRINGS — English
-- ============================================================
INSERT INTO public.locale_strings (key, lang, value) VALUES
('nav.agua','en','Water'),
('nav.aire','en','Air'),
('nav.fuego','en','Fire'),
('nav.tierra','en','Earth'),
('nav.eter','en','Ether'),
('hero.scroll_invite','en','Scroll to connect'),
('about.title','en','Sabinas'),
('about.subtitle','en','Wellness · Traditional Medicine · Bacalar'),
('about.description','en','Sabinas is a vision of the weaving and union of knowledge from the roots that guide the flow of the waters. A project that attempts to unite the dreams that allow us to inhabit our Earth with tenderness and devotion. It is a prayer to the waters, to memory, and to every encounter that makes our lives special.'),
('about.roni_title','en','Who is Roni'),
('about.roni_sub','en','Originally from the mountains of Oaxaca'),
('about.roni_description','en','She learned from her grandmothers and her mother the art of the rebozo, plant medicine, and the strength of prayer. Licenciada in Social Work, specialist in environmental education, with a Master''s in Anthropology of Health. She has held women''s circles, created socio-environmental projects, and collaborated in eco-villages in Mexico and Brazil.'),
('oracle.title','en','The Service Oracle'),
('oracle.via_a_title','en','I know what I want'),
('oracle.via_a_desc','en','Search directly for the experience that resonates with you.'),
('oracle.via_b_title','en','Discover what is suggested for you'),
('oracle.via_b_desc','en','Let the oracle guide you toward your ideal medicine.'),
('oracle.search_placeholder','en','Search for a service…'),
('oracle.no_results','en','No services found. Try a different search.'),
('oracle.q1','en','How do you wish to live this experience?'),
('oracle.q1_a','en','In complete intimacy (Just me)'),
('oracle.q1_b','en','With my companion (Couples)'),
('oracle.q1_c','en','In the energy of the community (Group)'),
('oracle.q2','en','Where does your attention need to go today?'),
('oracle.q2_a','en','To the physical body — massages & release'),
('oracle.q2_b','en','To the spirit and energy — ceremonies'),
('oracle.q2_c','en','To the mind and learning — workshops'),
('oracle.q3','en','What level of immersion are you looking for?'),
('oracle.q3_a','en','A gentle, restorative pause (1–2 hrs)'),
('oracle.q3_b','en','Deep, transformative work (half day)'),
('oracle.q3_c','en','Total immersion (full experience)'),
('oracle.q4_cuerpo','en','What texture will best heal your body today?'),
('oracle.q4_cuerpo_a','en','The fluidity of Water — flowing, lagoon'),
('oracle.q4_cuerpo_b','en','The grounding of Earth — clay, deep pressure'),
('oracle.q4_cuerpo_c','en','The warmth of Fire — hot stones, steam'),
('oracle.q4_espiritu','en','What form of contact are you seeking with the sacred?'),
('oracle.q4_espiritu_a','en','Fire & transformation — temazcal, prayer'),
('oracle.q4_espiritu_b','en','Water & purity — lagoon ceremonies'),
('oracle.q4_espiritu_c','en','Earth & roots — plants, herbalism'),
('oracle.q4_mente','en','What kind of wisdom calls to you?'),
('oracle.q4_mente_a','en','Stars & time — astrology, Maya calendar'),
('oracle.q4_mente_b','en','Earth & plants — permaculture, herbs'),
('oracle.q4_mente_c','en','Body & movement — yoga, meditation'),
('oracle.q5','en','In one word, your intention when you leave Sabinas will be…'),
('oracle.q5_a','en','Root'),
('oracle.q5_b','en','Release'),
('oracle.q5_c','en','Understand'),
('oracle.q5_d','en','Rebirth'),
('oracle.results_title','en','Your suggested medicine'),
('oracle.results_sub','en','The oracle has spoken. These paths resonate with you:'),
('oracle.reserve_btn','en','Book via WhatsApp'),
('oracle.restart','en','Explore again'),
('oracle.close','en','Close'),
('footer.sponsors_title','en','Our Partners'),
('footer.col1_title','en','Our Elements'),
('footer.col2_title','en','General Information'),
('footer.col2_phone','en','+52 984 180 2741'),
('footer.col2_email','en','hola@sabinas.mx'),
('footer.col2_location','en','Bacalar, Quintana Roo, México'),
('footer.col2_hours','en','Mon – Sat · 8:00 – 18:00'),
('footer.col3_title','en','Schedule Your Experience'),
('footer.colab_link','en','Collaborate with us'),
('footer.experience_link','en','Preserve your experience'),
('footer.rights','en','Sabinas · All rights reserved')
ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
