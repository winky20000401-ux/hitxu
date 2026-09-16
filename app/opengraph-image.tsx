import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GitGame — free browser games, guides and gaming news';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '76px', background: 'linear-gradient(135deg, #020617 0%, #0f172a 52%, #064e3b 100%)', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#34d399', fontSize: 34, fontWeight: 700 }}>GITGAME</div>
      <div style={{ display: 'flex', marginTop: 26, fontSize: 74, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-3px' }}>Games, guides<br />and gaming news.</div>
      <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#cbd5e1' }}>Play free browser mini games. No download required.</div>
    </div>, size,
  );
}
