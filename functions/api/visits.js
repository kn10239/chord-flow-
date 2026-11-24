// Counts successful online page loads, not unique visitors.
const response = (body, status=200) => Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
const increment = db => db.prepare("INSERT INTO visits (id, total) VALUES (1, 1) ON CONFLICT(id) DO UPDATE SET total = total + 1 RETURNING total").first();
export async function onRequestPost({request,env}) {
  const url = new URL(request.url);
  if(url.hostname !== "chordfl0w.pages.dev") return response({error:"production only"},403);
  const origin=request.headers.get("Origin");
  if((origin && origin!==url.origin) || request.headers.get("Sec-Fetch-Site")==="cross-site" || request.headers.get("X-Chord-Flow")!=="visit") return response({error:"forbidden"},403);
  if(!env.VISITS_DB) return response({error:"counter not configured"},503);
  try {
    let row;
    try { row=await increment(env.VISITS_DB); }
    catch(e) {
      if(!String(e).includes("no such table")) throw e;
      await env.VISITS_DB.prepare("CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY CHECK(id=1), total INTEGER NOT NULL DEFAULT 0 CHECK(total>=0))").run();
      row=await increment(env.VISITS_DB);
    }
    if(!Number.isSafeInteger(row?.total)) return response({error:"counter unavailable"},503);
    return response({total:row.total});
  } catch { return response({error:"counter unavailable"},503); }
}
export function onRequestGet(){return response({error:"use POST"},405);}
