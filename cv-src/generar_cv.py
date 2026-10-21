# -*- coding: utf-8 -*-
"""
generar_cv.py — genera los dos CV de Borja Olazabal.

Uso:
    pip install reportlab
    python generar_cv.py                 # los dos CV en ./salida
    python generar_cv.py programador     # solo el de programador
    python generar_cv.py tecnico --out public/cv

Necesita junto al script: foto_circ.png y la carpeta fonts/ (DejaVuSans*.ttf).

Motor de CV de Borja Olazabal.
Reproduce el diseño del CV original (generado el 16/09/2026) con las medidas
exactas extraídas de su flujo de contenido PDF: fuentes, tamaños, colores,
coordenadas de bandas, chips, iconos y espaciados.
Todas las coordenadas son puntos PDF con origen abajo-izquierda.
"""
import os
from reportlab.pdfgen import canvas as canvaslib
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---------- Fuentes (DejaVu, igual que el original) ----------
BASE = os.path.dirname(os.path.abspath(__file__))
_FD = os.path.join(BASE, "fonts") + os.sep
pdfmetrics.registerFont(TTFont("DV", _FD + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", _FD + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVI", _FD + "DejaVuSans-Oblique.ttf"))
R, B, I = "DV", "DVB", "DVI"

# ---------- Colores exactos del original ----------
TEAL_D = Color(.105882, .427451, .419608)
TEAL_M = Color(.278431, .54902, .541176)
TEAL_L = Color(.498039, .929412, .917647)
BANDA = Color(.917647, 1, .996078)
BORDE = Color(.572549, .752941, .74902)
LINEA = Color(.819608, .882353, .882353)
DOT_OFF = Color(.87451, .984314, .980392)
TXT = Color(.247059, .247059, .247059)
GRIS_M = Color(.431373, .431373, .431373)
GRIS_L = Color(.603922, .603922, .603922)
WHITE = Color(1, 1, 1)

# ---------- Rejilla ----------
PW, PH = 595.2756, 841.8898
LX, LR = 36.85039, 206.9291          # columna izquierda (60 mm)
LW = LR - LX
RX, RW = 226.7717, 331.6535          # columna derecha (117 mm)
RE = RX + RW
FX, FW = 36.85039, 521.5748          # ancho completo en página 2
FE = FX + FW
BOTTOM = 34.0                        # límite inferior útil


