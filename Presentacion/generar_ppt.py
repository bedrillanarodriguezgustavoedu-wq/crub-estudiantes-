# -*- coding: utf-8 -*-
"""Genera la presentación PPT de GalyCrud con capturas reales de la app."""
from pathlib import Path
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

BASE = Path(__file__).resolve().parent
IMG = BASE / "images"
OUT = BASE.parent / "PresentacionGalyCrud.pptx"

NAVY = RGBColor(0x0B, 0x1F, 0x3A)
NAVY2 = RGBColor(0x12, 0x2C, 0x4F)
TEAL = RGBColor(0x0E, 0x74, 0x90)
CYAN = RGBColor(0x22, 0xD3, 0xEE)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT = RGBColor(0xF1, 0xF5, 0xF9)
GRAY = RGBColor(0x47, 0x55, 0x69)
MID = RGBColor(0x94, 0xA3, 0xB8)
GREEN = RGBColor(0x16, 0xA3, 0x4A)
BORDER = RGBColor(0xDC, 0xE3, 0xEC)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

W, H = 13.333, 7.5


def bg(slide, color=LIGHT):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def rect(slide, x, y, w, h, fill, line=None, rounded=False, transparency=None):
    shp = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if transparency is not None:
        shp.fill.transparency = transparency
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(1)
    if rounded:
        try:
            shp.adjustments[0] = 0.12
        except Exception:
            pass
    return shp


def text(slide, x, y, w, h, value, size=18, bold=False, color=NAVY,
         align=PP_ALIGN.LEFT, valign=MSO_ANCHOR.TOP, font="Aptos",
         italic=False, margin=0.02):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(margin)
    tf.margin_right = Inches(margin)
    tf.margin_top = Inches(margin)
    tf.margin_bottom = Inches(margin)
    tf.vertical_anchor = valign
    p = tf.paragraphs[0]
    p.alignment = align
    p.text = value
    p.font.name = font
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.italic = italic
    p.font.color.rgb = color
    return box


def rich(slide, x, y, w, h, lines, size=17, color=NAVY, align=PP_ALIGN.LEFT,
         valign=MSO_ANCHOR.TOP, space_after=7):
    """lines: list of (text, bold, color, size)"""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(0.02)
    tf.margin_right = Inches(0.02)
    tf.vertical_anchor = valign
    for i, item in enumerate(lines):
        value, bold, clr, sz = (item + (None,) * 4)[:4]
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = value or ""
        p.alignment = align
        p.space_after = Pt(space_after)
        p.font.name = "Aptos"
        p.font.size = Pt(sz or size)
        p.font.bold = bool(bold)
        p.font.color.rgb = clr or color
    return box


def bullets(slide, x, y, w, h, items, size=16, color=GRAY, marker="•  ",
            space_after=10):
    lines = [(marker + it, False, color, size) for it in items]
    return rich(slide, x, y, w, h, lines, size=size, space_after=space_after)


