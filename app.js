const { jsPDF } = window.jspdf;
// const { jsPDF } = require ('@jspdf');

//объявляем объект frm, и в дальнейшем используем его свойства
const frm ={
  firstName: document.querySelector('#first-name'),
  lastName: document.querySelector('#last-name'),
  fatherName: document.querySelector('#father-name'),
  phone: document.querySelector('#phone'),
  email: document.querySelector('#e-mail'),
  quant: document.querySelector('#quant'),
  siteHeight: document.querySelector('#altitude'),
  sitePlace: document.querySelector('#place'),
  siteRadius: document.querySelector('#radius'),
  dateControl: document.querySelector("#date"),
  sTimeControl: document.querySelector("#start-time"),
  eTimeControl: document.querySelector("#end-time")  
};

const mapCoords = [56.45, 84.948197]; //координаты центра карты при инициализации

const siteCoords = {
  Boy: ["562700", "0845500"],
  LS: ["562700", "0845700"],
  Brz: ["563000", "0844200"],
  Nlb: ["563400", "0843700"],
  Knd: ["561500", "0844600"],
  Mkr: ["560100", "0844900"],
  Eus: ["563100", "0845200"],
};

//описываем координаты диспетчерских зон и районов
const UNP252 = {
  Coords: [
    [56.7, 85.016],
    [56.7, 84.75],
    [56.547, 84.75],
    [56.547, 85.033],
    [56.7, 85.016]
  ],
  Name: "UNP252",
  AltTop: "10000м AGL",
  AltBottom: "GND",
  Class: "Restricted"
},
UNTT = {
  Name: "ДЗ Томск (Богашево)",
  Coords: [
    ["56.7", "85.33333333333333"],
    ["56.4", "84.91666666666667"],
    ["56.269999999999996", "84.86444444444444"],
    ["56.18111111111111", "84.69166666666668"],
    ["56.14", "84.68333333333334"],
    ["56.05", "85.26666666666667"],
    ["56.166666666666664", "85.43333333333334"],
    ["56.38333333333333", "85.7"],
    ["56.61666666666667", "85.58333333333333"],
    ["56.7", "85.33333333333333"]
  ],
  AltTop: "FL50",
  AltBottom: "GND",
  Class: "C"
},
golovino = {
  Name: "ДЗ Томск (Головина)",
  Coords: [
    ["56.4", "84.91666666666667"],
    ["56.4", "84.33333333333333"],
    ["56.55", "83.6"],
    ["56.1", "83.61666666666666"],
    ["56.016666666666666", "83.8"],
    ["56", "84.25"],
    ["56.05", "84.66666666666667"],
    ["56.14", "84.68333333333334"],
    ["56.18111111111111", "84.69166666666668"],
    ["56.269999999999996", "84.86444444444444"],
    ["56.4", "84.91666666666667"]
  ],
  AltTop: "FL50",
  AltBottom: "GND",
  Class: "C"
};

//блок обработки панели управления зонами и слоями
const CZones = L.layerGroup(), RZones = L.layerGroup();

const BogZone = L.polygon(UNTT.Coords, { color: "#ff7800", weight: 1 }).addTo(
CZones
);
const GolZone = L.polygon(golovino.Coords, {
  color: "green",
  weight: 1,
  opacity: 0.65
}).addTo(CZones);

const rZone = L.polygon(UNP252.Coords, { color: "red", weight: 1 }).addTo(RZones);
rZone.bindPopup(
`<p>${UNP252.Name}</p><p>Высоты ${UNP252.AltBottom} - ${UNP252.AltTop}</p><p>Класс ВП - ${UNP252.Class}</p>`
);

const mymap = L.map("mapid", {
zoomControl: false,
layers: [CZones, RZones]
}).setView(mapCoords, 13);
//ставим ограничения на перемещение по карте
const southWest = L.latLng(60, 90),
northEast = L.latLng(54, 82);
const bounds = L.latLngBounds(southWest, northEast);

