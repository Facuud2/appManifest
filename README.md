# Manifest Journal — Santuario Personal de Manifestación (PWA)

> Un espacio digital íntimo, sereno y luminoso para cultivar la presencia, manifestar intenciones conectadas a acciones tangibles, organizar compromisos conscientes y liberar cargas emocionales.

---

## 🌸 1. Visión y Dirección de Arte

**Manifest Journal** no es un administrador de tareas convencional ni un simple diario con una capa superficial de colores pastel. Es un refugio personal diseñado siguiendo los principios de la app *Manifest (iOS App Store)*:

- **Paleta Rainbow Pastel Iridescente:**
  - Rosa pastel (`#F6C9D9`), Lavanda etérea (`#DCCFFF`), Celeste cielo (`#CBE9F8`), Azul sereno (`#D6E4FA`), Menta fresca (`#D0EFDF`), Mantequilla tibia (`#F8EDB9`), Melocotón suave (`#F7D9CB`), Blanco cálido (`#FFFCF8`) y Tinta de pizarra ciruela (`#493E55`).
- **Glassmorphism y Liquid Glass:** Superficies translúcidas con `backdrop-filter: blur(16px-24px)`, bordes de luz blanca sutiles, reflejos difusos y sombras ambientales etéreas.
- **Tipografía Editorial y Humana:** Fuentes serifas de alto carácter (*Playfair Display*, *New York*, *Georgia*) para encabezados e intenciones, combinadas con sans-serifs de alta legibilidad para el cuerpo y los controles del sistema.
- **Anti-Slop & Editorial Rigor:** Libre de clichés de IA (sin rejillas 3x idénticas, sin degradados violeta genéricos, sin copys robóticos ni contadores ficticios).

---

## 🛠️ 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Core Framework** | Next.js 15 (App Router) + React 19 | Arquitectura modular moderna, renderizado cliente reactivo y compilación optimizada. |
| **Tipado Estricto** | TypeScript (Strict Mode) | Modelos de dominio tipados al 100% sin uso de `any`. |
| **Estilos & Diseño** | Tailwind CSS + CSS Variables | Tokens cromáticos centralizados y soporte nativo de iOS Safe Areas (`env(safe-area-inset-*)`). |
| **Estado Global** | Zustand | Almacén reactivo desacoplado con sincronización cruzada entre pestañas (`storage` event). |
| **Validación de Datos** | Zod | Validación de esquemas para todas las entidades y verificación estricta de copias de seguridad. |
| **Animaciones & Rituales**| Framer Motion + Canvas Confetti | Transiciones semánticas de pantalla, microinteracciones y el ritual de disolución y liberación. |
| **Iconografía** | Lucide React | Iconos vectoriales minimalistas y coherentes sin depender de emojis del sistema. |
| **PWA & Offline** | Web Manifest + Service Worker nativo | Instalable en iOS / Android, soporte standalone y caché offline. |
| **Despliegue** | Vercel | Optimizado de forma nativa con `vercel.json` y Edge runtime para Next.js 15. |

---

## 🏛️ 3. Arquitectura del Proyecto

```
appManifest/
├── public/
│   ├── icons/
│   │   └── icon.svg              # Icono vectorial oficial con aura iridiscente y destellos
│   ├── manifest.webmanifest      # PWA Web App Manifest (standalone, theme-color, iconos)
│   └── sw.js                     # Service Worker con estrategia de caché offline
├── src/
│   ├── app/
│   │   ├── globals.css           # Tokens CSS, Liquid Glassmorphism, Safe Areas y Motion Tokens
│   │   ├── layout.tsx            # Metadata PWA, Viewport cover, fuentes e iconos iOS
│   │   └── page.tsx              # Orquestador principal de vistas y ciclo de vida cliente
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx     # Cabecera con saludo temporal, racha y acceso a instalación
│   │   │   └── BottomNavigation.tsx # Barra de navegación flotante con cápsula líquida activa
│   │   ├── pwa/
│   │   │   └── PwaInstallGuide.tsx  # Guía paso a paso contextual para Safari iOS y Android
│   │   └── ui/
│   │       └── ToastContainer.tsx   # Sistema de notificaciones no invasivas en cristal
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx # Inicio con afirmación diaria, selector de energía y resumen vivo
│   │   ├── journal/
│   │   │   └── JournalView.tsx   # 5 modalidades de escritura, guardado automático y filtros
│   │   ├── agenda/
│   │   │   └── AgendaView.tsx    # Vista cronológica y selector semanal de compromisos
│   │   ├── goals/
│   │   │   └── GoalsView.tsx     # Intenciones divididas en acciones tangibles con progreso real
│   │   ├── release/
│   │   │   └── ReleaseRitual.tsx # Ritual simbólico de liberación con disolución y eliminación total
│   │   ├── tracking/
│   │   │   └── TrackingView.tsx  # Métricas de constancia, hitos desbloqueables y reflexiones
│   │   ├── settings/
│   │   │   └── SettingsView.tsx  # Ajustes de usuario, exportación e importación JSON
│   │   └── space/
│   │       └── MySpaceView.tsx   # Contenedor modular de Seguimiento, Liberación y Ajustes
│   ├── schemas/
│   │   └── index.ts              # Esquemas de validación Zod
│   ├── services/
│   │   └── storage.ts            # Capa desacoplada de persistencia LocalStorage con versionado
│   ├── store/
│   │   └── index.ts              # Store global de Zustand
│   └── types/
│       └── index.ts              # Contratos TypeScript de las entidades del dominio
├── netlify.toml                  # Configuración de despliegue para Netlify
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.ts            # Paleta cromática, tipografías y sombras de cristal
└── tsconfig.json                 # Configuración de TypeScript con alias @/*
```

