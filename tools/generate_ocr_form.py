from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import legal
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "FORMULARIO_OCR_OFICIO_ARTESANOS.pdf"
DICT_PATH = ROOT / "FORMULARIO_OCR_OFICIO_ARTESANOS_DICCIONARIO.md"

W, H = legal
MARGIN = 18
GAP = 12
COL_W = (W - (MARGIN * 2) - GAP) / 2
BOTTOM = 20


def wrap_text(text: str, width: float, font: str = "Helvetica", size: float = 5.7) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]


class TwoPageLegalForm:
    def __init__(self) -> None:
        self.c = canvas.Canvas(str(PDF_PATH), pagesize=legal)
        self.page = 1
        self.col = 0
        self.y = H - MARGIN
        self.fields: list[tuple[str, str, str, str]] = []
        self._header()

    def x(self) -> float:
        return MARGIN + self.col * (COL_W + GAP)

    def usable_bottom(self) -> float:
        return BOTTOM + 12

    def _header(self) -> None:
        self.c.setFillColor(colors.black)
        self.c.setFont("Helvetica-Bold", 9)
        self.c.drawString(MARGIN, H - 16, "ENCUESTA ARTESANOS ISLA HERMOSA / ISLA TUYU - BOLETA OCR/OMR")
        self.c.setFont("Helvetica", 5.8)
        self.c.drawRightString(W - MARGIN, H - 15, f"Oficio/legal - pagina {self.page}, maximo 2 - instrumento digital v36")
        self.c.setLineWidth(0.6)
        self.c.line(MARGIN, H - 20, W - MARGIN, H - 20)
        self.y = H - 27

    def _footer(self) -> None:
        self.c.setFont("Helvetica", 5.2)
        self.c.setFillColor(colors.black)
        self.c.drawString(MARGIN, 10, "Regla OCR: marcar con X o rellenar completamente. Escribir en mayusculas. Si marca OT/OTRO, completar detalle.")
        self.c.drawRightString(W - MARGIN, 10, "Digitalizar con 300 dpi, escala 100%, sin recortar bordes.")

    def next_col(self) -> None:
        if self.col == 0:
            self.col = 1
            self.y = H - 27
            return
        self._footer()
        self.c.showPage()
        self.page += 1
        if self.page > 2:
            raise RuntimeError("La boleta excede dos paginas oficio.")
        self.col = 0
        self._header()

    def ensure(self, height: float) -> None:
        if self.y - height < self.usable_bottom():
            self.next_col()

    def section(self, code: str, title: str) -> None:
        self.ensure(17)
        x = self.x()
        self.c.setFillColor(colors.HexColor("#EDEDED"))
        self.c.rect(x, self.y - 10, COL_W, 11, fill=1, stroke=0)
        self.c.setFillColor(colors.black)
        self.c.setFont("Helvetica-Bold", 6.4)
        self.c.drawString(x + 2, self.y - 7.2, f"{code}. {title}")
        self.y -= 14

    def line(self, text: str, size: float = 5.7, bold: bool = False, indent: float = 0, leading: float = 6.5) -> None:
        lines = wrap_text(text, COL_W - indent, size=size)
        self.ensure(len(lines) * leading + 1)
        self.c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        self.c.setFillColor(colors.black)
        for item in lines:
            self.c.drawString(self.x() + indent, self.y, item)
            self.y -= leading

    def boxes(self, code: str, label: str, options: list[tuple[str, str]], multi: bool = False) -> None:
        prefix = "MULTI" if multi else "UNA"
        text = f"{code} {label} ({prefix})"
        self.line(text, size=5.55, bold=True)
        x = self.x()
        row_x = x
        row_y = self.y + 1
        self.c.setFont("Helvetica", 5.35)
        for value, desc in options:
            item = f"{value} {desc}"
            item_w = 10 + stringWidth(item, "Helvetica", 5.35) + 5
            if row_x + item_w > x + COL_W:
                self.y -= 8.2
                row_x = x
                row_y = self.y + 1
            self.c.rect(row_x, row_y - 4, 4.5, 4.5, fill=0, stroke=1)
            self.c.drawString(row_x + 6, row_y - 3.4, item)
            row_x += item_w
        self.y -= 9
        self.fields.append((code, label, "omr_multi" if multi else "omr_single", "; ".join(f"{v}={d}" for v, d in options)))

    def field(self, code: str, label: str, width_chars: int = 28, kind: str = "texto") -> None:
        self.ensure(8)
        x = self.x()
        self.c.setFont("Helvetica-Bold", 5.55)
        self.c.drawString(x, self.y, f"{code} {label}:")
        label_w = stringWidth(f"{code} {label}:", "Helvetica-Bold", 5.55) + 3
        self.c.line(x + label_w, self.y - 1, min(x + COL_W, x + label_w + width_chars * 4.2), self.y - 1)
        self.y -= 7
        self.fields.append((code, label, kind, "linea OCR manuscrita"))

    def number_boxes(self, code: str, label: str, digits: int = 4) -> None:
        self.ensure(8)
        x = self.x()
        self.c.setFont("Helvetica-Bold", 5.55)
        self.c.drawString(x, self.y, f"{code} {label}:")
        lx = x + stringWidth(f"{code} {label}:", "Helvetica-Bold", 5.55) + 4
        for i in range(digits):
            self.c.rect(lx + i * 8, self.y - 5, 7, 7, fill=0, stroke=1)
        self.y -= 8
        self.fields.append((code, label, "digitos", f"{digits} casillas numericas"))

    def roster(self) -> None:
        self.ensure(88)
        x = self.x()
        headers = ["#", "PAR", "S", "FN dd/mm/aa", "NR", "ED", "DIS", "TIPO"]
        widths = [10, 24, 12, 50, 12, 18, 18, 50]
        self.c.setFont("Helvetica-Bold", 5.1)
        cur = x
        for h, w in zip(headers, widths):
            self.c.drawCentredString(cur + w / 2, self.y, h)
            cur += w
        self.y -= 5
        for row in range(1, 9):
            cur = x
            self.c.setFont("Helvetica", 5.1)
            for idx, w in enumerate(widths):
                self.c.rect(cur, self.y - 7, w, 8, fill=0, stroke=1)
                if idx == 0:
                    self.c.drawCentredString(cur + w / 2, self.y - 5, str(row))
                cur += w
            self.y -= 8
        self.y -= 2
        self.line("PAR: JH jefe/a, CO conyuge, HI hijo/a, PA padre/madre, HE hermano/a, NI nieto/a, AB abuelo/a, OP otro pariente, NP no pariente, OT otro.", size=5.1)
        self.line("S: F/M/O. NR: no recuerda fecha nac. DIS: S/N. TIPO: FIS, VIS, AUD, INT, PSI, HAB, MUL, OT.", size=5.1)
        self.fields.append(("H01", "Integrantes del hogar hasta 8 filas", "tabla OCR", "parentesco, sexo, fecha nacimiento, no recuerda, edad, discapacidad, tipo"))

    def finish(self) -> None:
        self._footer()
        self.c.save()


