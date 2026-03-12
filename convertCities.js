const fs = require("fs");

const cities = JSON.parse(fs.readFileSync("cities.json","utf8"));

let csv = "id,name,state_id,country_code\n";

cities.forEach(city => {

if(city.country_code === "IN"){

csv += `${city.id},"${city.name}",${city.state_id},${city.country_code}\n`

}

})

fs.writeFileSync("india_cities.csv",csv)

console.log("India cities CSV created")