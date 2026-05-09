require('dotenv').config();
const { supabaseAdmin } = require('./lib/supabase');

const agencies = [
  {
    name: 'Chandler Police Department',
    city: 'Chandler',
    state: 'AZ',
    type: 'Police Department',
    slug: 'chandler-police-department-az',
  },
  {
    name: 'Los Angeles Police Department',
    city: 'Los Angeles',
    state: 'CA',
    type: 'Police Department',
    slug: 'los-angeles-police-department-ca',
  },
  {
    name: 'Chicago Police Department',
    city: 'Chicago',
    state: 'IL',
    type: 'Police Department',
    slug: 'chicago-police-department-il',
  },
  {
    name: 'Harris County Sheriff\'s Office',
    city: 'Houston',
    state: 'TX',
    type: 'Sheriff\'s Office',
    slug: 'harris-county-sheriffs-office-tx',
  },
  {
    name: 'Phoenix Police Department',
    city: 'Phoenix',
    state: 'AZ',
    type: 'Police Department',
    slug: 'phoenix-police-department-az',
  },
  {
    name: 'New York Police Department',
    city: 'New York',
    state: 'NY',
    type: 'Police Department',
    slug: 'new-york-police-department-ny',
  },
  {
    name: 'Miami-Dade Police Department',
    city: 'Miami',
    state: 'FL',
    type: 'Police Department',
    slug: 'miami-dade-police-department-fl',
  },
  {
    name: 'Denver Police Department',
    city: 'Denver',
    state: 'CO',
    type: 'Police Department',
    slug: 'denver-police-department-co',
  },
  {
    name: 'Seattle Police Department',
    city: 'Seattle',
    state: 'WA',
    type: 'Police Department',
    slug: 'seattle-police-department-wa',
  },
  {
    name: 'Maricopa County Sheriff\'s Office',
    city: 'Phoenix',
    state: 'AZ',
    type: 'Sheriff\'s Office',
    slug: 'maricopa-county-sheriffs-office-az',
  },
];

async function seed() {
  console.log('Seeding agencies...');

  for (const agency of agencies) {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .upsert(agency, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error(`Failed to seed ${agency.name}:`, error.message);
    } else {
      console.log(`✓ ${data.name}`);
    }
  }

  console.log('\nSeeding complete.');
}

seed().catch(console.error);