def wrap(text, font, size, width):
    """Corte de líneas voraz por anchura real (igual criterio que el original)."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def spaced(text):
    """Texto espaciado letra a letra (como 'P R O G R A M A D O R   W E B')."""
    return "   ".join(" ".join(word) for word in text.split())


class CV:
    def __init__(self, path, title, author):
        self.c = canvaslib.Canvas(path, pagesize=(PW, PH))
        self.c.setTitle(title)
        self.c.setAuthor(author)

    # ----- primitivas -----
    def text(self, x, y, s, font, size, color, right=False):
        c = self.c
        c.setFillColor(color)
        c.setFont(font, size)
        (c.drawRightString if right else c.drawString)(x, y, s)

    def para(self, x, y, s, font, size, color, width, step):
        """Párrafo; devuelve la línea base de la última línea."""
        last = y
        for i, ln in enumerate(wrap(s, font, size, width)):
            last = y - i * step
            self.text(x, last, ln, font, size, color)
        return last

    def rrect(self, x, y, w, h, r, fill=None, stroke=None, lw=0.5):
        c = self.c
        if fill is not None:
            c.setFillColor(fill)
        if stroke is not None:
            c.setStrokeColor(stroke)
            c.setLineWidth(lw)
        c.roundRect(x, y, w, h, r, fill=1 if fill is not None else 0,
                    stroke=1 if stroke is not None else 0)

    # ===================== COLUMNA IZQUIERDA =====================
    def photo(self, png):
        c = self.c
        c.setStrokeColor(TEAL_L)
        c.setLineWidth(2.2)
        c.circle(121.8898, 728.1732, 72.4661, stroke=1, fill=0)
        c.drawImage(png, 51.02362, 657.3071, 141.7323, 141.7323, mask="auto")

    def name_block(self, role):
        self.text(LX, 620.4567, "BORJA", B, 21, TEAL_D)
        self.text(LX, 600.4567, "OLAZABAL", B, 21, TEAL_D)
        self.text(LX, 584.4567, spaced(role), R, 9.4, TXT)

    def badge(self, small, big):
        """Caja con destello: dos líneas de texto (pequeña espaciada + grande)."""
        c = self.c
        self.rrect(LX, 550.4567, LW, 22, 3, fill=BANDA, stroke=BORDE, lw=.5)
        c.saveState()
        c.setStrokeColor(TEAL_D)
        c.setLineWidth(1.35)
        c.setLineCap(1)
        cx, cy, o, d = 48.85039, 561.4567, 6.2, 2.71812
        for dx, dy in [(o, 0), (d, d), (0, o), (-d, d), (-o, 0), (-d, -d), (0, -o), (d, -d)]:
            c.line(cx, cy, cx + dx, cy + dy)
        c.restoreState()
        self.text(59.85039, 563.4567, spaced(small), R, 5.9, GRIS_M)
        self.text(59.85039, 553.4567, big, B, 8.6, TEAL_D)
        c.setStrokeColor(LINEA)
        c.setLineWidth(.7)
        c.line(LX, 549.4567, LR, 549.4567)

    def _icon(self, kind, bl):
        c = self.c
        c.saveState()
        c.setStrokeColor(TEAL_D)
        c.setFillColor(TEAL_D)
        c.setLineWidth(1)
        if kind == "car":
            c.roundRect(LX, bl - .56, 8.4, 3.2, .8, stroke=1, fill=0)
            p = c.beginPath()
            p.moveTo(38.61039, bl + 2.64); p.lineTo(40.21039, bl + 4.8)
            p.lineTo(43.25039, bl + 4.8); p.lineTo(44.05039, bl + 2.64)
            c.drawPath(p, stroke=1, fill=0)
            c.circle(39.09039, bl - .72, .96, stroke=1, fill=1)
            c.circle(43.25039, bl - .72, .96, stroke=1, fill=1)
        elif kind == "tel":
            c.roundRect(38.61039, bl - 2.4, 4.4, 8.4, 1.28, stroke=1, fill=0)
            c.line(39.89039, bl + 5.36, 41.81039, bl + 5.36)
        elif kind == "mail":
            c.rect(LX, bl - 1.2, 8.4, 6, stroke=1, fill=0)
            c.line(LX, bl + 4.8, 41.01039, bl + 1.36)
            c.line(45.25039, bl + 4.8, 41.01039, bl + 1.36)
        elif kind == "pin":
            c.circle(40.85039, bl + 2.96, 3.36, stroke=1, fill=0)
            c.circle(40.85039, bl + 2.96, .6, stroke=0, fill=1)
            p = c.beginPath()
            p.moveTo(38.45039, bl + 1.2); p.lineTo(40.85039, bl - 3.2); p.lineTo(43.25039, bl + 1.2)
            c.drawPath(p, stroke=1, fill=0)
        elif kind == "web":
            c.circle(40.85039, bl + 1.6, 4, stroke=1, fill=0)
            c.line(LX, bl + 1.6, 44.85039, bl + 1.6)
            c.ellipse(38.61039, bl - 2.4, 43.09039, bl + 5.6, stroke=1, fill=0)
        elif kind == "gh":
            c.circle(40.85039, bl + 1.6, 4, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.circle(40.85039, bl + 2.16, 1.76, stroke=0, fill=1)
        elif kind == "ig":
            c.roundRect(LX, bl - 2.4, 8, 8, 1.92, stroke=1, fill=0)
            c.circle(40.85039, bl + 1.6, 1.92, stroke=1, fill=0)
        elif kind == "in":
            c.roundRect(LX, bl - 2.4, 8, 8, 1.12, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont(B, 5.76)
            c.drawString(37.81289, bl - .24, "in")
        c.restoreState()

    def vehicle(self, label):
        self._icon("car", 536.4567)
        self.text(49.85039, 536.4567, label, R, 8, TXT)

    def ltitle(self, bl, s):
        self.text(LX, bl, s, B, 10, TEAL_D)
        self.c.setStrokeColor(LINEA)
        self.c.setLineWidth(.7)
        self.c.line(LX, bl - 4.5, LR, bl - 4.5)

    def contact(self, items):
        """items: [(icono, texto)]; título en 516.4567, filas cada 15."""
        self.ltitle(516.4567, "CONTACTO")
        bl = 502.4567
        for kind, s in items:
            self._icon(kind, bl)
            self.text(49.85039, bl, s, R, 7.8, TXT)
            bl -= 15
        return bl + 15

    def availability(self, top, head, sub):
        """Caja de disponibilidad de 26 pt; top = borde superior."""
        y0 = top - 26
        self.rrect(LX, y0, LW, 26, 3, fill=BANDA, stroke=BORDE, lw=.5)
        self.text(43.85039, top - 11, head, B, 8, TEAL_D)
        self.text(43.85039, top - 21, sub, R, 7, TXT)
        return y0

    def languages(self, bl, items):
        self.ltitle(bl, "IDIOMAS")
        y = bl - 14
        c = self.c
        for name, level, n in items:
            self.text(LX, y, name, R, 8, TXT)
            self.text(LX, y - 8, level, I, 6.6, GRIS_L)
            for i in range(5):
                c.setFillColor(TEAL_L if i < n else DOT_OFF)
                c.circle(133.2283 + 9.4 * i, y + 2.6, 3.6, stroke=0, fill=1)
            y -= 19
        return y + 19 - 8   # línea base de la última etiqueta

    def bullets_left(self, bl, title, items):
        self.ltitle(bl, title)
        y = bl - 14
        for s in items:
            self.c.setFillColor(TXT)
            self.c.circle(38.85039, y + 2.6, 1.5, stroke=0, fill=1)
            self.text(44.85039, y, s, R, 7.6, TXT)
            y -= 11.5
        return y + 11.5

    def text_left(self, bl, title, s):
        self.ltitle(bl, title)
        return self.para(LX, bl - 14, s, R, 7.2, TXT, LW, 9.6)

    def social(self, bl, items):
        self.ltitle(bl, "SOCIAL")
        y = bl - 14
        for kind, s in items:
            self._icon(kind, y)
            self.text(49.85039, y, s, R, 7.4, TXT)
            y -= 15
        return y + 15

    # ===================== BLOQUES DE CONTENIDO =====================
    def band(self, x, w, bl, s):
        """Banda de sección: rect 17 pt, título a +7."""
        self.c.setFillColor(BANDA)
        self.c.rect(x, bl - 5, w, 17, stroke=0, fill=1)
        self.text(x + 7, bl, s, B, 10, TEAL_D)

    def perfil(self, x, w, bl, paras):
        y = bl
        for k, p in enumerate(paras):
            last = self.para(x, y, p, R, 8, TXT, w, 11)
            y = last - 13
        return last

    def subhead(self, x, bl, s):
        self.text(x, bl, s, B, 8, TEAL_D)

    def chip_group(self, x, w, top_bl, label, items):
        """Grupo de chips. top_bl = línea base de la etiqueta del grupo.
        Fila: chip de 10,5 pt con borde 0,4; texto 6,6 a +4,5; salto de fila 14."""
        c = self.c
        self.text(x, top_bl, label, B, 7.4, TEAL_M)
        cx0 = x + 59.5275
        cx, ybot = cx0, top_bl - .5
        for it in items:
            tw = pdfmetrics.stringWidth(it, R, 6.6)
            cw = tw + 9
            if cx + cw > x + w and cx > cx0:
                cx = cx0
                ybot -= 14
            self.rrect(cx, ybot, cw, 10.5, 2.4, fill=BANDA, stroke=BORDE, lw=.4)
            self.text(cx + 4.5, ybot + 3.4, it, R, 6.6, TEAL_D)
            cx += cw + 3.5
        return ybot   # borde inferior de la última fila

    def note(self, x, bl, s, w, font=I, size=6.8, color=GRIS_L, step=9):
        return self.para(x, bl, s, font, size, color, w, step)

    def job_right(self, x, w, bl, puesto, fechas, empresa, cliente, desc, bullets,
                  inline_client=False):
        """Bloque de experiencia (estilo pág. 1 del CV público).
        Devuelve la línea base de la última línea escrita."""
        c = self.c
        self.text(x, bl, puesto, B, 10.2, TEAL_D)
        self.text(x, bl - 12, fechas, B, 8, TEAL_M)
        if inline_client:
            self.text(x, bl - 23, f"{empresa}  ·  {cliente}", I, 8, GRIS_M)
        else:
            self.text(x, bl - 23, empresa, I, 8, GRIS_M)
            if cliente:
                self.text(x + w, bl - 23, cliente, B, 7.4, TEAL_M, right=True)
        y = bl - 35
        last = bl - 23
        if desc:
            last = self.para(x, y, desc, R, 7.6, TXT, w, 10.2)
            y = last - 13.2
        for b in bullets:
            c.setFillColor(TEAL_L)
            c.circle(x + 2.5, y + 2.6, 1.7, stroke=0, fill=1)
            last = self.para(x + 9, y, b, R, 7.4, TXT, w - 9, 9.8)
            y = last - 11.3
        return last

    def rows(self, x, w, bl, items, col2=107.72, step=12.5):
        """Tabla empresa · puesto · fechas (experiencia previa)."""
        y = bl
        for emp, puesto, fechas in items:
            self.text(x, y, emp, B, 8.4, TEAL_D)
            self.text(x + col2, y, puesto, R, 7.8, TXT)
            self.text(x + w, y, fechas, I, 7.4, GRIS_L, right=True)
            y -= step
        return y + step

    def project(self, x, w, bl, name, url, stack, desc):
        self.text(x, bl, name, B, 9, TEAL_D)
        if url:
            self.text(x + w, bl, url, R, 7.4, TEAL_M, right=True)
        self.text(x, bl - 10.5, stack, I, 7.4, GRIS_M)
        return self.para(x, bl - 21.1, desc, R, 7.6, TXT, w, 10)

    def highlight(self, x, w, top, title, sub):
        """Caja destacada de 32 pt (formación principal)."""
        self.rrect(x, top - 32, w, 32, 3, fill=BANDA, stroke=BORDE, lw=.5)
        self.text(x + 8, top - 13, title, B, 9, TEAL_D)
        self.text(x + 8, top - 24, sub, R, 7.6, TXT)
        return top - 32

    def edu(self, x, bl, title, sub):
        self.text(x, bl, title, B, 8.4, TEAL_D)
        self.text(x, bl - 10.5, sub, R, 7.6, GRIS_M)
        return bl - 10.5

    def page2_strip(self):
        self.c.setFillColor(BANDA)
        self.c.rect(0, 0, 20.26772, PH, stroke=0, fill=1)

    def new_page(self):
        self.c.showPage()

    def save(self):
        self.c.save()


# =====================================================================
# CV DE PROGRAMADOR (IT híbrido)
# =====================================================================
FOTO = os.path.join(BASE, "foto_circ.png")


def left_column(cv, role, badge, location, avail_sub, mid_title, mid_items, fc_text):
    """Columna izquierda común a los dos CV; mismas medidas que el original."""
    cv.photo(FOTO)
    cv.name_block(role)
    cv.badge(*badge)
    cv.vehicle("Clase B / Vehículo propio")
    last = cv.contact([("tel", "672 987 992"), ("mail", "ohb.seven@gmail.com"),
                       ("pin", location), ("web", "bohdeveloper.com")])
    bot = cv.availability(last - 17, "DISPONIBILIDAD INMEDIATA", avail_sub)
    last = cv.languages(bot - 14, [("Español", "nativo", 5), ("Euskera", "intermedio", 3), ("Inglés", "básico", 2)])
    last = cv.bullets_left(last - 14, mid_title, mid_items)
    last = cv.text_left(last - 19.5, "FORMACIÓN CONTINUA", fc_text)
    return cv.social(last - 19.6, [("gh", "bohdeveloper"), ("ig", "@bohdeveloper"), ("in", "linkedin.com/in/bolazaba")])


def stack(cv, top_bl, groups):
    """groups: [(subtítulo|None, [(etiqueta, [chips])])]; devuelve el borde inferior."""
    y = top_bl
    bot = None
    for sub, gs in groups:
        if sub:
            sy = y if bot is None else bot - 15
            cv.subhead(RX, sy, sub)
            y = sy - 16
        for lab, its in gs:
            bot = cv.chip_group(RX, RW, y, lab, its)
            y = bot - 13
    return bot


def generar_programador(out):
    cv = CV(out, "CV Borja Olazabal — Programador web Java/Spring", "Borja Olazabal Hernández")

    left_column(cv, "PROGRAMADOR WEB", ("SIGUIENTE PASO", "Ingeniería de IA aplicada"),
                "Norte de España · Remoto", "Remoto ya · presencial desde enero",
                "METODOLOGÍAS", ["Scrum (Jira)", "Kanban", "Cascada", "RUP"],
                "Hoja de ruta hacia la IA aplicada: arquitectura, Kafka, Kubernetes, AWS, Spring AI y MCP, practicada en proyectos propios.")

    # ---------- Página 1, columna derecha ----------
    cv.band(RX, RW, 791.0394, "PERFIL PROFESIONAL")
    last = cv.perfil(RX, RW, 776.0394, [
        "Programador web con 5 años de experiencia en proyectos de Administración Pública autonómica para EJIE (Gobierno Vasco), en los departamentos de Turismo, Educación y Bienestar Social.",
        "Backend en Java, Spring y Spring Boot sobre Oracle SQL con despliegue en WebLogic, y frontend con JSP, JSTL, Tiles, Bootstrap y jQuery. Experiencia en tramitación electrónica de expedientes e interoperabilidad entre sistemas.",
        "En paralelo desarrollo proyectos propios con Angular, React, Next.js, TypeScript, Docker y Kubernetes, e integro modelos de IA en mi flujo de trabajo."])

    b = last - 31
    cv.band(RX, RW, b, "STACK TÉCNICO")
    bot = stack(cv, b - 15, [
        ("Experiencia profesional", [
            ("Backend", ["Java SE/EE", "Spring", "Spring Boot", "Spring MVC", "Spring Data JPA", "Hibernate", "JDBC Templates", "Servlets", "JSP", "Maven", "JUnit 5", "REST", "JSON", "XML"]),
            ("Frontend", ["JSP", "JSTL", "Thymeleaf", "Tiles", "HTML", "CSS", "Bootstrap", "JavaScript", "jQuery", "i18n / Multilenguaje"]),
            ("Datos", ["Oracle SQL", "PL/SQL", "Vistas", "Sinónimos", "GRANT", "SQL Developer", "JPA / Entity"]),
            ("Entorno EJIE", ["Framework UDA", "UDA-RUP", "J2EE", "Oracle WebLogic", "Eclipse", "Dokusi", "SoapUI", "Postman", "SVN", "Jenkins", "SonarQube", "Anthill3", "Mantis"])]),
        ("Proyectos propios", [
            ("Frontend", ["React", "Next.js", "Angular", "TypeScript", "Tailwind CSS", "Vite"]),
            ("Backend", ["Spring Boot", "Node.js", "Express.js", "Prisma", "JWT", "OAuth2"]),
            ("Datos", ["PostgreSQL", "MongoDB", "Cloudflare D1"]),
            ("DevOps", ["Docker", "Kubernetes", "GitHub Actions", "Cloudflare Pages", "Render"]),
            ("IA / LLM", ["Spring AI", "Groq", "Ollama", "Whisper", "TTS neural", "APIs de LLM"])]),
    ])

    b = bot - 27
    cv.band(RX, RW, b, "EXPERIENCIA LABORAL")
    last = cv.job_right(RX, RW, b - 15, "Programador web", "abr 2023 – jul 2026  |  Donostia (remoto)", "Inetum", "Cliente: EJIE — Gobierno Vasco",
        "Integrado en un equipo de 10-15 personas, desarrollo y mantenimiento evolutivo y correctivo de tres aplicaciones de ámbito autonómico para los departamentos de Educación y de Bienestar Social, Juventud y Reto Demográfico.",
        ["AB10 – Ayudas a familias: aplicación con cuatro líneas de negocio diferenciadas (conciliación, contratación, nacimientos y paternidad), cada una con su propia lógica de cálculo según el decreto aplicable.",
         "Desarrollo del proceso de reintegro de pagos: flujo multipantalla con cálculo de diferencias e integración con API externa para la obtención de liquidaciones.",
         "Berdindu: aplicación del servicio de atención a personas LGTBI, para casos de inclusión y acoso.",
         "Interoperabilidad con sistemas externos de cobros, reintegros y pagos, y con el gestor documental Dokusi.",
         "NewGipe / AD77 (Departamento de Educación) en entorno J2EE-UDA, entre 2023 y 2024.",
         "Metodologías Scrum con Jira, Kanban y Cascada."])
    last = cv.job_right(RX, RW, last - 19.3, "Programador web", "nov 2021 – mar 2023  |  Bilbao (remoto)", "Bilbomática", "Cliente: EJIE — Gobierno Vasco",
        "Desarrollo de aplicaciones para el Departamento de Turismo, desde el prototipado inicial hasta la implementación de la lógica de negocio, adaptándolas de forma iterativa a las exigencias del cliente.", [])
    print("pág. 1 final:", round(last, 1))

    # ---------- Página 2 ----------
    cv.new_page()
    cv.page2_strip()
    cv.band(FX, FW, 791.0394, "EXPERIENCIA PREVIA")
    last = cv.rows(FX, FW, 776.0394, [
        ("Megatron HQ", "Asistente técnico · Web developer", "dic 2020 – mar 2021"),
        ("Puertas Jokin", "Carpintero de puertas", "sep 2020 – nov 2020"),
        ("SKOOTIK", "Desarrollador web (prácticas)", "feb 2020 – may 2020"),
        ("Muebles Amets", "Carpintero y montador de muebles y cocina", "may 2019 – ago 2019"),
        ("Likale", "Especialista en torno convencional", "dic 2018 – may 2019"),
        ("W. Diamant", "Operario fabricante · herramientas de diamante", "nov 2016 – nov 2018")])
    last = cv.note(FX, last - 14.5, "Cambio de carrera al desarrollo de software en 2020, con formación por cuenta propia y certificación oficial de nivel 3.", FW, font=R, size=7.4, color=GRIS_M)

    b = last - 30
    cv.band(FX, FW, b, "PROYECTOS PROPIOS")
    intro = cv.note(FX, b - 15, "Desarrollados de forma individual fuera del entorno laboral, para ampliar stack.", FW, font=I, size=7.4, color=GRIS_M)
    y = intro - 14
    for p in [
        ("BAKO", "github.com/bohdeveloper/bako", "Express · TypeScript · MongoDB Atlas · Render",
         "Asistente personal voice-first vía Telegram, desplegado 24/7. Orquestador dual de LLM con failover automático entre Ollama local (expuesto por Cloudflare Tunnel) y Groq cloud. Transcripción con Whisper, síntesis de voz neural y capa de privacidad que detecta contenido sensible y fuerza su procesamiento en local. Integra GitHub, Notion, Google Calendar (OAuth2), Open-Meteo, RSS y Cloudflare D1. Coste de operación: 0 €/mes."),
        ("Unyona — aplicación", "en desarrollo", "React · TypeScript · Node.js · Express · Prisma · PostgreSQL",
         "La red social en sí: perfiles múltiples por cuenta, radar local por geolocalización e intereses y quedadas en persona como objetivo final. En desarrollo, tras validar el interés con la landing."),
        ("Unyona — landing", "unyona.com", "Next.js · TypeScript · Tailwind CSS · Cloudflare Pages",
         "Landing oficial de Unyona, red social local para quedar en persona: explica el producto, capta la lista de espera de la beta y fija la identidad de marca."),
        ("REXIA", "en desarrollo", "UDA (EJIE) · Java · Spring · Oracle · JSP",
         "Registro autonómico de identificación de animales de compañía con el stack del sector público: trazabilidad del microchip al titular, series de chips para veterinarios y consulta pública sin datos personales. Inspirado en el REGIAC de la Xunta, con datos ficticios."),
        ("ayudas_gv", "github.com/bohdeveloper/ayudas-gv", "Spring Boot · Spring AI · Docker · Kubernetes",
         "Laboratorio de mi hoja de ruta: contenerización y orquestación con Docker y Kubernetes en Minikube. En desarrollo: asistente RAG con Spring AI que responde dudas sobre una ayuda usando la normativa como fuente.")]:
        last = cv.project(FX, FW, y, *p)
        y = last - 18

    b = last - 26
    cv.band(FX, FW, b, "FORMACIÓN")
    bot = cv.highlight(FX, FW, b - 13, "Certificado de Profesionalidad IFCD0112  ·  Nivel 3",
                       "Programación con lenguajes orientados a objetos y bases de datos relacionales  ·  Ipartek  ·  2021")
    y = bot - 14
    for t, s in [("Aprende Oracle PL/SQL desde Cero", "Udemy  ·  ene 2025"),
                 ("Curso de confección y publicación web", "CEINPRO  ·  sep 2019 – abr 2020"),
                 ("Técnico en Instalaciones Eléctricas y Automáticas  ·  F.P. Grado Medio", "Irungo La Salle  ·  sep 2012 – jun 2014"),
                 ("Técnico en Mecanizado  ·  F.P. Grado Medio", "Irungo La Salle  ·  2010")]:
        y = cv.edu(FX, y, t, s) - 15
    print("pág. 2 final:", round(y + 15, 1))
    cv.save()
    print("ok", out)


# =====================================================================
# CV TÉCNICO (Plan B)
# NO MODIFICAR: decisión de Borja, 21 oct 2026.
# =====================================================================
def generar_tecnico(out):
    cv = CV(out, "CV Borja Olazabal — Técnico electricista", "Borja Olazabal Hernández")

    left_column(cv, "TÉCNICO INDUSTRIAL", ("DOBLE PERFIL", "Oficio + programación"),
                "Norte de España", "Traslado al norte · incorporación inmediata",
                "COMPETENCIAS", ["Lectura de planos y esquemas", "Montaje e instalación", "Resolución de problemas", "Trabajo en equipo"],
                "Combino oficio y tecnología: monto dispositivos electrónicos por afición y programo. Mi siguiente paso es la automatización industrial (PLC).")

    # ---------- Página 1, columna derecha ----------
    cv.band(RX, RW, 791.0394, "PERFIL PROFESIONAL")
    last = cv.perfil(RX, RW, 776.0394, [
        "Técnico en Instalaciones Eléctricas y Automáticas y Técnico en Mecanizado, con experiencia en taller como tornero y operario de fabricación, y como carpintero montador de muebles, cocinas y puertas.",
        "Los últimos 5 años he trabajado como programador, lo que me aporta método, lógica y soltura con la tecnología, útiles en domótica, automatización y mantenimiento. Busco volver al trabajo técnico y práctico: instalaciones eléctricas, mantenimiento o automatización."])

    b = last - 31
    cv.band(RX, RW, b, "COMPETENCIAS TÉCNICAS")
    bot = stack(cv, b - 19, [(None, [
        ("Electricidad", ["Instalaciones de baja tensión", "Cuadros eléctricos", "Automatismos industriales", "Domótica", "Máquinas eléctricas", "Esquemas eléctricos"]),
        ("Mecanizado", ["Torno convencional", "Fresado", "Control numérico (CNC)", "Metrología", "Lectura de planos"]),
        ("Carpintería", ["Montaje de muebles", "Montaje de cocinas", "Carpintería de puertas"]),
        ("Tecnología", ["Programación Java y JavaScript", "Bases de datos SQL", "Electrónica (afición)"])])])
    note = cv.note(RX, bot - 13, "Electricidad y mecanizado: formación reglada (FP). Torno, fabricación, carpintería y montaje: experiencia profesional.", RW)

    b = note - 22
    cv.band(RX, RW, b, "EXPERIENCIA EN OFICIO")
    y = b - 15
    for puesto, fechas, empresa, desc in [
            ("Carpintero de puertas", "sep 2020 – nov 2020", "Puertas Jokin", "Fabricación y montaje de puertas."),
            ("Carpintero y montador", "may 2019 – ago 2019", "Muebles Amets", "Montaje de muebles y cocinas."),
            ("Especialista en torno convencional", "dic 2018 – may 2019", "Likale", "Mecanizado de piezas en torno convencional."),
            ("Operario fabricante", "nov 2016 – nov 2018", "W. Diamant", "Fabricación de herramientas de diamante.")]:
        last = cv.job_right(RX, RW, y, puesto, fechas, empresa, None, desc, [])
        y = last - 19.3
    b = last - 30
    cv.band(RX, RW, b, "EXPERIENCIA EN TECNOLOGÍA")
    last = cv.job_right(RX, RW, b - 15, "Programador web", "nov 2021 – jul 2026  |  Donostia y Bilbao (remoto)",
        "Inetum y Bilbomática", "Cliente: EJIE — Gobierno Vasco",
        "Desarrollo y mantenimiento de aplicaciones de la Administración Pública vasca, en equipos de 10-15 personas y con metodologías Scrum y Kanban.",
        ["Lógica de negocio compleja: cálculo de ayudas según normativa y procesos de reintegro de pagos.",
         "Integración entre sistemas y mantenimiento correctivo: diagnóstico y resolución de incidencias."])
    last = cv.rows(RX, RW, last - 19.3, [
        ("Megatron HQ", "Asistente técnico · Web developer", "dic 2020 – mar 2021"),
        ("SKOOTIK", "Desarrollador web (prácticas)", "feb 2020 – may 2020")], col2=72)
    print("pág. 1 final:", round(last, 1))

    # ---------- Página 2 ----------
    cv.new_page()
    cv.page2_strip()
    cv.band(FX, FW, 791.0394, "FORMACIÓN")
    b = 791.0394
    bot = cv.highlight(FX, FW, b - 13, "Técnico en Instalaciones Eléctricas y Automáticas  ·  F.P. Grado Medio",
                       "Irungo La Salle  ·  2012 – 2014  ·  Título válido para trabajar como instalador en baja tensión (REBT)")
    y = bot - 14
    for t, s in [("Técnico en Mecanizado  ·  F.P. Grado Medio", "Irungo La Salle  ·  2010"),
                 ("F.P. Grado Medio Carpintería y Mueble  ·  cursado", "Centro Bidasoa (Irun)  ·  2016 – 2018  ·  pendiente del módulo de prácticas"),
                 ("Certificado de Profesionalidad IFCD0112  ·  Nivel 3", "Programación orientada a objetos y bases de datos relacionales  ·  Ipartek  ·  2021")]:
        last = cv.edu(FX, y, t, s)
        y = last - 15

    b = last - 26
    cv.band(FX, FW, b, "PROYECTO PERSONAL")
    last = cv.project(FX, FW, b - 15, "BAKO", "github.com/bohdeveloper/bako", "Asistente con IA · programación + hardware electrónico · en construcción",
        "Asistente personal por voz vía Telegram que ya integra servicios externos y procesa en local la información sensible. El siguiente paso es darle cuerpo físico, con sensores, actuadores y electrónica propia, para combinar programación y hardware en un mismo sistema.")
    print("pág. 2 final:", round(last, 1))
    cv.save()
    print("ok", out)


# =====================================================================
if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Genera los CV de Borja Olazabal")
    ap.add_argument("cual", nargs="?", default="todos", choices=["todos", "programador", "tecnico"])
    ap.add_argument("--out", default=os.path.join(BASE, "salida"), help="carpeta de salida")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    if a.cual in ("todos", "programador"):
        generar_programador(os.path.join(a.out, "cv-borja-olazabal-programador.pdf"))
    if a.cual in ("todos", "tecnico"):
        generar_tecnico(os.path.join(a.out, "cv-borja-olazabal-tecnico.pdf"))
