// Limite de Charagua
// Limite 
var a = ee.FeatureCollection('projects/ee-mrv-char/assets/CHAR')
// Limite con area de influencia 
var b = ee.FeatureCollection("projects/ee-mrv-char/assets/CHAR_buffer")
Map.addLayer(a,{color: 'FF0000'},'Limite Charagua')
Map.addLayer(b,{color: '000000'},'Limite Charagua Buffer')
