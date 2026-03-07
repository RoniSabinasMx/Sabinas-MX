export function initCalendar() {
  const trigger = document.getElementById('calendar-trigger');
  const overlay = document.getElementById('calendar-overlay');
  const closeBtn = document.getElementById('close-calendar');

  if (!trigger || !overlay) return;

  trigger.addEventListener('click', () => overlay.classList.add('active'));
  closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });

  renderCalendar();
}

function renderCalendar() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  const mini = document.getElementById('mini-cal');
  const full = document.getElementById('full-cal');

  function buildGrid(container, y, m) {
    const waNum = window._waNumber || '521234567890';
    const disabled = window._disabledDates || [];

    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const monthName = new Date(y, m, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    let html = `
      <div class="cal-nav">
        <button class="cal-arrow" id="cal-prev">‹</button>
        <span class="cal-month-label">${monthName}</span>
        <button class="cal-arrow" id="cal-next">›</button>
      </div>
      <div class="cal-weekdays">
        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
      </div>
      <div class="cal-grid">
    `;
    // Empty cells
    for (let i = 0; i < firstDay; i++) html += `<span></span>`;
    for (let d = 1; d <= days; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = disabled.includes(dateStr);
      const isToday = (d === now.getDate() && m === now.getMonth() && y === now.getFullYear());
      const isPast = new Date(y, m, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      html += `<button class="cal-day ${isToday ? 'today' : ''} ${isDisabled || isPast ? 'disabled' : ''}"
                        data-date="${dateStr}" ${isDisabled || isPast ? 'disabled' : ''}>
                  ${d}
               </button>`;
    }
    html += '</div>';

    container.innerHTML = html;

    container.querySelector('#cal-prev').addEventListener('click', () => {
      if (m === 0) { m = 11; y--; } else { m--; }
      buildGrid(container, y, m);
    });
    container.querySelector('#cal-next').addEventListener('click', () => {
      if (m === 11) { m = 0; y++; } else { m++; }
      buildGrid(container, y, m);
    });

    container.querySelectorAll('.cal-day:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const date = btn.dataset.date;
        const pretty = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        showDateFlow(date, pretty, waNum);
      });
    });
  }

  if (mini) buildGrid(mini, year, month);
  buildGrid(full, year, month);
}

function showDateFlow(date, pretty, waNum) {
  const overlay = document.getElementById('calendar-overlay');
  const full = document.getElementById('full-cal');

  full.innerHTML = `
    <h3 style="margin-bottom:1.5rem;font-family:var(--font-display);font-size:1.8rem">
      ${pretty}
    </h3>
    <p style="color:var(--clr-text-muted);margin-bottom:2rem">¿Qué experiencia deseas vivir en esta fecha?</p>
    <input id="flow-name" placeholder="Tu nombre" class="flow-input">
    <input id="flow-people" placeholder="¿Cuántas personas?" type="number" min="1" max="20" class="flow-input">
    <select id="flow-time" class="flow-input">
      <option value="">Horario preferido…</option>
      <option>08:00 – 10:00</option>
      <option>10:00 – 12:00</option>
      <option>12:00 – 14:00</option>
      <option>14:00 – 16:00</option>
      <option>16:00 – 18:00</option>
    </select>
    <textarea id="flow-service" placeholder="¿Qué servicio te interesa? (opcional)" class="flow-input" rows="2"></textarea>
    <a href="https://wa.me/${waNum}" id="date-wa-btn" target="_blank" rel="noopener" class="wa-btn" style="display:block; text-align:center; margin-top:1.5rem">
        Reservar por WhatsApp ↗
    </a>
    <button class="q-restart" onclick="document.getElementById('full-cal').innerHTML=''; window._rebuildCal && window._rebuildCal()">
      ← Volver al calendario
    </button>
  `;

  window._rebuildCal = () => { document.getElementById('calendar-overlay').classList.remove('active'); };

  const waBtn = full.querySelector('#date-wa-btn');
  function updateWA() {
    const name = full.querySelector('#flow-name').value || 'Visitante';
    const people = full.querySelector('#flow-people').value || '1';
    const time = full.querySelector('#flow-time').value || 'por confirmar';
    const svc = full.querySelector('#flow-service').value || '';
    const msg = `Hola Roni 🌿 Soy *${name}*, me gustaría reservar una experiencia en Sabinas.\n📅 Fecha: *${pretty}*\n⏰ Horario: *${time}*\n👥 Personas: *${people}*${svc ? '\n✨ Servicio: ' + svc : ''}`;
    const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

    if (waBtn) waBtn.href = waHref;
  }
  full.querySelectorAll('.flow-input').forEach(el => el.addEventListener('input', updateWA));
  updateWA();
}

