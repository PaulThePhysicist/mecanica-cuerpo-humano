import fs from 'fs';
import path from 'path';

const htmlPath = path.join('Capitulos', 'Capitulo_1', 'capitulo1.html');
const outPath = path.join('webapp', 'src', 'chapters', 'cap1', 'Capitulo1Legacy.tsx');
const cssOutPath = path.join('webapp', 'src', 'chapters', 'cap1', 'legacy.css');

let content = fs.readFileSync(htmlPath, 'utf8');

// 1. Extract CSS
const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  let cssContent = styleMatch[1];
  // Remove font imports already in index.css
  cssContent = cssContent.replace(/@import.*?;/g, '');
  // Remove root vars already in index.css (optional, but harmless to overwrite)
  fs.writeFileSync(cssOutPath, cssContent);
  console.log('✅ Extracted legacy.css');
}

// 2. Extract HTML Body
const startIdx = content.indexOf('<!-- ═══════════ PORTADA ═══════════ -->');
const endIdx = content.indexOf('<!-- ═══════════ NAVEGACIÓN ═══════════ -->');
if (startIdx === -1 || endIdx === -1) {
  console.error('❌ Could not find slide boundaries');
  process.exit(1);
}

const bodyMatch = content.slice(startIdx, endIdx);

let html = bodyMatch;

// 3. Convert HTML to JSX
html = html.replace(/class=/g, 'className=');
html = html.replace(/for=/g, 'htmlFor=');

// Fix unclosed tags
html = html.replace(/<img(.*?)>/g, (match, p1) => {
  if (match.endsWith('/>')) return match;
  return `<img${p1}/>`;
});
html = html.replace(/<br>/g, '<br />');
html = html.replace(/<hr(.*?)>/g, (match, p1) => {
  if (match.endsWith('/>')) return match;
  return `<hr${p1}/>`;
});
html = html.replace(/<input(.*?)>/g, (match, p1) => {
  if (match.endsWith('/>')) return match;
  return `<input${p1}/>`;
});

// Inline styles conversion (basic)
// e.g. style="padding-left:1.2rem; margin-top:0.5rem;"
html = html.replace(/style="([^"]*)"/g, (match, p1) => {
  const styles = p1.split(';').filter(s => s.trim() !== '');
  const obj = {};
  styles.forEach(s => {
    let [key, val] = s.split(':');
    if (!key || !val) return;
    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[key] = val.trim().replace(/'/g, '"');
  });
  return `style={${JSON.stringify(obj)}}`;
});

// HTML comments to JSX comments
html = html.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Fix unescaped entities if any, or math formulas with {}
// Because kaTeX uses {} heavily in text, we might run into issues.
// Wait, the equations in the HTML are just text like `\frac{1}{2}`, but in JSX `{` and `}` are syntax.
// So we must wrap text containing `{` and `}` in `{"..."}` or replace with `&#123;` and `&#125;`.
html = html.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
// But our style objects just generated `{}`!
// Let's do the style replacement AFTER fixing `{}`.