def code(slide, x, y, w, h, value, size=12.5, color=RGBColor(0xE2, 0xE8, 0xF0)):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(0.04)
    tf.margin_right = Inches(0.04)
    tf.margin_top = Inches(0.04)
    for i, line in enumerate(value.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.space_after = Pt(1)
        p.font.name = "Consolas"
        p.font.size = Pt(size)
        p.font.color.rgb = color
    return box


def header(slide, kicker, title, subtitle=None, dark=False):
    fg = WHITE if dark else NAVY
    sub = MID if dark else GRAY
    text(slide, 0.65, 0.42, 11.8, 0.3, kicker.upper(), 11, True, CYAN)
    text(slide, 0.65, 0.72, 11.9, 0.62, title, 30, True, fg)
    if subtitle:
        text(slide, 0.68, 1.33, 11.6, 0.42, subtitle, 14, False, sub)


def footer(slide, n, dark=False):
    line = RGBColor(0x24, 0x45, 0x6B) if dark else BORDER
    rect(slide, 0.65, 7.02, 12.03, 0.012, line)
    text(slide, 0.68, 7.08, 7.0, 0.24, "GalyCrud  ·  CRUD de estudiantes", 9,
         False, MID if dark else MID)
    text(slide, 11.7, 7.08, 0.95, 0.24, f"{n:02d}", 9, True,
         MID if dark else GRAY, align=PP_ALIGN.RIGHT)


def add_notes(slide, notes):
    try:
        slide.notes_slide.notes_text_frame.text = notes
    except Exception:
        pass


def image_fit(slide, path, x, y, w, h, border=True, bg_color=WHITE, pad=0.08):
    rect(slide, x - 0.04, y - 0.04, w + 0.08, h + 0.08,
         BORDER if border else bg_color, rounded=True)
    rect(slide, x, y, w, h, bg_color, rounded=True)
    iw, ih = Image.open(path).size
    avail_w, avail_h = w - 2 * pad, h - 2 * pad
    scale = min(avail_w / iw, avail_h / ih)
    nw, nh = iw * scale, ih * scale
    px, py = x + (w - nw) / 2, y + (h - nh) / 2
    slide.shapes.add_picture(str(path), Inches(px), Inches(py),
                             width=Inches(nw), height=Inches(nh))


def chip(slide, x, y, w, label, fill=TEAL, fg=WHITE, h=0.36, size=11):
    rect(slide, x, y, w, h, fill, rounded=True)
    text(slide, x + 0.05, y + 0.04, w - 0.1, h - 0.06, label, size, True, fg,
         align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE)


# ---------------------------------------------------------------- 1. Portada
s = prs.slides.add_slide(BLANK)
bg(s, NAVY)
rect(s, 8.35, 0, 4.983, H, NAVY2)
rect(s, 0, 0, 0.16, H, CYAN)
chip(s, 0.75, 0.65, 1.85, "PROYECTO WEB", fill=TEAL)
text(s, 0.75, 1.35, 7.2, 1.15, "GalyCrud", 54, True, WHITE)
text(s, 0.78, 2.42, 7.2, 0.65, "Gestión de estudiantes", 27, True, CYAN)
text(s, 0.8, 3.22, 7.0, 1.05,
     "CRUD completo con ASP.NET Core 8, Angular 17,\nSQLite y autenticación JWT.",
     18, False, RGBColor(0xD7, 0xE3, 0xEF))
rect(s, 0.8, 4.6, 5.9, 0.014, RGBColor(0x2E, 0x52, 0x7C))
bullets(s, 0.82, 4.88, 6.6, 1.2,
        ["Alta, consulta, edición y baja",
         "Búsqueda, filtros, orden y paginación",
         "Roles, tests, Docker e CI"],
        size=15, color=RGBColor(0xC7, 0xD6, 0xE5), space_after=6)
text(s, 0.82, 6.55, 6.6, 0.3, "Presentación rápida  ·  Noviembre 2026", 11,
     False, MID)
image_fit(s, IMG / "01-login.png", 9.15, 0.95, 3.15, 5.55,
          border=False, bg_color=WHITE, pad=0.05)
text(s, 9.05, 6.62, 3.4, 0.26, "Pantalla de acceso", 10, False,
     RGBColor(0x9F, 0xB6, 0xCD), align=PP_ALIGN.CENTER)
add_notes(s, "Presentar GalyCrud como una aplicación web completa para administrar el directorio estudiantil de un colegio.")

# ---------------------------------------------------------------- 2. Problema
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Contexto", "El problema que resolvemos",
       "Una gestión académica que dependía de hojas y procesos repetitivos.")
cards = [
    ("Datos dispersos", "La información de cada estudiante vivía en archivos separados y difíciles de consultar."),
    ("Procesos manuales", "Registrar, editar o eliminar implicaba repetir pasos y propiciaba errores."),
    ("Sin control de acceso", "Cualquier persona podía ver o modificar datos sensibles del colegio."),
]
for i, (t, d) in enumerate(cards):
    x = 0.7 + i * 4.15
    rect(s, x, 2.05, 3.85, 2.5, WHITE, line=BORDER, rounded=True)
    rect(s, x, 2.05, 3.85, 0.1, TEAL if i != 2 else NAVY)
    text(s, x + 0.25, 2.38, 3.35, 0.5, t, 20, True, NAVY)
    text(s, x + 0.25, 2.98, 3.35, 1.25, d, 14, False, GRAY)
