const fs = require('fs');

async function run() {
  const cities = JSON.parse(fs.readFileSync('./cities.json', 'utf8'));
  const results = {};
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  for (const city of cities) {
    try {
      const url = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_IO_KEY}&q=${city.lat},${city.lon}&aqi=yes&lang=vi`;
      const res = await fetch(url);
      const d = await res.json();

      results[city.id] = {
        name: city.name,
        temp: Math.round(d.current.temp_c),
        desc: d.current.condition.text,
        feel: Math.round(d.current.feelslike_c),
        hum: d.current.humidity,
        wind: d.current.wind_kph,
        aqi: d.current.air_quality['us-epa-index'],
        time: now
      };
      console.log(`Xong: ${city.name}`);
    } catch (e) { console.error(`Lỗi ${city.name}:`, e); }
  }

  // Đẩy lên Vercel Edge Config
  await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'vietnam_weather', value: results }]
    })
  });
}
run();
