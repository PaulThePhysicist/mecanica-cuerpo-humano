import fs from 'fs';
import path from 'path';

const htmlPath = path.join('Capitulos', 'Capitulo_1', 'capitulo1.html');
const slidesDir = path.join('webapp', 'src', 'chapters', 'cap1', 'slides');
const cap1Path = path.join('webapp', 'src', 'chapters', 'Capitulo1.tsx');

let content = fs.readFileSync(htmlPath, 'utf8');

// 1. Extract Slide Container Boundaries
const startIdx = content.indexOf('<!-- ═══════════ PORTADA ═══════════ -->');
const endIdx = content.indexOf('<!-- ═══════════ NAVEGACIÓN ═══════════ -->');
if (startIdx === -1 || endIdx === -1) {
  console.error('❌ Could not find slide boundaries');
  process.exit(1);
}
let bodyMatch = content.slice(startIdx, endIdx);

// 2. Perform HTML to JSX conversion
let jsxHtml = bodyMatch;

// Replace `{` and `}`
jsxHtml = jsxHtml.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

// Escape raw '<' and '>' characters but ONLY inside KaTeX math blocks \( ... \) and \[ ... \]
jsxHtml = jsxHtml.replace(/\\\([\s\S]*?\\\)/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
jsxHtml = jsxHtml.replace(/\\\[[\s\S]*?\\\]/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
// Also escape stray '<' that might not be in math but aren't tags or comments
jsxHtml = jsxHtml.replace(/<(?![a-zA-Z/!]|\>)/g, '&lt;');

jsxHtml = jsxHtml.replace(/class=/g, 'className=');
jsxHtml = jsxHtml.replace(/for=/g, 'htmlFor=');
jsxHtml = jsxHtml.replace(/<img(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<img${p1}/>`));
jsxHtml = jsxHtml.replace(/<br>/g, '<br />');
jsxHtml = jsxHtml.replace(/<hr(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<hr${p1}/>`));
jsxHtml = jsxHtml.replace(/<input(.*?)>/g, (match, p1) => (match.endsWith('/>') ? match : `<input${p1}/>`));
jsxHtml = jsxHtml.replace(/onclick="([^"]*)"/g, "onClick={() => console.log('$1')}");
jsxHtml = jsxHtml.replace(/tabindex/g, 'tabIndex');
jsxHtml = jsxHtml.replace(/data-selected/g, 'data-selected'); 

// Convert style="xxx" to style={{xxx}}
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

// HTML comments to JSX comments
jsxHtml = jsxHtml.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
// Images paths
jsxHtml = jsxHtml.replace(/src="imagenes\//g, 'src="/assets/cap1/');

// Replace click handlers to props
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('goModule\((.*?)\)'\)\}/g, "onClick={() => goModule($1)}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('nextSlide\(\)'\)\}/g, "onClick={nextSlide}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('prevSlide\(\)'\)\}/g, "onClick={prevSlide}");
jsxHtml = jsxHtml.replace(/onClick=\{\(\) => console\.log\('go\((.*?)\)'\)\}/g, "onClick={() => go($1)}");

// 3. Split by Slides
const slidesRegex = /<div className="(?:slide|slide-full)(?: active)?" data-slide="\d+"[^>]*>[\s\S]*?(?=\n\s*<div className="(?:slide|slide-full)(?: active)?" data-slide="\d+"[^>]*>|$)/g;
const slides = jsxHtml.match(slidesRegex);

if (!slides || slides.length !== 17) {
  console.error(`❌ Expected 17 slides, but found ${slides ? slides.length : 0}`);
  process.exit(1);
}

// 4. Generate Slide Components
const componentNames = [];

slides.forEach((slideHtml, i) => {
  const isCover = slideHtml.includes('slide-full');
  const slideNumMatch = slideHtml.match(/data-slide="(\d+)"/);
  const slideNum = slideNumMatch ? slideNumMatch[1] : i;
  
  // Dynamic active class based on prop `isActive`
  let processedHtml = slideHtml.replace(/<div className="(slide-full|slide)(?: active)?"/, '<div className={`$1 ${isActive ? "active" : ""}`}');

  const componentName = `Slide${slideNum}`;
  componentNames.push(componentName);

  let imports = `import React from 'react';\n`;
  
  // Inject AnatomyCanvas for Slide 1
  if (slideNum == 1) {
    imports += `import AnatomyCanvas from '../AnatomyCanvas';\n`;
    processedHtml = processedHtml.replace(/<div className="scene-status" id="three-status-a1"[\s\S]*?<\/div>/, '<AnatomyCanvas />');
  }

  const componentCode = `${imports}
export default function ${componentName}({ isActive, goModule, nextSlide, prevSlide, go }) {
  return (
    <>
      ${processedHtml}
    </>
  );
}
`;
  fs.writeFileSync(path.join(slidesDir, `${componentName}.tsx`), componentCode);
});
console.log('✅ Generated 17 individual slide components in slides/');

// 5. Generate Capitulo1.tsx Orchestrator
let importsBlock = componentNames.map(name => `import ${name} from './cap1/slides/${name}';`).join('\n');
let slidesBlock = componentNames.map((name, idx) => `      <${name} isActive={activeSlide === ${idx}} goModule={goModule} nextSlide={nextSlide} prevSlide={prevSlide} go={go} />`).join('\n');

const capituloCode = `import React, { useState } from 'react';
import './cap1/legacy.css';
${importsBlock}

const MODULES = [
  {id:0, name:'Inicio',               slides:[0],       ico:'🏠'},
  {id:1, name:'A · Terminología',      slides:[1,2,3],   ico:'🧭'},
  {id:2, name:'B · Movimiento',        slides:[4,5,6,7], ico:'🦾'},
  {id:3, name:'C · Humano Estándar',   slides:[8,9,10,11,12], ico:'📐'},
  {id:4, name:'D · Escalamiento',      slides:[13,14,15,16], ico:'📈'}
];

export default function Capitulo1() {
  const [activeSlide, setActiveSlide] = useState(0);

  const goModule = (m) => setActiveSlide(MODULES[m].slides[0]);
  const nextSlide = () => setActiveSlide(s => Math.min(16, s + 1));
  const prevSlide = () => setActiveSlide(s => Math.max(0, s - 1));
  const go = (s) => setActiveSlide(s);

  return (
    <>
${slidesBlock}

      {/* Navigation Bar injected globally for the chapter */}
      <nav className="nav-bar">
        <button className="nav-btn" onClick={prevSlide} aria-label="Anterior">◀</button>
        <span className="nav-module-label" id="navModuleLabel">{MODULES.find(m => m.slides.includes(activeSlide))?.name}</span>
        <div className="nav-dots" id="navDots"></div>
        <button className="nav-btn" onClick={nextSlide} aria-label="Siguiente">▶</button>
        <span className="slide-counter" id="slideCounter" aria-live="polite">{activeSlide + 1} / 17</span>
      </nav>
    </>
  );
}
`;

fs.writeFileSync(cap1Path, capituloCode);
console.log('✅ Generated Capitulo1.tsx orchestrator');
