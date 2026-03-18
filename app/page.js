"use client";

import { useEffect, useMemo, useState } from "react";

const INITIAL_DATA = [{"id":2,"category":"Vaillant","model":"ecoTEC Intro 24/24","alisFiyat":48680.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0922,"yuvarlama":500,"kartKomisyonu":0.18},{"id":3,"category":"Vaillant","model":"ecotec Intro 28/28","alisFiyat":51930.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0912,"yuvarlama":500,"kartKomisyonu":0.1813},{"id":4,"category":"Vaillant","model":"ecoTEC Pure 236/7-2","alisFiyat":55680.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0989,"yuvarlama":100,"kartKomisyonu":0.181},{"id":5,"category":"Vaillant","model":"ecoTEC Pure 286/7-2","alisFiyat":59210.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0922,"yuvarlama":500,"kartKomisyonu":0.1805},{"id":6,"category":"Vaillant","model":"ecoTEC Pro 236/5-3","alisFiyat":64230.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0925,"yuvarlama":500,"kartKomisyonu":0.1806},{"id":7,"category":"Vaillant","model":"ecoTEC Pro 286/5-3","alisFiyat":67690.0,"puanTl":400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0958,"yuvarlama":100,"kartKomisyonu":0.1803},{"id":8,"category":"Vaillant","model":"ecoTEC Plus 26 CS/1-5","alisFiyat":80090.0,"puanTl":2400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0906,"yuvarlama":500,"kartKomisyonu":0.1805},{"id":9,"category":"Vaillant","model":"ecoTEC Plus 32 CS/1-5","alisFiyat":88120.0,"puanTl":2400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0935,"yuvarlama":500,"kartKomisyonu":0.1802},{"id":10,"category":"Vaillant","model":"ecoTEC Plus 36 CS/1-5","alisFiyat":100100.0,"puanTl":2400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0924,"yuvarlama":100,"kartKomisyonu":0.1808},{"id":11,"category":"Vaillant","model":"ecoTEC Plus 40 CS/1-5","alisFiyat":112050.0,"puanTl":2400.0,"faydaTl":10000.0,"montajTl":7500.0,"satisCarpani":1.0901,"yuvarlama":500,"kartKomisyonu":0.1807},{"id":14,"category":"Baymak","model":"Ademix 24/24","alisFiyat":34208.99,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0983,"yuvarlama":100,"kartKomisyonu":0.1821},{"id":15,"category":"Baymak","model":"Ademix 28/28","alisFiyat":35505.88,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.1004,"yuvarlama":500,"kartKomisyonu":0.1802},{"id":16,"category":"Baymak","model":"Nitromix 24","alisFiyat":41041.67,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0982,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":17,"category":"Baymak","model":"Nitromix 28","alisFiyat":44164.1,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0998,"yuvarlama":500,"kartKomisyonu":0.18},{"id":18,"category":"Baymak","model":"Nitromix 35","alisFiyat":50642.73,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0974,"yuvarlama":500,"kartKomisyonu":0.1807},{"id":19,"category":"Baymak","model":"Nitromix Ioni 24","alisFiyat":45525.98,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0998,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":20,"category":"Baymak","model":"Nitromix Ioni 28","alisFiyat":49098.49,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0913,"yuvarlama":100,"kartKomisyonu":0.18},{"id":21,"category":"Baymak","model":"Nitromix Ioni 35","alisFiyat":55656.66,"puanTl":0.0,"faydaTl":6200.0,"montajTl":7500.0,"satisCarpani":1.0973,"yuvarlama":100,"kartKomisyonu":0.1808},{"id":24,"category":"Warmhaus","model":"Puma Condens 18/24","alisFiyat":28750.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1034,"yuvarlama":100,"kartKomisyonu":0.18},{"id":25,"category":"Warmhaus","model":"Puma Condens 28/28","alisFiyat":30100.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0904,"yuvarlama":100,"kartKomisyonu":0.1805},{"id":26,"category":"Warmhaus","model":"Lynx Condens 24","alisFiyat":31340.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0942,"yuvarlama":100,"kartKomisyonu":0.1812},{"id":27,"category":"Warmhaus","model":"Lynx Condens 28","alisFiyat":32900.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1015,"yuvarlama":500,"kartKomisyonu":0.182},{"id":30,"category":"Baxi","model":"Lambert 24 F","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":31,"category":"Baxi","model":"Lambert 30 F","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":32,"category":"Baxi","model":"Lambert 33 FI","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":33,"category":"Baxi","model":"Lambert 42 FI","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":34,"category":"Baxi","model":"Lambert 45 FI","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":35,"category":"Baxi","model":"Lunatec 24 F","alisFiyat":38150.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1239,"yuvarlama":500,"kartKomisyonu":0.1818},{"id":36,"category":"Baxi","model":"Lunatec 30 F","alisFiyat":40700.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1271,"yuvarlama":500,"kartKomisyonu":0.1809},{"id":37,"category":"Baxi","model":"Lunatec 35 F","alisFiyat":41200.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1256,"yuvarlama":500,"kartKomisyonu":0.1811},{"id":38,"category":"Baxi","model":"Duotec 24 F","alisFiyat":37150.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1271,"yuvarlama":100,"kartKomisyonu":0.1814},{"id":39,"category":"Baxi","model":"Duotec 30 F","alisFiyat":39600.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1207,"yuvarlama":500,"kartKomisyonu":0.1802},{"id":40,"category":"Baxi","model":"Duotec 33","alisFiyat":42200.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1227,"yuvarlama":500,"kartKomisyonu":0.1814},{"id":41,"category":"Baxi","model":"Duotec 42","alisFiyat":46750.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1204,"yuvarlama":100,"kartKomisyonu":0.1813},{"id":42,"category":"Baxi","model":"Duotec 45","alisFiyat":46900.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1273,"yuvarlama":100,"kartKomisyonu":0.1815},{"id":43,"category":"Baxi","model":"Duotec 42 DWH","alisFiyat":47250.0,"puanTl":0.0,"faydaTl":6500.0,"montajTl":7500.0,"satisCarpani":1.1295,"yuvarlama":100,"kartKomisyonu":0.1817},{"id":46,"category":"E.C.A.","model":"Citius Premix 20","alisFiyat":36100.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1009,"yuvarlama":100,"kartKomisyonu":0.1812},{"id":47,"category":"E.C.A.","model":"Citius Premix 24","alisFiyat":37400.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0913,"yuvarlama":100,"kartKomisyonu":0.1816},{"id":48,"category":"E.C.A.","model":"Citius Premix 28","alisFiyat":40340.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0974,"yuvarlama":100,"kartKomisyonu":0.181},{"id":49,"category":"E.C.A.","model":"Proteus Premix 24","alisFiyat":44580.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0945,"yuvarlama":500,"kartKomisyonu":0.1807},{"id":50,"category":"E.C.A.","model":"Proteus Premix 28","alisFiyat":47850.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.093,"yuvarlama":100,"kartKomisyonu":0.1802},{"id":51,"category":"E.C.A.","model":"Proteus Premix 30","alisFiyat":49480.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0969,"yuvarlama":500,"kartKomisyonu":0.1808},{"id":52,"category":"E.C.A.","model":"Proteus Premix 35","alisFiyat":51470.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0938,"yuvarlama":500,"kartKomisyonu":0.1814},{"id":53,"category":"E.C.A.","model":"Proteus Premix 42","alisFiyat":53630.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.096,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":54,"category":"E.C.A.","model":"Proteus Premix 45","alisFiyat":54780.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0918,"yuvarlama":100,"kartKomisyonu":0.1809},{"id":55,"category":"E.C.A.","model":"Proteus Premix 35 HST","alisFiyat":52970.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0915,"yuvarlama":500,"kartKomisyonu":0.1803},{"id":56,"category":"E.C.A.","model":"Proteus Premix 45 HST","alisFiyat":56280.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0975,"yuvarlama":100,"kartKomisyonu":0.18},{"id":57,"category":"E.C.A.","model":"Cofeo Premix 24","alisFiyat":49280.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0919,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":58,"category":"E.C.A.","model":"Cofeo Premix 30","alisFiyat":54230.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0935,"yuvarlama":500,"kartKomisyonu":0.1807},{"id":59,"category":"E.C.A.","model":"Cofeo Premix 35","alisFiyat":56720.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.09,"yuvarlama":100,"kartKomisyonu":0.18},{"id":62,"category":"E.C.A.","model":"Baykan Güneş","alisFiyat":23750.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.12,"yuvarlama":100,"kartKomisyonu":0.18},{"id":69,"category":"Şofben","model":"Daxom UDAX.12","alisFiyat":19000.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0943,"yuvarlama":100,"kartKomisyonu":0.1828},{"id":70,"category":"Şofben","model":"Daxom UDAX.14","alisFiyat":21500.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1034,"yuvarlama":100,"kartKomisyonu":0.1812},{"id":71,"category":"Şofben","model":"ECA Phoenix PH 11","alisFiyat":22850.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1038,"yuvarlama":500,"kartKomisyonu":0.1821},{"id":72,"category":"Şofben","model":"Baymak BH 12 LN","alisFiyat":22050.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0998,"yuvarlama":100,"kartKomisyonu":0.1815},{"id":73,"category":"Şofben","model":"Baymak BH 14 LN","alisFiyat":24260.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.102,"yuvarlama":100,"kartKomisyonu":0.18},{"id":74,"category":"Şofben","model":"Demirdöküm F.11","alisFiyat":23650.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0915,"yuvarlama":500,"kartKomisyonu":0.1824},{"id":75,"category":"Şofben","model":"Demirdöküm F.14","alisFiyat":25200.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1009,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":76,"category":"Şofben","model":"Vaillant MAG 12","alisFiyat":24475.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0946,"yuvarlama":100,"kartKomisyonu":0.18},{"id":77,"category":"Şofben","model":"Vaillant MAG 14","alisFiyat":25950.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0912,"yuvarlama":500,"kartKomisyonu":0.1808},{"id":80,"category":"Elektrikli Kombi","model":"Daxom 10 EDM","alisFiyat":26700.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0965,"yuvarlama":500,"kartKomisyonu":0.1813},{"id":81,"category":"Elektrikli Kombi","model":"Daxom 12 EDM","alisFiyat":27300.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.092,"yuvarlama":500,"kartKomisyonu":0.1816},{"id":82,"category":"Elektrikli Kombi","model":"Daxom 16 EDM","alisFiyat":29700.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.1022,"yuvarlama":500,"kartKomisyonu":0.1805},{"id":83,"category":"Elektrikli Kombi","model":"Daxom 18 EDM","alisFiyat":31000.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0909,"yuvarlama":100,"kartKomisyonu":0.181},{"id":84,"category":"Elektrikli Kombi","model":"ECA Arceus 12 MN TR","alisFiyat":44650.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.093,"yuvarlama":100,"kartKomisyonu":0.1807},{"id":85,"category":"Elektrikli Kombi","model":"ECA Arceus 15 MN TR","alisFiyat":49.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.126,"yuvarlama":500,"kartKomisyonu":0.1882},{"id":86,"category":"Elektrikli Kombi","model":"ECA Arceus 18 MN TR","alisFiyat":49200.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0935,"yuvarlama":500,"kartKomisyonu":0.1806},{"id":87,"category":"Elektrikli Kombi","model":"ECA Arceus 24 MN TR","alisFiyat":53780.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0933,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":88,"category":"Elektrikli Kombi","model":"ECA Arceus 27 MN TR","alisFiyat":57100.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":7500.0,"satisCarpani":1.0913,"yuvarlama":100,"kartKomisyonu":0.1801},{"id":95,"category":"Klima","model":"Elegant Plus 9.000 BTU","alisFiyat":32550.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0753,"yuvarlama":500,"kartKomisyonu":0.18},{"id":96,"category":"Klima","model":"Elegant Plus 12.000 BTU","alisFiyat":35960.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0706,"yuvarlama":100,"kartKomisyonu":0.1818},{"id":97,"category":"Klima","model":"Elegant Plus 18.000 BTU","alisFiyat":51130.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0757,"yuvarlama":500,"kartKomisyonu":0.18},{"id":98,"category":"Klima","model":"Elegant Plus 24.000 BTU","alisFiyat":62370.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0742,"yuvarlama":100,"kartKomisyonu":0.1806},{"id":99,"category":"Klima","model":"VAIB 025 Pro 9000 BTU","alisFiyat":34700.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0807,"yuvarlama":500,"kartKomisyonu":0.1813},{"id":100,"category":"Klima","model":"VAIB 025 Pro 12000 BTU","alisFiyat":36000.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0833,"yuvarlama":100,"kartKomisyonu":0.1821},{"id":101,"category":"Klima","model":"VAIB 025 Pro 18000 BTU","alisFiyat":55000.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0727,"yuvarlama":100,"kartKomisyonu":0.1814},{"id":102,"category":"Klima","model":"VAIB 025 Pro 24000 BTU","alisFiyat":70250.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0747,"yuvarlama":100,"kartKomisyonu":0.1801},{"id":103,"category":"Klima","model":"climaVAIR Pure 9.000 BTU","alisFiyat":31550.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0777,"yuvarlama":500,"kartKomisyonu":0.1824},{"id":104,"category":"Klima","model":"climaVAIR Pure 12.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":105,"category":"Klima","model":"climaVAIR Pure 18.000 BTU","alisFiyat":42300.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0757,"yuvarlama":500,"kartKomisyonu":0.1802},{"id":106,"category":"Klima","model":"climaVAIR Pure 24.000 BTU","alisFiyat":54100.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0721,"yuvarlama":500,"kartKomisyonu":0.181},{"id":107,"category":"Klima","model":"Spaylos Pro 9.000 BTU","alisFiyat":27500.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0727,"yuvarlama":100,"kartKomisyonu":0.1831},{"id":108,"category":"Klima","model":"Spaylos Pro 12.000 BTU","alisFiyat":28350.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0758,"yuvarlama":100,"kartKomisyonu":0.1803},{"id":109,"category":"Klima","model":"Spaylos Pro 15.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":110,"category":"Klima","model":"Spaylos Pro 18.000 BTU","alisFiyat":41350.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0762,"yuvarlama":500,"kartKomisyonu":0.182},{"id":111,"category":"Klima","model":"Spaylos Pro 24.000 BTU","alisFiyat":54000.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0741,"yuvarlama":500,"kartKomisyonu":0.181},{"id":112,"category":"Klima","model":"Ecotech 9.000 BTU","alisFiyat":28250.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0796,"yuvarlama":100,"kartKomisyonu":0.1803},{"id":113,"category":"Klima","model":"Ecotech 12.000 BTU","alisFiyat":29250.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0769,"yuvarlama":100,"kartKomisyonu":0.181},{"id":114,"category":"Klima","model":"Ecotech 18.000 BTU","alisFiyat":42700.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0773,"yuvarlama":500,"kartKomisyonu":0.1804},{"id":115,"category":"Klima","model":"Ecotech 24.000 BTU","alisFiyat":55900.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.0733,"yuvarlama":100,"kartKomisyonu":0.18},{"id":116,"category":"Klima","model":"Niobe 12.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":117,"category":"Klima","model":"Niobe 18.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":118,"category":"Klima","model":"Kion 9.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":119,"category":"Klima","model":"Kion 12.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":120,"category":"Klima","model":"Kion 18.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18},{"id":121,"category":"Klima","model":"Kion 24.000 BTU","alisFiyat":0.0,"puanTl":0.0,"faydaTl":0.0,"montajTl":0.0,"satisCarpani":1.09,"yuvarlama":500,"kartKomisyonu":0.18}];