function showEventFlow(event, waNum) {
  const overlay = document.getElementById('calendar-overlay');
  const full = document.getElementById('full-cal');
  const lang = document.getElementById('lang-toggle').textContent.startsWith('ESP') ? 'es' : 'en';

  // Ensure calendar is open (if triggered from mini)
  overlay.classList.add('active');

  const title = lang === 'es' ? event.title_es : (event.title_en || event.title_es);
  const desc = lang === 'es' ? event.description_es : (event.description_en || event.description_es);
  const prettyDate = new Date(event.date + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  let isFull = false;
  let capacityText = '';
  if (event.capacity_total > 0) {
    if (event.capacity_booked >= event.capacity_total) {
      isFull = true;
      capacityText = lang === 'es' ? 'Cupo Lleno' : 'Fully Booked';
    } else {
      capacityText = lang === 'es'
        ? `${event.capacity_total - event.capacity_booked} lugares disponibles`
        : `${event.capacity_total - event.capacity_booked} spots remaining`;
    }
  }

  const { supabaseUrl } = window.SABINAS_CONFIG || {};
  const imgHtml = event.image_url && supabaseUrl
    ? `<div style="margin:-2rem -2rem 1.5rem -2rem; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0;">
             <img src="${supabaseUrl}/storage/v1/object/public/event-images/${event.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${title}" />
           </div>`
    : '';

  const msg = lang === 'es'
    ? `Hola Roni 🌿 Me gustaría reservar un lugar para el evento *${title}* el día ${prettyDate}.`
    : `Hi Roni 🌿 I would like to book a spot for the event *${title}* on ${prettyDate}.`;

  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

  let capacityHtml = '';
  let btnHtml = '';

  if (isFull) {
    capacityHtml = `<p style="color:var(--clr-danger); font-size:0.85rem; margin-top:1rem; font-weight:600;">⭕ Cupo Lleno</p>`;
    btnHtml = `
        <a href="https://wa.me/${waNum}?text=${encodeURIComponent(lang === 'es' ? `Hola Roni, vi que el evento ${title} está lleno, ¿me puedes anotar en lista de espera?` : `Hi Roni, I saw ${title} is full. Can I join the waitlist?`)}" 
           target="_blank" rel="noopener" class="wa-btn" style="display:block; text-align:center; background: var(--clr-border); color: var(--clr-text-muted);">
          ${lang === 'es' ? 'Contactar para Lista de Espera ↗' : 'Contact for Waitlist ↗'}
        </a>
    `;
  } else {
    capacityHtml = `
        <div style="margin-top:2rem; background:rgba(0,0,0,0.03); border-radius:12px; padding:1rem; text-align:center;">
            <div style="font-size:1.5rem; font-family:var(--font-display); color:var(--clr-primary);">${event.capacity_total - event.capacity_booked}</div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--clr-text-muted);">${lang === 'es' ? 'lugares disponibles' : 'spots available'}</div>
        </div>
    `;
    btnHtml = `
        <a href="${waHref}" target="_blank" rel="noopener" class="wa-btn" style="display:block; text-align:center;">
          ${lang === 'es' ? 'Reservar por WhatsApp ↗' : 'Book via WhatsApp ↗'}
        </a>
    `;
  }

  full.innerHTML = `
    ${imgHtml}
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <h3 style="margin-bottom:0.2rem;font-family:var(--font-display);font-size:1.6rem">${title}</h3>
        ${capacityText ? `<span style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 99px; background: ${isFull ? 'var(--clr-danger)' : 'var(--clr-accent-1)'}; color: ${isFull ? '#fff' : 'var(--clr-bg)'}; white-space: nowrap; margin-left: 1rem;">${capacityText}</span>` : ''}
    </div>
    
    <div style="font-size: 0.85rem; color: var(--clr-primary); margin-bottom: 1rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
        <span>📅 ${prettyDate}</span>
        ${event.time ? `<span>⏰ ${event.time.slice(0, 5)}</span>` : ''}
    </div>
    
    ${desc ? `<p style="color:var(--clr-text-muted);margin-bottom:2rem; line-height: 1.5; font-size: 0.95rem;">${desc.replace(/\\n/g, '<br>')}</p>` : ''}
    
    ${capacityHtml}
    ${btnHtml}
    
    <button class="q-restart" style="margin-top: 1.5rem;" onclick="document.getElementById('full-cal').innerHTML=''; window._rebuildCal && window._rebuildCal()">
      ← ${lang === 'es' ? 'Volver al calendario' : 'Back to calendar'}
    </button>
  `;

  window._rebuildCal = () => { renderCalendar() }; // just rebuild the grid
}