rect(s, 0.7, 5.05, 11.95, 1.15, NAVY, rounded=True)
text(s, 1.0, 5.28, 11.3, 0.35, "OBJETIVO", 11, True, CYAN)
text(s, 1.0, 5.62, 11.3, 0.42,
     "Centralizar el directorio estudiantil en una interfaz web rápida, segura y fácil de usar.",
     18, True, WHITE)
footer(s, 2)
add_notes(s, "Enfatizar tres dolores: dispersión, lentitud manual y falta de permisos. El objetivo es una sola fuente de verdad.")

# ---------------------------------------------------------------- 3. Alcance
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Solución", "Qué construimos",
       "Un producto completo: interfaz, API, persistencia y despliegue.")
tiles = [
    ("＋", "Alta", "Formulario validado"),
    ("☰", "Consulta", "Listado y detalles"),
    ("✎", "Edición", "Cambios con versión"),
    ("🗑", "Baja", "Confirmación segura"),
    ("⌕", "Búsqueda", "Filtros y orden"),
    ("▤", "Estadísticas", "Totales en vivo"),
]
for i, (icon, t, d) in enumerate(tiles):
    col, row = i % 3, i // 3
    x, y = 0.7 + col * 4.15, 1.95 + row * 1.85
    rect(s, x, y, 3.85, 1.55, WHITE, line=BORDER, rounded=True)
    rect(s, x + 0.22, y + 0.25, 0.72, 0.72, LIGHT, rounded=True)
    text(s, x + 0.22, y + 0.36, 0.72, 0.45, icon, 22, True, TEAL,
         align=PP_ALIGN.CENTER)
    text(s, x + 1.12, y + 0.28, 2.5, 0.4, t, 18, True, NAVY)
    text(s, x + 1.12, y + 0.78, 2.5, 0.5, d, 13, False, GRAY)
rect(s, 0.7, 5.85, 11.95, 0.72, NAVY2, rounded=True)
text(s, 0.98, 6.05, 11.4, 0.36,
     "Backend por capas  +  Frontend standalone  +  SQLite  +  JWT  +  Docker  +  CI",
     15, True, WHITE, align=PP_ALIGN.CENTER)
footer(s, 3)
add_notes(s, "Recorrer las seis capacidades principales y cerrar diciendo que no es solo un CRUD: incluye seguridad y despliegue.")

# ---------------------------------------------------------------- 4. Arquitectura
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Arquitectura", "Cómo está organizado",
       "Tres capas desacopladas con contratos REST claros.")
boxes = [
    (0.7, 2.05, 3.35, 2.15, "FRONTEND", "Angular 17", "Componentes standalone\nReactive forms\nJWT interceptor + guard", NAVY),
    (4.98, 2.05, 3.35, 2.15, "API", "ASP.NET Core 8", "Controllers / Services / Data\nDTOs + validación\nSerilog + health + Swagger", TEAL),
    (9.26, 2.05, 3.35, 2.15, "DATOS", "SQLite + EF Core", "Colegio.db con seed\nCorreo único\nConcurrencia por versión", NAVY2),
]
for x, y, w, h, k, t, d, c in boxes:
    rect(s, x, y, w, h, WHITE, line=BORDER, rounded=True)
    rect(s, x, y, w, 0.1, c)
    text(s, x + 0.22, y + 0.28, w - 0.44, 0.25, k, 10, True, CYAN)
    text(s, x + 0.22, y + 0.62, w - 0.44, 0.45, t, 20, True, NAVY)
    text(s, x + 0.22, y + 1.17, w - 0.44, 0.85, d, 12.5, False, GRAY)
for x in (4.2, 8.48):
    text(s, x, 2.85, 0.6, 0.5, "→", 28, True, TEAL, align=PP_ALIGN.CENTER)
text(s, 6.35, 4.38, 1.6, 0.3, "HTTP / JSON", 10, True, GRAY,
     align=PP_ALIGN.CENTER)
