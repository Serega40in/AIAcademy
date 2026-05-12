// FEED
async function loadFeed() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, image_url, created_at, slug, profiles(name)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !posts || posts.length === 0) return; // keep empty state

  const feed = document.getElementById('feed');
  feed.innerHTML = posts.map(p => {
    const name     = p.profiles?.name || 'Аноним';
    const initials = name.slice(0,2).toUpperCase();
    const date     = new Date(p.created_at).toLocaleDateString('ru-RU', { day:'numeric', month:'long' });
    const excerpt  = p.content.replace(/<[^>]+>/g,'').slice(0, 200);
    const imgTag   = p.image_url ? `<img class="post-img" src="${p.image_url}" alt="">` : '';
    return `
      <a class="post-card" href="post.html?slug=${p.slug}">
        <div class="post-meta">
          <div class="avatar">${initials}</div>
          <span class="author">${name}</span>
          <span class="date">${date}</span>
        </div>
        <div class="post-title">${p.title}</div>
        <div class="post-excerpt">${excerpt}</div>
        ${imgTag}
        <div class="post-footer">
          <span class="read-link">Читать →</span>
        </div>
      </a>`;
  }).join('');
}

loadFeed();
