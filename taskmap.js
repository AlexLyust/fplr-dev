let taskMap = L.map('taskmap', {
  zoomControl: false,
  center: [56.451, 84.952],
  zoom: 16
});

const OSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
attribution:
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(taskMap);

const GMH = (googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
  maxZoom: 20,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
  attribution: 'Map style: <a href="https://www.google.com/maps/">Google</a>'
  }
  ));
  
  const baseMaps = {
    OpenStreet: OSM,
    GoogleHybrid: GMH
  };
  
  //добавляем контролсы на карту
  L.control.layers(baseMaps).addTo(taskMap);

L.control.zoom().setPosition('topright').addTo(taskMap);

/* $FormatUTM
T01      45V   0373423   6258305    102  -Lep-  ["56.45224", "84.9436"]
T02      45V   0373586   6258010     64  -River1- ["56.44963", "84.94905"]
T03      45V   0373741   6258188     77  -Scena-  ["56.45127", "84.95147"]
T04      45V   0373738   6258355    113  -Start-  ["56.45277","84.95134"]
T05      45V   0374021   6258242    109  -Shlagbaum-  ["56.45183","84.95599"]
T06      45V   0373928   6257948     64  -River2-  ["56.44917","84.95462"]
T07      45V   0374198   6258009     87  -Shtolnya-  ["56.44978","84.95897"]
T08      45V   0374335   6258166    120  -RK-Tusur-  ["56.45123","84.96111"]
T09      45V   0374584   6257637     85  -Ugol-  ["56.44655","84.96540"]
T10      45V   0374609   6257889    120  -BazaAntipova-  ["56.44882","84.96569"]
T11      45V   0373372   6256573     74  -Kurya-  ["56.43667","84.94627"]
T12      45V   0372197   6257709     84  -ParadPark-  ["56.44655","84.92667"] */

const waypoints = {
  "T-01": {
    coord: ["56.45224", "84.94626"],
    Name: "Lep",
    Alt: "102"
  },
  "T-02": {
    coord: ["56.44963", "84.94905"],
    Name: "River1",
    Alt: "64"
  },
  "T-03": {
    coord: ["56.45127", "84.95147"],
    Name: "Scena",
    Alt: "77"
  },
  "T-04": {
    coord: ["56.45277","84.95134"],
    Name: "Start",
    Alt: "113"
  },
  "T-05": {
    coord: ["56.45183","84.95599"],
    Name: "Shlagbaum",
    Alt: "109"
  },
  "T-06": {
    coord: ["56.44917","84.95462"],
    Name: "River2",
    Alt: "64"
  },
  "T-07": {
    coord: ["56.44978","84.95897"],
    Name: "Shtolnya",
    Alt: "87"
  },
  "T-08": {
    coord: ["56.45123","84.96111"],
    Name: "RK-Tusur",
    Alt: "120"
  },
  "T-09": {
    coord: ["56.44655","84.96540"],
    Name: "Ugol",
    Alt: "85"
  },
  "T-10": {
    coord: ["56.44882","84.96569"],
    Name: "BazaAntipova",
    Alt: "120"
  },
  "T-11": {
    coord: ["56.43667","84.94627"],
    Name: "Kurya",
    Alt: "74"
  },
  "T-12": {
    coord: ["56.44655","84.92667"],
    Name: "ParadPark",
    Alt: "84"
  }
};

const testtask = {
  "num" : "1",
  "route" : {
    "Takeoff" : {
      "TP" : "T-04",
      "radius" : "50",
      "coord" : ["56.45277","84.95134"],
      "open" : "12-00",
      "close" : "14-00"
    },
    "SSS" : {
      "TP" : "T-04",
      "radius" : "80",
      "coord" : ["56.45277","84.95134"],
      "open" : "12-10",
      "close" : "15-00"
    },
    "TP1" : {
      "TP" : "T-01",
      "radius" : "80",
      "coord" : ["56.45224", "84.9436"],
      "open" : "12-10",
      "close" : "16-00"
    },
    "TP2" : {
      "TP" : "T-08",
      "radius" : "100",
      "coord" : ["56.45123","84.96111"],
      "open" : "12-10",
      "close" : "16-00"
    },
     "ESS" : {
      "TP" : "T-11",
      "radius" : "1500",
      "coord" : ["56.43667","84.94627"],
      "open" : "12-10",
      "close" : "16-00"
    }, 
    "Goal" : {
      "TP" : "T-03",
      "radius" : "50",
      "coord" : ["56.45127", "84.95147"],
      "open" : "12-10",
      "close" : "16-10"
    }
  }
};

let compTask = [];

/* function onMapClick(e) {
  alert("You clicked the map at " + e.latlng);
  let tp = new L.circle(e.latlng, {radius: 100,}).addTo(taskMap);
  task.push(tp);
  tp.bindPopup("Точка №" + tp._latlng);
} */

/* const taskMenu = L.control.taskmenu({ container: 'taskmenu' }).addTo(taskMap); */

/* taskMap.on('click', onMapClick); */

let menu = L.control({position: 'topleft'});



let drawTask = function (task) {
  //проходи по точкам задачи
  Object.entries(testtask.route).map(item => {
    //подбираем цвет цилиндра в зависимости от типа точки
    let col = '#3388ff';
    switch (item[0]) {
      case "Takeoff":
        col = 'green';
        break;
      case 'SSS':
        col = 'red';
        break;
      case 'ESS':
        col = 'red';
        break;
      case 'Goal':
        col = 'green';
        break;
      default:
        break;
    }
    let tp = new L.Circle(item[1].coord, {radius: item[1].radius, color: col, open: item[1].open, close: item[1].close}).addTo(taskMap);
    console.log('work with ' + item[0]);
    compTask.push(tp);
    tp.bindPopup(item[0] + ' - ' + item[1].TP + '; радиус - ' + item[1].radius + 'м ; ворота - ' + item[1].open + ':' + item[1].close);
})
  //отрисовка линии маршрута
  let taskLine = new L.Polyline(
    compTask.map((item) => item.getLatLng()), {color: 'red', opacity: 0.65}
  ).addTo(taskMap);

};

drawTask(testtask);