mymap.setMaxBounds(bounds);
mymap.on('drag', function() {
  mymap.panInsideBounds(bounds, { animate: true });
});

const overlayMaps = {
"Зоны С": CZones,
"Запретные зоны": RZones
};

//добавляем слои карты
const OSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
attribution:
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

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
L.control.layers(baseMaps, overlayMaps).addTo(mymap);
L.control.zoom().setPosition('topright').addTo(mymap);
// создаём и добавляем сайдбар
const sidebar = L.control.sidebar({ container: 'sidebar' })
    .addTo(mymap);
    // .open('home'); //открываем вкладку

//описываем функции конвертации координат
function lngToDDMM(ln) {
  let str = Math.abs(ln).toString(),
    pref = ln > 0 ? "В " : "З ",
    DD = str.slice(0, str.indexOf(".", 0)),
    mm = (str.slice(str.indexOf(".", 0) + 1)/10**str.slice(str.indexOf(".", 0) + 1).length)*60;
  mm = mm.toString().indexOf(".", 0) == 1 || mm == "0" ? "0" + mm : mm;
  if (DD.length < 2) {
    DD = pref + "00" + DD;
  } else if (DD.length == 2) {
    DD = pref + "0" + DD;
  } else {
    DD = pref + DD;
  }
  return DD + "°" + mm.toString().slice(0, 5);
}

function latToDDMM(lt) {
  let str = Math.abs(lt).toString(),
    pref = lt > 0 ? "С " : "Ю ",
    DD = str.slice(0, str.indexOf(".", 0)),
    mm =
      (str.slice(str.indexOf(".", 0) + 1) /
        10 ** str.slice(str.indexOf(".", 0) + 1).length) *
      60;

  mm = mm.toString().indexOf(".", 0) == 1 || mm == "0" ? "0" + mm : mm;
  DD = DD.length == 1 ? pref + "0" + DD : pref + DD;
  return DD + "°" + mm.toString().slice(0, 5);
}

L.Control.MousePosition = L.Control.extend({
  options: {
    position: "bottomright",
    separator: " : ",
    emptyString: "",
    lngFirst: false,
    numDigits: 5,
    lngFormatter: lngToDDMM,
    latFormatter: latToDDMM,
    prefix: ""
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create("div", "leaflet-control-mouseposition");
    L.DomEvent.disableClickPropagation(this._container);
    map.on("mousemove", this._onMouseMove, this);
    this._container.innerHTML = this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off("mousemove", this._onMouseMove);
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter
      ? this.options.lngFormatter(e.latlng.lng)
      : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter
      ? this.options.latFormatter(e.latlng.lat)
      : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst
      ? lng + this.options.separator + lat
      : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + " " + value;
    this._container.innerHTML = prefixAndValue;
  }
});

L.control.mousePosition = function (options) {
  return new L.Control.MousePosition(options);
};

//добавляем отображение координат
L.control.mousePosition().addTo(mymap);
//добавляем масштаб
L.control.scale({ imperial: false, position: "bottomright"}).addTo(mymap);
//конверторы координат
function DMStoLatLng(DMS) {
  //DMS format: [<DDMMSS>lat(string), <DDDMMSS>lng(string)]  ***7 char of lng***
  let DDlat = +DMS[0].slice(0, 2),
    Ddlat = +DMS[0].slice(2, 4),
    ddlat = +DMS[0].slice(4, 6),
    DDlng = +DMS[1].slice(0, 3),
    Ddlng = +DMS[1].slice(3, 5),
    ddlng = +DMS[1].slice(5, 7);
  return [
    DDlat + Ddlat / 60 + (ddlat / 60) * 60,
    DDlng + Ddlng / 60 + (ddlng / 60) * 60
  ];
}

