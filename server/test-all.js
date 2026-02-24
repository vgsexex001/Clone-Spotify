// Full Audit & Test Script for Spotify Clone Backend
const BASE = 'http://localhost:3001/api/v1';
let TOKEN = '';
let PLAYLIST_ID = '';
let passed = 0;
let failed = 0;
const results = [];

function log(ok, msg) {
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${msg}`);
  results.push({ ok, msg });
  if (ok) passed++; else failed++;
}

async function safeFetch(url, opts = {}) {
  try {
    return await fetch(url, opts);
  } catch (e) {
    return { ok: false, status: 0, statusText: e.message, headers: new Headers(), text: async () => e.message, json: async () => ({ error: e.message }) };
  }
}

async function req(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (TOKEN && !headers.Authorization) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }
  const res = await safeFetch(url, { ...opts, headers });
  const text = typeof res.text === 'function' ? await res.text() : '';
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, ok: res.ok };
}

async function testExternalAPIs() {
  console.log('\n=== FASE 1: APIs Externas ===\n');

  // Deezer Search
  try {
    const res = await safeFetch('https://api.deezer.com/search?q=Coldplay&limit=3');
    const d = await res.json();
    const hasTracks = d.data && d.data.length > 0;
    log(hasTracks, `Deezer Search: ${hasTracks ? d.data.length + ' tracks' : 'VAZIO'}`);
    if (hasTracks) {
      const t = d.data[0];
      log(!!t.preview, `Deezer Preview URL: ${t.preview ? t.preview.substring(0, 50) + '...' : 'MISSING'}`);
      log(!!t.album?.cover_medium, `Deezer Cover: present`);
    }
  } catch (e) { log(false, `Deezer Search ERRO: ${e.message}`); }

  // Deezer Charts
  try {
    const res = await safeFetch('https://api.deezer.com/chart/0/tracks?limit=3');
    const d = await res.json();
    log(d.data && d.data.length > 0, `Deezer Charts: ${d.data?.length || 0} tracks`);
  } catch (e) { log(false, `Deezer Charts ERRO: ${e.message}`); }

  // Deezer Artist
  try {
    const res = await safeFetch('https://api.deezer.com/artist/13');
    const d = await res.json();
    log(!!d.name, `Deezer Artist: ${d.name || 'FAILED'} | Fans: ${d.nb_fan || 0}`);
  } catch (e) { log(false, `Deezer Artist ERRO: ${e.message}`); }

  // Preview URL playable
  try {
    const res = await safeFetch('https://api.deezer.com/search?q=Eminem&limit=1');
    const d = await res.json();
    const previewUrl = d.data?.[0]?.preview;
    if (previewUrl) {
      const audioRes = await safeFetch(previewUrl, { method: 'HEAD' });
      const ct = audioRes.headers?.get?.('content-type') || '';
      log(audioRes.ok && ct.includes('audio'), `Preview playable: status=${audioRes.status} type=${ct}`);
    } else {
      log(false, 'No preview URL to test');
    }
  } catch (e) { log(false, `Preview test ERRO: ${e.message}`); }
}

async function testServerHealth() {
  console.log('\n=== FASE 2: Servidor ===\n');

  try {
    const res = await safeFetch('http://localhost:3001/api/health');
    const d = await res.json();
    log(d.status === 'ok', `Health endpoint: ${JSON.stringify(d)}`);
  } catch (e) {
    log(false, `Server not running: ${e.message}`);
    console.log('\n  SERVIDOR NAO ESTA RODANDO. Inicie com: npm run dev\n');
    process.exit(1);
  }
}

async function testAuth() {
  console.log('\n=== FASE 3.1: Autenticação ===\n');

  // Signup
  const signup = await req('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: 'audit@test.com', username: 'AuditUser', password: 'audit123' }),
  });
  const signupOk = signup.data?.user || (signup.status === 409);
  log(signupOk, `Signup: ${signup.status === 409 ? 'user exists (OK)' : signup.data?.user ? 'user created' : 'FAILED ' + JSON.stringify(signup.data)}`);

  // Login — use safeFetch to get cookie header
  const loginRes = await safeFetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'audit@test.com', password: 'audit123' }),
  });
  const loginBody = await loginRes.json();
  log(!!loginBody?.user, `Login: ${loginBody?.user?.username || 'FAILED - ' + JSON.stringify(loginBody)}`);

  // Extract token from Set-Cookie
  const cookies = loginRes.headers?.get?.('set-cookie') || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  if (tokenMatch) {
    TOKEN = tokenMatch[1];
    log(true, `Token from cookie: ${TOKEN.substring(0, 20)}...`);
  } else {
    log(false, 'No token in Set-Cookie header');
  }

  // /me with token
  if (TOKEN) {
    const me = await req('/auth/me');
    log(!!me.data?.user, `Auth/me: ${me.data?.user?.username || 'FAILED - ' + JSON.stringify(me.data)}`);
  }

  // Invalid token should return 401
  const invalid = await req('/auth/me', {
    headers: { Authorization: 'Bearer invalidtoken123' },
  });
  log(invalid.status === 401, `Invalid token: status=${invalid.status} (expect 401)`);
}

async function testSearch() {
  console.log('\n=== FASE 3.2: Busca ===\n');

  const search = await req('/search?q=Coldplay&limit=5');
  log(search.data?.tracks?.length > 0, `Search tracks: ${search.data?.tracks?.length || 0} results`);
  log(search.data?.artists?.length > 0, `Search artists: ${search.data?.artists?.length || 0} results`);
  log(search.data?.albums?.length > 0, `Search albums: ${search.data?.albums?.length || 0} results`);

  if (search.data?.tracks?.[0]) {
    const t = search.data.tracks[0];
    log(!!t.previewUrl, `Track has previewUrl: ${t.previewUrl ? 'yes' : 'NO'}`);
    log(!!t.albumCover, `Track has albumCover: ${t.albumCover ? 'yes' : 'NO'}`);
    log(t.duration > 0, `Track has duration: ${t.duration}s`);
    log(!!t.source, `Track has source: ${t.source}`);
  }

  // Empty search
  const empty = await req('/search?q=xyznonexistent99999');
  log(empty.status === 200, `Empty search returns 200: status=${empty.status}`);

  // BR artist
  const br = await req('/search?q=Raffa+Moreira&limit=3');
  log(br.data?.tracks?.length > 0, `BR search: ${br.data?.tracks?.length || 0} results for Raffa Moreira`);
}

async function testMusicRoutes() {
  console.log('\n=== FASE 3.3: Music Routes ===\n');

  const charts = await req('/music/charts');
  log(charts.data?.tracks?.length > 0, `Charts: ${charts.data?.tracks?.length || 0} tracks`);
  log(charts.data?.artists?.length > 0, `Charts artists: ${charts.data?.artists?.length || 0}`);

  const discover = await req('/music/discover');
  log(discover.data?.trending?.length > 0, `Discover trending: ${discover.data?.trending?.length || 0} tracks`);

  const track = await req('/music/track/deezer/3135556');
  log(!!track.data?.title, `Track detail: ${track.data?.title || 'FAILED'} - ${track.data?.artist || ''}`);

  const artist = await req('/music/artist/deezer/13');
  log(!!artist.data?.name, `Artist detail: ${artist.data?.name || 'FAILED'}`);
  log(artist.data?.topTracks?.length > 0, `Artist top tracks: ${artist.data?.topTracks?.length || 0}`);

  const album = await req('/music/album/deezer/302127');
  log(!!album.data?.title, `Album detail: ${album.data?.title || 'FAILED'}`);
}

async function testPlaylists() {
  console.log('\n=== FASE 3.4: Playlists CRUD ===\n');

  if (!TOKEN) { log(false, 'Skipping playlists - no auth token'); return; }

  const create = await req('/user/playlists', {
    method: 'POST',
    body: JSON.stringify({ name: 'Audit Test Playlist', description: 'Created by audit script' }),
  });
  PLAYLIST_ID = create.data?.playlist?.id;
  log(!!PLAYLIST_ID, `Create playlist: ${PLAYLIST_ID ? 'id=' + PLAYLIST_ID : 'FAILED - ' + JSON.stringify(create.data)}`);

  const list = await req('/user/playlists');
  log(list.data?.playlists?.length > 0, `List playlists: ${list.data?.playlists?.length || 0}`);

  if (PLAYLIST_ID) {
    const add = await req(`/user/playlists/${PLAYLIST_ID}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        trackId: '3135556', source: 'deezer',
        title: 'Harder Better Faster Stronger', artist: 'Daft Punk',
        album: 'Discovery', albumCover: 'https://api.deezer.com/album/302127/image',
        previewUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fa9316d9e9e880d2c6207e92260-8.mp3',
        duration: 224,
      }),
    });
    log(add.data?.added || add.ok, `Add track to playlist: ${add.data?.added ? 'OK' : JSON.stringify(add.data)}`);

    const view = await req(`/user/playlists/${PLAYLIST_ID}`);
    log(view.data?.tracks?.length > 0, `View playlist tracks: ${view.data?.tracks?.length || 0}`);

    const update = await req(`/user/playlists/${PLAYLIST_ID}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Audit Renamed' }),
    });
    log(update.data?.playlist?.name === 'Audit Renamed', `Rename playlist: ${update.data?.playlist?.name || 'FAILED'}`);

    const remove = await req(`/user/playlists/${PLAYLIST_ID}/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({ trackId: '3135556', source: 'deezer' }),
    });
    log(remove.data?.removed || remove.ok, `Remove track: ${remove.data?.removed ? 'OK' : JSON.stringify(remove.data)}`);

    const del = await req(`/user/playlists/${PLAYLIST_ID}`, { method: 'DELETE' });
    log(del.data?.deleted || del.ok, `Delete playlist: ${del.data?.deleted ? 'OK' : JSON.stringify(del.data)}`);

    const verify = await req(`/user/playlists/${PLAYLIST_ID}`);
    log(verify.status === 404, `Verify deleted: status=${verify.status} (expect 404)`);
  }
}

