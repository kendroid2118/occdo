/**
 * Seed rows only. Runtime catalogs come from PostgreSQL, not these arrays.
 */

export type ReferenceSeedRow = {
  code: string;
  name: string;
  sortOrder: number;
};

export const SEED_COOPERATIVE_TYPES: readonly ReferenceSeedRow[] = [
  { code: "GEN", name: "General", sortOrder: 1 },
];

export const SEED_COOPERATIVE_STATUSES: readonly ReferenceSeedRow[] = [
  { code: "ACCREDITED", name: "Accredited", sortOrder: 1 },
  { code: "ONGOING-REG", name: "Ongoing Registration", sortOrder: 2 },
  { code: "REGISTERED", name: "Registered", sortOrder: 3 },
  { code: "FOR-VALIDATION", name: "For Validation", sortOrder: 4 },
  { code: "RENEWAL", name: "Renewal-related", sortOrder: 5 },
];

export const SEED_ACCREDITATION_STATUSES: readonly ReferenceSeedRow[] = [
  { code: "PENDING", name: "Pending", sortOrder: 1 },
  { code: "ACCREDITED", name: "Accredited", sortOrder: 2 },
];

export const SEED_ACCREDITATION_CASE_TYPES: readonly ReferenceSeedRow[] = [
  { code: "REGISTRATION", name: "Registration", sortOrder: 1 },
  { code: "ACCREDITATION", name: "Accreditation", sortOrder: 2 },
  { code: "RENEWAL", name: "Renewal", sortOrder: 3 },
];

export const SEED_ACCREDITATION_CASE_STATUSES: readonly ReferenceSeedRow[] = [
  { code: "FILED", name: "Filed", sortOrder: 1 },
  { code: "UNDER-REVIEW", name: "Under Review", sortOrder: 2 },
  { code: "DECIDED", name: "Decided", sortOrder: 3 },
];

/** Labeled demo fixtures. Runtime catalogs come from PostgreSQL. */
export const SEED_PROGRAMS: readonly ReferenceSeedRow[] = [
  { code: "DEMO-LIVELIHOOD", name: "Demo Livelihood Support", sortOrder: 1 },
  { code: "DEMO-CAPACITY", name: "Demo Capacity Building", sortOrder: 2 },
  { code: "DEMO-CREDIT", name: "Demo Credit Assistance", sortOrder: 3 },
];

/** Labeled demo fixtures. Runtime catalogs come from PostgreSQL. */
export const SEED_SERVICE_TYPES: readonly ReferenceSeedRow[] = [
  { code: "DEMO-TRAINING", name: "Demo Training", sortOrder: 1 },
  { code: "DEMO-TECHNICAL", name: "Demo Technical Assistance", sortOrder: 2 },
  { code: "DEMO-ORIENTATION", name: "Demo Orientation", sortOrder: 3 },
];

/** Labeled demo fixtures. No frozen assistance-type list. */
export const SEED_ASSISTANCE_TYPES: readonly ReferenceSeedRow[] = [
  { code: "DEMO-GRANT", name: "Demo Grant", sortOrder: 1 },
  { code: "DEMO-LIVELIHOOD-FUND", name: "Demo Livelihood Fund", sortOrder: 2 },
  { code: "DEMO-OTHERS-ASSIST", name: "Demo Other Assistance", sortOrder: 3 },
];

export const SEED_ASSISTANCE_STATUSES: readonly ReferenceSeedRow[] = [
  { code: "REQUESTED", name: "Requested", sortOrder: 1 },
  { code: "APPROVED", name: "Approved", sortOrder: 2 },
  { code: "RELEASED", name: "Released", sortOrder: 3 },
];

export const SEED_OFFICER_POSITIONS: readonly ReferenceSeedRow[] = [
  { code: "CHAIR", name: "Chairperson", sortOrder: 1 },
  { code: "VICE-CHAIR", name: "Vice Chairperson", sortOrder: 2 },
  { code: "SECRETARY", name: "Secretary", sortOrder: 3 },
  { code: "TREASURER", name: "Treasurer", sortOrder: 4 },
  { code: "MANAGER", name: "Manager", sortOrder: 5 },
];

