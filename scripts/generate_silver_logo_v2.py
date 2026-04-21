"""
Genere une version argentee du logo Inaricom.

v2 : detection par dominance du canal R plutot que par seuils absolus.
     Capture aussi les zones anti-aliasing roses (#FFB0A0 type) qui etaient
     ratees par la v1.

Usage : python generate_silver_logo_v2.py <input.png> <output.png>
"""
import sys
from pathlib import Path
from PIL import Image


def is_reddish_pixel(r: int, g: int, b: int) -> bool:
    """Detect tout pixel avec dominance rouge, meme anti-aliasing rose.
    
    Critere : R est significativement plus grand que G et B.
    Capture :
      - Rouge pur (#FF0000, #E31E24)      : R>>G, R>>B
      - Rouge fonce (#A00909, #C81B24)    : R>>G, R>>B
      - Rose anti-aliasing (#FFB0A0)      : R>G, R>B (mais plus leger)
      - Bordures teintees rouge tres pale : meme principe
    
    Exclut les gris (R=G=B) et les autres teintes.
    """
    # Dominance rouge : R doit etre plus grand que G ET B
    # Avec tolerance de 10 pour capturer les anti-aliasing
    if r > g + 10 and r > b + 10:
        return True
    # Cas particulier rouge sature : R>>G et R>>B (deja couvert ci-dessus)
    # Cas rose tres pale : pas teinte rouge, on ignore (trop clair, sera traite comme blanc)
    return False


def rgb_to_silver(r: int, g: int, b: int) -> tuple[int, int, int]:
    """Convertit un pixel rouge/rose en argent en preservant la luminosite.
    
    Strategie :
    - Le pixel a une dominante R. On calcule sa luminance percue.
    - On remap vers une nuance argent (C0 = 192) tout en gardant la luminosite.
    """
    # Luminance relative (formule ITU-R BT.709)
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    # On remap la luminance [0, 255] vers [140, 240] en argent
    # (assez sombre pour rouge fonce, assez clair pour rose pale)
    silver_val = int(140 + (luminance / 255.0) * 100)
    silver_val = max(140, min(240, silver_val))
    
    return (silver_val, silver_val, silver_val)


def convert_logo_to_silver(input_path: str, output_path: str) -> None:
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    print(f'[IN]  {input_path} ({width}x{height})')
    
    pixels = img.load()
    converted = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            
            if is_reddish_pixel(r, g, b):
                new_r, new_g, new_b = rgb_to_silver(r, g, b)
                pixels[x, y] = (new_r, new_g, new_b, a)
                converted += 1
    
    img.save(output_path, 'PNG', optimize=True)
    print(f'[OUT] {output_path}')
    print(f'   Pixels rouges/roses convertis : {converted}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python generate_silver_logo_v2.py <input.png> <output.png>')
        sys.exit(1)
    
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    
    if not Path(in_path).exists():
        print(f'ERREUR : {in_path} n\'existe pas')
        sys.exit(1)
    
    convert_logo_to_silver(in_path, out_path)
    print('[OK] Logo argente v2 genere')
