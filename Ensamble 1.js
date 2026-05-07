// ENSAMBLE 1

// Inicialmente se debe descargar los productos de las clasificaiones de deforestacion, bosques, y area quemada
// Las coberturas introducidas cuenta con la postclasificacion
// Revisar el POE que describe en terminos generales la aplicacion de esta metodolgia


//landsatHLS
var vizx = {opacity: 1, bands: ['swir2','nir','red'],min: 0.03355755615234375,max: 0.3840377788270786,gamma: 1};
// AOO
var aoi = ee.FeatureCollection("projects/ee-mrv-char/assets/CHAR_buffer")
//Imagen Landsat HLS
var changerr = ee.Image("users/armandorodriguezmontellano/HLS/Char_HLS_2017");
// Deforestacion corregida René/Rafa (v.4)
var Defo2018_2025 = ee.Image("projects/ee-rrcp/assets/deforestation_year_2018_2025_training_V4")
//Deforestacion 2017
var Def2017 = ee.Image("projects/ee-mrvbolivia1/assets/DEF_CHAR_2017/DEF_2017_MOSAICO")
// Bosque no bosque v.1
var BosqueNoBosque = ee.Image("projects/ee-rafaelmarco711-10/assets/CHARAGUA_BIN_FINAL_2017_v3_EDIT_PATCH_v2")// este es el ultimo q esstan corrigiendo
// vegetacion barbechos y cultivos (rene)
var barbecho = ee.Image("projects/project-mrv3/assets/NoBosque_1")// bosque 1 NoBosque_2 o NoBosque_1
// Bosque no bosque v.2
var BosqueNoBosquev2 = BosqueNoBosque.where(barbecho.eq(1), 1)
// Bosque no bosque v.3 OJO BOSQUE ESTA CON LA CLASE 0 Y DEFO CON LA CLASE 1
// SE ESTA REEMPLAZANDO CON LA VERSION DE BOSQUES V4
var BosqueNoBosquev3 = Bosque_V4.select(["b1"], ["bin"])// tambien se hizo esto de restar defo.where(Def2017.eq(1), 1); Primero se descargo bosque v.3 lque ya tenia ese ajusteluego se reemplanzo como v4
// Deforestacion ajustada (v.4 solo pata el script se dejo con v2 pero es v3)
var Defo2018_2025_v2 = Defo2018_2025.where(BosqueNoBosquev3.eq(1), 0)//cambiar BosqueNoBosque por "BosqueNoBosquev3"
// Area Quemada
var aq = ee.Image("projects/mvr-bolivia/assets/mapbiomas/fuego/burned_area_bolivia_2016_2025")
// Area quemada por años corregida
var aq2018 = aq.select("burned_2018");
var aq2019 = aq.select("burned_2019");
var aq2020 = Quema20_Corregida;
var aq2021 = Quema21_Corregida;
var aq2022 = Quema22_Corregida;
var aq2023 = Quema23_Corregida;
var aq2024 = Quema24_Corregida;
var aq2025 = Quema25_Corregida;
Map.addLayer(BosqueNoBosquev3,null,"xxxx")

