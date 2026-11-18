const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mainNav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

// O servidor opcional (server.js) consulta a API oficial do Instagram.
// Sem ele, o site continua funcionando e mostra um link para o perfil oficial.
async function carregarInstagram() {
  const grid = document.getElementById('instagramFeed');
  const status = document.getElementById('feedStatus');
  try {
    const resposta = await fetch('/api/instagram/posts');
    if (!resposta.ok) throw new Error('Feed ainda não configurado');
    const dados = await resposta.json();
    const posts = dados.data || [];
    if (!posts.length) throw new Error('Nenhuma publicação disponível no momento');
    grid.innerHTML = '';
    posts.slice(0, 8).forEach(post => {
      const link = document.createElement('a');
      link.className = 'insta-card'; link.href = post.permalink;
      link.target = '_blank'; link.rel = 'noopener';
      const media = document.createElement(post.media_type === 'VIDEO' ? 'video' : 'img');
      media.src = post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url;
      media.alt = 'Publicação da Igreja Batista do Avivamento no Instagram';
      if (media.tagName === 'VIDEO') { media.muted = true; media.playsInline = true; media.controls = false; }
      link.appendChild(media);
      const legenda = document.createElement('span');
      legenda.textContent = (post.caption || 'Confira esta publicação no Instagram').slice(0, 105);
      link.appendChild(legenda); grid.appendChild(link);
    });
    status.textContent = 'Publicações recentes do Instagram. Toque em uma imagem para abrir o post original.';
  } catch (erro) {
    grid.innerHTML = '<div class="feed-loading">Acompanhe as publicações e novidades diretamente no Instagram oficial <a href="https://www.instagram.com/iba.m12/" target="_blank" rel="noopener" style="color:#d9bd83">@iba.m12 ↗</a></div>';
    status.textContent = 'A integração automática será ativada quando as credenciais oficiais da conta forem configuradas.';
  }
}
carregarInstagram();

// Calendário mensal: cultos semanais e células sem horário fixo.
const calendarDays = document.getElementById('calendarDays');
if (calendarDays) {
  const monthTitle = document.getElementById('calendarMonth');
  const details = document.getElementById('calendarDetails');
  const today = new Date();
  let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function eventsFor(date) {
    const day = date.getDay();
    if (day === 3) return [{type:'culto', title:'Culto de quarta-feira', time:'19h30'}];
    if (day === 4) return [{type:'celula', title:'Célula', time:'Horário definido pelo líder de cada célula'}];
    if (day === 0) return [{type:'culto', title:'Culto de domingo', time:'17h'}];
    return [];
  }
  function showDetails(date) {
    const events = eventsFor(date);
    details.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = dateFormatter.format(date);
    details.appendChild(heading);
    if (!events.length) {
      const p = document.createElement('p');
      p.textContent = 'Nenhuma programação semanal fixa para esta data. Eventos especiais serão anunciados por aqui.';
      details.appendChild(p);
      return;
    }
    events.forEach(event => {
      const p = document.createElement('p');
      p.textContent = event.title + ' · ' + event.time;
      details.appendChild(p);
    });
  }
  function renderCalendar() {
    monthTitle.textContent = monthFormatter.format(shownMonth);
    calendarDays.innerHTML = '';
    const firstWeekday = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth()+1, 0).getDate();
    for (let i=0; i<firstWeekday; i++) {
      const blank = document.createElement('div'); blank.className = 'calendar-day empty'; blank.setAttribute('aria-hidden','true'); calendarDays.appendChild(blank);
    }
    for (let day=1; day<=daysInMonth; day++) {
      const date = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), day);
      const cell = document.createElement('button');
      cell.type = 'button'; cell.className = 'calendar-day';
      if (date.toDateString() === today.toDateString()) cell.classList.add('today');
      if (date.toDateString() === selectedDate.toDateString()) cell.classList.add('selected');
      const number = document.createElement('span'); number.className='day-number'; number.textContent=day; cell.appendChild(number);
      eventsFor(date).forEach(event => {
        const label = document.createElement('span'); label.className='day-event '+event.type;
        label.textContent = event.type === 'celula' ? 'Célula' : 'Culto'; cell.appendChild(label);
      });
      cell.setAttribute('aria-label', dateFormatter.format(date));
      cell.addEventListener('click', () => { selectedDate = date; renderCalendar(); showDetails(date); });
      calendarDays.appendChild(cell);
    }
  }
  document.getElementById('prevMonth').addEventListener('click', () => { shownMonth.setMonth(shownMonth.getMonth()-1); renderCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', () => { shownMonth.setMonth(shownMonth.getMonth()+1); renderCalendar(); });
  renderCalendar();
  showDetails(selectedDate);
}