text(s, 10.55, 4.38, 1.6, 0.3, "EF Core", 10, True, GRAY,
     align=PP_ALIGN.CENTER)
labels = [
    ("JWT + roles", 0.7, "Admin / Editor / Viewer"),
    ("Validación", 3.77, "DTOs y DataAnnotations"),
    ("Logging", 6.84, "Serilog en consola y archivo"),
    ("ETag 409", 9.91, "Control de versión"),
]
for t, x, d in labels:
    rect(s, x, 5.0, 2.7, 0.95, LIGHT, rounded=True)
    text(s, x + 0.18, 5.15, 2.35, 0.3, t, 14, True, NAVY)
    text(s, x + 0.18, 5.5, 2.35, 0.32, d, 10.5, False, GRAY)
footer(s, 4)
add_notes(s, "Explicar el flujo: Angular consume la API por HTTP; la API usa EF Core sobre SQLite. Los cuatro recuadros son transversales.")

# ---------------------------------------------------------------- 5. Login
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Demo 1", "Acceso seguro",
       "Inicio de sesión con credenciales demo y control por rol.")
image_fit(s, IMG / "01-login.png", 0.75, 1.85, 3.05, 4.75, pad=0.06)
text(s, 4.35, 1.95, 7.9, 0.45, "Una puerta de entrada clara", 22, True, NAVY)
bullets(s, 4.38, 2.55, 7.9, 2.6, [
    "Usuario y contraseña con validación en el formulario",
    "Contraseñas hasheadas con PBKDF2 en el backend",
    "Token JWT enviado en cada petición por el interceptor",
    "Guard de Angular protege las rutas privadas",
    "Tres perfiles: Admin, Editor y Viewer",
], size=15.5, space_after=11)
rect(s, 4.35, 5.25, 7.9, 1.15, NAVY, rounded=True)
text(s, 4.65, 5.45, 7.3, 0.3, "CREDENCIAL DEMO", 10, True, CYAN)
text(s, 4.65, 5.78, 7.3, 0.4, "admin  /  Admin123!", 20, True, WHITE)
footer(s, 5)
add_notes(s, "Mostrar la pantalla de login. Mencionar que las contraseñas nunca se guardan en texto plano y que el token se adjunta automáticamente.")

# ---------------------------------------------------------------- 6. Listado
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Demo 2", "Directorio estudiantil",
       "Consulta rápida con contexto estadístico en la parte superior.")
bullets(s, 0.72, 1.95, 3.5, 4.5, [
    "Búsqueda por nombre o correo",
    "Filtro por estado: todos / activos / inactivos",
    "Ordenación por ID, nombre, edad, grado, correo y estado",
    "Paginación de 8, 15 o 30 filas",
    "Estadísticas: total, activos, inactivos y edad promedio",
    "Acciones por fila según el rol del usuario",
], size=14.5, space_after=12)
image_fit(s, IMG / "02-listado.png", 4.45, 1.85, 8.15, 4.85, pad=0.07)
footer(s, 6)
add_notes(s, "Destacar que la tabla responde a búsqueda, filtro, orden y paginación sin recargar la página, y que las métricas se calculan en el backend.")

# ---------------------------------------------------------------- 7. Formulario
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Demo 3", "Alta y edición de estudiantes",
       "Formulario modal con validación inmediata y experiencia accesible.")
image_fit(s, IMG / "03-formulario.png", 0.72, 1.9, 7.45, 4.75, pad=0.07)
text(s, 8.55, 2.0, 4.0, 0.4, "Diseño cuidado", 21, True, NAVY)
bullets(s, 8.58, 2.6, 3.95, 3.6, [
    "Reactive forms con reglas obligatorias",
    "Nombre, apellido, edad, grado, correo y estado",
    "Correo único garantizado en SQLite",
    "Conflicto 409 si otro usuario editó primero",
    "Cierre con Escape, autofoco y aria-*",
], size=14, space_after=12)
rect(s, 8.55, 5.55, 4.0, 0.78, LIGHT, rounded=True)
text(s, 8.78, 5.74, 3.55, 0.42, "El mismo modal sirve para crear y editar.",
     13, True, TEAL)