// Defo corregida por años
var defo2018 = Defo2018_2025_v2.eq(2018).clip(aoi);
var defo2019 = Defo2018_2025_v2.eq(2019).clip(aoi);
var defo2020 = Defo2018_2025_v2.eq(2020).clip(aoi);
var defo2021 = Defo2018_2025_v2.eq(2021).clip(aoi);
var defo2022 = Defo2018_2025_v2.eq(2022).clip(aoi);
var defo2023 = Defo2018_2025_v2.eq(2023).clip(aoi);
var defo2024 = Defo2018_2025_v2.eq(2024).clip(aoi);
var defo2025 = Defo2018_2025_v2.eq(2025).clip(aoi);
//Bosque corregido por año
var Bo2018 = BosqueNoBosquev3.where(defo2018.eq(1), 1).clip(aoi)
var Bo2019 = Bo2018.where(defo2019.eq(1), 1).clip(aoi)
var Bo2020 = Bo2019.where(defo2020.eq(1), 1).clip(aoi)
var Bo2021 = Bo2020.where(defo2021.eq(1), 1).clip(aoi)
var Bo2022 = Bo2021.where(defo2022.eq(1), 1).clip(aoi)
var Bo2023 = Bo2022.where(defo2023.eq(1), 1).clip(aoi)
var Bo2024 = Bo2023.where(defo2024.eq(1), 1).clip(aoi)
var Bo2025 = Bo2024.where(defo2025.eq(1), 1).clip(aoi)
//Bosque Quemado 0=bosque, 1 = no bosque, 2=bosque quemado
var Bo2018_v2 = Bo2018.where(aq2018.eq(1).and(Bo2018.eq(0)), 2).clip(aoi);
var Bo2019_v2 = Bo2019.where(aq2019.eq(1).and(Bo2019.eq(0)), 2).clip(aoi);
var Bo2020_v2 = Bo2020.where(aq2020.eq(1).and(Bo2020.eq(0)), 2).clip(aoi);
var Bo2021_v2 = Bo2021.where(aq2021.eq(1).and(Bo2021.eq(0)), 2).clip(aoi);
var Bo2022_v2 = Bo2022.where(aq2022.eq(1).and(Bo2022.eq(0)), 2).clip(aoi);
var Bo2023_v2 = Bo2023.where(aq2023.eq(1).and(Bo2023.eq(0)), 2).clip(aoi);
var Bo2024_v2 = Bo2024.where(aq2024.eq(1).and(Bo2024.eq(0)), 2).clip(aoi);
var Bo2025_v2 = Bo2025.where(aq2025.eq(1).and(Bo2025.eq(0)), 2).clip(aoi);
// No bosque
var NonBos18 = Bo2018.where(defo2018.eq(1),2).eq(1).clip(aoi)
var NonBos19 = Bo2019.where(defo2019.eq(1),2).eq(1).clip(aoi)
var NonBos20 = Bo2020.where(defo2020.eq(1),2).eq(1).clip(aoi)
var NonBos21 = Bo2021.where(defo2021.eq(1),2).eq(1).clip(aoi)
var NonBos22 = Bo2022.where(defo2022.eq(1),2).eq(1).clip(aoi)
var NonBos23 = Bo2023.where(defo2023.eq(1),2).eq(1).clip(aoi)
var NonBos24 = Bo2024.where(defo2024.eq(1),2).eq(1).clip(aoi)
var NonBos25 = Bo2025.where(defo2025.eq(1),2).eq(1).clip(aoi)

// -------------------------------------------------------Todo en uno
//var NonBos18_f = NonBos18.where(NonBos18.eq(1),3)
// conviritendo la capa de NOBOSQUE EN VALORES DE 0 Y 4
var Bo2018_v2_f = Bo2018_v2.where(Bo2018_v2.eq(2), 4)
                           .where(Bo2018_v2.neq(2),0)
var Bo2019_v2_f = Bo2019_v2.where(Bo2019_v2.eq(2), 4)
                           .where(Bo2019_v2.neq(2),0)
var Bo2020_v2_f = Bo2020_v2.where(Bo2020_v2.eq(2), 4)
                           .where(Bo2020_v2.neq(2),0)
var Bo2021_v2_f = Bo2021_v2.where(Bo2021_v2.eq(2), 4)
                           .where(Bo2021_v2.neq(2),0)
var Bo2022_v2_f = Bo2022_v2.where(Bo2022_v2.eq(2), 4)
                           .where(Bo2022_v2.neq(2),0)
var Bo2023_v2_f = Bo2023_v2.where(Bo2023_v2.eq(2), 4)
                           .where(Bo2023_v2.neq(2),0)