---

## 📱 4. Funcionalidades Principales

### 4.1. Dashboard / Inicio Temporal y Reactivo
- Saludo inteligente contextual según la hora del día (*Buenos días*, *Buenas tardes*, *Buenas noches*).
- Afirmación del día con posibilidad de rotar e inspirar nuevas perspectivas.
- Selector de vibración energética diaria (*Radiante*, *Serena*, *Inspirada*, *Agradecida*, *Reflexiva*).
- Accesos directos reactivos a compromisos del día e intenciones activas.

### 4.2. Cuaderno de Manifestación (Diario)
- 5 Modalidades de escritura personalizadas con orientaciones intuitivas:
  - **Manifestación:** Visualización y redacción en tiempo presente.
  - **Gratitud:** Enfoque en tres detalles luminosos de la jornada.
  - **Afirmaciones:** Creación y anclaje de decretos amables.
  - **Reflexión Guiada:** Preguntas de autoconocimiento.
  - **Escritura Libre:** Espacio abierto y desahogado sin juicios.
- Indicador de guardado automático en tiempo real.
- Búsqueda instantánea y filtrado por modalidad y etiquetas.
- Vinculación opcional directa con una intención activa.

### 4.3. Agenda Consciente
- Registro de citas y compromisos con fecha y horario opcional.
- Barra semanal interactiva de navegación día a día con indicadores de actividad.
- Vista por día o vista cronológica completa.
- Marcado de cumplimiento con tachado suave y retroalimentación táctil.

### 4.4. Sistema de Intenciones, Historias de Éxito & Visiones Futuras
- **Intenciones en Curso:** Conexión de deseos con acciones tangibles y progreso derivado matemáticamente.
- **Historias de Éxito (*Success Stories*):** Muro sagrado de manifestaciones que ya se materializaron en la realidad, documentando la historia real, los detalles y señales que pasaban mientras ocurría, el cambio de mentalidad experimentado y la nota de gratitud.
- **Manifestaciones Futuras (*Future Scripting*):** Espacio de siembra con horizontes temporales (3 meses, 6 meses, 1 año, 3 años o fecha exacta), redacción sensorial en presente, cartas al Yo del futuro y opción de cápsula sellada.

### 4.5. Señales & Sincronías del Camino (*Signs & Breadcrumbs*)
- Registro y clasificación de señales previas a la manifestación:
  - Números repetidos / Horas espejo (*11:11, 444, 777*).
  - Sueños reveladores y mensajes intuitivos.
  - Coincidencias mágicas y encuentros casuales significativos.
  - Símbolos físicos en el camino (*plumas, animales, sincronicidades*).
- Accesible tanto desde la pestaña dedicada en **Mi Espacio** como desde la modalidad directa **Señal / Sincronía** del **Diario**.

### 4.6. Ritual de Liberación (Release Ritual)
- Espacio sagrado para soltar miedos, inseguridades y pensamientos limitantes.
- **Fase 1:** Escritura íntima en un pergamino digital suave.
- **Fase 2:** Reflexión opcional guiada (reconocer qué enseña y qué se elige a partir de ahora).
- **Fase 3:** Ceremonia animada de combustión y disolución suave con desvanecimiento de partículas.
- **Fase 4:** Destrucción definitiva del contenido del almacenamiento local, garantizando privacidad y ligereza mental.

### 4.6. Seguimiento & Hitos
- Racha de presencia calculada sin generar culpa por días salteados.
- Hitos desbloqueables automáticos (*Primer Destello*, *Manifestación en Acción*, *Alma Reflexiva*, *Vuelo Ligero*, *Ritmo Sereno*).
- Registro diario de reflexiones nocturnas con aprendizajes y motivos de gratitud.