let jsxHtml = bodyMatch;
// 1. Replace `{` and `}`
jsxHtml = jsxHtml.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
// Escape raw '<' and '>' characters but ONLY inside KaTeX math blocks \( ... \) and \[ ... \]
jsxHtml = jsxHtml.replace(/\\\([\s\S]*?\\\)/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
jsxHtml = jsxHtml.replace(/\\\[[\s\S]*?\\\]/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
// Also escape stray '<' that might not be in math but aren't tags
jsxHtml = jsxHtml.replace(/<(?![a-zA-Z/!]|\>)/g, '&lt;');

// 2. Do the other replacements
jsxHtml = jsxHtml.replace(/class=/g, 'className=');
jsxHtml = jsxHtml.replace(/for=/g, 'htmlFor=');
jsxHtml = jsxHtml.replace(/<img(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<img${p1}/>`));
jsxHtml = jsxHtml.replace(/<br>/g, '<br />');
jsxHtml = jsxHtml.replace(/<hr(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<hr${p1}/>`));
jsxHtml = jsxHtml.replace(/<input(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<input${p1}/>`));
jsxHtml = jsxHtml.replace(/onclick="([^"]*)"/g, "onClick={() => console.log('$1')}");
jsxHtml = jsxHtml.replace(/tabindex/g, 'tabIndex');
jsxHtml = jsxHtml.replace(/data-selected/g, 'data-selected'); // This is fine in React

jsxHtml = jsxHtml.replace(/style="([^"]*)"/g, (match, p1) => {
  const styles = p1.split(';').filter(s => s.trim() !== '');
  const obj = {};
  styles.forEach(s => {
    let [key, val] = s.split(':');
    if (!key || !val) return;
    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[key] = val.trim();
  });
  return `style={${JSON.stringify(obj)}}`;
});

jsxHtml = jsxHtml.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Images paths: src="imagenes/..." -> src="/assets/cap1/..."
jsxHtml = jsxHtml.replace(/src="imagenes\//g, 'src="/assets/cap1/');

// Revert the fake onclicks we added previously
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('goModule\((.*?)\)'\)\}/g, "onClick={() => goModule($1)}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('nextSlide\(\)'\)\}/g, "onClick={nextSlide}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('prevSlide\(\)'\)\}/g, "onClick={prevSlide}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('go\((.*?)\)'\)\}/g, "onClick={() => go($1)}");

// Inject dynamic active class for slides based on data-slide attribute
// Pattern 1: slide-full
jsxHtml = jsxHtml.replace(/<div className="slide-full(?: active)?" data-slide="(\d+)"/g, '<div className={`slide-full ${activeSlide === $1 ? "active" : ""}`} data-slide="$1"');
// Pattern 2: slide
jsxHtml = jsxHtml.replace(/<div className="slide(?: active)?" data-slide="(\d+)"/g, '<div className={`slide ${activeSlide === $1 ? "active" : ""}`} data-slide="$1"');

// Inject dynamic nav label
jsxHtml = jsxHtml.replace(/<span className="nav-module-label" id="navModuleLabel">(.*?)<\/span>/, '<span className="nav-module-label" id="navModuleLabel">{MODULES.find(m => m.slides.includes(activeSlide))?.name}</span>');
// Inject dynamic slide counter
jsxHtml = jsxHtml.replace(/<span className="slide-counter" id="slideCounter"(.*?)>1 \/ 17<\/span>/, '<span className="slide-counter" id="slideCounter"$1>{activeSlide + 1} / 17</span>');

// Replace Slide A1 placeholder with 3D AnatomyCanvas
jsxHtml = jsxHtml.replace(/<div className="scene-status" id="three-status-a1"[\s\S]*?<\/div>/, '<AnatomyCanvas />');

const componentCode = `import React, { useState } from 'react';
import AnatomyCanvas from './AnatomyCanvas';
import './legacy.css';

const MODULES = [
  {id:0, name:'Inicio',               slides:[0],       ico:'🏠'},
  {id:1, name:'A · Terminología',      slides:[1,2,3],   ico:'🧭'},
  {id:2, name:'B · Movimiento',        slides:[4,5,6,7], ico:'🦾'},
  {id:3, name:'C · Humano Estándar',   slides:[8,9,10,11,12], ico:'📐'},
  {id:4, name:'D · Escalamiento',      slides:[13,14,15,16], ico:'📈'}
];

export default function Capitulo1Legacy() {
  const [activeSlide, setActiveSlide] = useState(0);

  const goModule = (m) => setActiveSlide(MODULES[m].slides[0]);
  const nextSlide = () => setActiveSlide(s => Math.min(16, s + 1));
  const prevSlide = () => setActiveSlide(s => Math.max(0, s - 1));
  const go = (s) => setActiveSlide(s);

  return (
    <>
      ${jsxHtml}
    </>
  );
}
`;

fs.writeFileSync(outPath, componentCode);
console.log('✅ Generated Capitulo1Legacy.tsx');