def build_pdf() -> None:
    f = TwoPageLegalForm()

    f.section("0", "Control y consentimiento")
    f.field("C01", "ID boleta")
    f.field("C02", "ID vivienda/punto mapa")
    f.field("C03", "Fecha dd/mm/aaaa")
    f.field("C04", "Encuestador/a")
    f.field("C05", "Segmento/ruta")
    f.field("C06", "GPS lat")
    f.field("C07", "GPS lng")
    f.boxes("C08", "Acepta participar voluntariamente. Si NO, fin", [("S", "Si"), ("N", "No")])
    f.boxes("C09", "Hogar con alguien que hace artesanias", [("S", "Si"), ("N", "No")])

    f.section("1", "Identificacion y ubicacion fija")
    f.field("I01", "Nombre y apellido")
    f.field("I02", "Cedula")
    f.boxes("I03", "Sexo", [("F", "Fem"), ("M", "Masc"), ("O", "Otro")])
    f.field("I04", "Fecha nacimiento dd/mm/aaaa")
    f.boxes("I05", "No recuerda/no declara fecha nacimiento", [("S", "Si"), ("N", "No")])
    f.number_boxes("I06", "Edad si I05=S", 3)
    f.field("I07", "Telefono/WhatsApp")
    f.line("I08 Departamento: CONCEPCION fijo. I09 Distrito: mantener segun operativo, no cambiar en campo.", bold=True)
    f.boxes("I10", "Barrio/localidad", [("1", "Isla Hermosa/Tuyu"), ("2", "Isla Hermosa"), ("3", "Isla Tuyu")])
    f.field("I11", "Referencia vivienda/taller")
    f.boxes("I12", "Jefe/a de hogar", [("S", "Si"), ("N", "No")])
    f.boxes("I13", "Estado civil", [("1", "Solt"), ("2", "Cas"), ("3", "Unido"), ("4", "Sep/Div"), ("5", "Viud")])
    f.boxes("I14", "Idioma principal", [("1", "Guarani"), ("2", "Castellano"), ("3", "Ambos"), ("4", "Port"), ("OT", "Otro")])
    f.boxes("I15", "Pertenece a comunidad indigena", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")])
    f.field("I16", "Pueblo/etnia si aplica")

    f.section("2", "Integrantes del hogar")
    f.roster()
    f.number_boxes("H02", "Total integrantes verificado", 2)
    f.boxes("H03", "Hay discapacidad en el hogar", [("S", "Si"), ("N", "No")])
    f.boxes("H04", "Tipo discapacidad hogar", [("FIS", "Fis"), ("VIS", "Vis"), ("AUD", "Aud"), ("INT", "Int"), ("PSI", "Psic"), ("HAB", "Habla"), ("MUL", "Mult"), ("OT", "Otra")], multi=True)
    f.field("H05", "Detalle OT discapacidad")

    f.section("3", "Vivienda, servicios y proteccion")
    f.boxes("V01", "Tipo vivienda", [("1", "Casa"), ("2", "Rancho"), ("3", "Pieza"), ("4", "Impro"), ("OT", "Otro")])
    f.boxes("V02", "Tenencia", [("1", "Propia"), ("2", "Cedida"), ("3", "Alq"), ("4", "Ocup"), ("OT", "Otra")])
    f.boxes("V03", "Pared", [("1", "Lad"), ("2", "Mad"), ("3", "Adobe"), ("4", "Chapa"), ("5", "Rec"), ("OT", "Otro")])
    f.boxes("V04", "Piso", [("1", "Bald"), ("2", "Cem"), ("3", "Tierra"), ("4", "Mad"), ("OT", "Otro")])
    f.boxes("V05", "Techo", [("1", "Teja"), ("2", "Chapa"), ("3", "Fibro"), ("4", "Paja"), ("OT", "Otro")])
    f.boxes("V06", "Agua", [("1", "ESSAP"), ("2", "Pozo"), ("3", "Alj"), ("4", "Rio"), ("5", "Vec"), ("OT", "Otra")])
    f.boxes("V07", "Luz electrica", [("S", "Si"), ("N", "No")])
    f.boxes("V08", "Bano", [("S", "Si"), ("N", "No")])
    f.boxes("V09", "Desague", [("1", "Red"), ("2", "Pozo"), ("3", "Letr"), ("4", "Campo"), ("OT", "Otro")])
    f.boxes("V10", "Cocina con", [("1", "Gas"), ("2", "Lena"), ("3", "Carbon"), ("4", "Elec"), ("OT", "Otro")])
    f.boxes("V11", "Internet", [("S", "Si"), ("N", "No")])
    f.boxes("V12", "Equipamiento", [("TV", "TV"), ("HEL", "Helad"), ("CEL", "Cel"), ("MOT", "Moto"), ("CAR", "Auto"), ("MAQ", "Maq"), ("OT", "Otro")], multi=True)
    f.boxes("V13", "Seguro/cobertura salud", [("1", "IPS"), ("2", "Publico"), ("3", "Priv"), ("4", "Ning"), ("NS", "Ns/Nr")])
    f.boxes("V14", "Ingreso alcanza necesidades basicas", [("1", "Bien"), ("2", "Justo"), ("3", "No algunos meses"), ("4", "No mayoria"), ("NS", "Ns/Nr")])

    f.section("4", "Actividad artesanal o potencial")
    f.boxes("A00", "Si C09=N, hay interes/potencial artesanal", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")])
    f.field("A00D", "Detalle interes/potencial si C09=N")
    f.boxes("A01", "Tipo principal", [("01", "Textil"), ("02", "Cesteria"), ("03", "Madera"), ("04", "Ceram"), ("05", "Cuero"), ("06", "Joy/sem"), ("07", "Recicl"), ("08", "Alim"), ("09", "Mixta"), ("OT", "Otra")])
    f.field("A02", "Oficio/especialidad")
    f.field("A03", "Productos principales")
    f.boxes("A04", "Materia prima principal", [("01", "Madera"), ("02", "Bambu"), ("03", "Palma/fibra"), ("04", "Hilo"), ("05", "Cuero"), ("06", "Arcilla"), ("07", "Semillas"), ("08", "Metal"), ("09", "Plast rec"), ("10", "Papel"), ("11", "Tela rec"), ("OT", "Otra")])
    f.field("A04D", "Detalle otra materia prima")
    f.boxes("A05", "Otras materias primas", [("01", "Mad"), ("02", "Bam"), ("03", "Fib"), ("04", "Hilo"), ("05", "Cue"), ("06", "Arc"), ("07", "Sem"), ("08", "Met"), ("09", "Plast"), ("10", "Pap"), ("11", "Tela"), ("OT", "Otra")], multi=True)
    f.boxes("A06", "Origen materia prima", [("1", "Recolecta local"), ("2", "Compra local"), ("3", "Compra fuera"), ("4", "Intermed"), ("5", "Donada"), ("6", "Recicl"), ("OT", "Otro")])
    f.field("A07", "Lugar especifico de extraccion/compra")
    f.field("A08", "Tiempo llegar-extraer-volver")
    f.boxes("A09", "Dificultad materia prima", [("1", "Precio"), ("2", "Escasez"), ("3", "Distancia"), ("4", "Transp"), ("5", "Restric"), ("6", "Calidad"), ("7", "Ning"), ("OT", "Otra")])
    f.number_boxes("A10", "Anos experiencia", 2)
    f.boxes("A11", "Aprendio oficio", [("1", "Familia"), ("2", "Comunidad"), ("3", "Curso"), ("4", "Autod"), ("OT", "Otro")])
    f.boxes("A12", "Dedicacion", [("1", "Principal"), ("2", "Secund"), ("3", "Ocasional")])
    f.number_boxes("A13", "Dias/semana", 1)
    f.number_boxes("A14", "Horas/dia", 2)
    f.boxes("A15", "Lugar produce", [("1", "Casa"), ("2", "Taller propio"), ("3", "Comunit"), ("4", "Aire libre"), ("OT", "Otro")])
    f.boxes("A16", "Herramientas", [("MAN", "Manual"), ("MAQ", "Maq"), ("COS", "Coser"), ("HOR", "Horno"), ("TEL", "Telar"), ("MOL", "Molde"), ("OT", "Otra")], multi=True)
    f.field("A17", "Herramientas que necesita")
    f.boxes("A18", "Capacitacion ultimos 2 anos", [("S", "Si"), ("N", "No")])
    f.boxes("A19", "Temas que necesita", [("TEC", "Tecn"), ("DIS", "Diseno"), ("CAL", "Calid"), ("COM", "Comerc"), ("DIG", "Digital"), ("ORG", "Org"), ("FIN", "Fin"), ("OT", "Otro")], multi=True)
    f.boxes("A20", "Trabaja", [("1", "Solo/a"), ("2", "Familia"), ("3", "Grupo"), ("4", "Asoc")])

    f.section("5", "Produccion, ventas e ingresos")
    f.number_boxes("P01", "Unidades/mes", 4)
    f.number_boxes("P02", "Precio promedio Gs", 7)
    f.number_boxes("P03", "Costo promedio Gs", 7)
    f.number_boxes("P04", "Ingreso mensual SOLO artesania Gs", 8)
    f.boxes("P05", "Banda ingreso SOLO artesania", [("1", "<500k"), ("2", "500k-1M"), ("3", "1-2M"), ("4", "2-3M"), ("5", "3-5M"), ("6", ">5M"), ("NI", "No inf")])
    f.number_boxes("P06", "Ingreso TOTAL hogar Gs", 8)
    f.boxes("P07", "Banda ingreso TOTAL hogar", [("1", "<500k"), ("2", "500k-1M"), ("3", "1-2M"), ("4", "2-3M"), ("5", "3-5M"), ("6", ">5M"), ("NI", "No inf")])
    f.number_boxes("P08", "Personas dependen ingreso hogar", 2)
    f.number_boxes("P09", "Personas aportan ingreso hogar", 2)
    f.boxes("P10", "Fuente principal ingreso hogar", [("1", "Artes"), ("2", "Agri"), ("3", "Ganad"), ("4", "Pesca"), ("5", "Salario"), ("6", "Comerc"), ("7", "Ayuda"), ("8", "Prog soc"), ("OT", "Otra")])
    f.field("P10D", "Detalle fuente OT")
    f.boxes("P11", "Canal principal venta ARTESANIAS", [("1", "Comunidad"), ("2", "Feria loc"), ("3", "Feria reg"), ("4", "Intermed"), ("5", "Pedido"), ("6", "Tienda"), ("7", "WhatsApp"), ("8", "Redes"), ("OT", "Otro")])
    f.field("P11D", "Detalle canal OT")
    f.boxes("P12", "Otros canales venta", [("1", "Com"), ("2", "Feria"), ("3", "Reg"), ("4", "Inter"), ("5", "Pedido"), ("6", "Tienda"), ("7", "WA"), ("8", "Redes"), ("OT", "Otro")], multi=True)
    f.boxes("P13", "Barreras comercializacion", [("CLI", "Clientes"), ("PRE", "Precio"), ("TRA", "Transp"), ("CAP", "Capital"), ("HER", "Herram"), ("DIS", "Diseno"), ("PRO", "Promoc"), ("COM", "Compet"), ("MP", "Mat prima"), ("NIN", "Ning"), ("OT", "Otra")], multi=True)
    f.field("P13D", "Detalle barrera OT")

    f.section("6", "Formalizacion, credito y ambiente")
    f.boxes("F01", "Integra asociacion/grupo", [("S", "Si"), ("N", "No")])
    f.field("F02", "Nombre asociacion/grupo")
    f.boxes("F03", "Tiene RUC/factura/marca", [("RUC", "RUC"), ("FAC", "Factura"), ("MAR", "Marca"), ("NIN", "Ning")], multi=True)
    f.boxes("F04", "Acceso credito reciente", [("S", "Si"), ("N", "No")])
    f.boxes("F05", "Necesita financiamiento", [("S", "Si"), ("N", "No")])
    f.number_boxes("F06", "Monto necesario Gs", 8)
    f.boxes("F07", "Uso financiamiento", [("MP", "Mat prima"), ("HER", "Herram"), ("TAL", "Taller"), ("LOG", "Logist"), ("EMP", "Empaq"), ("FOR", "Formal"), ("CAP", "Capital"), ("OT", "Otro")], multi=True)
    f.boxes("E01", "Usa material reciclado", [("S", "Si"), ("N", "No")])
    f.field("E02", "Detalle reciclado")
    f.boxes("E03", "Riesgos trabajo", [("COR", "Cortes"), ("POL", "Polvo"), ("HUM", "Humo"), ("QUIM", "Quim"), ("ERG", "Dolor"), ("NIN", "Ning"), ("OT", "Otro")], multi=True)
    f.boxes("E04", "Usa proteccion", [("S", "Si"), ("N", "No"), ("A", "A veces")])

    f.section("7", "Paracel, expectativas y cierre")
    f.boxes("R01", "Conoce Paracel/programas", [("S", "Si"), ("N", "No"), ("P", "Parcial")])
    f.boxes("R02", "Participo antes actividad Paracel", [("S", "Si"), ("N", "No")])
    f.boxes("R03", "Interes en programa artesanal eventual", [("S", "Si"), ("N", "No"), ("NS", "Ns/Nr")])
    f.boxes("R04", "Desea recibir informacion Paracel", [("S", "Si"), ("N", "No")])
    f.boxes("R05", "Formato informacion", [("REU", "Reunion"), ("WA", "WhatsApp"), ("LLA", "Llamada"), ("SMS", "SMS"), ("RAD", "Radio"), ("IMP", "Impreso"), ("AUD", "Audio"), ("VID", "Video"), ("VIS", "Visita"), ("OT", "Otro")], multi=True)
    f.boxes("R06", "Idioma informacion", [("GUA", "Guarani"), ("CAS", "Cast"), ("BIL", "Ambos"), ("POR", "Port"), ("OT", "Otro")], multi=True)
    f.boxes("R07", "Prioridad apoyo", [("HER", "Herram"), ("MP", "Materia"), ("TEC", "Cap tecn"), ("DIS", "Diseno"), ("COM", "Comerc"), ("DIG", "Digital"), ("FOR", "Formal"), ("FIN", "Financ"), ("ORG", "Org"), ("OT", "Otro")], multi=True)
    f.field("R08", "Observaciones finales", 38)
    f.field("R09", "Resultado entrevista: completa/parcial/rechazo/ausente")
    f.field("R10", "Firma o iniciales encuestador")

    f.finish()


def build_dictionary() -> None:
    content = """# Diccionario de captura - Boleta OCR/OMR Artesanos Isla Hermosa

Archivo PDF: `FORMULARIO_OCR_OFICIO_ARTESANOS.pdf`

## Proposito

Boleta de respaldo en papel, tamano oficio/legal y maximo dos paginas, pensada para escaneo a 300 dpi y lectura OCR/OMR. La app web sigue siendo el canal principal; esta boleta sirve cuando se necesite operar sin tablet, hacer contingencia offline o digitar rapidamente desde formularios escaneados.

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

## Nota de diseno

La boleta comprime el instrumento en codigos para que sea operativa en campo. Para capacitacion del equipo se recomienda entregar una hoja separada con el significado completo de codigos largos si el equipo no esta familiarizado con ellos.
"""
    DICT_PATH.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    build_pdf()
    build_dictionary()
    print(PDF_PATH)
    print(DICT_PATH)
