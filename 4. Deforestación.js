// Clasiicacion Random Forest Deforestacion
/*
edDefo: Poligo para eliminar deforestacion incorrecta
edQuema: Poligo para eliminar deforestacion incorrecta por quemas, tambin se puede usar "edDefo"
defo_Muestras: Poligono para capturar muestras de deforestacion
noDefo_Muestras: Poligos para captrar muestras de no deforestacion
addDefo: agregar poligonos de deforestacion
mascara_nodefo: Mascapra para asignar la clase no deforestado
defo: Mascara para asignar la clase deforestacion
*/

var YEAR = 2019
var VERSION = 'v2';

var AOI = ee.FeatureCollection('projects/ee-mrv-char/assets/CHAR_buffer').geometry();

var ASSET_FOLDER = 'projects/ee-mrvbolivia2/assets/DEFO_AR/';
var years = [2018,2019,2020,2021,2022,2023,2024,2025];

function defoId(y){
  return ASSET_FOLDER + 'Clasificacion_RF_' + y + '_' + VERSION;
}

var visDefo = {min: 0, max: 1, palette: ['#cecbbc', '#ff2d2d']};

var change = ee.Image("users/armandorodriguezmontellano/HLS/Char_HLS_" + YEAR);

var bandasMin = ee.Image.constant([-0.05,-0.05,-0.05, 0.0, 0.0, 0.0]);
var bandasMax = ee.Image.constant([0.4, 0.5, 0.5, 0.8, 0.6, 0.5]);

var changeNormalized = change
  .subtract(bandasMin)
  .divide(bandasMax.subtract(bandasMin))
  .multiply(255)
  .clamp(0, 255)
  .toUint8()
  .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2'])
  .clip(AOI);

var viz = {
  opacity: 1,
  bands: ['swir2','nir','red'],
  min: 32,
  max: 100,
  gamma: 1
};

var raster = ee.Image(defoId(YEAR)).select('b1').clip(AOI);
var proj = raster.projection();

var maskNoDefoFC = ee.FeatureCollection(mascara_nodefo);
var addDefoFC    = ee.FeatureCollection(defo);

var noDefoRaster = ee.Image(0).byte().paint(maskNoDefoFC, 1).reproject(proj);
var addDefoRaster = ee.Image(0).byte().paint(addDefoFC, 1).reproject(proj);

var after = raster
  .reproject(proj)
  .where(noDefoRaster.eq(1), 0)
  .where(addDefoRaster.eq(1), 1)
  .rename('b1')
  .reproject(proj)
  .clip(AOI);

var pixExpand = 5;
var after_h = after
  .unmask(0)
  .focalMax({radius: pixExpand, units: 'meters', kernelType: 'square'})
  .focalMin({radius: pixExpand, units: 'meters', kernelType: 'square'});

var weights = [[1,2,1],
               [2,3,2],
               [1,2,1]];

var kernel = ee.Kernel.fixed(3,3,weights);

after_h = after_h
  .reduceNeighborhood({
    reducer: ee.Reducer.mode(),
    kernel: kernel
  })
  .reproject(proj)
  .clip(AOI);

Map.addLayer(changeNormalized, viz, 'imagen-' + YEAR, true);

for (var i = years.length - 1; i >= 0; i--) {
  var y = years[i];
  var d = ee.Image(defoId(y)).select('b1').reproject(proj).clip(AOI);
  Map.addLayer(d, visDefo, 'DEFO ' + y, false);
}

Map.addLayer(raster.reproject(proj), visDefo, 'ANTES ' + YEAR, false);
Map.addLayer(after_h.reproject(proj), visDefo, 'DESPUES ' + YEAR, true);
