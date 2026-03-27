// ============================================================================
// 360° Customer Intelligence Dashboard — Procedural Data Generator
// 10,000 US-based customers × 50 vendors × 10 categories
// ============================================================================

const CATEGORIES = [
  { id: 'premium',       name: 'Premium Cards',   color: '#c9a227', icon: '💳' },
  { id: 'travel',        name: 'Travel',           color: '#00bcd4', icon: '✈️' },
  { id: 'retail',        name: 'Retail',            color: '#e91e63', icon: '🛒' },
  { id: 'fuel',          name: 'Fuel',              color: '#ff9800', icon: '⛽' },
  { id: 'airlines',      name: 'Airlines',          color: '#2196f3', icon: '🛫' },
  { id: 'hotels',        name: 'Hotels',            color: '#9c27b0', icon: '🏨' },
  { id: 'telecom',       name: 'Telecom',           color: '#4caf50', icon: '📱' },
  { id: 'grocery',       name: 'Grocery',           color: '#8bc34a', icon: '🥬' },
  { id: 'insurance',     name: 'Insurance',         color: '#607d8b', icon: '🛡️' },
  { id: 'entertainment', name: 'Entertainment',     color: '#ff5722', icon: '🎬' }
];

const VENDORS = [
  // Premium Cards
  { id: 'V001', name: 'Amex Platinum',          category: 'premium',       logo: '💎' },
  { id: 'V002', name: 'Amex Gold',              category: 'premium',       logo: '🥇' },
  { id: 'V003', name: 'Citi Prestige',          category: 'premium',       logo: '🏛️' },
  { id: 'V004', name: 'Chase Sapphire Reserve', category: 'premium',       logo: '💠' },
  { id: 'V005', name: 'Capital One Venture X',  category: 'premium',       logo: '🖤' },
  // Travel
  { id: 'V006', name: 'Expedia Chase',          category: 'travel',        logo: '🗺️' },
  { id: 'V007', name: 'Booking.com Visa',       category: 'travel',        logo: '🧳' },
  { id: 'V008', name: 'Priceline Barclays',     category: 'travel',        logo: '🌍' },
  { id: 'V009', name: 'Hotels.com Wells Fargo', category: 'travel',        logo: '🎒' },
  { id: 'V010', name: 'Kayak Capital One',      category: 'travel',        logo: '⛰️' },
  // Retail
  { id: 'V011', name: 'Amazon Prime Visa',      category: 'retail',        logo: '📦' },
  { id: 'V012', name: 'Target RedCard',         category: 'retail',        logo: '🎯' },
  { id: 'V013', name: 'Costco Citi',            category: 'retail',        logo: '🏪' },
  { id: 'V014', name: 'Walmart Capital One',    category: 'retail',        logo: '🛍️' },
  { id: 'V015', name: 'Best Buy Citi',          category: 'retail',        logo: '📱' },
  // Fuel
  { id: 'V016', name: 'Shell Citi',             category: 'fuel',          logo: '🐚' },
  { id: 'V017', name: 'BP Visa',                category: 'fuel',          logo: '🛢️' },
  { id: 'V018', name: 'ExxonMobil Amex',        category: 'fuel',          logo: '⚡' },
  { id: 'V019', name: 'Chevron Visa',           category: 'fuel',          logo: '🔥' },
  { id: 'V020', name: 'Marathon BofA',          category: 'fuel',          logo: '🏭' },
  // Airlines
  { id: 'V021', name: 'Delta SkyMiles Amex',    category: 'airlines',      logo: '✈️' },
  { id: 'V022', name: 'United Explorer Chase',  category: 'airlines',      logo: '🔵' },
  { id: 'V023', name: 'AA Citi AAdvantage',     category: 'airlines',      logo: '⭐' },
  { id: 'V024', name: 'Southwest Chase',        category: 'airlines',      logo: '❤️' },
  { id: 'V025', name: 'JetBlue Barclays',       category: 'airlines',      logo: '🟢' },
  // Hotels
  { id: 'V026', name: 'Marriott Bonvoy Amex',   category: 'hotels',        logo: '🏰' },
  { id: 'V027', name: 'Hilton Honors Amex',     category: 'hotels',        logo: '🏨' },
  { id: 'V028', name: 'Hyatt Chase',            category: 'hotels',        logo: '🌟' },
  { id: 'V029', name: 'IHG Premier Chase',      category: 'hotels',        logo: '🏢' },
  { id: 'V030', name: 'Wyndham Capital One',    category: 'hotels',        logo: '👑' },
  // Telecom
  { id: 'V031', name: 'T-Mobile Visa',          category: 'telecom',       logo: '📶' },
  { id: 'V032', name: 'Verizon Visa',           category: 'telecom',       logo: '📡' },
  { id: 'V033', name: 'AT&T Access',            category: 'telecom',       logo: '📲' },
  { id: 'V034', name: 'Xfinity Visa',           category: 'telecom',       logo: '🔗' },
  { id: 'V035', name: 'Spectrum Mastercard',     category: 'telecom',       logo: '📺' },
  // Grocery
  { id: 'V036', name: 'Whole Foods Amex',       category: 'grocery',       logo: '🥬' },
  { id: 'V037', name: 'Kroger Visa',            category: 'grocery',       logo: '🥦' },
  { id: 'V038', name: 'Safeway Visa',           category: 'grocery',       logo: '⭐' },
  { id: 'V039', name: 'Trader Joe\'s Visa',     category: 'grocery',       logo: '🧃' },
  { id: 'V040', name: 'Publix Visa',            category: 'grocery',       logo: '🌿' },
  // Insurance
  { id: 'V041', name: 'State Farm Visa',        category: 'insurance',     logo: '🏛️' },
  { id: 'V042', name: 'Geico Mastercard',       category: 'insurance',     logo: '🦎' },
  { id: 'V043', name: 'Progressive Visa',       category: 'insurance',     logo: '🛡️' },
  { id: 'V044', name: 'Allstate Visa',          category: 'insurance',     logo: '🔷' },
  { id: 'V045', name: 'Liberty Mutual Visa',    category: 'insurance',     logo: '⚙️' },
  // Entertainment
  { id: 'V046', name: 'Netflix Visa',           category: 'entertainment', logo: '🔴' },
  { id: 'V047', name: 'Disney Visa',            category: 'entertainment', logo: '🏰' },
  { id: 'V048', name: 'Hulu Mastercard',        category: 'entertainment', logo: '💚' },
  { id: 'V049', name: 'Spotify Visa',           category: 'entertainment', logo: '💫' },
  { id: 'V050', name: 'AMC Mastercard',         category: 'entertainment', logo: '🎬' }
];