var Bo2024_v2_f = Bo2024_v2.where(Bo2024_v2.eq(2), 4)
                           .where(Bo2024_v2.neq(2),0)
var Bo2025_v2_f = Bo2025_v2.where(Bo2025_v2.eq(2), 4)
                           .where(Bo2025_v2.neq(2),0) 
// NO BOSQUE CONVERTIDO EN VALORES DE 0 A 3 
var NonBos18_f = NonBos18.where(NonBos18.eq(1),3)
var NonBos19_f = NonBos19.where(NonBos19.eq(1),3)
var NonBos20_f = NonBos20.where(NonBos20.eq(1),3)
var NonBos21_f = NonBos21.where(NonBos21.eq(1),3)
var NonBos22_f = NonBos22.where(NonBos22.eq(1),3)
var NonBos23_f = NonBos23.where(NonBos23.eq(1),3)
var NonBos24_f = NonBos24.where(NonBos24.eq(1),3)
var NonBos25_f = NonBos25.where(NonBos25.eq(1),3)
// DEFORESTACION CONVERTIDO EN VALORES DE 1 A 2 
var defo2018_f = defo2018.where(defo2018.eq(1),2)
var defo2019_f = defo2019.where(defo2019.eq(1),2)
var defo2020_f = defo2020.where(defo2020.eq(1),2)
var defo2021_f = defo2021.where(defo2021.eq(1),2)
var defo2022_f = defo2022.where(defo2022.eq(1),2)
var defo2023_f = defo2023.where(defo2023.eq(1),2)
var defo2024_f = defo2024.where(defo2024.eq(1),2)
var defo2025_f = defo2025.where(defo2025.eq(1),2)
// BOSQUES CONVERTIDO EN VALORES DE 0 A 1 
var Bo2017_f = BosqueNoBosquev3.where(BosqueNoBosquev3.eq(0),1)
                               .where(BosqueNoBosquev3.neq(0),0)
var Bo2018_f = Bo2018.where(Bo2018.eq(0),1).where(Bo2018.neq(0),0)
var Bo2019_f = Bo2019.where(Bo2019.eq(0),1).where(Bo2019.neq(0),0)
var Bo2020_f = Bo2020.where(Bo2020.eq(0),1).where(Bo2020.neq(0),0)
var Bo2021_f = Bo2021.where(Bo2021.eq(0),1).where(Bo2021.neq(0),0)
var Bo2022_f = Bo2022.where(Bo2022.eq(0),1).where(Bo2022.neq(0),0)
var Bo2023_f = Bo2023.where(Bo2023.eq(0),1).where(Bo2023.neq(0),0)
var Bo2024_f = Bo2024.where(Bo2024.eq(0),1).where(Bo2024.neq(0),0)
var Bo2025_f = Bo2025.where(Bo2025.eq(0),1).where(Bo2025.neq(0),0)

// 1=bosque, 2 =deforestacion, 3 = no bosque, 5=bosque quemado
var union2018 = Bo2018_f.add(defo2018_f).add(NonBos18_f).add(Bo2018_v2_f)
var union2019 = Bo2019_f.add(defo2019_f).add(NonBos19_f).add(Bo2019_v2_f)
var union2020 = Bo2020_f.add(defo2020_f).add(NonBos20_f).add(Bo2020_v2_f)
var union2021 = Bo2021_f.add(defo2021_f).add(NonBos21_f).add(Bo2021_v2_f)
var union2022 = Bo2022_f.add(defo2022_f).add(NonBos22_f).add(Bo2022_v2_f)
var union2023 = Bo2023_f.add(defo2023_f).add(NonBos23_f).add(Bo2023_v2_f)
var union2024 = Bo2024_f.add(defo2024_f).add(NonBos24_f).add(Bo2024_v2_f)
var union2025 = Bo2025_f.add(defo2025_f).add(NonBos25_f).add(Bo2025_v2_f)