function DDMMSSToLat(DDMMSS) {
  if (DDMMSS.length == 6) {
    let DD = DDMMSS.slice(0, 2),
      MM = DDMMSS.slice(2, 4),
      SS = DDMMSS.slice(4, 6);

    return +DD + MM / 60 + SS / (60 * 60);
  } else {
    return "lat bad length";
  }
}

function DDDMMSSToLng(DDDMMSS) {
  if (DDDMMSS.length == 7) {
    let DDD = DDDMMSS.slice(0, 3),
      MM = DDDMMSS.slice(3, 5),
      SS = DDDMMSS.slice(5, 7);

    return +DDD + MM / 60 + SS / (60 * 60);
  } else {
    return "lng bad length";
  }
}

const markers = []; // массив с поворотными точками маршрута
let polyline = new L.Polyline(
  markers.map((item) => item.getLatLng()),
  { color: "red", opacity: 0.65 }
).addTo(mymap);
//блок обработки событий маркеров
function dragStartHandler(e) {
  var latlngs = polyline.getLatLngs(),
    latlng = this.getLatLng();
  for (var i = 0; i < latlngs.length; i++) {
    if (latlng.equals(latlngs[i])) {
      this.polylineLatlng = i;
    }
  }
}

function dragHandler(e) {
  var latlngs = polyline.getLatLngs(),
    latlng = this.getLatLng();
  latlngs.splice(this.polylineLatlng, 1, latlng);
  polyline.setLatLngs(latlngs);
}

function dragEndHandler(e) {
  this.options.coord = latLngToDDMM(this.getLatLng());
  delete this.polylineLatlng;
}

const myIcon = L.divIcon({
  className: "my-div-icon",
  iconSize: 9,
  iconAnchor: [6, 6]
});

function addMarker(e) {
  if (document.querySelector("#place").value == "XC") {
    let marker = new L.Marker(e.latlng, {
      draggable: true,
      // icon: myIcon,
      coord: latLngToDDMM(e.latlng)
    });
    marker
      .on("dragstart", dragStartHandler)
      .on("drag", dragHandler)
      .on("click", onPopupOpen)
      .on("contextmenu", function (e) {
        removeMarker(e.target);
      })
      .on("dragend", dragEndHandler)
      .addTo(mymap);

    markers.push(marker); //добавляем маркер в конец массива
    //передаём координаты для отрисовки полилинии
    polyline.setLatLngs(markers.map((item) => item.getLatLng()));
  } else {
    return;
  }
}

function onPopupOpen(e) {
  let tempMarker = this,
    tpID = "",
    tpCoords = "",
    lastLegLength = 0,
    routeLength = 0;
  markers.forEach(function (item, index) {
    routeLength +=
      index > 0 ? markers[index - 1].getLatLng().distanceTo(item._latlng) : 0;
    if (tempMarker._leaflet_id == item._leaflet_id) {
      tpID = index + 1;
      tpCoords = item._latlng;
      lastLegLength =
        index > 0 ? markers[index - 1].getLatLng().distanceTo(item._latlng) : 0;
    }
  });
  let popup = L.popup()
    .setLatLng(e.latlng)
    .setContent(
      `<div class='popupMarker'><span>TurnPoint №${tpID}</span><br/><span>Координаты точки: ${latToDDMM(
        tpCoords.lat
      )} : ${lngToDDMM(tpCoords.lng)} </span><br>
      <span>Длина последнего плеча маршрута: ${(
        lastLegLength / 1000
      ).toFixed(2)} км.</span><br><span>Общая длина маршрута: ${(
        routeLength / 1000
      ).toFixed(
        2
      )} км.</span><br></div><input type='button' value='Удалить' id='markerDeleteButton'/>`
    )
    .openOn(mymap);
  document
    .getElementById("markerDeleteButton")
    .addEventListener("click", function () {
      removeMarker(tempMarker);
      popup.remove();
    });
}

