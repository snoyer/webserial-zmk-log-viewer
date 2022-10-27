import json
import logging
import os
import re
import subprocess
import tempfile
from argparse import ArgumentParser
from collections import defaultdict
from itertools import chain
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

import yaml


def main():
    parser = ArgumentParser()
    parser.add_argument('ZMK_PATH', help="ZMK path")
    parser.add_argument('-f', '--formats', nargs='*', choices=['yaml', 'json', 'ts'], default=['ts'], help="output directory")
    parser.add_argument('--into', default=".", help="output directory")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format='%(message)s')

    zmk_path = Path(args.ZMK_PATH)
    zmk_include = zmk_path / 'app/include'

    constants = list(find_all_constants(zmk_include))
    logging.info('found %s', ', '.join(f'{len(ids)} {k}' for k,_,ids in constants if ids))

    """generate C code to output yaml"""
    c_src_lines = (
        '#include <stdio.h>',
        *(f'#include <{h}>' for _,h,ids in constants if ids),
        'int main(){',
        *chain.from_iterable(c_prints(section, ids.items()) for section,_,ids in constants),
        '}'
    )

    """compile C code"""
    with tempfile.NamedTemporaryFile('w', suffix='.c', delete=False) as c_file:
        c_file.writelines(f'{line}\n' for line in c_src_lines)
    with tempfile.NamedTemporaryFile('wb', delete=False) as out_file:
        subprocess.check_output([
            'cc', f'-I{zmk_include}', '-o', out_file.name, c_file.name
        ])

    """run executable and get yaml data"""
    constants_defs_yaml = subprocess.check_output([out_file.name], text=True)
    os.unlink(c_file.name)
    os.unlink(out_file.name)

    """parse data and create lookup"""
    constants_defs = yaml.load(constants_defs_yaml, yaml.SafeLoader)
    constants_lookup = {k: multidict_lookup(v) for k,v in constants_defs.items() if v}
    logging.info('lookup for %s', ', '.join(f'{len(vs)} {k}' for k,vs in constants_lookup.items()))

    """dump"""
    into = Path(args.into)
    if 'yaml' in args.formats:
        yaml.dump(constants_defs, open(into / 'constants-defs.yaml', 'w'), indent=2)
        yaml.dump(constants_lookup, open(into / 'constants-lookup.yaml', 'w'), indent=2)
    
    if 'json' in args.formats:
        json.dump(constants_defs, open(into / 'constants-defs.json', 'w'), indent=2)
        json.dump(constants_lookup, open(into / 'constants-lookup.json', 'w'), indent=2)

    if 'ts' in args.formats:
        with open(into / 'constants-lookup.ts', 'w') as f:
            f.write('export const CONSTANTS_LOOKUP: { [k: string]: { [k: string]: string } } = {\n')
            for k,d in constants_lookup.items():
                f.write(f'  {k}:{{\n')
                for k,v in d.items():
                    f.write(f'    0x{k:x}:"{v}",\n')
                f.write('  },\n')
            f.write('}\n')


def find_all_constants(zmk_inc: Path):
    hid_usage_pages_h = 'dt-bindings/zmk/hid_usage_pages.h'
    yield 'hid_usage_pages', hid_usage_pages_h, {m.group(1): m.group(2)
        for m in re_search_lines(zmk_inc / hid_usage_pages_h, r'#define (HID_USAGE_(\w+))')
        if not "deprecated" in m.string.lower()}
    
    keys_h = 'dt-bindings/zmk/keys.h'
    yield 'keys', keys_h, {m.group(1): m.group(1)
        for m in re_search_lines(zmk_inc / keys_h, r'#define (\w+)')
        if not "deprecated" in m.string.lower()}

    modifiers_h = 'dt-bindings/zmk/modifiers.h'
    yield 'modifiers', modifiers_h, {m.group(1): m.group(2)
        for m in re_search_lines(zmk_inc / modifiers_h, r'#define (MOD_(\w+))')}

    endpoints_types_h = 'zmk/endpoints_types.h'
    yield 'endpoints', endpoints_types_h, {m.group(1):m.group(2)
        for m in re_finditer_lines(zmk_inc / endpoints_types_h, r'(ZMK_ENDPOINT_(\w+))')}

    activity_h = 'zmk/activity.h'
    yield 'activity', activity_h, {m.group(1):m.group(2) 
        for m in re_finditer_lines(zmk_inc / activity_h, r'(ZMK_ACTIVITY_(\w+))')}


    led_indicators_types_h = 'zmk/led_indicators_types.h'
    yield 'led_indicators', led_indicators_types_h, {m.group(1):m.group(2) 
        for m in re_search_lines(zmk_inc / led_indicators_types_h, r'#define (ZMK_LED_INDICATORS_(\w+)_BIT)')}


def re_search_lines(fn: Path, pattern: str):
    if fn.is_file():
        for line in open(fn):
            if m := re.search(pattern, line):
                yield m

def re_finditer_lines(fn: Path, pattern: str):
    if fn.is_file():
        for line in open(fn):
            yield from re.finditer(pattern, line)

def multidict_lookup(xxx: Dict[str, Any]):
    yyy: Dict[Any, List[str]] = defaultdict(list)
    for k,v in xxx.items():
        yyy[v].append(k)
    
    return {k:min(vs, key=len) for k,vs in yyy.items()}


def c_prints(category: str, identifiers: Iterable[Tuple[str,str]]):
   yield f'printf("{category}:\\n");'
   for identifer,name in identifiers:
       yield f'printf("  {name}: 0x%x\\n", {identifer});'


if __name__ == '__main__':
    main()