### 4.7. Tutorial Interactivo con Foco & Láminas Semiopacas
- **Sistema Onboarding Spotlight Dinámico:**
  - Capa oscura semiopaca (`rgba(8, 6, 12, 0.78)`) con máscara SVG que realiza un recorte preciso iluminado sobre el botón correspondiente.
  - **Adaptación automática Móvil / Escritorio:**
    - En móvil ilumina los botones de la barra inferior fija (`mobile-nav-*`).
    - En computadora ilumina los accesos de la barra lateral izquierda líquida (`desktop-nav-*`).
  - Navegación paso a paso con indicador de progreso de 5 pasos, botones de *Siguiente*, *Atrás*, *Saltar* y botón final *Finalizar Tutorial*.
  - **Persistencia en LocalStorage:** El estado `tutorialCompleted: true` queda anclado en `localStorage`. Se puede volver a ejecutar en cualquier momento desde el botón dedicado en **Ajustes**.

### 4.8. Seguridad, Privacidad y Copias de Seguridad
- **100% Local:** Todos los datos se almacenan en el dispositivo del usuario (`localStorage`).
- **Exportación en un clic:** Descarga de archivo `.json` estructurado con fecha.
- **Restauración con validación estricta Zod:** Comprobación de versión de esquema y prevención de corrupción de datos.

---

## 🚀 5. Instalación y Ejecución Local

### Requisitos previos
- **Node.js:** v18.0.0 o superior (recomendado v20+ o v26 LTS).
- **npm:** v9.0.0 o superior.

### Pasos de arranque
```bash
# 1. Clonar el repositorio y entrar a la carpeta
cd appManifest

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# Visita http://localhost:3000
```

### Comandos disponibles
- `npm run dev`: Inicia el servidor de desarrollo local en `http://localhost:3000`.
- `npm run build`: Compila el proyecto con TypeScript estricto y empaqueta las páginas de producción.
- `npm run lint`: Ejecuta el linter de ESLint con las reglas de Next.js.
- `npm run start`: Inicia el servidor de producción optimizado.

---

## 📲 6. Instalación PWA (Progressive Web App)

### En iOS (Safari en iPhone / iPad):
1. Abre la aplicación en Safari.
2. Toca el botón **Compartir** (icono de cuadrado con flecha hacia arriba) en la barra inferior.
3. Desplázate hacia abajo y pulsa **«Añadir a pantalla de inicio»**.
4. Pulsa **«Añadir»** en la esquina superior derecha.
5. La app se abrirá a pantalla completa en modo *standalone*, respetando las áreas seguras (*Safe Areas*).

### En Android (Chrome / Brave / Edge):
1. Abre la aplicación en el navegador.
2. Toca el banner de instalación o el menú de tres puntos (⋮).
3. Selecciona **«Instalar aplicación»** o **«Añadir a pantalla principal»**.

---

## 🌐 7. Despliegue en Vercel

El repositorio está optimizado de forma nativa para Vercel mediante `vercel.json`:
1. Conecta tu repositorio de GitHub (`Facuud2/appManifest`) a tu panel de Vercel.
2. Vercel detectará automáticamente Next.js 15:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** Automatic (`.next`)
3. En **Project Settings > Environment Variables**, añade tus credenciales de base de datos Turso:
   - `TURSO_DATABASE_URL`: Tu URL de base de datos de Turso (`libsql://...`)
   - `TURSO_AUTH_TOKEN`: Tu token de autenticación de Turso
4. Haz clic en **Deploy**. Cada `git push origin main` desplegará automáticamente la versión más reciente en producción.

---

## 🧪 8. Resultados de QA y Pruebas Realizadas

Se ejecutó una auditoría integral funcional y visual mediante la skill `/browser` en emulación móvil (iPhone 390×844):

- **Prueba A (Diario):** Creación de entrada con tag, guardado en el store, visualización instantánea y persistencia al recargar. [Superada]
- **Prueba B (Objetivos):** Definición de intención, agregado de subtareas tangibles, marcado como completado y recálculo reactivo del porcentaje de 0% a 100%. [Superada]
- **Prueba C (Agenda):** Agendado de compromiso consciente con hora, visualización en el feed del día y tachado visual reactivo. [Superada]
- **Prueba D (Ritual de Liberación):** Redacción en pergamino, proceso de 3 fases, confirmación con diálogo de seguridad, disolución animada y destrucción definitiva del registro. [Superada]
- **Prueba E (Persistencia & Esquemas):** Validación de datos con Zod y persistencia en `localStorage`. [Superada]
- **Prueba F (Copias de Seguridad):** Descarga de copia JSON y restauración verificada. [Superada]
- **Auditoría Anti-Slop:** Componentes depurados sin emojis sueltos de UI (reemplazados por iconografía vectorial Lucide), tipografía editorial y proporciones armónicas de cristal. [Superada]
- **Compilación TypeScript & Lint:** 0 errores de compilación, 0 errores de ESLint. [Superado]

---

*Desarrollado con sensibilidad, elegancia y excelencia técnica.*
