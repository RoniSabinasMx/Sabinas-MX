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
    <a id="flow-wa" href="#" target="_blank" rel="noopener" class="wa-btn" style="display:inline-block;margin-top:1rem">
      Confirmar por WhatsApp ↗
    </a>
    <button class="q-restart" onclick="document.getElementById('full-cal').innerHTML=''; window._rebuildCal && window._rebuildCal()">
      ← Volver al calendario
    </button>
  `;

    window._rebuildCal = () => { document.getElementById('calendar-overlay').classList.remove('active'); };

    const waLink = full.querySelector('#flow-wa');
    function updateWA() {
        const name = full.querySelector('#flow-name').value || 'Visitante';
        const people = full.querySelector('#flow-people').value || '1';
        const time = full.querySelector('#flow-time').value || 'por confirmar';
        const svc = full.querySelector('#flow-service').value || '';
        const msg = `Hola Roni 🌿 Soy *${name}*, me gustaría reservar una experiencia en Sabinas.\n📅 Fecha: *${pretty}*\n⏰ Horario: *${time}*\n👥 Personas: *${people}*${svc ? '\n✨ Servicio: ' + svc : ''}`;
        waLink.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    }
    full.querySelectorAll('.flow-input').forEach(el => el.addEventListener('input', updateWA));
    updateWA();
}