const currency = (n) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const numberInput = (v) => {
  if (v === "" || v === null || typeof v === "undefined") return 0;
  const normalized = String(v).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ceilTo = (value, step) => {
  const s = Number(step || 100);
  if (s <= 0) return Number(value || 0);
  return Math.ceil(Number(value || 0) / s) * s;
};

function calculate(item) {
  const alisFiyat = numberInput(item.alisFiyat);
  const puanTl = numberInput(item.puanTl);
  const faydaTl = numberInput(item.faydaTl);
  const montajTl = numberInput(item.montajTl);
  const kampanyaMaliyeti = alisFiyat - puanTl - faydaTl;
  const netBedel = kampanyaMaliyeti + montajTl;
  const nakitSatis = ceilTo(netBedel * numberInput(item.satisCarpani || 1), numberInput(item.yuvarlama || 100));
  const kartSatis = ceilTo(nakitSatis * (1 + numberInput(item.kartKomisyonu || 0)), 100);
  const kar = nakitSatis - netBedel;
  return { alisFiyat, kampanyaMaliyeti, netBedel, nakitSatis, kartSatis, kar };
}

function toCsv(rows) {
  const headers = ["Kategori","Model","Alış Fiyat","Puan ₺","Fayda ₺","Montaj ₺","Net Bedel","Kâr","Nakit Satış","Kart Satış"];
  const lines = rows.map((row) => {
    const c = calculate(row);
    return [row.category,row.model,Math.round(c.alisFiyat),row.puanTl,row.faydaTl,row.montajTl,Math.round(c.netBedel),Math.round(c.kar),Math.round(c.nakitSatis),Math.round(c.kartSatis)].join(";");
  });
  return [headers.join(";"), ...lines].join("\n");
}

function Field({ label, children }) {
  return (
    <div className="field">
      <div className="fieldLabel">{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, tone = "slate" }) {
  return (
    <div className={`statCard ${tone}`}>
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="miniCard">
      <div className="miniLabel">{label}</div>
      <div className="miniValue">{value}</div>
    </div>
  );
}

export default function Page() {
  const [rows, setRows] = useState(INITIAL_DATA);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [device, setDevice] = useState("mobil");
  const [openAdvancedId, setOpenAdvancedId] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("catas-fiyat-programi");
    if (saved) {
      try { setRows(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("catas-fiyat-programi", JSON.stringify(rows));
  }, [rows, hydrated]);

  const categories = useMemo(() => ["Tümü", ...Array.from(new Set(rows.map((r) => r.category)))], [rows]);
  const filtered = useMemo(() => rows.filter((row) => {
    const categoryOk = category === "Tümü" || row.category === category;
    const queryOk = `${row.model} ${row.category}`.toLowerCase().includes(query.toLowerCase());
    return categoryOk && queryOk;
  }), [rows, category, query]);

  const updateRow = (id, key, value) => setRows((prev) => prev.map((row) => row.id === id ? { ...row, [key]: numberInput(value) } : row));

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fiyat-listesi-programi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    setRows(INITIAL_DATA);
    window.localStorage.removeItem("catas-fiyat-programi");
  };

  const containerClass = device === "masaustu" ? "shell desktop" : device === "tablet" ? "shell tablet" : "shell mobile";

  return (
    <main className="pageBg">
      <div className={containerClass}>
        <section className="topCard">
          <div className="logoRow">
            <img src="/logo.png" alt="Çataş Mühendislik" className="logoImage" />
          </div>

          <div className="toolbar">
            <div className="deviceTabs">
              <button className={device === "mobil" ? "tab active" : "tab"} onClick={() => setDevice("mobil")} type="button">Mobil</button>
              <button className={device === "tablet" ? "tab active" : "tab"} onClick={() => setDevice("tablet")} type="button">Tablet</button>
              <button className={device === "masaustu" ? "tab active" : "tab"} onClick={() => setDevice("masaustu")} type="button">Masaüstü</button>
            </div>

            <input className="searchInput" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Model veya marka ara..." />

            <select className="selectInput" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <button className="actionBtn primary" onClick={exportCsv} type="button">CSV</button>
            <button className="actionBtn" onClick={resetData} type="button">Sıfırla</button>
          </div>
        </section>

        <div className="cards">
          {filtered.map((row) => {
            const c = calculate(row);
            const isAdvancedOpen = openAdvancedId === row.id;
            return (
              <section key={row.id} className="productCard">
                <div className="cardStripe" />
                <div className="cardBody">
                  <div className="cardHead">
                    <div className="cardTitleWrap">
                      <div className="badgeRow">
                        <span className="badge badgeGreen">{row.category}</span>
                        <span className="badge badgePlain">#{row.id}</span>
                      </div>
                      <h3 className="productTitle">{row.model}</h3>
                    </div>
                    <button className="actionBtn small" type="button" onClick={() => setOpenAdvancedId(isAdvancedOpen ? null : row.id)}>Ayar</button>
                  </div>

                  <div className="statGrid">
                    <Stat label="Nakit" value={currency(c.nakitSatis)} tone="orange" />
                    <Stat label="Kart" value={currency(c.kartSatis)} tone="blue" />
                    <Stat label="Net" value={currency(c.netBedel)} tone="slate" />
                    <Stat label="Kâr" value={currency(c.kar)} tone="green" />
                  </div>

                  <div className="sectionPanel">
                    <div className="sectionHeader">
                      <div className="sectionTitle">Ana Girdi Alanları</div>
                      <div className="sectionHint">Hızlı düzenleme</div>
                    </div>
                    <div className="formGrid">
                      <Field label="Alış Fiyat"><input className="textInput" value={row.alisFiyat} onChange={(e) => updateRow(row.id, "alisFiyat", e.target.value)} inputMode="decimal" /></Field>
                      <Field label="Montaj ₺"><input className="textInput" value={row.montajTl} onChange={(e) => updateRow(row.id, "montajTl", e.target.value)} inputMode="decimal" /></Field>
                      <Field label="Puan ₺"><input className="textInput" value={row.puanTl} onChange={(e) => updateRow(row.id, "puanTl", e.target.value)} inputMode="decimal" /></Field>
                      <Field label="Fayda ₺"><input className="textInput" value={row.faydaTl} onChange={(e) => updateRow(row.id, "faydaTl", e.target.value)} inputMode="decimal" /></Field>
                    </div>
                  </div>

                  {isAdvancedOpen && (
                    <div className="sectionPanel whitePanel">
                      <div className="sectionHeader">
                        <div className="sectionTitle">Gelişmiş Fiyat Ayarları</div>
                        <div className="sectionHint">Satır bazlı kontrol</div>
                      </div>
                      <div className="formGrid">
                        <Field label="Nakit Çarpanı"><input className="textInput" value={row.satisCarpani} onChange={(e) => updateRow(row.id, "satisCarpani", e.target.value)} inputMode="decimal" /></Field>
                        <Field label="Kart Komisyonu"><input className="textInput" value={row.kartKomisyonu} onChange={(e) => updateRow(row.id, "kartKomisyonu", e.target.value)} inputMode="decimal" /></Field>
                        <Field label="Yuvarlama"><input className="textInput" value={row.yuvarlama} onChange={(e) => updateRow(row.id, "yuvarlama", e.target.value)} inputMode="decimal" /></Field>
                      </div>
                    </div>
                  )}

                  <div className="miniGrid">
                    <Mini label="Kampanya" value={currency(c.kampanyaMaliyeti)} />
                    <Mini label="Net Bedel" value={currency(c.netBedel)} />
                    <Mini label="Nakit Çarpanı" value={`${row.satisCarpani}x`} />
                    <Mini label="Kart Komisyonu" value={`%${(Number(row.kartKomisyonu || 0) * 100).toFixed(0)}`} />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
