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