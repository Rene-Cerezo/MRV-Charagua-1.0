/* ==================================================================================================================================
                          CLASIFICACIÓN DE DEFORESTACIÓN
Descripción:
 
 Este script genera permite realizar la clasificación supervisada de deforestación a partir de 
 Random Forest basado en muestras (poligonos) y bandas espectrales de imagenes HLS. El resulta 
 general brinda un mapa de deforestación y no deforestación, considerando cambio como deforestación.
 
Flujo de procesamiento:

   1. Definir año de interes (linea 30)
   2. Captura de muestras de deforestación (defo) y no deforestación (noDefo) a partir de las geometrias e interpretación visual.
   3. Agregar geometrias que se utilizan para clasificar de forma manual deforestación(addDefo) y no deforestación (edDefo) 
   4. Ejecutar clasificaciones.
   5. Definir folder para descarga de resultados
   
 Datos de Entrada:
   MapBiomas Bolivia Collection 3
   Harmonized Landsat and Sentinel-2

 Resolución:            30 metros 
 Sistema de Referencia: EPSG:4326
 Fecha de creación:     Marzo 2026
 Autor:                 Equipo MRV - Bolivia
 ================================================================================================*/
 
var year = 2019
var MaskEdit = edDefo.reduceToImage({
  properties: ['class'],
  reducer: ee.Reducer.first()
});

var MaskAddDefo = addDefo.reduceToImage({
  properties: ['class'],
  reducer: ee.Reducer.first()
});
var nameFolder = 'char_cnn'
var char = ee.FeatureCollection('projects/ee-mrv-char/assets/CHAR')
var mapbiomas = ee.Image('projects/mapbiomas-public/assets/bolivia/lulc/collection3/mapbiomas_bolivia_collection3_integration_v1');
var lulc2017 = mapbiomas.select('classification_2017');
var mascaraBosque = lulc2017.eq(13).or(lulc2017.eq(23)).or(lulc2017.eq(68)).or(lulc2017.eq(33));
var mascaraBosqueBinaria = mascaraBosque.selfMask();
var change = ee.Image("users/armandorodriguezmontellano/HLS/Char_HLS_"+year);
var bandasMin = ee.Image.constant([ -0.05,-0.05, -0.05, 0.0, 0.0, 0.0] );
var bandasMax = ee.Image.constant([0.4, 0.5, 0.5, 0.8, 0.6, 0.5 ]);
var changeNormalized = change
  .subtract(bandasMin)
  .divide(bandasMax.subtract(bandasMin))
  .multiply(255)
  .clamp(0, 255)
  .toUint8()
  .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);

var bandNames = changeNormalized.bandNames();
var deltaBandNames = bandNames.map(function(name) {
  return ee.String('').cat(name);
});

var trainingPolygons = defo.merge(noDefo);
var imagenParaClasificar = change
  
  
var training = imagenParaClasificar.sampleRegions({
    collection: trainingPolygons,
    properties: ['class'],
    scale: 30,
    tileScale: 16
  });
  
  print('Muestras de entrenamiento:', training.size());

var classifier = ee.Classifier.smileRandomForest({
    numberOfTrees: 500,          
    variablesPerSplit: null,      
    minLeafPopulation: 1,         
    bagFraction: 0.632,           
    maxNodes: null,               
    seed: 42                      
  });

var trained = classifier.train({
    features: training,
    classProperty: 'class',
    inputProperties: imagenParaClasificar.bandNames()
  });

  
var clasificacion = imagenParaClasificar.classify(trained);
  
  clasificacion = clasificacion.select(['classification'], ['cambio_clase']);
  clasificacion = clasificacion.multiply(MaskEdit.unmask().eq(0));
  clasificacion = clasificacion.multiply(mascaraBosqueBinaria.unmask().eq(0));
  clasificacion = clasificacion.where(MaskAddDefo.eq(1),1)
  var withRandom = training.randomColumn('random', 42);
  var trainingSet = withRandom.filter(ee.Filter.lt('random', 0.8));
  var validationSet = withRandom.filter(ee.Filter.gte('random', 0.8));
  
  print('Tamaño set entrenamiento:', trainingSet.size());
  print('Tamaño set validación:', validationSet.size());
  

  var classifierValidation = ee.Classifier.smileRandomForest({
    numberOfTrees: 500,
    variablesPerSplit: null,
    minLeafPopulation: 1,
    bagFraction: 0.632,
    maxNodes: null,
    seed: 42
  }).train({
    features: trainingSet,
    classProperty: 'class',
    inputProperties: imagenParaClasificar.bandNames()
  });
  
  var validated = validationSet.classify(classifierValidation);
  var confusionMatrix = validated.errorMatrix('class', 'classification');
  var importance = trained.explain();
  
var MMU_in_ha = 1
var pixel_size = imagenParaClasificar.projection().nominalScale()
var MMU_in_pixel = ee.Number(MMU_in_ha)
  .divide(pixel_size.pow(2).divide(10000)
).floor()

function applyMMU(image, mmu){
  
  // turn band into 0s and 1s
  var band_0 = image.unmask(0).gt(0)
  // create mask of pixels to retain
  var mask = band_0.connectedPixelCount(ee.Number(mmu).add(2)).gte(ee.Number(mmu));
  // return masked image
  return image.updateMask(mask);
}
var clasificacion = applyMMU(clasificacion, MMU_in_pixel).selfMask()
var pixExpand = 5
var clasificacion = clasificacion
    .focalMax({
      'radius':pixExpand,
      'units': 'meters',
      'kernelType': 'square'})
    .focalMin({
      'radius':pixExpand,
      'units': 'meters',
      'kernelType': 'square'});
var weights = [[1,2,1],
               [2,3,2],
               [1,2,1]];

var kernel = ee.Kernel.fixed(3,3,weights);
var clasificacion = clasificacion.unmask().reduceNeighborhood({
  reducer: ee.Reducer.mode(),
  kernel: kernel
}).reproject('EPSG:4326', null, 30); 
clasificacion=clasificacion.clip(char)

  var exportParamsClasificacion = {
    image: clasificacion.toUint8(),
    description: 'Clasificacion_RF_'+year,
    folder:nameFolder,
    fileNamePrefix: 'Clasificacion_RF_'+year,
    scale: 30,
    region: change.geometry().bounds(),
    maxPixels: 1e13,
    crs: 'EPSG:4326',
    fileFormat: 'GeoTIFF'
  };
  
  Export.image.toDrive(exportParamsClasificacion);
  var vizDelta = {"opacity":1,"bands":["delta_swir2","delta_nir","delta_red"],"min":0,"max":255,"gamma":1};
  var viz = {"opacity":1,"bands":["swir2","nir","red"],"min":32,"max":100,"gamma":1};
  
  Map.addLayer(changeNormalized,viz,'imagen-'+year,true)
  Map.addLayer(clasificacion, {min: 0, max: 1, palette: ['green', 'red']},  'Clasificación (0=No Cambio, 1=Cambio)');

