// Clasificaion no supervisada para Bosque y No bosque
// Definir grilla a clasificar
// Definir cluster
// Agrupacion de cluster por clase
// Descarga de clasificacion no supervisada

var changex = ee.Image("users/armandorodriguezmontellano/HLS/Char_HLS_2017");
var BolCoin = ee.Image("users/rrcp/Coincidencia_Bosques_Charagua"); 

var FNF = BolCoin
  .where(BolCoin.gte(0).and(BolCoin.lte(3)), 1)
  .where(BolCoin.gt(3).and(BolCoin.lte(6)), 0)
  .rename('FNF')
  .toByte();

var maskFNF = FNF.eq(1);

var vizx = {
  opacity: 1,
  bands: ['swir2','nir','red'],
  min: 0.03355755615234375,
  max: 0.3840377788270786,
  gamma: 1
};

var grid = ee.FeatureCollection('projects/ee-geraldina/assets/grillas_Char_v1');
var maxID = 111;
var currentID = 1;

var N_CLUSTERS = 20;
var TRAIN_PIXELS = 5000;
var SEED = 42;

var EXPORT_FOLDER = 'projects/ee-rafaelmarco711-10/assets/CHAR_NOSUP';


var PALETTE20 = [
  'e6194b','3cb44b','ffe119','4363d8','f58231',
  '911eb4','46f0f0','f032e6','bcf60c','fabebe',
  '008080','e6beff','9a6324','fffac8','800000',
  'aaffc3','808000','ffd8b1','000075','808080'
];

var panel = ui.Panel({style:{position:'top-left', width:'380px', padding:'8px'}});
var legendPanel = ui.Panel({style:{position:'top-right', width:'200px', padding:'8px'}});

var labelID = ui.Label('Grilla: 1', {fontWeight:'bold'});
var labelInfo = ui.Label('');

var inputClusters = ui.Textbox({
  value: '1,3,5,6,8,10,11,14',
  placeholder: 'Ej: 1,3,5'
});

function buildLegend(){
  legendPanel.clear();
  legendPanel.add(ui.Label('KMeans 20 Estratos', {fontWeight:'bold'}));

  for (var i = 0; i < 20; i += 2){
    var row = ui.Panel({
      layout: ui.Panel.Layout.Flow('horizontal'),
      style:{margin:'0 0 2px 0'}
    });

    row.add(ui.Label('', {
      backgroundColor:'#'+PALETTE20[i],
      padding:'6px',
      margin:'0 4px 0 0'
    }));
    row.add(ui.Label(String(i), {margin:'0 10px 0 0'}));

    if (i + 1 < 20){
      row.add(ui.Label('', {
        backgroundColor:'#'+PALETTE20[i+1],
        padding:'6px',
        margin:'0 4px 0 0'
      }));
      row.add(ui.Label(String(i+1)));
    }

    legendPanel.add(row);
  }
}

function parseClusterList(str){
  var clean = (str || '').replace(/\s+/g,'');
  if (clean.length === 0) return [];
  var parts = clean.split(',');
  var out = [];
  for (var i=0;i<parts.length;i++){
    var v = parseInt(parts[i],10);
    if (!isNaN(v) && v>=0 && v<=19) out.push(v);
  }
  return out;
}

function getGrid(){
  var sel = grid.filter(ee.Filter.eq('ID_GRILLA', currentID));
  return {fc: sel, geom: sel.geometry()};
}

function computeAndRender(){
  Map.layers().reset();

  var g = getGrid();
  var geom = g.geom;

  Map.centerObject(g.fc, 11);

  Map.addLayer(
    g.fc.style({color:'yellow', fillColor:'00000000', width:3}),
    {},
    'Grilla'
  );

  Map.addLayer(changex.clip(geom), vizx, 'HLS original', false);

  var imgMasked = changex.updateMask(maskFNF).clip(geom);
  Map.addLayer(imgMasked, vizx, 'imagen-2017xxx', true);

  var img = imgMasked.select(['blue','green','red','nir','swir1','swir2']);
  var scale = img.projection().nominalScale();

  var training = img.sample({
    region: geom,
    scale: scale,
    numPixels: TRAIN_PIXELS,
    seed: SEED,
    geometries: false,
    tileScale: 4
  });

  var clusterer = ee.Clusterer.wekaKMeans(N_CLUSTERS).train(training);
  var clusters = img.cluster(clusterer).rename('cluster');

  Map.addLayer(
    clusters,
    {min:0, max:19, palette:PALETTE20},
    'KMeans 20 estratos',
    true
  );

  var chosen = parseClusterList(inputClusters.getValue());

  var from = [];
  var to = [];
  for (var i=0;i<chosen.length;i++){
    from.push(chosen[i]);
    to.push(1);
  }

  var bin = clusters.remap(from, to, 0).rename('bin');

  Map.addLayer(
    bin,
    {min:0, max:1, palette:['000000','ff0000']},
    'BIN 0/1',
    false
  );

  labelInfo.setValue('Grilla ' + currentID + ' | class1: [' + chosen.join(',') + ']');

  return {bin: bin, geom: geom, scale: scale};
}

function exportCurrentGrid(){
  var result = computeAndRender();

  var idFormatted = ('000' + currentID).slice(-3);
  var assetName = 'BIN_HLS_2017_Grilla_' + idFormatted;

  Export.image.toAsset({
    image: result.bin.toByte().set({
      ID_GRILLA: currentID,
      year: 2017,
      n_clusters: N_CLUSTERS,
      class1_list: inputClusters.getValue(),
      mask_source: 'FNF_from_BolCoin'
    }).clip(result.geom),
    description: assetName,
    assetId: EXPORT_FOLDER + '/' + assetName,
    region: result.geom,
    scale: result.scale,
    maxPixels: 1e13
  });

  print('Exportando:', assetName);
}

panel.add(ui.Label('KMeans sobre imagen-2017xxx (HLS masked by FNF)', {fontWeight:'bold', fontSize:'14px'}));
panel.add(labelID);

panel.add(ui.Panel([
  ui.Button('⬅ Anterior', function(){
    if (currentID > 1){
      currentID--;
      labelID.setValue('Grilla: '+currentID);
      computeAndRender();
    }
  }),
  ui.Button('Siguiente ➡', function(){
    if (currentID < maxID){
      currentID++;
      labelID.setValue('Grilla: '+currentID);
      computeAndRender();
    }
  })
], ui.Panel.Layout.Flow('horizontal')));

panel.add(ui.Label('Ir a grilla (1-111):'));
var inputGrid = ui.Textbox({placeholder:'Ej: 72'});
panel.add(inputGrid);

panel.add(ui.Button('Ir', function(){
  var v = parseInt(inputGrid.getValue(),10);
  if (v>=1 && v<=maxID){
    currentID = v;
    labelID.setValue('Grilla: '+currentID);
    computeAndRender();
  }
}));

panel.add(ui.Label('Estratos (0–19) que serán Clase 1:'));
panel.add(inputClusters);

panel.add(ui.Button('Aplicar agrupación', function(){
  computeAndRender();
}));

panel.add(ui.Button('💾 Exportar BIN 0/1 de esta grilla', function(){
  exportCurrentGrid();
}));

panel.add(labelInfo);

Map.add(panel);
Map.add(legendPanel);

buildLegend();
computeAndRender();
