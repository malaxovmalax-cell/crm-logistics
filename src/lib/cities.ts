export interface CityRecord {
  city: string;
  zip: string;
  region: string;
}

export interface AddressRecord {
  city: string;
  street: string;
  zip: string;
  region: string;
}

export const CITIES: CityRecord[] = [
  { city: 'Москва', zip: '101000', region: 'Московская область' },
  { city: 'Санкт-Петербург', zip: '190000', region: 'Ленинградская область' },
  { city: 'Новосибирск', zip: '630000', region: 'Новосибирская область' },
  { city: 'Екатеринбург', zip: '620000', region: 'Свердловская область' },
  { city: 'Казань', zip: '420011', region: 'Республика Татарстан' },
  { city: 'Нижний Новгород', zip: '603000', region: 'Нижегородская область' },
  { city: 'Челябинск', zip: '454000', region: 'Челябинская область' },
  { city: 'Омск', zip: '644000', region: 'Омская область' },
  { city: 'Самара', zip: '443000', region: 'Самарская область' },
  { city: 'Ростов-на-Дону', zip: '344000', region: 'Ростовская область' },
  { city: 'Уфа', zip: '450000', region: 'Республика Башкортостан' },
  { city: 'Краснодар', zip: '350000', region: 'Краснодарский край' },
  { city: 'Воронеж', zip: '394000', region: 'Воронежская область' },
  { city: 'Пермь', zip: '614000', region: 'Пермский край' },
  { city: 'Волгоград', zip: '400000', region: 'Волгоградская область' },
  { city: 'Калининград', zip: '236000', region: 'Калининградская область' },
];

export const STREETS: AddressRecord[] = [
  // Москва
  { city: 'Москва', street: 'ул. Тверская', zip: '125009', region: 'Москва' },
  { city: 'Москва', street: 'ул. Арбат', zip: '119019', region: 'Москва' },
  { city: 'Москва', street: 'Ленинградский пр-т', zip: '125040', region: 'Москва' },
  { city: 'Москва', street: 'ул. Профсоюзная', zip: '117418', region: 'Москва' },
  { city: 'Москва', street: 'Пр-т Мира', zip: '129110', region: 'Москва' },
  { city: 'Москва', street: 'ул. Садовая', zip: '121069', region: 'Москва' },
  { city: 'Москва', street: 'Кутузовский пр-т', zip: '121165', region: 'Москва' },
  { city: 'Москва', street: 'Варшавское шоссе', zip: '117105', region: 'Москва' },
  { city: 'Москва', street: 'ул. Новый Арбат', zip: '119019', region: 'Москва' },
  { city: 'Москва', street: 'Пр-т Вернадского', zip: '119454', region: 'Москва' },
  // Санкт-Петербург
  { city: 'Санкт-Петербург', street: 'Невский пр-т', zip: '191025', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', street: 'ул. Большая Морская', zip: '191060', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', street: 'Лиговский пр-т', zip: '191040', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', street: 'ул. Марата', zip: '191119', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', street: 'Васильевский остров, ул. Большой пр-т', zip: '199006', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', street: 'Петроградская наб.', zip: '197046', region: 'Санкт-Петербург' },
  // Новосибирск
  { city: 'Новосибирск', street: 'ул. Красный пр-т', zip: '630091', region: 'Новосибирск' },
  { city: 'Новосибирск', street: 'ул. Ленина', zip: '630099', region: 'Новосибирск' },
  { city: 'Новосибирск', street: 'Пр-т Карла Маркса', zip: '630077', region: 'Новосибирск' },
  // Екатеринбург
  { city: 'Екатеринбург', street: 'ул. Ленина', zip: '620014', region: 'Екатеринбург' },
  { city: 'Екатеринбург', street: 'ул. Малышева', zip: '620075', region: 'Екатеринбург' },
  { city: 'Екатеринбург', street: 'Пр-т Ленина', zip: '620151', region: 'Екатеринбург' },
  // Казань
  { city: 'Казань', street: 'ул. Баумана', zip: '420111', region: 'Казань' },
  { city: 'Казань', street: 'ул. Кремлевская', zip: '420014', region: 'Казань' },
  { city: 'Казань', street: 'Пр-т Победы', zip: '420139', region: 'Казань' },
  // Нижний Новгород
  { city: 'Нижний Новгород', street: 'ул. Большая Покровская', zip: '603001', region: 'Нижний Новгород' },
  { city: 'Нижний Новгород', street: 'ул. Рождественская', zip: '603001', region: 'Нижний Новгород' },
  // Краснодар
  { city: 'Краснодар', street: 'ул. Красная', zip: '350000', region: 'Краснодар' },
  { city: 'Краснодар', street: 'ул. Карасунская', zip: '350062', region: 'Краснодар' },
  // Ростов-на-Дону
  { city: 'Ростов-на-Дону', street: 'ул. Большая Садовая', zip: '344006', region: 'Ростов-на-Дону' },
  { city: 'Ростов-на-Дону', street: 'Пр-т Будённовский', zip: '344002', region: 'Ростов-на-Дону' },
  // Самара
  { city: 'Самара', street: 'ул. Куйбышева', zip: '443099', region: 'Самара' },
  { city: 'Самара', street: 'Пр-т Ленина', zip: '443022', region: 'Самара' },
  // Челябинск
  { city: 'Челябинск', street: 'ул. Кирова', zip: '454000', region: 'Челябинск' },
  { city: 'Челябинск', street: 'Пр-т Ленина', zip: '454080', region: 'Челябинск' },
  // Омск
  { city: 'Омск', street: 'ул. Ленина', zip: '644043', region: 'Омск' },
  { city: 'Омск', street: 'Пр-т Карла Маркса', zip: '644024', region: 'Омск' },
];

export function findCityByName(name: string): CityRecord | undefined {
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.city.toLowerCase() === n);
}

export function findCityByZip(zip: string): CityRecord | undefined {
  const z = zip.trim();
  if (z.length < 5) return undefined;
  return CITIES.find((c) => c.zip === z);
}

export function searchCities(query: string, limit = 6): CityRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.zip.includes(q) ||
      c.region.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function searchAddresses(query: string, limit = 8): AddressRecord[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  return STREETS.filter(
    (a) =>
      a.city.toLowerCase().includes(q) ||
      a.street.toLowerCase().includes(q) ||
      `${a.city}, ${a.street}`.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function findStreetZip(city: string, street: string): string | undefined {
  const c = city.trim().toLowerCase();
  const s = street.trim().toLowerCase();
  const match = STREETS.find(
    (a) => a.city.toLowerCase() === c && a.street.toLowerCase() === s
  );
  return match?.zip;
}