const MONTHS_LABELS = [
  'Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025',
  'Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026'
];

// ══════════════════════════════════════════
// Seeded PRNG for reproducibility
// ══════════════════════════════════════════
class SeededRandom {
  constructor(seed) { this.seed = seed; }
  next() {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
  pick(arr) { return arr[this.int(0, arr.length - 1)]; }
  chance(p) { return this.next() < p; }
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

const RNG = new SeededRandom(42);

// ══════════════════════════════════════════
// US Name & Location Pools
// ══════════════════════════════════════════
const FIRST_NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen',
  'Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra',
  'Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle',
  'Kenneth','Dorothy','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah',
  'Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia',
  'Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna',
  'Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen',
  'Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel',
  'Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather',
  'Tyler','Diane','Aaron','Ruth','Jose','Julie','Adam','Olivia','Nathan','Joyce',
  'Henry','Virginia','Douglas','Victoria','Zachary','Kelly','Peter','Lauren','Kyle','Christina',
  'Noah','Joan','Ethan','Evelyn','Jeremy','Judith','Walter','Megan','Christian','Andrea',
  'Keith','Cheryl','Roger','Hannah','Terry','Jacqueline','Austin','Martha','Sean','Gloria',
  'Gerald','Teresa','Carl','Ann','Harold','Sara','Dylan','Madison','Arthur','Frances',
  'Lawrence','Kathryn','Jordan','Janice','Jesse','Jean','Bryan','Abigail','Billy','Alice',
  'Bruce','Judy','Gabriel','Sophia','Joe','Grace','Logan','Denise','Albert','Amber',
  'Willie','Doris','Alan','Marilyn','Eugene','Danielle','Russell','Beverly','Vincent','Isabella',
  'Philip','Theresa','Bobby','Diana','Johnny','Natalie','Bradley','Brittany','Roy','Charlotte',
  'Caleb','Marie','Ray','Kayla','Luis','Alexis','Randy','Lori','Howard','Alyssa','Wayne','Tiffany',
  'Carlos','Monica','Sofia','Chloe','Riley','Aria','Hazel','Ellie','Nora','Lily',
  'Eleanor','Stella','Violet','Savannah','Audrey','Brooklyn','Bella','Claire','Skylar','Lucy',
  'Liam','Mason','Lucas','Aiden','Oliver','Elijah','Sebastian','Owen','Carter','Jayden',
  'Luke','Lincoln','Isaac','Asher','Leo','Adrian','Mateo','Miles','Eli','Jaxon',
  'Grayson','Easton','Nolan','Ezra','Colton','Micah','Connor','Cooper','Carson','Axel',
  'Ryder','Julian','Roman','Kai','Maverick','Silas','Declan','Bennett','Brooks','Finn',
  'Emery','Rowan','Felix','Beckett','Cruz','Atlas','Jasper','Zion','River','Knox'
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
  'Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes',
  'Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper',
  'Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson',
  'Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes',
  'Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez',
  'Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes',
  'Gonzales','Fisher','Vasquez','Simmons','Graham','Murray','Ford','Hamilton','Kennedy','Wells',
  'Stone','Hawkins','Warren','Hicks','Gibson','Ellis','Tran','Medina','Aguilar','Stevens',
  'Marshall','Bishop','Welch','Blake','Lambert','Bates','Lynch','Hale','Norris','Frost'
];

const US_STATES = [
  { abbr: 'CA', name: 'California', cities: ['Los Angeles','San Francisco','San Diego','San Jose','Sacramento','Oakland','Irvine','Pasadena','Fresno','Long Beach'] },
  { abbr: 'NY', name: 'New York', cities: ['New York City','Brooklyn','Queens','Manhattan','Buffalo','Rochester','Albany','Syracuse','Bronx','Yonkers'] },
  { abbr: 'TX', name: 'Texas', cities: ['Houston','Dallas','Austin','San Antonio','Fort Worth','El Paso','Arlington','Plano','Irving','Frisco'] },
  { abbr: 'FL', name: 'Florida', cities: ['Miami','Orlando','Tampa','Jacksonville','Fort Lauderdale','St. Petersburg','Tallahassee','Gainesville','Naples','Boca Raton'] },
  { abbr: 'IL', name: 'Illinois', cities: ['Chicago','Aurora','Naperville','Joliet','Rockford','Springfield','Evanston','Champaign','Peoria','Schaumburg'] },
  { abbr: 'PA', name: 'Pennsylvania', cities: ['Philadelphia','Pittsburgh','Allentown','Erie','Reading','Scranton','Bethlehem','Lancaster','Harrisburg','King of Prussia'] },
  { abbr: 'OH', name: 'Ohio', cities: ['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton','Canton','Youngstown','Dublin','Westerville'] },
  { abbr: 'GA', name: 'Georgia', cities: ['Atlanta','Augusta','Savannah','Athens','Macon','Roswell','Sandy Springs','Alpharetta','Marietta','Decatur'] },
  { abbr: 'NC', name: 'North Carolina', cities: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville','Cary','Wilmington','Asheville','Chapel Hill'] },
  { abbr: 'MI', name: 'Michigan', cities: ['Detroit','Grand Rapids','Ann Arbor','Lansing','Dearborn','Troy','Kalamazoo','Flint','Sterling Heights','Warren'] },
  { abbr: 'NJ', name: 'New Jersey', cities: ['Newark','Jersey City','Paterson','Elizabeth','Trenton','Princeton','Hoboken','Camden','Cherry Hill','Edison'] },
  { abbr: 'VA', name: 'Virginia', cities: ['Virginia Beach','Norfolk','Richmond','Arlington','Alexandria','Chesapeake','Newport News','Hampton','Fairfax','Roanoke'] },
  { abbr: 'WA', name: 'Washington', cities: ['Seattle','Tacoma','Spokane','Vancouver','Bellevue','Redmond','Kirkland','Olympia','Renton','Everett'] },
  { abbr: 'AZ', name: 'Arizona', cities: ['Phoenix','Tucson','Mesa','Scottsdale','Chandler','Tempe','Gilbert','Glendale','Peoria','Surprise'] },
  { abbr: 'MA', name: 'Massachusetts', cities: ['Boston','Cambridge','Worcester','Springfield','Lowell','Quincy','Salem','Newton','Brookline','Somerville'] },
  { abbr: 'TN', name: 'Tennessee', cities: ['Nashville','Memphis','Knoxville','Chattanooga','Clarksville','Murfreesboro','Franklin','Johnson City','Germantown','Brentwood'] },
  { abbr: 'IN', name: 'Indiana', cities: ['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel','Fishers','Bloomington','Hammond','Gary','Muncie'] },
  { abbr: 'MO', name: 'Missouri', cities: ['Kansas City','St. Louis','Springfield','Columbia','Independence','Lee\'s Summit','O\'Fallon','St. Joseph','Chesterfield','Florissant'] },
  { abbr: 'MD', name: 'Maryland', cities: ['Baltimore','Columbia','Silver Spring','Germantown','Rockville','Frederick','Bethesda','Annapolis','Bowie','Gaithersburg'] },
  { abbr: 'CO', name: 'Colorado', cities: ['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Boulder','Arvada','Centennial','Westminster','Thornton'] }
];

const STREET_NAMES = [
  'Main St','Oak Ave','Maple Dr','Cedar Ln','Elm St','Pine Rd','Washington Blvd',
  'Park Ave','Lake Dr','Hill St','Sunset Blvd','Broadway','Lincoln Ave','Jefferson St',
  'Madison Ave','Franklin Rd','River Rd','Forest Dr','Valley View','Meadow Ln',
  'Highland Ave','Willow St','Cherry Ln','Birch St','Walnut Dr','Spruce Ave',
  'Chestnut St','Laurel Ln','Peachtree Rd','Magnolia Blvd','Dogwood Dr','Ivy Ln',
  'Sycamore Ave','Poplar St','Cypress Rd','Juniper Dr','Hawthorn Ln','Alder St'
];

const AVATARS = ['👤','👩','👨','🧑','👩‍💼','🧑‍💼','👩‍💻','🧑‍💻','👩‍🔬','👨‍🔬','👩‍🎨','👨‍🎨','👩‍🦱','👨‍🦱','👱‍♀️','👱','🧔','👩‍🦰','👨‍🦰','🧑‍🦱'];

const EVENT_TYPES_GOOD = ['payment','spend','reward','credit_increase','account_open'];
const EVENT_TYPES_BAD = ['late_payment','dispute','default','collection','credit_decrease'];
const EVENT_TYPES_NEUTRAL = ['kyc','account_closure','settlement','dormancy','winback'];

// ══════════════════════════════════════════
// Generator Functions
// ══════════════════════════════════════════
function genSSN() {
  return `***-**-${RNG.int(1000, 9999)}`;
}

function genPhone() {
  return `+1-${RNG.int(200, 999)}-${RNG.int(200, 999)}-${String(RNG.int(0, 9999)).padStart(4, '0')}`;
}

function genEmail(first, last) {
  const domains = ['gmail.com','yahoo.com','outlook.com','icloud.com','hotmail.com','protonmail.com','aol.com','comcast.net'];
  const sep = RNG.pick(['.', '_', '']);
  const suffix = RNG.chance(0.3) ? String(RNG.int(1, 99)) : '';
  return `${first.toLowerCase()}${sep}${last.toLowerCase()}${suffix}@${RNG.pick(domains)}`;
}

function genAddress() {
  const state = RNG.pick(US_STATES);
  const city = RNG.pick(state.cities);
  const street = `${RNG.int(1, 9999)} ${RNG.pick(STREET_NAMES)}`;
  const zip = String(RNG.int(10000, 99999));
  return { full: `${street}, ${city}, ${state.abbr} ${zip}`, city, state: state.abbr, stateName: state.name, zip };
}

function genDOB() {
  const year = RNG.int(1955, 2003);
  const month = RNG.int(1, 12);
  const day = RNG.int(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function genCustomerSince() {
  const year = RNG.int(2010, 2025);
  const month = RNG.int(1, 12);
  const day = RNG.int(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function genPayHistory(pattern) {
  const statuses = [];
  for (let i = 0; i < 12; i++) {
    if (pattern === 'perfect') statuses.push('on-time');
    else if (pattern === 'good') statuses.push(RNG.chance(0.88) ? 'on-time' : 'late');
    else if (pattern === 'mixed') statuses.push(RNG.chance(0.65) ? 'on-time' : (RNG.chance(0.5) ? 'late' : 'missed'));
    else if (pattern === 'poor') statuses.push(RNG.chance(0.35) ? 'on-time' : (RNG.chance(0.5) ? 'late' : 'missed'));
    else if (pattern === 'defaulted') statuses.push(i < 5 ? (RNG.chance(0.5) ? 'on-time' : 'late') : 'missed');
    else statuses.push('on-time');
  }
  return MONTHS_LABELS.map((m, i) => ({ month: m, status: statuses[i] }));
}

function genAccounts(riskTier) {
  const numAccounts = riskTier === 'low' ? RNG.int(3, 10) :
    riskTier === 'moderate' ? RNG.int(4, 12) : RNG.int(5, 15);
  const vendorIds = RNG.shuffle(VENDORS.map(v => v.id)).slice(0, numAccounts);
  const accounts = [];
  const patterns = riskTier === 'low' ? ['perfect','perfect','good'] :
    riskTier === 'moderate' ? ['good','mixed','good','mixed'] :
    ['poor','mixed','defaulted','poor','mixed'];

  for (const vid of vendorIds) {
    const v = VENDORS.find(x => x.id === vid);
    const limitBase = v.category === 'premium' ? RNG.int(5000, 50000) :
      v.category === 'insurance' ? RNG.int(3000, 30000) :
      RNG.int(1000, 25000);
    const limit = Math.round(limitBase / 500) * 500;
    const pattern = RNG.pick(patterns);
    const isDefaulted = pattern === 'defaulted' && RNG.chance(0.7);
    const isClosed = !isDefaulted && RNG.chance(0.12);
    const status = isDefaulted ? 'defaulted' : isClosed ? 'closed' : 'active';
    const util = status === 'defaulted' ? RNG.next() * 0.3 + 0.7 :
      status === 'closed' ? 0 :
      riskTier === 'low' ? RNG.next() * 0.3 :
      riskTier === 'moderate' ? RNG.next() * 0.6 :
      RNG.next() * 0.9 + 0.1;
    const balance = status === 'closed' ? 0 : Math.round(limit * util);
    const yr = RNG.int(2014, 2025);
    const mn = RNG.int(1, 12);
    const dy = RNG.int(1, 28);
    const prefix = vid.replace('V0', '').replace('V', '');
    accounts.push({
      vendorId: vid,
      accountNumber: `${v.name.substring(0, 3).toUpperCase()}-${RNG.int(1000, 9999)}-${prefix}`,
      cardType: v.name,
      balance, limit, status,
      openedDate: `${yr}-${String(mn).padStart(2, '0')}-${String(dy).padStart(2, '0')}`,
      paymentHistory: genPayHistory(pattern)
    });
  }
  return accounts;
}

function genTimeline(riskTier, numEvents) {
  const events = [];
  const baseDate = new Date(2026, 2, 27); // Mar 27 2026
  for (let i = 0; i < numEvents; i++) {
    const daysBack = RNG.int(1, 450);
    const d = new Date(baseDate);
    d.setDate(d.getDate() - daysBack);
    const dateStr = d.toISOString().split('T')[0];

    let type, desc, amount;
    const roll = RNG.next();
    if (riskTier === 'low') {
      if (roll < 0.45) { type = 'payment'; desc = `On-time payment processed — ${RNG.pick(VENDORS).name}`; amount = RNG.int(200, 15000); }
      else if (roll < 0.7) { type = 'spend'; desc = `Purchase at ${RNG.pick(VENDORS).name}`; amount = RNG.int(50, 8000); }
      else if (roll < 0.8) { type = 'reward'; desc = `Reward points redeemed — ${RNG.int(1000, 50000)} points`; }
      else if (roll < 0.9) { type = 'kyc'; desc = 'Annual KYC review completed — all documents verified'; }
      else { type = 'credit_increase'; desc = `Credit limit increase approved — ${RNG.pick(VENDORS).name}`; }
    } else if (riskTier === 'moderate') {
      if (roll < 0.3) { type = 'payment'; desc = `Payment processed — ${RNG.pick(VENDORS).name}`; amount = RNG.int(100, 8000); }
      else if (roll < 0.5) { type = 'spend'; desc = `Purchase at ${RNG.pick(VENDORS).name}`; amount = RNG.int(50, 5000); }
      else if (roll < 0.65) { type = 'late_payment'; desc = `Payment delayed — ${RNG.pick(VENDORS).name}`; }
      else if (roll < 0.78) { type = 'dispute'; desc = `Disputed charge on ${RNG.pick(VENDORS).name}`; amount = RNG.int(50, 3000); }
      else if (roll < 0.88) { type = 'kyc'; desc = 'KYC update reminder sent'; }
      else { type = 'credit_decrease'; desc = `Credit limit review — ${RNG.pick(VENDORS).name}`; }
    } else {
      if (roll < 0.2) { type = 'payment'; desc = `Partial payment — ${RNG.pick(VENDORS).name}`; amount = RNG.int(50, 3000); }
      else if (roll < 0.35) { type = 'late_payment'; desc = `Payment overdue — ${RNG.pick(VENDORS).name}`; }
      else if (roll < 0.5) { type = 'collection'; desc = `Collection notice issued — ${RNG.pick(VENDORS).name}`; amount = RNG.int(500, 10000); }
      else if (roll < 0.65) { type = 'default'; desc = `Account flagged for default — ${RNG.pick(VENDORS).name}`; amount = RNG.int(1000, 20000); }
      else if (roll < 0.78) { type = 'dispute'; desc = `Disputed fees on ${RNG.pick(VENDORS).name}`; amount = RNG.int(100, 5000); }
      else if (roll < 0.88) { type = 'settlement'; desc = `Settlement offer — ${RNG.pick(VENDORS).name}`; amount = RNG.int(500, 8000); }
      else { type = 'credit_decrease'; desc = `Credit limit reduced — ${RNG.pick(VENDORS).name}`; }
    }
    events.push({ date: dateStr, type, description: desc, ...(amount ? { amount } : {}) });
  }
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

// ══════════════════════════════════════════
// Generate 10,000 Customers
// ══════════════════════════════════════════
console.time('Data Generation');

const CUSTOMERS = [];
const _usedNames = new Set();

for (let i = 0; i < 10000; i++) {
  let first, last, fullName;
  do {
    first = RNG.pick(FIRST_NAMES);
    last = RNG.pick(LAST_NAMES);
    fullName = `${first} ${last}`;
  } while (_usedNames.has(fullName));
  _usedNames.add(fullName);

  const id = `CUST-${String(i + 1).padStart(5, '0')}`;
  const addr = genAddress();
  const dob = genDOB();
  const since = genCustomerSince();

  // Risk tier distribution: 55% low, 30% moderate, 15% high
  const riskRoll = RNG.next();
  const riskTier = riskRoll < 0.55 ? 'low' : riskRoll < 0.85 ? 'moderate' : 'high';

  const riskScore = riskTier === 'low' ? RNG.int(5, 39) :
    riskTier === 'moderate' ? RNG.int(40, 69) : RNG.int(70, 98);

  const defaults = riskTier === 'high' ? RNG.int(0, 4) : riskTier === 'moderate' ? (RNG.chance(0.15) ? 1 : 0) : 0;
  const latePayments = riskTier === 'high' ? RNG.int(8, 36) : riskTier === 'moderate' ? RNG.int(2, 15) : RNG.int(0, 3);
  const consecutiveOnTime = riskTier === 'low' ? RNG.int(8, 48) : riskTier === 'moderate' ? RNG.int(0, 12) : RNG.int(0, 3);
  const bureauScore = riskTier === 'low' ? RNG.int(720, 850) : riskTier === 'moderate' ? RNG.int(620, 740) : RNG.int(480, 640);

  const kycRoll = RNG.next();
  const kycStatus = riskTier === 'high' ? (kycRoll < 0.4 ? 'verified' : kycRoll < 0.7 ? 'expired' : 'pending_update') :
    riskTier === 'moderate' ? (kycRoll < 0.7 ? 'verified' : kycRoll < 0.9 ? 'pending_update' : 'expired') :
    (kycRoll < 0.92 ? 'verified' : 'pending_update');

  const kycLastUpdated = `${RNG.int(2024, 2026)}-${String(RNG.int(1, 12)).padStart(2, '0')}-${String(RNG.int(1, 28)).padStart(2, '0')}`;

  const accounts = genAccounts(riskTier);

  const totalOutstanding = accounts.reduce((s, a) => s + a.balance, 0);
  const creditLimit = accounts.reduce((s, a) => s + a.limit, 0);
  const utilizationRate = creditLimit > 0 ? Math.round((totalOutstanding / creditLimit) * 1000) / 10 : 0;

  const monthlyBase = riskTier === 'low' ? RNG.int(2000, 25000) : riskTier === 'moderate' ? RNG.int(1000, 12000) : RNG.int(500, 6000);
  const yearsActive = Math.max(1, new Date().getFullYear() - new Date(since).getFullYear());
  const totalSpend = monthlyBase * 12 * yearsActive + RNG.int(0, 50000);
  const disputesFiled = riskTier === 'high' ? RNG.int(2, 12) : riskTier === 'moderate' ? RNG.int(0, 5) : RNG.int(0, 2);

  const nextPayDay = RNG.int(1, 28);
  const nextPaymentDue = `2026-04-${String(nextPayDay).padStart(2, '0')}`;
  const nextPaymentAmount = Math.round(totalOutstanding * (RNG.next() * 0.15 + 0.05));

  const timelineLen = RNG.int(6, 16);
  const timeline = genTimeline(riskTier, timelineLen);

  CUSTOMERS.push({
    id, name: fullName,
    email: genEmail(first, last),
    phone: genPhone(),
    dob,
    address: addr.full,
    city: addr.city,
    state: addr.state,
    stateName: addr.stateName,
    zip: addr.zip,
    ssn: genSSN(),
    kycStatus, kycLastUpdated,
    customerSince: since,
    avatar: RNG.pick(AVATARS),
    financial: {
      totalOutstanding, creditLimit, utilizationRate,
      nextPaymentDue, nextPaymentAmount,
      totalSpend, avgMonthly: monthlyBase,
      disputesFiled
    },
    risk: {
      score: riskScore, tier: riskTier,
      defaults, latePayments, consecutiveOnTime,
      creditBureauScore: bureauScore
    },
    accounts,
    timeline
  });
}

console.timeEnd('Data Generation');
console.log(`Generated ${CUSTOMERS.length} customers, ${CUSTOMERS.reduce((s, c) => s + c.accounts.length, 0)} accounts`);

// ══════════════════════════════════════════
// Indexed lookups for performance
// ══════════════════════════════════════════
const CUSTOMER_BY_ID = {};
CUSTOMERS.forEach(c => { CUSTOMER_BY_ID[c.id] = c; });

// Utility functions
function getVendor(vendorId) { return VENDORS.find(v => v.id === vendorId); }
function getCategory(categoryId) { return CATEGORIES.find(c => c.id === categoryId); }
function formatCurrency(amount) { return '$' + amount.toLocaleString('en-US'); }
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function calculateAge(dob) {
  const today = new Date(); const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
function calculateTenure(sinceDate) {
  const today = new Date(); const start = new Date(sinceDate);
  const years = today.getFullYear() - start.getFullYear();
  const months = today.getMonth() - start.getMonth();
  const totalMonths = years * 12 + months;
  const y = Math.floor(totalMonths / 12); const m = ((totalMonths % 12) + 12) % 12;
  return y > 0 ? `${y}y ${m}m` : `${m}m`;
}
