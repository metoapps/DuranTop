#!/usr/bin/env python3
"""assets/sprites ve assets/kaleci içinde bulunan isteğe bağlı kareleri assets/manifest.json'a yazar.
Yeni kareler eklendiğinde çalıştır:  python3 tools/manifest.py   (ardından python3 tools/kaleci_maske.py)"""
import json, os
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ISTEGE = ('yaklas1', 'yaklas2', 'temas', 'dengeye') + tuple('sev%d' % i for i in range(1, 7))
def sprites():
    d = os.path.join(KOK, 'assets', 'sprites')
    return sorted(f for f in os.listdir(d) if f.endswith('.png') and f[:-4].split('_', 1)[1] in ISTEGE)
def kaleci():
    d = os.path.join(KOK, 'assets', 'kaleci')
    return sorted(f for f in os.listdir(d) if f.endswith('.png')) if os.path.isdir(d) else []
m = {'sprites': sprites(), 'kaleci': kaleci()}
json.dump(m, open(os.path.join(KOK, 'assets', 'manifest.json'), 'w'), indent=1)
print('manifest:', len(m['sprites']), 'sprite karesi,', len(m['kaleci']), 'kaleci karesi')