export const SEED_COOPERATIVE_SECTORS: readonly ReferenceSeedRow[] = [
  { code: "MP", name: "Multi-Purpose", sortOrder: 1 },
  { code: "AG", name: "Agriculture", sortOrder: 2 },
  { code: "TR", name: "Transport", sortOrder: 3 },
  { code: "CR", name: "Credit", sortOrder: 4 },
  { code: "OT", name: "Others", sortOrder: 5 },
];

/** Official Ormoc barangays after Ordinance 52 s. 2021 (85). */
export const SEED_ORMOC_BARANGAYS: readonly ReferenceSeedRow[] = [
  { code: "AIRPORT", name: "Airport", sortOrder: 1 },
  { code: "ALEGRIA", name: "Alegria", sortOrder: 2 },
  { code: "ALTA-VISTA", name: "Alta Vista", sortOrder: 3 },
  { code: "BAGONGBONG", name: "Bagongbong", sortOrder: 4 },
  { code: "BAGONG-BUHAY", name: "Bagong Buhay", sortOrder: 5 },
  { code: "BANTIGUE", name: "Bantigue", sortOrder: 6 },
  { code: "BATUAN", name: "Batuan", sortOrder: 7 },
  { code: "BAYOG", name: "Bayog", sortOrder: 8 },
  { code: "BILIBOY", name: "Biliboy", sortOrder: 9 },
  { code: "CABAON-AN", name: "Cabaon-an", sortOrder: 10 },
  { code: "CABINTAN", name: "Cabintan", sortOrder: 11 },
  { code: "CABULIHAN", name: "Cabulihan", sortOrder: 12 },
  { code: "CAGBUHANGIN", name: "Cagbuhangin", sortOrder: 13 },
  { code: "CAMP-DOWNES", name: "Camp Downes", sortOrder: 14 },
  { code: "CAN-ADIENG", name: "Can-adieng", sortOrder: 15 },
  { code: "CAN-UNTOG", name: "Can-untog", sortOrder: 16 },
  { code: "CATMON", name: "Catmon", sortOrder: 17 },
  { code: "COGON-COMBADO", name: "Cogon Combado", sortOrder: 18 },
  { code: "CONCEPCION", name: "Concepcion", sortOrder: 19 },
  { code: "CURVA", name: "Curva", sortOrder: 20 },
  { code: "DANHUG", name: "Danhug (Lili-on)", sortOrder: 21 },
  { code: "DAYHAGAN", name: "Dayhagan", sortOrder: 22 },
  { code: "DOLORES", name: "Dolores", sortOrder: 23 },
  { code: "DOMONAR", name: "Domonar", sortOrder: 24 },
  { code: "DON-CARLOS-B-RIVILLA-SR", name: "Don Carlos B. Rivilla Sr. (Boroc)", sortOrder: 25 },
  { code: "DON-FELIPE-LARRAZABAL", name: "Don Felipe Larrazabal", sortOrder: 26 },
  { code: "DON-POTENCIANO-LARRAZABAL", name: "Don Potenciano Larrazabal", sortOrder: 27 },
  { code: "DONA-FELIZA-Z-MEJIA", name: "Doña Feliza Z. Mejia", sortOrder: 28 },
  { code: "DONGHOL", name: "Donghol", sortOrder: 29 },
  { code: "EAST", name: "East (Poblacion)", sortOrder: 30 },
  { code: "ESPERANZA", name: "Esperanza", sortOrder: 31 },
  { code: "GAAS", name: "Gaas", sortOrder: 32 },
  { code: "GREEN-VALLEY", name: "Green Valley", sortOrder: 33 },
  { code: "GUINTIGUI-AN", name: "Guintigui-an", sortOrder: 34 },
  { code: "HIBUNAWON", name: "Hibunawon", sortOrder: 35 },
  { code: "HUGPA", name: "Hugpa", sortOrder: 36 },
  { code: "IPIL", name: "Ipil", sortOrder: 37 },
  { code: "JUATON", name: "Juaton", sortOrder: 38 },
  { code: "KADAOHAN", name: "Kadaohan", sortOrder: 39 },
  { code: "LABRADOR", name: "Labrador (Balion)", sortOrder: 40 },
  { code: "LAKE-DANAO", name: "Lake Danao", sortOrder: 41 },
  { code: "LAO", name: "Lao", sortOrder: 42 },
  { code: "LEONDONI", name: "Leondoni", sortOrder: 43 },
  { code: "LIBERTAD", name: "Libertad", sortOrder: 44 },
  { code: "LIBERTY", name: "Liberty", sortOrder: 45 },
  { code: "LICUMA", name: "Licuma", sortOrder: 46 },
  { code: "LILOAN", name: "Liloan", sortOrder: 47 },
  { code: "LINAO", name: "Linao", sortOrder: 48 },
  { code: "LUNA", name: "Luna", sortOrder: 49 },
  { code: "MABATO", name: "Mabato", sortOrder: 50 },
  { code: "MABINI", name: "Mabini", sortOrder: 51 },
  { code: "MACABUG", name: "Macabug", sortOrder: 52 },
  { code: "MAGASWI", name: "Magaswi", sortOrder: 53 },
  { code: "MAHAYAG", name: "Mahayag", sortOrder: 54 },
  { code: "MAHAYAHAY", name: "Mahayahay", sortOrder: 55 },
  { code: "MANLILINAO", name: "Manlilinao", sortOrder: 56 },
  { code: "MARGEN", name: "Margen", sortOrder: 57 },
  { code: "MAS-IN", name: "Mas-in", sortOrder: 58 },
  { code: "MATICA-A", name: "Matica-a", sortOrder: 59 },
  { code: "MILAGRO", name: "Milagro", sortOrder: 60 },
  { code: "MONTERICO", name: "Monterico", sortOrder: 61 },
  { code: "NASUNOGAN", name: "Nasunogan", sortOrder: 62 },
  { code: "NAUNGAN", name: "Naungan", sortOrder: 63 },
  { code: "NORTH", name: "North (Poblacion)", sortOrder: 64 },
  { code: "NUEVA-SOCIEDAD", name: "Nueva Sociedad", sortOrder: 65 },
  { code: "NUEVA-VISTA", name: "Nueva Vista", sortOrder: 66 },
  { code: "PATAG", name: "Patag", sortOrder: 67 },
  { code: "PUNTA", name: "Punta", sortOrder: 68 },
  { code: "QUEZON-JR", name: "Quezon, Jr.", sortOrder: 69 },
  { code: "RUFINA-M-TAN", name: "Rufina M. Tan (Rawis)", sortOrder: 70 },
  { code: "SABANG-BAO", name: "Sabang Bao", sortOrder: 71 },
  { code: "SALVACION", name: "Salvacion", sortOrder: 72 },
  { code: "SAN-ANTONIO", name: "San Antonio", sortOrder: 73 },
  { code: "SAN-ISIDRO", name: "San Isidro", sortOrder: 74 },
  { code: "SAN-JOSE", name: "San Jose", sortOrder: 75 },
  { code: "SAN-JUAN", name: "San Juan", sortOrder: 76 },
  { code: "SAN-PABLO", name: "San Pablo (Simangan)", sortOrder: 77 },
  { code: "SAN-VICENTE", name: "San Vicente", sortOrder: 78 },
  { code: "SANTO-NINO", name: "Santo Niño", sortOrder: 79 },
  { code: "SOUTH", name: "South (Poblacion)", sortOrder: 80 },
  { code: "SUMANGGA", name: "Sumangga", sortOrder: 81 },
  { code: "TAMBULILID", name: "Tambulilid", sortOrder: 82 },
  { code: "TONGONAN", name: "Tongonan", sortOrder: 83 },
  { code: "VALENCIA", name: "Valencia", sortOrder: 84 },
  { code: "WEST", name: "West (Poblacion)", sortOrder: 85 },
];
