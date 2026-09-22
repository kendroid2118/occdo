# OCCDO — Reference Data (seed)

Lists below are **seed values**, not application constants. Staff change them under Settings → Reference Data (maintenance). Deactivate referenced rows; do not hard-delete.

Source of truth for codes at runtime: PostgreSQL.

## 1. Cooperative sectors (dashboard)

Confirmed initial set:

| code | name | sortOrder |
| --- | --- | --- |
| MP | Multi-Purpose | 1 |
| AG | Agriculture | 2 |
| TR | Transport | 3 |
| CR | Credit | 4 |
| OT | Others | 5 |

## 2. Cooperative types

No frozen official type list yet. Keep the `CooperativeType` table and maintain it in Settings. Seed may start empty or mirror the five sectors until OCCDO provides CDA types. Do not hardcode either way.

## 3. Assistance types and document types

No frozen lists (OCCDO: add via maintenance). Seed empty catalogs or a single “Others” row if the UI needs a default. SUPER_ADMIN maintains them.

## 4. Ormoc City barangays (85)

Working seed after **Ordinance No. 052, Series of 2021**, ratified **8 October 2022** (Comelec plebiscite): 28 poblacion districts merged into Barangays East, West, and South; District 29 renamed Barangay North. Count reduced from 110 to **85**.

Store `code` as a stable slug (e.g. `EAST`, `SOUTH`, `CAN-ADIENG`). Optional `psgcCode` may be added later; merged poblacion codes are not 1:1 with old District 1–29 PSGC rows.

Names should be correctable in maintenance (spelling variants exist across LGU/PSA sources).

1. Airport
2. Alegria
3. Alta Vista
4. Bagongbong
5. Bagong Buhay
6. Bantigue
7. Batuan
8. Bayog
9. Biliboy
10. Cabaon-an
11. Cabintan
12. Cabulihan
13. Cagbuhangin
14. Camp Downes
15. Can-adieng
16. Can-untog
17. Catmon
18. Cogon Combado
19. Concepcion
20. Curva
21. Danhug (Lili-on)
22. Dayhagan
23. Dolores
24. Domonar
25. Don Carlos B. Rivilla Sr. (Boroc)
26. Don Felipe Larrazabal
27. Don Potenciano Larrazabal
28. Doña Feliza Z. Mejia
29. Donghol
30. East (Poblacion)
31. Esperanza
32. Gaas
33. Green Valley
34. Guintigui-an
35. Hibunawon
36. Hugpa
37. Ipil
38. Juaton
39. Kadaohan
40. Labrador (Balion)
41. Lake Danao
42. Lao
43. Leondoni
44. Libertad
45. Liberty
46. Licuma
47. Liloan
48. Linao
49. Luna
50. Mabato
51. Mabini
52. Macabug
53. Magaswi
54. Mahayag
55. Mahayahay
56. Manlilinao
57. Margen
58. Mas-in
59. Matica-a
60. Milagro
61. Monterico
62. Nasunogan
63. Naungan
64. North (Poblacion)
65. Nueva Sociedad
66. Nueva Vista
67. Patag
68. Punta
69. Quezon, Jr.
70. Rufina M. Tan (Rawis)
71. Sabang Bao
72. Salvacion
73. San Antonio
74. San Isidro
75. San Jose
76. San Juan
77. San Pablo (Simangan)
78. San Vicente
79. Santo Niño
80. South (Poblacion)
81. Sumangga
82. Tambulilid
83. Tongonan
84. Valencia
85. West (Poblacion)
