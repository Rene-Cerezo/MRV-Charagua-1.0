// Construccion de Mosaico
var year =2025 // Definr año
var roi = ee.FeatureCollection("projects/ee-mrv-char/assets/CHAR_buffer"); // definir area de estudi
var crs = "EPSG:4326";
var exportPathRoot= "users/armandorodriguezmontellano/HLS";
var description = "Char_HLS_"+year;
var scale = 30;
var bands = ['blue','green','red','nir','swir1','swir2']; // bandas para descarga
var vizParams      = {bands: ['red', 'green', 'blue'], min: 0, max: 0.3, gamma: 1.2};
var vizParamsFalse = {bands: ['swir2', 'nir', 'red'],  min: 0, max: 0.4, gamma: 1.2};
// Bits de la banda Fmask de HLS v2.0
// 0: Cirrus, 1: Cloud, 2: Adjacent Cloud, 3: Cloud Shadow, 4: Snow/Ice, 5: Water
var CLOUD_BIT = 1 << 1;
var ADJ_CLOUD_BIT = 1 << 2;
var SHADOW_BIT = 1 << 3;
var CIRRUS_BIT = 1 << 0; 
// Enmascaramiento de nubes
function maskAndScale(image) {
  var fmask = image.select('c');

  var mask = fmask.bitwiseAnd(CLOUD_BIT).eq(0)
    .and(fmask.bitwiseAnd(SHADOW_BIT).eq(0))
    .and(fmask.bitwiseAnd(ADJ_CLOUD_BIT).eq(0))
    .and(fmask.bitwiseAnd(CIRRUS_BIT).eq(0));


var maskRigurosa = mask.focalMin({radius: 2, kernelType: 'circle', units: 'pixels', iterations: 2});

  
  return image.updateMask(maskRigurosa)
              .copyProperties(image, ['system:time_start']);
}


function prepL30(image) {

  var bands = image.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'Fmask'],
                           ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'Fmask']);
  return maskAndScale(bands);
}

function prepS30(image) {

  var bands = image.select(['B2', 'B3', 'B4', 'B8A', 'B11', 'B12', 'Fmask'],
                           ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'Fmask']);
  return maskAndScale(bands);
}


function addInvNBR(image) {
  var nbr = image.normalizedDifference(['nir', 'swir2']).rename('NBR');
  var invNbr = nbr.multiply(-1).rename('invNBR'); 
  return image.addBands([nbr, invNbr]);
}

var startDate = year +'-04-01';
var endDate   = year + '-11-01';


var colL30 = ee.ImageCollection("NASA/HLS/HLSL30/v002").filter(ee.Filter.lte('CLOUD_COVERAGE',60))
    .filterBounds(roi)
    .filterDate(startDate, endDate)
    .map(prepL30);


var colS30 = ee.ImageCollection("NASA/HLS/HLSS30/v002").filter(ee.Filter.lte('CLOUD_COVERAGE',60))
    .filterBounds(roi)
    .filterDate(startDate, endDate)
    .map(prepS30);

var colHLS = colL30.merge(colS30);
var colWithIndices = colHLS.map(addInvNBR);
var finalMosaic = colWithIndices.qualityMosaic('invNBR');

Map.addLayer(finalMosaic.clip(roi), vizParamsFalse, 'HLS Quality Mosaic (InvNBR)');


// Descarga de mosaicos a google cloud
Export.image.toAsset({image:finalMosaic.clip(roi).select(bands), 
                      description:description, 
                      assetId:exportPathRoot +'/'+ description, 
                      region:roi, 
                      scale:scale, 
                      crs:crs, 
                      maxPixels:1e13}); 
