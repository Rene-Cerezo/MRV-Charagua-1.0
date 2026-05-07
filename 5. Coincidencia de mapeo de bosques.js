// 1. ÁREA DE INTERÉS Y PARÁMETROS
var region = ee.FeatureCollection('users/renecrzprd/AOI_2023/Limite_Charagua_Mayo_2km');

// Parámetros de visualización faltantes
var visBosque = {min: 0, max: 1, palette: ['black', 'green']};
var visSuma = {min: 0, max: 6, palette: ['white', 'ffffbf', 'fee08b', 'd73027', 'd9ef8b', '91cf60', '1a9850']};

// 2. CARGA DE COLECCIONES

var mapbiomas = ee.Image("projects/mapbiomas-public/assets/bolivia/lulc/collection3/mapbiomas_bolivia_collection3_integration_v1").select("classification_2017")
var hansen = ee.Image('UMD/hansen/global_forest_change_2024_v1_12').clip(region);// es la ultima version
var glcluc = ee.Image('projects/glad/GLCLU2020/v2/LCLUC_2015');// esta mas cerca al 2015
var esa2020 = ee.ImageCollection('ESA/WorldCover/v100').first();// no hay mas actualizaciones
var jaxa2017 = ee.ImageCollection('JAXA/ALOS/PALSAR/YEARLY/FNF').filterDate('2017-01-01', '2017-12-31').mean();
var esri_col = ee.ImageCollection([ 
  'projects/project-mrv3/assets/Charagua_2026/21K_20170101-20180101',
  'projects/project-mrv3/assets/Charagua_2026/20K_20170101-20180101'
].map(function(id){ return ee.Image(id) }));
var esri_2017 = esri_col.mean().clip(region);

// 3. PROCESAMIENTO: RECLASIFICACIÓN A BINARIO (Bosque = 1, Otro = 0)
// Mapbiomas , bosque 2017 la clase 3 o 6
var b_mapbioma = mapbiomas.eq(3).or(mapbiomas.eq(6))
                  .clip(region)
                  .rename("classification_2017");

// UMD Hansen (Bosque 2000 - Pérdida hasta 2017)
var treeCoverUMD = hansen.select(['treecover2000']).gte(30);
var lossImage2017 = hansen.select(['lossyear']).unmask(0).clip(region);

var lossImage2017_2 = lossImage2017                
                    .where(lossImage2017.gt(0).and(lossImage2017.lte(17)), 1)
                    .where(lossImage2017.gt(17).and(lossImage2017.lte(24)), 0)

var b_umd = treeCoverUMD.subtract(lossImage2017_2)

// GLCLUC (Simplificación lógica de rangos)
var b_glcluc = glcluc.gte(27).and(glcluc.lte(48))
              .or(glcluc.gte(124).and(glcluc.lte(148)))
              .unmask(0).clip(region);

// ESA WorldCover (Clase 10 es Árboles)
var b_esa = esa2020.eq(10).unmask(0).clip(region);

// JAXA (Clase 1 es Bosque)
var b_jaxa = jaxa2017.select('fnf').eq(1).unmask(0).clip(region);

// ESRI (Clase 2 es Árboles)
var b_esri = esri_2017.eq(2).unmask(0);

// 4. ANÁLISIS DE COINCIDENCIA
// Sumamos todos para ver cuántos modelos están de acuerdo en un píxel
var coincidencia = ee.Image(0)
    .add(b_mapbioma)
    .add(b_umd)
    .add(b_glcluc)
    .add(b_esa)
    .add(b_jaxa)
    .add(b_esri)
    .uint8();

// 5. VISUALIZACIÓN EN EL MAPA
Map.addLayer(b_mapbioma, visBosque, 'Bosque Mapbioma 2017', false);
Map.addLayer(b_umd, visBosque, 'Bosque UMD 2017', false);
Map.addLayer(b_glcluc, visBosque, 'Bosque LCLUC 2015', false);
Map.addLayer(b_esa, visBosque, 'Bosque ESA 2021', false);
Map.addLayer(b_jaxa, visBosque, 'Bosque JAXA 2017', false);
Map.addLayer(b_esri, visBosque, 'Bosque ESRI 2017', false);

// Capa principal de concordancia
Map.addLayer(coincidencia, visSuma, 'Mapa de Coincidencia (0-6)');

// 6. EXPORTACIÓN
Export.image.toDrive({
  image: coincidencia,
  description: 'DRIVE_Coincidencia_Bosques_Charagua ',
  scale: 10, // Nota: Algunos insumos son de 30m, 10m generará archivos grandes
  crs: 'EPSG:4326',
  region: region.geometry(),
  maxPixels: 1e12
});
Export.image.toAsset({
  image: coincidencia,
  description: 'ASSET_Coincidencia_Bosques_Charagua',
  assetId: 'users/rrcp/Coincidencia_Bosques_Charagua', // Verifica que la ruta sea correcta
  scale: 30, 
  crs: 'EPSG:4326',
  region: region.geometry(),
  maxPixels: 1e12
});