function removeMarker(tempMarker) {

  markers.forEach(function (item, index) {
    if (tempMarker._leaflet_id == item._leaflet_id) {
      tempMarker.remove(); //удаляем маркер с карты
      markers.splice(index, 1); //удаляем маркер из массива
    }
    //передаём координаты массивом для отрисовки полилинии
    polyline.setLatLngs(markers.map((item) => item.getLatLng()));
  });
}

mymap.on("click", addMarker);

function convertMS(ms) {
  let d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  h += d * 24;
  return ("0" + h).slice(-2) + ("0" + m).slice(-2);
}

let sDateTime = new Date(),
  eDateTime = new Date(),
  Route = [],
  XCRoute = "",
  DEP = "",
  DEST = "",
  FLIGHTTYPE = "";

//создаем круг
let Circle = L.circle([56.45, 84.95], { color: "red", radius: 500 });
//обработчик изменения места полётов
function onSelectChanged() {
  addCircle();
  
  if (frm.sitePlace.value == 'XC') {
    document.querySelector('#mapid').classList.add("cursor-crosshair");
    Route[0]='';
  }else if (frm.sitePlace.value == ''){
    document.querySelector('#mapid').classList.remove("cursor-crosshair");
    markers.map((item) => item.remove());
    markers.length=0;
    Circle.remove();
    polyline.remove();
    polyline.setLatLngs(markers.map((item) => item.getLatLng()));
    Route[0]='';
  }else {
    document.querySelector('#mapid').classList.remove("cursor-crosshair");
    markers.map((item) => item.remove());
    markers.length=0;
    polyline.remove();
    polyline.setLatLngs(markers.map((item) => item.getLatLng()));
  };
}

function onRadiusChanged() {
  Circle.setRadius(frm.siteRadius.value * 1000);
}

//функция транслитерации
function rus_to_latin(str) {
  let ru = {
    а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e", ж:"j", з:"z", и:"i", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f", х:"h", ц:"c", ч:"ch", ш:"sh", щ:"shch", ы:"y", э:"e", ю:"yu", я:"ya"
    },
    n_str = [];

  str = str.replace(/[ъь]+/g, "").replace(/й/g, "i");

  for (let i = 0; i < str.length; ++i) {
    n_str.push(
      ru[str[i]] ||
        (ru[str[i].toLowerCase()] == undefined && str[i]) ||
        ru[str[i].toLowerCase()].toUpperCase()
    );
  }

  return n_str.join("");
}

//Обработчик событий изменения радиуса и места
{
if (frm.siteRadius.addEventListener) {
  frm.siteRadius.addEventListener("change", onRadiusChanged, false);
} else {
  frm.siteRadius.attachEvent("onchange", onRadiusChanged, false);
}

if (frm.sitePlace.addEventListener) {
  frm.sitePlace.addEventListener("change", onSelectChanged, false);
} else {
  frm.sitePlace.attachEvent("onchange", onSelectChanged, false);
}
}

function latLngToDDMM(latLng) {
  let strLat = Math.abs(latLng.lat).toString(),
    DDlat = strLat.slice(0, strLat.indexOf(".", 0)),
    mmlat =
      (strLat.slice(strLat.indexOf(".", 0) + 1) /
        10 ** strLat.slice(strLat.indexOf(".", 0) + 1).length) *
      60,
    strLng = Math.abs(latLng.lng).toString(),
    DDlng = strLng.slice(0, strLng.indexOf(".", 0)),
    mmlng =
      (strLng.slice(strLng.indexOf(".", 0) + 1) /
        10 ** strLng.slice(strLng.indexOf(".", 0) + 1).length) *
      60;
  DDlat = DDlat.length == 1 ? "0" + DDlat : DDlat;
  DDlng =
    DDlng.length == 1 ? "00" + DDlng : DDlng.length == 2 ? "0" + DDlng : DDlng;
  mmlat =
    Math.round(mmlat).toString().length == 1
      ? "0" + Math.round(mmlat).toString()
      : Math.round(mmlat);
  mmlng =
    Math.round(mmlng).toString().length == 1
      ? "0" + Math.round(mmlng).toString()
      : Math.round(mmlng);
  return DDlat + mmlat + "N" + DDlng + mmlng + "E";
}

