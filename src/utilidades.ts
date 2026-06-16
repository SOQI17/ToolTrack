import React from 'react';
import type { ToolItem, Loan, Engineer, ToolStatus, ABCCategory, ToolComponent } from './tipos';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 800 * 1024) {
      reject(new Error("El archivo es demasiado grande (Máx 800KB)."));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return alert("No hay datos para exportar");
  const sep = ';';
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const headers = Object.keys(data[0]).map(esc).join(sep);
  const rows = data.map(obj => Object.values(obj).map(esc).join(sep)).join("\n");
  const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const handleImportCSV = (
  e: React.ChangeEvent<HTMLInputElement>,
  setImportPreview: (preview: any[]) => void,
  setImportErrors: (errors: string[]) => void,
  existingTools: ToolItem[] = []
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Limpiar el input para que se pueda volver a seleccionar el mismo archivo
  e.target.value = '';

  const processText = (text: string) => {
    // 1. Eliminar BOM (UTF-8 y UTF-16)
    let clean = text.replace(/^\uFEFF/, '').replace(/^\xFF\xFE/, '');

    // 2. Normalizar saltos de línea (Windows \r\n → \n, solo \r → \n)
    clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 3. Detectar separador: priorizar ; sobre ,
    const firstLine = clean.split('\n')[0] || '';
    const sep = firstLine.includes(';') ? ';' : ',';

    // 4. Función de normalización de header: quita tildes, espacios extra, puntos, ñ→n
    const normalizeHeader = (h: string) =>
      h.replace(/"/g, '').trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quita tildes
        .replace(/ñ/g, 'n')
        .replace(/[.\-_]/g, ' ')   // puntos/guiones → espacio
        .replace(/\s+/g, ' ')      // colapsar espacios
        .trim();

    // 5. Parser CSV que respeta comillas con campos multi-línea
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i+1] === '"') { cur += '"'; i++; } // comilla escapada ""
          else inQ = !inQ;
        } else if (ch === sep && !inQ) {
          result.push(cur.replace(/^"|"$/g,'').trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      result.push(cur.replace(/^"|"$/g,'').trim());
      return result;
    };

    const allLines = clean.split('\n');

    // CLAVE: buscar la fila real de headers (el Excel ORIMEC tiene filas decorativas arriba)
    const headerKeywords = ['nombre', 'name', 'pn orimec', 'descripcion'];
    let headerLineIndex = -1;
    for (let i = 0; i < Math.min(allLines.length, 20); i++) {
      const norm = allLines[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (headerKeywords.some(kw => norm.includes(kw))) {
        headerLineIndex = i;
        break;
      }
    }

    if (headerLineIndex === -1) {
      setImportErrors([
        'No se encontró la fila de encabezados.',
        'El CSV debe tener una columna llamada "Nombre" o "PN ORIMEC".',
        'Primeras líneas: ' + allLines.slice(0,3).map(l=>l.substring(0,60)).join(' || ')
      ]);
      setImportPreview([]);
      return;
    }

    const lines = allLines.slice(headerLineIndex).filter(l => l.trim());
    if (lines.length < 2) {
      setImportErrors(['El archivo no tiene filas de datos después de los encabezados.']);
      setImportPreview([]);
      return;
    }

    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map(normalizeHeader);
    console.log('[Import] Header en línea', headerLineIndex, '| Headers:', headers.join(' | '));

    // Mapeo de estados ORIMEC → ToolStatus
    const mapStatus = (v: string): ToolStatus => {
      const s = v.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (/^operat/.test(s) || s === 'bueno' || s === 'buena' || s === 'disponible' || s === 'ok') return 'available';
      if (/en uso/.test(s) || /prestado/.test(s)) return 'in-use';
      if (/manten/.test(s)) return 'maintenance';
      if (/dan/.test(s) || /inoper/.test(s) || s === 'baja') return 'broken';
      return 'available';
    };

    // Mapeo Familia/Modalidad → category
    const mapCategory = (familia: string, modalidad: string): string => {
      const f = familia.toLowerCase().trim();
      if (/herram/.test(f)) return modalidad.trim() || 'Herramienta';
      if (/instrum/.test(f)) return 'Instrumento';
      if (f) return familia.trim().charAt(0).toUpperCase() + familia.trim().slice(1).toLowerCase();
      return modalidad.trim() || 'Herramienta';
    };

    const mapABC = (v: string): ABCCategory => {
      const g = v.trim().toUpperCase().replace(/[^ABC]/g,'');
      if (g === 'A') return 'A';
      if (g === 'B') return 'B';
      return 'C';
    };

    // Busca un campo en obj probando múltiples variantes de nombre
    const get = (obj: any, ...keys: string[]): string => {
      for (const k of keys) {
        const norm = normalizeHeader(k);
        if (obj[norm] !== undefined && obj[norm] !== '') return String(obj[norm]);
        const found = Object.keys(obj).find(ok => ok.includes(norm) || norm.includes(ok));
        if (found && obj[found] !== '') return String(obj[found]);
      }
      return '';
    };

    const errs: string[] = [];
    const existingNames = new Set(existingTools.map(t => t.name.toLowerCase().trim()));
    const existingOrimec = new Set(existingTools.map(t => (t.orimec||'').toLowerCase().trim()).filter(Boolean));
    let skippedCount = 0;
    let emptyCount = 0;

    const rows = lines.slice(1).map((line, i) => {
      if (!line.trim()) return null;
      const vals = parseCSVLine(line);

      // Si la fila tiene muy pocos valores o todos vacíos, saltar
      const nonEmpty = vals.filter(v => v.trim()).length;
      if (nonEmpty < 2) { emptyCount++; return null; }

      const obj: any = {};
      headers.forEach((h, j) => { obj[h] = (vals[j] || '').trim(); });

      // Nombre: campo más importante
      const name = get(obj, 'nombre', 'name', 'descripcion', 'equipo') || '';
      if (!name) { errs.push(`Fila ${i+2}: sin nombre`); return null; }

      // Campos ORIMEC con fallback genérico
      const orimecId  = get(obj, 'pn orimec', 'pnorimec', 'id orimec', 'tag', 'id', 'codigo');
      const serial    = get(obj, 'pn', 'serie', 'serial', 'n serie', 'numero serie', 'no serie');
      const familia   = get(obj, 'familia');
      const modalidad = get(obj, 'modalidad');
      const categoria = get(obj, 'categoria', 'category', 'tipo');
      const category  = categoria || mapCategory(familia, modalidad);
      const estado    = get(obj, 'estado', 'condicion', 'condition', 'estatus') || 'Operativa';
      const grupo     = get(obj, 'grupo', 'clase', 'abc', 'clasificacion') || 'C';
      const cantStr   = get(obj, 'cantidad', 'quantity', 'qty', 'stock');
      const cantidad  = Math.max(1, parseInt(cantStr) || 1);

      // Calibraciones
      const lastCal = get(obj, 'calibracion fecha', 'calibracion', 'ultima calibracion', 'lastcalibration', 'fecha calibracion');
      const nextCal = get(obj, 'proxima calibracion', 'proxima calibra', 'siguiente calibracion', 'nextcalibration', 'next calibration', 'proxima');
      const observaciones = get(obj, 'observaciones', 'notes', 'obs', 'comentarios');

      // Deduplicación
      const nameLow   = name.toLowerCase().trim();
      const orimecLow = orimecId.toLowerCase().trim();
      if (existingNames.has(nameLow) || (orimecLow && existingOrimec.has(orimecLow))) {
        skippedCount++;
        return null;
      }

      return {
        name,
        serial,
        orimec: orimecId,
        category,
        abcCategory: mapABC(grupo),
        status: mapStatus(estado),
        condition: estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase(),
        quantity: cantidad,
        ...(lastCal ? { lastCalibration: lastCal } : {}),
        ...(nextCal ? { nextCalibration: nextCal } : {}),
        ...(observaciones ? { notes: observaciones } : {}),
        files: [],
        maintenanceHistory: [],
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    if (skippedCount > 0) errs.push(`${skippedCount} omitido${skippedCount>1?'s':''} — ya existen en el sistema (no se duplicarán).`);
    if (rows.length === 0 && skippedCount === 0) {
      errs.push('No se reconocieron registros válidos. Revisa que el archivo tenga la columna "Nombre" o "PN ORIMEC".');
      errs.push(`Headers detectados: ${headers.join(' | ')}`);
    }

    setImportPreview(rows);
    setImportErrors(errs);
  };

  // Intentar UTF-8 primero; si falla o produce símbolos raros, reintentar con Latin-1
  const readerUTF8 = new FileReader();
  readerUTF8.onload = (ev) => {
    const text = ev.target?.result as string;
    const hasGarbled = (text.match(/\uFFFD/g) || []).length > 5;
    if (hasGarbled) {
      const readerLatin = new FileReader();
      readerLatin.onload = (ev2) => processText(ev2.target?.result as string);
      readerLatin.readAsText(file, 'windows-1252');
    } else {
      processText(text);
    }
  };
  readerUTF8.readAsText(file, 'utf-8');
};

export const generateInventoryPDF = (tools: ToolItem[]) => {
  const filtered = tools.filter(t => t.status !== 'broken');
  const rows = filtered.map((t,i) => `<tr style="background:${i%2===0?'#f8fafc':'#fff'}"><td style="padding:8px 12px;font-size:11px;font-weight:600;color:#111;border-bottom:1px solid #f1f5f9">${t.name}</td><td style="padding:8px 12px;font-family:monospace;font-size:10px;color:#64748b;border-bottom:1px solid #f1f5f9">${t.serial||'—'}</td><td style="padding:8px 12px;font-size:11px;color:#64748b;border-bottom:1px solid #f1f5f9">${t.category}</td><td style="padding:8px 12px;font-size:10px;font-weight:700;color:${t.abcCategory==='A'?'#7c3aed':t.abcCategory==='B'?'#2563eb':'#64748b'};border-bottom:1px solid #f1f5f9">Clase ${t.abcCategory||'—'}</td><td style="padding:8px 12px;font-size:11px;color:${t.status==='available'?'#16a34a':t.status==='in-use'?'#2563eb':'#d97706'};font-weight:600;border-bottom:1px solid #f1f5f9">${t.status==='available'?'Disponible':t.status==='in-use'?'En Uso':'Mantenimiento'}</td></tr>`).join('');
  const printDate = new Date().toLocaleDateString('es-EC',{day:'2-digit',month:'long',year:'numeric'});
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Inventario ORIMEC</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e8e8e8;padding:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;width:794px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,.1);}.hdr{background:#1a3a6b;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:flex-end;}.hl{font-size:18px;font-weight:700;}.hr{font-size:10px;opacity:.7;text-align:right;}.sb{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 32px;font-size:9px;color:#64748b;display:flex;justify-content:space-between;}.bd{padding:24px 32px;}table{width:100%;border-collapse:collapse;}thead tr{background:#f8fafc;border-bottom:2px solid #1a3a6b;}thead th{padding:9px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555;text-align:left;}.ft{margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:8px;color:#bbb;}@media print{body{background:#fff;padding:0;}.page{box-shadow:none;width:100%;}}</style></head><body><div class="page"><div class="hdr"><div class="hl">ORIMEC C.A. — Inventario Global de Activos</div><div class="hr">Generado: ${printDate}<br>Total: ${filtered.length} activos</div></div><div class="sb"><span>BodegaControl v2.0</span><span>${filtered.filter(t=>t.status==='available').length} disponibles · ${filtered.filter(t=>t.status==='in-use').length} en uso</span></div><div class="bd"><table><thead><tr><th>Descripción</th><th>N.° de Serie</th><th>Categoría</th><th>Clase ABC</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table><div class="ft"><span>ORIMEC C.A. · Quito, Ecuador</span><span>BodegaControl v2.0</span></div></div></div><script>window.onload=()=>{window.focus();window.print();}<\/script></body></html>`;
  const blob = new Blob([html],{type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const win = window.open(url,'_blank');
  if(!win) alert('Permite ventanas emergentes.');
  setTimeout(()=>URL.revokeObjectURL(url),10000);
};

export const generateReportPDF = (tools: ToolItem[], loans: Loan[], engineers: Engineer[]) => {
  const printDate = new Date().toLocaleDateString('es-EC',{day:'2-digit',month:'long',year:'numeric'});
  const closedLoans = loans.filter(l => l.dateIn);
  const activeLoans = loans.filter(l => !l.dateIn);
  const avgDays = closedLoans.length > 0
    ? (closedLoans.reduce((s,l) => s+(new Date(l.dateIn!).getTime()-new Date(l.dateOut).getTime())/86400000, 0)/closedLoans.length).toFixed(1)
    : '—';
  const tasa = loans.length > 0 ? Math.round(closedLoans.length/loans.length*100) : 0;
  const engRows = engineers.map(e => {
    const cnt = loans.filter(l=>l.engineerId===e.id).length;
    const act = loans.filter(l=>l.engineerId===e.id&&!l.dateIn).length;
    const cl = loans.filter(l=>l.engineerId===e.id&&l.dateIn);
    const avg = cl.length > 0 ? (cl.reduce((s,l)=>s+(new Date(l.dateIn!).getTime()-new Date(l.dateOut).getTime())/86400000,0)/cl.length).toFixed(1) : '—';
    return `<tr><td style="padding:8px 12px;font-weight:600;font-size:11px;color:#111;border-bottom:1px solid #f1f5f9">${e.name}</td><td style="padding:8px 12px;text-align:center;font-size:11px;border-bottom:1px solid #f1f5f9">${cnt}</td><td style="padding:8px 12px;text-align:center;font-size:11px;color:#2563eb;font-weight:700;border-bottom:1px solid #f1f5f9">${act}</td><td style="padding:8px 12px;text-align:center;font-family:monospace;font-size:11px;border-bottom:1px solid #f1f5f9">${avg}${avg!=='—'?'d':''}</td></tr>`;
  }).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte ORIMEC</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e8e8e8;padding:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;width:794px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,.1);}.hdr{background:#1a3a6b;color:#fff;padding:24px 32px;}.ht{font-size:9px;opacity:.7;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;}.hl{font-size:20px;font-weight:700;}.bd{padding:24px 32px;}.sec{margin-bottom:28px;}.sh{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#555;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:14px;}.kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e5e7eb;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;}.kc{background:#fff;padding:16px;}.kl{font-size:8px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;}.kv{font-size:22px;font-weight:700;color:#111;}table{width:100%;border-collapse:collapse;}thead tr{background:#f8fafc;border-bottom:2px solid #1a3a6b;}thead th{padding:9px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555;text-align:left;}.ft{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:8px;color:#bbb;}@media print{body{background:#fff;padding:0;}.page{box-shadow:none;width:100%;}}</style></head><body><div class="page"><div class="hdr"><div class="ht">Reporte operativo</div><div class="hl">ORIMEC C.A. — BodegaControl</div><div style="font-size:10px;opacity:.7;margin-top:6px">Generado: ${printDate}</div></div><div class="bd"><div class="kgrid"><div class="kc"><div class="kl">Total activos</div><div class="kv">${tools.length}</div></div><div class="kc"><div class="kl">Préstamos activos</div><div class="kv">${activeLoans.length}</div></div><div class="kc"><div class="kl">Tasa devolución</div><div class="kv">${tasa}%</div></div><div class="kc"><div class="kl">Días promedio</div><div class="kv">${avgDays}${avgDays!=='—'?'d':''}</div></div></div><div class="sec"><div class="sh">Préstamos por ingeniero</div><table><thead><tr><th>Ingeniero</th><th style="text-align:center">Total</th><th style="text-align:center">Activos</th><th style="text-align:center">Días prom.</th></tr></thead><tbody>${engRows}</tbody></table></div><div class="ft"><span>ORIMEC C.A. · Quito, Ecuador · Documento interno</span><span>BodegaControl v2.0</span></div></div></div><script>window.onload=()=>{window.focus();window.print();}<\/script></body></html>`;
  const blob = new Blob([html],{type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const win = window.open(url,'_blank');
  if(!win) alert('Permite ventanas emergentes.');
  setTimeout(()=>URL.revokeObjectURL(url),10000);
};

export const generateLoanPDF = (loan: Loan, engineerName: string) => {
  const tools = loan.tools && loan.tools.length > 0 ? loan.tools : loan.toolId ? [{ id: loan.toolId, name: loan.toolId, serial: '—' }] : [];
  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const loanId = `ORM-${loan.id.substring(0, 6).toUpperCase()}`;
  const printDate = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
  const isActive = !loan.dateIn;
  const rows = tools.map((t, i) => `<tr><td class="tn">${String(i + 1).padStart(2, '0')}</td><td class="tm">${t.name}</td><td class="ts">${t.serial || '—'}</td><td class="tst"><span class="badge ${isActive ? 'ba' : 'br'}">${isActive ? 'En custodia' : 'Devuelto'}</span></td></tr>`).join('');
  const condRow = loan.returnCondition ? `<div class="ic"><div class="il">Condición al devolver</div><div class="iv" style="color:${loan.returnCondition === 'Con daños' ? '#dc2626' : loan.returnCondition === 'Requiere revisión' ? '#d97706' : '#16a34a'}">${loan.returnCondition}</div></div>${loan.returnNotes ? `<div class="ic s2"><div class="il">Observaciones</div><div class="iv">${loan.returnNotes}</div></div>` : ''}${loan.returnReceivedBy ? `<div class="ic"><div class="il">Recibido por</div><div class="iv">${loan.returnReceivedBy}</div></div>` : ''}` : '';
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Acta ${loanId}</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Inter',sans-serif;font-size:13px;color:#111;background:#e8e8e8;padding:32px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{background:#fff;width:794px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,.15);}.hdr{display:flex;border-bottom:3px solid #1a3a6b;}.hl{background:#1a3a6b;color:#fff;width:220px;flex-shrink:0;padding:28px 24px;display:flex;flex-direction:column;justify-content:center;}.co{font-size:17px;font-weight:700;}.ru{font-size:9px;opacity:.65;margin-top:3px;}.dv{height:1px;background:rgba(255,255,255,.2);margin:12px 0;}.dp{font-size:9px;font-weight:600;opacity:.8;text-transform:uppercase;letter-spacing:.1em;}.hr2{flex:1;padding:24px 32px;display:flex;flex-direction:column;justify-content:center;gap:6px;}.dl{font-size:9px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.12em;}.dt{font-size:20px;font-weight:700;line-height:1.1;}.dm{display:flex;gap:20px;margin-top:6px;}.di{display:flex;flex-direction:column;gap:2px;}.ml{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:.1em;font-weight:600;}.mv{font-size:11px;font-weight:700;color:#1a3a6b;font-family:monospace;}.sb{display:flex;align-items:center;justify-content:space-between;background:${isActive ? '#fffbeb' : '#f0fdf4'};border-bottom:1px solid ${isActive ? '#fcd34d' : '#86efac'};padding:8px 32px;}.sl2{display:flex;align-items:center;gap:10px;}.sd{width:7px;height:7px;border-radius:50%;background:${isActive ? '#f59e0b' : '#22c55e'};}.ss{font-weight:700;color:${isActive ? '#92400e' : '#14532d'};font-size:10px;text-transform:uppercase;}.sr2{font-size:9px;color:#888;}.bd{padding:28px 32px;}.sc{margin-bottom:24px;}.sh{display:flex;align-items:center;gap:8px;margin-bottom:12px;}.sn{width:18px;height:18px;background:#1a3a6b;color:#fff;border-radius:4px;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.st{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#555;}.sh::after{content:'';flex:1;height:1px;background:#e5e7eb;}.ig{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#e5e7eb;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;}.ic{background:#fff;padding:12px 14px;}.ic.s2{grid-column:span 2;}.il{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:4px;}.iv{font-size:12px;font-weight:600;}.iv.mo{font-family:'Courier New',monospace;color:#1a3a6b;}table.tt{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;font-size:12px;}table.tt thead tr{background:#f8fafc;border-bottom:2px solid #1a3a6b;}table.tt thead th{padding:9px 12px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555;text-align:left;}.tn{width:36px;padding:10px 12px;color:#9ca3af;font-family:monospace;font-size:11px;border-bottom:1px solid #f3f4f6;}.tm{padding:10px 12px;font-weight:600;border-bottom:1px solid #f3f4f6;}.ts{padding:10px 12px;font-family:'Courier New',monospace;color:#555;font-size:11px;border-bottom:1px solid #f3f4f6;width:160px;}.tst{padding:10px 12px;width:100px;border-bottom:1px solid #f3f4f6;}.badge{display:inline-block;padding:3px 8px;border-radius:3px;font-size:9px;font-weight:700;text-transform:uppercase;}.ba{background:#fffbeb;color:#92400e;border:1px solid #fcd34d;}.br{background:#f0fdf4;color:#14532d;border:1px solid #86efac;}.ob{border:1px solid #e5e7eb;border-radius:6px;padding:14px;min-height:52px;color:#9ca3af;font-size:11px;font-style:italic;}.sg{display:grid;grid-template-columns:1fr 1fr;gap:24px;}.sa{border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px 0;height:88px;display:flex;flex-direction:column;justify-content:flex-end;position:relative;}.sa::before{content:attr(data-hint);position:absolute;top:10px;left:14px;font-size:8px;color:#d1d5db;text-transform:uppercase;letter-spacing:.1em;font-weight:600;}.sl3{border-top:1px solid #374151;margin-bottom:8px;}.sna{font-size:10px;font-weight:700;color:#374151;}.sro{font-size:8px;color:#9ca3af;text-transform:uppercase;margin-top:2px;}.ft{margin-top:28px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;}.fl{font-size:8px;color:#bbb;line-height:1.6;}.fr{font-size:8px;color:#bbb;text-align:right;font-family:monospace;}@media print{body{background:#fff;padding:0;}.page{box-shadow:none;width:100%;}}</style></head><body><div class="page"><div class="hdr"><div class="hl"><div class="co">ORIMEC C.A.</div><div class="ru">RUC: 1792046780001</div><div class="dv"></div><div class="dp">Departamento de Bodega</div></div><div class="hr2"><div class="dl">Documento de control interno</div><div class="dt">Acta de Préstamo<br>de Activos</div><div class="dm"><div class="di"><span class="ml">N.° de Acta</span><span class="mv">${loanId}</span></div><div class="di"><span class="ml">Fecha de emisión</span><span class="mv">${printDate}</span></div></div></div></div><div class="sb"><div class="sl2"><div class="sd"></div><span class="ss">${isActive ? 'Préstamo activo — activos fuera de bodega' : 'Préstamo cerrado — activos devueltos'}</span></div><div class="sr2">Impreso: ${printDate}</div></div><div class="bd"><div class="sc"><div class="sh"><div class="sn">1</div><div class="st">Datos del préstamo</div></div><div class="ig"><div class="ic"><div class="il">Ingeniero responsable</div><div class="iv">${engineerName}</div></div><div class="ic"><div class="il">Naturaleza del trabajo</div><div class="iv">${loan.purpose || 'Mantenimiento'}</div></div><div class="ic"><div class="il">Fecha de salida</div><div class="iv mo">${fmt(loan.dateOut)}</div></div><div class="ic s2"><div class="il">Proyecto / Centro de costo</div><div class="iv">${loan.project || loan.client || 'General'}</div></div><div class="ic"><div class="il">Fecha de devolución</div><div class="iv mo">${fmt(loan.dateIn)}</div></div>${condRow}</div></div><div class="sc"><div class="sh"><div class="sn">2</div><div class="st">Detalle de activos (${tools.length} ítem${tools.length !== 1 ? 's' : ''})</div></div><table class="tt"><thead><tr><th>#</th><th>Descripción del equipo / herramienta</th><th>N.° de serie</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div><div class="sc"><div class="sh"><div class="sn">3</div><div class="st">Observaciones</div></div><div class="ob">${loan.returnNotes || 'Sin observaciones registradas.'}</div></div><div class="sc"><div class="sh"><div class="sn">4</div><div class="st">Conformidad y firmas</div></div><div class="sg"><div><div class="sa" data-hint="Firma"><div class="sl3"></div><div class="sna">${loan.returnReceivedBy || 'Responsable de Bodega'}</div><div class="sro">Entregado / Recibido por Bodega</div></div></div><div><div class="sa" data-hint="Firma"><div class="sl3"></div><div class="sna">${engineerName}</div><div class="sro">Recibido por — Ingeniero</div></div></div></div></div><div class="ft"><div class="fl">ORIMEC C.A. · Bodega Central · Quito, Ecuador<br>Documento de uso interno.</div><div class="fr">${loanId}<br>BodegaControl v2.0</div></div></div></div><script>window.onload=()=>{window.focus();window.print();}<\/script></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) alert('Permite ventanas emergentes para generar el PDF.');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const generateQRUrl = (tool: ToolItem) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`ORIMEC\n${tool.name}\nS/N: ${tool.serial}\nID: ${tool.orimec || 'N/A'}\nEstado: ${tool.status}`)}&margin=10`;
};
