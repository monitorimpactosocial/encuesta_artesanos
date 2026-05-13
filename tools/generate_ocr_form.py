from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import legal
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "FORMULARIO_OCR_OFICIO_ARTESANOS.pdf"
DICT_PATH = ROOT / "FORMULARIO_OCR_OFICIO_ARTESANOS_DICCIONARIO.md"
ROADS_CACHE_PATH = ROOT / "FORMULARIO_OCR_ISLA_HERMOSA_ROADS_CACHE.json"

W, H = legal
M = 22
GAP = 14
COL_W = (W - 2 * M - GAP) / 2
PAGE_BOTTOM = 26
TEXT = colors.HexColor("#171717")
LINE = colors.HexColor("#3F3F3F")
MID = colors.HexColor("#D9D9D9")
LIGHT = colors.HexColor("#F2F2F2")
LIGHTER = colors.HexColor("#FAFAFA")


def width(text: str, font: str = "Helvetica", size: float = 6.2) -> float:
    return stringWidth(text, font, size)


def wrap(text: str, max_width: float, font: str = "Helvetica", size: float = 6.2) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if width(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]


def load_field_map_data() -> dict:
    text = (ROOT / "MapData.gs").read_text(encoding="utf-8")
    match = re.search(r"var FIELD_MAP_DATA_ = (\{.*?\});", text, re.S)
    if not match:
        return {}
    return json.loads(match.group(1))


def fetch_or_load_roads(data: dict) -> list[dict]:
    if ROADS_CACHE_PATH.exists():
        try:
            return json.loads(ROADS_CACHE_PATH.read_text(encoding="utf-8")).get("roads", [])
        except Exception:
            pass
    try:
        (south, west), (north, east) = data["bounds"]
        query = f"""
[out:json][timeout:25];
(
  way["highway"]({south},{west},{north},{east});
);
out geom;
"""
        body = urllib.parse.urlencode({"data": query}).encode("utf-8")
        req = urllib.request.Request(
            "https://overpass-api.de/api/interpreter",
            data=body,
            headers={"User-Agent": "encuesta-artesanos-ocr-form/1.0"},
        )
        with urllib.request.urlopen(req, timeout=35) as response:
            raw = json.loads(response.read().decode("utf-8"))
        roads = []
        for item in raw.get("elements", []):
            geom = item.get("geometry") or []
            if len(geom) < 2:
                continue
            tags = item.get("tags") or {}
            roads.append(
                {
                    "name": tags.get("name") or "",
                    "highway": tags.get("highway") or "",
                    "points": [[p["lat"], p["lon"]] for p in geom if "lat" in p and "lon" in p],
                }
            )
        ROADS_CACHE_PATH.write_text(json.dumps({"source": "OpenStreetMap Overpass", "roads": roads}, ensure_ascii=False, indent=2), encoding="utf-8")
        return roads
    except Exception:
        return []