function addCircle() {
  Circle.remove();
  polyline.remove();
  markers.map((item) => item.remove());

  if (frm.sitePlace.value !== "" && frm.sitePlace.value !== "XC") {
    Circle.setLatLng(DMStoLatLng(siteCoords[frm.sitePlace.value]));
    Circle.setRadius(frm.siteRadius.value * 1000);
    Circle.addTo(mymap);
    mymap.flyTo(DMStoLatLng(siteCoords[frm.sitePlace.value]), 12);
    Route[0] = latLngToDDMM(Circle.getLatLng());
  } else {
    polyline.addTo(mymap);
    markers.map((item) => item.addTo(mymap));
    if (markers.length != 0) mymap.setView(markers[0].getLatLng());
  }
}
//----------------------------Работаем с маршрутом-------------------------

function DMtoLatLng(DM) {
  let DDlat = +DM[0].slice(0, 2),
    MMlat = +DM[0].slice(2, 4),
    DDlng = +DM[1].slice(0, 3),
    MMlng = +DM[1].slice(3, 5);
  return [DDlat + MMlat / 60, DDlng + MMlng / 60];
}

function routeModification() {
  //устанавливаем координаты в целые DD MM в соответствии с требованиями диспетчеров и удаляем одинаковые точки
  if (markers.length > 0) {
    for (let p = 1; p < markers.length; p++) {
      if (markers[p].options.coord == markers[p - 1].options.coord) {
        markers[p].remove();
        markers.splice(p, 1);
      }
    }
    markers.forEach(function (item, index) {
      item.setLatLng(
        DMtoLatLng([
          item.options.coord.slice(0, item.options.coord.indexOf("N", 0)),
          item.options.coord.slice(
            item.options.coord.indexOf("N", 0) + 1,
            item.options.coord.length - 1
          )
        ])
      );
    });
    polyline.setLatLngs(markers.map((item) => item.getLatLng()));
  }
}

document.querySelector('#viewPDF').addEventListener('click', CreatePDF);

// блок проверок глобально объявиьть объект form, и в дальнейшем использовать его свойства
function CheckFill() {
  let msg = '';
  for (let key in frm) {
    if (frm[key].value == '') {
      msg += (frm[key].placeholder||frm[key].dataset.desc) + ', ';
    }
  }
  if (msg.length == 0) {
    return true;
  } else {
    alert('Не заполнены поля:\n' + msg);
    return false;
  }
}

