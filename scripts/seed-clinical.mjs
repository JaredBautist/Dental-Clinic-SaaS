import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Seed clínico idempotente para una clínica dental.
 *
 * Crea, por consultorio:
 *   - Pacientes de demostración con datos realistas (incluye menores con acudiente).
 *   - Historia clínica con entradas inmutables (motivo, diagnóstico, plan, procedimiento, evolución).
 *   - Estados de odontograma append-only (caries, obturado, ausente, corona, endodoncia, implante, fractura...).
 *   - Citas pasadas, de hoy y futuras, con estados y cancelaciones.
 *   - Documentos PDF/PNG en el bucket privado `clinical-files` + metadatos en `clinical_attachments`.
 *   - Registros de auditoría para las operaciones creadas.
 *
 * Variables opcionales:
 *   SEED_CLINIC_ID             UUID de un consultorio concreto (por defecto: todos)
 *   SEED_PATIENTS_PER_CLINIC   Pacientes por consultorio (por defecto: 12)
 *   SEED_DAYS_BACK             Días hacia atrás para citas (por defecto: 14)
 *   SEED_DAYS_FORWARD          Días hacia adelante para citas (por defecto: 14)
 *   SEED_DRY_RUN               1/true para previsualizar sin escribir en Supabase
 *   SEED_SKIP_STORAGE          1/true para no subir archivos (solo metadatos no se crean)
 */

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = 'clinical-files';
const SEED_TAG = 'seed-clinical';
const DOC_PREFIX = '9';

// ---------------------------------------------------------------------------
// Utilidades generales
// ---------------------------------------------------------------------------

function readInt(name, fallback, min, max) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) throw new Error(`${name} debe ser un entero entre ${min} y ${max}.`);
  const value = Number.parseInt(trimmed, 10);
  if (value < min || value > max) throw new Error(`${name} debe ser un entero entre ${min} y ${max}.`);
  return value;
}

function isFlag(name) {
  return ['1', 'true', 'yes', 'si', 'sí'].includes(String(process.env[name] ?? '').toLowerCase());
}

function fail(context, error) {
  const message = error?.message ?? String(error);
  throw new Error(`${context}: ${message}`);
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return dt.toISOString().slice(0, 10);
}

function dayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

function bogotaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function bogotaNowTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function isoAtBogota(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00-05:00`;
}

function daysAgoIso(days, hour = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28) || 'consultorio'
  );
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function patientKey(documentType, documentNumber) {
  return `${documentType}|${documentNumber}`;
}

// ---------------------------------------------------------------------------
// Catálogos de datos de demostración
// ---------------------------------------------------------------------------

const PATIENT_NAMES = [
  'María Fernanda Gómez',
  'Juan Sebastián Pérez',
  'Luisa Fernanda Rodríguez',
  'Carlos Andrés Martínez',
  'Ana María López',
  'Diego Alejandro García',
  'Valentina Hernández',
  'Santiago Ramírez',
  'Camila Torres',
  'Andrés Felipe Vargas',
  'Isabella Castro',
  'Julián David Rojas',
  'Laura Sofía Mendoza',
  'Mateo Salazar',
  'Daniela Restrepo',
  'Nicolás Aguirre',
  'Gabriela Peña',
  'Felipe Navarro',
  'Manuela Ortiz',
  'Sebastián Duarte',
  'Mariana Escobar',
  'Tomás Fuentes',
  'Sara Gallego',
  'Emilio Hoyos',
  'Antonia Isaza',
  'Samuel Jaramillo',
  'Martina León',
  'Alejandro Mejía',
  'Salomé Naranjo',
  'Benjamín Ospina',
  'Luciana Pardo',
  'Emiliano Quintero',
  'Renata Ramírez',
  'Matías Sánchez',
  'Elena Trujillo',
  'Simón Urrea',
];

const ADDRESSES = [
  'Calle 45 # 23-18, Bogotá',
  'Carrera 13 # 72-45, Bogotá',
  'Calle 100 # 15-32, Bogotá',
  'Carrera 7 # 45-67, Bogotá',
  'Calle 63 # 24-10, Bogotá',
  'Transversal 19 # 98-54, Bogotá',
  'Calle 26 # 68-33, Bogotá',
  'Carrera 50 # 12-40, Bogotá',
  'Calle 80 # 45-21, Bogotá',
  'Carrera 15 # 85-16, Bogotá',
  'Calle 5 # 30-12, Chía',
  'Carrera 11 # 93-25, Bogotá',
];

const MEDICAL_HISTORIES = [
  'Sin antecedentes médicos relevantes. No refiere alergias medicamentosas.',
  'Hipertensión arterial controlada con losartán. Alergia a la penicilina.',
  'Diabetes mellitus tipo 2 controlada. Última hemoglobina glicosilada 6.8%.',
  'Asma bronquial leve intermitente. Usa salbutamol a demanda.',
  'Embarazo de 24 semanas. Sin complicaciones. Se difiere radiografía.',
  'Bruxismo nocturno. Usa férula de descarga desde hace 2 años.',
  'Anticoagulación con warfarina por fibrilación auricular. Requiere control de INR.',
  'Alergia a lidocaína. Se utiliza mepivacaína sin vasoconstrictor.',
  'Cirugía cardíaca previa (revascularización). Autorización cardiológica vigente.',
  'Hipotiroidismo compensado con levotiroxina 50 mcg.',
  'Fumador activo de 10 cigarrillos/día. Se recomienda cesación tabáquica.',
  'Gastritis crónica. Consume omeprazol ocasional. Sin alergias conocidas.',
];

const CASE_TYPES = [
  {
    key: 'caries',
    reason: 'Sensibilidad dental en sector superior derecho',
    entries: [
      ['motivo_consulta', 'Paciente refiere sensibilidad al frío en el sector superior derecho desde hace dos semanas. El dolor cede rápidamente al retirar el estímulo.'],
      ['diagnostico', 'Caries oclusal activa en pieza 16. Sin compromiso pulpar aparente. Se observa lesión de caries de esmalte y dentina.'],
      ['plan_tratamiento', 'Restauración con resina compuesta en pieza 16. Control clínico y radiográfico a los 6 meses. Instrucción de higiene oral.'],
      ['procedimiento', 'Aislamiento absoluto, remoción de tejido cariado y restauración con resina compuesta en pieza 16. Ajuste oclusal verificado.'],
      ['evolucion', 'Paciente asintomático al control. Restauración con buen ajuste oclusal y márgenes adaptados. Sin dolor a la percusión.'],
    ],
    odontogram: [
      { tooth: '16', surface: 'oclusal', status: 'caries', proposed: 'Resina compuesta', completed: null },
      { tooth: '26', surface: 'oclusal', status: 'obturado', proposed: null, completed: 'Resina compuesta' },
    ],
  },
  {
    key: 'endodoncia',
    reason: 'Dolor pulsátil en molar inferior izquierdo',
    entries: [
      ['motivo_consulta', 'Dolor pulsátil intenso en molar inferior izquierdo, exacerbado por el calor y durante la noche. Dificultad para masticar.'],
      ['diagnostico', 'Pulpitis irreversible sintomática en pieza 36. Caries profunda con compromiso pulpar. Se descarta absceso periapical.'],
      ['plan_tratamiento', 'Endodoncia en pieza 36 en dos sesiones, restauración posterior con resina y control radiográfico a los 6 meses.'],
      ['procedimiento', 'Apertura cameral, instrumentación rotatoria y medicación intraconducto con hidróxido de calcio. Conductos permeables.'],
      ['evolucion', 'Dolor disminuido a EVA 2/10. Se programa obturación de conductos y restauración definitiva. Sin signos de infección.'],
    ],
    odontogram: [
      { tooth: '36', surface: 'oclusal', status: 'endodoncia', proposed: 'Endodoncia', completed: 'Instrumentación y medicación' },
      { tooth: '36', surface: 'mesial', status: 'caries', proposed: 'Resina compuesta', completed: null },
      { tooth: '46', surface: 'oclusal', status: 'sano', proposed: null, completed: null },
    ],
  },
  {
    key: 'extraccion',
    reason: 'Dolor y aumento de volumen en tercer molar',
    entries: [
      ['motivo_consulta', 'Aumento de volumen y dolor en zona de tercer molar inferior derecho. Dificultad para abrir la boca.'],
      ['diagnostico', 'Pericoronaritis aguda asociada a pieza 48 incluida. Tercer molar en posición horizontal con compromiso del nervio alveolar inferior.'],
      ['plan_tratamiento', 'Extracción quirúrgica de pieza 48, antibioticoterapia y control postoperatorio a los 7 días. Radiografía panorámica previa.'],
      ['procedimiento', 'Extracción quirúrgica de pieza 48 bajo anestesia local. Hemostasia adecuada y sutura simple. Indicaciones postoperatorias entregadas.'],
      ['evolucion', 'Postoperatorio sin complicaciones. Herida quirúrgica en proceso de cicatrización. Se retiran puntos a los 7 días.'],
    ],
    odontogram: [
      { tooth: '48', surface: 'completa', status: 'extraccion_indicada', proposed: 'Extracción quirúrgica', completed: null },
      { tooth: '47', surface: 'oclusal', status: 'caries', proposed: 'Resina compuesta', completed: null },
    ],
  },
  {
    key: 'ortodoncia',
    reason: 'Valoración por apiñamiento dental',
    entries: [
      ['motivo_consulta', 'Paciente consulta por apiñamiento dental y deseo de tratamiento de ortodoncia. Refiere dificultad para la higiene.'],
      ['diagnostico', 'Maloclusión clase I con apiñamiento moderado en sector anterior. Apiñamiento dental superior e inferior.'],
      ['plan_tratamiento', 'Estudio cefalométrico y fotografías. Inicio de ortodoncia fija con brackets metálicos. Controles mensuales.'],
      ['procedimiento', 'Instalación de brackets en arcada superior e inferior. Arco inicial 0.014 NiTi. Indicaciones de higiene y alimentación.'],
      ['evolucion', 'Paciente tolera aparatología. Se indican controles mensuales y higiene oral reforzada. Sin lesiones de mucosa.'],
    ],
    odontogram: [
      { tooth: '11', surface: 'vestibular', status: 'sano', proposed: null, completed: null },
      { tooth: '21', surface: 'vestibular', status: 'sano', proposed: null, completed: null },
      { tooth: '16', surface: 'oclusal', status: 'obturado', proposed: null, completed: 'Resina compuesta' },
    ],
  },
  {
    key: 'periodoncia',
    reason: 'Sangrado gingival y movilidad dental',
    entries: [
      ['motivo_consulta', 'Sangrado gingival al cepillado y movilidad en dientes inferiores. Halitosis ocasional.'],
      ['diagnostico', 'Periodontitis crónica generalizada leve a moderada. Cálculo supra y subgingival. Bolsas de 4-5 mm en sectores posteriores.'],
      ['plan_tratamiento', 'Detartraje y alisado radicular por cuadrantes. Instrucción de higiene oral y control a los 3 meses.'],
      ['procedimiento', 'Detartraje supragingival y subgingival en cuadrantes 1 y 2. Alisado radicular. Se indica enjuague de clorhexidina 0.12%.'],
      ['evolucion', 'Disminución del sangrado gingival. Se refuerza técnica de cepillado y uso de hilo dental. Encías con menor inflamación.'],
    ],
    odontogram: [
      { tooth: '31', surface: 'palatino_lingual', status: 'sano', proposed: null, completed: null },
      { tooth: '41', surface: 'palatino_lingual', status: 'sano', proposed: null, completed: null },
      { tooth: '38', surface: 'completa', status: 'ausente', proposed: null, completed: 'Pérdida previa' },
    ],
  },
  {
    key: 'limpieza',
    reason: 'Limpieza dental de rutina',
    entries: [
      ['motivo_consulta', 'Consulta para limpieza dental de rutina y revisión general. Sin dolor actual.'],
      ['diagnostico', 'Placa bacteriana y cálculo supragingival. Sin caries activas. Encías con inflamación leve.'],
      ['plan_tratamiento', 'Profilaxis dental, aplicación de flúor y control anual. Refuerzo de técnica de cepillado.'],
      ['procedimiento', 'Profilaxis con ultrasonido y pasta profiláctica. Aplicación de flúor en gel. Se retira cálculo supragingival.'],
      ['evolucion', 'Paciente satisfecho. Encías sin sangrado al sondaje. Se recomienda control en 6 meses.'],
    ],
    odontogram: [
      { tooth: '16', surface: 'oclusal', status: 'obturado', proposed: null, completed: 'Resina compuesta' },
      { tooth: '26', surface: 'oclusal', status: 'obturado', proposed: null, completed: 'Resina compuesta' },
      { tooth: '38', surface: 'completa', status: 'ausente', proposed: null, completed: 'Pérdida previa' },
    ],
  },
  {
    key: 'implante',
    reason: 'Reposición de pieza dental perdida',
    entries: [
      ['motivo_consulta', 'Paciente edéntulo parcial en sector inferior derecho, desea reponer pieza perdida. Sin dolor.'],
      ['diagnostico', 'Ausencia de pieza 46. Reborde alveolar con altura adecuada para implante. Tomografía con hueso disponible.'],
      ['plan_tratamiento', 'Colocación de implante dental en posición 46 y corona atornillada. Control postquirúrgico a los 7 días.'],
      ['procedimiento', 'Colocación de implante de 4.1 x 10 mm en posición 46. Buena estabilidad primaria. Sutura y control radiográfico.'],
      ['evolucion', 'Control postquirúrgico sin signos de infección. Se programa segunda fase a los 4 meses.'],
    ],
    odontogram: [
      { tooth: '46', surface: 'completa', status: 'implante', proposed: null, completed: 'Implante 4.1 x 10 mm' },
      { tooth: '45', surface: 'oclusal', status: 'caries', proposed: 'Resina compuesta', completed: null },
    ],
  },
  {
    key: 'blanqueamiento',
    reason: 'Blanqueamiento dental por manchas extrínsecas',
    entries: [
      ['motivo_consulta', 'Paciente solicita blanqueamiento dental por manchas extrínsecas. Sin sensibilidad previa.'],
      ['diagnostico', 'Tinción extrínseca generalizada. Esmalte sano, sin caries activas. Encías sin inflamación.'],
      ['plan_tratamiento', 'Blanqueamiento dental ambulatorio con peróxido de carbamida al 16% por 14 días. Control a las 2 semanas.'],
      ['procedimiento', 'Toma de impresiones, elaboración de férulas y entrega con instrucciones de uso. Se indica gel desensibilizante.'],
      ['evolucion', 'Paciente reporta sensibilidad leve transitoria. Se recomienda gel desensibilizante y evitar alimentos pigmentantes.'],
    ],
    odontogram: [
      { tooth: '11', surface: 'vestibular', status: 'sano', proposed: null, completed: null },
      { tooth: '21', surface: 'vestibular', status: 'sano', proposed: null, completed: null },
      { tooth: '13', surface: 'oclusal', status: 'obturado', proposed: null, completed: 'Resina compuesta' },
    ],
  },
  {
    key: 'urgencia',
    reason: 'Traumatismo dental en incisivo central',
    entries: [
      ['motivo_consulta', 'Traumatismo dental en incisivo central superior tras caída. Dolor leve y fractura visible.'],
      ['diagnostico', 'Fractura coronaria no complicada en pieza 11. Vitalidad pulpar conservada. Sin movilidad ni desplazamiento.'],
      ['plan_tratamiento', 'Reconstrucción con resina compuesta y control de vitalidad a las 4 y 12 semanas. Radiografía periapical.'],
      ['procedimiento', 'Grabado ácido, adhesivo y reconstrucción con resina compuesta en pieza 11. Ajuste oclusal y pulido.'],
      ['evolucion', 'Pieza 11 con vitalidad conservada y restauración estable. Sin dolor a la percusión. Control en 4 semanas.'],
    ],
    odontogram: [
      { tooth: '11', surface: 'mesial', status: 'fractura', proposed: 'Reconstrucción con resina', completed: null },
      { tooth: '21', surface: 'mesial', status: 'fractura', proposed: 'Reconstrucción con resina', completed: null },
    ],
  },
];

const CUSTOM_STATUSES = [
  { name: 'Sellante', color_hex: '#22c55e' },
  { name: 'Prótesis fija', color_hex: '#0ea5e9' },
  { name: 'En observación', color_hex: '#f59e0b' },
];

// ---------------------------------------------------------------------------
// Generación de PDF y PNG
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'latin1');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

/** PNG en escala de grises con ruido determinista, simulando una radiografía panorámica. */
function buildRadiographPng(width = 480, height = 260, seed = 1) {
  const raw = Buffer.alloc((width + 1) * height);
  let state = seed >>> 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0; // filtro None
    for (let x = 0; x < width; x++) {
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const vignette = Math.max(0, 1 - (dx * dx + dy * dy) * 0.9);
      const teeth = Math.abs(Math.sin(x / 14)) * 42 + Math.abs(Math.sin(y / 9)) * 18;
      const noise = rand() * 32;
      const value = Math.max(0, Math.min(255, Math.round(18 + vignette * (95 + teeth) + noise)));
      raw[y * (width + 1) + 1 + x] = value;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function escapePdfText(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text, maxChars = 88) {
  const value = String(text);
  if (value.trim() === '') return [''];
  const words = value.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current ? `${current} ${word}` : word).length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildPdf({ title, subtitle, lines }) {
  const content = [];
  content.push('BT');
  content.push('/F1 16 Tf');
  content.push('72 730 Td');
  content.push(`(${escapePdfText(title)}) Tj`);
  if (subtitle) {
    content.push('/F1 10 Tf');
    content.push('0 -20 Td');
    content.push(`(${escapePdfText(subtitle)}) Tj`);
  }
  content.push('/F1 11 Tf');
  content.push('0 -30 Td');
  for (const line of lines) {
    for (const wrapped of wrapText(line)) {
      content.push(`(${escapePdfText(wrapped)}) Tj`);
      content.push('0 -16 Td');
    }
  }
  content.push('ET');

  const contentString = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(contentString, 'latin1')} >>\nstream\n${contentString}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

// ---------------------------------------------------------------------------
// Helpers de base de datos
// ---------------------------------------------------------------------------

async function listClinics() {
  let query = admin.from('clinics').select('id, name').order('name');
  if (process.env.SEED_CLINIC_ID) {
    query = query.eq('id', process.env.SEED_CLINIC_ID);
  }
  const { data, error } = await query;
  if (error) fail('No se pudieron consultar los consultorios', error);
  return data ?? [];
}

async function listClinicUsers(clinicId) {
  const { data, error } = await admin
    .from('users')
    .select('id, full_name, role, clinic_id')
    .eq('clinic_id', clinicId);
  if (error) fail(`No se pudieron consultar los usuarios del consultorio ${clinicId}`, error);
  return data ?? [];
}

async function listPatients(clinicId) {
  const { data, error } = await admin
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId);
  if (error) fail(`No se pudieron consultar los pacientes del consultorio ${clinicId}`, error);
  return data ?? [];
}

async function listAppointments(clinicId) {
  const { data, error } = await admin
    .from('appointments')
    .select('id, patient_id, dentist_id, scheduled_at, ends_at, status')
    .eq('clinic_id', clinicId);
  if (error) fail(`No se pudieron consultar las citas del consultorio ${clinicId}`, error);
  return data ?? [];
}

async function ensureCustomStatuses(clinicId, dryRun) {
  if (dryRun) return 0;
  const { error } = await admin.from('custom_tooth_statuses').upsert(
    CUSTOM_STATUSES.map((status) => ({ clinic_id: clinicId, ...status })),
    { onConflict: 'clinic_id,name', ignoreDuplicates: true }
  );
  if (error) fail(`No se pudieron crear los estados personalizados del consultorio ${clinicId}`, error);
  return CUSTOM_STATUSES.length;
}

function buildPatientDef(clinicIndex, patientIndex, perClinic) {
  const globalIndex = clinicIndex * perClinic + patientIndex;
  const name = PATIENT_NAMES[globalIndex % PATIENT_NAMES.length];
  const age = 8 + ((globalIndex * 7 + 3) % 63); // 8..70 años
  const isMinor = age < 18;
  const documentNumber = `${DOC_PREFIX}${clinicIndex + 1}${String(patientIndex + 1).padStart(6, '0')}`;
  const birth = new Date();
  birth.setUTCFullYear(birth.getUTCFullYear() - age);
  birth.setUTCDate(birth.getUTCDate() - ((globalIndex * 13) % 300));
  const birthDate = birth.toISOString().slice(0, 10);
  const phone = `3${String(10 + ((globalIndex * 37) % 90))}${String(1000000 + globalIndex * 7919).slice(-7)}`;
  const email = patientIndex % 4 === 0 ? null : `paciente${globalIndex + 1}.${slugify(name)}@example.com`;
  const address = ADDRESSES[globalIndex % ADDRESSES.length];
  const medicalHistory = MEDICAL_HISTORIES[globalIndex % MEDICAL_HISTORIES.length];
  const guardianName = isMinor ? `Acudiente de ${name.split(' ')[0]}` : null;
  const guardianPhone = isMinor ? phone : null;

  return {
    full_name: name,
    document_type: isMinor ? 'TI' : 'CC',
    document_number: documentNumber,
    birth_date: birthDate,
    biological_sex: globalIndex % 2 === 0 ? 'femenino' : 'masculino',
    phone_primary: phone,
    email,
    address,
    guardian_name: guardianName,
    guardian_phone: guardianPhone,
    medical_history: medicalHistory,
    created_at: daysAgoIso(150 + (globalIndex % 60)),
    updated_at: daysAgoIso(150 + (globalIndex % 60)),
  };
}

async function ensurePatient(clinicId, def, existingByDocument, dryRun) {
  const existing = existingByDocument.get(patientKey(def.document_type, def.document_number));
  if (existing) return { patient: existing, created: false };

  if (dryRun) return { patient: { id: `dry-${def.document_number}`, ...def }, created: true };

  const { data, error } = await admin
    .from('patients')
    .insert({ clinic_id: clinicId, ...def })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: found, error: findError } = await admin
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('document_type', def.document_type)
        .eq('document_number', def.document_number)
        .maybeSingle();
      if (findError) fail(`No se pudo recuperar el paciente ${def.document_number}`, findError);
      if (found) return { patient: found, created: false };
    }
    fail(`No se pudo crear el paciente ${def.full_name}`, error);
  }

  return { patient: data, created: true };
}

async function ensureClinicalRecord(clinicId, patient, dryRun) {
  const { data: existing, error: findError } = await admin
    .from('clinical_records')
    .select('id, version')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patient.id)
    .maybeSingle();
  if (findError) fail(`No se pudo consultar la historia clínica de ${patient.full_name}`, findError);
  if (existing) return { record: existing, created: false };

  if (dryRun) return { record: { id: `dry-record-${patient.id}`, version: 1 }, created: true };

  const { data, error } = await admin
    .from('clinical_records')
    .insert({
      clinic_id: clinicId,
      patient_id: patient.id,
      version: 1,
      created_at: daysAgoIso(120 + (patient.full_name.length % 30)),
    })
    .select('id, version')
    .single();
  if (error) fail(`No se pudo crear la historia clínica de ${patient.full_name}`, error);
  return { record: data, created: true };
}

async function listClinicalEntries(recordId) {
  const { data, error } = await admin
    .from('clinical_entries')
    .select('id, entry_type, content, created_at')
    .eq('record_id', recordId)
    .order('created_at', { ascending: true });
  if (error) fail(`No se pudieron consultar las entradas de la historia ${recordId}`, error);
  return data ?? [];
}

async function ensureClinicalEntries(clinicId, patient, record, caseType, doctorId, addCorrection, dryRun) {
  const existing = await listClinicalEntries(record.id);
  if (existing.length > 0) {
    return { entries: existing, created: 0, skipped: true };
  }

  if (dryRun) {
    const planned = caseType.entries.length + (addCorrection ? 1 : 0);
    return { entries: [], created: planned, skipped: false };
  }

  const createdEntries = [];
  let version = record.version ?? 1;
  let sequence = 0;

  for (const [entryType, content] of caseType.entries) {
    const createdAt = daysAgoIso(105 - sequence * 12 + (patient.full_name.length % 5));
    const { data: entry, error } = await admin
      .from('clinical_entries')
      .insert({
        clinic_id: clinicId,
        record_id: record.id,
        patient_id: patient.id,
        dentist_id: doctorId,
        entry_type: entryType,
        content,
        version,
        created_at: createdAt,
      })
      .select('id, entry_type, content, created_at')
      .single();
    if (error) fail(`No se pudo crear la entrada ${entryType} de ${patient.full_name}`, error);

    const { error: versionError } = await admin
      .from('clinical_records')
      .update({ version: version + 1 })
      .eq('id', record.id)
      .eq('version', version);
    if (versionError) fail(`No se pudo actualizar la versión de la historia de ${patient.full_name}`, versionError);

    version += 1;
    createdEntries.push(entry);
    sequence += 1;

    if (addCorrection && entryType === 'diagnostico') {
      const correctionCreatedAt = daysAgoIso(104 - sequence * 12);
      const { data: correction, error: correctionError } = await admin
        .from('clinical_entries')
        .insert({
          clinic_id: clinicId,
          record_id: record.id,
          patient_id: patient.id,
          dentist_id: doctorId,
          entry_type: 'correccion',
          content:
            'Se corrige la entrada de diagnóstico: tras la revisión radiográfica se confirma la pieza afectada y se ajusta el plan de tratamiento. La presente corrección reemplaza la anotación anterior sin eliminarla.',
          corrects_entry_id: entry.id,
          version,
          created_at: correctionCreatedAt,
        })
        .select('id, entry_type, content, created_at')
        .single();
      if (correctionError) fail(`No se pudo crear la corrección de ${patient.full_name}`, correctionError);

      const { error: correctionVersionError } = await admin
        .from('clinical_records')
        .update({ version: version + 1 })
        .eq('id', record.id)
        .eq('version', version);
      if (correctionVersionError) {
        fail(`No se pudo actualizar la versión tras la corrección de ${patient.full_name}`, correctionVersionError);
      }

      version += 1;
      createdEntries.push(correction);
      sequence += 1;
    }
  }

  return { entries: createdEntries, created: createdEntries.length, skipped: false };
}

async function listOdontogramStates(clinicId, patientId) {
  const { data, error } = await admin
    .from('odontogram_states')
    .select('id, tooth_code, surface, status, version, created_at')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId);
  if (error) fail(`No se pudo consultar el odontograma del paciente ${patientId}`, error);
  return data ?? [];
}

async function ensureOdontogram(clinicId, patient, caseType, doctorId, dryRun) {
  const existing = await listOdontogramStates(clinicId, patient.id);
  if (existing.length > 0) {
    return { created: 0, skipped: true };
  }

  if (dryRun) return { created: caseType.odontogram.length + 1, skipped: false };

  let created = 0;
  const states = caseType.odontogram;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const { error } = await admin.from('odontogram_states').insert({
      clinic_id: clinicId,
      patient_id: patient.id,
      dentist_id: doctorId,
      tooth_code: state.tooth,
      surface: state.surface,
      status: state.status,
      proposed_treatment: state.proposed ?? null,
      completed_treatment: state.completed ?? null,
      version: 1,
      created_at: daysAgoIso(60 - i * 4 + (patient.full_name.length % 7)),
    });
    if (error) fail(`No se pudo crear el estado de odontograma de ${patient.full_name}`, error);
    created += 1;
  }

  // Segunda versión append-only: evolución de la primera lesión tratada.
  const first = states[0];
  if (first) {
    let followUp = null;
    if (first.status === 'caries') {
      followUp = { status: 'obturado', completed: 'Resina compuesta' };
    } else if (first.status === 'fractura') {
      followUp = { status: 'obturado', completed: 'Reconstrucción con resina' };
    } else if (first.status === 'extraccion_indicada') {
      followUp = { status: 'ausente', completed: 'Extracción realizada' };
    }

    if (followUp) {
      const { error } = await admin.from('odontogram_states').insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        dentist_id: doctorId,
        tooth_code: first.tooth,
        surface: first.surface,
        status: followUp.status,
        proposed_treatment: null,
        completed_treatment: followUp.completed,
        version: 2,
        created_at: daysAgoIso(10 + (patient.full_name.length % 5)),
      });
      if (error) fail(`No se pudo crear la evolución del odontograma de ${patient.full_name}`, error);
      created += 1;
    }
  }

  return { created, skipped: false };
}

async function uploadAttachment(clinicId, patient, entry, fileName, fileType, buffer, createdAt) {
  const contentType = fileType === 'PDF' ? 'application/pdf' : 'image/png';
  const fileId = randomUUID();
  const storagePath = `${clinicId}/${patient.id}/${entry.id}/${fileId}-${sanitizeFileName(fileName)}`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (uploadError) fail(`No se pudo subir ${fileName} a Storage`, uploadError);

  const { data, error } = await admin
    .from('clinical_attachments')
    .insert({
      clinic_id: clinicId,
      entry_id: entry.id,
      patient_id: patient.id,
      file_name: fileName,
      file_type: fileType,
      file_size_bytes: buffer.length,
      storage_path: storagePath,
      created_at: createdAt,
    })
    .select('id, file_name, file_type')
    .single();

  if (error) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    fail(`No se pudo registrar el adjunto ${fileName}`, error);
  }

  return data;
}

async function ensureAttachments(clinicId, patient, entries, clinicName, doctorName, skipStorage, dryRun) {
  if (skipStorage) return { created: 0, skipped: true };

  const { data: existing, error } = await admin
    .from('clinical_attachments')
    .select('id, file_name, entry_id')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patient.id);
  if (error) fail(`No se pudieron consultar los adjuntos de ${patient.full_name}`, error);

  const existingNames = new Set((existing ?? []).map((item) => item.file_name));
  const diagnosis = entries.find((entry) => entry.entry_type === 'diagnostico');
  const procedure = entries.find((entry) => entry.entry_type === 'procedimiento');
  if (!diagnosis) return { created: 0, skipped: true };

  const created = [];

  if (!existingNames.has(`informe_diagnostico_${patient.document_number}.pdf`)) {
    if (dryRun) {
      created.push({ file_name: `informe_diagnostico_${patient.document_number}.pdf` });
    } else {
      const pdf = buildPdf({
        title: 'Informe de diagnóstico odontológico',
        subtitle: `${clinicName} · Documento de demostración`,
        lines: [
          `Paciente: ${patient.full_name}`,
          `Documento: ${patient.document_type} ${patient.document_number}`,
          `Edad: ${Math.floor((Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))} años`,
          `Profesional: ${doctorName}`,
          '',
          `Diagnóstico: ${diagnosis.content}`,
          '',
          'Este documento forma parte de la historia clínica electrónica y fue generado para fines de demostración.',
        ],
      });
      const createdAt = new Date(new Date(diagnosis.created_at).getTime() + 60 * 60 * 1000).toISOString();
      created.push(
        await uploadAttachment(
          clinicId,
          patient,
          diagnosis,
          `informe_diagnostico_${patient.document_number}.pdf`,
          'PDF',
          pdf,
          createdAt
        )
      );
    }
  }

  if (procedure && !skipStorage && !existingNames.has(`radiografia_panoramica_${patient.document_number}.png`)) {
    if (dryRun) {
      created.push({ file_name: `radiografia_panoramica_${patient.document_number}.png` });
    } else {
      const png = buildRadiographPng(480, 260, patient.document_number.split('').reduce((acc, c) => acc + c.charCodeAt(0), 7));
      const createdAt = new Date(new Date(procedure.created_at).getTime() + 90 * 60 * 1000).toISOString();
      created.push(
        await uploadAttachment(
          clinicId,
          patient,
          procedure,
          `radiografia_panoramica_${patient.document_number}.png`,
          'PNG',
          png,
          createdAt
        )
      );
    }
  }

  return { created: created.length, skipped: created.length === 0 };
}

function overlaps(startIso, endIso, existing) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const existingStart = new Date(existing.scheduled_at).getTime();
  const existingEnd = new Date(existing.ends_at).getTime();
  return start < existingEnd && end > existingStart;
}

async function ensureAppointments({
  clinicId,
  clinicIndex,
  patients,
  doctors,
  receptionists,
  admins,
  daysBack,
  daysForward,
  dryRun,
}) {
  const existing = await listAppointments(clinicId);
  const existingKeys = new Set(
    existing.map((item) => `${item.patient_id}|${new Date(item.scheduled_at).toISOString()}`)
  );
  const activeSlots = existing.filter((item) =>
    ['programada', 'confirmada', 'en_curso'].includes(item.status)
  );

  const actor = receptionists[0] ?? admins[0] ?? doctors[0];
  const actorRole = actor?.role ?? 'recepcionista';
  const times = ['08:00', '10:00', '14:00', '16:00'];
  const durations = [30, 45, 60, 30];
  const today = bogotaToday();
  const nowTime = bogotaNowTime();
  const created = [];
  let skipped = 0;

  for (let offset = -daysBack; offset <= daysForward; offset++) {
    const dateStr = addDays(today, offset);
    if (dayOfWeek(dateStr) === 0) continue; // domingo

    const dayIndex = offset + daysBack;
    for (let k = 0; k < times.length; k++) {
      const patientMeta = patients[(dayIndex * times.length + k) % patients.length];
      const doctor = doctors[(dayIndex * times.length + k) % doctors.length];
      if (!patientMeta || !doctor) continue;

      const scheduledAt = isoAtBogota(dateStr, times[k]);
      const duration = durations[k];
      const endsAt = new Date(new Date(scheduledAt).getTime() + duration * 60 * 1000).toISOString();
      const key = `${patientMeta.patient.id}|${new Date(scheduledAt).toISOString()}`;
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }

      let status;
      if (offset < 0) {
        status = k === 3 && dayIndex % 6 === 0 ? 'cancelada' : 'completada';
      } else if (offset === 0) {
        status = times[k] < nowTime ? 'completada' : k >= 2 ? 'confirmada' : 'programada';
      } else {
        status = k === 3 && dayIndex % 9 === 0 ? 'cancelada' : k % 2 === 0 ? 'confirmada' : 'programada';
      }

      const active = ['programada', 'confirmada', 'en_curso'].includes(status);
      if (active && activeSlots.some((slot) => slot.dentist_id === doctor.id && overlaps(scheduledAt, endsAt, slot))) {
        skipped += 1;
        continue;
      }

      if (dryRun) {
        created.push({ patient_id: patientMeta.patient.id, scheduled_at: scheduledAt, status });
        if (active) activeSlots.push({ dentist_id: doctor.id, scheduled_at: scheduledAt, ends_at: endsAt, status });
        continue;
      }

      const scheduledMs = new Date(scheduledAt).getTime();
      // La creación nunca puede quedar en el futuro (citas futuras se crearon "hoy").
      const createdAt = new Date(
        Math.min(Date.now() - 86400000, scheduledMs - (2 + (dayIndex % 4)) * 86400000)
      ).toISOString();
      const cancelled = status === 'cancelada';
      const cancelledAt = cancelled
        ? new Date(Math.min(Date.now() - 3600000, scheduledMs - 86400000)).toISOString()
        : null;
      const { data, error } = await admin
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_id: patientMeta.patient.id,
          dentist_id: doctor.id,
          scheduled_at: scheduledAt,
          duration_min: duration,
          status,
          reason: patientMeta.caseType.reason,
          cancel_reason: cancelled ? 'Cancelada por el paciente con antelación' : null,
          cancelled_by: cancelled ? actor.id : null,
          cancelled_at: cancelledAt,
          created_by: actor.id,
          created_at: createdAt,
          updated_at: createdAt,
        })
        .select('id, patient_id, dentist_id, scheduled_at, status, created_at')
        .single();

      if (error) {
        if (error.code === '23P01') {
          skipped += 1;
          continue;
        }
        fail(`No se pudo crear la cita de ${patientMeta.patient.full_name}`, error);
      }

      created.push({ ...data, actorRole });
      if (active) {
        activeSlots.push({
          dentist_id: doctor.id,
          scheduled_at: scheduledAt,
          ends_at: endsAt,
          status,
        });
      }
    }
  }

  return { created, skipped, actor };
}

// ---------------------------------------------------------------------------
// Auditoría
// ---------------------------------------------------------------------------

function auditRow({ clinicId, userId, role, entityType, entityId, action, metadata, timestamp }) {
  return {
    clinic_id: clinicId,
    user_id: userId,
    role,
    entity_type: entityType,
    entity_id: entityId,
    action,
    timestamp: timestamp ?? new Date().toISOString(),
    result: 'success',
    metadata: metadata ?? null,
  };
}

async function flushAuditLogs(rows) {
  if (rows.length === 0) return 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await admin.from('audit_logs').insert(batch);
    if (error) fail('No se pudieron insertar los registros de auditoría', error);
  }
  return rows.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const patientsPerClinic = readInt('SEED_PATIENTS_PER_CLINIC', 12, 1, 50);
  const daysBack = readInt('SEED_DAYS_BACK', 14, 0, 90);
  const daysForward = readInt('SEED_DAYS_FORWARD', 14, 0, 90);
  const dryRun = isFlag('SEED_DRY_RUN');
  const skipStorage = isFlag('SEED_SKIP_STORAGE');

  const clinics = await listClinics();
  if (clinics.length === 0) {
    console.log('No hay consultorios para procesar.');
    return;
  }

  const summary = {
    clinics: clinics.length,
    patientsCreated: 0,
    patientsExisting: 0,
    recordsCreated: 0,
    entriesCreated: 0,
    odontogramStates: 0,
    appointmentsCreated: 0,
    appointmentsSkipped: 0,
    attachmentsCreated: 0,
    auditLogs: 0,
    customStatuses: 0,
  };

  const auditRows = [];

  for (let clinicIndex = 0; clinicIndex < clinics.length; clinicIndex++) {
    const clinic = clinics[clinicIndex];
    const users = await listClinicUsers(clinic.id);
    const doctors = users.filter((user) => user.role === 'odontologo');
    const receptionists = users.filter((user) => user.role === 'recepcionista');
    const admins = users.filter((user) => user.role === 'administrador');

    console.log(`\nConsultorio: ${clinic.name} (${clinic.id})`);
    if (doctors.length === 0) {
      console.log('  ⚠ Sin odontólogos: se omite el seed clínico de este consultorio.');
      continue;
    }

    summary.customStatuses += await ensureCustomStatuses(clinic.id, dryRun);

    const existingPatients = await listPatients(clinic.id);
    const existingByDocument = new Map(
      existingPatients.map((patient) => [
        patientKey(patient.document_type, patient.document_number),
        patient,
      ])
    );

    const patients = [];
    for (let patientIndex = 0; patientIndex < patientsPerClinic; patientIndex++) {
      const def = buildPatientDef(clinicIndex, patientIndex, patientsPerClinic);
      const caseType = CASE_TYPES[(clinicIndex * patientsPerClinic + patientIndex) % CASE_TYPES.length];
      const { patient, created } = await ensurePatient(clinic.id, def, existingByDocument, dryRun);
      if (created) summary.patientsCreated += 1;
      else summary.patientsExisting += 1;
      if (created && !dryRun) {
        auditRows.push(
          auditRow({
            clinicId: clinic.id,
            userId: (receptionists[0] ?? admins[0] ?? doctors[0]).id,
            role: (receptionists[0] ?? admins[0] ?? doctors[0]).role,
            entityType: 'paciente',
            entityId: patient.id,
            action: 'create',
            metadata: {
              document_type: def.document_type,
              document_number: def.document_number,
              source: SEED_TAG,
            },
            timestamp: def.created_at,
          })
        );
      }
      patients.push({ patient, def, caseType });
    }

    for (let index = 0; index < patients.length; index++) {
      const { patient, caseType } = patients[index];
      const doctor = doctors[index % doctors.length];
      const addCorrection = index === 0;

      const { record, created: recordCreated } = await ensureClinicalRecord(clinic.id, patient, dryRun);
      if (recordCreated) summary.recordsCreated += 1;

      const entryResult = await ensureClinicalEntries(
        clinic.id,
        patient,
        record,
        caseType,
        doctor.id,
        addCorrection,
        dryRun
      );
      summary.entriesCreated += entryResult.created;

      if (!dryRun && entryResult.created > 0) {
        for (const entry of entryResult.entries) {
          auditRows.push(
            auditRow({
              clinicId: clinic.id,
              userId: doctor.id,
              role: doctor.role,
              entityType: 'historia_clinica',
              entityId: entry.id,
              action: entry.entry_type === 'correccion' ? 'correccion' : 'create',
              metadata: {
                entry_type: entry.entry_type,
                record_id: record.id,
                source: SEED_TAG,
              },
              timestamp: entry.created_at,
            })
          );
        }
      }

      const odontogramResult = await ensureOdontogram(
        clinic.id,
        patient,
        caseType,
        doctor.id,
        dryRun
      );
      summary.odontogramStates += odontogramResult.created;

      if (!dryRun && odontogramResult.created > 0) {
        const states = await listOdontogramStates(clinic.id, patient.id);
        for (const state of states) {
          auditRows.push(
            auditRow({
              clinicId: clinic.id,
              userId: doctor.id,
              role: doctor.role,
              entityType: 'odontograma',
              entityId: state.id,
              action: 'create',
              metadata: {
                tooth_code: state.tooth_code,
                surface: state.surface,
                status: state.status,
                version: state.version,
                source: SEED_TAG,
              },
              timestamp: state.created_at,
            })
          );
        }
      }

      const attachmentResult = await ensureAttachments(
        clinic.id,
        patient,
        entryResult.entries,
        clinic.name,
        doctor.full_name,
        skipStorage,
        dryRun
      );
      summary.attachmentsCreated += attachmentResult.created;

      if (!dryRun && attachmentResult.created > 0) {
        for (const attachment of attachmentResult.created) {
          auditRows.push(
            auditRow({
              clinicId: clinic.id,
              userId: doctor.id,
              role: doctor.role,
              entityType: 'historia_clinica',
              entityId: attachment.id,
              action: 'create',
              metadata: {
                file_name: attachment.file_name,
                file_type: attachment.file_type,
                source: SEED_TAG,
              },
            })
          );
        }
      }
    }

    const appointmentResult = await ensureAppointments({
      clinicId: clinic.id,
      clinicIndex,
      patients,
      doctors,
      receptionists,
      admins,
      daysBack,
      daysForward,
      dryRun,
    });
    summary.appointmentsCreated += appointmentResult.created.length;
    summary.appointmentsSkipped += appointmentResult.skipped;

    if (!dryRun) {
      for (const appointment of appointmentResult.created) {
        auditRows.push(
          auditRow({
            clinicId: clinic.id,
            userId: appointmentResult.actor.id,
            role: appointmentResult.actor.role,
            entityType: 'cita',
            entityId: appointment.id,
            action: 'create',
            metadata: {
              patient_id: appointment.patient_id,
              dentist_id: appointment.dentist_id,
              scheduled_at: appointment.scheduled_at,
              status: appointment.status,
              source: SEED_TAG,
            },
            timestamp: appointment.created_at,
          })
        );

        if (appointment.status === 'cancelada') {
          auditRows.push(
            auditRow({
              clinicId: clinic.id,
              userId: appointmentResult.actor.id,
              role: appointmentResult.actor.role,
              entityType: 'cita',
              entityId: appointment.id,
              action: 'cancel',
              metadata: {
                reason: 'Cancelada por el paciente con antelación',
                source: SEED_TAG,
              },
              timestamp: appointment.created_at,
            })
          );
        }
      }
    }
  }

  if (!dryRun) {
    summary.auditLogs = await flushAuditLogs(auditRows);
  }

  console.log('\nResumen');
  console.log(`  Consultorios:              ${summary.clinics}`);
  console.log(`  Pacientes creados:         ${summary.patientsCreated}`);
  console.log(`  Pacientes ya existentes:   ${summary.patientsExisting}`);
  console.log(`  Historias creadas:         ${summary.recordsCreated}`);
  console.log(`  Entradas clínicas:         ${summary.entriesCreated}`);
  console.log(`  Estados de odontograma:    ${summary.odontogramStates}`);
  console.log(`  Citas creadas:             ${summary.appointmentsCreated}`);
  console.log(`  Citas omitidas:            ${summary.appointmentsSkipped}`);
  console.log(`  Adjuntos creados:          ${summary.attachmentsCreated}`);
  console.log(`  Estados personalizados:    ${summary.customStatuses}`);
  console.log(`  Registros de auditoría:    ${summary.auditLogs}`);

  if (dryRun) {
    console.log('\nDry-run: no se escribió nada en Supabase.');
  } else {
    console.log('\nListo. Puedes iniciar sesión como administrador u odontólogo para ver los datos.');
  }
}

main().catch((error) => {
  console.error('\nError en el seed clínico:', error.message);
  process.exitCode = 1;
});
