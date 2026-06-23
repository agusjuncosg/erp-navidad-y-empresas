// Motor de datos y persistencia del ERP de Cajas Navideñas (NAVIDAD Y EMPRESAS)
// Todos los precios y costos en el sistema se consideran NETOS SIN IVA.

const INITIAL_CATALOG = [
    {
        "id": "prod_1",
        "code": "COD-CAJ-001",
        "name": "CAJA CON MOTIVOS NAVIDEÑOS 240 x 135 x 340 mm",
        "brand": "CAJAS",
        "category": "CAJAS Y CANASTAS",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_2",
        "code": "COD-CAJ-002",
        "name": "CAJA CON MOTIVOS NAVIDEÑOS 270 x 150 x 340 mm",
        "brand": "CAJAS",
        "category": "CAJAS Y CANASTAS",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_3",
        "code": "COD-CAJ-003",
        "name": "CAJA CON MOTIVOS NAVIDEÑOS 300 x 160 x 340 mm",
        "brand": "CAJAS",
        "category": "CAJAS Y CANASTAS",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_4",
        "code": "COD-CAJ-004",
        "name": "CAJA CON MOTIVOS NAVIDEÑOS 310 x 185 x 340 mm",
        "brand": "CAJAS",
        "category": "CAJAS Y CANASTAS",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_5",
        "code": "COD-CAJ-005",
        "name": "CAJA CON MOTIVOS NAVIDEÑOS 350 x 210 x 350 mm GFP",
        "brand": "CAJAS",
        "category": "CAJAS Y CANASTAS",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_6",
        "code": "COD-CAJ-006",
        "name": "CAJA PERSONALIZADA (500) 270 x 150 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x500 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_7",
        "code": "COD-CAJ-007",
        "name": "CAJA PERSONALIZADA (500) 300 x 160 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x500 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_8",
        "code": "COD-CAJ-008",
        "name": "CAJA PERSONALIZADA (500) 310 x 185 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x500 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_9",
        "code": "COD-CAJ-009",
        "name": "CAJA PERSONALIZADA (1000) 270 x 150 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x1000 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_10",
        "code": "COD-CAJ-010",
        "name": "CAJA PERSONALIZADA (1000) 300 x 160 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x1000 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_11",
        "code": "COD-CAJ-011",
        "name": "CAJA PERSONALIZADA (1000) 310 x 185 x 340 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x1000 unid",
        "cost": 2000.0,
        "price": 2860.0,
        "stock": 0
    },
    {
        "id": "prod_12",
        "code": "COD-CAJ-012",
        "name": "CAJA HOLCIM - BASE MAS TAPA - 300 x 300 x 350 mm",
        "brand": "CAJAS",
        "category": "Cajas personalizadas x1000 unid",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_13",
        "code": "COD-SID-013",
        "name": "SIDRA RAMA CAIDA X710 CC",
        "brand": "SIDRA",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_14",
        "code": "COD-ANA-014",
        "name": "ANANA FIZZ RAMA CAIDA X710 CC",
        "brand": "ANANA FIZZ",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_15",
        "code": "COD-SID-015",
        "name": "SIDRA LA VICTORIA X720 CC",
        "brand": "SIDRA",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_16",
        "code": "COD-ANA-016",
        "name": "ANANA FIZZ LA VICTORIA X750 CC",
        "brand": "ANANA FIZZ",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_17",
        "code": "COD-SID-017",
        "name": "SIDRA REAL ETIQUETA BLANCA X710 CC",
        "brand": "SIDRA",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_18",
        "code": "COD-ANA-018",
        "name": "ANANA FIZZ REAL X710 CC",
        "brand": "ANANA FIZZ",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 1200.0,
        "price": 1710.0,
        "stock": 120
    },
    {
        "id": "prod_19",
        "code": "COD-SID-019",
        "name": "SIDRA 1888 SAENZ BRIONES X750 CC",
        "brand": "SIDRA",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 2500.0,
        "price": 3570.0,
        "stock": 120
    },
    {
        "id": "prod_20",
        "code": "COD-SID-020",
        "name": "SIDRA 1888 SAENZ BRIONES LATA X473 CC",
        "brand": "SIDRA",
        "category": "SIDRA Y ANANA FIZZ",
        "cost": 2500.0,
        "price": 3570.0,
        "stock": 120
    },
    {
        "id": "prod_21",
        "code": "COD-B-021",
        "name": "VINO ELEGIDO NORTON MALBEC X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_22",
        "code": "COD-B-022",
        "name": "VINO ELEGIDO NORTON CHARDONNAY X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_23",
        "code": "COD-B-023",
        "name": "VINO 1895 NORTON MALBEC X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_24",
        "code": "COD-B-024",
        "name": "VINO 1895 NORTON CHARDONNAY X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_25",
        "code": "COD-B-025",
        "name": "VINO COSECHA TARDIA BCO DCE DE NORTON X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_26",
        "code": "COD-B-026",
        "name": "VINO TRIBU CABERNET SAUVIGNON B. TRIVENTO X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_27",
        "code": "COD-B-027",
        "name": "VINO TRIBU BLANCO DULCE B. TRIVENTO X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_28",
        "code": "COD-B-028",
        "name": "VINO CASILLERO DEL DIABLO MALBEC X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_29",
        "code": "COD-B-029",
        "name": "VINO CASILLERO DEL DIABLO CHARDONNAY X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_30",
        "code": "COD-B-030",
        "name": "VINO TRIVENTO RESERVA MALBEC X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_31",
        "code": "COD-B-031",
        "name": "VINO TRIVENTO RESERVA WHITE MALBEC X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_32",
        "code": "COD-B-032",
        "name": "VINO CALLIA CABERNET SAUVIGNON X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_33",
        "code": "COD-B-033",
        "name": "VINO CALLIA MALBEC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_34",
        "code": "COD-B-034",
        "name": "VINO CALLIA SALENTEIN CHARDONNAY X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_35",
        "code": "COD-B-035",
        "name": "VINO CALLIA SALENTEIN ROSE X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_36",
        "code": "COD-B-036",
        "name": "VINO PORTILLO SALENTEIN MALBEC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_37",
        "code": "COD-B-037",
        "name": "VINO PORTILLO SALENTEIN CHARDONNAY X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_38",
        "code": "COD-B-038",
        "name": "VINO KILLKA SALENTEIN MALBEC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_39",
        "code": "COD-B-039",
        "name": "VINO KILLKA SALENTEIN CHARDONNAY X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_40",
        "code": "COD-B-040",
        "name": "VINO SALENTEIN RESERVE MALBEC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 8500.0,
        "price": 12140.0,
        "stock": 120
    },
    {
        "id": "prod_41",
        "code": "COD-B-041",
        "name": "VINO SALENTEIN RESERVE CABERNET FRANC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 8500.0,
        "price": 12140.0,
        "stock": 120
    },
    {
        "id": "prod_42",
        "code": "COD-B-042",
        "name": "VINO SALENTEIN CHARDONNAY X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_43",
        "code": "COD-B-043",
        "name": "VINO SALENTEIN NUMINA MALBEC X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_44",
        "code": "COD-B-044",
        "name": "D,V, CATENA ZAPATA CABERNET-MALBEC X750 CC",
        "brand": "B. C. ZAPATA",
        "category": "bodega Salentein",
        "cost": 8500.0,
        "price": 12140.0,
        "stock": 120
    },
    {
        "id": "prod_45",
        "code": "COD-B-045",
        "name": "ESPUMANTE NORTON EXTRA BRUT X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_46",
        "code": "COD-B-046",
        "name": "ESPUMANTE GAMBEI NORTON EXTRA BRUT X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_47",
        "code": "COD-B-047",
        "name": "ESPUMANTE NORTON COSECHA ESPECIAL EXTRA BRUT X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_48",
        "code": "COD-B-048",
        "name": "ESPUMANTE NORTON COSECHA ESPECIAL BRUT NATURE X750 CC",
        "brand": "B. NORTON",
        "category": "bodega Norton",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_49",
        "code": "COD-B-049",
        "name": "ESPUMANTE CASILLERO DEL DIABLO EXTRA BRUT X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_50",
        "code": "COD-B-050",
        "name": "ESPUMANTE TRIVENTO CUVEE BRUT NATURE X750 CC",
        "brand": "B. TRIVENTO",
        "category": "bodega Trivento",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_51",
        "code": "COD-B-051",
        "name": "ESPUMANTE CALLIA EXTRA BRUT X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_52",
        "code": "COD-B-052",
        "name": "ESPUMANTE CALLIA BRUT NATURE X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_53",
        "code": "COD-B-053",
        "name": "ESPUMANTE SALENTEIN BRUT NATURE X375 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_54",
        "code": "COD-B-054",
        "name": "ESPUMANTE SALENTEIN EXTRA BRUT X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_55",
        "code": "COD-B-055",
        "name": "ESPUMANTE SALENTEIN BRUT NATURE X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_56",
        "code": "COD-B-056",
        "name": "ESPUMANTE SALENTEIN ROSE X750 CC",
        "brand": "B. SALENTEIN",
        "category": "bodega Salentein",
        "cost": 4500.0,
        "price": 6430.0,
        "stock": 120
    },
    {
        "id": "prod_57",
        "code": "COD-B-057",
        "name": "ESPUMANTE NIETO SENETINER EXTRA BRUT X750 CC",
        "brand": "B. NIETO SENETINER",
        "category": "otras bodegas",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_58",
        "code": "COD-FER-058",
        "name": "FERNET BRANCA X450 CC",
        "brand": "FERNET",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_59",
        "code": "COD-FER-059",
        "name": "FERNET BRANCA X750 CC",
        "brand": "FERNET",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_60",
        "code": "COD-FER-060",
        "name": "FERNET BRANCA X1000 CC",
        "brand": "FERNET",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_61",
        "code": "COD-COC-061",
        "name": "COCA COLA X1000 CC",
        "brand": "COCA COLA",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_62",
        "code": "COD-COC-062",
        "name": "COCA COLA X1500 CC",
        "brand": "COCA COLA",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_63",
        "code": "COD-COC-063",
        "name": "COCA COLA X2250 CC",
        "brand": "COCA COLA",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_64",
        "code": "COD-COC-064",
        "name": "COCA COLA X2,5 LTS",
        "brand": "COCA COLA",
        "category": "OTRAS BEBIDAS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_65",
        "code": "COD-NEV-065",
        "name": "PAN DULCE BUON NATALE NEVARES X170 GRS",
        "brand": "NEVARES",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_66",
        "code": "COD-BON-066",
        "name": "PAN DULCE CONDESA BONAFIDE CON FRUTAS X380 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_67",
        "code": "COD-BON-067",
        "name": "PAN DULCE CONDESA BONAFIDE CON CHIPS X380 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_68",
        "code": "COD-BON-068",
        "name": "PAN DULCE CONDESA BONAFIDE SIN FRUTAS X380 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_69",
        "code": "COD-BON-069",
        "name": "PAN DULCE BONAFIDE SIN FRUTAS X400 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_70",
        "code": "COD-BON-070",
        "name": "PAN DULCE BONAFIDE C/CHIPS DE CHOC X400 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_71",
        "code": "COD-BON-071",
        "name": "PAN DULCE BONAFIDE CON FRUTAS X400 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_72",
        "code": "COD-FIR-072",
        "name": "PAN DULCE MARCOLLA CON FRUTAS X500 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_73",
        "code": "COD-FIR-073",
        "name": "PAN DULCE MARCOLLA CON CHIPS X500 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_74",
        "code": "COD-FIR-074",
        "name": "PAN DULCE MUSEL CON FRUTAS X500 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_75",
        "code": "COD-FIR-075",
        "name": "PAN DULCE MUSEL CON CHIPS X500 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_76",
        "code": "COD-BON-076",
        "name": "PANNETONE BONAFIDE CON FRUTAS X600 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_77",
        "code": "COD-BON-077",
        "name": "PANNETONE BONAFIDE CON CHIPS CHOC X600 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 2200.0,
        "price": 3140.0,
        "stock": 120
    },
    {
        "id": "prod_78",
        "code": "COD-FIR-078",
        "name": "PAN DULCE MARCOLLA CON ALMENDRAS EN ESTUCHE X600 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 3800.0,
        "price": 5430.0,
        "stock": 120
    },
    {
        "id": "prod_79",
        "code": "COD-FIR-079",
        "name": "PAN DULCE MUSEL CON ALMENDRAS ESTUCHE X700 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 3800.0,
        "price": 5430.0,
        "stock": 120
    },
    {
        "id": "prod_80",
        "code": "COD-FIR-080",
        "name": "PAN DULCE FIRENZE CON ALMENDRAS ESTUCHE X750 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 3800.0,
        "price": 5430.0,
        "stock": 120
    },
    {
        "id": "prod_81",
        "code": "COD-BON-081",
        "name": "PANNETTONE BONAFIDE CON ALMENDRAS Y CAPA EN ESTUCHE X850 GRS",
        "brand": "BONAFIDE",
        "category": "PAN DULCES",
        "cost": 3800.0,
        "price": 5430.0,
        "stock": 120
    },
    {
        "id": "prod_82",
        "code": "COD-FIR-082",
        "name": "PAN DULCE STEINHAUSER ALMENDRAS ESTUCHE X850 GRS",
        "brand": "FIRENZE",
        "category": "PAN DULCES",
        "cost": 3800.0,
        "price": 5430.0,
        "stock": 120
    },
    {
        "id": "prod_83",
        "code": "COD-NEV-083",
        "name": "BUDIN BUON NATALE NEVARES X400 GRS",
        "brand": "NEVARES",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_84",
        "code": "COD-BON-084",
        "name": "BUDIN CONDESA BONAFIDE SIN FRUTAS X160 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_85",
        "code": "COD-BON-085",
        "name": "BUDIN CONDESA BONAFIDE CON FRUTAS X160 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_86",
        "code": "COD-BON-086",
        "name": "BUDIN CONDESA BONAFIDE CON CHIPS X160 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_87",
        "code": "COD-BON-087",
        "name": "BUDIN BONAFIDE C/CHIPS DE CHOC X180 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_88",
        "code": "COD-BON-088",
        "name": "BUDIN BONAFIDE CON FRUTAS X180 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_89",
        "code": "COD-BON-089",
        "name": "BUDIN BONAFIDE LIMON X180 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_90",
        "code": "COD-BON-090",
        "name": "BUDIN BONAFIDE MARMOLADO X180 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_91",
        "code": "COD-BON-091",
        "name": "BUDIN BONAFIDE VAINILLA X180 GRS",
        "brand": "BONAFIDE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_92",
        "code": "COD-FIR-092",
        "name": "BUDIN MARCOLLA CON CHIPS X200 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_93",
        "code": "COD-FIR-093",
        "name": "BUDIN MARCOLLA CON FRUTAS X200 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_94",
        "code": "COD-FIR-094",
        "name": "BUDIN MARCOLLA MARMOLADO X200 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_95",
        "code": "COD-FIR-095",
        "name": "BUDIN MARCOLLA RELL CON DDL X200 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_96",
        "code": "COD-FIR-096",
        "name": "BUDIN MARCOLLA VAINILLA X200 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_97",
        "code": "COD-FIR-097",
        "name": "BUDIN MUSEL CON CHIPS DE CHOC X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_98",
        "code": "COD-FIR-098",
        "name": "BUDIN MUSEL C/NUEZ Y ALMENDRAS X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_99",
        "code": "COD-FIR-099",
        "name": "BUDIN STEINHAUSER AMARETTO X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_100",
        "code": "COD-FIR-100",
        "name": "BUDIN STEINHAUSER MARMOLADO X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_101",
        "code": "COD-FIR-101",
        "name": "BUDIN STEINHAUSER NARANJA X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_102",
        "code": "COD-FIR-102",
        "name": "BUDIN STEINHAUSER CHOCOLATE X250 GRS",
        "brand": "FIRENZE",
        "category": "BUDINES",
        "cost": 900.0,
        "price": 1290.0,
        "stock": 120
    },
    {
        "id": "prod_103",
        "code": "COD-GEO-103",
        "name": "TURRON DE MANI",
        "brand": "GEORGALOS",
        "category": "TURRÓNES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_104",
        "code": "COD-LHE-104",
        "name": "TURRON DE MANI CON MIEL FIESTAS LHERITIER X80 GRS",
        "brand": "LHERITIER",
        "category": "TURRÓNES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_105",
        "code": "COD-BON-105",
        "name": "TURRÓN CREMONA DE MANI BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "TURRÓNES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_106",
        "code": "COD-BON-106",
        "name": "TURRÓN MANI CON MIEL CREMONA BONAFIDE X100 GRS",
        "brand": "BONAFIDE",
        "category": "TURRÓNES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_107",
        "code": "COD-BON-107",
        "name": "CROCANTE DE MANI BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_108",
        "code": "COD-BON-108",
        "name": "CROCANTE DE MANI BONAFIDE X90 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_109",
        "code": "COD-GEO-109",
        "name": "CROCANTE DE FRUTOS SECOS X95 GRS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_110",
        "code": "COD-GEO-110",
        "name": "TURRON DE MANI CON FRUTAS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_111",
        "code": "COD-LHE-111",
        "name": "TURRON DE MANI CON FRUTAS LHERITIER X100 GRS",
        "brand": "LHERITIER",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_112",
        "code": "COD-BON-112",
        "name": "TURRON MANI CON FRUTAS BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_113",
        "code": "COD-BON-113",
        "name": "TURRON CREMONA CON FRUTAS BONAFIDE X100 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_114",
        "code": "COD-FEL-114",
        "name": "TURRON TIP FRANCES CON FRUTAS FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_115",
        "code": "COD-GEO-115",
        "name": "TURRONES BLANDOS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_116",
        "code": "COD-LHE-116",
        "name": "TURRÓN BLANDO DE COCO LHERITIER X100 GRS",
        "brand": "LHERITIER",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_117",
        "code": "COD-GEO-117",
        "name": "TURRÓN BLANDO DE MANI GEORGALOS X90 GRS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_118",
        "code": "COD-BON-118",
        "name": "TURRON BLANDO DE MANI CON YEMA Y FRUTAS BONAFIDE X150 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_119",
        "code": "COD-GEO-119",
        "name": "TURRONES CON ALMENDRAS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_120",
        "code": "COD-GEO-120",
        "name": "TURRÓN DE MANÍ Y ALMENDRAS GEORGALOS X80 GRS",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_121",
        "code": "COD-FEL-121",
        "name": "TURRON DE ALMENDRAS, FRUTILLAS Y YOGHURT FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_122",
        "code": "COD-FEL-122",
        "name": "TURRON DE ALMENDRAS MONTELIMAR FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_123",
        "code": "COD-GEO-123",
        "name": "TURRONES CON CHOCOLATE",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_124",
        "code": "COD-BON-124",
        "name": "TURRON CHOCOLATE CON MANI BONAFIDE X100 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_125",
        "code": "COD-FEL-125",
        "name": "TURRON DE MANI SEMIBLANDO CON CHIOCOLATE FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_126",
        "code": "COD-FEL-126",
        "name": "TURRON CREMONA DE ALMENDRAS EN ESTUCHE FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_127",
        "code": "COD-FEL-127",
        "name": "TRUFADO DE ALMENDRAS Y CHOCOLATE FELFORT X100 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_128",
        "code": "COD-GEO-128",
        "name": "TURRONES EN ESTUCHES",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_129",
        "code": "COD-BON-129",
        "name": "TURRÓN BONAFIDE CREMONA MANI MIEL ESTUCHE X120 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_130",
        "code": "COD-BON-130",
        "name": "TURRÓN VIZZIO DE ALMENDRAS SIN TACC ESTUCHE X120 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_131",
        "code": "COD-BON-131",
        "name": "TURRON BONAFIDE SAMBAYON BAÑADO ESTUCHE X120 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_132",
        "code": "COD-BON-132",
        "name": "TURRÓN VIZZIO BLANDO DE ALMENDRAS ESTUCHE X120 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_133",
        "code": "COD-BON-133",
        "name": "TURRÓN VIZZIO CROCANTE DE ALMENDRA ESTUCHE X100 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 1500.0,
        "price": 2140.0,
        "stock": 120
    },
    {
        "id": "prod_134",
        "code": "COD-BON-134",
        "name": "TORTA BONAFIDE DE MANÍ Y MIEL X150 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_135",
        "code": "COD-BON-135",
        "name": "TORTA VIZZIO DE CHOCOLATE C/FRUTOS SECOS X150",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_136",
        "code": "COD-GEO-136",
        "name": "GARAPIÑADAS DE MANI",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_137",
        "code": "COD-LHE-137",
        "name": "GARRAPIÑADAS DE MANI FIESTAS LHERITIER X80 GRS",
        "brand": "LHERITIER",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_138",
        "code": "COD-BON-138",
        "name": "GARRAPIÑADAS DE MANÍ BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_139",
        "code": "COD-BON-139",
        "name": "GARRAPIÑADAS DE MANÍ BONAFIDE X100 GRS",
        "brand": "BONAFIDE",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_140",
        "code": "COD-FEL-140",
        "name": "GARRAPIÑADAS DE MANÍ FELFORT X150 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_141",
        "code": "COD-GEO-141",
        "name": "CONFITES DE MANI",
        "brand": "GEORGALOS",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_142",
        "code": "COD-LHE-142",
        "name": "MANI CONFITADO LHERITIER X80 GRS",
        "brand": "LHERITIER",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_143",
        "code": "COD-FEL-143",
        "name": "CONFITE  DE MANÍ FELFORT X150 GRS",
        "brand": "FELFORT",
        "category": "TABLETAS CROCANTES",
        "cost": 700.0,
        "price": 1000.0,
        "stock": 120
    },
    {
        "id": "prod_144",
        "code": "COD-LHE-144",
        "name": "MANI BAÑADO FIESTAS LHERITIER X80 GRS",
        "brand": "LHERITIER",
        "category": "BAÑADOS CON CHOCOLATE EN BOLSAS",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_145",
        "code": "COD-BON-145",
        "name": "MANI BAÑADO BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN BOLSAS",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_146",
        "code": "COD-BON-146",
        "name": "CEREAL BAÑADO BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN BOLSAS",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_147",
        "code": "COD-BON-147",
        "name": "PASAS DE UVA BAÑADAS BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN BOLSAS",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_148",
        "code": "COD-BON-148",
        "name": "ALMENDRAS BLANCAS BAÑADAS BONAFIDE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN BOLSAS",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_149",
        "code": "COD-BON-149",
        "name": "VIZZIO MANI CROC ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_150",
        "code": "COD-BON-150",
        "name": "VIZZIO CEREAL ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_151",
        "code": "COD-BON-151",
        "name": "VIZZIO PASAS DE UVA ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_152",
        "code": "COD-BON-152",
        "name": "VIZZIO NUGATON ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_153",
        "code": "COD-BON-153",
        "name": "VIZZIO CAFÉ BAÑADO ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_154",
        "code": "COD-BON-154",
        "name": "VIZZIO ALMENDRAS ESTUCHE X80 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_155",
        "code": "COD-BON-155",
        "name": "VIZZIO AVELLANAS ESTUCHE X100 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_156",
        "code": "COD-BON-156",
        "name": "VIZZIO ARANDANOS ESTUCHE X100 GRS",
        "brand": "BONAFIDE",
        "category": "BAÑADOS CON CHOCOLATE EN ESTUCHES",
        "cost": 1100.0,
        "price": 1570.0,
        "stock": 120
    },
    {
        "id": "prod_157",
        "code": "COD-LHE-157",
        "name": "POSTRE DE MANI LHERITIER X75 GRS",
        "brand": "LHERITIER",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_158",
        "code": "COD-BON-158",
        "name": "POSTRE NUGATON BONAFIDE X75 GRS",
        "brand": "BONAFIDE",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_159",
        "code": "COD-LHE-159",
        "name": "POSTRE DE MANI LHERITIER X100 GRS",
        "brand": "LHERITIER",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_160",
        "code": "COD-BON-160",
        "name": "POSTRE NUGATON BONAFIDE X100 GRS",
        "brand": "BONAFIDE",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_161",
        "code": "COD-LHE-161",
        "name": "POSTRE DE MANI LHERITIER X150 GRS",
        "brand": "LHERITIER",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_162",
        "code": "COD-LHE-162",
        "name": "POSTRE DE MANI LHERITIER X200 GRS",
        "brand": "LHERITIER",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_163",
        "code": "COD-GEO-163",
        "name": "MANTECOL X111 GRS",
        "brand": "GEORGALOS",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_164",
        "code": "COD-GEO-164",
        "name": "MANTECOL MARMOLADO X111 GRS",
        "brand": "GEORGALOS",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_165",
        "code": "COD-GEO-165",
        "name": "MANTECOL SIN TACC X253 GRS",
        "brand": "GEORGALOS",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_166",
        "code": "COD-GEO-166",
        "name": "MANTECOL X404 GRS",
        "brand": "GEORGALOS",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_167",
        "code": "COD-GEO-167",
        "name": "MANTECOL LINGOTE X500 GRS",
        "brand": "GEORGALOS",
        "category": "POSTRES DE MANI",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_168",
        "code": "COD-GEN-168",
        "name": "ACEITUNAS NEGRAS N2 GENTLEMAN BANDEJA X200 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_169",
        "code": "COD-LA-169",
        "name": "ACEITUNAS NEGRAS TIPO GRIEGAS FCO X200 GRS LA SALMUERA",
        "brand": "LA SALMUERA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_170",
        "code": "COD-GEN-170",
        "name": "ACEITUNAS RELLENAS CON MORRON GENTLEMAN X200 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_171",
        "code": "COD-CAR-171",
        "name": "ACETO BALSAMICO CARACAS X250 GRS",
        "brand": "CARACAS",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_172",
        "code": "COD-CUM-172",
        "name": "ALMENDRA TOSTADA CUMANA X250 GRS CRISTAL",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_173",
        "code": "COD-GEN-173",
        "name": "ANANA EN RODAJAS GENTLEMAN X820 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_174",
        "code": "COD-CUM-174",
        "name": "ARVEJAS REMOJADAS CUMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_175",
        "code": "COD-CAR-175",
        "name": "ATUN DESMENUZADO AL NATURAL CARACAS X170 GRS",
        "brand": "CARACAS",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_176",
        "code": "COD-CUM-176",
        "name": "ATUN DESMENUZADO AL NATURAL CUMANA X170 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_177",
        "code": "COD-ARC-177",
        "name": "ATUN DESMENUZADO AL NATURAL LA CAMPAGNOLA X170 GRS",
        "brand": "ARCOR",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_178",
        "code": "COD-NOE-178",
        "name": "ATUN DESMENUZADO AL NATURAL NOEL X170 GRS",
        "brand": "NOEL",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_179",
        "code": "COD-FER-179",
        "name": "BOMBON FERRERO ROCHER X3 UNI",
        "brand": "FERRERO ROCHER",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_180",
        "code": "COD-CUM-180",
        "name": "CASTAÑA CAJU CUMANA X250 GRS CRISTAL",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_181",
        "code": "COD-CAR-181",
        "name": "CHAMPIGNON ENTERO CARACAS X400 GRS",
        "brand": "CARACAS",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_182",
        "code": "COD-CUM-182",
        "name": "CHAMPIGNON ENTERO CUMANA X400 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_183",
        "code": "COD-CUM-183",
        "name": "CHAMPIGNON LAMINADO CUMANA X400 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_184",
        "code": "COD-CUM-184",
        "name": "CHOCLO CREMOSO AMARILLO UMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_185",
        "code": "COD-CUM-185",
        "name": "CHOCLO EN GRANO CUMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_186",
        "code": "COD-ARC-186",
        "name": "CHOCOLATE BLOCKAZO ARCOR X1 KG",
        "brand": "ARCOR",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_187",
        "code": "COD-GEN-187",
        "name": "COCTEL DE 4 FRUTAS GENTLEMAN X820 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_188",
        "code": "COD-CUM-188",
        "name": "COCTEL DE 5 FRUTAS CUMANA X820 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_189",
        "code": "COD-GEN-189",
        "name": "CORAZON DE ALCAHUCIL GENTLEMAN X350 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_190",
        "code": "COD-CUM-190",
        "name": "DURAZNO EN MITADES S/TACC CUMANA X820 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_191",
        "code": "COD-GEN-191",
        "name": "DURAZNOS EN MITADES GENTLEMAN BAJA CALORIAS X820 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_192",
        "code": "COD-CUM-192",
        "name": "ESPARRAGOS BLANCOS EN FRASCO CUMANA X330 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_193",
        "code": "COD-GEN-193",
        "name": "ESPARRAGOS VERDES GENTLEMAN X400 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_194",
        "code": "COD-CUM-194",
        "name": "GARBANZOS CUMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_195",
        "code": "COD-CUM-195",
        "name": "JARDINERA CUMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_196",
        "code": "COD-CUM-196",
        "name": "LENTEJA CUMANA X300 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_197",
        "code": "COD-GEN-197",
        "name": "LENTEJAS GENTLEMAN X400 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_198",
        "code": "COD-ARC-198",
        "name": "LOMITO DE ATUN AHUMADO ARCOR X170 GRS",
        "brand": "ARCOR",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_199",
        "code": "COD-CUM-199",
        "name": "LOMITO DE ATUN AL ACEITE CUMANA X170 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_200",
        "code": "COD-CAR-200",
        "name": "LOMITO DE ATUN CARACAS AL NATURAL X170 GRS",
        "brand": "CARACAS",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_201",
        "code": "COD-CUM-201",
        "name": "MAIZ FRITO SALADO SAB QUESO CUMANA X250 GRS CRISTAL",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_202",
        "code": "COD-CUM-202",
        "name": "MIX DE FRUTOS SECOS CUMANA X120 GRS CRISTAL",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_203",
        "code": "COD-CUM-203",
        "name": "NUECES MARIPOSA S/TACC CUMANA X150 GRS CRISTAL",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_204",
        "code": "COD-CUM-204",
        "name": "PALMITOS EN TROZOS CUMANA X396 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_205",
        "code": "COD-GEN-205",
        "name": "PALMITOS EN TROZOS GENTLEMAN  X398 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_206",
        "code": "COD-ACA-206",
        "name": "PALMITOS ENTEROS ACAPULCO X400 GRS",
        "brand": "ACAPULCO",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_207",
        "code": "COD-CUM-207",
        "name": "PALMITOS ENTEROS CUMANA X396 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_208",
        "code": "COD-CUM-208",
        "name": "PERAS EN MITADES CUMANA X820 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_209",
        "code": "COD-GEN-209",
        "name": "PERAS EN MITADES GENTLEMAN X820 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_210",
        "code": "COD-CUM-210",
        "name": "PIMIENTOS MORRONES CUMANA X185 GRS",
        "brand": "CUMANA",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_211",
        "code": "COD-BON-211",
        "name": "PIONONO BONAFIDE DULCE X200 GRS",
        "brand": "BONAFIDE",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_212",
        "code": "COD-BON-212",
        "name": "PIONONO BONAFIDE SALADOX200 GRS",
        "brand": "BONAFIDE",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_213",
        "code": "COD-GEN-213",
        "name": "PURE DE MANZANAS EN FRASCO GENTLEMAN X375 GRS",
        "brand": "GENTLEMAN",
        "category": "OTROS PRODUCTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_214",
        "code": "COD-LA-214",
        "name": "DURAZNO AL NATURAL  MOLINO ROJO X820 GRS",
        "brand": "LA GIOCONDA",
        "category": "ENLATADOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_215",
        "code": "COD-LA-215",
        "name": "COCTEL DE FRUTAS MOLINO ROJO X820 GRS",
        "brand": "LA GIOCONDA",
        "category": "ENLATADOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_216",
        "code": "COD-GEN-216",
        "name": "Descuento Financiero 10%",
        "brand": "NAVIDAD Y EMPRESAS",
        "category": "DESCUENTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    },
    {
        "id": "prod_217",
        "code": "COD-GEN-217",
        "name": "Descuento Financiero 5%",
        "brand": "NAVIDAD Y EMPRESAS",
        "category": "DESCUENTOS",
        "cost": 1000.0,
        "price": 1430.0,
        "stock": 120
    }
];

const INITIAL_LEADS = [
    {
        id: "lead_1",
        clientName: "Empresa Transportes Andes",
        contactName: "Raúl Gómez",
        phone: "+54 351 555-1234",
        email: "rgomez@transportesandes.com.ar",
        source: "WhatsApp Navidad y Empresas",
        notes: "Interesado en 150 cajas corporativas medianas. Presupuesto estimado para fines de noviembre.",
        status: "Contactado",
        date: "2026-11-15T10:30:00Z",
        reminders: [
            { id: "rem_1", text: "Llamar para definir contenido", date: "2026-11-20", done: false }
        ]
    },
    {
        id: "lead_2",
        clientName: "Sanatorio de la Sierra",
        contactName: "Dra. Marta Paz",
        phone: "+54 351 987-6543",
        email: "compras@sanatoriosierra.com",
        source: "Mail Navidad y Empresas",
        notes: "Consulta por 400 cajas Premium. Requieren factura A y entrega fraccionada en Córdoba Capital.",
        status: "En Negociación",
        date: "2026-11-16T14:15:00Z",
        reminders: []
    }
];

// Lista de proveedores controlada (evita escritura libre y variantes del mismo nombre)
const INITIAL_PROVIDERS = [
    "Proveedor General",
    "Distribuidora Norte",
    "Cajas y Empaques SA",
    "Bodega Norton",
    "Trivento Distribución",
    "Distribuidora Bebidas Córdoba"
];

const INITIAL_EMPLOYEES = [
    { id: "emp_1", name: "Juan Pérez", hourlyRate: 2500, extraHourlyRate: 3750, status: "Activo", isCustomRate: false },
    { id: "emp_2", name: "María Gómez", hourlyRate: 2500, extraHourlyRate: 3750, status: "Activo", isCustomRate: false },
    { id: "emp_3", name: "Pedro Rodríguez", hourlyRate: 2500, extraHourlyRate: 3750, status: "Activo", isCustomRate: false },
    { id: "emp_4", name: "Ana Martínez", hourlyRate: 2700, extraHourlyRate: 4050, status: "Activo", isCustomRate: true },
    { id: "emp_5", name: "Lucas Peralta", hourlyRate: 2400, extraHourlyRate: 3600, status: "Activo", isCustomRate: true }
];

// Asistencia por operario y por fecha
const INITIAL_ATTENDANCE = [
    { id: "att_1", date: "2026-11-30", employeeId: "emp_1", clockIn: "08:00", clockOut: "17:00", hours: 8.0, normalHours: 8.0, extraHours: 0.0, totalPay: 20000, paymentStatus: "Pendiente" },
    { id: "att_2", date: "2026-11-30", employeeId: "emp_2", clockIn: "08:00", clockOut: "18:30", hours: 9.5, normalHours: 8.0, extraHours: 1.5, totalPay: 25625, paymentStatus: "Pendiente" },
    { id: "att_3", date: "2026-11-30", employeeId: "emp_4", clockIn: "09:00", clockOut: "16:30", hours: 6.5, normalHours: 6.5, extraHours: 0.0, totalPay: 17550, paymentStatus: "Pendiente" },
    { id: "att_4", date: "2026-12-01", employeeId: "emp_1", clockIn: "08:00", clockOut: "17:00", hours: 8.0, normalHours: 8.0, extraHours: 0.0, totalPay: 20000, paymentStatus: "Pendiente" }
];

const INITIAL_COMBOS = [
    {
        id: "combo_premium",
        name: "Caja Navideña Premium 1888",
        price: 35000,
        items: [
            { prodId: "prod_5", qty: 1 }, // CAJA CON MOTIVOS NAVIDEÑOS 350 x 210 x 350
            { prodId: "prod_18", qty: 1 }, // SIDRA 1888 SAENZ BRIONES X750 CC
            { prodId: "prod_28", qty: 1 }, // VINO TRIVENTO RESERVA MALBEC
            { prodId: "prod_72", qty: 1 }, // PAN DULCE STEINHAUSER ALMENDRAS
            { prodId: "prod_91", qty: 1 }, // BUDIN MUSEL C/NUEZ Y ALMENDRAS
            { prodId: "prod_128", qty: 1 } // VIZZIO ALMENDRAS ESTUCHE
        ]
    },
    {
        id: "combo_clasico",
        name: "Caja Navideña Clásica",
        price: 18500,
        items: [
            { prodId: "prod_3", qty: 1 }, // CAJA CON MOTIVOS NAVIDEÑOS 300 x 160 x 340
            { prodId: "prod_16", qty: 1 }, // SIDRA REAL ETIQUETA BLANCA
            { prodId: "prod_23", qty: 1 }, // VINO CALLIA MALBEC
            { prodId: "prod_62", qty: 1 }, // PAN DULCE BONAFIDE CON FRUTAS
            { prodId: "prod_78", qty: 1 }, // BUDIN BONAFIDE VAINILLA
            { prodId: "prod_99", qty: 2 }  // TURRON DE MANI GEORGALOS
        ]
    }
];

const INITIAL_ORDERS = [
    {
        id: "ord_1",
        leadId: "lead_1",
        clientName: "Empresa Transportes Andes",
        cuit: "30-58392019-9",
        date: "2026-11-18",
        numberOfBoxes: 50,
        internalShippingCost: 15000, // Gasto interno de la empresa (no suma al precio del cliente)
        boxRecipe: [
            { type: "combo", id: "combo_clasico", name: "Caja Navideña Clásica", qty: 1, price: 18500, cost: 12500 }
        ],
        total: 925000, // (1 * 18500 * 50) = 925000. El shipping NO forma parte de la venta
        costEst: 625000, // (1 * 12500 * 50)
        margin: 300000, // (925000 - 625000) = 300000
        status: "Presupuesto Enviado",
        validUntil: "2026-11-28",
        deliveryDate: "2026-12-10",
        deliveryAddress: "Av. Vélez Sarsfield 2500",
        deliveryLocation: "Córdoba Capital",
        assignedDriver: "",
        invoiceStatus: "No Facturado",
        paymentStatus: "Impago",
        payments: [],
        assemblyStatus: "Pendiente",
        assemblyPhoto: "",
        signedRemitoPhoto: "",
        scheduledInvoices: [
            { id: "task_1_1", desc: "Factura inicial (100% de la venta)", date: "2026-11-18", percent: 100, amount: 925000, status: "Pendiente", ref: "" }
        ],
        armado: { cajasArmadas: 0, fotoArmado: null, sesiones: [] },
        entidadesFacturacion: [
            { id: "ef_1_1", razonSocial: "Empresa Transportes Andes", cuit: "30-58392019-9", cantidadCajas: 50, monto: 925000, pagos: [], facturas: [{ id: "task_1_1", desc: "Factura inicial (100% de la venta)", date: "2026-11-18", percent: 100, amount: 925000, status: "Pendiente", ref: "" }] }
        ],
        entregas: [
            { id: "ent_1_1", cantidadCajas: 50, direccion: "Av. Vélez Sarsfield 2500", localidad: "Córdoba Capital", provincia: "Córdoba", fechaEntrega: "2026-12-10", chofer: "", costoEnvio: 15000, status: "Pendiente", remito: "", fotoEntrega: "" }
        ],
        history: [
            { date: "2026-11-18T11:00:00Z", user: "Vendedor1", action: "Creación del presupuesto comercial (Sin IVA)" },
            { date: "2026-11-18T11:05:00Z", user: "Vendedor1", action: "Presupuesto enviado a cliente" }
        ]
    },
    {
        id: "ord_2",
        leadId: "",
        clientName: "Supermercados El Dino",
        cuit: "30-99281722-5",
        date: "2026-11-10",
        numberOfBoxes: 100,
        internalShippingCost: 45000,
        boxRecipe: [
            { type: "combo", id: "combo_premium", name: "Caja Navideña Premium 1888", qty: 1, price: 35000, cost: 24000 },
            { type: "product", id: "prod_47", qty: 1, name: "FERNET BRANCA X750 CC", price: 9290, cost: 6500 },
            { type: "product", id: "prod_50", qty: 2, name: "COCA COLA X2250 CC", price: 2140, cost: 1500 }
        ],
        // Costo caja unitario = 24000 + 6500 + (1500*2) = 33500
        // Venta caja unitario = 35000 + 9290 + (2140*2) = 48570
        // Total venta = 48570 * 100 = 4857000
        // Total costo = 33500 * 100 = 3350000
        // Margen = 1507000
        total: 4857000,
        costEst: 3350000,
        margin: 1507000,
        status: "Confirmado",
        validUntil: "2026-11-20",
        deliveryDate: "2026-12-05",
        deliveryAddress: "Ruta 9, Km 550",
        deliveryLocation: "Villa María",
        assignedDriver: "Transporte Express",
        invoiceStatus: "Facturado Parcial (50%)",
        paymentStatus: "Señado",
        payments: [
            { id: "pay_1", amount: 2428500, date: "2026-11-12", method: "Transferencia", notes: "Seña de confirmación (50% neto)" }
        ],
        assemblyStatus: "En Proceso",
        assemblyPhoto: "",
        signedRemitoPhoto: "",
        scheduledInvoices: [
            { id: "task_2_1", desc: "Factura inicial - Seña (50%)", date: "2026-11-10", percent: 50, amount: 2428500, status: "Realizada", ref: "A-0001-0982312" },
            { id: "task_2_2", desc: "Factura final - Saldo (50%)", date: "2026-12-05", percent: 50, amount: 2428500, status: "Pendiente", ref: "" }
        ],
        armado: { cajasArmadas: 0, fotoArmado: null, sesiones: [] },
        entidadesFacturacion: [
            { id: "ef_2_1", razonSocial: "Supermercados El Dino", cuit: "30-99281722-5", cantidadCajas: 100, monto: 4857000, pagos: [{ id: "pay_1", amount: 2428500, date: "2026-11-12", method: "Transferencia", notes: "Seña de confirmación (50% neto)" }], facturas: [{ id: "task_2_1", desc: "Factura inicial - Seña (50%)", date: "2026-11-10", percent: 50, amount: 2428500, status: "Realizada", ref: "A-0001-0982312" }, { id: "task_2_2", desc: "Factura final - Saldo (50%)", date: "2026-12-05", percent: 50, amount: 2428500, status: "Pendiente", ref: "" }] }
        ],
        entregas: [
            { id: "ent_2_1", cantidadCajas: 100, direccion: "Ruta 9, Km 550", localidad: "Villa María", provincia: "Córdoba", fechaEntrega: "2026-12-05", chofer: "Transporte Express", costoEnvio: 45000, status: "Pendiente", remito: "", fotoEntrega: "" }
        ],
        history: [
            { date: "2026-11-10T09:00:00Z", user: "Admin", action: "Creación de presupuesto" },
            { date: "2026-11-12T15:30:00Z", user: "Admin", action: "Seña del 50% registrada. Pedido Confirmado." }
        ]
    }
];

const DEFAULT_GLOBAL_SETTINGS = {
    jornadaNormal: 8.0,
    valorHoraNormal: 2500,
    valorHoraExtra: 3750,
    costoCbaBaires: 1512000,
    capacidadCamion: 3200,
    cajasPorPallet: 115,
    tarifaBaseCaba: 39570,
    tarifaPalletCaba: 52800,
    tarifaBaseAmba30: 50000,
    tarifaPalletAmba30: 64300,
    tarifaBaseAmba60: 56475,
    tarifaPalletAmba60: 70000,
    tarifaBaseCbaCap: 25000,
    notasAlPie: `CAJA PERSONALIZADA

La Caja puede PERSONALIZARSE con la imagen corporativa de la empresa en las 5 caras visibles.
Está bonificada la personalización por el volumen de cajas adquiridas.
Tiene un costo de $ 0 más IVA por caja.
El tiempo de taller e imprenta hasta tener la caja terminada es de 40 días corridos.
La caja es de cartón microcorrugado forrado con cartulina impresa full color con terminación de barniz.

ENTREGA DE LAS CAJAS

Las cajas se entregan palletizadas con esquineros y film stretch.
Costo de envío: Ciudad de Córdoba sin cargo.
Fecha de entrega: La determina el cliente.`
};

class ChristmasERPStore {
    constructor() {
        // Data is loaded asynchronously via store.init()
        // called from app._boot() after auth is verified.
    }

    async init() {
        try {
            const [
                { data: products },
                { data: orders },
                { data: leads },
                { data: purchases },
                { data: expenses },
                { data: employees },
                { data: attendance },
                { data: combos },
                { data: providers },
                { data: config }
            ] = await Promise.all([
                supabaseClient.from('products').select('data'),
                supabaseClient.from('orders').select('data'),
                supabaseClient.from('leads').select('data'),
                supabaseClient.from('purchases').select('data'),
                supabaseClient.from('expenses').select('data'),
                supabaseClient.from('employees').select('data'),
                supabaseClient.from('attendance').select('data'),
                supabaseClient.from('combos').select('data'),
                supabaseClient.from('providers').select('data'),
                supabaseClient.from('app_config').select('key, value')
            ]);

            this.products = (products && products.length > 0)
                ? products.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_CATALOG));

            this.orders = (orders && orders.length > 0)
                ? orders.map(r => r.data)
                : [];

            this.leads = (leads && leads.length > 0)
                ? leads.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_LEADS));

            this.purchases = (purchases && purchases.length > 0)
                ? purchases.map(r => r.data)
                : [];

            this.expenses = (expenses && expenses.length > 0)
                ? expenses.map(r => r.data)
                : [];

            this.employees = (employees && employees.length > 0)
                ? employees.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));

            this.attendance = (attendance && attendance.length > 0)
                ? attendance.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));

            this.combos = (combos && combos.length > 0)
                ? combos.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_COMBOS));

            this.providers = (providers && providers.length > 0)
                ? providers.map(r => r.data)
                : JSON.parse(JSON.stringify(INITIAL_PROVIDERS));

            const configMap = {};
            if (config) config.forEach(r => { configMap[r.key] = r.value; });
            this.settings = configMap.settings || JSON.parse(JSON.stringify(DEFAULT_GLOBAL_SETTINGS));
            this.nextOrderNumber = configMap.nextOrderNumber ?? 1;

            this._applyMigrations();

        } catch (e) {
            console.error('Error cargando datos de Supabase:', e);
            this.resetToDefaults();
        }
    }

    _applyMigrations() {
        (this.attendance || []).forEach(att => {
            if (!att.paymentStatus) att.paymentStatus = 'Pendiente';
        });

        (this.leads || []).forEach(lead => {
            if (typeof lead.notes === 'string') {
                const txt = lead.notes.trim();
                lead.notes = txt ? [{ date: lead.date || new Date().toISOString(), user: 'Sistema', text: txt }] : [];
            } else if (!Array.isArray(lead.notes)) {
                lead.notes = [];
            }
        });

        (this.orders || []).forEach((order, idx) => {
            if (!order.displayId) {
                const year = order.date ? order.date.substring(0, 4) : String(new Date().getFullYear());
                order.displayId = `P-${year}-${String(idx + 1).padStart(3, '0')}`;
            }
            if (order.status === 'Terminado / Listo') order.status = 'Listo para Despacho';
            if (!order.armado) order.armado = { cajasArmadas: 0, fotoArmado: null, sesiones: [] };
            if (!order.entidadesFacturacion || order.entidadesFacturacion.length === 0) {
                order.entidadesFacturacion = [{
                    id: `ef_${order.id}_1`,
                    razonSocial: order.clientName || '',
                    cuit: order.cuit || '',
                    cantidadCajas: order.numberOfBoxes || 0,
                    monto: order.total || 0,
                    pagos: order.payments ? JSON.parse(JSON.stringify(order.payments)) : [],
                    facturas: order.scheduledInvoices ? JSON.parse(JSON.stringify(order.scheduledInvoices)) : []
                }];
            }
            if (!order.entregas || order.entregas.length === 0) {
                order.entregas = [{
                    id: `ent_${order.id}_1`,
                    cantidadCajas: order.numberOfBoxes || 0,
                    direccion: order.deliveryAddress || '',
                    localidad: order.deliveryLocation || '',
                    provincia: '',
                    fechaEntrega: order.deliveryDate || '',
                    chofer: order.assignedDriver || '',
                    costoEnvio: order.shippingRealCost || order.internalShippingCost || 0,
                    status: ChristmasERPStore._legacyDeliveryStatus(order.status),
                    remito: order.signedRemitoPhoto || '',
                    fotoEntrega: ''
                }];
            }
            if (order.shippingRealCost === undefined) order.shippingRealCost = order.internalShippingCost || 0;
            if (order.shippingCharged === undefined) order.shippingCharged = order.internalShippingCost || 0;
            if (order.shippingBonificado === undefined) order.shippingBonificado = 0;
            if (order.shippingZone === undefined) order.shippingZone = order.deliveryLocation ? 'Manual' : '';
            if (order.shippingCalcMode === undefined) order.shippingCalcMode = 'manual';
        });

        const normalGlobal = (this.settings || {}).valorHoraNormal || 2500;
        const extraGlobal = (this.settings || {}).valorHoraExtra || 3750;
        (this.employees || []).forEach(emp => {
            if (emp.isCustomRate === undefined) {
                emp.isCustomRate = (emp.hourlyRate !== normalGlobal || emp.extraHourlyRate !== extraGlobal);
            }
            if (!emp.status) emp.status = 'Activo';
        });

        if (!this.nextOrderNumber || this.nextOrderNumber < 1) {
            this.nextOrderNumber = (this.orders || []).length + 1;
        }

        const CONFIRMED_STATUSES = ['Confirmado', 'En Producción', 'Armado Parcial',
            'Listo para Despacho', 'Entrega Parcial', 'Entregado', 'Cerrado'];
        (this.orders || []).forEach(o => {
            if (o.stockDescontado === undefined && CONFIRMED_STATUSES.includes(o.status)) {
                o.stockDescontado = true;
            }
        });
    }

    loadData() {
        const stored = localStorage.getItem("christmas_erp_data_v2");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.products = data.products || INITIAL_CATALOG;
                this.leads = data.leads || INITIAL_LEADS;
                this.employees = data.employees || INITIAL_EMPLOYEES;
                this.attendance = data.attendance || INITIAL_ATTENDANCE;
                this.combos = data.combos || INITIAL_COMBOS;
                this.orders = data.orders || INITIAL_ORDERS;
                this.settings = data.settings || DEFAULT_GLOBAL_SETTINGS;
                this.purchases = data.purchases || [];
                this.expenses = data.expenses || [];
                this.providers = data.providers || JSON.parse(jsonCopy(INITIAL_PROVIDERS));
                this.nextOrderNumber = data.nextOrderNumber || 1;
                
                // Migración: Asegurar que todos los registros de asistencia tengan paymentStatus
                this.attendance.forEach(att => {
                    if (!att.paymentStatus) {
                        att.paymentStatus = "Pendiente";
                    }
                });

                // Migración: Convertir notas de leads de string a array de historial
                this.leads.forEach(lead => {
                    if (typeof lead.notes === "string") {
                        const txt = lead.notes.trim();
                        lead.notes = txt ? [{ date: lead.date || new Date().toISOString(), user: "Sistema", text: txt }] : [];
                    } else if (!Array.isArray(lead.notes)) {
                        lead.notes = [];
                    }
                });

                // Migración: Asignar displayId a órdenes existentes que no lo tengan
                this.orders.forEach((order, idx) => {
                    if (!order.displayId) {
                        const year = order.date ? order.date.substring(0, 4) : "2026";
                        order.displayId = `P-${year}-${String(idx + 1).padStart(3, '0')}`;
                    }
                });
                // Sincronizar nextOrderNumber con la cantidad actual de órdenes
                if (!data.nextOrderNumber) {
                    this.nextOrderNumber = this.orders.length + 1;
                }

                // Migración: Renombrar estado "Terminado / Listo" → "Listo para Despacho"
                this.orders.forEach(order => {
                    if (order.status === "Terminado / Listo") {
                        order.status = "Listo para Despacho";
                    }
                });

                // Migración: Inicializar status e isCustomRate de empleados cargados de storage
                const normalGlobal = this.settings.valorHoraNormal || 2500;
                const extraGlobal = this.settings.valorHoraExtra || 3750;
                this.employees.forEach(emp => {
                    if (emp.isCustomRate === undefined) {
                        emp.isCustomRate = (emp.hourlyRate !== normalGlobal || emp.extraHourlyRate !== extraGlobal);
                    }
                    if (!emp.status) {
                        emp.status = "Activo";
                    }
                });

                // Migración: Inicializar armado, entidadesFacturacion y entregas en órdenes existentes
                this.orders.forEach(order => {
                    if (!order.armado) {
                        order.armado = { cajasArmadas: 0, fotoArmado: null, sesiones: [] };
                    }
                    if (!order.entidadesFacturacion || order.entidadesFacturacion.length === 0) {
                        order.entidadesFacturacion = [{
                            id: `ef_${order.id}_1`,
                            razonSocial: order.clientName || "",
                            cuit: order.cuit || "",
                            cantidadCajas: order.numberOfBoxes || 0,
                            monto: order.total || 0,
                            pagos: order.payments ? JSON.parse(JSON.stringify(order.payments)) : [],
                            facturas: order.scheduledInvoices ? JSON.parse(JSON.stringify(order.scheduledInvoices)) : []
                        }];
                    }
                    if (!order.entregas || order.entregas.length === 0) {
                        const entStatus = ChristmasERPStore._legacyDeliveryStatus(order.status);
                        order.entregas = [{
                            id: `ent_${order.id}_1`,
                            cantidadCajas: order.numberOfBoxes || 0,
                            direccion: order.deliveryAddress || "",
                            localidad: order.deliveryLocation || "",
                            provincia: "",
                            fechaEntrega: order.deliveryDate || "",
                            chofer: order.assignedDriver || "",
                            costoEnvio: order.shippingRealCost || order.internalShippingCost || 0,
                            status: entStatus,
                            remito: order.signedRemitoPhoto || "",
                            fotoEntrega: ""
                        }];
                    }
                });

                // Migración: Inicializar propiedades logísticas en las órdenes y opciones
                this.orders.forEach(order => {
                    if (order.shippingRealCost === undefined) {
                        order.shippingRealCost = order.internalShippingCost || 0;
                    }
                    if (order.shippingCharged === undefined) {
                        order.shippingCharged = order.internalShippingCost || 0;
                    }
                    if (order.shippingBonificado === undefined) {
                        order.shippingBonificado = 0;
                    }
                    if (order.shippingZone === undefined) {
                        order.shippingZone = order.deliveryLocation ? "Manual" : "";
                    }
                    if (order.shippingCalcMode === undefined) {
                        order.shippingCalcMode = "manual";
                    }

                    if (order.options) {
                        order.options.forEach(opt => {
                            if (opt.shippingRealCost === undefined) {
                                opt.shippingRealCost = opt.internalShippingCost || 0;
                            }
                            if (opt.shippingCharged === undefined) {
                                opt.shippingCharged = opt.internalShippingCost || 0;
                            }
                            if (opt.shippingBonificado === undefined) {
                                opt.shippingBonificado = 0;
                            }
                            if (opt.shippingZone === undefined) {
                                opt.shippingZone = order.deliveryLocation ? "Manual" : "";
                            }
                            if (opt.shippingCalcMode === undefined) {
                                opt.shippingCalcMode = "manual";
                            }
                        });
                    }
                });
                // Migración: Corregir nombres de productos con valores numéricos inválidos
                this.products.forEach(p => {
                    if (p.id === "prod_216" && (p.name === "0.1" || p.category === "DESCUENTO FINANCIERO:")) {
                        p.name = "Descuento Financiero 10%";
                        p.category = "DESCUENTOS";
                    }
                    if (p.id === "prod_217" && (p.name === "0.05" || p.category === "DESCUENTO FINANCIERO:")) {
                        p.name = "Descuento Financiero 5%";
                        p.category = "DESCUENTOS";
                    }
                });
                // Migración: marcar órdenes ya confirmadas pre-existentes como stockDescontado = true
                // sin descontar stock físico (el stock era gestionado virtualmente antes de este cambio).
                // Esto evita double-deducción si el usuario re-confirma esas órdenes.
                const CONFIRMED_STATUSES = ["Confirmado", "En Producción", "Armado Parcial",
                    "Listo para Despacho", "Entrega Parcial", "Entregado", "Cerrado"];
                this.orders.forEach(o => {
                    if (o.stockDescontado === undefined && CONFIRMED_STATUSES.includes(o.status)) {
                        o.stockDescontado = true; // marcar como ya procesado, sin mover stock
                    }
                });

            } catch (e) {
                console.error("Error al cargar localStorage, usando datos por defecto", e);
                this.resetToDefaults();
            }
        } else {
            this.resetToDefaults();
        }
    }

    expandRecipe(recipe, numberOfBoxes = 1) {
        const productMap = {}; // Maps productId -> quantity
        if (!recipe || !Array.isArray(recipe)) return productMap;

        recipe.forEach(item => {
            const qtyPerBox = item.qty || 0;
            if (item.type === "combo") {
                const combo = this.combos.find(c => c.id === item.id);
                if (combo && combo.items) {
                    combo.items.forEach(comboItem => {
                        const prodId = comboItem.prodId;
                        const comboQty = comboItem.qty || 0;
                        const totalQty = qtyPerBox * comboQty * numberOfBoxes;
                        if (totalQty > 0) {
                            productMap[prodId] = (productMap[prodId] || 0) + totalQty;
                        }
                    });
                }
            } else {
                // type === "product" or anything else
                const prodId = item.id;
                const totalQty = qtyPerBox * numberOfBoxes;
                if (totalQty > 0) {
                    productMap[prodId] = (productMap[prodId] || 0) + totalQty;
                }
            }
        });
        return productMap;
    }

    // Genera el próximo displayId legible para un pedido
    generateOrderDisplayId(dateStr) {
        const year = dateStr ? dateStr.substring(0, 4) : new Date().getFullYear();
        // Guard: asegurar que nextOrderNumber no genere un displayId ya existente
        const existingNums = new Set(
            this.orders
                .map(o => o.displayId)
                .filter(d => d && d.startsWith(`P-${year}-`))
                .map(d => parseInt(d.split("-")[2], 10))
                .filter(n => !isNaN(n))
        );
        while (existingNums.has(this.nextOrderNumber)) {
            this.nextOrderNumber++;
        }
        const num = String(this.nextOrderNumber).padStart(3, '0');
        this.nextOrderNumber++;
        return `P-${year}-${num}`;
    }

    // Mapea un status legacy al status de la entrega única migrada
    static _legacyDeliveryStatus(orderStatus) {
        if (orderStatus === "Despachado") return "Despachada";
        if (orderStatus === "Entregado") return "Entregada";
        if (orderStatus === "Listo para Despacho") return "Lista";
        return "Pendiente";
    }

    // Calcula el status operativo visible del pedido a partir de sus datos.
    // Los estados comerciales (Presupuesto Enviado, Cancelado, Cerrado) se retornan tal cual.
    // A partir de Confirmado, el estado se deriva del armado y las entregas.
    deriveOrderStatus(order) {
        const s = order.status;
        if (s === "Presupuesto Enviado" || s === "Cancelado") return s;
        // "Cerrado" manual: respetar excepto si tiene entregas operativas pendientes
        if (s === "Cerrado") {
            const entregasCerrado = order.entregas || [];
            const hayPendientes = entregasCerrado.some(e => e.status !== "Entregada");
            if (entregasCerrado.length > 0 && hayPendientes) return "Entrega Parcial";
            return s;
        }

        const entregas = order.entregas || [];
        const cajasArmadas = (order.armado || {}).cajasArmadas || 0;
        const total = order.numberOfBoxes || 0;

        if (entregas.length > 0) {
            const todasEntregadas = entregas.every(e => e.status === "Entregada");
            const algunaDespachada = entregas.some(e => e.status === "Despachada" || e.status === "Entregada");

            if (todasEntregadas) return "Entregado";
            if (algunaDespachada) return "Entrega Parcial";
        }

        if (total > 0 && cajasArmadas >= total) return "Listo para Despacho";
        if (cajasArmadas > 0) return "Armado Parcial";

        // Fallback: respetar el status almacenado para órdenes legacy sin entregas
        return s;
    }

    saveData() {
        this._persistToSupabase().catch(e => {
            console.error('Error al guardar en Supabase:', e);
        });
    }

    async _persistToSupabase() {
        const toRows = (arr) => (arr || []).map(item => ({ id: item.id, data: item }));

        await Promise.all([
            supabaseClient.from('products').upsert(toRows(this.products)),
            supabaseClient.from('orders').upsert(toRows(this.orders)),
            supabaseClient.from('leads').upsert(toRows(this.leads)),
            supabaseClient.from('purchases').upsert(toRows(this.purchases)),
            supabaseClient.from('expenses').upsert(toRows(this.expenses)),
            supabaseClient.from('employees').upsert(toRows(this.employees)),
            supabaseClient.from('attendance').upsert(toRows(this.attendance)),
            supabaseClient.from('combos').upsert(toRows(this.combos)),
            supabaseClient.from('providers').upsert(toRows(this.providers)),
            supabaseClient.from('app_config').upsert([
                { key: 'settings', value: this.settings },
                { key: 'nextOrderNumber', value: this.nextOrderNumber }
            ])
        ]);
    }

    resetToDefaults() {
        this.products = JSON.parse(jsonCopy(INITIAL_CATALOG));
        this.leads = JSON.parse(jsonCopy(INITIAL_LEADS));
        // Migrar notas de leads demo al formato historial
        this.leads.forEach(lead => {
            if (typeof lead.notes === "string") {
                const txt = lead.notes.trim();
                lead.notes = txt ? [{ date: lead.date || new Date().toISOString(), user: "Sistema", text: txt }] : [];
            }
        });
        this.employees = JSON.parse(jsonCopy(INITIAL_EMPLOYEES));
        this.attendance = JSON.parse(jsonCopy(INITIAL_ATTENDANCE));
        this.combos = JSON.parse(jsonCopy(INITIAL_COMBOS));
        this.orders = JSON.parse(jsonCopy(INITIAL_ORDERS));
        // Asignar displayId, renombrar estados y migrar nuevos campos en las órdenes demo
        this.orders.forEach((order, idx) => {
            if (!order.displayId) {
                const year = order.date ? order.date.substring(0, 4) : "2026";
                order.displayId = `P-${year}-${String(idx + 1).padStart(3, '0')}`;
            }
            if (order.status === "Terminado / Listo") order.status = "Listo para Despacho";
            if (!order.armado) {
                order.armado = { cajasArmadas: 0, fotoArmado: null, sesiones: [] };
            }
            if (!order.entidadesFacturacion || order.entidadesFacturacion.length === 0) {
                order.entidadesFacturacion = [{
                    id: `ef_${order.id}_1`,
                    razonSocial: order.clientName || "",
                    cuit: order.cuit || "",
                    cantidadCajas: order.numberOfBoxes || 0,
                    monto: order.total || 0,
                    pagos: order.payments ? JSON.parse(JSON.stringify(order.payments)) : [],
                    facturas: order.scheduledInvoices ? JSON.parse(JSON.stringify(order.scheduledInvoices)) : []
                }];
            }
            if (!order.entregas || order.entregas.length === 0) {
                order.entregas = [{
                    id: `ent_${order.id}_1`,
                    cantidadCajas: order.numberOfBoxes || 0,
                    direccion: order.deliveryAddress || "",
                    localidad: order.deliveryLocation || "",
                    provincia: "",
                    fechaEntrega: order.deliveryDate || "",
                    chofer: order.assignedDriver || "",
                    costoEnvio: order.shippingRealCost || order.internalShippingCost || 0,
                    status: ChristmasERPStore._legacyDeliveryStatus(order.status),
                    remito: order.signedRemitoPhoto || "",
                    fotoEntrega: ""
                }];
            }
        });
        this.settings = JSON.parse(jsonCopy(DEFAULT_GLOBAL_SETTINGS));
        this.purchases = [];
        this.expenses = [];
        this.providers = JSON.parse(jsonCopy(INITIAL_PROVIDERS));
        this.nextOrderNumber = this.orders.length + 1;
        this.saveData();
    }
}

function jsonCopy(obj) {
    return JSON.stringify(obj);
}

window.store = new ChristmasERPStore();