// блок построения бланка 
function CreatePDF() {
  
  var doc = new jsPDF();
  const dt = new Date,
        dateCreating = dt.getFullYear()%100 + 
          (dt.getMonth()+1 < 10 ? '0'+(dt.getMonth()+1) : (dt.getMonth()+1).toString()) + 
          (dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate().toString()) + '/' + 
          (dt.getUTCHours() < 10 ? '0' + dt.getUTCHours() : dt.getUTCHours().toString()) + 
          (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes().toString()),
        originator =  rus_to_latin(frm.lastName.value),
        docName = `FPLN-${originator}-${dt.getFullYear()}.${(dt.getMonth()+1 < 10 ? '0'+(dt.getMonth()+1) : (dt.getMonth()+1).toString())}.${(dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate().toString())}.pdf`;
  
  sDateTime.setHours(frm.sTimeControl.value.slice(0, 2));
  sDateTime.setMinutes(frm.sTimeControl.value.slice(3));
  eDateTime.setHours(frm.eTimeControl.value.slice(0, 2));
  eDateTime.setMinutes(frm.eTimeControl.value.slice(3));
  if (sDateTime.getTime() > eDateTime.getTime()) {
    alert("Время начала позднее времени окончания. Исправь время!");
  };

  const departure = `ZZZZ${("0" + sDateTime.getUTCHours()).slice(-2)}${("0" + sDateTime.getMinutes()).slice(-2)}`,
        destination = `ZZZZ${convertMS(eDateTime.getTime() - sDateTime.getTime())}`;
  //проверяем на заполненность маршрута
  if (markers.length == 0 && Route[0] == '') return alert("Маршрут не содержит точек!");
  //модифицируем маршрут к требованиям Диспетчеров (указываем координаты с точностью до целых минут)
  routeModification();
  //собираем текстовый маршрут
  XCRoute = markers.map((item) => item.options.coord).join(" ");
  if (markers.length != 0) {
    DEP = markers[0].options.coord;
    DEST = markers[markers.length - 1].options.coord;
  };
  let Route1=Route2=Route3=Route4='';
  if (XCRoute.length < 84) {
    Route1 = XCRoute.slice(0,83);
  }else if (XCRoute.length > 83 && XCRoute.length < 168) {
    Route2 = XCRoute.slice(84,167);
    Route1 = XCRoute.slice(0,83);
  }else if (XCRoute.length > 167 && XCRoute.length < 252) {
    Route3 = XCRoute.slice(168,251);
    Route2 = XCRoute.slice(84,167);
    Route1 = XCRoute.slice(0,83);
  }else if (XCRoute.length > 251 && XCRoute.length < 325) {
    Route4 = XCRoute.slice(252,324);
    Route3 = XCRoute.slice(168,251);
    Route2 = XCRoute.slice(84,167);
    Route1 = XCRoute.slice(0,83);
  } else { 
    alert('Маршрут содержит слишком много точек!');
    return;
  };

  let FLIGHTTYPE = '',
      otherInfo1 = otherInfo2 = otherInfo3 = otherInfo4 = '';
  
  if (frm.sitePlace.value == "XC") {
    FLIGHTTYPE = `Полёт по маршруту, с отклонением от траектории на 500 м в обе стороны`
  } else if (frm.sitePlace.value !== "XC" && frm.sitePlace.value !== "") {
    FLIGHTTYPE = `${Route[0]} полёты над точкой, радиусом ${frm.siteRadius.value} км.`;
    DEP = Route[0];
    DEST = Route[0];
    Route1 = Route[0];
  }

  //заполняем графу другая информация
  let DOF = new Date(Date.parse(frm.dateControl.value));
  otherInfo1 =
    "STS/23 EET/UNTT0001 DOF/" +
    ("" + DOF.getFullYear()).slice(-2) +
    ("0" + (DOF.getMonth() + 1)).slice(-2) +
    ("0" + DOF.getDate()).slice(-2) +
    " TYP/" + frm.quant.value + "PARAPLAN DEP/" + DEP + " DEST/" + DEST;

  otherInfo2 = `OPR/${frm.lastName.value} ${frm.firstName.value} ${frm.fatherName.value}`;
  otherInfo3 = " RMK/" + FLIGHTTYPE +", до высоты " + frm.siteHeight.value + " м";
  otherInfo4 = "ФИО/" + frm.lastName.value + " " + frm.firstName.value + " " + frm.fatherName.value + " тел/" + frm.phone.value;

    //активируем кнопку скачать ФПЛ и запускаем обработчик событий по нажатию
  document.querySelector('#downloadPDF').classList.remove('disable');
  document.querySelector('#downloadPDF').addEventListener('click', function() {
    doc.save(docName);
  });

  doc.addFont("fonts/PTSans-Regular.ttf", "PTSans", "normal");
  doc.setFont("PTSans"); 
  doc.setFontSize(10);
  doc.text("ПРЕДСТАВЛЕННЫЙ ПЛАН ПОЛЁТА ВОЗДУШНОГО СУДНА", 64, 14.5);
  doc.text("(FPL)", 110, 19);
  doc.text("Срочность", 20, 30);
  doc.text("Адресат", 51, 25);
  doc.text("<<=", 20, 35);
  doc.text("<<=", 180, 45);
  doc.text("Дата и время представления", 20, 58);
  doc.text(dateCreating,21,66);//DATE-CREATING
  doc.text("Отправитель", 110, 58);
  doc.text(originator,101,66);//ORIGINATOR
  doc.text("(", 15, 66);
  doc.text("<<=", 180, 66);
  doc.text("3 Тип сообщения", 20, 75);
  doc.text("FPL",21,86);
  doc.text("7 Опознавательный индекс \n воздушного судна", 55, 75);
  doc.text("ZZZZ",56,86);
  doc.text("8 Правила полётов \n и тип полёта", 130, 75);
  doc.text("VG",132,86);
  doc.text("(", 15, 86);
  doc.text("-", 50, 86);
  doc.text("-", 122, 86);
  doc.text("<<=", 180, 86);
  doc.text("9 Количество, тип воздушных судов, \n категория турбу лентного следа", 20, 95);
  doc.text("ZZZZ",21,106);
  doc.text("10 Оборудование \nи возможности", 110, 95);
  doc.text("N/N",111,106);
  doc.text("-", 15, 106);
  doc.text("-", 105, 106);
  doc.text("<<=", 180, 106);
  doc.text("13 Аэродром и время вылета", 20, 115);
  doc.text(departure,21,126);//DEPARTURE
  doc.text("-", 15, 126);
  doc.text("15 Маршрут", 20, 135);
  doc.text("-", 15, 146);
  doc.text(`ZZZZVFR ${Route1}`, 21, 146);
  doc.text(`${Route2}`, 21, 156);
  doc.text(`${Route3}`, 21, 166);
  doc.text(`${Route4}`, 21, 176);
  doc.text("<<=", 180, 176);
  doc.text("16 Аэродром назначения и общее расчётное истекшее время \nдо посадки, запасной(ые) аэродромы пункта назначения", 20, 185);
  doc.text("-", 15, 196);
  doc.text(destination, 21, 196);
  doc.text("18 Прочая информация", 20, 205);
  doc.text("-", 15, 216);
  doc.text(otherInfo1, 21, 216);
  doc.text(otherInfo2, 21, 226);
  doc.text(otherInfo3, 21, 236);
  doc.text(otherInfo4, 21, 246);
  doc.text(") <<=", 179, 246);

  doc.rect(10,10,190,276);
  doc.line(10,20,200,20,'F');
  doc.line(50,30,200,30,'F');
  doc.line(50,40,200,40,'F');
  doc.line(50,50,135,50,'F');
  doc.line(50,20,50,50,'F'); 
  doc.line(135,40,135,50,'F');
  doc.rect(20,60,70,10);
  doc.rect(100,60,40,10);
  doc.rect(20,80,25,10);
  doc.rect(55,80,60,10);
  doc.rect(130,80,40,10);
  doc.rect(20,100,80,10);
  doc.rect(110,100,60,10);
  doc.rect(20,120,80,10);
  doc.line(20,140,200,140,'F');
  doc.line(20,150,200,150,'F');
  doc.line(20,160,200,160,'F');
  doc.line(20,170,200,170,'F');
  doc.line(20,180,170,180,'F');
  doc.line(20,140,20,180,'F');
  doc.line(170,170,170,180,'F');
  doc.rect(20,190,80,10);
  doc.line(20,210,200,210,'F');
  doc.line(20,220,200,220,'F');
  doc.line(20,230,200,230,'F');
  doc.line(20,240,200,240,'F');
  doc.line(20,250,170,250,'F');
  doc.line(20,210,20,250,'F');
  doc.line(170,240,170,250,'F');
  doc.output('dataurlnewwindow');//открываем doc в новой вкладке
};

