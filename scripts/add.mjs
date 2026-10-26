#!/usr/bin/env node
// Adds reviewed candidates to data/videos.json, filling the facts from the
// creator's post (FxTwitter public JSON), then rebuilds the READMEs.
//
//   node scripts/add.mjs candidates.json
//
// candidates.json: [{ "handle", "id", "title", "titleZh", "category", "models": [...],
//                     "prompt"?, "promptUrl"? }]  or  [{ "handle", "id", "reject": "reason" }]
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'))
const write = (p, v) => writeFileSync(new URL(p, root), JSON.stringify(v, null, 2) + '\n')

const videos = read('data/videos.json')
const rejected = read('data/rejected.json')
const meta = read('data/collection.json')
const known = new Set([...videos.map((v) => v.id), ...rejected.map((r) => r.id)])
const cands = JSON.parse(readFileSync(process.argv[2], 'utf8'))

let added = 0
for (const c of cands) {
  const tag = `@${c.handle}/${c.id}`
  if (known.has(c.id)) { console.log(`skip ${tag}: already listed or rejected`); continue }
  if (c.reject) { rejected.push({ id: c.id, handle: c.handle, reason: c.reject }); known.add(c.id); console.log(`reject ${tag}: ${c.reject}`); continue }
  const res = await fetch(`https://api.fxtwitter.com/${c.handle}/status/${c.id}`)
  if (!res.ok) { console.log(`skip ${tag}: fxtwitter ${res.status}`); continue }
  const tw = (await res.json()).tweet
  const media = (tw?.media?.all ?? []).find((m) => m.type === 'video' || m.type === 'gif')
  if (!media) { console.log(`skip ${tag}: no video`); continue }
  const handle = tw.author.screen_name
  const entry = {
    id: c.id, handle, name: tw.author.name, url: `https://x.com/${handle}/status/${c.id}`,
    date: new Date(tw.created_timestamp * 1000).toISOString().slice(0, 10),
    title: c.title, titleZh: c.titleZh, category: c.category, models: c.models ?? [],
    text: tw.text, thumb: media.thumbnail_url,
  }
  if (media.duration) entry.duration = Math.round(media.duration * 10) / 10
  if (c.prompt) { entry.prompt = c.prompt; entry.promptUrl = c.promptUrl }
  videos.push(entry); known.add(c.id); added++
  console.log(`add ${tag}: ${c.title}`)
}

if (added) meta.updated = new Date().toISOString().slice(0, 10)
write('data/videos.json', videos)
write('data/rejected.json', rejected)
write('data/collection.json', meta)
execFileSync('node', [new URL('scripts/build.mjs', root).pathname], { stdio: 'inherit' })
console.log(`${added} added`)