// Filtro espacial 
// Primero find pixeles pequeño
var conection2017 =  Bo2017_f.connectedPixelCount(11,false)    //PARA BOSQUE 2017
var conection2018 = union2018.connectedPixelCount(11,false)
var conection2019 = union2019.connectedPixelCount(11,false)
var conection2020 = union2020.connectedPixelCount(11,false)
var conection2021 = union2021.connectedPixelCount(11,false)
var conection2022 = union2022.connectedPixelCount(11,false)
var conection2023 = union2023.connectedPixelCount(11,false)
var conection2024 = union2024.connectedPixelCount(11,false)
var conection2025 = union2025.connectedPixelCount(11,false)
//Funcion de filtro por fin
function applyMajorityFilter(image) {

  var majority = image.focal_mode({
    radius: 1,
    kernelType: 'square',
    units: 'pixels',
    iterations:5
  });
  return majority;
}

//
//Aplicando Kernels
var union2017_k = applyMajorityFilter(Bo2017_f) //SOLO NO ES UNION PORQUE EN ESE ES SOLO BOSQUE
var union2018_k = applyMajorityFilter(union2018)
var union2019_k = applyMajorityFilter(union2019)
var union2020_k = applyMajorityFilter(union2020)
var union2021_k = applyMajorityFilter(union2021)
var union2022_k = applyMajorityFilter(union2022)
var union2023_k = applyMajorityFilter(union2023)
var union2024_k = applyMajorityFilter(union2024)
var union2025_k = applyMajorityFilter(union2025)
// Asignando valor a los pixeles pequeños
var kernes_pixeles2017 =  union2017_k.updateMask(conection2017.neq(11))// SOLO BOSQUE
var kernes_pixeles2018 =  union2018_k.updateMask(conection2018.neq(11))
var kernes_pixeles2019 =  union2019_k.updateMask(conection2019.neq(11))
var kernes_pixeles2020 =  union2020_k.updateMask(conection2020.neq(11))
var kernes_pixeles2021 =  union2021_k.updateMask(conection2021.neq(11))
var kernes_pixeles2022 =  union2022_k.updateMask(conection2022.neq(11))
var kernes_pixeles2023 =  union2023_k.updateMask(conection2023.neq(11))
var kernes_pixeles2024 =  union2024_k.updateMask(conection2024.neq(11))
var kernes_pixeles2025 =  union2025_k.updateMask(conection2025.neq(11))
// mosaiqueando
var final17 = ee.ImageCollection([Bo2017_f, kernes_pixeles2017]).mosaic();
var final18 = ee.ImageCollection([union2018, kernes_pixeles2018]).mosaic();
var final19 = ee.ImageCollection([union2019, kernes_pixeles2019]).mosaic();
var final20 = ee.ImageCollection([union2020, kernes_pixeles2020]).mosaic();
var final21 = ee.ImageCollection([union2021, kernes_pixeles2021]).mosaic();
var final22 = ee.ImageCollection([union2022, kernes_pixeles2022]).mosaic();
var final23 = ee.ImageCollection([union2023, kernes_pixeles2023]).mosaic();
var final24 = ee.ImageCollection([union2024, kernes_pixeles2024]).mosaic();
var final25 = ee.ImageCollection([union2025, kernes_pixeles2025]).mosaic();

//Descarga ASSET
Export.image.toDrive({
  image: final17.byte(),
  description: 'final17_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final18.byte(),
  description: 'final18_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final19.byte(),
  description: 'final19_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final20.byte(),
  description: 'final20_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final21.byte(),
  description: 'final21_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final22.byte(),
  description: 'final22_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final23.byte(),
  description: 'final23_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final24.byte(),
  description: 'final24_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
Export.image.toDrive({
  image: final25.byte(),
  description: 'final25_v1b_',
  scale: 30,
  region: cuadrado,// define una geometría
  maxPixels: 1e9
});