class Form:
    def __init__(self) -> None:
        self.c = canvas.Canvas(str(PDF_PATH), pagesize=legal)
        self.page = 1
        self.draw_header("CONTROL, HOGAR Y VIVIENDA")

    def draw_header(self, subtitle: str) -> None:
        c = self.c
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(M, H - 18, "ENCUESTA ARTESANOS ISLA HERMOSA / ISLA TUYU")
        c.setFont("Helvetica", 6.2)
        c.drawString(M, H - 28, subtitle)
        c.drawRightString(W - M, H - 18, f"BOLETA OCR/OMR - PAGINA {self.page}/2")
        c.drawRightString(W - M, H - 28, "Oficio/legal 8.5 x 14 - escanear 300 dpi")
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.line(M, H - 34, W - M, H - 34)

    def footer(self) -> None:
        c = self.c
        c.setFillColor(TEXT)
        c.setFont("Helvetica", 5.8)
        c.drawString(M, 12, "Marcar una casilla por opcion salvo MULTI. Usar X fuerte o rellenar. Escribir importes solo con numeros.")
        c.drawRightString(W - M, 12, "Si marca OT/OTRO, escribir detalle. No recortar bordes al escanear.")

    def new_page(self, subtitle: str) -> None:
        self.footer()
        self.c.showPage()
        self.page += 1
        self.draw_header(subtitle)

    def block(self, x: float, y: float, w: float, h: float, title: str, code: str | None = None) -> float:
        c = self.c
        c.setFillColor(LIGHTER)
        c.roundRect(x, y - h, w, h, 4, fill=1, stroke=0)
        c.setStrokeColor(MID)
        c.setLineWidth(0.55)
        c.roundRect(x, y - h, w, h, 4, fill=0, stroke=1)
        c.setFillColor(LIGHT)
        c.roundRect(x, y - 18, w, 18, 4, fill=1, stroke=0)
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 7.2)
        label = f"{code}. {title}" if code else title
        c.drawString(x + 7, y - 12, label)
        return y - 27

    def label(self, x: float, y: float, text: str, size: float = 6.1, bold: bool = True) -> None:
        self.c.setFillColor(TEXT)
        self.c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        self.c.drawString(x, y, text)

    def line_field(self, x: float, y: float, label: str, line_w: float, code_w: float = 78) -> float:
        self.label(x, y, label, 5.35)
        x2 = x + code_w
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.45)
        self.c.line(x2, y - 1, x2 + line_w, y - 1)
        return y - 11

    def text_box(self, x: float, y: float, w: float, h: float, label: str) -> float:
        self.label(x, y, label, 6.0)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.45)
        self.c.rect(x, y - h - 4, w, h, fill=0, stroke=1)
        return y - h - 11

    def digit_boxes(self, x: float, y: float, label: str, digits: int, box: float = 8.5) -> float:
        self.label(x, y, label, 5.35)
        start = x + width(label, "Helvetica-Bold", 5.35) + 6
        self.c.setStrokeColor(LINE)
        for i in range(digits):
            self.c.rect(start + i * (box + 1.2), y - box + 2, box, box, fill=0, stroke=1)
        return y - 11

    def choice_row(self, x: float, y: float, label: str, opts: list[tuple[str, str]], max_w: float, multi: bool = False) -> float:
        suffix = "MULTI" if multi else "UNA"
        self.label(x, y, f"{label} ({suffix})", 5.2)
        y -= 8
        longest = max((len(f"{code} {text}") for code, text in opts), default=0)
        if longest > 17:
            cols = 2
        elif len(opts) <= 3:
            cols = 3
        elif len(opts) <= 6:
            cols = 3
        else:
            cols = 4
        col_w = max_w / cols
        self.c.setFont("Helvetica", 4.95)
        self.c.setFillColor(TEXT)
        for idx, (code, text) in enumerate(opts):
            row = idx // cols
            col = idx % cols
            cx = x + col * col_w
            cy = y - row * 9.5
            item = f"{code} {text}"
            self.c.setStrokeColor(LINE)
            self.c.rect(cx, cy - 5.3, 5.6, 5.6, fill=0, stroke=1)
            clipped = item
            while width(clipped, "Helvetica", 4.95) > col_w - 9 and len(clipped) > 4:
                clipped = clipped[:-2].rstrip() + "."
            self.c.drawString(cx + 7.2, cy - 4.5, clipped)
        rows = (len(opts) + cols - 1) // cols
        return y - rows * 9.5 - 4

    def note_lines(self, x: float, y: float, w: float, rows: int, label: str) -> float:
        self.label(x, y, label, 6.0)
        y -= 10
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.4)
        for _ in range(rows):
            self.c.line(x, y, x + w, y)
            y -= 12
        return y

    def roster(self, x: float, y: float, w: float) -> float:
        self.label(x, y, "H01 Integrantes del hogar", 6.2)
        y -= 10
        headers = ["#", "PAR", "S", "FECHA NAC.", "NR", "ED", "DIS", "TIPO DISCAP."]
        widths = [15, 36, 18, 78, 20, 24, 24, w - 215]
        self.c.setFillColor(LIGHT)
        self.c.rect(x, y - 10, w, 11, fill=1, stroke=0)
        self.c.setStrokeColor(LINE)
        self.c.setFillColor(TEXT)
        self.c.setFont("Helvetica-Bold", 5.5)
        cx = x
        for h, cw in zip(headers, widths):
            self.c.drawCentredString(cx + cw / 2, y - 7, h)
            cx += cw
        y -= 10
        for row in range(1, 11):
            cx = x
            for idx, cw in enumerate(widths):
                self.c.rect(cx, y - 12, cw, 12, fill=0, stroke=1)
                if idx == 0:
                    self.c.setFont("Helvetica", 5.8)
                    self.c.drawCentredString(cx + cw / 2, y - 8.5, str(row))
                cx += cw
            y -= 12
        y -= 6
        self.c.setFillColor(TEXT)
        for line in wrap("PAR: JH jefe/a, CO conyuge, HI hijo/a, PA padre/madre, HE hermano/a, NI nieto/a, AB abuelo/a, OP otro pariente, NP no pariente, OT otro. S: F/M/O. NR: no recuerda fecha de nacimiento. DIS: S/N. Tipo: FIS, VIS, AUD, INT, PSI, HAB, MUL, OT.", w, size=5.6):
            self.c.setFont("Helvetica", 5.6)
            self.c.drawString(x, y, line)
            y -= 7
        return y - 3

    def isla_map_panel(self, x: float, y: float, w: float, h: float) -> None:
        data = load_field_map_data()
        roads = fetch_or_load_roads(data) if data else []
        inner = 9
        map_w = w * 0.62
        map_h = h - 42
        map_x = x + inner
        map_y = y - 27
        legend_x = map_x + map_w + 12
        legend_w = w - map_w - 3 * inner - 12

        self.c.setFillColor(colors.white)
        self.c.rect(map_x, map_y - map_h, map_w, map_h, fill=1, stroke=0)
        self.c.setStrokeColor(MID)
        self.c.rect(map_x, map_y - map_h, map_w, map_h, fill=0, stroke=1)

        if not data:
            self.label(map_x + 8, map_y - 18, "Mapa territorial no disponible en MapData.gs", 6.2)
            return

        points = data.get("boundary", []) + [[p["lat"], p["lng"]] for p in data.get("dwellings", [])]
        for road in roads:
            points.extend(road.get("points", []))
        min_lat = min(p[0] for p in points)
        max_lat = max(p[0] for p in points)
        min_lng = min(p[1] for p in points)
        max_lng = max(p[1] for p in points)
        pad_lat = max((max_lat - min_lat) * 0.04, 0.0003)
        pad_lng = max((max_lng - min_lng) * 0.04, 0.0003)
        min_lat -= pad_lat
        max_lat += pad_lat
        min_lng -= pad_lng
        max_lng += pad_lng

        def xy(lat: float, lng: float) -> tuple[float, float]:
            px = map_x + (lng - min_lng) / (max_lng - min_lng) * map_w
            py = map_y - map_h + (lat - min_lat) / (max_lat - min_lat) * map_h
            return px, py

        # Malla operativa de cuadras/manzanas: no reemplaza catastro, sirve para referencia en papel.
        self.c.setStrokeColor(colors.HexColor("#DCDCDC"))
        self.c.setLineWidth(0.3)
        self.c.setDash(1, 3)
        cols, rows = 4, 4
        for i in range(1, cols):
            gx = map_x + map_w * i / cols
            self.c.line(gx, map_y - map_h, gx, map_y)
        for j in range(1, rows):
            gy = map_y - map_h + map_h * j / rows
            self.c.line(map_x, gy, map_x + map_w, gy)
        self.c.setDash()
        self.c.setFillColor(colors.HexColor("#777777"))
        self.c.setFont("Helvetica", 5.0)
        n = 1
        for r in range(rows):
            for col in range(cols):
                self.c.drawString(map_x + col * map_w / cols + 3, map_y - r * map_h / rows - 7, f"M{n}")
                n += 1

        # Caminos desde OSM/Overpass.
        for road in roads:
            pts = [xy(lat, lng) for lat, lng in road.get("points", [])]
            if len(pts) < 2:
                continue
            kind = road.get("highway", "")
            if kind in {"tertiary", "secondary", "primary"}:
                self.c.setStrokeColor(colors.HexColor("#595959"))
                self.c.setLineWidth(1.2)
            elif kind in {"track", "unclassified"}:
                self.c.setStrokeColor(colors.HexColor("#7A7A7A"))
                self.c.setLineWidth(0.75)
            else:
                self.c.setStrokeColor(colors.HexColor("#9A9A9A"))
                self.c.setLineWidth(0.55)
            path = self.c.beginPath()
            path.moveTo(pts[0][0], pts[0][1])
            for px, py in pts[1:]:
                path.lineTo(px, py)
            self.c.drawPath(path, stroke=1, fill=0)

        boundary = [xy(lat, lng) for lat, lng in data.get("boundary", [])]
        if boundary:
            path = self.c.beginPath()
            path.moveTo(boundary[0][0], boundary[0][1])
            for px, py in boundary[1:]:
                path.lineTo(px, py)
            path.close()
            self.c.setFillColor(colors.Color(0.92, 0.92, 0.92, alpha=0.18))
            self.c.setStrokeColor(colors.black)
            self.c.setLineWidth(0.8)
            self.c.drawPath(path, stroke=1, fill=0)

        self.c.setFillColor(colors.black)
        self.c.setStrokeColor(colors.white)
        self.c.setLineWidth(0.25)
        for p in data.get("dwellings", []):
            px, py = xy(p["lat"], p["lng"])
            self.c.circle(px, py, 1.55, fill=1, stroke=1)
        for p in data.get("dwellings", []):
            if p.get("n") in {1, 10, 20, 30, 40, 50, 60, 69}:
                px, py = xy(p["lat"], p["lng"])
                self.c.setFillColor(TEXT)
                self.c.setFont("Helvetica", 4.7)
                self.c.drawString(px + 2, py + 1, str(p["n"]))

        # Flecha norte y escala grafica simple.
        self.c.setFillColor(TEXT)
        self.c.setFont("Helvetica-Bold", 6)
        self.c.drawString(map_x + map_w - 20, map_y - 10, "N")
        self.c.line(map_x + map_w - 14, map_y - 29, map_x + map_w - 14, map_y - 14)
        self.c.line(map_x + map_w - 14, map_y - 14, map_x + map_w - 18, map_y - 20)
        self.c.line(map_x + map_w - 14, map_y - 14, map_x + map_w - 10, map_y - 20)
        self.c.setLineWidth(1)
        self.c.line(map_x + 10, map_y - map_h + 14, map_x + 70, map_y - map_h + 14)
        self.c.setFont("Helvetica", 5)
        self.c.drawString(map_x + 10, map_y - map_h + 18, "escala referencial")

        # Leyenda y pedidos de campo.
        self.c.setFillColor(TEXT)
        self.c.setFont("Helvetica-Bold", 6.2)
        self.c.drawString(legend_x, map_y - 2, "Mapa operativo Isla Hermosa / Isla Tuyu")
        self.c.setFont("Helvetica", 5.3)
        legend_lines = [
            f"Viviendas mapeadas: {len(data.get('dwellings', []))}",
            f"Caminos OSM/cache: {len(roads)}",
            "M1-M16: manzanas/sectores de referencia para papel.",
            "Linea negra: limite operativo. Lineas grises: caminos/calles.",
            "Puntos negros: viviendas INE/mapeadas.",
            "Usar este mapa para ubicar C02 y validar vivienda nueva/duplicada.",
        ]
        ly = map_y - 15
        for item in legend_lines:
            for line in wrap(item, legend_w, size=5.3):
                self.c.drawString(legend_x, ly, line)
                ly -= 7
        ly -= 2
        self.c.setFont("Helvetica-Bold", 5.4)
        self.c.drawString(legend_x, ly, "Control en campo")
        ly -= 8
        self.c.setFont("Helvetica", 5.2)
        controls = [
            "[ ] vivienda ubicada",
            "[ ] vivienda nueva",
            "[ ] vivienda duplicada",
            "[ ] ausente / cerrada",
            "[ ] requiere guia local",
            "[ ] camino dificil",
        ]
        for item in controls:
            self.c.drawString(legend_x, ly, item)
            ly -= 8
        ly -= 3
        self.label(legend_x, ly, "Notas de ubicacion / calle / manzana", 5.4)
        ly -= 8
        self.c.setStrokeColor(LINE)
        for _ in range(6):
            self.c.line(legend_x, ly, legend_x + legend_w, ly)
            ly -= 12