footer(s, 7)
add_notes(s, "Explicar que el formulario es el mismo para alta y edición, y que el control de versión evita sobrescribir cambios ajenos.")

# ---------------------------------------------------------------- 8. API
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Demo 4", "API REST y documentación",
       "Documentación interactiva disponible en entorno de desarrollo.")
image_fit(s, IMG / "04-swagger.png", 0.72, 1.9, 7.1, 4.7, pad=0.07)
text(s, 8.2, 1.98, 4.35, 0.4, "Endpoints principales", 20, True, NAVY)
rich(s, 8.22, 2.55, 4.35, 2.35, [
    ("GET     /api/estudiantes", True, TEAL, 13),
    ("GET     /api/estudiantes/{id}", True, TEAL, 13),
    ("POST   /api/estudiantes", True, TEAL, 13),
    ("PUT     /api/estudiantes/{id}", True, TEAL, 13),
    ("DELETE /api/estudiantes/{id}", True, TEAL, 13),
    ("GET     /api/estudiantes/stats", True, TEAL, 13),
    ("POST   /api/auth/login", True, TEAL, 13),
], space_after=7)
rect(s, 8.2, 5.1, 4.35, 1.45, NAVY, rounded=True)
text(s, 8.5, 5.3, 3.8, 0.28, "SEGURIDAD", 10, True, CYAN)
text(s, 8.5, 5.62, 3.8, 0.75,
     "Bearer JWT · Permisos por rol\nCORS restringido · Errores uniformes\nHealth: /health",
     12.5, False, WHITE)
footer(s, 8)
add_notes(s, "Mostrar Swagger y enumerar los endpoints. Recordar que la documentación solo se habilita en Development.")

# ---------------------------------------------------------------- 9. Calidad
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Calidad y despliegue", "Validado y listo para ejecutar",
       "Pruebas automatizadas, contenedores e integración continua.")
stats = [
    ("13", "tests backend", "xUnit + EF InMemory"),
    ("4", "tests frontend", "Karma + Chrome Headless"),
    ("2", "imágenes Docker", "backend + frontend Nginx"),
    ("1", "pipeline CI", "build, test y docker"),
]
for i, (n, t, d) in enumerate(stats):
    x = 0.72 + i * 3.1
    rect(s, x, 2.0, 2.85, 2.15, WHITE, line=BORDER, rounded=True)
    text(s, x, 2.28, 2.85, 0.75, n, 40, True, TEAL, align=PP_ALIGN.CENTER)
    text(s, x, 3.08, 2.85, 0.35, t, 15, True, NAVY, align=PP_ALIGN.CENTER)
    text(s, x + 0.15, 3.5, 2.55, 0.42, d, 11, False, GRAY,
         align=PP_ALIGN.CENTER)
rect(s, 0.72, 4.5, 11.93, 1.75, NAVY, rounded=True)
text(s, 1.05, 4.75, 11.3, 0.3, "CÓMO EJECUTARLO", 10, True, CYAN)
rich(s, 1.05, 5.12, 11.3, 0.95, [
    ("Windows local:  ejecutar.bat  →  http://localhost:4200  +  http://localhost:5000", True, WHITE, 15),
    ("Docker:  docker compose up --build  →  frontend en 4200 y API protegida con Nginx", False, RGBColor(0xC7, 0xD6, 0xE5), 13),
    ("Verificación rápida:  /health  y  /swagger  responden correctamente", False, RGBColor(0xC7, 0xD6, 0xE5), 13),
], space_after=5)
footer(s, 9)
add_notes(s, "Cerrar con evidencia: pruebas en verde, contenedores construidos y pipeline de GitHub Actions configurado.")

# ---------------------------------------------------------------- 10. Ejemplo: alta
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Ejemplo 1", "Crear un estudiante",
       "De un formulario cargado a un registro persistido en la base de datos.")