async function testLikedSongs() {
  console.log('\n=== FASE 3.5: Liked Songs ===\n');

  if (!TOKEN) { log(false, 'Skipping likes - no auth token'); return; }

  const like = await req('/user/liked-songs', {
    method: 'POST',
    body: JSON.stringify({
      trackId: '3135556', source: 'deezer',
      title: 'Harder Better Faster Stronger', artist: 'Daft Punk',
      album: 'Discovery', albumCover: 'https://api.deezer.com/album/302127/image',
      previewUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fa9316d9e9e880d2c6207e92260-8.mp3',
      duration: 224,
    }),
  });
  log(like.ok, `Like song: ${like.ok ? 'OK' : JSON.stringify(like.data)}`);

  const check = await req('/user/liked-songs/check/deezer/3135556');
  log(check.data?.liked === true, `Check liked: ${JSON.stringify(check.data)}`);

  const listLiked = await req('/user/liked-songs');
  log(listLiked.data?.songs?.length > 0, `List liked: ${listLiked.data?.songs?.length || 0} songs`);

  const unlike = await req('/user/liked-songs', {
    method: 'DELETE',
    body: JSON.stringify({ trackId: '3135556', source: 'deezer' }),
  });
  log(unlike.ok, `Unlike: ${unlike.ok ? 'OK' : JSON.stringify(unlike.data)}`);

  const recheck = await req('/user/liked-songs/check/deezer/3135556');
  log(recheck.data?.liked === false, `Verify unliked: ${JSON.stringify(recheck.data)}`);
}

