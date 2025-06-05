import os

def generar_brands_desde_html(carpeta):
    marcas = []

    for nombre_archivo in os.listdir(carpeta):
        if nombre_archivo.endswith('.html'):
            marca = os.path.splitext(nombre_archivo)[0]
            marcas.append(marca)

    marcas.sort()  # opcional: ordena alfabéticamente

    marcas_formateadas = ', '.join([f"'{m}'" for m in marcas])
    listado = f"const BRANDS = [{marcas_formateadas}];"
    print(listado)

# ✅ Usá una raw string (r'...') para rutas de Windows
carpeta_html = r'C:\Users\santi\Desktop\productos tienda'
generar_brands_desde_html(carpeta_html)