rect(s, 0.72, 1.9, 5.75, 3.55, WHITE, line=BORDER, rounded=True)
chip(s, 1.0, 2.15, 2.6, "CAPTURA REAL · FORMULARIO", fill=TEAL)
image_fit(s, IMG / "05-ejemplo-alta.png", 1.0, 2.62, 5.2, 2.48, pad=0.05)
text(s, 1.03, 5.18, 5.15, 0.24,
     "Ejemplo: Ejemplo Demostración · 12 años · 1° Secundaria",
     10, False, GRAY)
rect(s, 6.75, 1.9, 5.85, 3.55, NAVY, rounded=True)
chip(s, 7.03, 2.15, 2.55, "RESPUESTA · API", fill=TEAL)
code(s, 7.05, 2.72, 5.25, 2.5,
     "HTTP/1.1 201 Created\n"
     "{\n"
     '  "id": 6,\n'
     '  "nombre": "Camila",\n'
     '  "apellido": "Ríos",\n'
     '  "grado": "4° Primaria",\n'
     '  "correo": "camila.rios@colegio.edu",\n'
     '  "activo": true,\n'
     '  "version": 1\n'
     "}", size=11.5)
rect(s, 0.72, 5.7, 11.88, 0.82, NAVY2, rounded=True)
text(s, 1.02, 5.9, 11.25, 0.45,
     "Resultado: aparece en la tabla y el contador pasa de 5 a 6.  Si el correo ya existe, la API devuelve 400 con un mensaje claro.",
     13.5, True, WHITE)
footer(s, 10)
add_notes(s, "Ejemplo concreto de alta: mostrar los datos que se cargan y la respuesta 201 con el id asignado por SQLite.")

# ---------------------------------------------------------------- 11. Ejemplo: buscar
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Ejemplo 2", "Buscar y filtrar",
       "Dos acciones típicas sobre el directorio estudiantil.")
rect(s, 0.72, 1.9, 5.75, 4.6, WHITE, line=BORDER, rounded=True)
chip(s, 1.0, 2.15, 2.6, "CAPTURA REAL · BÚSQUEDA", fill=TEAL)
image_fit(s, IMG / "06-ejemplo-busqueda.png", 1.0, 2.72, 5.2, 3.25, pad=0.05)
text(s, 1.03, 6.07, 5.15, 0.34,
     "Al escribir “ana” queda 1 resultado: Ana Torres. La tabla se actualiza sin recargar.",
     10.5, False, GRAY)
rect(s, 6.75, 1.9, 5.85, 4.6, WHITE, line=BORDER, rounded=True)
chip(s, 7.03, 2.15, 2.4, "FILTRO POR ESTADO", fill=TEAL)
rows = [
    ("Todos", "5 estudiantes", NAVY),
    ("Activo", "4 · Ana, Luis, Mateo y Valeria", GREEN),
    ("Inactivo", "1 · Sofía Mendoza", RGBColor(0xB4, 0x53, 0x09)),
]
for i, (label, detail, clr) in enumerate(rows):
    y = 2.82 + i * 1.0
    rect(s, 7.03, y, 5.25, 0.82, LIGHT, rounded=True)
    rect(s, 7.03, y, 0.09, 0.82, clr)
    text(s, 7.25, y + 0.1, 4.8, 0.3, label, 15, True, NAVY)
    text(s, 7.25, y + 0.44, 4.8, 0.28, detail, 12, False, GRAY)
text(s, 7.05, 5.92, 5.2, 0.4,
     "También se puede ordenar por columna o usar 15/30 filas por página.",
     12.5, False, GRAY)
rect(s, 0.72, 6.62, 11.88, 0.28, TEAL, rounded=True)
footer(s, 11)
add_notes(s, "Mostrar el ejemplo de búsqueda por 'ana' y luego el filtro de activos/inactivos con sus totales.")

# ---------------------------------------------------------------- 12. Ejemplo: editar
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Ejemplo 3", "Editar sin sobrescribir cambios",
       "Control de versión con ETag / If-Match entre dos usuarios.")