async function testHistory() {
  console.log('\n=== FASE 3.6: Histórico ===\n');

  if (!TOKEN) { log(false, 'Skipping history - no auth token'); return; }

  const record = await req('/user/history', {
    method: 'POST',
    body: JSON.stringify({
      trackId: '3135556', source: 'deezer',
      title: 'Harder Better Faster Stronger', artist: 'Daft Punk',
      album: 'Discovery', albumCover: 'https://api.deezer.com/album/302127/image',
      previewUrl: 'https://cdns-preview-d.dzcdn.net/stream/c-deda7fa9316d9e9e880d2c6207e92260-8.mp3',
      duration: 224,
    }),
  });
  log(record.ok, `Record history: ${record.ok ? 'OK' : JSON.stringify(record.data)}`);

  const listHist = await req('/user/history?limit=10');
  log(listHist.data?.history?.length > 0, `List history: ${listHist.data?.history?.length || 0} entries`);
}

async function testDailyMixes() {
  console.log('\n=== FASE 3.7: Daily Mixes ===\n');

  if (!TOKEN) { log(false, 'Skipping mixes - no auth token'); return; }

  const mixes = await req('/user/daily-mixes');
  log(mixes.ok, `Daily mixes endpoint: status=${mixes.status}`);
  if (mixes.data?.mixes?.length > 0) {
    log(true, `Has ${mixes.data.mixes.length} mixes`);
  } else {
    log(true, 'No mixes yet (new user, will generate on use)');
  }
}

async function main() {
  console.log('');
  console.log('='.repeat(50));
  console.log('  SPOTIFY CLONE — FULL AUDIT & TEST SUITE');
  console.log('='.repeat(50));

  await testExternalAPIs();
  await testServerHealth();
  await testAuth();
  await testSearch();
  await testMusicRoutes();
  await testPlaylists();
  await testLikedSongs();
  await testHistory();
  await testDailyMixes();

  console.log('');
  console.log('='.repeat(50));
  console.log('  RELATORIO FINAL');
  console.log('='.repeat(50));
  console.log('');

  const failedTests = results.filter(r => !r.ok);
  console.log(`Total: ${results.length} testes`);
  console.log(`  Passou: ${passed}`);
  console.log(`  Falhou: ${failed}`);

  if (failedTests.length > 0) {
    console.log('\nFalhas:');
    failedTests.forEach(f => console.log(`  ❌ ${f.msg}`));
  }

  const pct = Math.round((passed / results.length) * 100);
  console.log(`\n${failed === 0 ? 'TUDO OK — Backend 100% funcional' : pct + '% OK — ' + failed + ' problema(s) a corrigir'}\n`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