def build_page_one(f: Form) -> None:
    left = M
    right = M + COL_W + GAP
    top = H - 46

    y = f.block(left, top, COL_W, 195, "Control territorial y consentimiento", "0")
    for label in [
        "C01 ID boleta",
        "C02 ID vivienda / punto mapa",
        "C03 Fecha dd/mm/aaaa",
        "C04 Encuestador/a",
        "C05 Segmento / ruta",
        "C06 GPS lat",
        "C07 GPS lng",
        "C07B Precision GPS / fuente",
    ]:
        y = f.line_field(left + 8, y, label, 150)
    y = f.choice_row(left + 8, y, "C08 Acepta participar. Si NO, fin", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(left + 8, y, "C09 Hogar con alguien que hace artesanias", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(left + 8, y, "C10 Foto general autorizada", [("S", "Si"), ("N", "No")], COL_W - 16)

    y = f.block(left, top - 207, COL_W, 266, "Identificacion y ubicacion fija", "1")
    y = f.line_field(left + 8, y, "I01 Nombre y apellido", 165)
    y = f.line_field(left + 8, y, "I02 Cedula", 165)
    y = f.choice_row(left + 8, y, "I03 Sexo", [("F", "Fem"), ("M", "Masc"), ("O", "Otro")], COL_W - 16)
    y = f.line_field(left + 8, y, "I04 Fecha nacimiento", 150)
    y = f.choice_row(left + 8, y, "I05 No recuerda/no declara fecha", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.digit_boxes(left + 8, y, "I06 Edad si I05=S", 3)
    y = f.line_field(left + 8, y, "I07 Telefono/WhatsApp", 150)
    f.label(left + 8, y, "I08 Departamento: CONCEPCION fijo. I09 Distrito: no cambiar.", 5.9)
    y -= 12
    y = f.choice_row(left + 8, y, "I10 Barrio/localidad", [("1", "Isla Hermosa/Tuyu"), ("2", "Isla Hermosa"), ("3", "Isla Tuyu")], COL_W - 16)
    y = f.line_field(left + 8, y, "I11 Referencia vivienda/taller", 150)
    y = f.choice_row(left + 8, y, "I12 Jefe/a hogar", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(left + 8, y, "I13 Estado civil", [("1", "Solt"), ("2", "Cas"), ("3", "Unido"), ("4", "Sep/Div"), ("5", "Viud")], COL_W - 16)
    y = f.choice_row(left + 8, y, "I14 Idioma principal", [("1", "Guarani"), ("2", "Castellano"), ("3", "Ambos"), ("4", "Port"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(left + 8, y, "I15 Comunidad indigena", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")], COL_W - 16)
    y = f.line_field(left + 8, y, "I16 Pueblo/etnia", 150)
    y = f.line_field(left + 8, y, "I17 Contacto alternativo", 150)
    f.choice_row(left + 8, y, "I18 Nacionalidad", [("1", "Paraguaya"), ("2", "Bras"), ("3", "Arg"), ("OT", "Otra")], COL_W - 16)

    y = f.block(right, top, COL_W, 250, "Integrantes del hogar", "2")
    y = f.roster(right + 8, y, COL_W - 16)
    y = f.digit_boxes(right + 8, y, "H02 Total integrantes", 2)
    y = f.choice_row(right + 8, y, "H03 Hay discapacidad en hogar", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "H04 Tipo discapacidad hogar", [("FIS", "Fis"), ("VIS", "Vis"), ("AUD", "Aud"), ("INT", "Int"), ("PSI", "Psic"), ("HAB", "Habla"), ("MUL", "Mult"), ("OT", "Otra")], COL_W - 16, True)
    f.line_field(right + 8, y, "H05 Detalle OT", 150)

    y = f.block(right, top - 262, COL_W, 335, "Vivienda, servicios y proteccion", "3")
    y = f.choice_row(right + 8, y, "V01 Tipo vivienda", [("1", "Casa"), ("2", "Rancho"), ("3", "Pieza"), ("4", "Impro"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V02 Tenencia", [("1", "Propia"), ("2", "Cedida"), ("3", "Alq"), ("4", "Ocup"), ("OT", "Otra")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V03 Pared", [("1", "Lad"), ("2", "Mad"), ("3", "Adobe"), ("4", "Chapa"), ("5", "Rec"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V04 Piso", [("1", "Bald"), ("2", "Cem"), ("3", "Tierra"), ("4", "Mad"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V05 Techo", [("1", "Teja"), ("2", "Chapa"), ("3", "Fibro"), ("4", "Paja"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V06 Agua", [("1", "ESSAP"), ("2", "Pozo"), ("3", "Alj"), ("4", "Rio"), ("5", "Vec"), ("OT", "Otra")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V07 Luz electrica", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V08 Bano", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V09 Desague", [("1", "Red"), ("2", "Pozo"), ("3", "Letr"), ("4", "Campo"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V10 Cocina con", [("1", "Gas"), ("2", "Lena"), ("3", "Carbon"), ("4", "Elec"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V11 Internet", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "V12 Equipamiento", [("TV", "TV"), ("HEL", "Helad"), ("CEL", "Cel"), ("MOT", "Moto"), ("CAR", "Auto"), ("MAQ", "Maq"), ("OT", "Otro")], COL_W - 16, True)
    y = f.choice_row(right + 8, y, "V13 Seguro/cobertura salud", [("1", "IPS"), ("2", "Publico"), ("3", "Priv"), ("4", "Ning"), ("NS", "Ns/Nr")], COL_W - 16)
    f.choice_row(right + 8, y, "V14 Ingreso alcanza necesidades", [("1", "Bien"), ("2", "Justo"), ("3", "No algunos meses"), ("4", "No mayoria"), ("NS", "Ns/Nr")], COL_W - 16)

    f.block(M, 275, W - 2 * M, 230, "Mapa de cuadras, manzanas, calles y viviendas mapeadas", None)
    f.isla_map_panel(M, 275, W - 2 * M, 230)


def build_page_two(f: Form) -> None:
    f.new_page("ARTESANIA, INGRESOS, PARACEL Y CIERRE")
    left = M
    right = M + COL_W + GAP
    top = H - 46

    y = f.block(left, top, COL_W, 525, "Actividad artesanal o potencial", "4")
    y = f.choice_row(left + 8, y, "A00 Si C09=N, hay interes/potencial", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")], COL_W - 16)
    y = f.line_field(left + 8, y, "A00D Detalle interes/potencial", 160)
    y = f.choice_row(left + 8, y, "A01 Tipo principal", [("01", "Textil"), ("02", "Cesteria"), ("03", "Madera"), ("04", "Ceram"), ("05", "Cuero"), ("06", "Joy/sem"), ("07", "Recicl"), ("08", "Alim"), ("09", "Mixta"), ("OT", "Otra")], COL_W - 16)
    y = f.line_field(left + 8, y, "A02 Oficio/especialidad", 155)
    y = f.line_field(left + 8, y, "A03 Productos principales", 155)
    y = f.choice_row(left + 8, y, "A04 Materia prima principal", [("01", "Madera"), ("02", "Bambu"), ("03", "Palma/fibra"), ("04", "Hilo"), ("05", "Cuero"), ("06", "Arcilla"), ("07", "Semillas"), ("08", "Metal"), ("09", "Plast rec"), ("10", "Papel"), ("11", "Tela rec"), ("OT", "Otra")], COL_W - 16)
    y = f.line_field(left + 8, y, "A04D Detalle otra materia prima", 150)
    y = f.choice_row(left + 8, y, "A05 Otras materias primas", [("01", "Mad"), ("02", "Bam"), ("03", "Fib"), ("04", "Hilo"), ("05", "Cue"), ("06", "Arc"), ("07", "Sem"), ("08", "Met"), ("09", "Plast"), ("10", "Pap"), ("11", "Tela"), ("OT", "Otra")], COL_W - 16, True)
    y = f.choice_row(left + 8, y, "A06 Origen materia prima", [("1", "Recolecta local"), ("2", "Compra local"), ("3", "Compra fuera"), ("4", "Intermed"), ("5", "Donada"), ("6", "Recicl"), ("OT", "Otro")], COL_W - 16)
    y = f.line_field(left + 8, y, "A07 Lugar extraccion/compra", 150)
    y = f.line_field(left + 8, y, "A08 Tiempo llegar-extraer-volver", 135)
    y = f.choice_row(left + 8, y, "A09 Dificultad materia prima", [("1", "Precio"), ("2", "Escasez"), ("3", "Distancia"), ("4", "Transp"), ("5", "Restric"), ("6", "Calidad"), ("7", "Ning"), ("OT", "Otra")], COL_W - 16)
    y = f.digit_boxes(left + 8, y, "A10 Anos experiencia", 2)
    y = f.choice_row(left + 8, y, "A11 Aprendio oficio", [("1", "Familia"), ("2", "Comunidad"), ("3", "Curso"), ("4", "Autod"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(left + 8, y, "A12 Dedicacion", [("1", "Principal"), ("2", "Secund"), ("3", "Ocasional")], COL_W - 16)
    y = f.digit_boxes(left + 8, y, "A13 Dias/semana", 1)
    y = f.digit_boxes(left + 8, y, "A14 Horas/dia", 2)
    y = f.choice_row(left + 8, y, "A15 Lugar produce", [("1", "Casa"), ("2", "Taller propio"), ("3", "Comunit"), ("4", "Aire libre"), ("OT", "Otro")], COL_W - 16)
    y = f.choice_row(left + 8, y, "A16 Herramientas", [("MAN", "Manual"), ("MAQ", "Maq"), ("COS", "Coser"), ("HOR", "Horno"), ("TEL", "Telar"), ("MOL", "Molde"), ("OT", "Otra")], COL_W - 16, True)
    y = f.line_field(left + 8, y, "A17 Herramientas que necesita", 145)
    y = f.choice_row(left + 8, y, "A18 Capacitacion ultimos 2 anos", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(left + 8, y, "A19 Temas que necesita", [("TEC", "Tecn"), ("DIS", "Diseno"), ("CAL", "Calid"), ("COM", "Comerc"), ("DIG", "Digital"), ("ORG", "Org"), ("FIN", "Fin"), ("OT", "Otro")], COL_W - 16, True)
    y = f.choice_row(left + 8, y, "A20 Trabaja", [("1", "Solo/a"), ("2", "Familia"), ("3", "Grupo"), ("4", "Asoc")], COL_W - 16)
    y = f.digit_boxes(left + 8, y, "A21 Personas apoyan produccion", 2)
    f.line_field(left + 8, y, "A22 Necesidad principal capacitacion", 140)

    y = f.block(right, top, COL_W, 332, "Produccion, ventas e ingresos", "5")
    y = f.digit_boxes(right + 8, y, "P01 Unidades/mes", 4)
    y = f.digit_boxes(right + 8, y, "P02 Precio promedio Gs", 7)
    y = f.digit_boxes(right + 8, y, "P03 Costo promedio Gs", 7)
    y = f.digit_boxes(right + 8, y, "P04 Ingreso SOLO artesania Gs", 8)
    y = f.choice_row(right + 8, y, "P05 Banda ingreso SOLO artesania", [("1", "<500k"), ("2", "500k-1M"), ("3", "1-2M"), ("4", "2-3M"), ("5", "3-5M"), ("6", ">5M"), ("NI", "No inf")], COL_W - 16)
    y = f.digit_boxes(right + 8, y, "P06 Ingreso TOTAL hogar Gs", 8)
    y = f.choice_row(right + 8, y, "P07 Banda ingreso TOTAL hogar", [("1", "<500k"), ("2", "500k-1M"), ("3", "1-2M"), ("4", "2-3M"), ("5", "3-5M"), ("6", ">5M"), ("NI", "No inf")], COL_W - 16)
    y = f.digit_boxes(right + 8, y, "P08 Personas dependen ingreso", 2)
    y = f.digit_boxes(right + 8, y, "P09 Personas aportan ingreso", 2)
    y = f.choice_row(right + 8, y, "P10 Fuente principal ingreso hogar", [("1", "Artes"), ("2", "Agri"), ("3", "Ganad"), ("4", "Pesca"), ("5", "Salario"), ("6", "Comerc"), ("7", "Ayuda"), ("8", "Prog soc"), ("OT", "Otra")], COL_W - 16)
    y = f.line_field(right + 8, y, "P10D Detalle fuente OT", 145)
    y = f.choice_row(right + 8, y, "P11 Canal venta ARTESANIAS", [("1", "Comunidad"), ("2", "Feria loc"), ("3", "Feria reg"), ("4", "Intermed"), ("5", "Pedido"), ("6", "Tienda"), ("7", "WhatsApp"), ("8", "Redes"), ("OT", "Otro")], COL_W - 16)
    y = f.line_field(right + 8, y, "P11D Detalle canal OT", 150)
    y = f.choice_row(right + 8, y, "P12 Otros canales venta", [("1", "Com"), ("2", "Feria"), ("3", "Reg"), ("4", "Inter"), ("5", "Pedido"), ("6", "Tienda"), ("7", "WA"), ("8", "Redes"), ("OT", "Otro")], COL_W - 16, True)
    f.choice_row(right + 8, y, "P13 Barreras comercializacion", [("CLI", "Clientes"), ("PRE", "Precio"), ("TRA", "Transp"), ("CAP", "Capital"), ("HER", "Herram"), ("DIS", "Diseno"), ("PRO", "Promoc"), ("COM", "Compet"), ("MP", "Mat prima"), ("NIN", "Ning"), ("OT", "Otra")], COL_W - 16, True)

    y = f.block(right, top - 350, COL_W, 168, "Formalizacion, credito y ambiente", "6")
    y = f.choice_row(right + 8, y, "F01 Integra asociacion/grupo", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.line_field(right + 8, y, "F02 Nombre asociacion/grupo", 145)
    y = f.choice_row(right + 8, y, "F03 Tiene RUC/factura/marca", [("RUC", "RUC"), ("FAC", "Factura"), ("MAR", "Marca"), ("NIN", "Ning")], COL_W - 16, True)
    y = f.choice_row(right + 8, y, "F04 Acceso credito reciente", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "F05 Necesita financiamiento", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.digit_boxes(right + 8, y, "F06 Monto necesario Gs", 8)
    y = f.choice_row(right + 8, y, "F07 Uso financiamiento", [("MP", "Mat prima"), ("HER", "Herram"), ("TAL", "Taller"), ("LOG", "Logist"), ("EMP", "Empaq"), ("FOR", "Formal"), ("CAP", "Capital"), ("OT", "Otro")], COL_W - 16, True)
    y = f.choice_row(right + 8, y, "E01 Usa material reciclado", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.line_field(right + 8, y, "E02 Detalle reciclado", 150)
    y = f.choice_row(right + 8, y, "E03 Riesgos trabajo", [("COR", "Cortes"), ("POL", "Polvo"), ("HUM", "Humo"), ("QUIM", "Quim"), ("ERG", "Dolor"), ("NIN", "Ning"), ("OT", "Otro")], COL_W - 16, True)
    f.choice_row(right + 8, y, "E04 Usa proteccion", [("S", "Si"), ("N", "No"), ("A", "A veces")], COL_W - 16)

    y = f.block(right, top - 530, COL_W, 214, "Paracel, expectativas y cierre", "7")
    y = f.choice_row(right + 8, y, "R01 Conoce Paracel/programas", [("S", "Si"), ("N", "No"), ("P", "Parcial")], COL_W - 16)
    y = f.choice_row(right + 8, y, "R02 Participo antes actividad", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "R03 Interes programa artesanal eventual", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")], COL_W - 16)
    y = f.choice_row(right + 8, y, "R04 Desea recibir informacion", [("S", "Si"), ("N", "No")], COL_W - 16)
    y = f.choice_row(right + 8, y, "R05 Formato informacion", [("REU", "Reunion"), ("WA", "WhatsApp"), ("LLA", "Llamada"), ("SMS", "SMS"), ("RAD", "Radio"), ("IMP", "Impreso"), ("AUD", "Audio"), ("VID", "Video"), ("VIS", "Visita"), ("OT", "Otro")], COL_W - 16, True)
    y = f.choice_row(right + 8, y, "R06 Idioma informacion", [("GUA", "Guarani"), ("CAS", "Cast"), ("BIL", "Ambos"), ("POR", "Port"), ("OT", "Otro")], COL_W - 16, True)
    y = f.choice_row(right + 8, y, "R07 Prioridad apoyo", [("HER", "Herram"), ("MP", "Materia"), ("TEC", "Cap tecn"), ("DIS", "Diseno"), ("COM", "Comerc"), ("DIG", "Digital"), ("FOR", "Formal"), ("FIN", "Financ"), ("ORG", "Org"), ("OT", "Otro")], COL_W - 16, True)
    y = f.line_field(right + 8, y, "R08 Observaciones finales", 140)
    y = f.line_field(right + 8, y, "R09 Resultado entrevista", 140)
    f.line_field(right + 8, y, "R10 Firma/iniciales encuestador", 130)

    y = f.block(M, 180, W - 2 * M, 132, "Control de calidad OCR/OMR antes de entregar", None)
    checks = [
        "Revisar que C08 tenga una sola marca. Si C08=N, la entrevista debe quedar como rechazo/no consentimiento.",
        "Revisar que cada OT tenga detalle legible. Verificar importes P02-P07 y F06: solo numeros.",
        "P04/P05 = ingreso solo artesanal. P06/P07 = ingreso total del hogar con todas las fuentes.",
        "R05/R06 pueden tener multiples marcas. Revision: [ ] encuestador  [ ] supervisor  [ ] digitacion OCR",
    ]
    for item in checks:
        f.c.setFont("Helvetica", 6.0)
        f.c.drawString(M + 10, y, item)
        y -= 11
    f.note_lines(M + 10, y - 1, W - 2 * M - 20, 5, "Notas / inconsistencias corregidas")


def build_pdf() -> None:
    f = Form()
    build_page_one(f)
    build_page_two(f)
    f.footer()
    f.c.save()


def build_dictionary() -> None:
    DICT_PATH.write_text(
        """# Diccionario de captura - Boleta OCR/OMR Artesanos Isla Hermosa

Archivo PDF: `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`

## Proposito

Boleta de respaldo en papel, tamano oficio/legal y dos paginas completas, pensada para escaneo a 300 dpi y lectura OCR/OMR. La app web sigue siendo el canal principal; esta boleta sirve cuando se necesite operar sin tablet, hacer contingencia offline o digitar rapidamente desde formularios escaneados.

## Reglas de captura

- Las casillas se leen como OMR: una marca clara dentro del cuadrado.
- Los campos con linea se leen por OCR, pero deben validarse manualmente si son nombres, referencias o textos largos.
- Los importes y cantidades usan casillas numericas para reducir errores.
- Si la opcion es `OT`, siempre debe completarse el campo de detalle correspondiente.
- `C08=No` significa fin de encuesta: no se debe cargar informacion posterior como entrevista valida.
- `C09=No` no termina la encuesta: se releva potencial o interes artesanal del hogar mediante `A00/A00D`.
- `P04/P05` son ingresos solo por artesania. `P06/P07` son ingresos totales del hogar, incluyendo todas las fuentes.
- `R05/R06` registran formato e idioma preferido para recibir informacion sobre Paracel.

## Campos criticos para cruce con la app

| Campo | Uso |
|---|---|
| C01 | ID unico de boleta papel. |
| C02 | ID de vivienda/punto del mapa territorial. Permite vincular la encuesta con la vivienda asignada. |
| C04 | Encuestador/a responsable. |
| C06-C07 | Coordenadas de respaldo si fueron capturadas manualmente. |
| C08 | Consentimiento. Si es No, termina la entrevista. |
| C09 | Determina si se aplican preguntas artesanales completas o modulo de potencial. |
| H01 | Roster del hogar. Evita repetir conteos por sexo/edad porque se calculan desde integrantes. |
| P04-P09 | Variables principales para ingreso, dependencia y vulnerabilidad economica. |
| R04-R06 | Preferencias de comunicacion sobre Paracel. |
| Panel territorial | Controla duplicados, viviendas nuevas, acceso, fotos y referencia para mapa. |
| Panel OCR | Control de calidad antes de digitalizar o importar. |

## Codigos transversales

`S` Si, `N` No, `NS` No sabe / No responde, `OT` Otro, `NI` No informa.

Parentesco: `JH` jefe/a, `CO` conyuge, `HI` hijo/a, `PA` padre/madre, `HE` hermano/a, `NI` nieto/a, `AB` abuelo/a, `OP` otro pariente, `NP` no pariente, `OT` otro.

Discapacidad: `FIS` fisica/motriz, `VIS` visual, `AUD` auditiva, `INT` intelectual, `PSI` psicosocial/mental, `HAB` habla/comunicacion, `MUL` multiple, `OT` otra.

## Flujo sugerido de digitalizacion

1. Escanear lote por encuestador y ruta.
2. Nombrar archivo como `OCR_ARTESANOS_<fecha>_<encuestador>_<lote>.pdf`.
3. Extraer marcas OMR por coordenadas fijas del PDF.
4. Pasar OCR solo a campos de linea.
5. Validar manualmente los campos criticos: `C02`, `C08`, `C09`, `I01`, `H01`, importes y campos `OT`.
6. Importar a una hoja temporal y luego transformar a la estructura usada por la app.
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    build_pdf()
    build_dictionary()
    print(PDF_PATH)
    print(DICT_PATH)