steps = [
    (0.72, NAVY, "1 · LEER",
     'GET /api/estudiantes/1\n\n'
     'ETag: "3"\n'
     'grado: "5° Primaria"'),
    (4.77, TEAL, "2 · GUARDAR",
     'PUT /api/estudiantes/1\n'
     'If-Match: "3"\n'
     '{ "grado": "6° Primaria" }\n\n'
     '200 OK  →  version 4'),
    (8.82, NAVY2, "3 · CONFLICTO",
     'PUT con If-Match: "3"\n'
     '(otro usuario, más tarde)\n\n'
     '409 Conflict\n'
     'Cambio no sobrescrito'),
]
for x, clr, label, body in steps:
    rect(s, x, 2.0, 3.78, 3.5, clr, rounded=True)
    chip(s, x + 0.22, 2.22, 1.75, label,
         fill=RGBColor(0x1D, 0x4E, 0x6B) if clr == NAVY else RGBColor(0x0A, 0x5A, 0x72))
    code(s, x + 0.22, 2.85, 3.35, 2.45, body, size=11.5)
for x in (4.55, 8.6):
    text(s, x, 3.25, 0.35, 0.5, "→", 24, True, TEAL, align=PP_ALIGN.CENTER)
rect(s, 0.72, 5.78, 11.88, 0.8, WHITE, line=BORDER, rounded=True)
text(s, 1.02, 5.98, 11.25, 0.42,
     "Resultado: si alguien guardó primero, el segundo recibe 409, recarga la versión actual y vuelve a intentar. No se pierde información.",
     13.5, True, NAVY)
footer(s, 12)
add_notes(s, "Explicar el flujo optimista: leer ETag, enviar If-Match y obtener 409 cuando la versión quedó obsoleta.")

# ---------------------------------------------------------------- 13. Ventajas
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Valor", "Ventajas del proyecto",
       "Por qué GalyCrud facilita la gestión académica del colegio.")
ventajas = [
    ("01", "Centralización", "Una sola fuente de verdad para todos los estudiantes.", NAVY),
    ("02", "Rapidez", "Búsqueda, filtros y paginación sin recargar la página.", TEAL),
    ("03", "Seguridad", "JWT, roles y contraseñas hasheadas protegen los datos.", NAVY2),
    ("04", "Confiabilidad", "Validaciones, correo único y control de versiones.", TEAL),
    ("05", "Mantenibilidad", "Código por capas: controllers, services, data y DTOs.", NAVY),
    ("06", "Despliegue fácil", "Docker, Nginx e CI dejan el proyecto listo para usar.", NAVY2),
]
for i, (num, t, d, clr) in enumerate(ventajas):
    col, row = i % 3, i // 3
    x, y = 0.72 + col * 4.15, 1.95 + row * 1.9
    rect(s, x, y, 3.85, 1.65, WHITE, line=BORDER, rounded=True)
    rect(s, x, y, 0.12, 1.65, clr)
    text(s, x + 0.32, y + 0.18, 0.6, 0.35, num, 13, True, clr)
    text(s, x + 1.0, y + 0.16, 2.6, 0.4, t, 17, True, NAVY)
    text(s, x + 0.32, y + 0.68, 3.2, 0.72, d, 12.5, False, GRAY)
rect(s, 0.72, 5.95, 11.88, 0.72, NAVY, rounded=True)
text(s, 1.02, 6.15, 11.3, 0.36,
     "Resultado: menos trabajo manual, más control y mejor experiencia para el usuario.",
     15, True, WHITE, align=PP_ALIGN.CENTER)
footer(s, 13)
add_notes(s, "Resaltar que las ventajas no son solo técnicas: se traducen en menos errores, ahorro de tiempo y confianza en los datos.")

# ---------------------------------------------------------------- 14. Lenguajes
s = prs.slides.add_slide(BLANK)
bg(s)
header(s, "Stack", "Lenguajes y tecnologías usados",
       "Estos son los lenguajes y herramientas que aparecen en el código del proyecto.")
stack = [
    ("C#", "Backend · ASP.NET Core 8", "[HttpGet] GetAll()", NAVY),
    ("TypeScript", "Frontend · Angular 17", "http.get('/api/estudiantes')", TEAL),
    ("HTML + CSS", "Interfaz y accesibilidad", '<table aria-label="...">', NAVY2),
    ("SQL / SQLite", "Base de datos real", "SELECT * FROM Estudiantes", TEAL),
    ("JSON", "Contrato entre UI y API", '{ "nombre": "Ana" }', NAVY),
    ("EF Core", "ORM, seed y consultas", "EnsureCreated()", NAVY2),
    ("JWT + PBKDF2", "Autenticación y roles", "Bearer <token>", TEAL),
    ("Docker + YAML", "Contenedores e CI", "docker compose up --build", NAVY),
]
for i, (name, role, snippet, clr) in enumerate(stack):
    col, row = i % 4, i // 4
    x, y = 0.72 + col * 3.1, 1.95 + row * 2.05
    w, h = 2.85, 1.8
    rect(s, x, y, w, h, WHITE, line=BORDER, rounded=True)
    rect(s, x, y, w, 0.1, clr)
    text(s, x + 0.18, y + 0.24, w - 0.36, 0.35, name, 16, True, NAVY)
    text(s, x + 0.18, y + 0.65, w - 0.36, 0.4, role, 11, False, GRAY)
    rect(s, x + 0.16, y + 1.1, w - 0.32, 0.5, NAVY, rounded=True)
    code(s, x + 0.24, y + 1.18, w - 0.48, 0.36, snippet,
         size=9.5, color=CYAN)
rect(s, 0.72, 6.15, 11.88, 0.55, NAVY2, rounded=True)
text(s, 1.0, 6.27, 11.3, 0.34,
     "Lenguaje principal: C# en el backend y TypeScript en el frontend; SQL para datos y JSON para comunicarlos.",
     13, True, WHITE, align=PP_ALIGN.CENTER)
footer(s, 14)
add_notes(s, "Responder literalmente: se trabaja con C# en la API, TypeScript/Angular en la interfaz, SQL en SQLite, JSON entre capas y YAML/Docker para despliegue.")

# ---------------------------------------------------------------- 15. Cierre
s = prs.slides.add_slide(BLANK)
bg(s, NAVY)
rect(s, 0, 0, 0.16, H, CYAN)
chip(s, 0.75, 0.62, 2.0, "RESUMEN", fill=TEAL)
text(s, 0.75, 1.25, 11.6, 0.75, "Listo para exponer", 38, True, WHITE)
text(s, 0.78, 2.1, 11.4, 0.5,
     "GalyCrud convierte una tarea manual en una aplicación web segura, medible y reproducible.",
     17, False, RGBColor(0xC7, 0xD6, 0xE5))
rect(s, 0.78, 3.0, 7.35, 2.75, NAVY2, rounded=True)
text(s, 1.08, 3.25, 6.8, 0.3, "GUION DE LA DEMO (3 MIN)", 10, True, CYAN)
bullets(s, 1.1, 3.68, 6.75, 1.9, [
    "1. Login con admin / Admin123!",
    "2. Buscar “Ana” y filtrar activos",
    "3. Crear un estudiante desde “Nuevo estudiante”",
    "4. Editar su grado y guardar",
    "5. Mostrar Swagger y el health",
], size=13.5, color=WHITE, space_after=8)
rect(s, 8.45, 3.0, 4.15, 2.75, NAVY2, rounded=True)
text(s, 8.75, 3.25, 3.55, 0.3, "USUARIOS DEMO", 10, True, CYAN)
rich(s, 8.78, 3.72, 3.5, 1.9, [
    ("admin / Admin123!", True, WHITE, 13),
    (": Administrador", False, MID, 10.5),
    ("editor / Editor123!", True, WHITE, 13),
    (": Editor", False, MID, 10.5),
    ("consulta / Consulta123!", True, WHITE, 13),
    (": Viewer", False, MID, 10.5),
], space_after=2)
text(s, 0.8, 6.35, 11.6, 0.35,
     "Gracias  ·  Preguntas", 20, True, CYAN, align=PP_ALIGN.CENTER)
footer(s, 15, dark=True)
add_notes(s, "Cerrar invitando a preguntas. Si hay tiempo, repetir la demo en vivo desde el navegador.")

prs.save(OUT)
print(f"Generado: {OUT}")
print(f"Diapositivas: {len(prs.slides)}")
